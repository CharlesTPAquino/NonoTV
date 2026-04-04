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
  const [watchTime, setWatchTime] = useState(0);
  const watchTimeRef = useRef(null);
  
  const { activeSource, addToHistory, prefetchNext, channels } = useSources();

  const loadEPG = useCallback(async (sourceUrl) => {
    if (!sourceUrl) return;
    const data = await fetchEPG(sourceUrl);
    setEpgData(data);
  }, []);

  useEffect(() => {
    if (activeSource?.url) {
      loadEPG(activeSource.url);
    }
  }, [activeSource?.url, loadEPG]);

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

  useEffect(() => {
    if (showPlayer && activeChannel) {
      watchTimeRef.current = setInterval(() => {
        setWatchTime(t => t + 1);
      }, 1000);
    } else {
      if (watchTimeRef.current) {
        clearInterval(watchTimeRef.current);
      }
    }
    return () => {
      if (watchTimeRef.current) {
        clearInterval(watchTimeRef.current);
      }
    };
  }, [showPlayer, activeChannel]);

  const playChannel = useCallback((channel) => {
    if (activeChannel && watchTime > 10) {
      addToHistory(activeChannel, watchTime);
    }
    
    setActiveChannel(channel);
    setShowPlayer(true);
    setWatchTime(0);
    
    if (channels && channels.length > 0) {
      prefetchService.prefetchNextChannels(channel, channels, 2);
    }
  }, [activeChannel, watchTime, addToHistory, channels]);

  const closePlayer = useCallback(() => {
    if (activeChannel && watchTime > 10) {
      addToHistory(activeChannel, watchTime);
    }
    
    setShowPlayer(false);
    setActiveChannel(null);
    setWatchTime(0);
  }, [activeChannel, watchTime, addToHistory]);

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
      watchTime,
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
