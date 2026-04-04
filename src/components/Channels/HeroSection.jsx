import React, { useState, useEffect, useMemo } from 'react';
import { Play, Info, Radio, Zap, ChevronRight, Star } from 'lucide-react';

const PREMIUM_KEYWORDS = ['premiere', 'hbo', 'sportv', 'espn', 'telecine', 'globo', 'record', 'sbt', 'cnn', 'tnt', 'disney', 'warner', 'universal', 'fox'];

const cleanChannelName = (name) => {
  if (!name) return "";
  return name
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/FHD|HD|SD|H264|H265|UHD|4K|DIRECTV|RAW|LEG/gi, '')
    .trim();
};

export default function HeroSection({ channels, onPlay, validity = {}, isPlayerOpen = false }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const featured = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    return channels.filter(c => {
        if (!c || !c.name) return false;
        const name = c.name.toLowerCase();
        const isAdult = /adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '');
        if (isAdult) return false;
        return PREMIUM_KEYWORDS.some(kw => name.includes(kw));
    }).slice(0, 8);
  }, [channels]);

  const current = featured[featuredIndex] || channels[0];

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setFeaturedIndex(i => (i + 1) % featured.length);
        setIsTransitioning(false);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!current) return null;

  return (
    <div className="relative w-full aspect-[21/9] min-h-[400px] md:min-h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-16 group bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Background Layer */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
        {current.logo ? (
          <div className="relative w-full h-full">
            <img 
              src={current.logo} 
              className="w-full h-full object-cover brightness-[0.4] blur-[2px] scale-110"
              alt=""
            />
            {/* Center Logo Floating */}
            <div className="absolute inset-0 flex items-center justify-end pr-20 opacity-20 pointer-events-none hidden lg:flex">
               <img src={current.logo} className="h-[60%] object-contain" alt="floating-logo" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C1E] to-[#050505]" />
        )}
        
        {/* Cinema Grade Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10" />
      </div>

      {/* Glossy Reflection */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none z-20" />

      {/* Content Overlay */}
      <div className={`relative z-30 h-full flex flex-col justify-center px-8 md:px-20 transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
        <div className="max-w-3xl">
          
          {/* Elite Badges */}
          <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-left-4 duration-700 delay-200">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Sinal Direto</span>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-[#F7941D] text-[10px] font-black uppercase tracking-[0.2em]">
              {current.group || 'Premium Content'}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-white/40 text-[10px] font-black uppercase tracking-widest">
               <Star size={12} className="fill-[#F7941D] text-[#F7941D]" />
               <span>Destaque Elite</span>
            </div>
          </div>

          {/* Cinematic Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[0.9] tracking-tight drop-shadow-2xl uppercase">
            {cleanChannelName(current.name)}
          </h1>

          {/* Description Ultra */}
          <div className="flex items-center gap-4 mb-8">
             <div className="h-8 w-0.5 bg-[#F7941D] rounded-full" />
             <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.15em] max-w-xl leading-relaxed">
               Experiência 4K nativa com baixa latência e som imersivo surround.
             </p>
          </div>

          {/* Premium Actions */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <button
              onClick={() => onPlay(current)}
              className="group flex items-center gap-3 bg-white text-black font-black px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Play size={20} className="fill-black" />
              <span className="text-xs uppercase tracking-[0.2em]">Assistir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Indicators Elite */}
      <div className="absolute bottom-10 right-10 md:right-20 flex flex-col gap-3 z-40">
        {featured.map((_, i) => (
          <button 
            key={i}
            onClick={() => setFeaturedIndex(i)}
            className={`transition-all duration-500 rounded-full border border-white/20 shadow-2xl ${
              i === featuredIndex 
                ? 'h-10 w-1.5 bg-[#F7941D] border-[#F7941D] shadow-[0_0_15px_#F7941D]' 
                : 'h-3 w-1.5 bg-white/10 hover:bg-white/30'
            }`}
            title={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom Reflection Glow */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-20" />
    </div>
  );
}