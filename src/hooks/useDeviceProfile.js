import { useState, useEffect } from 'react';

export const TIERS = {
  LITE: 'LITE',
  STANDARD: 'STANDARD',
  ULTRA: 'ULTRA'
};

/**
 * useDeviceProfile Hook
 * 
 * Avalia o hardware atual usando heurísticas nativas do WebKit/Chromium 
 * e define ativamente qual experiência o app deve entregar.
 * Graceful Degradation: TVs fracas não recebem background-blur nem animações complexas.
 */
export default function useDeviceProfile() {
  const [profile, setProfile] = useState(() => {
    // Lê a preferência manual do usuário, ou AUTO para detecção
    return localStorage.getItem('nonotv_performance_tier') || 'AUTO';
  });

  const [hardwareTier, setHardwareTier] = useState(TIERS.STANDARD);

  useEffect(() => {
    // Heurística de Hardware
    let score = 0;
    
    // RAM Detection (Chrome/Android WebView)
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory <= 1) score -= 2;
      else if (navigator.deviceMemory >= 4) score += 2;
    }

    // CPU Cores Detection
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency <= 2) score -= 2;
      else if (navigator.hardwareConcurrency >= 6) score += 2;
    }

    // Network Constraints Detection
    if (navigator.connection) {
      if (['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType)) {
        score -= 2; // Força modos mais fracos para não engasgar stream/imagens
      }
    }
    
    // Android TV fallback heurístico 
    if (navigator.userAgent.toLowerCase().includes('tv') && (!navigator.deviceMemory || navigator.deviceMemory <= 2)) {
      score -= 1;  // TVs costumam ter processadores fracos por padrão
    }

    let detectedTier = TIERS.STANDARD;
    if (score <= -2) detectedTier = TIERS.LITE;
    if (score >= 3) detectedTier = TIERS.ULTRA;

    setHardwareTier(detectedTier);
  }, []);

  // O Tier final que o React deve reagir
  const activeTier = profile === 'AUTO' ? hardwareTier : profile;

  // Função para a tela de configurações manual
  const setManualProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('nonotv_performance_tier', newProfile);
  };

  return {
    activeTier,
    hardwareTier,
    profile,
    setManualProfile,
    isLite: activeTier === TIERS.LITE,
    isUltra: activeTier === TIERS.ULTRA,
    isStandard: activeTier === TIERS.STANDARD
  };
}
