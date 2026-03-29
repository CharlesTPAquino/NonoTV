import React, { useState } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Menu, History, ThumbsUp, PlaySquare, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',   name: 'Início',     type: 'All',    icon: Home },
  { id: 'live',   name: 'Ao Vivo',    type: 'live',   icon: Tv },
  { id: 'vod',    name: 'Filmes',     type: 'movie',  icon: Film },
  { id: 'series', name: 'Séries',     type: 'series', icon: Clapperboard },
];

const LIBRARY_ITEMS = [
  { id: 'history',  name: 'Histórico',   icon: History },
  { id: 'liked',    name: 'Curtidos',    icon: ThumbsUp },
  { id: 'playlist', name: 'Playlists',   icon: PlaySquare },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* DESKTOP / TV - Collapsible YouTube Style */}
      <aside 
        className={`hidden lg:block fixed left-0 top-0 h-full bg-[#0F0F0F] border-r border-[#27272A] z-50 transition-all duration-300 ease-in-out flex flex-col ${
          expanded ? 'w-[240px]' : 'w-[72px]'
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Header */}
        <div className={`flex items-center h-14 border-b border-[#27272A] ${expanded ? 'px-5 gap-3' : 'justify-center px-0'}`}>
          <div className="w-8 h-8 bg-[#F7941D] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          {expanded && (
            <span className="text-white font-semibold text-lg truncate">NonoTV</span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar overflow-x-hidden">
          
          {/* Main Navigation */}
          <div className={`${expanded ? 'px-3' : 'px-0'}`}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeCategory === item.type;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.type)}
                  className={`w-full flex items-center rounded-xl transition-colors mb-0.5
                    ${expanded 
                      ? 'px-4 py-3 gap-4' 
                      : 'justify-center py-3 px-0'
                    }
                    ${isActive 
                      ? 'bg-[#27272A] text-white' 
                      : 'text-[#AAAAAA] hover:bg-[#27272A]/50 hover:text-white'
                    }`}
                >
                  <Icon size={22} className={isActive ? 'text-[#F7941D]' : 'shrink-0'} />
                  {expanded && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">{item.name}</span>
                      {isActive && (
                        <div className="w-1 h-6 bg-[#F7941D] rounded-full" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          {expanded && <div className="h-px bg-[#27272A] mx-4 my-3" />}

          {/* Library Section */}
          {expanded && (
            <div className="px-3">
              <h3 className="px-4 text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">
                Biblioteca
              </h3>
              {LIBRARY_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-[#AAAAAA] hover:bg-[#27272A]/50 hover:text-white"
                  >
                    <Icon size={22} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {expanded && <div className="h-px bg-[#27272A] mx-4 my-3" />}

          {/* Channels Button */}
          {expanded && (
            <div className="px-3">
              <button
                onClick={onOpenChannelList}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-[#AAAAAA] hover:bg-[#27272A]/50 hover:text-white"
              >
                <Menu size={22} />
                <span className="text-sm font-medium">Todos os Canais</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {expanded && (
          <div className="px-3 py-4 border-t border-[#27272A]">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-[#AAAAAA] hover:bg-[#27272A]/50 hover:text-white"
            >
              <Settings size={22} />
              <span className="text-sm font-medium">Configurações</span>
            </button>
          </div>
        )}
      </aside>

      {/* MEDIUM SCREENS - Collapsed with toggle */}
      <aside className="hidden md:flex lg:hidden fixed left-0 top-0 h-full w-[72px] bg-[#0F0F0F] border-r border-[#27272A] flex-col items-center pt-4 z-50">
        <div className="w-10 h-10 bg-[#F7941D] rounded-xl flex items-center justify-center mb-6">
          <span className="text-white font-bold text-sm">N</span>
        </div>

        <nav className="flex flex-col items-center gap-1 w-full px-2 flex-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${isActive 
                    ? 'bg-[#27272A] text-white' 
                    : 'text-[#AAAAAA] hover:bg-[#27272A]/50 hover:text-white'
                  }`}
                title={item.name}
              >
                <Icon size={22} className={isActive ? 'text-[#F7941D]' : ''} />
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 w-full px-2 pb-4">
          <button 
            onClick={onOpenSettings}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[#AAAAAA] hover:bg-[#27272A]/50 hover:text-white"
            title="Configurações"
          >
            <Settings size={22} />
          </button>
        </div>
      </aside>

      {/* MOBILE - Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F0F0F] border-t border-[#27272A] z-50 flex items-center justify-around px-2 safe-area-bottom">
        {NAV_ITEMS.slice(0, 4).map(item => {
          const Icon = item.icon;
          const isActive = activeCategory === item.type;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.type)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors
                ${isActive ? 'text-[#F7941D]' : 'text-[#71717A]'}`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
