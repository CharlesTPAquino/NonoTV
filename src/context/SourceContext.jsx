import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SOURCES as INITIAL_SOURCES } from '../data/sources';
import { parseM3U } from '../utils/m3uParser';
import { CHANNELS as LOCAL_CHANNELS } from '../data/channels';

const SourceContext = createContext();

/**
 * REFAZENDO CONTEXTO (NONO 3.1)
 * Foco: Resiliência absoluta e Fallback garantido.
 */
export const SourceProvider = ({ children }) => {
  const [sources] = useState(INITIAL_SOURCES);
  const [activeSource, setActiveSource] = useState(null);
  const [channels, setChannels] = useState(LOCAL_CHANNELS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  const abortControllerRef = useRef(null);

  // Função interna de Fetch simplificada
  const getList = async (url) => {
    // Detecção direta de Proxy/Native
    const isNative = !!(window.Capacitor);
    let target = url;
    
    if (!isNative && import.meta.env.DEV) {
      target = `http://${window.location.hostname || 'localhost'}:3131/?url=${encodeURIComponent(url)}`;
    }

    const r = await fetch(target, { signal: abortControllerRef.current?.signal });
    if (!r.ok) throw new Error(`Status ${r.status}`);
    return await r.text();
  };

  const selectSource = useCallback(async (source) => {
    // Aborta anterior
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    if (!source) {
      setActiveSource(null);
      setChannels(LOCAL_CHANNELS);
      localStorage.removeItem('activeSourceUrl');
      setError(null);
      return;
    }

    setIsLoading(true);
    setActiveSource(source);
    localStorage.setItem('activeSourceUrl', source.url);

    // 1. Tenta carregar Cache
    const cacheKey = `nono_v3_${btoa(source.url).slice(0,32)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) setChannels(parsed);
      } catch {}
    }

    // 2. Busca Online
    try {
      setSyncStatus(`Conectando: ${source.name}...`);
      const text = await getList(source.url);
      const parsed = parseM3U(text);
      
      if (!parsed || parsed.length === 0) throw new Error('Lista vazia');

      setChannels(parsed);
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
      setError(null);
      setSyncStatus('Sincronizado!');
      setTimeout(() => setSyncStatus(null), 2000);
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.error('[Source] Falha:', err.message);
      if (!cached) {
        setError(`Não foi possível conectar ao servidor ${source.name}. Verifique sua internet.`);
        setChannels(LOCAL_CHANNELS);
      } else {
        setSyncStatus('Modo Offline (Cache)');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-boot
  useEffect(() => {
    const saved = localStorage.getItem('activeSourceUrl');
    const source = sources.find(s => s.url === saved);
    if (source) selectSource(source);
  }, [sources, selectSource]);

  return (
    <SourceContext.Provider value={{
      sources, activeSource, channels, isLoading, error, syncStatus, selectSource
    }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSources = () => useContext(SourceContext);
