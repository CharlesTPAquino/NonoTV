import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = {
  DEFAULT: 'default',
  DARK: 'dark',
  CINEMA: 'cinema',
  KIDS: 'kids'
};

const THEME_CONFIG = {
  [THEMES.DEFAULT]: {
    name: 'Padrão',
    primary: '#F7941D',
    background: '#0a0a0f',
    surface: '#14141a',
    text: '#ffffff',
    textMuted: '#a0a0b0'
  },
  [THEMES.DARK]: {
    name: 'Escuro',
    primary: '#F7941D',
    background: '#000000',
    surface: '#0d0d0d',
    text: '#e0e0e0',
    textMuted: '#707070'
  },
  [THEMES.CINEMA]: {
    name: 'Cinema',
    primary: '#8B0000',
    background: '#000000',
    surface: '#0a0000',
    text: '#ff4444',
    textMuted: '#663333'
  },
  [THEMES.KIDS]: {
    name: 'Infantil',
    primary: '#4ADE80',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#ffffff',
    textMuted: '#a0a0c0'
  }
};

const KIDS_CHANNELS = [
  'cartoon', 'nickelodeon', 'disney', 'playhouse', 'baby', 'kids',
  'discovery kids', 'cartoon network', 'boomerang', 'animed',
  'pipoca', 'gloob', 'tv cultura', 'sesc', 'raticoo', 'cecconello'
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('nonotv_theme');
    return saved || THEMES.DEFAULT;
  });
  
  const [kidsModeActive, setKidsModeActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('nonotv_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === THEMES.KIDS) {
      setKidsModeActive(true);
    }
  }, [theme]);

  useEffect(() => {
    const hour = new Date().getHours();
    const autoKids = localStorage.getItem('nonotv_auto_kids') === 'true';
    
    if (autoKids && hour >= 7 && hour <= 19 && theme !== THEMES.KIDS) {
      setTheme(THEMES.KIDS);
    }
  }, []);

  const changeTheme = useCallback((newTheme) => {
    if (THEME_CONFIG[newTheme]) {
      setTheme(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const themes = Object.keys(THEMES);
    const currentIdx = themes.indexOf(theme);
    const nextIdx = (currentIdx + 1) % themes.length;
    setTheme(themes[nextIdx]);
  }, [theme]);

  const enableKidsMode = useCallback(() => {
    setTheme(THEMES.KIDS);
  }, []);

  const disableKidsMode = useCallback(() => {
    setTheme(THEMES.DEFAULT);
  }, []);

  const isKidsMode = theme === THEMES.KIDS;

  return (
    <ThemeContext.Provider value={{
      theme,
      changeTheme,
      toggleTheme,
      enableKidsMode,
      disableKidsMode,
      isKidsMode,
      kidsModeActive,
      config: THEME_CONFIG[theme],
      availableThemes: THEMES,
      themeConfig: THEME_CONFIG
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function getKidsChannels(channels) {
  if (!channels) return [];
  
  const kidsLower = KIDS_CHANNELS.map(k => k.toLowerCase());
  
  return channels.filter(channel => {
    const nameLower = (channel.name || '').toLowerCase();
    const groupLower = (channel.group || '').toLowerCase();
    
    return kidsLower.some(k => 
      nameLower.includes(k) || groupLower.includes(k)
    );
  });
}

export { THEMES, THEME_CONFIG, KIDS_CHANNELS };
export default ThemeContext;
