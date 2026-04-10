import React, { useState } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Mic, LayoutGrid, CheckCircle, XCircle, Activity } from 'lucide-react';
import logoImg from '../../assets/logo.png';

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
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-full z-[100] flex-col overflow-hidden"
        style={{
          width: expanded ? '224px' : '68px',
          background: 'var(--surface-sidebar)',
          borderRight: '1px solid var(--border-1)',
          transition: 'width 200ms cubic-bezier(0.25,0.1,0.25,1)',
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom, 0px)',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Brand */}
        <div className="flex items-center shrink-0 h-16 px-4" style={{ gap: expanded ? '12px' : '0', justifyContent: expanded ? 'flex-start' : 'center' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logoImg} alt="N+" className="w-full h-full object-contain" />
          </div>
          {expanded && <span className="text-white font-semibold text-[14px] tracking-tight">NonoTV</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                className="nav-item w-full"
                style={{
                  padding: expanded ? '10px 12px' : '10px 0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  gap: expanded ? '16px' : '0',
                  color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                }}
              >
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {expanded && <span className="text-[13px] font-medium truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 space-y-1 shrink-0">
          <div className="h-px mx-2 mb-2" style={{ background: 'var(--border-1)' }} />
          <button
            onClick={onOpenChannelList}
            className="nav-item w-full"
            style={{ padding: expanded ? '10px 12px' : '10px 0', justifyContent: expanded ? 'flex-start' : 'center', gap: expanded ? '16px' : '0', color: 'var(--text-2)' }}
          >
            <LayoutGrid size={24} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className="text-[13px] font-medium">Canais</span>}
          </button>
          <div
            className="flex items-center"
            style={{ padding: expanded ? '10px 12px' : '10px 0', justifyContent: expanded ? 'flex-start' : 'center', gap: expanded ? '16px' : '0', color: isOnline ? 'var(--status-ok)' : isOffline ? 'var(--status-err)' : 'var(--text-3)' }}
          >
            {isOnline && <CheckCircle size={24} strokeWidth={1.5} className="shrink-0" />}
            {isOffline && <XCircle size={24} strokeWidth={1.5} className="shrink-0" />}
            {!isOnline && !isOffline && <Activity size={24} strokeWidth={1.5} className="shrink-0 animate-pulse" />}
            {expanded && <span className="text-[13px] font-medium">{isOnline ? 'Online' : isOffline ? 'Offline' : '...'}</span>}
          </div>
          <button
            onClick={onOpenSettings}
            className="nav-item w-full"
            style={{ padding: expanded ? '10px 12px' : '10px 0', justifyContent: expanded ? 'flex-start' : 'center', gap: expanded ? '16px' : '0', color: 'var(--text-2)' }}
          >
            <Settings size={24} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className="text-[13px] font-medium">Ajustes</span>}
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200]" data-nav-zone="bottomnav" style={{ background: 'var(--surface-sidebar)', borderTop: '1px solid var(--border-1)' }}>
        <div className="flex items-center justify-around h-16 px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button key={item.id} onClick={() => setActiveCategory(item.type)} className="relative flex flex-col items-center justify-center w-14 h-full" style={{ color: isActive ? 'var(--text-1)' : 'var(--text-2)' }}>
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                {isActive && <div className="absolute -top-[1px] w-4 h-[2px] rounded-full" style={{ background: 'var(--text-1)' }} />}
              </button>
            );
          })}
          <button onClick={onOpenServerStatus || onOpenSettings} className="flex flex-col items-center justify-center w-14 h-full" style={{ color: isOnline ? 'var(--status-ok)' : isOffline ? 'var(--status-err)' : 'var(--text-3)' }}>
            {isOnline && <CheckCircle size={20} strokeWidth={1.5} />}
            {isOffline && <XCircle size={20} strokeWidth={1.5} />}
            {!isOnline && !isOffline && <Activity size={20} strokeWidth={1.5} />}
          </button>
          <button onClick={onOpenSettings} className="flex flex-col items-center justify-center w-14 h-full" style={{ color: 'var(--text-2)' }}>
            <Settings size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </>
  );
}
