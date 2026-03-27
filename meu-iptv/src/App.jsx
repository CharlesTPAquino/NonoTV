import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertCircle, RefreshCw, 
  LayoutGrid, Globe, Server
} from 'lucide-react';
import { initSpatialNavigation } from './utils/spatialNavigation';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import ChannelGrid from './components/Channels/ChannelGrid';
import UnifiedPlayer from './components/Player/UnifiedPlayer';
import { usePlayer } from './context/PlayerContext';
import { useSources } from './context/SourceContext';
import { GROUPS as INITIAL_GROUPS } from './data/channels';
import { ADULT_CONTENT_REGEX } from './constants';

/**
 * NonoTV App - Premium IPTV Experience
 * Design System: Dark theme with gold accents
 */
export default function App() {
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [activeGroup,     setActiveGroup]     = useState('All');
  const [search,          setSearch]          = useState('');

  const { activeChannel, showPlayer, playChannel, closePlayer } = usePlayer();
  const { 
    sources, 
    activeSource, 
    channels, 
    isLoading, 
    error, 
    syncStatus, 
    selectSource 
  } = useSources();

  useEffect(() => { 
    initSpatialNavigation(); 
  }, []);

  const filteredChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    return channels.filter(c => {
      if (ADULT_CONTENT_REGEX.test(c.group || '')) return false;
      
      const matchSearch   = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        (c.group || '').toLowerCase().includes(search.toLowerCase());
        
      const matchCategory = activeCategory === 'All' || (c.type || 'live') === activeCategory;
      const matchGroup    = activeGroup === 'All' || c.group === activeGroup;
      
      return matchSearch && matchCategory && matchGroup;
    });
  }, [channels, search, activeCategory, activeGroup]);

  const groups = useMemo(() => {
    if (!channels || channels.length === 0) return INITIAL_GROUPS;
    
    const base = channels.filter(c =>
      !ADULT_CONTENT_REGEX.test(c.group || '') &&
      (activeCategory === 'All' || (c.type || 'live') === activeCategory)
    );
    
    const unique = [...new Set(base.map(c => c.group).filter(Boolean))];
    return [
      { id: 1, name: 'All', icon: 'home' }, 
      ...unique.map((g, i) => ({ id: i + 2, name: g, icon: 'tv' }))
    ];
  }, [channels, activeCategory]);

  return (
    <div className="min-h-screen bg-bg-primary text-content-primary selection:bg-primary/30 font-body">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/15 blur-[120px] rounded-full mix-blend-screen opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-violet/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        setActiveCategory={(cat) => { 
          setActiveCategory(cat); 
          setActiveGroup('All'); 
        }} 
      />

      {/* Main Content */}
      <main className="md:pl-20 lg:pl-64 min-h-screen relative z-10">
        <Navbar 
          search={search} 
          setSearch={setSearch} 
          syncStatus={syncStatus} 
        />

        <div className="p-4 md:p-8 pt-24 md:pt-32 max-w-[1920px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-primary" />
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase font-display">
                    Nono<span className="text-primary">TV</span>
                 </h1>
                 <span className="text-[10px] font-black tracking-widest bg-white/5 border border-border px-3 py-1 rounded text-content-muted">ULTRA 4K v3.1</span>
              </div>
              <p className="text-content-muted font-bold uppercase tracking-widest text-[10px]">
                {activeSource ? `Sintonizado em: ${activeSource.name}` : 'Navegando nos Canais Locais'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
               <div className="flex items-center gap-3"><Globe size={14} className="text-accent-blue" /> {activeCategory}</div>
               <div className="flex items-center gap-3"><LayoutGrid size={14} className="text-accent-emerald" /> {filteredChannels.length} Canais</div>
               <div className="flex items-center gap-3"><Server size={14} className="text-primary" /> Online</div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="group relative bg-surface/80 border border-state-error/20 p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl animate-fade-in-up">
               <div className="w-20 h-20 bg-state-error/10 rounded-full flex items-center justify-center text-state-error shadow-glow-sm">
                  <AlertCircle size={32} />
               </div>
               <div className="flex-1 text-center md:text-left">
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Instabilidade no Satélite</h3>
                 <p className="text-content-tertiary font-bold leading-relaxed">{error}</p>
               </div>
               <button 
                 onClick={() => selectSource(null)} 
                 className="px-8 py-4 bg-state-error text-white font-black rounded-3xl uppercase tracking-widest text-xs shadow-elevation-lg active:scale-95 transition-all"
               >
                 Restaurar Canais Locais
               </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !channels.length && (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="relative w-28 h-28 mb-10">
                <div className="absolute inset-0 border-[6px] border-primary/10 rounded-full" />
                <div className="absolute inset-0 border-[6px] border-t-primary rounded-full animate-spin shadow-glow-sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-primary font-black uppercase tracking-[0.8em] text-xs animate-pulse">Estabelecendo Conexão Premium</p>
            </div>
          )}

          {/* Channel Grid */}
          <div className={(isLoading && !channels.length) ? 'hidden' : 'animate-fade-in'}>
            <ChannelGrid
              channels={filteredChannels}
              activeGroup={activeGroup}
              activeCategory={activeCategory}
              setActiveGroup={setActiveGroup}
              groups={groups}
              onPlay={playChannel}
              search={search}
              isPlayerOpen={showPlayer}
            />
          </div>
        </div>
      </main>

      {/* Video Player - Unified (HLS para Live, Native para VOD) */}
      {showPlayer && activeChannel && (
        <UnifiedPlayer 
          channel={activeChannel} 
          channels={filteredChannels} 
          onClose={closePlayer} 
        />
      )}

      {/* Sync Status Toast */}
      {syncStatus && !isLoading && !error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-card px-8 py-4 rounded-3xl shadow-elevation-xl flex items-center gap-5 z-[200] animate-fade-in-up">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <RefreshCw size={18} className="animate-spin" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-content-muted uppercase tracking-widest">Sinal Digital</span>
            <span className="text-[11px] font-black uppercase tracking-[0.1em]">{syncStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
}