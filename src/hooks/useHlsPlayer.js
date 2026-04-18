import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { aiService } from '../services/AIService';
import { detectStreamType as getGlobalStreamType } from '../services/streamService';
import { detectDeviceProfile } from '../services/SmartServerOrchestrator';
import { prefetchService } from '../services/PrefetchService';
import { detectServerTech, TECH_PROFILES } from '../services/ServerTechProfiler';
import { detectTier } from './useDeviceProfile';

/**
 * NonoTV — Hardware-Aware Turbo Player v5.2
 * P3: AI Metadata Enrichment integrado
 * P4: Auto-Quality Selector (adapta resolução ao bandwidth + hardware)
 * P5: Otimizado para AmerikaKG (timeouts maiores, retries automáticos)
 */

function detectStreamType(url) {
  if (!url) return 'live';
  const lower = url.toLowerCase();
  
  const serverTech = detectServerTech(url);
  
  if (serverTech.key === 'TS_DIRECT' || lower.includes('.ts') || lower.includes('output=ts')) {
    return 'hls-ts';
  }
  
  if (serverTech.key === 'VOD_MP4' || lower.includes('.mp4') || lower.includes('.mkv')) {
    return 'direct';
  }
  
  if (serverTech.key === 'HLS_DIRECT' || lower.includes('.m3u8') || lower.includes('output=m3u8')) {
    return 'hls';
  }
  
  if (serverTech.key === 'XTREAM') {
    const type = getGlobalStreamType(url);
    if (type === 'movie' || type === 'series') {
      if (lower.includes('.mp4') || lower.includes('.mkv')) return 'direct';
      return 'hls';
    }
    return 'hls';
  }
  
  if (serverTech.key === 'MAG' || serverTech.key === 'ENIGMA') {
    return 'hls-ts';
  }
  
  if (lower.includes('.ts') || lower.includes('.mp4') || lower.includes('.mkv')) return 'direct';
  const type = getGlobalStreamType(url);
  return (type === 'movie' || type === 'series') ? 'hls' : 'live';
}

function isAmerikaKG(url) {
  return url?.includes('americakg.xyz');
}

export default function useHlsPlayer(url, videoRef, options = {}, channel = null) {
  const [playerState, setPlayerState] = useState({
    playing: false, buffering: true, error: null, status: 'idle', quality: 'auto', isWarmed: false
  });

  const hlsRef = useRef(null);
  const optionsRef = useRef(options);
  const initHlsRef = useRef(null);
  const qualityRef = useRef('auto');
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => { optionsRef.current = options; }, [options]);

  const update = useCallback((patch) => setPlayerState(s => ({ ...s, ...patch })), []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.stopLoad();
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const initHls = useCallback((video, src) => {
    destroyHls();

    const warmHls = prefetchService.getWarmHls(src);
    if (warmHls) {
      console.log('[Turbo-Player] Zapping Instantâneo: Reaproveitando buffer quente.');
      hlsRef.current = warmHls;
      warmHls.attachMedia(video);
      update({ buffering: false, status: 'ready', isWarmed: true });
      if (optionsRef.current.autoPlay !== false) video.play().catch(() => {});
      return;
    }
    
    if (!Hls.isSupported()) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
        return;
      }
      update({ error: 'Incompatível', buffering: false });
      return;
    }

    const type = detectStreamType(src);
    const deviceProfile = detectDeviceProfile();
    const tier = detectTier();
    const isVod = type === 'direct';
    const isLive = !isVod;
    const isAmerika = isAmerikaKG(src);

    if (isAmerika) {
      console.log('[Turbo-Player] AmerikaKG detectado: modo turbo ativado');
    }

    const autoConfig = aiService.getAutoQualityConfig(isLive);
    
    const amerikaBoost = isAmerika ? {
      fragLoadingTimeOut: 30000,
      manifestLoadingTimeOut: 30000,
      manifestLoadingMaxRetry: 5,
      fragLoadingMaxRetry: 5,
      maxBufferLength: 30,
      maxBufferSize: 60 * 1000 * 1000,
      liveSyncDurationCount: 10,
      liveMaxLatencyDurationCount: 15
    } : {};

    const deviceConfig = {
      maxBufferLength: Math.min(autoConfig.maxBufferLength, deviceProfile.maxBuffer, tier.maxBufferLength),
      maxBufferSize: Math.min(autoConfig.maxBufferSize, tier.bufferSize),
      abrBandwidthFactor: deviceProfile.abrFactor,
    };
    
    const finalConfig = { 
      ...autoConfig, 
      ...deviceConfig,
      ...amerikaBoost,
      enableWorker: true,
      lowLatencyMode: autoConfig.lowLatencyMode,
      abrEwmaDefaultEstimate: autoConfig.abrEwmaDefaultEstimate 
    };
    
    const conn = aiService.detectConnectionQuality();
    console.log(`[Turbo-Player] ${type} | ${deviceProfile.label} | ${tier.name} | ${conn.effectiveType} (${conn.downlink}Mbps)`);
    
    const hls = new Hls(finalConfig);
    hlsRef.current = hls;
    
    video.setAttribute('playsinline', '');
    video.style.transform = 'translateZ(0)';

    const isDev = import.meta.env.DEV;
    if (isDev) {
      src = `http://localhost:3131/?url=${encodeURIComponent(src)}`;
    }

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      const level = hls.levels[data.level];
      if (level) {
        const height = level.height;
        const label = height >= 2160 ? '4K' : height >= 1080 ? '1080p' : height >= 720 ? '720p' : `${height}p`;
        qualityRef.current = label;
        update({ quality: label });
      }
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      update({ buffering: false, status: 'ready' });
      retryCountRef.current = 0;
      if (optionsRef.current.autoPlay !== false) video.play().catch(() => {});
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        console.warn('[Turbo-Player] Erro de rede fatal, tentando recarregar...');
        hls.startLoad();
      }
      else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        console.warn('[Turbo-Player] Erro de mídia fatal, tentando recuperar...');
        hls.recoverMediaError();
      }
      else {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.warn(`[Turbo-Player] Erro crítico, reinicializando em 2000ms (tentativa ${retryCountRef.current}/${maxRetries})...`);
          destroyHls();
          setTimeout(() => initHlsRef.current?.(video, src), 2000);
        } else {
          console.error('[Turbo-Player] Todas as tentativas esgotadas');
          update({ error: 'Falha ao reproduzir', buffering: false });
        }
      }

    });
  }, [destroyHls, update]);

  useEffect(() => { initHlsRef.current = initHls; }, [initHls]);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    const video = videoRef.current;

    update({ buffering: true, error: null, playing: false });

    const onPlaying = () => update({ buffering: false, playing: true, status: 'ready' });
    const onWaiting = () => update({ buffering: true });

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onPlaying);

    const type = detectStreamType(url);

    if (type === 'direct') {
      video.src = url;
      video.load();
      video.play().catch(() => {});
    } else {
      initHlsRef.current?.(video, url);
    }

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onPlaying);
      if (type === 'direct') {
        video.removeAttribute('src');
        video.load();
      }
      destroyHls();
    };
  }, [url, destroyHls]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  }, [videoRef]);

  const seek = useCallback((time) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
  }, [videoRef]);

  const seekRelative = useCallback((delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  }, [videoRef]);

  return { playerState, togglePlay, seek, seekRelative };
}
