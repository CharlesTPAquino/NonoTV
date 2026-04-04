import { useState, useEffect, useMemo } from 'react';

/**
 * NonoTV — Device Performance Profiler
 * 
 * Detecta capacidade do hardware e ajusta a experiência automaticamente.
 * Dispositivos potentes recebem experiência completa, dispositivos fracos
 * recebem versão otimizada sem perder funcionalidade.
 */

const TIERS = {
  ELITE: {
    name: 'Elite',
    label: 'Dispositivo Premium',
    carousels: 12,
    carouselItems: 20,
    gridLimit: 120,
    staggeredAnimation: true,
    parallax: true,
    heroAutoRotate: true,
    heroInterval: 8000,
    blurEffects: true,
    shadows: true,
    videoPreview: true,
    preloadImages: true,
    bufferSize: 80 * 1000 * 1000,
    maxBufferLength: 30,
  },
  STANDARD: {
    name: 'Standard',
    label: 'Dispositivo Padrão',
    carousels: 8,
    carouselItems: 15,
    gridLimit: 90,
    staggeredAnimation: false,
    parallax: false,
    heroAutoRotate: true,
    heroInterval: 12000,
    blurEffects: true,
    shadows: false,
    videoPreview: false,
    preloadImages: false,
    bufferSize: 60 * 1000 * 1000,
    maxBufferLength: 20,
  },
  LITE: {
    name: 'Lite',
    label: 'Dispositivo Básico',
    carousels: 5,
    carouselItems: 10,
    gridLimit: 60,
    staggeredAnimation: false,
    parallax: false,
    heroAutoRotate: false,
    heroInterval: 0,
    blurEffects: false,
    shadows: false,
    videoPreview: false,
    preloadImages: false,
    bufferSize: 30 * 1000 * 1000,
    maxBufferLength: 10,
  },
};

function detectTier() {
  // 1. Verificar se é Mi Stick / Fire TV (notório por ser fraco)
  const ua = navigator.userAgent;
  const isMiStick = /MiBox|MIBOX|MiStick|AFTT|AFTN|AFTB/i.test(ua);
  const isFireTV = /AFT/i.test(ua);
  const isAndroidTV = /Android.*TV|SmartTV/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const isMobile = /Mobi|Android/i.test(ua);

  // 2. Hardware info
  const cores = navigator.hardwareConcurrency || 1;
  const memory = navigator.deviceMemory || 1;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = conn?.effectiveType || '4g';
  const downlink = conn?.downlink || 10;

  // 3. Screen
  const screenArea = window.screen.width * window.screen.height;

  // 4. Scoring
  let score = 0;
  
  // CPU
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else if (cores >= 2) score += 1;

  // RAM
  if (memory >= 6) score += 3;
  else if (memory >= 4) score += 2;
  else if (memory >= 2) score += 1;

  // Network
  if (effectiveType === '4g' && downlink >= 5) score += 2;
  else if (effectiveType === '3g' || downlink >= 2) score += 1;

  // Screen
  if (screenArea >= 2000000) score += 2; // 4K
  else if (screenArea >= 1000000) score += 1; // 1080p

  // Device penalties
  if (isMiStick || isFireTV) score -= 3; // Mi Stick tem 1-1.5GB RAM
  if (isAndroidTV && !isTablet) score -= 1; // Android TV genérico

  // 5. Classify
  if (score >= 7) return TIERS.ELITE;
  if (score >= 4) return TIERS.STANDARD;
  return TIERS.LITE;
}

export default function useDeviceProfile() {
  const [tier, setTier] = useState(() => detectTier());

  useEffect(() => {
    const profile = detectTier();
    setTier(profile);
    console.log(`[DeviceProfile] ${profile.name} — ${profile.label}`);
    console.log(`[DeviceProfile] CPU: ${navigator.hardwareConcurrency || '?'} cores, RAM: ${navigator.deviceMemory || '?'}GB`);
    const conn = navigator.connection;
    if (conn) console.log(`[DeviceProfile] Rede: ${conn.effectiveType} (${conn.downlink}Mbps)`);
  }, []);

  return useMemo(() => ({
    tier: tier.name,
    label: tier.label,
    isElite: tier.name === 'ELITE',
    isStandard: tier.name === 'STANDARD',
    isLite: tier.name === 'LITE',
    ...tier,
  }), [tier]);
}

export { TIERS, detectTier };
