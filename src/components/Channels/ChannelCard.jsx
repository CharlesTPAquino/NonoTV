import React, { useState, useRef, useEffect } from 'react';
import { Play, Tv, Trophy, Film, Clapperboard, Monitor, Sparkles, Heart, Library, Newspaper, Baby, Music, Radio, Church, Star, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

const getCardThemeDS = (channel) => {
  const n = (channel.group || '').toUpperCase();
  if (n.includes('ESPORTE') || n.includes('COPA') || n.includes('PREMIERE')) return { bg: 'bg-[#F59E0B]', icon: Trophy }; // Amber
  if (n.includes('FILME') || n.includes('CINEMA')) return { bg: 'bg-[#F43F5E]', icon: Film };   // Rose
  if (n.includes('SERIE') || n.includes('SEASON') || n.includes('NETFLIX')) return { bg: 'bg-[#6366F1]', icon: Clapperboard }; // Indigo
  if (n.includes('INFANTIL') || n.includes('KIDS') || n.includes('DESENHOS')) return { bg: 'bg-[#0EA5E9]', icon: Baby }; // Sky
  if (n.includes('4K') || n.includes('UHD') || n.includes('PREMIUM')) return { bg: 'bg-[#10B981]', icon: Sparkles }; // Emerald
  if (n.includes('DOCUMENTARIO') || n.includes('CURIOSIDADE')) return { bg: 'bg-[#8B5CF6]', icon: Library }; // Violet
  if (n.includes('NOTICIA') || n.includes('NEWS')) return { bg: 'bg-[#3B82F6]', icon: Newspaper }; // Blue
  if (n.includes('MUSICA') || n.includes('SHOWS')) return { bg: 'bg-[#EC4899]', icon: Music }; // Pink
  if (n.includes('RELIGIAO') || n.includes('GOSPEL')) return { bg: 'bg-[#D946EF]', icon: Church }; // Fuchsia
  if (n.includes('RADIO')) return { bg: 'bg-[#64748B]', icon: Radio }; // Slate
  return { bg: 'bg-[#1B2838]', icon: Monitor }; // Default Navy
};

export default function ChannelCard({ channel, onPlay, isValid }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const theme = getCardThemeDS(channel);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 700);
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
        hls = new Hls({ 
          maxBufferLength: 4, 
          manifestLoadingMaxRetry: 1, 
          fragLoadingMaxRetry: 1 
        });
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

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPlay(channel)}
      className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.05] transition-all duration-700 relative shadow-xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/5 bg-[#0A0A0A] h-full ring-1 ring-white/5"
    >
      {/* Top Part: EXPANDED IMAGE (Filling boundaries) */}
      <div className="aspect-[16/9] relative w-full overflow-hidden bg-black shrink-0">
        <img 
          src={channel.logo || 'https://via.placeholder.com/300x170/000000/FFFFFF?text=Streaming+NonoTV'} 
          alt={channel.name} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none">
          <div className="bg-white/30 backdrop-blur-xl p-4 rounded-full text-white shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500 border border-white/30">
            <Play size={24} fill="currentColor"/>
          </div>
        </div>

        {/* Video Preview Overlay */}
        {isHovered && (
          <div className="absolute inset-0 z-10 bg-black animate-in fade-in duration-500 overflow-hidden">
            <video 
              ref={videoRef}
              muted
              autoPlay
              playsInline
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-30">
          <div className={`w-2 h-2 rounded-full border border-black/50 ${
            isValid === true ? 'bg-[#10B981]' :
            isValid === false ? 'bg-[#F43F5E]' :
            'bg-white/30'
          }`} />
        </div>
      </div>

      {/* Footer Part: VIBRANT COLORED FOOTER */}
      <div className={`flex items-center gap-3 p-4 flex-1 ${theme.bg} shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-500 relative z-20`}>
        {/* Category Icon */}
        <div className="text-white drop-shadow-lg shrink-0 scale-110 group-hover:scale-125 transition-transform duration-500">
          <theme.icon size={22} strokeWidth={2.5} />
        </div>
        
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-[11px] text-white truncate uppercase tracking-[0.15em] leading-tight drop-shadow-xl filter">
            {channel.name}
          </h3>
          <p className="text-[8px] text-white/70 font-black uppercase tracking-widest mt-1.5 truncate">
            {channel.group || 'Geral'}
          </p>
        </div>
        
        {/* Modern "Go" Arrow */}
        <div className="text-white/40 group-hover:text-white transition-colors translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <Star size={12} fill="currentColor" />
        </div>
      </div>
    </div>
  );
}
