import React, { useState } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Mic, LayoutGrid, CheckCircle, XCircle, Activity, Search, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     name: 'Início',     type: 'All',      icon: Home },
  { id: 'live',     name: 'AO VIVO',    type: 'live',     icon: Tv },
  { id: 'vod',      name: 'Filmes',     type: 'movie',    icon: Film },
  { id: 'series',   name: 'Séries',     type: 'series',   icon: Clapperboard },
  { id: 'podcasts', name: 'Podcasts',   type: 'podcasts', icon: Mic },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList, onOpenSync, onOpenServerStatus, search, setSearch, serverStatus }) {
  const [expanded, setExpanded] = useState(false);

  const isOnline = serverStatus === 'online' || serverStatus === 'connected';
  const isOffline = serverStatus === 'offline' || serverStatus === 'error';

  return (
    <>
      {/* DESKTOP / TV — Premium Glass Sidebar */}
      <aside 
        className={`hidden lg:flex fixed left-0 top-0 h-full z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col group overflow-hidden backdrop-blur-[60px] ${
          expanded ? 'w-[240px]' : 'w-[64px]'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(18,18,20,0.95) 0%, rgba(12,12,14,0.98) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Ambient glow behind sidebar */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Brand */}
        <div className={`flex items-center shrink-0 ${expanded ? 'px-6 h-20 gap-3' : 'justify-center h-20'}`}>
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F7941D 0%, #FBB03B 100%)' }}>
              <span className="text-black font-black text-sm">N+</span>
            </div>
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <span className="text-white font-semibold text-sm tracking-tight leading-none block">NonoTV</span>
              <span className="text-white/20 text-[8px] font-medium tracking-[0.2em] uppercase">Elite</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.04]" />

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className={`relative w-full flex items-center rounded-xl transition-all duration-300 group/btn ${
                  expanded ? 'px-3 py-2.5 gap-3' : 'justify-center py-2.5'
                } ${isActive 
                  ? 'text-white' 
                  : 'text-white/35 hover:text-white/60'
                }`}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: 'linear-gradient(180deg, #F7941D, #FBB03B)' }} />
                )}
                
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0 transition-all duration-300" />
                
                {expanded && (
                  <span className="text-[11px] font-medium tracking-wide truncate">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.04]" />

        {/* Bottom Section */}
        <div className="p-3 space-y-1 shrink-0">
          {/* All Channels */}
          <button
            onClick={onOpenChannelList}
            className={`w-full flex items-center rounded-xl transition-all duration-300 text-white/35 hover:text-white/60 group/btn ${
              expanded ? 'px-3 py-2.5 gap-3' : 'justify-center py-2.5'
            }`}
          >
            <LayoutGrid size={20} strokeWidth={1.8} className="shrink-0" />
            {expanded && <span className="text-[11px] font-medium tracking-wide">Canais</span>}
          </button>

          {/* Server Status */}
          <div className={`flex items-center rounded-xl transition-all duration-300 ${
            expanded ? 'px-3 py-2.5 gap-3' : 'justify-center py-2.5'
          } ${isOnline ? 'text-green-400/60' : isOffline ? 'text-red-400/60' : 'text-white/20'}`}>
            {isOnline && <CheckCircle size={16} strokeWidth={1.8} className="shrink-0" />}
            {isOffline && <XCircle size={16} strokeWidth={1.8} className="shrink-0" />}
            {!isOnline && !isOffline && <Activity size={16} strokeWidth={1.8} className="shrink-0 animate-pulse" />}
            {expanded && (
              <span className="text-[11px] font-medium tracking-wide">
                {isOnline ? 'Online' : isOffline ? 'Offline' : '...'}
              </span>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center rounded-xl transition-all duration-300 text-white/35 hover:text-white/60 group/btn ${
              expanded ? 'px-3 py-2.5 gap-3' : 'justify-center py-2.5'
            }`}
          >
            <Settings size={20} strokeWidth={1.8} className="shrink-0 group-hover/btn:rotate-45 transition-transform duration-500" />
            {expanded && <span className="text-[11px] font-medium tracking-wide">Ajustes</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE/TABLET — Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] safe-area-bottom" style={{
        background: 'linear-gradient(180deg, rgba(18,18,20,0.97) 0%, rgba(12,12,14,0.99) 100%)',
        backdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className="relative flex flex-col items-center justify-center w-14 h-full transition-all duration-300"
              >
                <div className={`transition-all duration-300 ${isActive ? 'text-[#F7941D]' : 'text-white/30'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                {isActive && (
                  <div className="absolute -top-[1px] w-5 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #F7941D, #FBB03B)' }} />
                )}
              </button>
            );
          })}

          {/* Server Status */}
          <button
            onClick={onOpenServerStatus || onOpenSettings}
            className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-300 ${
              isOnline ? 'text-green-400/50' : isOffline ? 'text-red-400/50' : 'text-white/20'
            }`}
          >
            {isOnline && <CheckCircle size={20} strokeWidth={1.8} />}
            {isOffline && <XCircle size={20} strokeWidth={1.8} />}
            {!isOnline && !isOffline && <Activity size={20} strokeWidth={1.8} />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center w-14 h-full text-white/30 transition-all duration-300"
          >
            <Settings size={22} strokeWidth={1.8} />
          </button>
        </div>
      </nav>
    </>
  );
}
