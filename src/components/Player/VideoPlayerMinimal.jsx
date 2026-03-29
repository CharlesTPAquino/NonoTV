import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Settings, Maximize2,
  ChevronLeft, ChevronRight, Tv, Sparkles, Activity
} from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';

export default function VideoPlayer({ channel, channels, onClose, mode = 'smart' }) {
  const videoRef = useRef(null);
  const { playChannel } = usePlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [qualities, setQualities] = useState([]);
  const [activeQuality, setActiveQuality] = useState(-1);
  const [isMinimal, setIsMinimal] = useState(mode === 'minimal');
  const hideTimerRef = useRef(null);

  const { 
    playerState, 
    togglePlay, 
    changeQuality
  } = useHlsPlayer(channel.url, videoRef, {
    autoPlay: true,
    onQualitiesFound: (levs) => setQualities(levs)
  });

  const { playing, buffering, error, status, codecInfo } = playerState;

  useEffect(() => {
    if (!showControls || !playing) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls, playing]);

  const handleTap = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 4000);
  };

  const handleError = () => {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0A0B0D] flex items-center justify-center p-10">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase mb-4">Sinal Indisponível</h2>
          <p className="text-white/40 text-sm mb-8">Tente outro canal ou aguarde.</p>
          <button onClick={onClose} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-xs">
            Voltar
          </button>
        </div>
      </div>
    );
  };

  if (error) return handleError();

  const isSmart = !isMinimal;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={handleTap}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
      />

      {/* Buffering */}
      {(buffering || status === 'loading') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-t-[#F7941D] border-white/10 rounded-full animate-spin" />
        </div>
      )}

      {/* Top Bar - Minimal */}
      <div className={`absolute top-0 left-0 right-0 p-6 flex items-center justify-between transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white/20">
            <X size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#F7941D] text-[10px] font-bold uppercase tracking-wider">AO VIVO</span>
            </div>
            <h2 className="text-white font-black text-xl">{channel?.name}</h2>
          </div>
        </div>

        {isSmart && (
          <div className="flex items-center gap-2">
            {codecInfo && codecInfo[0] && (
              <span className="text-white/30 text-[10px] font-mono">{codecInfo[0].codecs || 'H.264'}</span>
            )}
            <button onClick={() => setIsMinimal(!isMinimal)} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white/50 hover:text-[#F7941D]">
              <Sparkles size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Center Play Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        className={`absolute transition-all duration-500 ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      >
        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
          {playing ? (
            <Pause size={48} className="text-white" fill="currentColor" />
          ) : (
            <Play size={48} className="text-white ml-2" fill="currentColor" />
          )}
        </div>
      </button>

      {/* Bottom Bar */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => { const i = channels.findIndex(c => c.id === channel?.id); if (i > 0) playChannel(channels[i - 1]); }} className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white/20">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
            {volume === 0 ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-white" />}
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => { setVolume(e.target.value); videoRef.current.volume = e.target.value; }} className="w-20 accent-[#F7941D]" />
          </div>

          <button onClick={() => { const i = channels.findIndex(c => c.id === channel?.id); if (i < channels.length - 1) playChannel(channels[i + 1]); }} className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white/20">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {qualities.length > 0 && (
            <select value={activeQuality} onChange={(e) => { setActiveQuality(e.target.value); changeQuality(e.target.value); }} className="bg-black/50 text-white text-xs font-bold px-3 py-2 rounded-full outline-none">
              <option value="-1">AUTO</option>
              {qualities.map((q, i) => <option key={i} value={i}>{q.height}p</option>)}
            </select>
          )}
          
          <button onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen?.(); }} className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white/20">
            <Maximize2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
