import React from 'react';
import { Search, LogOut, Satellite, Settings } from 'lucide-react';
import ServerSelector from './ServerSelector';

const TABS = [
  { type: 'All',    label: 'Recomendado' },
  { type: 'movie',  label: 'Filmes E Séries' },
  { type: 'live',   label: 'Canais Ao Vivo' },
  { type: 'series', label: 'Séries' },
];

export default function Navbar({ search, setSearch, syncStatus, activeCategory, setActiveCategory, onOpenSettings }) {
  const handleExit = () => {
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else {
      window.close();
    }
  };

  return (
    <nav className="shrink-0 h-auto bg-black/40 backdrop-blur-[30px] border-b border-white/[0.04] z-40 px-6 md:px-10 pt-5 pb-0">
      {/* Top Row: Search + Actions */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-lg group">
          <div className="relative flex items-center bg-white/[0.04] border border-white/[0.04] rounded-2xl focus-within:border-[#F7941D]/20 focus-within:bg-white/[0.06] transition-all duration-500 overflow-hidden">
             <Search className="ml-5 text-white/15 group-focus-within:text-[#F7941D] transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="Buscar..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full h-11 pl-3 pr-6 bg-transparent outline-none text-sm font-bold tracking-wide placeholder:text-white/10 focus:ring-0"
             />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.04] flex items-center justify-center text-white/10 hover:text-[#F7941D] hover:bg-[#F7941D]/10 hover:border-[#F7941D]/30 transition-all duration-500"
            title="Configurações"
          >
            <Settings size={18} />
          </button>
          <ServerSelector />
          <button
            onClick={handleExit}
            className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.04] flex items-center justify-center text-white/10 hover:bg-red-500/20 hover:border-red-500/20 hover:text-red-400 transition-all duration-500 focus:ring-2 focus:ring-red-500/30"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Category Tabs (Netflix-style) */}
      <div className="flex items-end gap-1 overflow-x-auto no-scrollbar -mb-px">
        {TABS.map(tab => {
          const isActive = activeCategory === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveCategory(tab.type)}
              className={`relative px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap rounded-t-xl outline-none
                focus:ring-2 focus:ring-[#F7941D]/30
                ${isActive 
                  ? 'text-white bg-white/[0.06]' 
                  : 'text-white/25 hover:text-white/50'
                }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#F7941D] rounded-full shadow-[0_0_10px_#F7941D]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
