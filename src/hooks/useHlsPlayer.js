import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { aiService } from '../services/AIService';
import { detectStreamType as getGlobalStreamType } from '../services/streamService';
import { detectDeviceProfile } from '../services/SmartServerOrchestrator';
import { prefetchService } from '../services/PrefetchService';
import { detectServerTech, TECH_PROFILES } from '../services/ServerTechProfiler';
import { detectTier } from './useDeviceProfile';

/**
 * NonoTV — Hardware-Aware Turbo Player v5.1
 * P3: AI Metadata Enrichment integrado
 * P4: Auto-Quality Selector (adapta resolução ao bandwidth + hardware)
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

export default function useHlsPlayer(url, videoRef, options = {}, channel = null) {
  const [playerState, setPlayerState] = useState({
    playing: false, buffering: true, error: null, status: 'idle', quality: 'auto'
  });

  const hlsRef = useRef(null);
  const optionsRef = useRef(options);
  const initHlsRef = useRef(null);
  const qualityRef = useRef('auto');

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

  const initHls = useCallback(async (video, src) => {
    destroyHls();

    const warmHls = prefetchService.getWarmHls(src);
    if (warmHls) {
      console.log('[Turbo-Player] Zapping Instantâneo: Reaproveitando buffer quente.');
      hlsRef.current = warmHls;
      warmHls.attachMedia(video);
      update({ buffering: false, status: 'ready' });
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

    // Google Video Stitcher — tenta obter manifest otimizado para play instantâneo
    let loadUrl = src;
    try {
      loadUrl = await aiService.getStitchedManifest(src, { name: channel?.name, group: channel?.group });
      if (loadUrl !== src) {
        console.log('[Stitcher] Manifest otimizado recebido');
      } else {
        console.log('[Stitcher] Fallback para URL original');
      }
    } catch {
      console.log('[Stitcher] Erro, usando URL original');
    }

    // P4: Auto-Quality Selector — detecta conexão E hardware
    const autoConfig = aiService.getAutoQualityConfig(isLive);
    const deviceConfig = {
      maxBufferLength: Math.min(autoConfig.maxBufferLength, deviceProfile.maxBuffer, tier.maxBufferLength),
      maxBufferSize: Math.min(autoConfig.maxBufferSize, tier.bufferSize),
      abrBandWidthFactor: deviceProfile.abrFactor,
    };
    
    const finalConfig = { ...autoConfig, ...deviceConfig, enableWorker: true };
    
    const conn = aiService.detectConnectionQuality();
    console.log(`[Turbo-Player] ${type} | ${deviceProfile.label} | ${tier.name} | ${conn.effectiveType} (${conn.downlink}Mbps)`);
    
    const hls = new Hls(finalConfig);
    hlsRef.current = hls;
    
    video.setAttribute('playsinline', '');
    video.style.transform = 'translateZ(0)';

    const isDev = import.meta.env.DEV;
    if (isDev) {
      loadUrl = `http://localhost:3131/?url=${encodeURIComponent(src)}`;
    }

    hls.loadSource(loadUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      update({ buffering: false, status: 'ready' });
      if (optionsRef.current.autoPlay !== false) video.play().catch(() => {});
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
      else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      else {
        destroyHls();
        setTimeout(() => initHlsRef.current?.(video, src), 2000);
      }
    });

    return () => destroyHls();
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
    let cleanupHls = null;

    if (type === 'direct') {
      video.src = url;
      video.load();
      video.play().catch(() => {});
    } else {
      cleanupHls = initHlsRef.current?.(video, url);
    }

    return () => {
      if (cleanupHls) cleanupHls();
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onPlaying);
      if (type === 'direct') {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [url]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  }, [videoRef]);

  return { playerState, togglePlay };
}
