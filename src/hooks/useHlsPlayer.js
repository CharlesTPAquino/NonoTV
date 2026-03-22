import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

/**
 * NonoTV — Turbo Player Hook
 * Motor de reprodução resiliente com auto-recuperação.
 */

function detectStreamType(url) {
  if (!url) return 'hls';
  const lower = url.toLowerCase();
  const path = lower.split('?')[0];
  if (/\.(mp4|mkv|avi|mov|m4v|webm|flv)$/i.test(path)) return 'direct';
  return 'hls';
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
    activeSubtitle: -1
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

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      manifestLoadingMaxRetry: 10,
      manifestLoadingRetryDelay: 2000,
      levelLoadingMaxRetry: 10,
      fragLoadingMaxRetry: 10,
      startLevel: -1,
      abrEwmaDefaultEstimate: 5000000,
      xhrSetup: (xhr) => { xhr.withCredentials = false; },
    });

    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      console.log('[Turbo-Player] Sinal validado, iniciando buffer...');
      update({ 
        buffering: false, 
        status: 'ready', 
        error: null, 
        retryCount: 0,
        audioTracks: hls.audioTracks,
        subtitles: hls.subtitleTracks
      });
      if (optionsRef.current.autoPlay !== false) {
        video.play().catch(err => console.warn('[Player] Bloqueio de Autoplay:', err));
      }
      if (optionsRef.current.onQualitiesFound) optionsRef.current.onQualitiesFound(data.levels);
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
