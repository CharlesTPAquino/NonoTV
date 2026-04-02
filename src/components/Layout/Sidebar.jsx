import React, { useState } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Menu, History, ThumbsUp, PlaySquare, ChevronLeft, ChevronRight, RefreshCw, Activity, Search, Mic, LayoutGrid } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     name: 'Início',     type: 'All',      icon: Home },
  { id: 'live',     name: 'Ao Vivo',    type: 'live',     icon: Tv },
  { id: 'vod',      name: 'Filmes',     type: 'movie',    icon: Film },
  { id: 'series',   name: 'Séries',     type: 'series',   icon: Clapperboard },
  { id: 'podcasts', name: 'Podcasts',   type: 'podcasts', icon: Mic },
];

const LIBRARY_ITEMS = [
  { id: 'history',  name: 'Histórico',   icon: History },
  { id: 'liked',    name: 'Curtidos',    icon: ThumbsUp },
  { id: 'playlist', name: 'Playlists',   icon: PlaySquare },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList, onOpenSync, onOpenServerStatus, search, setSearch }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* DESKTOP / TV - ULTRA ELITE 4K REFLECTIVE GLASS */}
      <aside 
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-[#050505]/40 backdrop-blur-[40px] border-r border-white/5 z-[100] transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)] group overflow-hidden ${
          expanded ? 'w-[280px]' : 'w-[88px]'
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Top Glossy Reflection */}
        <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
        
        {/* Brand Header */}
        <div className={`flex items-center h-24 relative ${expanded ? 'px-8 gap-4' : 'justify-center px-0'}`}>
          <div className="relative group/logo">
             <div className="absolute -inset-2 bg-[#F7941D] rounded-2xl blur-lg opacity-20 group-hover/logo:opacity-50 transition-opacity duration-500" />
             <div className="relative w-12 h-12 bg-gradient-to-br from-[#F7941D] to-[#FBB03B] rounded-2xl flex items-center justify-center shadow-[0_0_20px_#F7941D]/30 border border-white/20">
               <img src="/logo.png" alt="NonoTV" className="w-8 h-8 object-contain drop-shadow-lg" />
             </div>
          </div>
          {expanded && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-white font-black text-xl tracking-tighter uppercase leading-none">NonoTV</span>
              <span className="text-[#F7941D] text-[9px] font-black uppercase tracking-[0.4em] mt-1">Elite 4K</span>
            </div>
          )}
        </div>

        {/* Search Integration */}
        {expanded && (
          <div className="px-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative flex items-center bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl group-focus-within:border-[#F7941D]/50 transition-all">
              <Search className="ml-4 text-white/20 group-focus-within:text-[#F7941D] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Busca global..." 
                value={search}
                onChange={(e) => setSearch && setSearch(e.target.value)}
                className="w-full h-12 pl-3 pr-4 bg-transparent outline-none text-sm font-bold text-white placeholder:text-white/10 uppercase tracking-widest"
              />
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar overflow-x-hidden space-y-8">
          
          {/* Main Navigation */}
          <div className={`space-y-1 ${expanded ? 'px-5' : 'px-4'}`}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeCategory === item.type;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.type)}
                  className={`relative w-full flex items-center rounded-2xl transition-all duration-500 group/btn
                    ${expanded ? 'px-5 py-4 gap-5' : 'justify-center py-5 px-0'}
                    ${isActive 
                      ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
                      : 'text-white/30 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {/* Active Indicator Line */}
                  {!expanded && isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-[#F7941D] rounded-r-full shadow-[0_0_10px_#F7941D]" />
                  )}
                  
                  <Icon size={24} className={`shrink-0 transition-transform duration-500 ${isActive ? '' : 'group-hover/btn:scale-110'}`} />
                  
                  {expanded && (
                    <span className="text-xs font-black uppercase tracking-[0.2em] flex-1 text-left">{item.name}</span>
                  )}

                  {expanded && isActive && (
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Library Section */}
          <div className={`space-y-4 ${expanded ? 'px-5' : 'px-4'}`}>
            {expanded && (
              <h3 className="px-5 text-[10px] font-black text-white/10 uppercase tracking-[0.5em] mb-4">
                Biblioteca
              </h3>
            )}
            <div className="space-y-1">
              {LIBRARY_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center transition-all duration-300 rounded-2xl text-white/30 hover:text-white hover:bg-white/5
                      ${expanded ? 'px-5 py-4 gap-5' : 'justify-center py-5 px-0'}`}
                  >
                    <Icon size={22} className="shrink-0" />
                    {expanded && <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Center */}
          <div className={`space-y-1 ${expanded ? 'px-5' : 'px-4'}`}>
            <button
              onClick={onOpenChannelList}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl bg-[#F7941D]/5 text-[#F7941D] hover:bg-[#F7941D]/10 border border-[#F7941D]/10
                ${expanded ? 'px-5 py-4 gap-5' : 'justify-center py-5 px-0'}`}
            >
              <LayoutGrid size={22} className="shrink-0" />
              {expanded && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Todos os Canais</span>}
            </button>
          </div>
        </div>

        {/* Footer - Reflective Controls */}
        <div className={`p-5 mt-auto border-t border-white/5 bg-white/5 backdrop-blur-3xl transition-all duration-500 ${expanded ? 'opacity-100' : 'opacity-100'}`}>
          <div className={`flex flex-col gap-2 ${expanded ? '' : 'items-center'}`}>
            {onOpenServerStatus && (
              <button
                onClick={onOpenServerStatus}
                className={`flex items-center rounded-xl text-white/30 hover:text-[#F7941D] hover:bg-white/5 transition-all
                  ${expanded ? 'px-4 py-3 gap-4 w-full' : 'w-12 h-12 justify-center'}`}
                title="Status do Servidor"
              >
                <Activity size={20} />
                {expanded && <span className="text-[9px] font-black uppercase tracking-widest">Servidores</span>}
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className={`flex items-center rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all
                ${expanded ? 'px-4 py-3 gap-4 w-full' : 'w-12 h-12 justify-center'}`}
              title="Configurações"
            >
              <Settings size={20} />
              {expanded && <span className="text-[9px] font-black uppercase tracking-widest">Ajustes</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE - ULTRA SLICK BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#050505]/80 backdrop-blur-[50px] border-t border-white/10 z-[200] flex items-center justify-around px-6 safe-area-bottom shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        {/* Reflection */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F7941D]/50 to-transparent" />
        
        {NAV_ITEMS.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeCategory === item.type;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.type)}
              className={`relative flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-all duration-500
                ${isActive ? 'text-[#F7941D] -translate-y-1' : 'text-white/20'}`}
            >
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-[#F7941D] rounded-full shadow-[0_0_15px_#F7941D]" />
              )}
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}