import React, { useState } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Mic, LayoutGrid, CheckCircle, XCircle, Activity } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     name: 'Início',     type: 'All',      icon: Home },
  { id: 'live',     name: 'Ao Vivo',    type: 'live',     icon: Tv },
  { id: 'vod',      name: 'Filmes',     type: 'movie',    icon: Film },
  { id: 'series',   name: 'Séries',     type: 'series',   icon: Clapperboard },
  { id: 'podcasts', name: 'Podcasts',   type: 'podcasts', icon: Mic },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList, onOpenServerStatus, serverStatus }) {
  const [expanded, setExpanded] = useState(false);
  const isOnline = serverStatus === 'online' || serverStatus === 'connected';
  const isOffline = serverStatus === 'offline' || serverStatus === 'error';

  return (
    <>
      {/* DESKTOP / TV — Premium Matte Sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-full z-[100] flex-col overflow-hidden transition-all duration-200"
        style={{
          width: expanded ? '200px' : '48px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Brand */}
        <div className="flex items-center shrink-0 h-12 px-3" style={{ gap: expanded ? '10px' : '0', justifyContent: expanded ? 'flex-start' : 'center' }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--text-primary)' }}>
            <span className="text-black font-bold text-[9px]">N+</span>
          </div>
          {expanded && (
            <span className="text-white font-semibold text-[12px] tracking-tight leading-none">NonoTV</span>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 h-px" style={{ background: 'var(--border-subtle)' }} />

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
                  padding: expanded ? '5px 8px' : '5px 0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {expanded && (
                  <span className="text-[11px] font-medium truncate">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 h-px" style={{ background: 'var(--border-subtle)' }} />

        {/* Bottom */}
        <div className="p-2 space-y-0.5 shrink-0">
          <button
            onClick={onOpenChannelList}
            className="nav-item w-full"
            style={{
              padding: expanded ? '5px 8px' : '5px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
            }}
          >
            <LayoutGrid size={16} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className="text-[11px] font-medium">Canais</span>}
          </button>

          <div
            className="flex items-center"
            style={{
              padding: expanded ? '5px 8px' : '5px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
              color: isOnline ? 'var(--success)' : isOffline ? 'var(--error)' : 'var(--text-tertiary)',
            }}
          >
            {isOnline && <CheckCircle size={14} strokeWidth={1.5} className="shrink-0" />}
            {isOffline && <XCircle size={14} strokeWidth={1.5} className="shrink-0" />}
            {!isOnline && !isOffline && <Activity size={14} strokeWidth={1.5} className="shrink-0 animate-pulse" />}
            {expanded && (
              <span className="text-[11px] font-medium">
                {isOnline ? 'Online' : isOffline ? 'Offline' : '...'}
              </span>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="nav-item w-full"
            style={{
              padding: expanded ? '5px 8px' : '5px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
            }}
          >
            <Settings size={16} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className="text-[11px] font-medium">Ajustes</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE/TABLET */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[200]"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-around h-14 px-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className="relative flex flex-col items-center justify-center w-12 h-full transition-all duration-180"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {isActive && (
                  <div className="absolute -top-[1px] w-3 h-[2px] rounded-full" style={{ background: 'var(--text-primary)' }} />
                )}
              </button>
            );
          })}
          <button
            onClick={onOpenServerStatus || onOpenSettings}
            className="flex flex-col items-center justify-center w-12 h-full transition-all duration-180"
            style={{ color: isOnline ? 'var(--success)' : isOffline ? 'var(--error)' : 'var(--text-tertiary)' }}
          >
            {isOnline && <CheckCircle size={16} strokeWidth={1.5} />}
            {isOffline && <XCircle size={16} strokeWidth={1.5} />}
            {!isOnline && !isOffline && <Activity size={16} strokeWidth={1.5} />}
          </button>
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center w-12 h-full transition-all duration-180"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </>
  );
}
