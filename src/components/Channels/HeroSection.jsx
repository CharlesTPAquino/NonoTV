import React, { useState, useEffect, useMemo } from 'react';
import { Play, Radio } from 'lucide-react';

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

  const featured = useMemo(() => {
    return channels.filter(c => {
        const name = c.name.toLowerCase();
        const isAdult = /adulto|sexo|hot|xxx|18\+|porno/i.test(c.group);
        if (isAdult) return false;
        return PREMIUM_KEYWORDS.some(kw => name.includes(kw));
    }).slice(0, 6);
  }, [channels]);

  const current = featured[featuredIndex] || channels[0];

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex(i => (i + 1) % featured.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!current) return null;

  return (
    <div className="relative w-full aspect-[21/9] min-h-[320px] rounded-2xl overflow-hidden mb-12 group bg-[#27272A]">
      {/* Background */}
      <div className="absolute inset-0">
        {current.logo ? (
          <img 
            src={current.logo} 
            className="w-full h-full object-contain p-12 opacity-30 group-hover:opacity-40 transition-opacity duration-500"
            alt=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3F3F46] to-[#27272A]">
            <span className="text-8xl font-bold text-white/20">{current.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#18181B] via-[#18181B]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-8 md:px-12">
        <div className="max-w-xl">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AO VIVO
            </span>
            <span className="text-[#A1A1AA] text-sm font-medium">{current.group}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {cleanChannelName(current.name)}
          </h1>

          {/* Description */}
          <p className="text-[#71717A] text-sm mb-8 line-clamp-2">
            Assista ao melhor conteúdo ao vivo com qualidade HD e SD. 
            Programação exclusiva 24 horas.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlay(current)}
              className="flex items-center gap-2 bg-[#F7941D] hover:bg-[#FB923C] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Play size={18} fill="white" />
              <span>Assistir</span>
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <span className="text-lg">+</span>
              <span>Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 right-8 flex items-center gap-2 z-20">
          {featured.map((_, i) => (
            <button 
              key={i}
              onClick={() => setFeaturedIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === featuredIndex ? 'bg-[#F7941D] w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
