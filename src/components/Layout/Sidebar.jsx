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
    <aside className="fixed bottom-0 left-0 w-full h-[72px] md:bottom-auto md:top-20 md:w-20 md:h-[calc(100vh-5rem)] bg-[#11141D]/95 backdrop-blur-3xl border-t md:border-t-0 md:border-r border-white/5 z-50 flex flex-row md:flex-col items-center justify-around md:justify-start md:py-10 shadow-2xl transition-all duration-700">
      
      {MAIN_CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.type;
        
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.type)}
            className="group relative flex flex-col items-center justify-center w-12 h-12 md:mb-10 rounded-2xl transition-all duration-500 hover:scale-110 active:scale-90"
          >
            {/* Active Glow Background */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-700 pointer-events-none ${isActive ? 'bg-[#F7941D]/10 opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-5 group-hover:scale-100'}`} />
            
            {/* Direct Indicator */}
            {isActive && (
              <div className="absolute top-0 md:top-auto md:left-0 w-8 h-1 md:w-1 md:h-8 bg-[#F7941D] rounded-full shadow-[0_0_15px_#F7941D]" />
            )}

            <Icon size={24} className={`relative z-10 transition-all duration-500 ${isActive ? 'text-[#F7941D] drop-shadow-[0_0_8px_rgba(247,148,29,0.4)]' : 'text-white/20 group-hover:text-white/60'}`} />
            
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 md:hidden transition-all duration-500 ${isActive ? 'text-[#F7941D]' : 'text-white/20'}`}>
              {cat.name}
            </span>

            {/* Desktop Label (Clean Overlay) */}
            <div className="hidden md:flex absolute left-20 bg-[#11141D] border border-white/5 px-4 py-2 rounded-xl text-white text-[9px] uppercase font-black tracking-[0.3em] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none z-50">
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
