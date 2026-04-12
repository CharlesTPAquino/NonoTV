import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Settings, List, Tv
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

export default function VideoPlayer({ channel, channels, onClose, mode = 'smart' }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { playChannel } = usePlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('playerVolume') || '0.8'));
  const [showChannelList, setShowChannelList] = useState(false);
  const [isAiEnhanced, setIsAiEnhanced] = useState(true);
  const [aiStep, setAiStep] = useState('initial');
  
  const hideTimerRef = useRef(null);

  const { 
    playerState, 
    togglePlay
  } = useHlsPlayer(channel?.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: () => {},
    aiEnhance: isAiEnhanced
  }, channel);

  const { playing, buffering, error, status, isWarmed } = playerState;

  // Efeito visual de "Injeção de AI" no carregamento
  useEffect(() => {
    if (status === 'ready') {
      setAiStep('analyzing');
      setTimeout(() => setAiStep('upscaling'), 1000);
      setTimeout(() => setAiStep('enhanced'), 2500);
    } else {
      setAiStep('initial');
    }
  }, [status]);

  // ─── CONTROLS VISIBILITY ───
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 5000);
    }
  }, [playing]);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing && !showChannelList) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 4000);
    }
  }, [playing, showChannelList]);

  useEffect(() => {
    if (buffering) { setShowControls(true); return; }
    if (playing) resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [playing, buffering, showChannelList, resetHideTimer]);

  // ─── VOLUME ───
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
      localStorage.setItem('playerVolume', volume.toString());
    }
  }, [volume]);

  const toggleMute = useCallback(() => setVolume(prev => prev === 0 ? 0.8 : 0), []);

  // ─── CLOSE ───
  const handleClose = useCallback((e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (onClose) onClose();
  }, [onClose]);

  // ─── CHANNEL NAVIGATION ───
  const handleNext = useCallback(() => {
    if (!channels?.length) return;
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i < channels.length - 1) playChannel(channels[i + 1]);
  }, [channels, channel, playChannel]);

  const handlePrev = useCallback(() => {
    if (!channels?.length) return;
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i > 0) playChannel(channels[i - 1]);
  }, [channels, channel, playChannel]);

  // ─── PIP ───
  const togglePip = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) { console.warn('[Player] PiP Error:', err); }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setIsPipActive(true);
    const onLeave = () => setIsPipActive(false);
    video.addEventListener('enterpictureinpicture', onEnter);
    video.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter);
      video.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, []);

  // Auto PiP em background
  useEffect(() => {
    if (!document.pictureInPictureEnabled) return;
    const handleVisibility = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused && !document.pictureInPictureElement) {
        videoRef.current.requestPictureInPicture().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ─── FULLSCREEN ───
  const toggleFullscreen = useCallback(() => {
    const elem = containerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── KEYBOARD HANDLER (PLAYER-SPECIFIC) ───
  // Este handler é CAPTURADO na fase de capture para ter prioridade sobre o App.jsx
  useEffect(() => {
    const handleKeyDown = (e) => {
      // BACK BUTTON — máxima prioridade: fecha player
      if (e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4 || e.keyCode === 10009 || e.keyCode === 461) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (showChannelList) {
          setShowChannelList(false);
        } else if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          handleClose();
        }
        return;
      }

      // Mostrar controles em qualquer tecla
      showControlsTemporarily();

      if (e.key === 'Enter' || e.key === ' ') {
        // Se estiver focado num botão (ex: Close, Play), deixa o botão agir nativamente!
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
        
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    // Mudei para fase de captura FALSO para não bloquear navegação de botões
    window.addEventListener('keydown', handleKeyDown, false);
    window.addEventListener('pointermove', showControlsTemporarily);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
      window.removeEventListener('pointermove', showControlsTemporarily);
    };
  }, [togglePlay, handlePrev, handleNext, handleClose, toggleFullscreen, isFullscreen, showChannelList, showControlsTemporarily]);

  // ─── FOCUS TRAP — Foca no close button ao abrir ───
  useEffect(() => {
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ─── VIDEO CLICK ───
  const handleContainerClick = useCallback(() => {
    if (!showControls) {
      showControlsTemporarily();
    } else {
      togglePlay();
    }
  }, [showControls, showControlsTemporarily, togglePlay]);

  // ─── ERROR STATE ───
  if (error) {
    return (
      <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center p-8" data-nav-zone="player">
        <div className="max-w-md text-center bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-red-500/20 rounded-full">
            <X size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Erro de Reprodução</h2>
          <p className="text-white/50 mb-8">{error}</p>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="w-full py-4 font-semibold uppercase text-xs tracking-widest bg-white text-black rounded-xl transition-all active:scale-95 focus:ring-2 focus:ring-white/50"
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
      className="fixed inset-0 z-[500] bg-black flex items-center justify-center"
      data-nav-zone="player"
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        className={`w-full h-full object-contain transition-all duration-700 ${isAiEnhanced && status === 'ready' ? 'brightness-105 contrast-105' : ''}`}
        style={{ 
          imageRendering: isAiEnhanced ? 'high-quality' : 'auto',
          filter: isAiEnhanced && status === 'ready' ? 'contrast(1.08) saturate(1.12) brightness(1.03)' : 'none'
        }}
        playsInline
        autoPlay
      />

      {/* AI Image Enhancement Overlay (Hardware Accelerated) */}
      {isAiEnhanced && status === 'ready' && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-overlay opacity-30">
           <div className="w-full h-full backdrop-blur-[0.5px] contrast-[1.1] saturate-[1.15] brightness-[1.05]" />
        </div>
      )}

      {/* AI Status Notification (UI Minimal) */}
      {isAiEnhanced && aiStep !== 'initial' && aiStep !== 'enhanced' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 animate-out fade-out zoom-out duration-1000 delay-[2000ms]">
          {isWarmed && (
             <div className="px-4 py-2 bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                Turbo Zapping (Buffer Aquecido)
              </span>
            </div>
          )}
          <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
              {aiStep === 'analyzing' ? 'IA Analisando Frame...' : 'IA Injetando Hardware Upscale...'}
            </span>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {(buffering && !playing && status !== 'ready') && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/30">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
            <div className="absolute inset-0 rounded-full animate-spin border-[3px] border-transparent border-t-white/70 border-r-white/70" />
          </div>
        </div>
      )}

      {/* ─── TOP BAR ─── */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between z-40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
            aria-label="Fechar player"
          >
            <X size={20} />
          </button>
          
          <div className="ml-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase">
                AO VIVO
              </span>
              {playerState.quality && playerState.quality !== 'auto' && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-white/60 uppercase">
                  {playerState.quality}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-base md:text-lg text-white line-clamp-1">
              {channel?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChannelList(!showChannelList)}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
            aria-label="Lista de canais"
          >
            <Tv size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
            aria-label="Tela cheia"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-40 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Prev/Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
            aria-label="Canal anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
            aria-label="Próximo canal"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Play/Pause */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 shadow-lg"
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
        >
          {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2">
          <button 
            onClick={toggleMute}
            className="flex items-center justify-center text-white hover:text-white/80 transition-colors focus:ring-2 focus:ring-white/50 rounded-full p-1"
            aria-label={volume === 0 ? 'Ativar som' : 'Mudo'}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 cursor-pointer accent-white"
            tabIndex={-1}
          />
        </div>
      </div>

      {/* ─── CHANNEL LIST PANEL ─── */}
      {showChannelList && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-80 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl border-l border-white/10"
          onClick={e => e.stopPropagation()}
          data-nav-zone="overlay"
        >
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <h3 className="font-semibold text-white">Canais</h3>
            <button
              onClick={() => setShowChannelList(false)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all focus:ring-2 focus:ring-white/50"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-2">
            {channels?.slice(0, 50).map((ch) => (
              <button
                key={ch.id}
                onClick={() => { playChannel(ch); setShowChannelList(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  ch.id === channel?.id ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {ch.logo && (
                  <img src={ch.logo} alt="" className="w-8 h-8 object-contain rounded"
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
