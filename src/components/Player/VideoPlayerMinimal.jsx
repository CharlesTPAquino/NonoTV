import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Settings, Maximize2,
  ChevronLeft, ChevronRight, Tv, Sparkles, Activity,
  List, Info, ShieldCheck, Zap
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

export default function VideoPlayer({ channel, channels, onClose, mode = 'smart' }) {
  const videoRef = useRef(null);
  const { playChannel } = usePlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('playerVolume') || '1'));
  const [qualities, setQualities] = useState([]);
  const [activeQuality, setActiveQuality] = useState(-1);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const hideTimerRef = useRef(null);

  const { 
    playerState, 
    togglePlay, 
    changeQuality
  } = useHlsPlayer(channel?.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: (levs) => setQualities(levs)
  });

  const { playing, buffering, error, status, codecInfo, stats } = playerState;

  // Auto-hide controls
  const resetTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing && !showChannelList && !showSettings) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 5000);
    }
  }, [playing, showChannelList, showSettings]);

  useEffect(() => {
    resetTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [resetTimer]);

  // Volume persistent
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
    localStorage.setItem('playerVolume', volume.toString());
  }, [volume]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      resetTimer();
      switch(e.key) {
        case ' ': togglePlay(); break;
        case 'ArrowUp': setVolume(prev => Math.min(1, prev + 0.1)); break;
        case 'ArrowDown': setVolume(prev => Math.max(0, prev - 0.1)); break;
        case 'ArrowLeft': handlePrev(); break;
        case 'ArrowRight': handleNext(); break;
        case 'Escape': onClose(); break;
        case 'Enter': setShowChannelList(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetTimer, togglePlay, onClose]);

  const handleNext = () => {
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i < channels.length - 1) playChannel(channels[i + 1]);
  };

  const handlePrev = () => {
    const i = channels.findIndex(c => c.id === channel?.id);
    if (i > 0) playChannel(channels[i - 1]);
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0A0B0D] flex items-center justify-center p-10 animate-in fade-in duration-500">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <Activity size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Sinal Interrompido</h2>
          <p className="text-white/40 font-medium mb-10 leading-relaxed">
            O fluxo de dados foi cortado pelo servidor. <br/>
            Tente outro canal ou aguarde a estabilização.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => window.location.reload()} className="py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all">
              Reiniciar App
            </button>
            <button onClick={onClose} className="py-4 bg-[#F7941D] text-black font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all shadow-[0_10px_30px_rgba(247,148,29,0.3)]">
              Sair do Player
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-none"
      onMouseMove={resetTimer}
      onClick={resetTimer}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
      />

      {/* Ambient Glow Wrapper */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />

      {/* Buffering State - Agora mais sutil e só aparece se o vídeo estiver REALMENTE parado */}
      {(buffering || status === 'loading') && videoRef.current?.paused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm transition-all z-30">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[4px] border-[#F7941D]/10 rounded-full" />
            <div className="absolute inset-0 border-[4px] border-t-[#F7941D] rounded-full animate-spin shadow-[0_0_20px_#F7941D]" />
          </div>
          <span className="mt-4 text-[#F7941D] font-black uppercase tracking-[0.4em] text-[9px] animate-pulse">Sintonizando...</span>
        </div>
      )}

      {/* Top Bar - Header Area */}
      <div className={`absolute top-0 left-0 right-0 p-8 md:p-12 flex items-start justify-between transition-all duration-700 ease-out z-40 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose} 
            className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-[#F7941D] hover:text-black transition-all group active:scale-90"
          >
            <X size={22} className="group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="flex flex-col drop-shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                AO VIVO
              </span>
            </div>
            <h2 className="text-white font-black text-2xl md:text-3xl tracking-tighter">{channel?.name}</h2>
          </div>
        </div>
      </div>

      {/* Main Controls Overlay */}
      <div className={`absolute inset-0 flex items-center justify-center z-40 transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-8 md:gap-20">
           <button onClick={handlePrev} className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-75">
             <ChevronLeft size={28} />
           </button>

           <button 
             onClick={(e) => { e.stopPropagation(); togglePlay(); }}
             className="relative group active:scale-90 transition-transform"
           >
             <div className="absolute inset-0 bg-[#F7941D] rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity" />
             <div className="relative w-24 h-24 rounded-full bg-[#F7941D] flex items-center justify-center shadow-[0_15px_45px_rgba(247,148,29,0.3)] border-2 border-white/20">
               {playing ? (
                 <Pause size={36} className="text-black" fill="currentColor" />
               ) : (
                 <Play size={36} className="text-black ml-1.5" fill="currentColor" />
               )}
             </div>
           </button>

           <button onClick={handleNext} className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-75">
             <ChevronRight size={28} />
           </button>
        </div>
      </div>

      {/* Bottom Bar Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col gap-6 transition-all duration-700 ease-out z-40 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        
        {/* Progress Info (Live) */}
        <div className="w-full flex items-center gap-4">
           <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#F7941D] w-full animate-pulse shadow-[0_0_10px_#F7941D]" />
           </div>
           <span className="text-white/20 font-mono text-[10px] uppercase font-black tracking-widest">Estável 60FPS</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Volume Control */}
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl group transition-all">
              <button onClick={() => setVolume(v => v === 0 ? 1 : 0)} className="text-white/60 hover:text-white transition-colors">
                {volume === 0 ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))} 
                className="w-24 md:w-40 h-1.5 accent-[#F7941D] bg-white/10 rounded-full appearance-none cursor-pointer" 
              />
            </div>

            <div className="hidden lg:flex items-center gap-3">
               <div className="h-10 w-[1px] bg-white/10 mx-2" />
               <div className="flex flex-col">
                  <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">Conexão Atual</span>
                  <span className="text-white/60 text-[10px] font-bold">185.66.90.170 (Encrypted)</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {qualities.length > 0 && (
              <div className="relative group">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all ${showSettings ? 'bg-[#F7941D] text-black border-[#F7941D]' : ''}`}
                >
                  <Settings size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {activeQuality === -1 ? 'Auto' : `${qualities[activeQuality].height}p`}
                  </span>
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 w-48 shadow-2xl animate-in zoom-in-95 duration-200">
                     <p className="px-4 py-2 text-white/30 text-[9px] font-black uppercase tracking-widest border-b border-white/5 mb-1">Qualidade de Vídeo</p>
                     <button 
                       onClick={() => { setActiveQuality(-1); changeQuality(-1); setShowSettings(false); }}
                       className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeQuality === -1 ? 'bg-[#F7941D] text-black' : 'text-white hover:bg-white/5'}`}
                     >
                       Automático
                     </button>
                     {qualities.map((q, i) => (
                       <button 
                        key={i} 
                        onClick={() => { setActiveQuality(i); changeQuality(i); setShowSettings(false); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeQuality === i ? 'bg-[#F7941D] text-black' : 'text-white hover:bg-white/5'}`}
                      >
                        {q.height}p • {(q.bitrate / 1000000).toFixed(1)} Mbps
                      </button>
                     ))}
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen?.(); }} 
              className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
            >
              <Maximize2 size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Channel List Overlay */}
      <div className={`fixed inset-y-0 right-0 w-[400px] bg-black/95 backdrop-blur-3xl border-l border-white/10 z-[150] transition-all duration-700 ease-out shadow-[-50px_0_100px_rgba(0,0,0,0.8)] ${showChannelList ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-full flex flex-col p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-white tracking-widest uppercase">Canais</h3>
               <button onClick={() => setShowChannelList(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white">
                 <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-2">
               {channels.map((ch) => (
                 <button 
                    key={ch.id} 
                    onClick={() => { playChannel(ch); setShowChannelList(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${ch.id === channel?.id ? 'bg-[#F7941D] text-black shadow-[0_10px_30px_rgba(247,148,29,0.3)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                 >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ch.id === channel?.id ? 'bg-black/20' : 'bg-white/10'}`}>
                       <Tv size={18} />
                    </div>
                    <div className="flex-1 text-left">
                       <p className="text-sm font-black truncate uppercase">{ch.name}</p>
                       <p className={`text-[9px] font-bold ${ch.id === channel?.id ? 'text-black/60' : 'text-white/20'}`}>{ch.group || 'Geral'}</p>
                    </div>
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
