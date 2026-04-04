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
import SplashScreen from './components/UI/SplashScreen';
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
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [activeGroup,     setActiveGroup]     = useState('All');
  const [search,          setSearch]          = useState('');
  const [settingsOpen,    setSettingsOpen]    = useState(false);
  const [settingsTab,      setSettingsTab]      = useState('sources');
  const [channelListOpen, setChannelListOpen] = useState(false);

  // Background dinâmico baseado na categoria
  const ambientClass = useMemo(() => {
    switch(activeCategory) {
      case 'live': return 'from-red-950/20 via-[#050505] to-black';
      case 'movie': return 'from-orange-950/20 via-[#050505] to-black';
      case 'series': return 'from-indigo-950/20 via-[#050505] to-black';
      case 'podcasts': return 'from-emerald-950/20 via-[#050505] to-black';
      default: return 'from-[#1a1a1a]/20 via-[#050505] to-black';
    }
  }, [activeCategory]);

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

  const displayChannelsList = useMemo(() => {
    if (channels && channels.length > 0) return channels;
    return LOCAL_CHANNELS;
  }, [channels]);

  // Back button handler — navegação em pilha para TV
  useEffect(() => {
    const handleBack = (e) => {
      // Prioridade: fechar overlays primeiro
      if (showPlayer) { e?.preventDefault(); closePlayer(); return; }
      if (settingsOpen) { e?.preventDefault(); setSettingsOpen(false); return; }
      if (channelListOpen) { e?.preventDefault(); setChannelListOpen(false); return; }
      
      // Se não está na Home, voltar para Home
      if (activeCategory !== 'All' || activeGroup !== 'All' || search) {
        e?.preventDefault();
        setActiveCategory('All');
        setActiveGroup('All');
        setSearch('');
        return;
      }
      
      // Se está na Home, não sai do app
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Web: captura Escape/Back
    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4 || e.keyCode === 10009 || e.keyCode === 461) {
        handleBack(e);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Capacitor (Android TV): captura hardware back button via evento DOM
    // O Capacitor dispara 'backbutton' como evento do window
    window.addEventListener('backbutton', handleBack);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('backbutton', handleBack);
    };
  }, [showPlayer, settingsOpen, channelListOpen, activeCategory, activeGroup, search, closePlayer]);

  useEffect(() => { initSpatialNavigation(); }, []);

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

  // Se estiver na Home (All), usamos o scroll do App. 
  // Se estiver em categoria (Grid Virtualizada), o scroll é interno à Grid.
  const isHome = activeCategory === 'All' && activeGroup === 'All' && !search;

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: 'var(--surface-app)', color: 'var(--text-1)' }}>
      <style>{`:root { --sidebar-width: 0px; } @media (min-width: 1024px) { :root { --sidebar-width: 68px; } }`}</style>

      <div className="h-full w-full relative z-10 flex">
        <Sidebar 
          activeCategory={activeCategory} 
          setActiveCategory={(cat) => { setActiveCategory(cat); setActiveGroup('All'); }} 
          onOpenSettings={() => { setSettingsTab('sources'); setSettingsOpen(true); }}
          onOpenChannelList={() => setChannelListOpen(true)}
          onOpenSync={() => { setSettingsTab('sync'); setSettingsOpen(true); }}
          onOpenServerStatus={() => { setSettingsTab('status'); setSettingsOpen(true); }}
          search={search}
          setSearch={setSearch}
          serverStatus={syncStatus?.includes('Conectado') || syncStatus?.includes('Carregado') ? 'online' : error ? 'offline' : 'checking'}
        />

        <main className="flex-1 h-full overflow-hidden flex flex-col relative" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 200ms cubic-bezier(0.25,0.1,0.25,1)' }}>
          
          <Navbar 
            search={search} setSearch={setSearch} syncStatus={syncStatus}
            onOpenSettings={() => { setSettingsTab('sources'); setSettingsOpen(true); }}
            serverStatus={syncStatus?.includes('Conectado') || syncStatus?.includes('Carregado') ? 'online' : error ? 'offline' : 'checking'}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pt-4 pb-20 lg:pb-8">
            
            {error && (
              <div className="p-6 mb-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-6 animate-in slide-in-from-top duration-500 shrink-0">
                 <AlertCircle className="text-red-500 shrink-0" size={24} />
                 <p className="text-white/60 text-xs font-bold uppercase tracking-widest flex-1">{error}</p>
                 <button onClick={() => selectSource(null)} className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-xl uppercase tracking-widest">Restaurar</button>
              </div>
            )}

            <div className="flex-1 min-h-0 animate-in fade-in duration-1000">
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

            {isLoading && filteredChannels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-white/5 border-t-white/60 rounded-full animate-spin mb-6" />
                <p className="text-white/50 font-semibold uppercase tracking-[0.4em] text-[10px] animate-pulse">Sintonizando...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showPlayer && activeChannel && (
        <VideoPlayerMinimal channel={activeChannel} channels={filteredChannels} onClose={closePlayer} />
      )}

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

      {syncStatus && !error && (
        <div className="fixed bottom-10 right-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 z-[200] animate-in slide-in-from-right-10 shadow-2xl">
          <RefreshCw size={16} className={`text-white/50 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{syncStatus}</span>
        </div>
      )}
    </div>
  );
}
