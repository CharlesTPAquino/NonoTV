import React from 'react';
import { Search, Settings, Bell, User, Zap, LayoutGrid } from 'lucide-react';

const TABS = [
  { type: 'All',      label: 'Descobrir', color: '#F7941D' },
  { type: 'live',     label: 'Ao Vivo',   color: '#EF4444' },
  { type: 'movie',    label: 'Filmes',    color: '#F97316' },
  { type: 'series',   label: 'Séries',    color: '#6366F1' },
  { type: 'podcasts', label: 'Podcasts',  color: '#10B981' },
];

export default function Navbar({ search, setSearch, syncStatus, activeCategory, setActiveCategory, onOpenSettings }) {
  
  return (
    <nav className="relative shrink-0 h-24 md:h-32 flex items-center px-6 md:px-12 z-[90] animate-in fade-in slide-in-from-top-4 duration-1000">
      
      {/* Background Glow */}
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />

      <div className="w-full flex items-center justify-between relative z-10">
        
        {/* Left - Navigation Tabs (Netflix Style) */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide py-2">
          {TABS.map((tab, idx) => {
            const isActive = activeCategory === tab.type;
            const accentColor = tab.color;
            
            return (
              <button
                key={tab.type}
                onClick={() => setActiveCategory(tab.type)}
                className={`relative px-4 md:px-6 py-2.5 rounded-2xl transition-all duration-500 whitespace-nowrap group/tab
                  ${isActive 
                    ? 'text-white' 
                    : 'text-white/20 hover:text-white/60'}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {isActive && (
                  <div 
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-500 shadow-2xl"
                    style={{ borderColor: `${accentColor}33` }} 
                  />
                )}
                <span className={`relative z-10 text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'scale-105' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full animate-in slide-in-from-bottom-2 duration-500"
                    style={{ backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right - Global Actions */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          
          {/* Signal Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-2xl">
            <div className="relative">
              <Zap size={14} className="text-[#F7941D] animate-pulse" />
              <div className="absolute inset-0 bg-[#F7941D] blur-md opacity-20 animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {syncStatus?.includes('Conectado') ? 'Sinal 4K Estável' : 'Sintonizando...'}
            </span>
          </div>

          <button 
            onClick={onOpenSettings}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 group"
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F7941D] to-[#FBB03B] p-[1px] shadow-[0_10px_30px_rgba(247,148,29,0.2)] hover:scale-105 transition-transform duration-500 cursor-pointer">
            <div className="w-full h-full bg-[#18181B] rounded-[15px] flex items-center justify-center overflow-hidden border border-white/10">
              <User size={20} className="text-[#F7941D]" />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Toggle - Visual Only */}
        <div className="md:hidden">
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <LayoutGrid size={20} className="text-white/40" />
          </button>
        </div>
      </div>
    </nav>
  );
}