import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, 
  SkipBack, SkipForward, Maximize, Minimize,
  ChevronLeft, ChevronRight, List
} from 'lucide-react';
import Hls from 'hls.js';

const VOD_CONFIG = {
  seekStep: 10,
  controlsTimeout: 4000,
};

function detectStreamType(url) {
  if (!url) return 'hls';
  const path = url.toLowerCase().split('?')[0];
  
  const hlsPatterns = ['.m3u8', 'get.php', 'live/', 'playlist', 'stream', 'mpegts', '/hls/', '/live/'];
  const videoPatterns = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.m4v', '.3gp', '.ts', '.m2ts'];
  
  for (const pattern of hlsPatterns) {
    if (path.includes(pattern)) return 'hls';
  }
  
  for (const pattern of videoPatterns) {
    if (path.includes(pattern)) return 'video';
  }
  
  return 'hls';
}

export default function VodPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-hide controls
  const controlsTimerRef = useRef(null);
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), VOD_CONFIG.controlsTimeout);
    }
  }, [isPlaying]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => { setIsBuffering(true); setError(null); };
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlay = () => { setIsPlaying(true); setIsBuffering(false); };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration || 0);
    const handleWaiting = () => setIsBuffering(true);
    const handleError = () => { setError('Vídeo não disponível'); setIsBuffering(false); };

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
      video.play().catch(e => setError('Não foi possível reproduzir'));
    } else {
      video.pause();
    }
  }, []);

  const seek = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration]);

  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (video) video.currentTime = parseFloat(e.target.value);
  }, []);

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

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const changeChannel = useCallback((newChannel) => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsBuffering(true);
    const streamType = detectStreamType(newChannel.url);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (streamType === 'hls' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(newChannel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsBuffering(false);
      });
      hls.on(Hls.Events.ERROR, (e, data) => {
        if (data.fatal) setError('Erro ao carregar vídeo');
      });
      hlsRef.current = hls;
    } else {
      video.src = newChannel.url;
      video.load();
    }

    setShowSidebar(false);
  }, []);

  // Keyboard shortcuts
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
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          e.preventDefault();
          if (showSidebar) setShowSidebar(false);
          else onClose();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [seek, togglePlay, toggleMute, toggleFullscreen, onClose, showSidebar, resetControlsTimer]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center font-sans">
        <div className="max-w-md text-center p-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Erro de Reprodução</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button 
            onClick={onClose} 
            className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black overflow-hidden select-none"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={channel?.url}
        className="w-full h-full object-contain pointer-events-auto"
        playsInline
        autoPlay
        crossOrigin="anonymous"
        onClick={(e) => { 
          e.stopPropagation(); 
          setShowControls(!showControls); 
          resetControlsTimer();
        }}
      />

      {/* Central Play/Pause Button - Mobile Optimized */}
      <div className={`absolute inset-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); resetControlsTimer(); }}
          className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 pointer-events-auto hover:scale-110 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
        </button>
      </div>

      {/* Buffering Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-white/60 text-sm font-medium">Carregando...</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className={`absolute top-0 left-0 right-0 z-40 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 md:p-8">
          <div className="flex items-center justify-between max-w-[1920px] mx-auto">
            {/* Left - Back Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                title="Voltar"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 bg-white/20 rounded text-white text-[10px] font-bold uppercase tracking-wider">
                    {channel?.type === 'movie' ? 'Filme' : 'Série'}
                  </span>
                </div>
                <h1 className="text-white text-lg md:text-xl font-bold line-clamp-1">{channel?.name}</h1>
              </div>
            </div>

            {/* Center - Info (Mobile Only) */}
            <div className="sm:hidden text-center flex-1 px-4">
              <h1 className="text-white text-base font-bold line-clamp-1">{channel?.name}</h1>
            </div>

            {/* Right - Sidebar & Close */}
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSidebar(!showSidebar); }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${showSidebar ? 'bg-white text-black' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
              >
                <List size={20} />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-red-500/30 transition-colors border border-red-500/20"
                title="Fechar"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-10">
          {/* Progress bar */}
          <div className="mb-6 px-2">
            <div className="flex items-center gap-4 text-white/60 text-sm mb-2">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1" />
              <span>{formatTime(duration)}</span>
            </div>
            
            <div className="relative group cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <div className="h-1 bg-white/20 rounded-full group-hover:h-2 transition-all">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            {/* Left - Playback controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); seek(-VOD_CONFIG.seekStep); }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); seek(VOD_CONFIG.seekStep); }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Right - Volume, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleMute(); resetControlsTimer(); }}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => { e.stopPropagation(); resetControlsTimer(); }}
                  className="w-16 md:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Fullscreen */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Library */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-xl z-50 transition-transform duration-500 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white text-lg font-bold">Biblioteca</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <span className="text-white/40 text-sm">Filmes e Séries</span>
        </div>

        <div className="h-[calc(100%-88px)] overflow-y-auto p-4 space-y-2">
          {channels?.filter(c => c.type === 'movie' || c.type === 'series').map((ch) => (
            <button
              key={ch.id}
              onClick={() => changeChannel(ch)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                ch.id === channel?.id 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                ch.id === channel?.id ? 'bg-black/10' : 'bg-white/10'
              }`}>
                {ch.type === 'movie' ? '🎬' : '📺'}
              </span>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{ch.name}</p>
                <p className={`text-xs truncate ${ch.id === channel?.id ? 'text-black/60' : 'text-white/40'}`}>
                  {ch.group}
                </p>
              </div>
              {ch.id === channel?.id && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Backdrop for sidebar */}
      {showSidebar && (
        <div 
          className="absolute inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
