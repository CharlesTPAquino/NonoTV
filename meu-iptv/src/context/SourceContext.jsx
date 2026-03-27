import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchSource } from '../services/SyncService';
import { SOURCES as INITIAL_SOURCES } from '../data/sources';
import { parseM3U } from '../utils/m3uParser';
import { CHANNELS as LOCAL_CHANNELS } from '../data/channels';

const SourceContext = createContext();

export const SourceProvider = ({ children }) => {
  const [sources] = useState(INITIAL_SOURCES);
  const [activeSource, setActiveSource] = useState(null);
  const [channels, setChannels] = useState(LOCAL_CHANNELS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  const selectSource = useCallback(async (source) => {
    if (!source) {
      setActiveSource(null);
      setChannels(LOCAL_CHANNELS);
      setError(null);
      return;
    }

    setIsLoading(true);
    setActiveSource(source);
    setError(null);

    try {
      setSyncStatus(`Conectando: ${source.name}...`);
      const text = await fetchSource(source.url);
      const parsed = parseM3U(text);
      
      if (!parsed || parsed.length === 0) {
        setChannels(LOCAL_CHANNELS);
        setSyncStatus(null);
        return;
      }

      setChannels(parsed);
      setSyncStatus(`✓ ${source.name} - ${parsed.length} canais`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error('[Source] Falha:', err.message);
      setChannels(LOCAL_CHANNELS);
      setSyncStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SourceContext.Provider value={{
      sources, activeSource, channels, isLoading, error, syncStatus, selectSource
    }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSources = () => useContext(SourceContext);