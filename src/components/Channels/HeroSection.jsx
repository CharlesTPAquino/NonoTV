import React, { useState, useEffect, useMemo } from 'react';
import { Play, Radio, Star } from 'lucide-react';

const PREMIUM_KEYWORDS = ['premiere', 'hbo', 'sportv', 'espn', 'telecine', 'globo', 'record', 'sbt', 'cnn', 'tnt', 'disney', 'warner', 'universal', 'fox'];

const cleanChannelName = (name) => {
  if (!name) return "";
  return name
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/FHD|HD|SD|H264|H265|UHD|4K|DIRECTV|RAW|LEG/gi, '')
    .trim();
};

export default function HeroSection({ channels, onPlay, validity = {}, isPlayerOpen = false, autoRotate = true, heroInterval = 10000 }) {
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
    if (!autoRotate || featured.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setFeaturedIndex(i => (i + 1) % featured.length);
        setIsTransitioning(false);
      }, 500);
    }, heroInterval);
    return () => clearInterval(interval);
  }, [featured.length, autoRotate, heroInterval]);

  if (!current) return null;

  return (
    <div className="relative w-full aspect-[21/9] min-h-[300px] md:min-h-[400px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-8 md:mb-16 group bg-[#050505] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/5">
      
      {/* Background Layer */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {current.logo ? (
          <div className="relative w-full h-full overflow-hidden">
            <img 
              src={current.logo} 
              className="w-full h-full object-cover brightness-[0.35] blur-[3px]"
              alt=""
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C1E] to-[#050505]" />
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
      </div>

      {/* Content Overlay */}
      <div className={`relative z-20 h-full flex flex-col justify-center px-6 md:px-16 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-2xl">
          
          {/* Badges */}
          <div className="flex items-center gap-2 md:gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-full border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-white text-[8px] font-black uppercase tracking-wider">Ao Vivo</span>
            </div>
            
            <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[#F7941D] text-[8px] font-black uppercase tracking-wider">
              {current.group || 'Premium'}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-[0.9] tracking-tight uppercase">
            {cleanChannelName(current.name)}
          </h1>

          {/* Description */}
          <p className="text-white/30 text-[10px] md:text-xs font-bold uppercase tracking-wider max-w-lg mb-6">
            Experiência 4K nativa com baixa latência.
          </p>

          {/* Action */}
          <button
            onClick={() => onPlay(current)}
            className="flex items-center gap-2 bg-white text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-white/90 active:scale-95 transition-all"
          >
            <Play size={16} className="fill-black" />
            Assistir
          </button>
        </div>
      </div>

      {/* Pagination */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-12 flex gap-2 z-30">
          {featured.map((_, i) => (
            <button 
              key={i}
              onClick={() => setFeaturedIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === featuredIndex 
                  ? 'h-2 w-6 bg-[#F7941D]' 
                  : 'h-2 w-2 bg-white/15 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
