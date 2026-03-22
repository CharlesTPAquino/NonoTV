import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, Play, Pause, Maximize, Minimize, Settings, Volume2, VolumeX, List, 
  ChevronRight, Activity, Clock, Wand2, LayoutGrid
} from 'lucide-react';
import { useHlsPlayer } from '../../hooks/useHlsPlayer';

export default function VideoPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAiSharpEnabled, setAiSharpEnabled] = useState(false);
  const [qualities, setQualities] = useState([]);
  const [activeQuality, setActiveQuality] = useState(-1);
  const [playTime, setPlayTime] = useState(0);

  const { 
    playerState, 
    togglePlay, 
    changeQuality 
  } = useHlsPlayer(channel.url, videoRef, {
    autoPlay: true,
    onError: (err) => console.error("[VideoPlayer] Erro fatal:", err),
    onQualitiesFound: (levs) => setQualities(levs)
  });

  const { playing, buffering, error } = playerState;

  // Auto-hide controls logic
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (playing) setPlayTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [playing]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
  };

  const handleMouseMove = () => setShowControls(true);

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0F1115] flex items-center justify-center p-6 sm:p-10 font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl w-full relative">
          <div className="bg-red-500/10 border-l-4 border-red-500 p-8 rounded-2xl backdrop-blur-xl cinematic-shadow animate-in slide-in-from-left duration-500">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                <X size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Falha de Transmissão</h2>
                <p className="text-white/60 text-lg leading-relaxed font-bold tracking-tight">O sinal deste canal não pôde ser validado no momento. Verifique sua conexão ou tente outro canal.</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={onClose} className="px-10 py-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl font-black transition-all uppercase tracking-widest text-xs">Menu Principal</button>
                  <button onClick={() => window.location.reload()} className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all uppercase tracking-widest text-xs shadow-xl shadow-red-500/20">Tentar Novamente</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-4 rounded-full bg-white/10 border border-white/20 text-white hover:bg-red-500/30 hover:border-red-500 transition-all outline-none focus:ring-4 focus:ring-red-500"
                  aria-label="Fechar"
                  title="Fechar"
                >
          <X size={28} />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-sans group ${isSidebarOpen ? 'sidebar-open' : ''}`}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className={`relative w-full h-full transition-all duration-700 ${isSidebarOpen ? 'translate-x-[-15%] scale-[0.8]' : ''} ${isAiSharpEnabled ? 'contrast-[1.05] saturate-[1.1]' : ''}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
          autoPlay
          crossOrigin='anonymous'
        />

        {buffering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-white/10 border-t-[#F7941D] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-4 h-4 rounded-full bg-[#F7941D] animate-ping" />
              </div>
            </div>
            <p className="mt-8 text-white font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Sincronizando Sinal</p>
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 z-50 p-6 md:p-10 transition-all duration-700 ${showControls || !playing ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6 animate-in slide-in-from-left duration-500">
               <div className="w-1.5 h-10 bg-[#F7941D] rounded-full shadow-[0_0_20px_#F7941D]" />
               <div>
                  <h2 className="text-white font-black text-2xl md:text-4xl tracking-tighter uppercase leading-none mb-2">
                    {channel?.name} 
                    {isAiSharpEnabled && <span className="ml-4 text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded-md tracking-widest align-middle">AI SHARP</span>}
                  </h2>
                  <div className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Activity size={12} className="text-green-500" /> Sinal Estável</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {formatTime(playTime)}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{channel?.group}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${isSidebarOpen ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                  title="Canais"
                  aria-label="Canais"
               >
                 <List size={22} />
               </button>
               <button 
                  onClick={onClose}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-red-500 hover:border-red-500 transition-all duration-500 group/close shadow-2xl"
                  title="Fechar"
                  aria-label="Fechar"
               >
                 <X size={22} className="group-hover:rotate-90 transition-transform duration-500" />
               </button>
            </div>
          </div>

          <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 md:p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group/bar">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/bar:animate-shimmer pointer-events-none" />

            <div className="flex items-center gap-6">
              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-[24px] bg-white text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all duration-300 shadow-xl"
              >
                {playing ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
              </button>

              <div className="h-10 w-px bg-white/10 mx-2" />

              <div className="flex flex-col gap-1.5 min-w-[120px]">
                <div className="flex justify-between items-center text-[9px] font-black text-white/30 uppercase tracking-widest">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (videoRef.current) videoRef.current.volume = val;
                  }}
                  className="w-32 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#F7941D]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded-2xl">
                <button 
                  onClick={() => setAiSharpEnabled(!isAiSharpEnabled)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAiSharpEnabled ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-white/40 hover:text-white'}`}
                >
                  <Wand2 size={14} /> <span>AI Sharp 4K</span>
                </button>
                
                <div className="w-px h-6 bg-white/10" />

                <div className="flex items-center gap-2 px-4">
                  <LayoutGrid size={14} className="text-white/40" />
                  <select 
                    value={activeQuality}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setActiveQuality(idx);
                      changeQuality(idx);
                    }}
                    className="bg-transparent text-white font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
                  >
                    <option value="-1" className="bg-[#121212]">Auto Resolution</option>
                    {qualities?.map((q, i) => (
                      <option key={i} value={i} className="bg-[#121212]">{q.height}p Qualidade</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                    <Maximize size={18} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`absolute top-0 right-0 h-full w-[320px] bg-[#0F1115]/95 backdrop-blur-3xl border-l border-white/5 z-[100] transition-all duration-700 ease-in-out p-8 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tighter">Canais</h3>
            <p className="text-[#F7941D] text-[9px] font-black uppercase tracking-widest mt-1">Sintonização Direta</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white hover:text-black transition-all">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {channels?.slice(0, 50).map((ch, idx) => (
            <button 
              key={ch.id} 
              onClick={() => {
                // Aqui você pode disparar a troca de canal se desejar
              }}
              className={`w-full group p-4 rounded-2xl border flex items-center gap-4 transition-all duration-500 ${ch.id === channel?.id ? 'bg-[#F7941D] border-[#F7941D] text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                {idx + 1}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] font-black uppercase tracking-tight truncate">{ch.name}</p>
                <p className={`text-[8px] font-black uppercase tracking-widest group-hover:text-white/60 ${ch.id === channel?.id ? 'text-white/80' : 'text-white/30'}`}>{ch.group}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
           <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Buffer Dinâmico Ativado</p>
           </div>
        </div>
      </div>
    </div>
  );
}
