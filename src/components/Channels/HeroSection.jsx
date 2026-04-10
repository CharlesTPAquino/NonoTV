import React, { useState, useEffect, useMemo } from 'react';
import { Play, Radio, Star, Sparkles } from 'lucide-react';
import { aiService } from '../../services/AIService';

const PREMIUM_KEYWORDS = ['premiere', 'hbo', 'sportv', 'espn', 'telecine', 'globo', 'record', 'sbt', 'cnn', 'tnt', 'disney', 'warner', 'universal', 'fox'];

const cleanChannelName = (name) => {
  if (!name) return "";
  return name
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/FHD|HD|SD|H264|H265|UHD|4K|DIRECTV|RAW|LEG/gi, '')
    .trim();
};

export default function HeroSection({ channels, onPlay, validity = {}, isPlayerOpen = false, autoRotate = true, heroInterval = 10000, history = [], favorites = [] }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [aiDescription, setAiDescription] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const featured = useMemo(() => {
    return aiService.getSmartHero(channels, history, favorites, 8);
  }, [channels, history, favorites]);

  const current = featured[featuredIndex] || channels[0];

  useEffect(() => {
    if (!current) return;
    
    let isMounted = true;
    const fetchDescription = async () => {
      setIsAiLoading(true);
      setAiDescription(null);
      
      try {
        const desc = await aiService.enrichMetadata(current.name, current.group || '');
        if (isMounted) setAiDescription(desc);
      } catch (err) {
        if (isMounted) setAiDescription("Experiência premium com alto desempenho.");
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    };
    
    // Add a small delay to avoid spamming the AI on fast slides
    const debounceTimer = setTimeout(() => {
      fetchDescription();
    }, 500);
    
    return () => { 
      isMounted = false; 
      clearTimeout(debounceTimer);
    };
  }, [current?.name, current?.group]);

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
      <div className={`relative z-20 h-full flex flex-row items-center justify-between px-6 md:px-16 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Left Side: Info */}
        <div className="max-w-2xl py-8">
          {/* Badges */}
          <div className="flex items-center gap-2 md:gap-3 mb-4">
            {current.isAiSelected && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                <Sparkles size={10} className="text-blue-400" />
                <span className="text-blue-400 text-[8px] font-black uppercase tracking-wider">Recomendado por IA</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              {current.type === 'live' && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/60"></span>
                </span>
              )}
              <span className="text-white/60 text-[9px] font-bold uppercase tracking-wider">
                 {current.type === 'movie' ? 'Filme' : current.type === 'series' ? 'Série' : 'Ao Vivo'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-[0.9] tracking-tight uppercase">
            {cleanChannelName(current.name)}
          </h1>

          {/* Description */}
          <div className="max-w-lg mb-8 min-h-[40px] flex items-center">
            {isAiLoading ? (
               <div className="flex flex-col gap-2 w-full max-w-sm opacity-40">
                 <div className="h-1.5 w-full bg-white/20 rounded-full" />
                 <div className="h-1.5 w-2/3 bg-white/20 rounded-full" />
               </div>
            ) : (
               <p className="text-white/40 text-[11px] md:text-[13px] font-medium tracking-wide leading-relaxed italic">
                 "{aiDescription || "Conteúdo selecionado com base nas suas preferências."}"
               </p>
            )}
          </div>

          {/* Action */}
          <button
            onClick={() => onPlay(current)}
            className="flex items-center gap-2 bg-white text-black font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-white/90 active:scale-95 transition-all shadow-xl"
          >
            <Play size={16} className="fill-black" />
            Assistir Agora
          </button>
        </div>

        {/* Right Side: Floating Poster */}
        {current.logo && (
          <div className="hidden sm:flex flex-1 items-center justify-end pl-4 md:pl-12 pr-4">
             <div className="relative group/poster">
                {/* Glow behind poster */}
                <div className="absolute -inset-4 bg-white/5 blur-3xl opacity-0 group-hover/poster:opacity-100 transition-opacity duration-700" />
                
                <div className="relative w-36 md:w-48 lg:w-56 xl:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border border-white/10 transform rotate-[3deg] group-hover/poster:rotate-0 group-hover/poster:scale-105 transition-all duration-700 ease-out">
                  <img 
                    src={current.logo} 
                    className="w-full h-full object-cover"
                    alt={current.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
             </div>
          </div>
        )}
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
                  ? 'h-2 w-6 bg-white' 
                  : 'h-2 w-2 bg-white/15 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
