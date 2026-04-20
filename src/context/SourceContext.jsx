import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SOURCES as INITIAL_SOURCES } from '../data/sources';
import { parseM3U } from '../utils/m3uParser';
import { CHANNELS as LOCAL_CHANNELS } from '../data/channels';
import { SyncManager } from '../services/SyncManager';
import { retryService } from '../services/RetryService';
import { prefetchService } from '../services/PrefetchService';
import { testSourcesParallel, sortSourcesByPerformance, getSourceStatus, testSourceSmart, getMetrics, resetMetrics } from '../services/SmartServerOrchestrator';
import { detectServerTech, profileServer, getServerProfile } from '../services/ServerTechProfiler';
import ChannelCacheDB from '../services/ChannelCacheDB';
import { SmartCache } from '../services/SmartCache';
import SmartPrefetchService from '../services/SmartPrefetchService';
import SourcePrefetchService from '../services/SourcePrefetchService';

const SourceContext = createContext();

export const SourceProvider = ({ children }) => {
  const [sources] = useState(INITIAL_SOURCES);
  
  const getInitialSource = () => {
    console.log('[SourceContext] Determinando fonte inicial...');
    const saved = localStorage.getItem('activeSourceUrl');
    if (saved) {
      console.log('[SourceContext] Fonte salva encontrada:', saved.substring(0, 50));
      const found = INITIAL_SOURCES.find(s => s.url === saved);
      if (found) {
        console.log('[SourceContext] Usando fonte salva:', found.name);
        return found;
      }
    }
    const defaultSource = INITIAL_SOURCES.find(s => s.priority === 'high');
    console.log('[SourceContext] Usando fonte padrão:', defaultSource?.name);
    return defaultSource || INITIAL_SOURCES[0];
  };
  
  const [activeSource, setActiveSource] = useState(getInitialSource);
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

  const [serverStatuses, setServerStatuses] = useState({});
  const [serverProfiles, setServerProfiles] = useState({});
  const [fallbackQueue, setFallbackQueue] = useState([]);

  const runHealthCheck = useCallback(async () => {
    setSyncStatus('Verificando servidores...');
    const statuses = await testSourcesParallel(sources, (current, total, name) => {
      setSyncStatus(`Verificando ${current}/${total}: ${name}`);
    });
    setServerStatuses(statuses);
    setSyncStatus(null);
    return statuses;
  }, [sources]);

  const checkSourceHealth = useCallback(async (source) => {
    return await testSourceSmart(source);
  }, []);

  const selectSourceWithFallback = useCallback(async (source) => {
    if (!source) {
      setActiveSource(null);
      setChannels(LOCAL_CHANNELS);
      localStorage.removeItem('activeSourceUrl');
      setError(null);
      return;
    }

    const sorted = sortSourcesByPerformance(sources);
    const currentIndex = sorted.findIndex(s => s.id === source.id);
    const sourcesToTry = sorted.slice(currentIndex);

    let lastError = null;
    
    for (const trySource of sourcesToTry) {
      try {
        setSyncStatus(`Tentando: ${trySource.name}...`);
        console.log('[SourceContext] Tentando fonte com fallback:', trySource.name);
        
        await selectSource(trySource);
        return;
      } catch (err) {
        lastError = err;
        console.log('[SourceContext] Fonte falhou, tentando próxima:', trySource.name, err.message);
        setSyncStatus(`Falhou, tentando próximo...`);
      }
    }

    setError(`Nenhum servidor funcionou. Último erro: ${lastError?.message}`);
    setChannels(LOCAL_CHANNELS);
  }, [sources]);

  const autoSelectBestSource = useCallback(async () => {
    setSyncStatus('Selecionando melhor servidor...');
    
    const sorted = sortSourcesByPerformance(sources);
    const healthStatuses = await testSourcesParallel(sorted.slice(0, 10), (current, total) => {
      setSyncStatus(`Testando ${current}/${total}...`);
    });
    
    const workingSource = sorted.find(s => healthStatuses[s.id]?.online);
    
    if (workingSource) {
      setSyncStatus(`Melhor servidor: ${workingSource.name}`);
      setTimeout(() => setSyncStatus(null), 1500);
      await selectSource(workingSource);
    } else {
      setSyncStatus('Nenhum servidor online, usando primeiro da lista');
      setTimeout(() => setSyncStatus(null), 2000);
      await selectSource(sorted[0]);
    }
  }, [sources]);

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

    // Detectar tecnologia do servidor
    const profile = getServerProfile(source.id);
    if (profile) {
      console.log(`[SourceContext] Perfil do servidor: ${profile.techName} (${profile.status})`);
      setServerProfiles(prev => ({ ...prev, [source.id]: profile }));
    } else {
      const tech = detectServerTech(source.url);
      console.log(`[SourceContext] Tecnologia detectada: ${tech.name}`);
      setServerProfiles(prev => ({ ...prev, [source.id]: { tech: tech.key, techName: tech.name } }));
    }

    const cacheKey = `nono_v3_${btoa(source.url).slice(0,32)}`;

    const cachedDB = await ChannelCacheDB.get(source.id);
    if (cachedDB && cachedDB.channels && cachedDB.channels.length > 0) {
      console.log('[SourceContext] Cache IndexedDB encontrado:', cachedDB.channelCount, 'canais');
      setChannels(cachedDB.channels);
      setSyncStatus(`Carregado do cache: ${cachedDB.channelCount} canais`);
      setTimeout(() => setSyncStatus(null), 1500);

      SourcePrefetchService.prefetchSource(source).catch(() => {});
    }

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0 && channels.length === 0) setChannels(parsed);
      } catch {
        // Silent fail for cache parse
      }
    }

    try {
      setSyncStatus(`Conectando: ${source.name}...`);

      console.log('[SourceContext] Iniciando sync (timeout 30s)...');

      const text = await Promise.race([
        retryService.executeWithRetry(
          () => getList(source.url),
          source.id,
          source.name
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_CONEXAO')), 30000))
      ]);

      if (!text) throw new Error('Resposta do servidor vazia');

      const parsed = parseM3U(text);

      if (!parsed || parsed.length === 0) throw new Error('Lista parseada está vazia');

      // Auditoria: Garantir que apenas canais válidos entrem no state
      const validChannels = parsed.filter(ch => ch && ch.name && ch.name.trim());
      console.log(`[SourceContext] ${validChannels.length} canais válidos carregados.`);
      
      if (validChannels.length === 0) throw new Error('Nenhum canal válido encontrado');

      // CARREGAMENTO PROGRESSIVO: 
      // Se a lista for muito grande (> 2000), carregamos os primeiros 1000 (Live) 
      // e depois o resto para não travar a UI
      if (validChannels.length > 2000) {
        setChannels(validChannels.slice(0, 1000));
        // CORREÇÃO: requestIdleCallback carrega o resto quando o browser estiver ocioso
        // Fallback para setTimeout em browsers que não suportam (ex: Firestick antigo)
        const scheduleRest = window.requestIdleCallback
          ? (cb) => window.requestIdleCallback(cb, { timeout: 3000 })
          : (cb) => setTimeout(cb, 200);

        scheduleRest(() => {
          setChannels(validChannels);
        });
      } else {
        setChannels(validChannels);
      }

      await SmartCache.set(source.id, null, validChannels, source.url, source.name);

      const lightCache = validChannels.slice(0, 300).map(ch => ({
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
        setError(`Servidor ${source.name} está demorando muito para responder. Tente outro servidor nas Configurações.`);
      } else if (erroReal.includes('Failed to fetch') || erroReal.includes('NetworkError')) {
        setError(`Sem conexão com a internet ou servidor offline (Falha de Rede). ${erroReal}`);
      } else {
        setError(`O servidor ${source.name} recusou a conexão: ${erroReal}`);
      }

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setSyncStatus('Falha - Canais do Cache');
          } else {
            setChannels(LOCAL_CHANNELS);
            setSyncStatus('Falha - Usando Canais Locais');
          }
        } catch {
          setChannels(LOCAL_CHANNELS);
          setSyncStatus('Falha - Usando Canais Locais');
        }
      } else {
         setChannels(LOCAL_CHANNELS);
         setSyncStatus('Falha - Usando Canais Locais');
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
    if (sources.length > 0 && activeSource) {
      const saved = localStorage.getItem('activeSourceUrl');
      const source = sources.find(s => s.url === saved);
      
      if (source && source.id !== activeSource.id) {
        selectSource(source);
      } else if (!saved && activeSource.priority !== 'high') {
        const prioritySource = sources.find(s => s.priority === 'high');
        if (prioritySource) selectSource(prioritySource);
      }
    }
  }, [sources]);

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
      updateSettings,
      smartPrefetch: SmartPrefetchService,
      serverStatuses,
      serverProfiles,
      runHealthCheck,
      checkSourceHealth,
      sortedSources: () => sortSourcesByPerformance(sources),
      getServerStatus: (id) => getSourceStatus(id),
      selectSourceWithFallback,
      autoSelectBestSource,
      getConnectionMetrics: () => getMetrics(),
      resetConnectionMetrics: () => resetMetrics()
    }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSources = () => useContext(SourceContext);
