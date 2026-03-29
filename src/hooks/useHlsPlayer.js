import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { aiService } from '../services/AIService';

/**
 * NonoTV — Turbo Player Hook
 * Motor de reprodução resiliente com AI e auto-recuperação.
 */

function detectStreamType(url) {
  if (!url) return 'hls';
  const lower = url.toLowerCase();
  const path = lower.split('?')[0];
  if (/\.(mp4|mkv|avi|mov|m4v|webm|flv)$/i.test(path)) return 'direct';
  return 'hls';
}

function detectSupportedCodecs(video) {
  const codecs = [];
  
  // Testar codecs comuns
  const testCodecs = [
    'avc1.42001E', // H.264 Baseline
    'avc1.42001F', // H.264 Main
    'avc1.64001F', // H.264 High
    'hvc1.1.L3.1', // H.265/HEVC
    'hev1.1.L3.1', // HEVC
    'av01.0.01M', // AV1
    'vp9',         // VP9
    'vp8',         // VP8
  ];
  
  testCodecs.forEach(codec => {
    const support = video.canPlayType('video/mp4', codec);
    if (support === 'probably' || support === 'maybe') {
      codecs.push(codec);
    }
  });
  
  return codecs;
}

function findCompatibleLevel(levels, supportedCodecs) {
  if (!levels || levels.length === 0) return -1;
  
  // Primeiro, tentar encontrar um nível com codec suportado
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const codec = level.codecs || '';
    
    // Verificar se o codec é suportado
    if (codec && supportedCodecs.some(sc => codec.includes(sc))) {
      return i;
    }
  }
  
  // Se nenhum for encontrado, retorna o primeiro (geralmente o mais baixo)
  return 0;
}

