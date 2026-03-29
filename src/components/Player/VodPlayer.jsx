import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  List,
  AlertTriangle,
} from 'lucide-react';
import Hls from 'hls.js';

const VOD_CONFIG = {
  bufferTime: 30,
  seekStep: 10,
  controlsTimeout: 5000,
  loadTimeout: 15000,
};

function detectStreamType(url) {
  if (!url) return 'hls';
  const path = url.toLowerCase().split('?')[0];
  
  const hlsPatterns = [
    '.m3u8', 'get.php', 'live/', 'playlist', 
    'stream', 'mpegts', '/hls/', '/live/'
  ];
  
  const videoPatterns = [
    '.mp4', '.mkv', '.webm', '.avi', '.mov',
    '.m4v', '.3gp', '.ts', '.m2ts'
  ];
  
  for (const pattern of hlsPatterns) {
    if (path.includes(pattern)) return 'hls';
  }
  
  for (const pattern of videoPatterns) {
    if (path.includes(pattern)) return 'video';
  }
  
  return 'hls';
}

/**
 * NonoTV VOD Player - Specialized for MP4/MKV
 * Direct playback without HLS.js - native browser support
 */
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [hasAttemptedPlay, setHasAttemptedPlay] = useState(false);

  const controlsTimerRef = useRef(null);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(
        () => setShowControls(false),
        VOD_CONFIG.controlsTimeout
      );
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsBuffering(true);
      setError(null);
    };
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration || 0);
    const handleWaiting = () => setIsBuffering(true);
    const handleError = () => {
      console.error('[VodPlayer] Error event:', video.error);
      setError('Vídeo não disponível ou formato não suportado');
      setIsBuffering(false);
    };
    const handleStalled = () => setIsBuffering(true);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(e => {
        console.error('[VodPlayer] Play error:', e);
        setError('Não foi possível reproduzir');
      });
    } else {
      video.pause();
    }
  }, []);

  const changeChannel = useCallback(newChannel => {
    const video = videoRef.current;
    if (!video || !newChannel) return;

    setError(null);
    setIsBuffering(true);
    setHasAttemptedPlay(false);

    const streamType = detectStreamType(newChannel.url);

    if (streamType === 'hls') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          backBufferLength: 30
        });
        hls.loadSource(newChannel.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setIsBuffering(false);
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError('Erro ao carregar HLS');
          }
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = newChannel.url;
        video.load();
      }
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = newChannel.url;
      video.load();
    }
  }, []);

  const seek = useCallback(
    seconds => {
      const video = videoRef.current;
      if (!video || !duration) return;
      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    },
    [duration]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback(e => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const formatTime = seconds => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKey = e => {
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
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-3xl font-black text-content-primary uppercase tracking-tighter mb-4">
            Erro de Reprodução
          </h2>
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
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-display transition-all duration-700 ${isSidebarOpen ? 'md:pr-[360px]' : ''}`}
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

      {/* Overlay Cinemático de Gradiente */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />
      </div>

      {/* Buffering Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-20">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-[6px] border-white/5 rounded-full" />
            <div className="absolute inset-0 border-[6px] border-t-primary rounded-full animate-spin shadow-glow-sm" />
          </div>
          <p className="mt-10 text-primary font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">
            Sincronizando Conteúdo Premium
          </p>
        </div>
      )}

      {/* Top Controls (Header) */}
      <div
        className={`absolute top-0 left-0 right-0 p-8 md:p-12 transition-all duration-700 z-50 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-2 h-14 bg-primary rounded-full shadow-glow-sm" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary font-black text-[10px] tracking-widest uppercase">
                  {channel?.type === 'movie' ? 'Filme' : 'Série'}
                </span>
                <h2 className="text-white font-black text-3xl md:text-5xl tracking-tighter uppercase leading-none">
                  {channel?.name}
                </h2>
              </div>
              <div className="flex items-center gap-4 text-content-muted text-[10px] font-black uppercase tracking-[0.3em] pl-1">
                <span>{channel?.group}</span>
                <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 border focus-ring ${isSidebarOpen ? 'bg-primary border-primary text-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white hover:text-black'}`}
              aria-label="Abrir Biblioteca"
            >
              <List size={24} />
            </button>
            <button
              aria-label="Fechar"
              onClick={onClose}
              className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-state-error hover:border-state-error hover:text-white transition-all duration-500 group focus-ring"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls (Footer) */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 transition-all duration-700 z-50 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Barra de Progresso Customizada */}
          <div className="mb-10 group px-2">
            <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-content-muted">
              <span>{formatTime(currentTime)}</span>
              <span className="flex items-center gap-2">
                HD / 4K • {channel?.type === 'movie' ? 'VOD' : 'EPISÓDIO'}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group-hover:h-3 transition-all duration-300">
              <div className="absolute inset-0 bg-white/5" style={{ width: '100%' }} />
              <div
                className="absolute inset-y-0 left-0 bg-primary shadow-glow-sm transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={e => {
                  const video = videoRef.current;
                  if (video) video.currentTime = parseFloat(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-end justify-between">
            {/* Esquerda: Volume Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all duration-500 focus-ring"
                aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <div className="hidden md:block w-32 group">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Centro: Main Playback Controls */}
            <div className="flex items-center gap-10">
              <button
                onClick={() => seek(-VOD_CONFIG.seekStep)}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-95 duration-300 focus-ring"
                aria-label={`Voltar ${VOD_CONFIG.seekStep} segundos`}
              >
                <div className="flex flex-col items-center">
                  <SkipBack size={32} />
                  <span className="text-[8px] font-black mt-1 opacity-40">
                    {VOD_CONFIG.seekStep}
                  </span>
                </div>
              </button>

              <button
                onClick={togglePlay}
                className="w-24 h-24 rounded-[40px] bg-white text-black flex items-center justify-center shadow-elevation-2xl hover:scale-105 active:scale-90 transition-all duration-500 focus-ring"
                aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause size={42} fill="currentColor" />
                ) : (
                  <Play size={42} fill="currentColor" className="ml-1.5" />
                )}
              </button>

              <button
                onClick={() => seek(VOD_CONFIG.seekStep)}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-95 duration-300 focus-ring"
                aria-label={`Avançar ${VOD_CONFIG.seekStep} segundos`}
              >
                <div className="flex flex-col items-center">
                  <SkipForward size={32} />
                  <span className="text-[8px] font-black mt-1 opacity-40">
                    {VOD_CONFIG.seekStep}
                  </span>
                </div>
              </button>
            </div>

            {/* Direita: Fullscreen / Settings */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all duration-500 focus-ring"
                aria-label="Tela cheia"
              >
                <Maximize size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Sidebar Premium (Biblioteca) */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] bg-bg-tertiary/95 backdrop-blur-3xl border-l border-white/5 z-[150] transition-all duration-700 flex flex-col shadow-elevation-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-10 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter">
              Biblioteca
            </h3>
            <button
              aria-label="Fechar"
              onClick={() => setSidebarOpen(false)}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-content-muted hover:bg-white hover:text-black transition-colors focus-ring"
            >
              <X size={22} />
            </button>
          </div>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            Sintonização Digital • VOD
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar pb-10">
          {channels
            ?.filter(c => c.type === 'movie' || c.type === 'series')
            .map(ch => (
              <button
                key={ch.id}
                onClick={() => changeChannel(ch)}
                className={`w-full group p-5 rounded-[32px] border flex items-center gap-5 transition-all duration-500 focus-ring ${ch.id === channel?.id ? 'bg-primary border-primary text-white shadow-glow-md scale-[1.02]' : 'bg-white/[0.03] border-white/5 hover:bg-white/10 hover:border-white/10'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-[11px] font-black group-hover:scale-110 transition-transform">
                  {ch.type === 'movie' ? '🎬' : '📺'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-black uppercase tracking-tight truncate group-hover:tracking-normal transition-all">
                    {ch.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${ch.id === channel?.id ? 'text-white/70' : 'text-content-muted'}`}
                    >
                      {ch.group}
                    </span>
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 rounded ${ch.type === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
                    >
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
