import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { aiService } from '../services/AIService';
import { detectStreamType as getGlobalStreamType } from '../services/streamService';
import { detectDeviceProfile } from '../services/SmartServerOrchestrator';

/**
 * NonoTV — Hardware-Aware Turbo Player v4.6
 * Adapta a performance ao poder de fogo do dispositivo.
 */

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
      hlsRef.current.stopLoad();
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
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
      update({ error: 'Incompatível', buffering: false });
      return;
    }

    // Inteligência de Hardware v4.6
    const profile = detectDeviceProfile();
    console.log(`[Turbo-Player] Ativando Perfil: ${profile.label}`);

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: profile.maxBuffer < 10,
      backBufferLength: profile.maxBuffer / 2,
      maxBufferLength: profile.maxBuffer,
      maxMaxBufferLength: profile.maxBuffer * 1.5,
      maxBufferSize: (profile.threads * 15) * 1000 * 1000, // RAM escalonada por núcleos
      abrBandWidthFactor: profile.abrFactor,
      abrBandWidthUpFactor: profile.abrFactor - 0.2,
      progressive: true,
      debug: false
    });

    hlsRef.current = hls;
    video.setAttribute('playsinline', '');
    if (profile.uiEffects) video.style.transform = 'translateZ(0)'; // Aceleração GPU Elite

    hls.loadSource(src);
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

    const onPlaying = () => update({ buffering: false, playing: true });
    const onWaiting = () => update({ buffering: true });

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('play', onPlaying);

    if (url.toLowerCase().includes('.ts') || url.toLowerCase().includes('.mp4')) {
      video.src = url;
      video.load();
      video.play().catch(() => {});
    } else {
      initHlsRef.current?.(video, url);
    }

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('play', onPlaying);
      destroyHls();
    };
  }, [url]);

  return { playerState, togglePlay: () => videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause() };
}
