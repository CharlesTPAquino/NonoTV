import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

function detectStreamType(url) {
  if (!url) return 'hls';
  const lower = url.toLowerCase();
  const path = lower.split('?')[0];

  // VOD direto — extensão explícita
  if (/\.(mp4|mkv|avi|mov|m4v|webm|flv)$/i.test(path)) return 'direct';

  // Tudo mais é HLS (incluindo /get.php, output=m3u8, etc.)
  return 'hls';
}

export function useHlsPlayer(url, videoRef, options = {}) {
  const [playerState, setPlayerState] = useState({
    playing: false, buffering: true, error: null,
  });

  const hlsRef = useRef(null);
  const update = useCallback((patch) => setPlayerState(s => ({ ...s, ...patch })), []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
  }, []);

  const initHls = useCallback((video, src) => {
    if (!Hls.isSupported()) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
        return () => {};
      }
      update({ error: 'Stream não suportado.', buffering: false });
      return () => {};
    }

    const hls = new Hls({
      enableWorker: true, lowLatencyMode: false, startLevel: -1,
      fragLoadingMaxRetry: 5, manifestLoadingMaxRetry: 5,
      backBufferLength: 30, maxBufferLength: 30, maxMaxBufferLength: 60,
      xhrSetup: (xhr) => { xhr.withCredentials = false; },
    });

    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      update({ buffering: false });
      if (options.autoPlay !== false) video.play().catch(() => {});
      if (options.onQualitiesFound) options.onQualitiesFound(data.levels);
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { hls.startLoad(); update({ buffering: true }); }
      else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) { hls.recoverMediaError(); }
      else { destroyHls(); update({ error: 'Stream indisponível.', buffering: false }); options.onError?.(data); }
    });

    const onPlay    = () => update({ playing: true,  buffering: false });
    const onPause   = () => update({ playing: false });
    const onWaiting = () => update({ buffering: true });
    const onPlaying = () => update({ playing: true,  buffering: false });
    video.addEventListener('play',    onPlay);
    video.addEventListener('pause',   onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);

    return () => {
      video.removeEventListener('play',    onPlay);
      video.removeEventListener('pause',   onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      destroyHls();
    };
  }, [destroyHls, update, options]);

  const initPlayer = useCallback(() => {
    if (!url || !videoRef.current) return;
    const video = videoRef.current;
    destroyHls();
    update({ buffering: true, error: null, playing: false });

    const type = detectStreamType(url);

    if (type === 'direct') {
      console.log('[Player] VOD direto:', url);
      video.preload = 'metadata';
      video.src = url;

      const onMeta  = () => { update({ buffering: false }); video.play().catch(() => {}); video.removeEventListener('loadedmetadata', onMeta); };
      const onError = () => { console.warn('[Player] Direto falhou, tentando HLS...'); video.removeEventListener('error', onError); initHls(video, url); };

      video.addEventListener('loadedmetadata', onMeta);
      video.addEventListener('error', onError);
      video.load();

      return () => {
        video.removeEventListener('loadedmetadata', onMeta);
        video.removeEventListener('error', onError);
        video.src = '';
      };
    }

    return initHls(video, url);
  }, [url, videoRef, destroyHls, update, initHls]);

  useEffect(() => {
    const cleanup = initPlayer();
    return () => cleanup?.();
  }, [initPlayer]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    playerState.playing ? v.pause() : v.play().catch(() => {});
  }, [playerState.playing, videoRef]);

  const changeQuality = useCallback((index) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index;
  }, []);

  return { playerState, togglePlay, changeQuality };
}
