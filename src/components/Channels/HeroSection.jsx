import React, { useState, useEffect, useMemo } from 'react';
import { Play, Info, Radio, Sparkles, Zap, ShieldCheck, Heart } from 'lucide-react';

const PREMIUM_KEYWORDS = ['premiere', 'hbo', 'sportv', 'espn', 'telecine', 'globo', 'record', 'sbt', 'cnn', 'tnt', 'disney', 'warner', 'universal', 'fox', 'megapix', 'paramount'];

const cleanChannelName = (name) => {
  if (!name) return "";
  return name
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/FHD|HD|SD|H264|H265|UHD|4K|DIRECTV|RAW|LEG/gi, '')
    .trim();
};

const getCategoryQuery = (name, group) => {
    const n = (name + " " + (group || "")).toUpperCase();
    if (n.includes('ESPORTE') || n.includes('PREMIERE') || n.includes('SPORT')) return 'stadium soccer';
    if (n.includes('FILME') || n.includes('CINEMA') || n.includes('HBO')) return 'fictional movie cinematic';
    if (n.includes('SERIE') || n.includes('NETFLIX')) return 'modern dark living room tv';
    if (n.includes('INFANTIL') || n.includes('KIDS') || n.includes('DESENHO')) return 'colorful animation 3d';
    if (n.includes('NOTICIA') || n.includes('NEWS')) return 'world map news studio';
    return 'nebula space cinematic';
};

export default function HeroSection({ channels, onPlay, validity = {}, isPlayerOpen = false }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featured = useMemo(() => {
    return channels.filter(c => {
        const name = c.name.toLowerCase();
        const isAdult = /adulto|sexo|hot|xxx|18\+|porno/i.test(c.group);
        if (isAdult) return false;
        return PREMIUM_KEYWORDS.some(kw => name.includes(kw));
    }).slice(0, 8);
  }, [channels]);

  const current = featured[featuredIndex] || channels[0];

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex(i => (i + 1) % featured.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!current) return null;

  // Cinematic backdrops (Mars / Space / Abstract)
  const backdropUrl = current.logo && current.type !== 'live' ? current.logo : '/hero-bg.png';

  return (
    <div className="relative w-full h-[45vh] min-h-[380px] rounded-3xl overflow-hidden mb-14 group shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/[0.06] mx-auto bg-[#0a0a0a]">
      {/* Background Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          key={current.id}
          src={backdropUrl} 
          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[15000ms] opacity-40 blur-[2px] group-hover:blur-0"
          alt=""
        />
        {/* Cinematic Vignette & Gradient Hub */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1C22] via-[#1A1C22]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C22] via-transparent to-transparent z-10" />
      </div>


      {/* Floating Meta Stats (Crystal Style) */}
      <div className="absolute top-10 right-10 z-30 flex flex-col gap-3 pointer-events-none hidden lg:flex">
          <div className="bg-white/5 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-right duration-700">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7941D]/20 flex items-center justify-center">
                      <Zap size={14} className="text-[#F7941D]" />
                  </div>
                  <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Qualidade</p>
                      <p className="text-[11px] font-black text-white">ULTRA HD 4K</p>
                  </div>
              </div>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-right duration-1000 delay-300">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck size={14} className="text-emerald-500" />
                  </div>
                  <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Status</p>
                      <p className="text-[11px] font-black text-white">SINAL BLINDADO</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Narrative Area */}
      <div className="relative z-20 h-full flex flex-col justify-center px-10 md:px-20">
        <div className="max-w-4xl animate-in fade-in slide-in-from-left duration-700">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 mb-6 transition-all hover:bg-[#F7941D]/10">
              <div className={`w-1.5 h-1.5 rounded-full ${current.type === 'live' ? 'bg-red-500 animate-pulse' : 'bg-[#F7941D]'}`} />
              <span className="text-white font-black text-[10px] uppercase tracking-[0.25em]">
                {current.type === 'live' ? 'Destaque Ao Vivo' : 'Cinema em Casa'}
              </span>
          </div>

          {/* Title with specialized font weight */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.85] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {cleanChannelName(current.name)}
          </h1>

          {/* Descriptive snippet (Group name as sub-info) */}
          <p className="text-white/40 font-bold text-xs md:text-sm uppercase tracking-[0.4em] mb-10 pl-1 border-l-2 border-[#F7941D]">
            {current.group} • EXCLUSIVO NONOTV
          </p>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onPlay(current)}
              className="group relative bg-[#F7941D] hover:bg-[#ff9d2e] px-10 py-4 md:px-14 md:py-5 rounded-2xl font-black text-white text-xs md:text-sm uppercase tracking-[0.25em] transition-all duration-500 shadow-[0_20px_50px_rgba(247,148,29,0.3)] hover:shadow-[0_25px_70px_rgba(247,148,29,0.5)] hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3">
                <Play size={18} fill="white" />
                <span>Assistir Agora</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
            </button>
            <button
              onClick={() => onPlay(current)}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-3xl px-10 py-4 md:px-14 md:py-5 rounded-2xl font-black text-white text-xs md:text-sm uppercase tracking-[0.25em] transition-all duration-500 border border-white/10 hover:border-white/20"
            >
              Exibir Detalhes
            </button>
          </div>
        </div>
      </div>

      {/* Modern Wave Divider (Semi-transparent) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none opacity-5">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
              <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
      </div>

      {/* Stepper (Minimalist Dot Bar) */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
          {featured.map((_, i) => (
              <button 
                  key={i}
                  onClick={() => setFeaturedIndex(i)}
                  className={`w-0.5 rounded-full transition-all duration-700 ${i === featuredIndex ? 'h-12 bg-[#F7941D] shadow-[0_0_15px_#F7941D]' : 'h-4 bg-white/10 hover:bg-white/30'}`}
              />
          ))}
      </div>

      {/* Accent Glows */}
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-[#F7941D]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
