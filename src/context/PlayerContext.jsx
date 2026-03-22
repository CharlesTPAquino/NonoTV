import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const playChannel = useCallback((channel) => {
    setActiveChannel(channel);
    setShowPlayer(true);
  }, []);

  const closePlayer = useCallback(() => {
    setShowPlayer(false);
    setActiveChannel(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ activeChannel, showPlayer, playChannel, closePlayer, setActiveChannel }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer deve ser usado dentro de um PlayerProvider');
  return context;
};
