/**
 * NonoTV AI Service
 * Sistema inteligente de recomendação e otimização de streaming
 */

import { SyncManager } from './SyncManager';

const RECOMMENDATION_KEY = 'nono_ai_recommendations';
const NETWORK_PROFILE_KEY = 'nono_network_profile';

class AIService {
  constructor() {
    this.networkProfile = this.loadNetworkProfile();
    this.bufferHistory = [];
    this.qualityHistory = [];
  }

  loadNetworkProfile() {
    try {
      const cached = localStorage.getItem(NETWORK_PROFILE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      avgSpeed: 5000000,
      stability: 0.9,
      lastUpdated: Date.now(),
      samples: []
    };
  }

  saveNetworkProfile(profile) {
    this.networkProfile = { ...this.networkProfile, ...profile, lastUpdated: Date.now() };
    try {
      localStorage.setItem(NETWORK_PROFILE_KEY, JSON.stringify(this.networkProfile));
    } catch {}
  }

  // ===== 1. RECOMENDAÇÃO DE CANAIS =====
  getRecommendations(channels, limit = 10) {
    const history = SyncManager.getHistory();
    const favorites = SyncManager.getFavorites();
    
    if (history.length === 0 && favorites.length === 0) {
      return this.getPopularChannels(channels, limit);
    }

    const watchedGroups = {};
    const watchedNames = {};
    
    history.forEach(h => {
      watchedGroups[h.group] = (watchedGroups[h.group] || 0) + (h.playCount || 1);
      watchedNames[h.name.toLowerCase()] = (watchedNames[h.name.toLowerCase()] || 0) + 1;
    });

    favorites.forEach(f => {
      watchedGroups[f.group] = (watchedGroups[f.group] || 0) + 3;
    });

    const scored = channels.map(ch => {
      let score = 0;
      
      const groupWeight = watchedGroups[ch.group] || 0;
      score += groupWeight * 2;
      
      const nameWords = ch.name.toLowerCase().split(' ');
      nameWords.forEach(word => {
        if (watchedNames[word]) score += watchedNames[word] * 0.5;
      });

      if (ch.logo) score += 0.5;
      if (ch.type === 'live') score += 1;

      return { ...ch, aiScore: score };
    });

    return scored
      .filter(ch => !/adulto|sexo|hot|xxx|18\+|porno/i.test(ch.group || ''))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, limit);
  }

  getPopularChannels(channels, limit = 10) {
    const premiumKeywords = ['globo', 'record', 'sbt', 'band', 'cnn', 'espn', 'premiere', 'hbo', 'megapix', 'telecine', 'paramount', 'universal', 'warner', 'disney'];
    
    return channels
      .filter(ch => {
        const name = ch.name.toLowerCase();
        return premiumKeywords.some(kw => name.includes(kw));
      })
      .slice(0, limit);
  }

  // ===== 2. SELEÇÃO INTELIGENTE DE QUALIDADE =====
  analyzeNetworkConditions(speed, stability) {
    const profile = this.networkProfile;
    
    profile.samples.push({ speed, stability, timestamp: Date.now() });
    if (profile.samples.length > 20) profile.samples.shift();
    
    if (profile.samples.length >= 5) {
      const avgSpeed = profile.samples.reduce((a, b) => a + b.speed, 0) / profile.samples.length;
      const avgStability = profile.samples.reduce((a, b) => a + b.stability, 0) / profile.samples.length;
      
      this.saveNetworkProfile({ avgSpeed, stability: avgStability });
    }

    return profile;
  }

