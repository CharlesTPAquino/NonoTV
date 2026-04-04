import { useState, useEffect, useCallback, useRef } from 'react';

const OPTIMIZATION_CONFIG = {
  stream: {
    buffer: { min: 8, target: 15, max: 25 },
    latency: { target: 3, max: 6 },
    retry: { max: 8, delay: 150 }
  },
  movie: {
    buffer: { min: 15, target: 30, max: 60 },
    latency: { target: 8, max: 15 },
    retry: { max: 5, delay: 500 }
  },
  series: {
    buffer: { min: 10, target: 25, max: 45 },
    latency: { target: 5, max: 12 },
    retry: { max: 5, delay: 400 }
  }
};

export function useStreamOptimizer(url, videoRef) {
  const [bufferLevel, setBufferLevel] = useState(0);
  const [latency, setLatency] = useState(0);
  const [quality, setQuality] = useState('auto');
  const [networkScore, setNetworkScore] = useState(100);
  
  const statsRef = useRef({ attempts: 0, success: 0, fails: 0 });
  const lastCheckRef = useRef(Date.now());

  const detectStreamCategory = useCallback((url) => {
    if (!url) return 'stream';
    const lower = url.toLowerCase();
    if (lower.includes('movie') || lower.includes('filme') || lower.includes('vod')) return 'movie';
    if (lower.includes('series') || lower.includes('episodio')) return 'series';
    return 'stream';
  }, []);

  const calculateNetworkScore = useCallback(() => {
    try {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!connection) return 100;
      
      let score = 100;
      
      if (connection.effectiveType === 'slow-2g') score = 20;
      else if (connection.effectiveType === '2g') score = 40;
      else if (connection.effectiveType === '3g') score = 70;
      
      if (connection.downlink) {
        if (connection.downlink < 0.5) score *= 0.5;
        else if (connection.downlink < 1) score *= 0.7;
        else if (connection.downlink < 2) score *= 0.85;
      }
      
      if (connection.rtt && connection.rtt > 500) score *= 0.8;
      if (connection.saveData) score *= 0.5;
      
      return Math.round(score);
    } catch {
      return 100;
    }
  }, []);

  const updateStats = useCallback((success) => {
    statsRef.current.attempts++;
    if (success) statsRef.current.success++;
    else statsRef.current.fails++;
    lastCheckRef.current = Date.now();
  }, []);

  const getHealthScore = useCallback(() => {
    const { attempts, success, fails } = statsRef.current;
    if (attempts === 0) return 100;
    
    const successRate = success / attempts;
    const recency = Math.max(0, 1 - (Date.now() - lastCheckRef.current) / 60000);
    
    return Math.round(successRate * 80 + recency * 20);
  }, []);

  useEffect(() => {
    if (!videoRef?.current) return;
    
    const video = videoRef.current;
    let interval;
    
    const checkStats = () => {
      try {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const currentTime = video.currentTime;
          const buffer = bufferedEnd - currentTime;
          setBufferLevel(Math.round(buffer));
        }
        
        const networkScore = calculateNetworkScore();
        setNetworkScore(networkScore);
      } catch {}
    };
    
    interval = setInterval(checkStats, 1000);
    return () => clearInterval(interval);
  }, [videoRef, calculateNetworkScore]);

  useEffect(() => {
    const updateNetworkScore = () => {
      setNetworkScore(calculateNetworkScore());
    };
    
    window.addEventListener('online', updateNetworkScore);
    window.addEventListener('offline', () => setNetworkScore(0));
    
    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkScore);
    }
    
    return () => {
      window.removeEventListener('online', updateNetworkScore);
      window.removeEventListener('offline', updateNetworkScore);
      if (connection) connection.removeEventListener('change', updateNetworkScore);
    };
  }, [calculateNetworkScore]);

  const getRecommendations = useCallback(() => {
    const category = detectStreamCategory(url);
    const config = OPTIMIZATION_CONFIG[category];
    
    const recommendations = [];
    
    if (bufferLevel < config.buffer.min) {
      recommendations.push({
        type: 'buffer',
        level: 'critical',
        message: `Buffer muito baixo (${bufferLevel}s). Reduzindo qualidade...`,
        action: 'reduce'
      });
    } else if (bufferLevel < config.buffer.target) {
      recommendations.push({
        type: 'buffer',
        level: 'warning',
        message: `Buffer baixo (${bufferLevel}s).`,
        action: 'maintain'
      });
    }
    
    if (networkScore < 40) {
      recommendations.push({
        type: 'network',
        level: 'critical',
        message: `Conexão fraca (${networkScore}%).`,
        action: 'reduce'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'status',
        level: 'good',
        message: `Streaming otimizado (buffer: ${bufferLevel}s, rede: ${networkScore}%)`,
        action: 'optimize'
      });
    }
    
    return recommendations;
  }, [url, bufferLevel, networkScore, detectStreamCategory]);

  return {
    bufferLevel,
    latency,
    quality,
    networkScore,
    healthScore: getHealthScore(),
    recommendations: getRecommendations(),
    updateStats,
    detectStreamCategory
  };
}

export function detectHardwareCapabilities() {
  const capabilities = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isChrome: /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent),
    isFirefox: /Firefox/i.test(navigator.userAgent),
    isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent),
    hasHardwareAcceleration: false,
    supportsMSE: false,
    supportsWebGL: false,
    maxVideoHeight: 0,
    supportedCodecs: []
  };

  try {
    capabilities.supportsMSE = typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E"');
    capabilities.supportsWebGL = !!window.WebGLRenderingContext;
    
    const testVideo = document.createElement('video');
    const codecTests = [
      { codec: 'avc1.42001E', name: 'H264' },
      { codec: 'avc1.64001F', name: 'H264-High' },
      { codec: 'hev1.1.L3.1', name: 'HEVC' },
      { codec: 'vp9', name: 'VP9' },
      { codec: 'av01.0.01M', name: 'AV1' }
    ];
    
    codecTests.forEach(test => {
      if (testVideo.canPlayType(`video/mp4; codecs="${test.codec}"`)) {
        capabilities.supportedCodecs.push(test.name);
      }
    });
    
    capabilities.hasHardwareAcceleration = capabilities.isAndroid || capabilities.isChrome;
    
    const ctx = document.createElement('canvas').getContext('webgl');
    if (ctx) {
      const debugInfo = ctx.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        capabilities.gpuRenderer = ctx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch {}

  return capabilities;
}

export default { useStreamOptimizer, detectHardwareCapabilities };
