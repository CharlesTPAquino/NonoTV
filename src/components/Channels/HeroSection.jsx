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

export default function HeroSection({ channels, onPlay }) {
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
    }, 10000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!current) return null;

  const backdropUrl = '/hero-bg.png';

  return (
    <div className="relative w-full h-[45vh] min-h-[380px] rounded-[48px] overflow-hidden mb-16 group shadow-[0_50px_100px_rgba(0,0,0,0.25)] border border-white/10 mx-auto max-w-[1450px] bg-[#1A1A1A]">
      {/* Background with Slow Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          key={backdropUrl}
          src={backdropUrl} 
          className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[10000ms] opacity-50"
          alt=""
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent z-10" />
      </div>

      {/* Floating Data Cards (Inspiration: Mars Explorer) */}
      <div className="absolute top-12 right-12 z-30 flex flex-col gap-4 pointer-events-none">
          <div className="bg-white/5 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/20 shadow-2xl animate-in slide-in-from-right duration-700 delay-200">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                      <Zap size={14} className="text-[#10B981]" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Signal Strength</p>
                      <p className="text-xs font-black text-white">100% Ultra HD</p>
                  </div>
              </div>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/20 shadow-2xl animate-in slide-in-from-right duration-1000 delay-500">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                      <ShieldCheck size={14} className="text-[#6366F1]" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protection</p>
                      <p className="text-xs font-black text-white">Secure Server</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 h-full flex flex-col justify-end px-20 pb-16">
        <div className="max-w-3xl">
          {/* Live Tag */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 mb-6 group/tag hover:bg-[#6366F1]/20 transition-colors">
              <Radio size={14} className="text-[#6366F1] animate-pulse" />
              <span className="text-white font-black text-[11px] uppercase tracking-[0.3em]">Ao Vivo Disponível</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
            {cleanChannelName(current.name)}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onPlay(current)}
              className="bg-[#6366F1] hover:bg-[#4f46e5] px-12 py-5 rounded-[24px] font-black text-white text-sm uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_20px_60px_rgba(99,102,241,0.4)] hover:shadow-[0_25px_80px_rgba(99,102,241,0.6)] hover:-translate-y-1"
            >
              Assistir Agora
            </button>
            <button
              onClick={() => onPlay(current)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-12 py-5 rounded-[24px] font-black text-white text-sm uppercase tracking-[0.2em] transition-all duration-500 border border-white/10 hover:border-white/30"
            >
              Saber Mais
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Wave (Mars Explorer Style) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-[#E8E8E8] translate-y-[2px]">
              <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
      </div>

      {/* Vertical Stepper (Ref image inspired) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
          {featured.map((_, i) => (
              <button 
                  key={i}
                  onClick={() => setFeaturedIndex(i)}
                  className={`w-1 rounded-full transition-all duration-500 ${i === featuredIndex ? 'h-10 bg-[#6366F1]' : 'h-2 bg-white/20'}`}
              />
          ))}
      </div>

      {/* Neon Glow on Logo Area */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#6366F1]/10 blur-[120px] rounded-full" />
    </div>
  );
}
