import React from 'react';
import { Search, LogOut, Settings, List, Menu } from 'lucide-react';
import ServerSelector from './ServerSelector';

const TABS = [
  { type: 'All',    label: 'Todos' },
  { type: 'live',   label: 'Ao Vivo' },
  { type: 'movie',  label: 'Filmes' },
  { type: 'series', label: 'Séries' },
];

export default function Navbar({ search, setSearch, syncStatus, activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList }) {
  const handleExit = () => {
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else {
      window.close();
    }
  };

  return (
    <nav className="shrink-0 h-auto bg-[#18181B]/80 backdrop-blur-xl border-b border-[#27272A] z-40 px-6 md:px-10 pt-5 pb-0">
      {/* Top Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F7941D] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-white font-bold text-lg hidden sm:block">NonoTV</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-4">
          <div className="relative flex items-center bg-[#27272A] border border-transparent focus-within:border-[#F7941D] rounded-xl transition-colors">
            <Search className="ml-4 text-[#71717A]" size={16} />
            <input 
              type="text" 
              placeholder="Buscar canais..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-3 pr-4 bg-transparent outline-none text-sm text-white placeholder:text-[#52525B]"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {onOpenChannelList && (
            <button
              onClick={onOpenChannelList}
              className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] transition-colors"
            >
              <Menu size={18} />
            </button>
          )}
          <ServerSelector />
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px pb-1">
        {TABS.map(tab => {
          const isActive = activeCategory === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveCategory(tab.type)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors
                ${isActive 
                  ? 'text-white bg-[#27272A] border border-[#3F3F46] border-b-transparent' 
                  : 'text-[#71717A] hover:text-white hover:bg-[#27272A]/50'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
