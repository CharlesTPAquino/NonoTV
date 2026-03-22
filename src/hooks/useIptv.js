import { useState, useCallback, useMemo } from 'react';
import { syncSource } from '../services/api';
import { saveToCache, loadFromCache } from '../services/cache';
import { parseM3U } from '../utils/m3uParser';
import { CHANNELS as INITIAL_CHANNELS, GROUPS as INITIAL_GROUPS } from '../data/channels';

/**
 * Custom Hook: Lógica de Sincronização Inteligente
 * Centraliza o estado dos canais e a orquestração de rede/cache.
 */
export function useIptv() {
  const [channels,    setChannels]    = useState(() => INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' })));
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState(null);
  const [syncStatus,  setSyncStatus]  = useState(null);

  const resetChannels = useCallback(() => {
    setChannels(INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' })));
    setError(null);
    setSyncStatus(null);
  }, []);

  const loadSource = useCallback(async (source) => {
    if (!source || !source.url) {
      resetChannels(); return;
    }

    setError(null);
    setIsLoading(true);
    setSyncStatus(`Sincronizando ${source.name}...`);

    // Tenta carregar do cache para resposta instantânea (UX)
    const cached = loadFromCache(source.url);
    if (cached) { setChannels(cached); }

    try {
      // Sincronia de rede universal (Capacitor nativo ou Proxy no PC)
      const content = await syncSource(source.url);
      const parsed  = parseM3U(content);

      if (!parsed || parsed.length === 0) throw new Error('Canais não encontrados.');

      setChannels(parsed);
      saveToCache(source.url, parsed);
      setSyncStatus('Sincronia OK!');
      setTimeout(() => setSyncStatus(null), 3000);

    } catch (err) {
      console.error('[Worker Sync]', err.message);
      if (!cached) {
        setError(`Erro: ${err.message || 'Falha de Conexão'}`);
        resetChannels();
      } else {
        setSyncStatus(null); // Mantém o cache se o sinal cair
      }
    } finally {
      setIsLoading(false);
    }
  }, [resetChannels]);

  return { channels, isLoading, error, syncStatus, loadSource, resetChannels };
}
