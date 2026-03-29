import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchSource } from '../services/SyncService';
import { SOURCES as INITIAL_SOURCES } from '../data/sources';
import { parseM3U } from '../utils/m3uParser';
import { CHANNELS as LOCAL_CHANNELS } from '../data/channels';

const SOURCE_KEY = 'nono_last_source';

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
      localStorage.setItem(SOURCE_KEY, JSON.stringify(source));
      
      const text = await fetchSource(source.url);
      const parsed = parseM3U(text);
      
      if (!parsed || parsed.length === 0) {
        setChannels(LOCAL_CHANNELS);
        return;
      }

      setChannels(parsed);
    } catch (err) {
      setChannels(LOCAL_CHANNELS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(SOURCE_KEY);
    if (saved) {
      try {
        const lastSource = JSON.parse(saved);
        const found = sources.find(s => s.id === lastSource.id);
        if (found) {
          selectSource(found);
        }
      } catch (e) {
        selectSource(sources[0]);
      }
    } else if (sources.length > 0) {
      selectSource(sources[0]);
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