import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Settings, Volume2, VolumeX, List, 
  Activity, Clock, Wand2, ChevronUp, ChevronDown, Check,
  Languages, Type, Heart, RotateCcw, Tv, Info, Maximize2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';
import { formatTime as formatEPGTime, formatDuration } from '../../services/EPGService';
import EPGOverlay from './EPGOverlay';

export default function VideoPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const { playChannel, currentProgram, nextProgram, epgData } = usePlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAiSharpEnabled, setAiSharpEnabled] = useState(true);
  const [qualities, setQualities] = useState([]);
  const [activeQuality, setActiveQuality] = useState(-1);
  const [playTime, setPlayTime] = useState(0);
  const [showEPG, setShowEPG] = useState(false);

  const { 
    playerState, 
    togglePlay, 
    changeQuality, 
    changeAudio, 
    changeSubtitle 
  } = useHlsPlayer(channel.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: (levs) => setQualities(levs)
  });

  const { 
    playing, buffering, error, status, 
    audioTracks, subtitles, activeAudio, activeSubtitle 
  } = playerState;

  // Auto-hide controls
  useEffect(() => {
    if (!showControls || !playing) return;
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, [showControls, playing]);

  // Track playtime
  useEffect(() => {
    const timer = setInterval(() => { if (playing) setPlayTime(p => p + 1); }, 1000);
    return () => clearInterval(timer);
  }, [playing]);

  // TV Remote & Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      setShowControls(true);
      const currentIndex = channels.findIndex(ch => ch.id === channel.id);
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) playChannel(channels[currentIndex - 1]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < channels.length - 1) playChannel(channels[currentIndex + 1]);
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
        default: break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [channel, channels, playChannel, togglePlay, onClose]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' + sec : sec}`;
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0A0B0D] flex items-center justify-center p-10 font-outfit">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <X size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Sinal Interrompido</h2>
          <p className="text-white/40 font-bold mb-10 leading-relaxed">O servidor IPTV não está respondendo. Tente novamente em instantes ou mude de canal.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-transform">Reconectar Agora</button>
            <button aria-label="Fechar" onClick={onClose} className="w-full py-4 bg-white/5 border border-white/10 text-white/50 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-white/10">Voltar ao Menu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-outfit transition-all duration-500 ${isSidebarOpen ? 'pr-[320px]' : ''}`}
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Black Background / AI Sharp Layer */}
      <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${isAiSharpEnabled ? 'brightness-[1.05] contrast-[1.1] saturate-[1.1] blur-[0.2px]' : ''}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain pointer-events-none"
          playsInline
          autoPlay
          crossOrigin='anonymous'
        />
        
        {/* Buffering Overlay */}
        {(buffering || status === 'loading' || status === 'retrying') && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-[#F7941D] rounded-full animate-spin shadow-[0_0_20px_#F7941D]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-[#F7941D] rounded-full animate-pulse" />
              </div>
            </div>
            <p className="mt-8 text-[#F7941D] font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Sintonizando Canal</p>
          </div>
        )}
      </div>

      {/* --- Top Controls --- */}
      <div className={`absolute top-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-b from-black/80 to-transparent transition-all duration-700 z-50 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-2 h-14 bg-[#F7941D] rounded-full shadow-[0_0_25px_#F7941D]" />
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <span className="text-[#F7941D] font-black text-sm tracking-widest bg-[#F7941D]/10 px-2 py-0.5 rounded border border-[#F7941D]/20">AO VIVO</span>
                    <h2 className="text-white font-black text-3xl md:text-5xl tracking-tighter uppercase leading-none">
                      {channel?.name}
                    </h2>
                 </div>
                 <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> Sinal Estável</span>
                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                    <span className="flex items-center gap-2"><Clock size={14} /> {formatTime(playTime)}</span>
                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                    <span className="text-white/50">{channel?.group}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className={`group w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 border ${isSidebarOpen ? 'bg-[#F7941D] border-[#F7941D] text-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white hover:text-black overflow-hidden'}`}
              >
                <List size={24} />
              </button>
              <button 
                aria-label="Fechar"
                onClick={onClose}
                className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-500 group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
           </div>
        </div>
      </div>

      {/* --- EPG Info Bar (Imagem 8 style) --- */}
      <div className={`absolute bottom-32 left-0 right-0 px-8 md:px-12 transition-all duration-700 z-40 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="max-w-6xl mx-auto reflective-glass !rounded-2xl p-5">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Agora</span>
              </div>
              <h3 className="text-white font-black text-lg md:text-xl uppercase tracking-tight truncate">
                {currentProgram?.title || channel?.name || 'Sem Informação'}
              </h3>
              {currentProgram?.description && (
                <p className="text-white/40 text-xs mt-1 truncate">{currentProgram.description}</p>
              )}
            </div>
            
            <div className="hidden md:block w-px h-16 bg-white/10" />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Próximo</span>
              </div>
              <h3 className="text-white/60 font-black text-base md:text-lg uppercase tracking-tight truncate">
                {nextProgram?.title || 'Sem Programação'}
              </h3>
              {nextProgram && (
                <p className="text-white/30 text-xs mt-1">
                  {formatEPGTime(nextProgram.start)} - {formatEPGTime(nextProgram.stop)} • {formatDuration(nextProgram.start, nextProgram.stop)}
                </p>
              )}
            </div>

            <button 
              onClick={() => setShowEPG(!showEPG)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F7941D]/10 border border-[#F7941D]/30 rounded-xl text-[#F7941D] text-xs font-black uppercase tracking-wider hover:bg-[#F7941D]/20 transition-all"
            >
              <Tv size={16} />
              Guia
            </button>
          </div>
        </div>
      </div>

      {/* --- Bottom Controls (Imagem 3 style) --- */}
      <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-700 z-50 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-end justify-between">
          <div className="flex items-center gap-4">
            {/* Circular Control Buttons (Imagem 3 style) */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const idx = channels.findIndex(ch => ch.id === channel?.id);
                  if (idx > 0) playChannel(channels[idx - 1]);
                }}
                className="w-14 h-14 rounded-full reflective-glass flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button 
                className="w-16 h-16 rounded-full reflective-glass flex items-center justify-center text-white/80 hover:text-[#F7941D] hover:scale-110 transition-all"
              >
                <Heart size={20} />
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-14 h-14 rounded-full reflective-glass flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
              >
                <RotateCcw size={18} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                {playing ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={() => setShowEPG(!showEPG)}
                className="w-14 h-14 rounded-full reflective-glass flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
              >
                <Tv size={20} />
              </button>
              
              <button 
                className="w-14 h-14 rounded-full reflective-glass flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
              >
                <Info size={20} />
              </button>
              
              <button 
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="w-14 h-14 rounded-full reflective-glass flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
              >
                <Maximize2 size={18} />
              </button>

              <button 
                onClick={() => {
                  const idx = channels.findIndex(ch => ch.id === channel?.id);
                  if (idx < channels.length - 1) playChannel(channels[idx + 1]);
                }}
                className="w-14 h-14 rounded-full reflective-glass flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-3 group/volume">
              <div className="flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover/volume:text-white/60 transition-colors">
                 <span>Vol</span>
                 <span>{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                {volume === 0 ? <VolumeX size={16} className="text-red-500" /> : <Volume2 size={16} className="text-white/40" />}
                <input 
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#F7941D]"
                />
              </div>
            </div>

            {/* AI SHARP TOGGLE */}
            <button 
              onClick={() => setAiSharpEnabled(!isAiSharpEnabled)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-500 border ${isAiSharpEnabled ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/50'}`}
            >
              <Wand2 size={14} className={isAiSharpEnabled ? 'animate-pulse' : ''} />
              <span>AI</span>
            </button>

            {/* QUALITY */}
            <div className="relative group/quality">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/50 transition-all duration-500">
                <Settings size={14} className="text-white/30" />
                <select 
                  value={activeQuality}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setActiveQuality(idx);
                    changeQuality(idx);
                  }}
                  className="bg-transparent text-white font-black text-[10px] uppercase tracking-wider outline-none cursor-pointer appearance-none w-16"
                >
                  <option value="-1" className="bg-[#121212]">AUTO</option>
                  {qualities?.map((q, i) => (
                    <option key={i} value={i} className="bg-[#121212]">{q.height}p</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sidebar Channel List --- */}
      <div className={`fixed top-0 right-0 h-full w-[360px] bg-black/95 backdrop-blur-3xl border-l border-white/5 z-[150] transition-all duration-700 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-10 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Explorar</h3>
            <button aria-label="Fechar" onClick={() => setSidebarOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white hover:text-black">
               <ChevronDown size={22} className="-rotate-90" />
            </button>
          </div>
          <p className="text-[#F7941D] text-[10px] font-black uppercase tracking-[0.3em]">Canais Disponíveis</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3 custom-scrollbar">
          {channels?.map((ch, idx) => (
            <button 
              key={ch.id} 
              onClick={() => playChannel(ch)}
              className={`w-full group p-5 rounded-[24px] border flex items-center gap-5 transition-all duration-500 ${ch.id === channel?.id ? 'bg-[#F7941D] border-[#F7941D] text-white shadow-[0_15px_30px_rgba(247,148,29,0.3)] scale-[1.02]' : 'bg-white/[0.03] border-white/5 hover:bg-white/10 hover:border-white/10'}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-[11px] font-black group-hover:scale-110 transition-transform">
                {idx + 1}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-black uppercase tracking-tight truncate group-hover:tracking-normal transition-all">{ch.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${ch.id === channel?.id ? 'text-white/70' : 'text-white/20'}`}>{ch.group}</span>
                  {ch.id === channel?.id && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* EPG Overlay */}
      {showEPG && (
        <EPGOverlay 
          channel={channel}
          epgData={epgData}
          onClose={() => setShowEPG(false)}
          onPlayChannel={playChannel}
          allChannels={channels}
        />
      )}
    </div>
  );
}
