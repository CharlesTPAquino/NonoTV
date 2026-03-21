import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Play, Pause, Volume2, Maximize, Activity } from 'lucide-react';

export default function VideoPlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentChannel, setCurrentChannel] = useState(channel);
  const fallbackList = useRef([]);
  const [attempt, setAttempt] = useState(0);

  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    // Ao abrir o player, encontra canais similares para usar como fallback
    if (channels && channel) {
      const similar = channels.filter(c => 
        c.name.includes(channel.name.split(' ')[0]) && c.id !== channel.id
      ).slice(0, 5); // Tenta até 5 alternativas
      fallbackList.current = similar;
    }
  }, [channel, channels]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentChannel) return;

    setLoading(true);
    setError(null);

    const tryFallback = () => {
      if (attempt < fallbackList.current.length) {
        setLoading(true);
        setTimeout(() => {
          setCurrentChannel(fallbackList.current[attempt]);
          setAttempt(prev => prev + 1);
        }, 500);
      } else {
        setError('Todos os servidores alternativos (rotas) foram esgotados para este canal.');
        setLoading(false);
      }
    };

    // Exportar a função para que o botão manual possa ativá-la
    window.manualFallback = tryFallback;

    if (Hls.isSupported()) {
      // Deixando o HLS nativo tentar infinitamente sem amarras de regras e timeouts. 
      // Ele tem a engenharia ideal natural para se recuperar de quedas do Cloudflare.
      const hls = new Hls({ maxBufferLength: 60 });
      hlsRef.current = hls;
      hls.loadSource(currentChannel.url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
        setLoading(false);
        setError(null);
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        // Filtro Inteligente de Recuperação Baseado no HLS: 
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Erro de rede (CORS ou IP lento), tenta reconectar silenciosamente ao invés de matar.
              console.log("Queda de rede da frag local... tentando recuperar em vez de matar o canal.");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Erros de mídia, a rede esta fluindo mas o decodificador da TV perdeu o sincronismo.
              console.log("Erro de midia... resetando o buffer HLS.");
              hls.recoverMediaError();
              break;
            default:
              // Erro extremo corrompido, não tem mais salvação.
              hls.destroy();
              setError("Sinal de IPTV Encerrado ou Bloqueado pelo Provedor.");
              setLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentChannel.url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [currentChannel, attempt]);

  const triggerManualFallback = () => {
    if (window.manualFallback) window.manualFallback();
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
      <div 
        ref={containerRef}
        className={isFullscreen 
          ? "w-full h-full bg-black relative group" 
          : "w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden relative group border border-white/10 shadow-2xl"}
      >
        <div className="absolute top-0 w-full p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">{currentChannel.emoji}</div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{currentChannel.name} {attempt > 0 && <span className="text-yellow-400 text-sm">(Rota {attempt})</span>}</h3>
                {attempt < fallbackList.current.length && (
                  <button onClick={triggerManualFallback} className="text-xs bg-[#b6a0ff]/20 text-[#b6a0ff] border border-[#b6a0ff]/50 px-2 py-1 rounded-md hover:bg-[#b6a0ff]/40 transition-colors">
                    Trocar Rota (Link {attempt + 1}/{fallbackList.current.length})
                  </button>
                )}
              </div>
              <p className="text-[#adaaac] text-xs font-bold uppercase tracking-widest mt-1">{currentChannel.group}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={24}/></button>
        </div>

        <video ref={videoRef} onClick={togglePlay} className="w-full h-full object-contain" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-12 h-12 border-4 border-[#b6a0ff]/20 border-t-[#b6a0ff] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8 text-center">
            <Activity size={48} className="text-red-500 mb-4 animate-pulse" />
            <h4 className="text-xl font-bold mb-2">Atenção</h4>
            <p className="text-gray-400 max-w-xs">{error}</p>
            {attempt >= fallbackList.current.length && (
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                Fechar Player
              </button>
            )}
          </div>
        )}

        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-6">
          <button onClick={togglePlay} className="text-white hover:text-[#b6a0ff] transition-colors">
            {isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor"/>}
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-red-500 font-bold text-xs tracking-widest uppercase">Ao Vivo</span>
          </div>

          <div className="flex-1" />
          
          <button onClick={toggleFullscreen} className="text-white hover:text-[#b6a0ff] transition-colors">
            <Maximize size={24}/>
          </button>
        </div>
      </div>
    </div>
  );
}
