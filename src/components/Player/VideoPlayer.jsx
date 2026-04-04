import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Settings, 
  SkipBack, SkipForward, Maximize, Minimize,
  ChevronLeft, ChevronRight, Heart, RefreshCw,
  Subtitles, List, Grid
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

export default function VideoPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const { playChannel, currentProgram, nextProgram } = usePlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qualities, setQualities] = useState([]);
  const [activeQuality, setActiveQuality] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { 
    playerState, 
    togglePlay, 
    changeQuality, 
  } = useHlsPlayer(channel?.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: (levs) => setQualities(levs)
  }, channel);

  const { 
    playing, buffering, error, status,
    audioTracks, subtitles, activeAudio, activeSubtitle
  } = playerState;

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls]);

  // Update playing state
  useEffect(() => {
    setIsPlaying(playing);
  }, [playing]);

  // Track time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration || 0);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('durationchange', updateDuration);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      setShowControls(true);
      const idx = channels?.findIndex(ch => ch.id === channel?.id) ?? -1;

      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (idx > 0) playChannel(channels[idx - 1]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (idx < channels.length - 1) playChannel(channels[idx + 1]);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          e.preventDefault();
          if (showSidebar) setShowSidebar(false);
          else if (showSettings) setShowSettings(false);
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
  }, [channel, channels, showSidebar, showSettings]);

  // Fullscreen
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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const seek = useCallback((seconds) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, video.currentTime + seconds);
  }, []);

  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (video && duration) {
      video.currentTime = parseFloat(e.target.value);
    }
  }, [duration]);

  const changeChannel = useCallback((ch) => {
    playChannel(ch);
    setShowSidebar(false);
  }, [playChannel]);

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center font-sans">
        <div className="max-w-md text-center p-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sinal Indisponível</h2>
          <p className="text-gray-400 mb-8">Não foi possível conectar ao servidor IPTV.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={onClose} 
              className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black overflow-hidden select-none"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain pointer-events-auto"
        playsInline
        autoPlay
        onClick={(e) => { 
          e.stopPropagation(); 
          setShowControls(!showControls); 
        }}
      />

      {/* Central Play/Pause Button - Mobile Optimized */}
      <div className={`absolute inset-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 pointer-events-auto hover:scale-110 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
        </button>
      </div>

      {/* Buffering Overlay */}
      {buffering && (
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
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">AO VIVO</span>
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
              {channel?.type === 'movie' && <span>{formatTime(duration)}</span>}
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
            {/* Left - Channel navigation */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); seek(-10); }}
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
                onClick={(e) => { e.stopPropagation(); seek(10); }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Center - Previous/Next Channel */}
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = channels?.findIndex(ch => ch.id === channel?.id) ?? -1;
                  if (idx > 0) playChannel(channels[idx - 1]);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={18} />
                <span className="text-sm font-medium hidden md:block">Anterior</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = channels?.findIndex(ch => ch.id === channel?.id) ?? -1;
                  if (idx < channels.length - 1) playChannel(channels[idx + 1]);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                <span className="text-sm font-medium hidden md:block">Próximo</span>
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Right - Volume, Settings, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
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
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 md:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Quality */}
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Settings size={18} />
                </button>

                {/* Settings dropdown */}
                {showSettings && (
                  <div 
                    className="absolute bottom-14 right-0 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 px-2">Qualidade</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setActiveQuality(-1); changeQuality(-1); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeQuality === -1 ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                      >
                        Automático
                      </button>
                      {qualities.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveQuality(i); changeQuality(i); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeQuality === i ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                        >
                          {q.height}p
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Sidebar - Channel List */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-xl z-50 transition-transform duration-500 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white text-lg font-bold">Canais</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <span className="text-white/40 text-sm">{channels?.length ?? 0} canais</span>
        </div>

        <div className="h-[calc(100%-88px)] overflow-y-auto p-4 space-y-2">
          {channels?.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => changeChannel(ch)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                ch.id === channel?.id 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                ch.id === channel?.id ? 'bg-black/10' : 'bg-white/10'
              }`}>
                {ch.number || idx + 1}
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
