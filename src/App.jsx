import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  AlertCircle, RefreshCw, Search, 
  Globe, Server
} from 'lucide-react';
import { initSpatialNavigation } from './utils/spatialNavigation';
import { ThemeProvider, useTheme, getKidsChannels } from './context/ThemeContext';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import ChannelGrid from './components/Channels/ChannelGrid';
import SeriesGroup from './components/Channels/SeriesGroup';
import ContinueWatching from './components/Channels/ContinueWatching';
import VideoPlayerMinimal from './components/Player/VideoPlayerMinimal';
import { ChannelGridSkeleton, HeroSkeleton } from './components/UI/Skeleton';
import { usePlayer } from './context/PlayerContext';
import { useSources } from './context/SourceContext';
import { usePodcasts } from './context/PodcastContext';
import { useChannelValidator } from './hooks/useChannelValidator';
import { useHorizontalSwipe } from './hooks/useSwipeGesture';
import { aiService } from './services/AIService';
import { CHANNELS as LOCAL_CHANNELS } from './data/channels';

console.log('[NonoTV] Componentes carregados');

// Componentes Lazy
const SettingsPanel = lazy(() => import('./components/Settings/SettingsPanel'));
const ChannelListOverlay = lazy(() => import('./components/Channels/ChannelListOverlay'));
const AIRecommendations = lazy(() => import('./components/Channels/AIRecommendations'));
const PodcastGrid = lazy(() => import('./components/Podcast/PodcastGrid'));
const PodcastPlayer = lazy(() => import('./components/Podcast/PodcastPlayer'));

