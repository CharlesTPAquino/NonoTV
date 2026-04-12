import { createContext, useContext, useState, useEffect } from 'react';

// User agents conhecidos de Smart TVs e Firestick
const TV_UA_PATTERNS = [
  'AFTT', 'AFTM', 'AFTS', 'AFTB', 'FireTV', 'Fire TV',
  'Tizen', 'WebOS', 'SmartTV', 'SMART-TV',
  'HbbTV', 'BRAVIA', 'PHILIPS', 'Netcast',
  'CrKey',  // Chromecast
];

export function detectDevice() {
  const ua = navigator.userAgent || '';
  const isTV = TV_UA_PATTERNS.some(p => ua.includes(p))
    || (window.innerWidth >= 1280 && !('ontouchstart' in window) && !ua.includes('Macintosh') && !ua.includes('Windows'));
  const isMobile = 'ontouchstart' in window && window.innerWidth < 768;
  const isTablet = 'ontouchstart' in window && window.innerWidth >= 768;
  return { isTV, isMobile, isTablet, isDesktop: !isTV && !isMobile && !isTablet };
}

export function useDevice() {
  const [device, setDevice] = useState(detectDevice);

  useEffect(() => {
    const onResize = () => setDevice(detectDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return device;
}