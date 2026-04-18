import React from 'react';
import { Home, Tv, Film, Clapperboard, Mic, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', name: 'Início', type: 'All', icon: Home },
  { id: 'live', name: 'Ao Vivo', type: 'live', icon: Tv },
  { id: 'vod', name: 'Filmes', type: 'movie', icon: Film },
  { id: 'series', name: 'Séries', type: 'series', icon: Clapperboard },
  { id: 'podcasts', name: 'Podcasts', type: 'podcasts', icon: Mic },
];

export default function BottomNav ({ 
  activeCategory, 
  setActiveCategory, 
  onOpenSettings 
}) {
  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around px-2 py-2"
      style={{
        background: 'var(--surface-sidebar)',
        borderTop: '1px solid var(--border-1)',
        height: 'var(--bottom-nav-h, 68px)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
      data-nav-zone="bottomnav"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeCategory === item.type;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveCategory(item.type)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-2 transition-all duration-200 rounded-lg ${
              isActive 
                ? 'text-white' 
                : 'text-white/40 hover:text-white/60'
            }`}
            style={{
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}
          >
            <Icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 1.5}
              className={isActive ? 'text-white' : 'text-white/40'}
            />
            <span className={`text-[10px] font-medium mt-1 tracking-wide ${
              isActive ? 'text-white' : 'text-white/40'
            }`}>
              {item.name}
            </span>
          </button>
        );
      })}
      
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-2 text-white/40 hover:text-white/60 transition-all"
      >
        <Settings size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium mt-1 tracking-wide text-white/40">Ajustes</span>
      </button>
    </nav>
  );
}