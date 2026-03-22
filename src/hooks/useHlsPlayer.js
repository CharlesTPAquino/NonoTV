import { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';

export function useHlsPlayer(onFatalError) {
  const videoRef = useRef(null);
  const hlsRef   = useRef(null);
  const retryRef = useRef(0);

  const [playerState, setPlayerState] = useState({
    playing:   false,
    muted:     false,
    volume:    1,
    buffering: false,
    error:     null,
    qualities: [],     
    quality:   -1,     
    pip:       false,
  });

  const update = useCallback((patch) => {
    setPlayerState(prev => ({ ...prev, ...patch }));
  }, []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const loadUrl = useCallback((url, useProxy = false) => {
    const video = videoRef.current;
    if (!video || !url) return;

    destroyHls();
    retryRef.current = 0;
    update({ error: null, buffering: true, playing: false, qualities: [], quality: -1, pip: false });

    // Fallback para Modo Nativo caso não suporte HLS ou seja MP4 direto
    const isDirect = /\.(mp4|mkv|avi|mov|ts|m4v)$/i.test(url) || 
                   url.toLowerCase().includes('movie/') || 
                   url.toLowerCase().includes('series/') || 
                   (!url.includes('.m3u8') && !url.includes('m3u8')); // Se não tem m3u8, assume direct

    if (!Hls.isSupported() || isDirect) {
        console.log("[Player] Usando Modo Nativo (Fast-Start):", url);
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        video.src = url;
        video.load();
        
        // Disparar play assim que os primeiros metadados chegarem
        const onReady = () => { video.play().catch(() => {}); video.removeEventListener('loadedmetadata', onReady); };
        video.addEventListener('loadedmetadata', onReady);
        
        update({ buffering: false }); 
        return;
    }

    const hls = new Hls({
      enableWorker:     true,
      lowLatencyMode:   false, // VOD não precisa de baixo delay, mas sim de buffer estável
      startLevel:       -1,    // Auto-seleção de qualidade inicial baseada no tempo de resposta
      fragLoadingMaxRetry: 5,
      manifestLoadingMaxRetry: 5,
      backBufferLength: 30,
      maxBufferLength:  30,     // Buffer curto para começar rápido
      maxMaxBufferLength: 60,
      xhrSetup: (xhr) => { xhr.withCredentials = false; },
    });

    hlsRef.current = hls;
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const qualities = data.levels.map((l, i) => ({
        id: i,
        label: l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)}kbps`,
      }));
      update({ qualities, quality: -1, buffering: false });
      video.play().catch(() => {});
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryRef.current < 3) {
        retryRef.current++;
        setTimeout(() => hls.startLoad(), 1500 * retryRef.current);
        update({ error: `Reconectando... (${retryRef.current}/3)`, buffering: true });
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        update({ error: 'Recuperando sinal...', buffering: true });
        return;
      }

      destroyHls();
      onFatalError?.(data.type);
    });
  }, [destroyHls, update, onFatalError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlaying      = () => update({ playing: true,  buffering: false, error: null });
    const onPause        = () => update({ playing: false });
    const onWaiting      = () => update({ buffering: true });
    const onVolumeChange = () => update({ volume: video.volume, muted: video.muted });
    const onPipEnter     = () => update({ pip: true });
    const onPipLeave     = () => update({ pip: false });

    video.addEventListener('playing',        onPlaying);
    video.addEventListener('pause',          onPause);
    video.addEventListener('waiting',        onWaiting);
    video.addEventListener('volumechange',   onVolumeChange);
    video.addEventListener('enterpictureinpicture',  onPipEnter);
    video.addEventListener('leavepictureinpicture',  onPipLeave);

    return () => {
      video.removeEventListener('playing',       onPlaying);
      video.removeEventListener('pause',         onPause);
      video.removeEventListener('waiting',       onWaiting);
      video.removeEventListener('volumechange',  onVolumeChange);
      video.removeEventListener('enterpictureinpicture', onPipEnter);
      video.removeEventListener('leavepictureinpicture', onPipLeave);
    };
  }, [update]);

  // Controles encapsulados
  const togglePlay = useCallback(() => { 
    if (videoRef.current) videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause(); 
  }, []);
  
  const toggleMute = useCallback(() => { 
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; 
  }, []);
  
  const setVolume = useCallback((vol) => { 
    if (videoRef.current) { videoRef.current.volume = Math.max(0, Math.min(1, vol)); videoRef.current.muted = vol === 0; }
  }, []);

  const setQuality = useCallback((id) => { 
    if (hlsRef.current) hlsRef.current.currentLevel = id; 
    update({ quality: id });
  }, [update]);

  const togglePip = useCallback(async () => {
    if (!videoRef.current) return;
    try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await videoRef.current.requestPictureInPicture();
    } catch (e) {}
  }, []);

  return { videoRef, playerState, loadUrl, togglePlay, toggleMute, setVolume, setQuality, togglePip, hlsRef };
}
