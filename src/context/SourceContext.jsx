import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SOURCES as INITIAL_SOURCES } from '../data/sources';
import { parseM3U } from '../utils/m3uParser';
import { CHANNELS as LOCAL_CHANNELS } from '../data/channels';
import { SyncManager } from '../services/SyncManager';
import { retryService } from '../services/RetryService';
import { prefetchService } from '../services/PrefetchService';
import { testAllSources, clearHealthCache } from '../services/ServerHealthService';

const SourceContext = createContext();

export const SourceProvider = ({ children }) => {
  const [sources] = useState(INITIAL_SOURCES);
  const [activeSource, setActiveSource] = useState(null);
  const [channels, setChannels] = useState(LOCAL_CHANNELS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [sourceHealth, setSourceHealth] = useState({});

  const abortControllerRef = useRef(null);

  useEffect(() => {
    setFavorites(SyncManager.getFavorites());
    setHistory(SyncManager.getHistory());
    setSourceHealth(SyncManager.getSourceHealth());
  }, []);

  // Health check manual via Settings > Status
  // Desabilitado automático para evitar lentidão na inicialização

  const getList = async (url) => {
    console.log('[SourceContext] getList chamada para:', url);
    const { syncSource } = await import('../services/api');
    const result = await syncSource(url);
    console.log('[SourceContext] getList retornou:', result?.substring(0, 100), '...');
    return result;
  };

  const selectSource = useCallback(async (source) => {
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

    const cacheKey = `nono_v3_${btoa(source.url).slice(0,32)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) setChannels(parsed);
      } catch {
        // Silent fail for cache parse
      }
    }

    try {
      setSyncStatus(`Conectando: ${source.name}...`);
      
      console.log('[SourceContext] Iniciando sync (timeout 45s)...');
      
      const text = await Promise.race([
        retryService.executeWithRetry(
          () => getList(source.url),
          source.id,
          source.name
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_CONEXAO')), 45000))
      ]);
      
      const parsed = parseM3U(text);
      
      if (!parsed || parsed.length === 0) throw new Error('Lista vazia');

      setChannels(parsed);
      
      // Cache inteligente - só salva ID, nome, logo e group (dados leves)
      const lightCache = parsed.slice(0, 300).map(ch => ({
        id: ch.id,
        name: ch.name,
        logo: ch.logo,
        group: ch.group,
        url: ch.url,
        type: ch.type
      }));
      try {
        localStorage.setItem(cacheKey, JSON.stringify(lightCache));
      } catch (e) {
        console.warn('[Source] Cache cheio, tentando novamente...');
        try { localStorage.clear(); } catch {}
      }
      setError(null);
      setSyncStatus('Sincronizado!');
      setTimeout(() => setSyncStatus(null), 2000);
      
      SyncManager.updateSourceHealth(source.id, { 
        lastSuccess: Date.now(), 
        channelCount: parsed.length,
        failures: 0
      });
      SyncManager.unblockSource(source.id);
      setSourceHealth(SyncManager.getSourceHealth());
      
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      const erroReal = err.message || 'Erro Desconhecido';
      console.error('[Source] Falha na Sincronização:', erroReal);
      
      if (erroReal === 'SOURCE_BLOCKED') {
        setError(`Fonte bloqueada devido a muitas falhas contínuas. Aguarde 2 minutos.`);
      } else if (erroReal.includes('TIMEOUT')) {
        setError(`Servidor ${source.name} demorou para responder. Tente novamente.`);
      } else if (erroReal.includes('Failed to fetch') || erroReal.includes('NetworkError')) {
        setError(`Sem conexão com a internet ou servidor offline (Falha de Rede). ${erroReal}`);
      } else {
        setError(`O servidor ${source.name} recusou a conexão: ${erroReal}`);
      }
      
      if (cached) {
         setSyncStatus('Falha - Canais do Cache');
      } else {
         setChannels(LOCAL_CHANNELS);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFavorite = useCallback((channel) => {
    const updated = SyncManager.addFavorite(channel);
    setFavorites(updated);
    return updated;
  }, []);

  const removeFavorite = useCallback((channelId) => {
    const updated = SyncManager.removeFavorite(channelId);
    setFavorites(updated);
    return updated;
  }, []);

  const isFavorite = useCallback((channelId) => {
    return SyncManager.isFavorite(channelId);
  }, []);

  const toggleFavorite = useCallback((channel) => {
    if (isFavorite(channel.id)) {
      return removeFavorite(channel.id);
    } else {
      return addFavorite(channel);
    }
  }, [addFavorite, removeFavorite, isFavorite]);

  const addToHistory = useCallback((channel, watchTime = 0) => {
    const updated = SyncManager.addToHistory(channel, watchTime);
    setHistory(updated);
    return updated;
  }, []);

  const clearHistory = useCallback(() => {
    const updated = SyncManager.clearHistory();
    setHistory(updated);
    return updated;
  }, []);

  const importChannels = useCallback((m3uContent) => {
    const imported = SyncManager.parseM3U(m3uContent);
    if (imported.length > 0) {
      const newSource = {
        id: `custom_${Date.now()}`,
        name: 'Lista Importada',
        url: 'imported',
        category: 'Importado',
        channels: imported
      };
      setChannels(prev => [...imported, ...prev]);
      return { success: true, count: imported.length };
    }
    return { success: false, count: 0 };
  }, []);

  const exportChannels = useCallback(() => {
    return SyncManager.exportToM3U(channels);
  }, [channels]);

  const exportAllData = useCallback(() => {
    return SyncManager.exportData();
  }, []);

  const importAllData = useCallback((data) => {
    SyncManager.importData(data);
    setFavorites(SyncManager.getFavorites());
    setHistory(SyncManager.getHistory());
    return true;
  }, []);

  const prefetchNext = useCallback((currentChannel) => {
    return prefetchService.prefetchNextChannels(currentChannel, channels);
  }, [channels]);

  const getSourceStatus = useCallback((sourceId) => {
    return retryService.getCircuitBreakerStatus(sourceId);
  }, []);

  const resetSourceStatus = useCallback((sourceId) => {
    retryService.resetCircuitBreaker(sourceId);
    setSourceHealth(SyncManager.getSourceHealth());
  }, []);

  const getSettings = useCallback(() => {
    return SyncManager.getSettings();
  }, []);

  const updateSettings = useCallback((newSettings) => {
    return SyncManager.updateSettings(newSettings);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('activeSourceUrl');
    const source = sources.find(s => s.url === saved);
    if (source) {
      selectSource(source);
    } else {
      // Se a fonte salva não existe mais, selecionar a primeira disponível
      localStorage.removeItem('activeSourceUrl');
      if (sources.length > 0) {
        selectSource(sources[0]);
      }
    }
  }, [sources, selectSource]);

  return (
    <SourceContext.Provider value={{
      sources,
      activeSource,
      channels,
      isLoading,
      error,
      syncStatus,
      selectSource,
      favorites,
      history,
      sourceHealth,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
      addToHistory,
      clearHistory,
      importChannels,
      exportChannels,
      exportAllData,
      importAllData,
      prefetchNext,
      getSourceStatus,
      resetSourceStatus,
      getSettings,
      updateSettings
    }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSources = () => useContext(SourceContext);
