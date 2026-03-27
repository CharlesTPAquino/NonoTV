import React from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Sparkles } from 'lucide-react';
import Badge from '../UI/Badge';

const MAIN_CATEGORIES = [
  { id: 'all',  name: 'Início',     type: 'All',   icon: Home },
  { id: 'live', name: 'TV Ao Vivo', type: 'live',  icon: Tv },
  { id: 'vod',  name: 'Filmes',     type: 'movie', icon: Film },
  { id: 'ser',  name: 'Séries',     type: 'series',icon: Clapperboard }
];

export default function Sidebar({ activeCategory, setActiveCategory }) {
  return (
    <aside className="fixed left-0 top-0 w-20 md:w-20 lg:w-64 h-full glass-sidebar z-50 flex flex-col items-center justify-start py-8 md:py-10 shadow-elevation-xl transition-all duration-700">
      
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 lg:mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <span className="hidden lg:block font-display font-black text-lg tracking-tight text-content-primary">
          Nono<span className="text-primary">TV</span>
        </span>
      </div>

      {MAIN_CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.type;
        
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.type)}
            className="group relative flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 mb-6 md:mb-10 rounded-2xl transition-all duration-500 focus:scale-125 focus:bg-primary/10 outline-none hover:scale-110 active:scale-90"
          >
            {/* Active Glow Background */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-700 pointer-events-none ${isActive ? 'bg-primary/15 opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-10 group-focus:opacity-20 group-hover:scale-100 group-focus:scale-105'}`} />
            
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute left-0 w-1 h-8 bg-primary rounded-full shadow-glow-sm" />
            )}

            <Icon size={24} className={`relative z-10 transition-all duration-500 ${isActive ? 'text-primary drop-shadow-[0_0_12px_rgba(247,148,29,0.6)] scale-110' : 'text-content-muted group-hover:text-content-secondary group-focus:text-content-primary'}`} />
            
            {/* Tooltip */}
            <div className="hidden lg:flex absolute left-24 bg-bg-secondary border border-border px-6 py-3 rounded-2xl text-content-primary text-[10px] font-display font-bold uppercase tracking-[0.4em] opacity-0 -translate-x-6 group-hover:opacity-100 group-focus:opacity-100 group-hover:translate-x-0 group-focus:translate-x-0 transition-all shadow-elevation-xl pointer-events-none z-50 min-w-max">
              {cat.name}
            </div>
          </button>
        );
      })}

      {/* Settings */}
      <div className="hidden md:flex flex-col items-center justify-end flex-1 w-full pb-6">
        <button className="w-10 h-10 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-content-muted hover:text-primary hover:bg-primary/10 transition-all duration-500">
            <Settings size={20} />
        </button>
      </div>

      {/* Version Badge */}
      <Badge variant="primary" size="sm" className="hidden lg:flex mb-4">
        v3.1
      </Badge>
    </aside>
  );
}