  getOptimalQuality(levels, currentBuffer, networkSpeed) {
    if (!levels || levels.length === 0) return -1;

    const profile = this.networkProfile;
    const effectiveSpeed = Math.min(networkSpeed || profile.avgSpeed, 20000000);
    
    let targetBitrate = effectiveSpeed * 0.7;
    
    if (currentBuffer < 10) {
      targetBitrate = effectiveSpeed * 0.3;
    } else if (currentBuffer > 30) {
      targetBitrate = effectiveSpeed * 0.85;
    }

    let bestLevel = -1;
    let bestDiff = Infinity;

    levels.forEach((level, index) => {
      const levelBitrate = level.bitrate || 0;
      const diff = Math.abs(levelBitrate - targetBitrate);
      
      if (diff < bestDiff) {
        bestDiff = diff;
        bestLevel = index;
      }
    });

    return bestLevel;
  }

  // ===== 3. PREVISÃO DE BUFFER =====
  recordBufferMetrics(bufferLevel, downloadSpeed, currentQuality) {
    this.bufferHistory.push({
      buffer: bufferLevel,
      speed: downloadSpeed,
      quality: currentQuality,
      timestamp: Date.now()
    });

    if (this.bufferHistory.length > 100) {
      this.bufferHistory.shift();
    }
  }

  predictBufferEmptyTime() {
    if (this.bufferHistory.length < 10) return null;

    const recent = this.bufferHistory.slice(-20);
    const avgBuffer = recent.reduce((a, b) => a + b.buffer, 0) / recent.length;
    const avgSpeed = recent.reduce((a, b) => a + b.speed, 0) / recent.length;

    if (avgSpeed === 0) return null;

    const bufferDrainRate = 1;
    const predictedSeconds = avgBuffer / bufferDrainRate;

    return {
      currentBuffer: avgBuffer,
      predictedSeconds,
      recommendation: predictedSeconds < 10 ? 'emergency' : predictedSeconds < 20 ? 'low' : 'healthy'
    };
  }

  // ===== 4. PRÉ-CARREGAMENTO DE CANAIS =====
  getChannelsToPreload(currentChannel, channels, count = 5) {
    const currentIndex = channels.findIndex(ch => ch.id === currentChannel?.id);
    if (currentIndex === -1) return [];

    const nextChannels = [];
    const prevChannels = [];

    for (let i = 1; i <= count; i++) {
      if (currentIndex + i < channels.length) {
        nextChannels.push(channels[currentIndex + i]);
      }
      if (currentIndex - i >= 0) {
        prevChannels.push(channels[currentIndex - i]);
      }
    }

    return { next: nextChannels.slice(0, 3), prev: prevChannels.slice(0, 2) };
  }

  // ===== 5. DETECÇÃO DE PATTERN DE USO =====
  analyzeUsagePattern() {
    const history = SyncManager.getHistory();
    if (history.length < 5) return null;

    const hourNow = new Date().getHours();
    const watchTimes = history.map(h => new Date(h.lastWatched).getHours());
    
    const timeDistribution = {};
    watchTimes.forEach(h => {
      const period = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
      timeDistribution[period] = (timeDistribution[period] || 0) + 1;
    });

    const favoritePeriod = Object.entries(timeDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening';

    return {
      favoritePeriod,
      totalWatched: history.length,
      avgWatchTime: history.reduce((a, h) => a + (h.watchTime || 0), 0) / history.length
    };
  }

  // ===== 6. WEBCodecs (experimental - acceleration) =====
  async tryHardwareDecode() {
    if (!('WebCodecs' in window)) {
      console.log('[AI] WebCodecs não disponível');
      return false;
    }

    try {
      const codecSupport = await Promise.all([
        VideoDecoder.isConfigSupported({ codec: 'avc1.42001E', codedWidth: 1920, codedHeight: 1080 }),
        VideoDecoder.isConfigSupported({ codec: 'hvc1.1.L.3.1', codedWidth: 1920, codedHeight: 1080 })
      ]);

      const supported = codecSupport.some(s => s.supported);
      console.log('[AI] Hardware decode:', supported ? 'Disponível' : 'Não suportado');
      return supported;
    } catch (e) {
      console.log('[AI] WebCodecs error:', e.message);
      return false;
    }
  }
}

export const aiService = new AIService();
export default aiService;
