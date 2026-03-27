import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Settings, 
  Maximize, SkipBack, SkipForward, List
} from 'lucide-react';

const VOD_CONFIG = {
  bufferTime: 30,
  seekStep: 10,
  controlsTimeout: 5000
};

/**
 * NonoTV VOD Player - Specialized for MP4/MKV
 * Direct playback without HLS.js - native browser support
 */
export default function VodPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const controlsTimerRef = useRef(null);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), VOD_CONFIG.controlsTimeout);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlay = () => { setIsPlaying(true); setIsBuffering(false); };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handleError = () => setError('Erro ao reproduzir o vídeo');

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const seek = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      resetControlsTimer();
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          seek(VOD_CONFIG.seekStep);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-VOD_CONFIG.seekStep);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          onClose();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
        case 'F':
          if (videoRef.current) {
            videoRef.current.requestFullscreen?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [seek, togglePlay, toggleMute, onClose, resetControlsTimer]);

  // Update video volume when state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-bg-primary flex items-center justify-center p-10 font-display">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-state-error/20 border border-state-error/50 rounded-full flex items-center justify-center mx-auto mb-6 text-state-error shadow-glow-sm">
            <X size={40} />
          </div>
          <h2 className="text-3xl font-black text-content-primary uppercase tracking-tighter mb-4">Erro de Reprodução</h2>
          <p className="text-content-tertiary font-bold mb-10 leading-relaxed">{error}</p>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 border border-border text-content-secondary font-bold rounded-2xl uppercase tracking-widest text-xs hover:bg-surface-hover"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-display transition-all duration-500 ${isSidebarOpen ? 'pr-[320px]' : ''}`}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <video
        ref={videoRef}
        src={channel?.url}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        crossOrigin="anonymous"
        onClick={togglePlay}
      />

      {/* Buffering Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center z-20">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin shadow-glow-sm" />
          </div>
          <p className="mt-8 text-primary font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Carregando Vídeo</p>
        </div>
      )}

      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-b from-black/80 to-transparent transition-all duration-700 z-50 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-2 h-14 bg-primary rounded-full shadow-glow-sm" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-primary font-black text-sm tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">VOD</span>
                <h2 className="text-white font-black text-3xl md:text-5xl tracking-tighter uppercase leading-none">
                  {channel?.name}
                </h2>
              </div>
              <div className="flex items-center gap-4 text-content-muted text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2">{channel?.group}</span>
                <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 border ${isSidebarOpen ? 'bg-primary border-primary text-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white hover:text-black'}`}
            >
              <List size={24} />
            </button>
            <button 
              aria-label="Fechar"
              onClick={onClose}
              className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-state-error hover:border-state-error hover:text-white transition-all duration-500 group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-700 z-50 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const video = videoRef.current;
                if (video) video.currentTime = parseFloat(e.target.value);
              }}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Skip Back */}
              <button 
                onClick={() => seek(-VOD_CONFIG.seekStep)}
                className="flex flex-col items-center gap-1 text-content-muted hover:text-content-primary transition-colors"
              >
                <SkipBack size={24} />
                <span className="text-[10px] font-bold">{VOD_CONFIG.seekStep}s</span>
              </button>

              {/* Play/Pause */}
              <button 
                onClick={togglePlay}
                className="w-20 h-20 rounded-[32px] bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" className="ml-1" />}
              </button>

              {/* Skip Forward */}
              <button 
                onClick={() => seek(VOD_CONFIG.seekStep)}
                className="flex flex-col items-center gap-1 text-content-muted hover:text-content-primary transition-colors"
              >
                <SkipForward size={24} />
                <span className="text-[10px] font-bold">{VOD_CONFIG.seekStep}s</span>
              </button>

              {/* Volume */}
              <div className="flex items-center gap-4">
                <button onClick={toggleMute} className="text-content-muted hover:text-content-primary">
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Fullscreen */}
              <button 
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-content-muted hover:bg-white hover:text-black transition-all duration-500"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[360px] bg-black/95 backdrop-blur-3xl border-l border-white/5 z-[150] transition-all duration-700 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-10 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Biblioteca</h3>
            <button aria-label="Fechar" onClick={() => setSidebarOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-content-muted hover:bg-white hover:text-black">
               <X size={22} />
            </button>
          </div>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Filmes & Séries</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3 scrollbar-thin">
          {channels?.filter(c => c.type === 'movie' || c.type === 'series').map((ch, idx) => (
            <button 
              key={ch.id} 
              onClick={() => {
                videoRef.current?.pause();
                videoRef.current.src = ch.url;
                videoRef.current.play();
              }}
              className={`w-full group p-5 rounded-[24px] border flex items-center gap-5 transition-all duration-500 ${ch.id === channel?.id ? 'bg-primary border-primary text-white shadow-glow-md scale-[1.02]' : 'bg-white/[0.03] border-border hover:bg-surface-hover hover:border-border-hover'}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-[11px] font-black group-hover:scale-110 transition-transform">
                {ch.type === 'movie' ? '🎬' : '📺'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-black uppercase tracking-tight truncate group-hover:tracking-normal transition-all">{ch.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${ch.id === channel?.id ? 'text-white/70' : 'text-content-muted'}`}>{ch.group}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded ${ch.type === 'movie' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-accent-violet/20 text-accent-violet'}`}>
                    {ch.type === 'movie' ? 'FILME' : 'SÉRIE'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}