import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  AlertCircle, RefreshCw, Search, 
  Activity, Clock, LogOut, LayoutGrid, Globe, Server
} from 'lucide-react';
import { initSpatialNavigation } from './utils/spatialNavigation';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import ChannelGrid from './components/Channels/ChannelGrid';
import VideoPlayer from './components/Player/VideoPlayer';
import { usePlayer } from './context/PlayerContext';
import { useSources } from './context/SourceContext';
import { GROUPS as INITIAL_GROUPS } from './data/channels';

/**
 * REFAZENDO O APP (NONO 3.1)
 * Estratégia: Simplicidade Indestrutível + Design Premium
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

  // Inicializa Spatial Navigation para Android TV
  useEffect(() => { 
    initSpatialNavigation(); 
  }, []);

  const filteredChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    return channels.filter(c => {
      // Proteção de Conteúdo
      if (/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '')) return false;
      
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
      !(/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '')) &&
      (activeCategory === 'All' || (c.type || 'live') === activeCategory)
    );
    
    const unique = [...new Set(base.map(c => c.group).filter(Boolean))];
    return [
      { id: 1, name: 'All', icon: 'home' }, 
      ...unique.map((g, i) => ({ id: i + 2, name: g, icon: 'tv' }))
    ];
  }, [channels, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white selection:bg-[#F7941D]/30 font-inter">
      {/* Background Dinâmico Premium */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F7941D]/15 blur-[120px] rounded-full mix-blend-screen opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5]/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-black opacity-30" />
      </div>

      {/* Sidebar de Navegação */}
      <Sidebar 
        activeCategory={activeCategory} 
        setActiveCategory={(cat) => { 
          setActiveCategory(cat); 
          setActiveGroup('All'); 
        }} 
      />

      {/* Área Principal */}
      <main className="md:pl-20 lg:pl-64 min-h-screen relative z-10">
        <Navbar 
          search={search} 
          setSearch={setSearch} 
          syncStatus={syncStatus} 
        />

        <div className="p-4 md:p-8 pt-24 md:pt-32 max-w-[1920px] mx-auto">
          {/* Dashboard Info Area */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-[#F7941D]" />
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase font-outfit">
                    Nono<span className="text-[#F7941D]">TV</span>
                 </h1>
                 <span className="text-[10px] font-black tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded text-white/40">ULTRA 4K v3.1</span>
              </div>
              <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">
                {activeSource ? `Sintonizado em: ${activeSource.name}` : 'Navegando nos Canais Locais'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
               <div className="flex items-center gap-3"><Globe size={14} className="text-blue-500" /> {activeCategory}</div>
               <div className="flex items-center gap-3"><LayoutGrid size={14} className="text-emerald-500" /> {filteredChannels.length} Canais</div>
               <div className="flex items-center gap-3"><Server size={14} className="text-orange-500" /> Online</div>
            </div>
          </div>

          {/* Erro Banner (Moderno) */}
          {error && (
            <div className="group relative bg-[#1A1C22]/80 border border-red-500/20 p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl animate-in fade-in slide-in-from-top duration-700">
               <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                  <AlertCircle size={32} />
               </div>
               <div className="flex-1 text-center md:text-left">
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Instabilidade no Satélite</h3>
                 <p className="text-white/40 font-bold leading-relaxed">{error}</p>
               </div>
               <button 
                 onClick={() => selectSource(null)} 
                 className="px-8 py-4 bg-red-500 text-white font-black rounded-3xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
               >
                 Restaurar Canais Locais
               </button>
            </div>
          )}

          {/* Estado de Carregamento */}
          {isLoading && !channels.length && (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="relative w-28 h-28 mb-10">
                <div className="absolute inset-0 border-[6px] border-[#F7941D]/10 rounded-full" />
                <div className="absolute inset-0 border-[6px] border-t-[#F7941D] rounded-full animate-spin shadow-[0_0_30px_#F7941D]" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-[#F7941D] rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-[#F7941D] font-black uppercase tracking-[0.8em] text-xs animate-pulse">Estabelecendo Conexão Premium</p>
            </div>
          )}

          {/* Grid Principal */}
          <div className={(isLoading && !channels.length) ? 'hidden' : 'animate-in fade-in duration-1000'}>
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

      {/* Video Player (Overlay de Cinema) */}
      {showPlayer && activeChannel && (
        <VideoPlayer 
          channel={activeChannel} 
          channels={filteredChannels} 
          onClose={closePlayer} 
        />
      )}

      {/* Status de Sincronização (Discreto e Premium) */}
      {syncStatus && !isLoading && !error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1C22]/90 border border-white/5 backdrop-blur-3xl px-8 py-4 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-5 z-[200] animate-in slide-in-from-bottom duration-700">
          <div className="w-10 h-10 rounded-2xl bg-[#F7941D]/10 flex items-center justify-center text-[#F7941D]">
            <RefreshCw size={18} className="animate-spin" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sinal Digital</span>
            <span className="text-[11px] font-black uppercase tracking-[0.1em]">{syncStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
}
