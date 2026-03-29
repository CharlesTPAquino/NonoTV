import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  AlertCircle, RefreshCw, Search, 
  Activity, Clock, LogOut, LayoutGrid, Globe, Server, Sparkles
} from 'lucide-react';
import { initSpatialNavigation } from './utils/spatialNavigation';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import ChannelGrid from './components/Channels/ChannelGrid';
import ChannelListOverlay from './components/Channels/ChannelListOverlay';
import VideoPlayer from './components/Player/VideoPlayerMinimal';
import SettingsPanel from './components/Settings/SettingsPanel';
import ServerHealthDashboard from './components/Settings/ServerHealthDashboard';
import ContinueWatching from './components/Channels/ContinueWatching';
import AIRecommendations from './components/Channels/AIRecommendations';
import { ChannelGridSkeleton, HeroSkeleton } from './components/UI/Skeleton';
import { usePlayer } from './context/PlayerContext';
import { useSources } from './context/SourceContext';
import { useChannelValidator } from './hooks/useChannelValidator';
import { useHorizontalSwipe } from './hooks/useSwipeGesture';
import { aiService } from './services/AIService';
import { GROUPS as INITIAL_GROUPS } from './data/channels';

/**
 * NONOTV ELITE 4K - TV UI / 10-foot Experience
 * Design: Reflective Glass + Netflix Style Navigation
 */
