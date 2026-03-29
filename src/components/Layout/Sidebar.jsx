import React from 'react';
import { Home, Tv, Film, Clapperboard, Radio, Settings, List } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',  name: 'Início',     type: 'All',    icon: Home },
  { id: 'live', name: 'Ao Vivo',    type: 'live',   icon: Tv },
  { id: 'vod',  name: 'Filmes',     type: 'movie',  icon: Film },
  { id: 'ser',  name: 'Séries',     type: 'series', icon: Clapperboard },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList }) {
  return (
    <>
      {/* DESKTOP / TV — Expands on focus */}
      <aside className="tv-sidebar hidden md:flex flex-col items-center pt-8 pb-6 group">
        {/* Logo Mark */}
        <div className="w-10 h-10 rounded-xl bg-[#F7941D]/10 border border-[#F7941D]/20 flex items-center justify-center mb-10 shrink-0">
          <span className="text-[#F7941D] font-black text-sm font-outfit">N</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2 flex-1 w-full px-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.type;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.type)}
                className={`group relative w-full h-12 rounded-2xl flex items-center justify-center transition-all duration-500 outline-none
                  focus:ring-2 focus:ring-[#F7941D]/50
                  ${isActive 
                    ? 'bg-[#F7941D]/15 text-[#F7941D]' 
                    : 'text-white/30 hover:text-white hover:bg-white/5'
                  }`}
                title={cat.name}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-[#F7941D] rounded-full shadow-[0_0_12px_#F7941D]" />
                )}
                <Icon size={22} className="shrink-0" />
                
                {/* Label - shows on hover/focus */}
                <span className="absolute left-14 bg-black/90 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Channel List Button */}
        {onOpenChannelList && (
          <button 
            onClick={onOpenChannelList}
            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 hover:text-[#F7941D] hover:bg-[#F7941D]/5 transition-all duration-500 my-2"
            title="Lista de Canais"
          >
            <List size={18} />
          </button>
        )}

        {/* Settings at bottom */}
        <button 
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 hover:text-[#F7941D] hover:bg-[#F7941D]/5 transition-all duration-500"
          title="Configurações"
        >
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
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 relative
                ${isActive 
                  ? 'text-[#F7941D]' 
                  : 'text-white/30'
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