export default function useHlsPlayer(url, videoRef, options = {}) {
  const [playerState, setPlayerState] = useState({
    playing: false,
    buffering: true,
    error: null,
    status: 'idle',
    retryCount: 0,
    audioTracks: [],
    subtitles: [],
    activeAudio: -1,
    activeSubtitle: -1,
    codecInfo: []
  });

  const hlsRef = useRef(null);
  const retryTimerRef = useRef(null);
  const optionsRef = useRef(options);

  // Mantém as options atualizadas sem engatilhar loops
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const update = useCallback((patch) => setPlayerState(s => ({ ...s, ...patch })), []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const initHls = useCallback((video, src) => {
    destroyHls();

    if (!Hls.isSupported()) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
        return;
      }
      update({ error: 'Navegador incompatível.', buffering: false, status: 'error' });
      return;
    }

    const isDev = import.meta.env.DEV;
    const PROXY = 'http://localhost:3131';

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 0,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      manifestLoadingMaxRetry: 15,
      manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 15,
      fragLoadingMaxRetry: 15,
      startLevel: -1,
      abrEwmaDefaultEstimate: 5000000,
      xhrSetup: (xhr, url) => {
        xhr.withCredentials = false;
        // Em DEV, roteia cada request do HLS pelo proxy local
        if (isDev && url && !url.startsWith(PROXY)) {
          const proxied = `${PROXY}/?url=${encodeURIComponent(url)}`;
          xhr.open('GET', proxied, true);
        }
      },
    });

    hlsRef.current = hls;
    // Em DEV, roteia o manifesto pelo proxy
    const loadUrl = isDev ? `${PROXY}/?url=${encodeURIComponent(src)}` : src;
    hls.loadSource(loadUrl);
    hls.attachMedia(video);

    // Enable hardware acceleration
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const levels = data.levels || [];
      const codecInfo = levels.map((level, idx) => ({
        index: idx,
        height: level.height,
        bitrate: level.bitrate,
        codecs: level.codecs || 'unknown',
        width: level.width
      }));
      
      console.log('[Turbo-Player] Codecs disponíveis:', codecInfo);
      
      // Detectar melhor codec para o dispositivo
      const supportedCodecs = detectSupportedCodecs(video);
      console.log('[Turbo-Player] Codecs suportados:', supportedCodecs);
      
      // Selecionar nível compatível
      const compatibleLevel = findCompatibleLevel(levels, supportedCodecs);
      if (compatibleLevel >= 0) {
        hls.currentLevel = compatibleLevel;
        console.log(`[Turbo-Player] Codec selecionado: ${codecInfo[compatibleLevel]?.codecs || 'default'} (nível ${compatibleLevel})`);
      }
      
      update({ 
        buffering: false, 
        status: 'ready', 
        error: null, 
        retryCount: 0,
        audioTracks: hls.audioTracks,
        subtitles: hls.subtitleTracks,
        codecInfo
      });
      if (optionsRef.current.autoPlay !== false) {
        video.play().catch(err => console.warn('[Player] Bloqueio de Autoplay:', err));
      }
      if (optionsRef.current.onQualitiesFound) optionsRef.current.onQualitiesFound(levels);
      
      // AI: Auto-select best quality based on network
      if (levels && levels.length > 1) {
        const optimalLevel = aiService.getOptimalQuality(levels, 20, 5000000);
        if (optimalLevel > 0) {
          hls.currentLevel = optimalLevel;
          console.log(`[AI] Qualidade selecionada: ${optimalLevel}`);
        }
      }
    });

    // AI: Buffer monitoring
    hls.on(Hls.Events.FRAG_BUFFERED, (_, data) => {
      const bufferLength = video.buffered.length > 0 ? video.buffered.end(0) - video.currentTime : 0;
      aiService.recordBufferMetrics(bufferLength, 1000000, hls.currentLevel);
    });

    hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
      update({ activeAudio: data.id });
    });

    hls.on(Hls.Events.SUBTITLE_TRACK_SWITCHED, (_, data) => {
      update({ activeSubtitle: data.id });
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) {
        if (data.details === 'bufferStalledError') update({ buffering: true });
        return;
      }

      console.error('[Turbo-Player] Erro fatal:', data.type, data.details);

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        update({ buffering: true, status: 'retrying' });
        hls.startLoad();
        
        setPlayerState(prev => {
          if (prev.retryCount >= 3) {
             retryTimerRef.current = setTimeout(() => initHls(video, src), 3000);
             return { ...prev, retryCount: 0 };
          }
          return { ...prev, retryCount: prev.retryCount + 1 };
        });
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        destroyHls();
        update({ error: `Falha Crítica: ${data.details}`, buffering: false, status: 'error' });
        optionsRef.current.onError?.(data);
      }
    });

    const syncEvents = () => {
      update({ 
        playing: !video.paused,
        buffering: false 
      });
    };

    video.addEventListener('play', syncEvents);
    video.addEventListener('pause', syncEvents);
    video.addEventListener('waiting', () => update({ buffering: true }));
    video.addEventListener('playing', () => update({ buffering: false, playing: true }));

    return () => {
      video.removeEventListener('play', syncEvents);
      video.removeEventListener('pause', syncEvents);
      destroyHls();
    };
  }, [destroyHls, update]);

  const initPlayer = useCallback(() => {
    if (!url || !videoRef.current) return;
    const video = videoRef.current;
    
    update({ 
      buffering: true, 
      error: null, 
      playing: false, 
      status: 'loading',
      audioTracks: [],
      subtitles: []
    });

    const type = detectStreamType(url);
    if (type === 'direct') {
      video.src = url;
      video.play().catch(() => {});
      return () => { video.src = ''; };
    }

    return initHls(video, url);
  }, [url, videoRef, update, initHls]);

  useEffect(() => {
    const cleanup = initPlayer();
    return () => cleanup?.();
  }, [initPlayer]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  }, [videoRef]);

  const changeQuality = useCallback((index) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
    }
  }, []);

  const changeAudio = useCallback((index) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index;
    }
  }, []);

  const changeSubtitle = useCallback((index) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = index;
    }
  }, []);

  return { playerState, togglePlay, changeQuality, changeAudio, changeSubtitle };
}
