import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Settings, List, Tv
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

const DesignSystem = {
  colors: {
    primary: '#F7941D',
    primaryHover: '#FFA333',
    background: 'rgba(0, 0, 0, 0.85)',
    surface: 'rgba(24, 24, 27, 0.9)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    error: '#EF4444',
    success: '#22C55E',
    live: '#DC2626'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px'
  },
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease'
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.3)',
    md: '0 4px 16px rgba(0,0,0,0.4)',
    lg: '0 8px 32px rgba(0,0,0,0.5)'
  }
};

export default function VideoPlayer({ channel, channels, onClose, mode = 'smart' }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { playChannel } = usePlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('playerVolume') || '0.8'));
  const [qualities] = useState([]);
  const [activeQuality] = useState(-1);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const hideTimerRef = useRef(null);

  const { 
    playerState, 
    togglePlay
  } = useHlsPlayer(channel?.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: () => {}
  });

  const { playing, buffering, error, status } = playerState;

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 6000);
    }
  }, [playing]);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (playing && !showChannelList && !showSettings) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [playing, showChannelList, showSettings]);

  useEffect(() => {
    if (buffering) {
      setShowControls(true);
      return;
    }
    if (playing) {
      resetHideTimer();
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [playing, buffering, showChannelList, showSettings, resetHideTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
      localStorage.setItem('playerVolume', volume.toString());
    }
  }, [volume]);

  const toggleMute = useCallback(() => {
    setVolume(prev => prev === 0 ? 0.8 : 0);
  }, []);

  const handleClose = useCallback((e) => {
    if (e) e.stopPropagation();
    if (onClose) onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i < channels.length - 1) playChannel(channels[i + 1]);
  }, [channels, channel, playChannel]);

  const handlePrev = useCallback(() => {
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i > 0) playChannel(channels[i - 1]);
  }, [channels, channel, playChannel]);

  const toggleFullscreen = useCallback(() => {
    const elem = containerRef.current;
    if (!elem) return;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('[Player] Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape': 
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            handleClose();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointermove', showControlsTemporarily);
    window.addEventListener('pointerdown', showControlsTemporarily);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointermove', showControlsTemporarily);
      window.removeEventListener('pointerdown', showControlsTemporarily);
    };
  }, [togglePlay, handlePrev, handleNext, handleClose, toggleFullscreen, isFullscreen, showControlsTemporarily]);

  const handleContainerClick = useCallback((e) => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-8">
        <div 
          className="max-w-md text-center"
          style={{
            background: DesignSystem.colors.surface,
            padding: DesignSystem.spacing.xl,
            borderRadius: DesignSystem.borderRadius.lg,
            boxShadow: DesignSystem.shadows.lg
          }}
        >
          <div 
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: DesignSystem.borderRadius.full
            }}
          >
            <X size={40} style={{ color: DesignSystem.colors.error }} />
          </div>
          <h2 
            className="text-2xl font-black uppercase mb-4"
            style={{ color: DesignSystem.colors.text }}
          >
            Erro de Reprodução
          </h2>
          <p style={{ color: DesignSystem.colors.textSecondary, marginBottom: DesignSystem.spacing.xl }}>
            {error}
          </p>
          <button
            onClick={handleClose}
            className="w-full py-4 font-black uppercase text-xs tracking-widest transition-all active:scale-95"
            style={{
              background: DesignSystem.colors.primary,
              color: '#000',
              borderRadius: DesignSystem.borderRadius.md
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const ControlButton = ({ onClick, children, className = '', style = {} }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${className}`}
      style={{
        background: DesignSystem.colors.background,
        color: DesignSystem.colors.text,
        borderRadius: DesignSystem.borderRadius.full,
        width: '44px',
        height: '44px',
        backdropFilter: 'blur(10px)',
        ...style
      }}
    >
      {children}
    </button>
  );

  const PlayPauseButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      style={{
        background: DesignSystem.colors.primary,
        color: '#000',
        borderRadius: DesignSystem.borderRadius.full,
        width: '64px',
        height: '64px',
        boxShadow: DesignSystem.shadows.md
      }}
    >
      {playing ? (
        <Pause size={28} />
      ) : (
        <Play size={28} style={{ marginLeft: '2px' }} />
      )}
    </button>
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={handleContainerClick}
      onPointerMove={showControlsTemporarily}
      onPointerDown={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
      />

      {(buffering && !playing && status !== 'ready') && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div className="relative w-12 h-12">
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ border: '3px solid rgba(255,255,255,0.1)' }}
            />
            <div 
              className="absolute inset-0 rounded-full animate-spin"
              style={{ 
                border: `3px solid transparent`,
                borderTopColor: DesignSystem.colors.primary,
                borderRightColor: DesignSystem.colors.primary
              }}
            />
          </div>
        </div>
      )}

      <div 
        className={`absolute top-0 left-0 right-0 p-6 flex items-start justify-between transition-all duration-300 z-40 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' 
        }}
      >
        <div className="flex items-center gap-3">
          <ControlButton onClick={handleClose}>
            <X size={20} />
          </ControlButton>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded uppercase"
                style={{ 
                  background: DesignSystem.colors.live,
                  color: DesignSystem.colors.text
                }}
              >
                AO VIVO
              </span>
            </div>
            <h2 
              className="font-black text-xl"
              style={{ color: DesignSystem.colors.text }}
            >
              {channel?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ControlButton onClick={() => setShowChannelList(!showChannelList)}>
            <Tv size={20} />
          </ControlButton>
          <ControlButton onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </ControlButton>
        </div>
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between transition-all duration-300 z-40 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ 
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <ControlButton onClick={handlePrev}>
            <ChevronLeft size={22} />
          </ControlButton>
          <ControlButton onClick={handleNext}>
            <ChevronRight size={22} />
          </ControlButton>
        </div>

        <PlayPauseButton onClick={togglePlay} />

        <div 
          className="flex items-center gap-3 px-4 py-2"
          style={{ 
            background: DesignSystem.colors.background,
            borderRadius: DesignSystem.borderRadius.full,
            backdropFilter: 'blur(10px)'
          }}
        >
          <button 
            onClick={toggleMute}
            className="flex items-center justify-center transition-colors hover:opacity-80"
            style={{ color: volume === 0 ? DesignSystem.colors.error : DesignSystem.colors.text }}
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 cursor-pointer"
            style={{ accentColor: DesignSystem.colors.primary }}
          />
        </div>
      </div>

      {showChannelList && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-80 z-50 overflow-y-auto transition-all duration-300"
          style={{ 
            background: DesignSystem.colors.surface,
            boxShadow: DesignSystem.shadows.lg
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="p-4 flex items-center justify-between border-b"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <h3 
              className="font-semibold"
              style={{ color: DesignSystem.colors.text }}
            >
              Canais
            </h3>
            <button
              onClick={() => setShowChannelList(false)}
              className="flex items-center justify-center transition-colors hover:opacity-70"
              style={{ color: DesignSystem.colors.textSecondary }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-2">
            {channels?.slice(0, 50).map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  playChannel(ch);
                  setShowChannelList(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left"
                style={{
                  background: ch.id === channel?.id ? DesignSystem.colors.primary + '20' : 'transparent',
                  color: ch.id === channel?.id ? DesignSystem.colors.primary : DesignSystem.colors.text
                }}
              >
                {ch.logo && (
                  <img 
                    src={ch.logo} 
                    alt="" 
                    className="w-8 h-8 object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className="text-sm font-medium truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
