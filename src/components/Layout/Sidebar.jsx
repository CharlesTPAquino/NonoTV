import React, { useState } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Mic, LayoutGrid, CheckCircle, XCircle, Activity } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     name: 'Início',     type: 'All',      icon: Home },
  { id: 'live',     name: 'Ao Vivo',    type: 'live',     icon: Tv },
  { id: 'vod',      name: 'Filmes',     type: 'movie',    icon: Film },
  { id: 'series',   name: 'Séries',     type: 'series',   icon: Clapperboard },
  { id: 'podcasts', name: 'Podcasts',   type: 'podcasts', icon: Mic },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList, onOpenServerStatus, search, setSearch, serverStatus }) {
  const [expanded, setExpanded] = useState(false);
  const isOnline = serverStatus === 'online' || serverStatus === 'connected';
  const isOffline = serverStatus === 'offline' || serverStatus === 'error';

  return (
    <>
      {/* DESKTOP / TV */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-full z-[100] flex-col overflow-hidden bg-[#0a0a0a] border-r border-white/[0.06] transition-all duration-200"
        style={{ width: expanded ? '220px' : '56px' }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Brand */}
        <div className="flex items-center shrink-0 h-14 px-4" style={{ gap: expanded ? '12px' : '0', justifyContent: expanded ? 'flex-start' : 'center' }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #E8913A, #F0A050)' }}>
            <span className="text-black font-bold text-[10px]">N+</span>
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <span className="text-white font-semibold text-[13px] tracking-tight leading-none block">NonoTV</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 h-px bg-white/[0.04]" />

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className="nav-item w-full"
                style={{
                  padding: expanded ? '6px 8px' : '6px 0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: isActive ? 'var(--surface-active)' : 'transparent',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {expanded && (
                  <span className="text-[12px] font-medium truncate">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 h-px bg-white/[0.04]" />

        {/* Bottom */}
        <div className="p-2 space-y-0.5 shrink-0">
          <button
            onClick={onOpenChannelList}
            className="nav-item w-full"
            style={{
              padding: expanded ? '6px 8px' : '6px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
            }}
          >
            <LayoutGrid size={18} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className="text-[12px] font-medium">Canais</span>}
          </button>

          <div
            className="flex items-center"
            style={{
              padding: expanded ? '6px 8px' : '6px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
              color: isOnline ? 'var(--success)' : isOffline ? 'var(--error)' : 'var(--text-tertiary)',
            }}
          >
            {isOnline && <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" />}
            {isOffline && <XCircle size={16} strokeWidth={1.5} className="shrink-0" />}
            {!isOnline && !isOffline && <Activity size={16} strokeWidth={1.5} className="shrink-0 animate-pulse" />}
            {expanded && (
              <span className="text-[12px] font-medium">
                {isOnline ? 'Online' : isOffline ? 'Offline' : '...'}
              </span>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="nav-item w-full"
            style={{
              padding: expanded ? '6px 8px' : '6px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
            }}
          >
            <Settings size={18} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className="text-[12px] font-medium">Ajustes</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE/TABLET */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-[#0a0a0a] border-t border-white/[0.06]">
        <div className="flex items-center justify-around h-14 px-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className="relative flex flex-col items-center justify-center w-12 h-full"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                {isActive && (
                  <div className="absolute -top-[1px] w-4 h-[2px] rounded-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
          <button
            onClick={onOpenServerStatus || onOpenSettings}
            className="flex flex-col items-center justify-center w-12 h-full"
            style={{ color: isOnline ? 'var(--success)' : isOffline ? 'var(--error)' : 'var(--text-tertiary)' }}
          >
            {isOnline && <CheckCircle size={18} strokeWidth={1.5} />}
            {isOffline && <XCircle size={18} strokeWidth={1.5} />}
            {!isOnline && !isOffline && <Activity size={18} strokeWidth={1.5} />}
          </button>
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center w-12 h-full"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </>
  );
}
