import React, { createContext, useContext, useState } from 'react';

/**
 * CONTEXTO DE PODCASTS
 * Gerencia o estado global de podcasts (atual, lista)
 */

const PodcastContext = createContext();

export function usePodcasts() {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcasts must be used within PodcastProvider');
  }
  return context;
}

export function PodcastProvider({ children }) {
  const [activePodcast, setActivePodcast] = useState(null);
  const [podcasts, setPodcasts] = useState([]);

  const value = {
    activePodcast,
    setActivePodcast,
    podcasts,
    setPodcasts
  };

  return (
    <PodcastContext.Provider value={value}>
      {children}
    </PodcastContext.Provider>
  );
}