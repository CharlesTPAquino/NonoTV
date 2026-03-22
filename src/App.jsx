import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ChannelGrid from './components/Channels/ChannelGrid';
import { parseM3U } from './utils/m3uParser';
import VideoPlayer from './components/Player/VideoPlayer';
import { CHANNELS as INITIAL_CHANNELS, GROUPS as INITIAL_GROUPS } from './data/channels';
import { initSpatialNavigation } from './utils/spatialNavigation';
import { AlertCircle, RefreshCw } from 'lucide-react';

const CACHE_VERSION = 'v2';
const PROXY_URL = 'http://localhost:3131';

function getCacheKey(url) { return `nono_${CACHE_VERSION}_${btoa(url).slice(0, 40)}`; }
function readCache(url) {
  try {
    const raw = localStorage.getItem(getCacheKey(url));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.length > 0 && data[0].type === undefined) { localStorage.removeItem(getCacheKey(url)); return null; }
    return data;
  } catch { return null; }
}
import { SOURCES } from './data/sources';

function writeCache(url, data) {
  try { localStorage.setItem(getCacheKey(url), JSON.stringify(data)); } catch {}
}

export default function App() {
  const [channels,        setChannels]       = useState(() => INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' })));
  const [activeCategory,  setActiveCategory] = useState('All');
  const [activeGroup,     setActiveGroup]    = useState('All');
  const [search,          setSearch]         = useState('');
  const [selectedChannel, setSelectedChannel]= useState(null);
  const [isLoading,       setIsLoading]      = useState(false);
  const [error,           setError]          = useState(null);
  const [syncStatus,      setSyncStatus]     = useState(null);

  useEffect(() => { initSpatialNavigation(); }, []);

  const resetNav = useCallback(() => {
    setActiveCategory('All');
    setActiveGroup('All');
    setSearch('');
  }, []);

  const handleSourceSelect = useCallback(async (source) => {
    if (!source.url) {
      setChannels(INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' })));
      resetNav(); setError(null); return;
    }

    setError(null); setIsLoading(true);
    setSyncStatus(`Sincronizando ${source.name}...`);

    const cached = readCache(source.url);
    if (cached) { 
      setChannels(cached); 
      resetNav(); 
    }

    try {
      // Tunela o fetch através do proxy local para evitar 503/403 (CORS e User-Agent VLC)
      const response = await fetch(`${PROXY_URL}/${source.url}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const parsed = parseM3U(text);
      
      if (!parsed || parsed.length === 0) throw new Error('Lista vazia ou inválida');

      setChannels(parsed);
      writeCache(source.url, parsed);
      resetNav();
      setSyncStatus('Lista Sincronizada!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error('[handleSourceSelect]', err.message);
      if (!cached) {
        setError(`Erro ao carregar "${source.name}": ${err.message}`);
        setChannels(INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' })));
        resetNav();
      } else {
        setSyncStatus(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resetNav]);

  const filteredChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    return channels.filter(c => {
      if (/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '')) return false;
      const matchSearch   = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.group || '').toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'All' || (c.type || 'live') === activeCategory;
      const matchGroup    = activeGroup === 'All' || c.group === activeGroup;
      return matchSearch && matchCategory && matchGroup;
    });
  }, [channels, search, activeCategory, activeGroup]);

  const groups = useMemo(() => {
    const base = channels.filter(c =>
      !(/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group || '')) &&
      (activeCategory === 'All' || (c.type || 'live') === activeCategory)
    );
    if (channels.length <= INITIAL_CHANNELS.length && activeCategory === 'All') return INITIAL_GROUPS;
    const unique = [...new Set(base.map(c => c.group).filter(Boolean))];
    return [{ id: 1, name: 'All', icon: 'home' }, ...unique.map((g, i) => ({ id: i + 2, name: g, icon: 'tv' }))];
  }, [channels, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white selection:bg-[#F7941D]/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F7941D]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Sidebar activeCategory={activeCategory} setActiveCategory={(cat) => { setActiveCategory(cat); setActiveGroup('All'); }} />

      <main className="md:pl-20 lg:pl-64 min-h-screen transition-all duration-700">
        <Navbar 
          search={search}
          setSearch={setSearch} 
          sources={SOURCES}
          onSourceSelect={handleSourceSelect} 
          syncStatus={syncStatus} 
        />

        <div className="p-6 md:p-10 pt-28 space-y-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-center gap-4 text-red-500 animate-in slide-in-from-top duration-500">
              <AlertCircle size={24} />
              <div className="flex-1"><p className="font-black text-xs uppercase tracking-widest">{error}</p></div>
              <button onClick={() => handleSourceSelect({ url: null })} className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                Voltar à Lista Local
              </button>
            </div>
          )}

          {isLoading && !channels.length && (
            <div className="flex flex-col items-center justify-center py-40 space-y-6 animate-pulse">
              <div className="w-16 h-16 border-4 border-[#F7941D]/20 border-t-[#F7941D] rounded-full animate-spin" />
              <p className="text-[#F7941D] font-black uppercase tracking-[0.5em] text-[10px]">Sincronizando Metadados</p>
            </div>
          )}

          {!error && (
            <div className={isLoading ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <ChannelGrid
                channels={filteredChannels}
                activeGroup={activeGroup}
                activeCategory={activeCategory}
                setActiveGroup={setActiveGroup}
                groups={groups}
                onPlay={setSelectedChannel}
                search={search}
                isPlayerOpen={!!selectedChannel}
              />
            </div>
          )}
        </div>
      </main>

      {selectedChannel && (
        <VideoPlayer channel={selectedChannel} channels={filteredChannels} onClose={() => setSelectedChannel(null)} />
      )}

      {syncStatus && !isLoading && !error && (
        <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-500 z-[200]">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <RefreshCw size={16} className="animate-spin" />
          </div>
          <p className="font-black uppercase tracking-widest text-xs">{syncStatus}</p>
        </div>
      )}
    </div>
  );
}