export default function App() {
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [activeGroup,     setActiveGroup]     = useState('All');
  const [search,          setSearch]          = useState('');
  const [settingsOpen,    setSettingsOpen]    = useState(false);
  const [channelListOpen, setChannelListOpen] = useState(false);

  const { activeChannel, showPlayer, playChannel, closePlayer } = usePlayer();
  const { 
    sources, 
    activeSource, 
    channels, 
    isLoading, 
    error, 
    syncStatus, 
    selectSource,
    favorites,
    history,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    addToHistory,
    clearHistory,
    importChannels,
    exportChannels,
    getSourceStatus,
    resetSourceStatus,
    getSettings,
    updateSettings
  } = useSources();

  const { validity, isValidating, validateAll, isChannelValid } = useChannelValidator(channels);

  // Validar canais quando carregados
  useEffect(() => {
    if (channels && channels.length > 0) {
      const timer = setTimeout(() => {
        validateAll(channels.slice(0, 50), (current, total, name) => {
          console.log(`[Validator] ${current}/${total}: ${name}`);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [channels.length]);

  // Inicializa Spatial Navigation para Android TV
  useEffect(() => { 
    initSpatialNavigation(); 
  }, []);

  const filteredChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    return channels.filter(c => {
      if (/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '')) return false;
      
      const matchSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        (c.group || '').toLowerCase().includes(search.toLowerCase());
        
      const matchCategory = activeCategory === 'All' || (c.type || 'live') === activeCategory;
      
      return matchSearch && matchCategory;
    });
  }, [channels, search, activeCategory]);

  const groups = useMemo(() => {
    const uniqueGroups = [...new Set(filteredChannels.map(c => c.group).filter(Boolean))];
    return [
      { name: 'Todos', id: 'All' },
      ...uniqueGroups.map(g => ({ name: g, id: g }))
    ];
  }, [filteredChannels]);

  return (
    <div className="h-screen w-screen bg-[#050505] text-white selection:bg-[#F7941D]/30 font-inter overflow-hidden relative">
      
      {/* 📺 BACKGROUND REFLEXIVO */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Luz Ambiente / Reflexo de Canto */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-gradient-to-br from-white/10 to-transparent blur-[120px] rotate-12 opacity-40 animate-pulse" />
        
        {/* Glow de Conteúdo */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F7941D]/5 blur-[150px] rounded-full mix-blend-screen" />
        
        {/* Camada de Micro-Grão */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
        
        {/* Vinheta de Profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      <div className="h-full w-full relative z-10">
        {/* Sidebar - TV UI Expansível */}
        <Sidebar 
          activeCategory={activeCategory} 
          setActiveCategory={(cat) => { 
            setActiveCategory(cat); 
            setActiveGroup('All'); 
          }} 
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenChannelList={() => setChannelListOpen(true)}
        />

        {/* Área Principal */}
        <main className="md:ml-[72px] h-full overflow-hidden flex flex-col relative pb-16 md:pb-0">
          
          {/* Navbar com Tabs Estilo Netflix */}
          <Navbar 
            search={search} 
            setSearch={setSearch} 
            syncStatus={syncStatus}
            activeCategory={activeCategory}
            setActiveCategory={(cat) => { setActiveCategory(cat); setActiveGroup('All'); }}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenChannelList={() => setChannelListOpen(true)}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pt-4 pb-20">
            {/* Título Principal */}
            <header className="mb-10 mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-[#F7941D] rounded-full glow-orange" />
                   <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase font-outfit">
                      Nono<span className="text-[#F7941D]">TV</span>
                   </h1>
                   <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                      <span className="text-[10px] font-black tracking-[0.3em] text-white/40">ELITE ULTRA 4K</span>
                   </div>
                </div>
                <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[9px] ml-1">
                  {activeSource ? `Link Ativo: ${activeSource.name}` : 'Navegando Offline'}
                </p>
              </div>

              {/* Status Minimalista */}
              <div className="hidden lg:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-3"><Globe size={14} className="text-blue-500/50" /> {activeCategory}</div>
                 <div className="flex items-center gap-3"><LayoutGrid size={14} className="text-emerald-500/50" /> {filteredChannels.length} Items</div>
                 <div className="flex items-center gap-3"><Server size={14} className="text-orange-500/50" /> HQ-SINAL</div>
              </div>
            </header>

            {/* Error Display */}
            {error && (
              <div className="reflective-glass p-8 mb-12 flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top duration-700 bg-red-500/5 border-red-500/20">
                 <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <AlertCircle size={32} />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                   <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Erro de Conexão</h3>
                   <p className="text-white/40 font-bold leading-relaxed">{error}</p>
                 </div>
                 <button 
                   onClick={() => selectSource(null)} 
                   className="px-8 py-4 bg-red-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                 >
                   Restaurar Canais
                 </button>
              </div>
            )}

            {/* Continue Watching - Based on history */}
            {history.length > 0 && !search && (
              <ContinueWatching 
                history={history}
                onPlayChannel={playChannel}
              />
            )}

            {/* AI Recommendations */}
            {!search && channels.length > 20 && (
              <AIRecommendations 
                channels={channels}
                onPlay={playChannel}
                validity={validity}
                isPlayerOpen={showPlayer}
              />
            )}

            {/* Main Content */}
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
                channelValidity={validity}
                isValidating={isValidating}
              />
            </div>

            {/* Loading State */}
            {isLoading && !channels.length && (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="relative w-28 h-28 mb-10">
                  <div className="absolute inset-0 border-[6px] border-white/5 rounded-full" />
                  <div className="absolute inset-0 border-[6px] border-t-[#F7941D] rounded-full animate-spin shadow-[0_0_30px_#F7941D]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-4 h-4 bg-[#F7941D] rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-[#F7941D] font-black uppercase tracking-[1em] text-[10px] animate-pulse">Sintonizando Elite v4.0</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Video Player */}
      {showPlayer && activeChannel && (
        <VideoPlayer 
          channel={activeChannel} 
          channels={filteredChannels} 
          onClose={closePlayer} 
        />
      )}

      {/* Sync Status */}
      {syncStatus && !isLoading && !error && (
        <div className="fixed bottom-10 right-10 reflective-glass !rounded-2xl px-6 py-4 flex items-center gap-5 z-[200] animate-in slide-in-from-right duration-700">
          <RefreshCw size={18} className="text-[#F7941D] animate-spin" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Sinal Ativo</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{syncStatus}</span>
          </div>
        </div>
      )}

      {/* Channel List Overlay - Menu Lateral de Canais */}
      <ChannelListOverlay
        isOpen={channelListOpen}
        onClose={() => setChannelListOpen(false)}
        channels={filteredChannels}
        groups={groups}
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
        onPlayChannel={playChannel}
        currentChannel={activeChannel}
        channelValidity={validity}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sources={sources}
        activeSource={activeSource}
        onSelectSource={(s) => { selectSource(s); }}
        onRefresh={() => selectSource(sources[0])}
        favorites={favorites}
        history={history}
        onAddFavorite={addFavorite}
        onRemoveFavorite={removeFavorite}
        onToggleFavorite={toggleFavorite}
        onImportChannels={importChannels}
        onExportChannels={exportChannels}
        onClearHistory={clearHistory}
        getSourceStatus={getSourceStatus}
        resetSourceStatus={resetSourceStatus}
        getSettings={getSettings}
        updateSettings={updateSettings}
      />
    </div>
  );
}
