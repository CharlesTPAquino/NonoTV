import React from 'react';
import { Home, Tv, Film, Clapperboard, Settings } from 'lucide-react';

const MAIN_CATEGORIES = [
  { id: 'all',  name: 'Início',     type: 'All',   icon: Home },
  { id: 'live', name: 'TV Ao Vivo', type: 'live',  icon: Tv },
  { id: 'vod',  name: 'Filmes',     type: 'movie', icon: Film },
  { id: 'ser',  name: 'Séries',     type: 'series',icon: Clapperboard }
];

export default function Sidebar({ activeCategory, setActiveCategory }) {
  return (
    // Mobile: Bottom Nav, Desktop/TV: Left Dock
    <aside className="fixed left-0 top-0 w-20 md:w-20 lg:w-64 h-full bg-[#0A0B0F]/95 backdrop-blur-3xl border-r border-white/5 z-50 flex flex-col items-center justify-start py-8 md:py-10 shadow-2xl transition-all duration-700">
      
      {MAIN_CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.type;
        
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.type)}
            className="group relative flex flex-col items-center justify-center w-12 h-12 lg:w-16 lg:h-16 mb-6 md:mb-10 rounded-2xl transition-all duration-500 focus:scale-125 focus:bg-[#F7941D]/10 outline-none hover:scale-110 active:scale-90"
          >
            {/* Active Glow Background */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-700 pointer-events-none ${isActive ? 'bg-[#F7941D]/15 opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-10 group-focus:opacity-20 group-hover:scale-100 group-focus:scale-105'}`} />
            
            {/* Direct Indicator (Esquerda) */}
            {isActive && (
              <div className="absolute left-0 w-1 h-8 bg-[#F7941D] rounded-full shadow-[0_0_15px_#F7941D]" />
            )}

            <Icon size={24} className={`relative z-10 transition-all duration-500 ${isActive ? 'text-[#F7941D] drop-shadow-[0_0_12px_rgba(247,148,29,0.6)] scale-110' : 'text-white/20 group-hover:text-white/60 group-focus:text-white'}`} />
            
            {/* Label Sidebar (Expandida em LG) */}
            <div className="hidden lg:flex absolute left-24 bg-[#121418] border border-white/10 px-6 py-3 rounded-2xl text-white text-[10px] uppercase font-black tracking-[0.4em] opacity-0 -translate-x-6 group-hover:opacity-100 group-focus:opacity-100 group-hover:translate-x-0 group-focus:translate-x-0 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.8)] pointer-events-none z-50 min-w-max">
              {cat.name}
            </div>
          </button>
        );
      })}

      <div className="hidden md:flex flex-col items-center justify-end flex-1 w-full pb-6">
        <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/10 hover:text-[#F7941D] hover:bg-[#F7941D]/10 transition-all duration-500">
            <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
