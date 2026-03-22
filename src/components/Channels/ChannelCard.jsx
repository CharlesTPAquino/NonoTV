import React, { useState, useRef, useEffect } from 'react';
import { Play, Tv, Trophy, Film, Clapperboard, Monitor, Sparkles, Heart, Library, Newspaper, Baby, Music, Radio, Church, Star, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

const getCardThemeDS = (channel) => {
  const n = (channel.group || '').toUpperCase();
  if (n.includes('ESPORTE') || n.includes('COPA') || n.includes('PREMIERE')) return { bg: 'bg-[#F59E0B]', icon: Trophy }; 
  if (n.includes('FILME') || n.includes('CINEMA')) return { bg: 'bg-[#F43F5E]', icon: Film };   
  if (n.includes('SERIE') || n.includes('SEASON') || n.includes('NETFLIX')) return { bg: 'bg-[#6366F1]', icon: Clapperboard }; 
  if (n.includes('INFANTIL') || n.includes('KIDS') || n.includes('DESENHOS')) return { bg: 'bg-[#0EA5E9]', icon: Baby }; 
  if (n.includes('4K') || n.includes('UHD') || n.includes('PREMIUM')) return { bg: 'bg-[#10B981]', icon: Sparkles }; 
  if (n.includes('DOCUMENTARIO') || n.includes('CURIOSIDADE')) return { bg: 'bg-[#8B5CF6]', icon: Library }; 
  if (n.includes('NOTICIA') || n.includes('NEWS')) return { bg: 'bg-[#3B82F6]', icon: Newspaper }; 
  if (n.includes('MUSICA') || n.includes('SHOWS')) return { bg: 'bg-[#EC4899]', icon: Music }; 
  if (n.includes('RELIGIAO') || n.includes('GOSPEL')) return { bg: 'bg-[#D946EF]', icon: Church }; 
  if (n.includes('RADIO')) return { bg: 'bg-[#64748B]', icon: Radio }; 
  return { bg: 'bg-[#1B2838]', icon: Monitor }; 
};

export default function ChannelCard({ channel, onPlay, isValid }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const theme = getCardThemeDS(channel);

  const handleMouseEnter = () => {
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = channel.url;
    document.head.appendChild(prefetch);

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    let hls = null;
    const video = videoRef.current;
    
    if (isHovered && video) {
      if (Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 4, manifestLoadingMaxRetry: 1, fragLoadingMaxRetry: 1 });
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.log("Silent Play Blocked:", e));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.log("Silent Play Blocked:", e));
        });
      }
    }
    
    return () => {
      if (hls) hls.destroy();
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [isHovered, channel.url]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(channel);
    }
  };

  return (
    <button
      onClick={() => onPlay(channel)}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col w-full text-left focus:outline-none outline-none focus-visible:ring-4 focus-visible:ring-[#6366F1] rounded-2xl overflow-hidden transition-all active:scale-95 shadow-xl bg-[#0A0A0A] h-full"
      aria-label={`Assistir canal ${channel.name}`}
    >
      {/* Top Part: Image */}
      <div className="aspect-video relative w-full overflow-hidden bg-black shrink-0">
        <img 
          src={channel.logo || 'https://via.placeholder.com/300x170/000000/FFFFFF?text=Streaming+NonoTV'} 
          alt={channel.name} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-30">
          <div className="bg-[#6366F1] p-4 rounded-full text-white shadow-2xl scale-75 group-hover:scale-100 group-focus:scale-100 transition-all duration-500">
            <Play size={24} fill="currentColor"/>
          </div>
        </div>

        {/* Video Preview */}
        {isHovered && (
          <div className="absolute inset-0 z-10 bg-black animate-in fade-in duration-500 overflow-hidden">
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover opacity-80" />
          </div>
        )}

        {/* Small validity dot */}
        <div className="absolute top-3 right-3 z-30">
          <div className={`w-2 h-2 rounded-full border border-black/50 ${isValid !== false ? 'bg-[#10B981]' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Footer Part: Content */}
      <div className={`flex items-center gap-3 p-4 flex-1 w-full ${theme.bg} transition-transform duration-500 relative z-20`}>
        <div className="text-white drop-shadow-lg shrink-0 scale-110 group-hover:scale-125 transition-transform duration-500">
          <theme.icon size={22} strokeWidth={2.5} />
        </div>
        
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-[11px] text-white truncate uppercase tracking-[0.15em] leading-tight drop-shadow-xl">
            {channel.name}
          </h3>
          <p className="text-[8px] text-white/70 font-black uppercase tracking-widest mt-1.5 truncate">
            {channel.group || 'Geral'}
          </p>
        </div>
        
        <div className="text-white/40 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 transition-all duration-500">
            <Star size={12} fill="currentColor" />
        </div>
      </div>
    </button>
  );
}
