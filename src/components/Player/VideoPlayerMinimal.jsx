import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Settings, List, Tv
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

export default function VideoPlayer({ channel, channels, onClose, mode = 'smart' }) {
  const isVod = channel?.type === 'movie' || channel?.type === 'series';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const hideTimerRef = useRef(null);

  const { 
    playerState, 
    togglePlay,
    seekRelative
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
  // Controles somem após 2 segundos de inatividade
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  useEffect(() => {
    // Inicia timer de 2s quando o player abre
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Track video time for VOD
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration || 0);
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [videoRef.current]);

  // ─── VOLUME ───
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  const toggleMute = useCallback(() => setVolume(prev => prev === 0 ? 0.8 : 0), []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── FULLSCREEN ───
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // ─── CHANNEL NAV ───
  const handlePrev = useCallback(() => {
    if (!channels || !channel) return;
    const idx = channels.findIndex(c => c.id === channel.id);
    if (idx > 0) playChannel(channels[idx - 1]);
  }, [channels, channel, playChannel]);

  const handleNext = useCallback(() => {
    if (!channels || !channel) return;
    const idx = channels.findIndex(c => c.id === channel.id);
    if (idx < channels.length - 1) playChannel(channels[idx + 1]);
  }, [channels, channel, playChannel]);

  // ─── KEY HANDLER ───
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePrev, handleNext, togglePlay, toggleFullscreen, onClose]);

  const ch = channel;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      onClick={showControlsTemporarily}
      data-nav-zone="player"
    >
      {/* ─── TOP BAR ─── */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-50 transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChannelList(!showChannelList)}
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all focus:ring-2 focus:ring-white/50 ${
              showChannelList ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-label="Lista de canais"
          >
            <List size={20} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-white/50"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* ─── VIDEO ─── */}
      <div className="flex-1 relative">
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
            <div className="text-center p-6">
              <p className="text-red-500 font-bold mb-2">Erro ao carregar</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* AI Enhancement Overlay */}
        {aiStep !== 'initial' && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-mono z-30">
            AI {aiStep === 'analyzing' ? '🔍' : aiStep === 'upscaling' ? '⚡' : '✨'}
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={(e) => { e.stopPropagation(); showControlsTemporarily(); togglePlay(); }}
        />
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
          onClick={(e) => { e.stopPropagation(); showControlsTemporarily(); togglePlay(); }}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 shadow-lg"
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
        >
          {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
        </button>

        {/* Seek Controls - Only for VOD (Movies/Series) */}
        {isVod && (
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); showControlsTemporarily(); seekRelative(-10); }}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold"
              aria-label="Voltar 10s"
            >
              -10
            </button>
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2 py-1 text-white text-xs font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/50">/</span>
              <span className="text-white/70">{formatTime(duration)}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); showControlsTemporarily(); seekRelative(30); }}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold"
              aria-label="Avançar 30s"
            >
              +30
            </button>
          </div>
        )}

        {/* Volume */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2">
          <button 
            onClick={toggleMute}
            className="flex items-center justify-center text-white hover:text-white/80 transition-colors focus:ring-2 focus:ring-white/50 rounded-full p-1"
            aria-label={volume === 0 ? 'Ativar som' : 'Mudo'}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
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