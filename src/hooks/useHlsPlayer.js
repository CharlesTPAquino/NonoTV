import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { aiService } from '../services/AIService';
import { detectStreamType as getGlobalStreamType } from '../services/streamService';
import { detectDeviceProfile } from '../services/SmartServerOrchestrator';
import { prefetchService } from '../services/PrefetchService';
import { detectServerTech, TECH_PROFILES } from '../services/ServerTechProfiler';

/**
 * NonoTV — Hardware-Aware Turbo Player v4.8 + Server Tech Aware
 * Adapta a performance ao dispositivo E à tecnologia do servidor.
 */

const CONFIG_PROFILES = {
  live: {
    enableWorker: true,
    lowLatencyMode: false,
    backBufferLength: 5,
    maxBufferLength: 12,
    maxMaxBufferLength: 18,
    maxBufferSize: 20 * 1000 * 1000,
    manifestLoadingMaxRetry: 15,
    levelLoadingMaxRetry: 15,
    fragLoadingMaxRetry: 20,
    liveSyncDurationCount: 4,
    liveMaxLatencyDurationCount: 8,
    abrBandWidthFactor: 0.8,
    abrBandWidthUpFactor: 0.5
  },
  vod: {
    enableWorker: true,
    lowLatencyMode: false,
    backBufferLength: 30,
    maxBufferLength: 60,
    maxMaxBufferLength: 90,
    maxBufferSize: 60 * 1000 * 1000,
    manifestLoadingMaxRetry: 10,
    fragLoadingMaxRetry: 10,
    abrBandWidthFactor: 0.9,
    abrBandWidthUpFactor: 0.7
  }
};

function detectStreamType(url) {
  if (!url) return 'live';
  const lower = url.toLowerCase();
  
  // Server Tech Detection first
  const serverTech = detectServerTech(url);
  
  // TS Direct streams → HLS.js
  if (serverTech.key === 'TS_DIRECT' || lower.includes('.ts') || lower.includes('output=ts')) {
    return 'hls-ts';
  }
  
  // VOD MP4/MKV → direct play
  if (serverTech.key === 'VOD_MP4' || lower.includes('.mp4') || lower.includes('.mkv')) {
    return 'direct';
  }
  
  // HLS Direct → HLS.js
  if (serverTech.key === 'HLS_DIRECT' || lower.includes('.m3u8') || lower.includes('output=m3u8')) {
    return 'hls';
  }
  
  // Xtream → depends on content type
  if (serverTech.key === 'XTREAM') {
    const type = getGlobalStreamType(url);
    if (type === 'movie' || type === 'series') {
      // VOD via Xtream can be .ts or .mp4
      if (lower.includes('.mp4') || lower.includes('.mkv')) return 'direct';
      return 'hls'; // Xtream VOD often uses HLS
    }
    return 'hls'; // Live via Xtream
  }
  
  // MAG/Stalker → TS streams via HLS.js
  if (serverTech.key === 'MAG' || serverTech.key === 'ENIGMA') {
    return 'hls-ts';
  }
  
  // Fallback: detect by extension
  if (lower.includes('.ts') || lower.includes('.mp4') || lower.includes('.mkv')) return 'direct';
  const type = getGlobalStreamType(url);
  return (type === 'movie' || type === 'series') ? 'hls' : 'live';
}

export default function useHlsPlayer(url, videoRef, options = {}) {
  const [playerState, setPlayerState] = useState({
    playing: false, buffering: true, error: null, status: 'idle'
  });

  const hlsRef = useRef(null);
  const optionsRef = useRef(options);
  const initHlsRef = useRef(null);

  useEffect(() => { optionsRef.current = options; }, [options]);

  const update = useCallback((patch) => setPlayerState(s => ({ ...s, ...patch })), []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      // Se a instância for do prefetch, não destruímos totalmente aqui para permitir reuso rápido
      // apenas paramos o download se não for o canal ativo. 
      // Mas para segurança v4.8, vamos destruir apenas se não for a instância quente.
      hlsRef.current.stopLoad();
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const initHls = useCallback((video, src) => {
    destroyHls();

    // Zapping Instantâneo: Checa se canal já foi prefetched
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
    const profile = detectDeviceProfile();
    const isVod = type === 'direct';
    const baseConfig = isVod ? CONFIG_PROFILES.vod : CONFIG_PROFILES.live;
    
    console.log(`[Turbo-Player] Server Tech: ${type} | Device: ${profile.label}`);
    
    // Mescla perfil de hardware com perfil de conteúdo
    const finalConfig = {
      ...baseConfig,
      maxBufferLength: Math.min(baseConfig.maxBufferLength, profile.maxBuffer),
      abrBandWidthFactor: profile.abrFactor,
      enableWorker: true
    };

    const hls = new Hls(finalConfig);
    hlsRef.current = hls;
    
    video.setAttribute('playsinline', '');
    video.style.transform = 'translateZ(0)';

    const isDev = import.meta.env.DEV;
    const loadUrl = isDev ? `http://localhost:3131/?url=${encodeURIComponent(src)}` : src;

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
      // VOD MP4/MKV: Native playback
      video.src = url;
      video.load();
      video.play().catch(() => {});
    } else {
      // HLS (live, hls, hls-ts): HLS.js
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
