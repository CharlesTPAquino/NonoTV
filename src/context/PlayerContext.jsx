import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { fetchEPG, getCurrentProgram, getNextProgram } from '../services/EPGService';
import { useSources } from './SourceContext';
import { prefetchService } from '../services/PrefetchService';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [epgData, setEpgData] = useState(null);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [nextProgram, setNextProgram] = useState(null);
  
  // CORREÇÃO: usa Date.now() em vez de setInterval
  const watchStartRef = useRef(null);
  const epgLoadedRef = useRef(false);
  
  const { activeSource, addToHistory, prefetchNext, channels } = useSources();

  const getWatchTime = () => {
    if (!watchStartRef.current) return 0;
    return Math.floor((Date.now() - watchStartRef.current) / 1000);
  };

  const loadEPG = useCallback(async (sourceUrl) => {
    if (!sourceUrl) return;
    const data = await fetchEPG(sourceUrl);
    setEpgData(data);
  }, []);

  // CORREÇÃO: EPG só carrega quando o player abre pela primeira vez
  // Removido o useEffect automático que carregava EPG ao iniciar

  useEffect(() => {
    if (!epgData || !activeChannel) {
      setCurrentProgram(null);
      setNextProgram(null);
      return;
    }

    const cleanName = activeChannel.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let channelId = Object.keys(epgData.channelMap || {}).find(
      id => id.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanName) ||
            cleanName.includes(id.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    if (!channelId && epgData.channelPrograms) {
      channelId = Object.keys(epgData.channelPrograms)[0];
    }

    if (channelId) {
      setCurrentProgram(getCurrentProgram(epgData, channelId));
      setNextProgram(getNextProgram(epgData, channelId));
    }
  }, [epgData, activeChannel]);

  const playChannel = useCallback((channel) => {
    const elapsed = getWatchTime();
    if (activeChannel && elapsed > 10) {
      addToHistory(activeChannel, elapsed);
    }
    
    setActiveChannel(channel);
    setShowPlayer(true);
    watchStartRef.current = Date.now();

    // CORREÇÃO: EPG só carrega na primeira vez que o player abre
    if (!epgLoadedRef.current && activeSource?.url) {
      epgLoadedRef.current = true;
      loadEPG(activeSource.url);
    }

    if (channels && channels.length > 0) {
      prefetchService.prefetchNextChannels(channel, channels, 2);
    }
  }, [activeChannel, addToHistory, channels, activeSource, loadEPG]);

  const closePlayer = useCallback(() => {
    const elapsed = getWatchTime();
    if (activeChannel && elapsed > 10) {
      addToHistory(activeChannel, elapsed);
    }
    
    setShowPlayer(false);
    setActiveChannel(null);
    watchStartRef.current = null;
  }, [activeChannel, addToHistory]);

  return (
    <PlayerContext.Provider value={{ 
      activeChannel, 
      showPlayer, 
      playChannel, 
      closePlayer, 
      setActiveChannel,
      epgData,
      currentProgram,
      nextProgram,
      watchTime: getWatchTime(),
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer deve ser usado dentro de um PlayerProvider');
  return context;
};