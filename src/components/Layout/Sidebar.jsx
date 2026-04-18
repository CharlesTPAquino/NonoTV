import React, { useState, useRef, useEffect } from 'react';
import { Home, Tv, Film, Clapperboard, Settings, Mic, LayoutGrid, CheckCircle, XCircle, Activity } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useDevice } from '../../hooks/useDevice';

const NAV_ITEMS = [
  { id: 'home',     name: 'Início',   type: 'All',      icon: Home },
  { id: 'live',     name: 'Ao Vivo',  type: 'live',     icon: Tv },
  { id: 'vod',      name: 'Filmes',   type: 'movie',    icon: Film },
  { id: 'series',   name: 'Séries',   type: 'series',   icon: Clapperboard },
  { id: 'podcasts', name: 'Podcasts', type: 'podcasts', icon: Mic },
];

export default function Sidebar({ activeCategory, setActiveCategory, onOpenSettings, onOpenChannelList, onOpenServerStatus, serverStatus }) {
  const { isTV } = useDevice();
  const [expanded, setExpanded] = useState(isTV);
  const hideTimerRef = useRef(null);

  const isOnline = serverStatus === 'online' || serverStatus === 'connected';
  const isOffline = serverStatus === 'offline' || serverStatus === 'error';

  // Auto-hide após 3 segundos de inatividade
  const startHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setExpanded(false), 3000);
  };

  // Handlers adaptativos: mouse para desktop, foco para TV
  const expandHandlers = isTV
    ? {
        onFocus: () => {
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          setExpanded(true);
        },
        onBlur: (e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false);
        }
      }
    : {
        onMouseEnter: () => {
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          setExpanded(true);
        },
        onMouseLeave: () => startHideTimer(),
      };

  // Quando não está expandido, começa timer para colapsar
  useEffect(() => {
    if (!expanded && !isTV) {
      startHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [expanded, isTV]);

  const sidebarWidth = isTV ? (expanded ? '240px' : '88px') : (expanded ? '224px' : '68px');

  return (
    <>
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-full z-[100] flex-col overflow-hidden"
        style={{
          width: sidebarWidth,
          background: 'var(--surface-sidebar)',
          borderRight: '1px solid var(--border-1)',
          transition: 'width 200ms cubic-bezier(0.25,0.1,0.25,1)',
          paddingTop: 'var(--safe-top)',
        }}
        {...expandHandlers}
      >
        {/* Brand */}
        <div className="flex items-center shrink-0 h-16 px-4"
          style={{ gap: expanded ? '12px' : '0', justifyContent: expanded ? 'flex-start' : 'center' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logoImg} alt="N+" className="w-full h-full object-contain" />
          </div>
          {expanded && <span className="text-white font-semibold text-[14px] tracking-tight">NonoTV</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto custom-scrollbar" data-nav-zone="sidebar">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.type)}
                // CORREÇÃO: tabIndex e classe nav-item para D-pad funcionar
                tabIndex={0}
                className={`nav-item w-full ${isActive ? 'active' : ''}`}
                style={{
                  padding: expanded ? '10px 12px' : '10px 0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  gap: expanded ? '16px' : '0',
                  color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                  // TV: alvos maiores
                  minHeight: isTV ? '64px' : undefined,
                }}
              >
                <Icon size={isTV ? 28 : 24} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {expanded && <span className={`font-medium truncate ${isTV ? 'text-[15px]' : 'text-[13px]'}`}>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 space-y-1 shrink-0">
          <div className="h-px mx-2 mb-2" style={{ background: 'var(--border-1)' }} />
          <button
            onClick={onOpenChannelList}
            tabIndex={0}
            className="nav-item w-full"
            style={{ padding: expanded ? '10px 12px' : '10px 0', justifyContent: expanded ? 'flex-start' : 'center', gap: expanded ? '16px' : '0', color: 'var(--text-2)' }}
          >
            <LayoutGrid size={isTV ? 28 : 24} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className={`font-medium ${isTV ? 'text-[15px]' : 'text-[13px]'}`}>Canais</span>}
          </button>
          <button
            onClick={onOpenSettings}
            tabIndex={0}
            className="nav-item w-full"
            style={{ padding: expanded ? '10px 12px' : '10px 0', justifyContent: expanded ? 'flex-start' : 'center', gap: expanded ? '16px' : '0', color: 'var(--text-2)' }}
          >
            <Settings size={isTV ? 28 : 24} strokeWidth={1.5} className="shrink-0" />
            {expanded && <span className={`font-medium ${isTV ? 'text-[15px]' : 'text-[13px]'}`}>Ajustes</span>}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — Premium Redesign */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] safe-bottom" data-nav-zone="bottomnav"
        style={{ 
          background: 'rgba(10, 10, 12, 0.85)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
        }}>
        <div className="flex items-center justify-around h-16 md:h-20 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.type;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveCategory(item.type)}
                className="relative flex flex-col items-center justify-center min-w-[64px] h-full transition-all active:scale-90"
                style={{ color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.3)' }}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-red-600/10' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[9px] font-bold mt-1 tracking-wider uppercase transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-[2px] bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]" />
                )}
              </button>
            );
          })}
          <button 
            onClick={onOpenSettings} 
            className="flex flex-col items-center justify-center min-w-[64px] h-full transition-all active:scale-90 text-white/30"
          >
            <div className="p-1.5 rounded-xl">
              <Settings size={20} strokeWidth={1.5} />
            </div>
            <span className="text-[9px] font-bold mt-1 tracking-wider uppercase opacity-40">
              Ajustes
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}