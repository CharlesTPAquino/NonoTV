import React from 'react';
import { Home, Tv, Film, Clapperboard, Radio, Settings } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',  name: 'Início',     type: 'All',    icon: Home },
  { id: 'live', name: 'Ao Vivo',    type: 'live',   icon: Tv },
  { id: 'vod',  name: 'Filmes',     type: 'movie',  icon: Film },
  { id: 'ser',  name: 'Séries',     type: 'series', icon: Clapperboard },
];

export default function Sidebar({ activeCategory, setActiveCategory }) {
  return (
    <>
      {/* DESKTOP / TV — Ultra-thin left dock */}
      <aside className="hidden md:flex fixed left-0 top-0 w-[72px] h-full bg-black/60 backdrop-blur-[30px] border-r border-white/[0.04] z-50 flex-col items-center pt-8 pb-6">
        {/* Logo Mark */}
        <div className="w-10 h-10 rounded-xl bg-[#F7941D]/10 border border-[#F7941D]/20 flex items-center justify-center mb-10">
          <span className="text-[#F7941D] font-black text-sm font-outfit">N</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.type;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.type)}
                className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 outline-none
                  focus:ring-2 focus:ring-[#F7941D]/50 focus:scale-110
                  ${isActive 
                    ? 'bg-[#F7941D]/15 text-[#F7941D]' 
                    : 'text-white/15 hover:text-white/50 hover:bg-white/5'
                  }`}
                title={cat.name}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <div className="absolute -left-[2px] w-1 h-6 bg-[#F7941D] rounded-full shadow-[0_0_12px_#F7941D]" />
                )}
                <Icon size={20} className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(247,148,29,0.5)]' : ''}`} />
                
                {/* Tooltip */}
                <div className="absolute left-[60px] bg-black/90 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-white opacity-0 pointer-events-none -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus:opacity-100 group-focus:translate-x-0 transition-all duration-300 whitespace-nowrap z-[60]">
                  {cat.name}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/10 hover:text-[#F7941D] hover:bg-[#F7941D]/5 transition-all duration-500 focus:ring-2 focus:ring-[#F7941D]/30">
          <Settings size={18} />
        </button>
      </aside>

      {/* MOBILE / TABLET — Bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-[30px] border-t border-white/[0.04] z-50 flex items-center justify-around px-4 safe-area-bottom">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.type;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.type)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-[#F7941D]' 
                  : 'text-white/20'
                }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-[#F7941D] rounded-full shadow-[0_0_10px_#F7941D]" />
              )}
              <Icon size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">{cat.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
