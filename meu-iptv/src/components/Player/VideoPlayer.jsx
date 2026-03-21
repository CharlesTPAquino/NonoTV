import React, { useEffect, useRef, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { X, Play, Pause, Maximize, Activity, Sparkles, Zap, Film, Tv } from 'lucide-react';

const PlayerMemory = {
    failedHlsDomains: new Set(),
    preferredMode: new Map(), 
};

export default function VideoPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(channel);
  const [attempt, setAttempt] = useState(0);
  const [aiStatus, setAiStatus] = useState("AI: Iniciando Engine...");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const fallbackList = useRef([]);

  const isVOD = useMemo(() => {
    const g = (currentChannel?.group || '').toUpperCase();
    return g.includes('FILME') || g.includes('SERIE') || g.includes('VOD');
  }, [currentChannel]);

  const predictBestPlayer = (url) => {
    try {
        const domain = new URL(url).hostname;
        if (PlayerMemory.preferredMode.has(domain)) return PlayerMemory.preferredMode.get(domain);
        if (url.includes('get.php') || url.includes('movie/') || url.includes('series/')) return 'native';
        if (url.endsWith('.mp4') || url.endsWith('.mkv')) return 'native';
        return 'hls';
    } catch (e) { return 'hls'; }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await containerRef.current.requestFullscreen();
    else await document.exitFullscreen();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentChannel) return;

    setLoading(true);
    setError(null);
    setAiStatus("AI: Otimizando fluxo de dados...");
    
    const url = currentChannel.url.trim();
    const domain = new URL(url).hostname;
    const mode = predictBestPlayer(url);

    // Monitoramento de Eventos Nativo para Loading Preciso
    const onPlaying = () => { setLoading(false); setError(null); };
    const onWaiting = () => { setLoading(true); setAiStatus("AI: Aguardando sinal do servidor..."); };
    const onError = (e) => { 
        console.error("Erro no elemento video:", e);
        if (hlsRef.current) return; // Se for erro de HLS, deixa o HLS tratar
        tryNextRoute(); 
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('error', onError);

    const tryNextRoute = () => {
        if (attempt < fallbackList.current.length) {
            setAiStatus(`AI: Tentando Rota Alternativa ${attempt + 1}...`);
            setCurrentChannel(fallbackList.current[attempt]);
            setAttempt(prev => prev + 1);
        } else {
            setError("Instabilidade crítica no servidor deste conteúdo.");
            setLoading(false);
        }
    };

    const startNative = () => {
        setAiStatus("AI: Ativando Transmissora Nativa...");
        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
        video.src = url;
        video.load();
        video.play().catch(tryNextRoute);
    };

    const startHls = () => {
        if (!Hls.isSupported()) { startNative(); return; }
        
        setAiStatus("AI: Sincronizando fragmentos Hls...");
        const hls = new Hls({ 
            maxBufferLength: isVOD ? 30 : 15, 
            enableWorker: true,
            manifestLoadingTimeOut: 5000,
            fragLoadingTimeOut: 15000,
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(startNative);
        });

        hls.on(Hls.Events.FRAG_CHANGED, () => {
            setLoading(false);
            if (isVOD) hls.config.maxBufferLength = 120;
        });

        hls.on(Hls.Events.ERROR, (e, data) => {
            if (data.fatal) {
                console.warn("AI: Erro fatal Hls. Tentando reparo nativo.");
                startNative();
            }
        });
    };

    if (mode === 'native') startNative();
    else startHls();

    return () => {
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('error', onError);
        if (hlsRef.current) hlsRef.current.destroy();
        video.removeAttribute('src');
        video.load();
    };
  }, [currentChannel, attempt, isVOD]);

  const togglePlay = () => {
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current.pause(); setIsPlaying(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-0 md:p-4 backdrop-blur-3xl animate-in fade-in duration-500">
      <div ref={containerRef} className={isFullscreen ? "w-full h-full bg-black relative group" : "w-full max-w-7xl aspect-video bg-black rounded-none md:rounded-[48px] overflow-hidden relative group border border-white/5 shadow-2xl"}>
        
        {/* UI Overlay */}
        <div className="absolute top-0 w-full p-8 flex justify-between items-start z-50 bg-gradient-to-b from-black/95 to-transparent opacity-0 group-hover:opacity-100 transition-all">
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-[24px] flex items-center justify-center text-3xl border border-white/10 shadow-2xl overflow-hidden relative group/logo">
                <div className="absolute inset-0 bg-[#6366F1]/20 animate-pulse" />
                {currentChannel.logo ? <img src={currentChannel.logo} className="h-10 relative z-10" alt=""/> : currentChannel.emoji}
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{currentChannel.name}</h3>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1 bg-[#6366F1]/20 border border-[#6366F1]/50 rounded-full">
                    <Sparkles size={12} className="text-[#6366F1]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">AI Engine Active</span>
                 </div>
                 <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Rota {attempt + 1}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all hover:scale-110"><X size={32} className="text-white"/></button>
        </div>

        <video ref={videoRef} onClick={togglePlay} className="w-full h-full object-contain" crossOrigin="anonymous" />

        {/* AI Loading Screen - MONITORADO POR PLAYER EVENTS */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black animate-in fade-in duration-300">
            <div className="absolute inset-0 opacity-30 blur-[150px] bg-[#6366F1]/30 animate-pulse" />
            <div className="relative flex flex-col items-center gap-10">
                <div className="relative">
                    <div className="w-32 h-32 border-2 border-[#6366F1]/10 rounded-full animate-ping duration-[3s]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 border-[4px] border-t-[#6366F1] border-white/5 rounded-full animate-spin duration-[1.5s]" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                         <Zap size={24} className="text-[#6366F1] animate-bounce" />
                    </div>
                </div>
                <div className="text-center space-y-3">
                    <p className="text-[#6366F1] font-black text-xs uppercase tracking-[0.5em] animate-pulse">{aiStatus}</p>
                    <p className="text-gray-600 text-[9px] uppercase font-bold tracking-[0.3em]">Otimizando Rota Digital {attempt + 1}</p>
                </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-8 text-center z-50">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6">
                <Activity size={32} className="text-red-500 animate-bounce" />
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Ops! Falha na Rota</h4>
            <p className="text-gray-400 max-w-xs text-sm mb-8 leading-relaxed">{error}</p>
            <button onClick={onClose} className="px-10 py-4 bg-[#6366F1] hover:bg-[#4f46e5] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">Tentar outro conteúdo</button>
          </div>
        )}

        {/* Minimal Controls */}
        <div className="absolute bottom-0 w-full p-10 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center gap-10 z-50">
          <button onClick={togglePlay} className="text-white hover:text-[#6366F1] transition-all transform hover:scale-110">
            {isPlaying ? <Pause size={48} fill="currentColor"/> : <Play size={48} fill="currentColor"/>}
          </button>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            <span className="text-white font-black text-[10px] tracking-[0.3em] uppercase">{isVOD ? 'Cinema VOD' : 'Ao Vivo'}</span>
          </div>
          <div className="flex-1" />
          <button onClick={toggleFullscreen} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all transform hover:rotate-12"><Maximize size={28}/></button>
        </div>
      </div>
    </div>
  );
}