export default function App() {
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [activeGroup,     setActiveGroup]     = useState('All');
  const [search,          setSearch]          = useState('');
  const [settingsOpen,    setSettingsOpen]    = useState(false);
  const [settingsTab,      setSettingsTab]      = useState('sources');
  const [channelListOpen, setChannelListOpen] = useState(false);

  console.log('[NonoTV] App renderizado');

  const { activeChannel, showPlayer, playChannel, closePlayer } = usePlayer();
  const { activePodcast, setActivePodcast } = usePodcasts();
  const { 
    sources, activeSource, channels, isLoading, error, syncStatus, selectSource,
    favorites, history, addFavorite, removeFavorite, toggleFavorite,
    addToHistory, clearHistory, importChannels, exportChannels,
    getSourceStatus, resetSourceStatus, getSettings, updateSettings
  } = useSources();

  const { validity, isValidating, validateAll } = useChannelValidator(channels);

  // Lógica de exibição resiliente: Prioriza canais da fonte, fallback para locais
  const displayChannelsList = useMemo(() => {
    if (channels && channels.length > 0) return channels;
    return LOCAL_CHANNELS;
  }, [channels]);

  // Inicializações
  useEffect(() => { initSpatialNavigation(); }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Guide' || (e.key === 'Enter' && e.shiftKey)) {
        e.preventDefault();
        setChannelListOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredChannels = useMemo(() => {
    try {
      const list = displayChannelsList || [];
      return list.filter(c => {
        if (!c || !c.name) return false;
        if (/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '')) return false;
        
        const matchSearch = !search || 
          c.name.toLowerCase().includes(search.toLowerCase()) || 
          (c.group || '').toLowerCase().includes(search.toLowerCase());
          
        const matchCategory = activeCategory === 'All' || (c.type || 'live') === activeCategory;
        const matchGroup = activeGroup === 'All' || activeGroup === 'Todos' || c.group === activeGroup;
        
        return matchSearch && matchCategory && matchGroup;
      });
    } catch (err) {
      return [];
    }
  }, [displayChannelsList, search, activeCategory, activeGroup]);

  const groups = useMemo(() => {
    try {
      const uniqueGroups = [...new Set(filteredChannels.map(c => c.group).filter(Boolean))];
      return [{ name: 'Todos', id: 'All' }, ...uniqueGroups.map(g => ({ name: g, id: g }))];
    } catch (err) {
      return [{ name: 'Todos', id: 'All' }];
    }
  }, [filteredChannels]);

  return (
    <div className={`h-screen w-screen bg-[#050505] text-white font-inter overflow-hidden relative selection:bg-[#F7941D]/30 transition-all duration-1000 bg-gradient-to-br ${ambientClass}`}>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F7941D]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="h-full w-full relative z-10 flex">
        {/* Sidebar */}
        <Sidebar 
          activeCategory={activeCategory} 
          setActiveCategory={(cat) => { setActiveCategory(cat); setActiveGroup('All'); }} 
          onOpenSettings={() => { setSettingsTab('sources'); setSettingsOpen(true); }}
          onOpenChannelList={() => setChannelListOpen(true)}
          onOpenSync={() => { setSettingsTab('sync'); setSettingsOpen(true); }}
          onOpenServerStatus={() => { setSettingsTab('status'); setSettingsOpen(true); }}
          search={search}
          setSearch={setSearch}
        />

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-hidden flex flex-col relative pb-16 md:pb-0 lg:ml-[88px]">
          
          <Navbar 
            search={search} setSearch={setSearch} syncStatus={syncStatus}
            activeCategory={activeCategory} setActiveCategory={(cat) => { setActiveCategory(cat); setActiveGroup('All'); }}
            onOpenSettings={() => { setSettingsTab('sources'); setSettingsOpen(true); }}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pt-4 pb-32">
            
            {/* Header */}
            <header className="mb-12 mt-4">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {activeCategory === 'podcasts' ? 'Podcasts' : 
                 activeCategory === 'live' ? 'TV Ao Vivo' :
                 activeCategory === 'movie' ? 'Cine VOD' :
                 activeCategory === 'series' ? 'Séries' : 'Descobrir'}
              </h1>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                {filteredChannels.length} Itens Disponíveis • Experiência Elite 4K
              </p>
            </header>

            {/* Error Notification */}
            {error && (
              <div className="p-6 mb-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-6 animate-in slide-in-from-top duration-500">
                 <AlertCircle className="text-red-500 shrink-0" size={24} />
                 <p className="text-white/60 text-xs font-bold uppercase tracking-widest flex-1">{error}</p>
                 <button onClick={() => selectSource(null)} className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-xl uppercase tracking-widest">Restaurar</button>
              </div>
            )}

            {/* Content Display */}
            <div className="animate-in fade-in duration-1000">
              {activeCategory === 'podcasts' ? (
                <Suspense fallback={<ChannelGridSkeleton />}>
                  <PodcastGrid onSelectPodcast={setActivePodcast} />
                </Suspense>
              ) : activeCategory === 'series' ? (
                <SeriesGroup channels={filteredChannels.filter(c => c.type === 'series')} onPlay={playChannel} isPlayerOpen={showPlayer} />
              ) : (
                <ChannelGrid
                  channels={filteredChannels}
                  activeGroup={activeGroup} activeCategory={activeCategory}
                  setActiveGroup={setActiveGroup} groups={groups}
                  onPlay={playChannel} search={search} isPlayerOpen={showPlayer}
                  channelValidity={validity} isValidating={isValidating}
                />
              )}
            </div>

            {/* Sync Overlay */}
            {isLoading && filteredChannels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-white/5 border-t-[#F7941D] rounded-full animate-spin mb-6" />
                <p className="text-[#F7941D] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Sintonizando Elite...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Video Player - carregado diretamente */}
      {showPlayer && activeChannel && (
        <VideoPlayerMinimal channel={activeChannel} channels={filteredChannels} onClose={closePlayer} />
      )}

      {/* Overlays com Suspense */}
      <Suspense fallback={null}>
        {activePodcast && (
          <PodcastPlayer podcast={activePodcast} onClose={() => setActivePodcast(null)} />
        )}
        <ChannelListOverlay 
          isOpen={channelListOpen} onClose={() => setChannelListOpen(false)}
          channels={filteredChannels} groups={groups} activeGroup={activeGroup}
          setActiveGroup={setActiveGroup} onPlayChannel={playChannel}
          currentChannel={activeChannel} channelValidity={validity}
        />
        <SettingsPanel
          isOpen={settingsOpen} initialTab={settingsTab} onClose={() => setSettingsOpen(false)}
          sources={sources} activeSource={activeSource} onSelectSource={selectSource}
          onRefresh={() => selectSource(activeSource || sources[0])}
          favorites={favorites} history={history} onRemoveFavorite={removeFavorite}
          onToggleFavorite={toggleFavorite} onImportChannels={importChannels}
          onExportChannels={exportChannels} onClearHistory={clearHistory}
          getSourceStatus={getSourceStatus} resetSourceStatus={resetSourceStatus}
          getSettings={getSettings} updateSettings={updateSettings}
        />
      </Suspense>

      {/* Sync Toast */}
      {syncStatus && !error && (
        <div className="fixed bottom-10 right-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 z-[200] animate-in slide-in-from-right-10 shadow-2xl">
          <RefreshCw size={16} className={`text-[#F7941D] ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F7941D]">{syncStatus}</span>
        </div>
      )}
    </div>
  );
}x] font-black uppercase tracking-widest text-[#F7941D]">{syncStatus}</span>
        </div>
      )}
    </div>
  );
}