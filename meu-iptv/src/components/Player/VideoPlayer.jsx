import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import Hls from 'hls.js';

function detectStreamType(url) {
  if (!url) return 'hls';
  const path = url.toLowerCase().split('?')[0];
  if (/\.(mp4|mkv|avi|mov|m4v|webm|flv)$/i.test(path)) return 'direct';
  return 'hls';
}

export default function VideoPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  const streamType = detectStreamType(channel?.url);
  const isDirect = streamType === 'direct';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;

    setError(null);
    setIsBuffering(true);

    if (isDirect) {
      video.src = channel.url;
    } else {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
      }
    }

    return () => { if (hlsRef.current) hlsRef.current.destroy(); };
  }, [channel?.url, isDirect]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onPlay = () => { setIsPlaying(true); setIsBuffering(false); };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => setError('Erro ao reproduzir');

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play().catch(() => {}) : video.pause();
  }, []);

  const seek = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration]);

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') seek(10);
      if (e.key === 'ArrowLeft') seek(-10);
      if (e.key === 'Enter' || e.key === ' ') togglePlay();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [seek, togglePlay, onClose]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">{error}</p>
          <button onClick={onClose} className="px-6 py-2 bg-white/10 text-white rounded">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-contain" playsInline onClick={togglePlay} />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-white/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      <button onClick={onClose} className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
        <X size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 px-6 py-3 rounded-full">
        <button onClick={() => seek(-10)} className="text-white"><SkipBack size={24} /></button>
        <button onClick={togglePlay} className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
        </button>
        <button onClick={() => seek(10)} className="text-white"><SkipForward size={24} /></button>
        <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
    </div>
  );
}