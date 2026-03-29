import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Settings,
  ChevronLeft, ChevronRight, Tv, List
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

export default function VideoPlayer({ channel, channels, onClose, mode = 'smart' }) {
  const videoRef = useRef(null);
  const { playChannel } = usePlayer();
  const containerRef = useRef(null);
  
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('playerVolume') || '0.8'));
  const [qualities, setQualities] = useState([]);
  const [activeQuality, setActiveQuality] = useState(-1);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const hideTimerRef = useRef(null);

  const { 
    playerState, 
    togglePlay
  } = useHlsPlayer(channel?.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: (levs) => setQualities(levs)
  });

  const { playing, buffering, error, status } = playerState;

  // Hide controls instantly when playing starts (autoPlay)
  useEffect(() => {
    if (playing && !showChannelList && !showSettings) {
      setShowControls(false);
      // Auto-hide play button after 2 seconds on autoPlay
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [playing, showChannelList, showSettings]);

  // Show controls on interaction
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
  }, []);

  // Apply volume to video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
      localStorage.setItem('playerVolume', volume.toString());
    }
  }, [volume]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setVolume(prev => prev === 0 ? 0.8 : 0);
  }, []);

  // Handle close
  const handleClose = useCallback((e) => {
    if (e) e.stopPropagation();
    if (onClose) onClose();
  }, [onClose]);

  // Handle next/prev channel
  const handleNext = useCallback(() => {
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i < channels.length - 1) playChannel(channels[i + 1]);
  }, [channels, channel, playChannel]);

  const handlePrev = useCallback(() => {
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i > 0) playChannel(channels[i - 1]);
  }, [channels, channel, playChannel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      showControlsTemporarily();
      switch(e.key) {
        case ' ': 
          e.preventDefault();
          togglePlay(); 
          break;
        case 'ArrowUp': 
          setVolume(prev => Math.min(1, prev + 0.1)); 
          break;
        case 'ArrowDown': 
          setVolume(prev => Math.max(0, prev - 0.1)); 
          break;
        case 'ArrowLeft': handlePrev(); break;
        case 'ArrowRight': handleNext(); break;
        case 'Escape': handleClose(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handlePrev, handleNext, handleClose, showControlsTemporarily]);

  // Touch/click to toggle controls
  const handleContainerClick = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase mb-4">Erro de Reprodução</h2>
          <p className="text-white/50 mb-8">{error}</p>
          <button
            onClick={handleClose}
            className="w-full py-4 bg-[#F7941D] text-black font-black rounded-2xl uppercase text-xs tracking-widest"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={handleContainerClick}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
      />

      {/* Buffering Overlay - Only spinner, no full screen cover */}
      {(buffering || status === 'loading') && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-3 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-3 border-t-[#F7941D] rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 p-6 flex items-start justify-between transition-all duration-300 z-40 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClose}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-[#F7941D] hover:text-black transition-all"
          >
            <X size={20} />
          </button>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">
                AO VIVO
              </span>
            </div>
            <h2 className="text-white font-black text-xl">{channel?.name}</h2>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between transition-all duration-300 z-40 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Prev/Next */}
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-white/20">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNext} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-white/20">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Center: Play/Pause (único botão) */}
        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-[#F7941D] flex items-center justify-center shadow-lg"
        >
          {playing ? (
            <Pause size={28} className="text-black" fill="currentColor" />
          ) : (
            <Play size={28} className="text-black ml-1" fill="currentColor" />
          )}
        </button>

        {/* Right: Volume */}
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur px-4 py-2 rounded-full">
          <button onClick={toggleMute} className="text-white">
            {volume === 0 ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))} 
            className="w-20 accent-[#F7941D] cursor-pointer" 
          />
        </div>
      </div>

    </div>
  );
}
