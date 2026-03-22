import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ChannelGrid from './components/Channels/ChannelGrid';
import VideoPlayer from './components/Player/VideoPlayer';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { CHANNELS as INITIAL_CHANNELS, GROUPS as INITIAL_GROUPS } from './data/channels';
import { parseM3U } from './utils/m3uParser';
import { validateLink } from './utils/linkValidator';
import { initSpatialNavigation } from './utils/spatialNavigation';

const SOURCES = [
  { name: 'Local (Premium)', url: 'local' },
  { name: 'Kazing Premium', url: 'http://kazing.fun/get.php?username=jhonny1729&password=882700994121&type=m3u_plus&output=m3u8' },
  { name: 'ZeroUm Premium', url: 'https://zeroum.blog/get.php?username=LuizRicardo11&password=445355968&type=m3u_plus&output=m3u8' },
  { name: 'UltraFlex Premium', url: 'https://ultraflex.top/get.php?username=97772520813953&password=50467775206402&type=m3u_plus&output=m3u8' },
  { name: 'AmericaKG Premium', url: 'http://americakg.xyz/get.php?username=u7yckwn5&password=agkedgp9&type=m3u_plus&output=m3u8' },
  { name: '+ Adicionar URL', url: 'custom' },
  { name: '+ Arquivo M3U', url: 'file' },
];

function MainContent() {
  const { playChannel, activeChannel, showPlayer, closePlayer } = usePlayer();
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'live' | 'movie' | 'series'
  const [activeGroup, setActiveGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [loading, setLoading] = useState(false);
  const [validity, setValidity] = useState({});
  const [selectedSeries, setSelectedSeries] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseM3U(e.target.result);
        setChannels(parsed);
        localStorage.setItem('nono_cache_file', JSON.stringify(parsed));
      } catch { alert('Erro no processamento da lista.'); }
      finally { setLoading(false); event.target.value = null; }
    };
    reader.readAsText(file);
  };

  /**
   * Domain Service: Fetch & Sync Stream Source
   * Implements Caching Strategy & Error Resilience
   */
  const syncSource = useCallback(async (sourceUrl, skipLoader = false) => {
    let url = sourceUrl;
    
    // Abstract Factory for Source types
    if (url === 'file') {
      const cached = localStorage.getItem('nono_cache_file');
      if (cached) setChannels(JSON.parse(cached));
      document.getElementById('m3u-file-input').click();
      return;
    }
    
    if (url === 'custom') {
      const customUrl = window.prompt('URL da Lista M3U:');
      if (!customUrl) return;
      url = customUrl;
    }
    
    if (url === 'local') { 
      // Processa os canais locais para garantir que tenham tipos e metadados corretos
      setChannels(INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' }))); 
      return; 
    }

    const cacheKey = `nono_cache_${url}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      setChannels(JSON.parse(cachedData));
      if (skipLoader) return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const resp = await fetch(url, { signal: controller.signal });
      const text = await resp.text();
      clearTimeout(timeoutId);
      
      const parsed = parseM3U(text);
      if (parsed && parsed.length > 0) {
        setChannels(parsed);
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
      } else {
        throw new Error('Nenhum canal encontrado na fonte.');
      }
    } catch (err) {
      console.error('Erro na sincronização:', err);
      // Fallback para cache se o fetch falhar
      if (cachedData) {
        setChannels(JSON.parse(cachedData));
      } else if (url !== 'local') {
          // Fallback para local se tudo mais falhar e for a primeira carga
          setChannels(INITIAL_CHANNELS.map(c => ({ ...c, type: c.type || 'live' })));
      }
    } finally { 
      setLoading(false); 
      clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    syncSource(SOURCES[0].url, true);
    initSpatialNavigation();
  }, [syncSource]);

  // Reset group filter when category changes
  useEffect(() => { setActiveGroup('All'); }, [activeCategory]);

  useEffect(() => {
    const handleKeys = (e) => {
      if (showPlayer && e.key === 'Escape') closePlayer();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [showPlayer, closePlayer]);

  // Filter by category type first, then by group / search
  const filteredChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    
    return channels.filter(c => {
      // Regra de segurança: Ocultar canais adultos por padrão
      const g = (c.group || '').toLowerCase();
      if (g.includes('adulto') || g.includes('xxx') || g.includes('hot') || g.includes('sexo')) {
          return false;
      }
      
      // Filtro de Categoria (Live/Movie/Series/All)
      const matchCategory = activeCategory === 'All' || (c.type || 'live') === activeCategory;
      
      // Filtro de Grupo (Sub-categorias)
      const matchGroup = activeGroup === 'All' || c.group === activeGroup;
      
      // Busca Global
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      
      return matchCategory && matchGroup && matchSearch;
    });
  }, [activeCategory, activeGroup, search, channels]);

  const groups = useMemo(() => {
    const base = channels.filter(c =>
      !(/adulto|sexo|hot|xxx|18\+|porno/i.test(c.group)) &&
      (activeCategory === 'All' || c.type === activeCategory)
    );
    if (channels === INITIAL_CHANNELS) return INITIAL_GROUPS;
    const unique = [...new Set(base.map(c => c.group))];
    return [{ id: 1, name: 'All', icon: 'home' }, ...unique.map((g, i) => ({ id: i + 2, name: g, icon: 'tv' }))];
  }, [channels, activeCategory]);

  const checkChannelStatus = async (channel) => {
    const isValid = await validateLink(channel.url);
    setValidity(prev => ({ ...prev, [channel.id]: isValid }));
  };

  const categoryTitle = {
    'All': null, 'live': '📡 TV Ao Vivo', 'movie': '🎬 Filmes', 'series': '📺 Séries'
  }[activeCategory];

  return (
    <div className="bg-[#0F1115] text-white min-h-screen flex flex-col font-sans selection:bg-[#F7941D]/30">
      <Navbar search={search} setSearch={setSearch} sources={SOURCES} onSelectSource={syncSource} />

      <div className="flex flex-1 pt-20 pb-16 md:pb-0">
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

        <main className="flex-1 md:ml-20 transition-all p-4 md:p-8 lg:p-10 overflow-x-hidden">
          <div className="max-w-[1700px] mx-auto">

            {/* Simplified Sub-navigation (Only search status or subtle info) */}
            {loading && (
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 text-[#F7941D] font-black text-[9px] uppercase tracking-[0.2em] animate-pulse bg-[#F7941D]/5 px-4 py-1.5 rounded-full border border-[#F7941D]/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D] animate-ping" />
                  Sincronizando...
                </div>
              </div>
            )}


            <ChannelGrid
              channels={filteredChannels}
              validity={validity}
              activeGroup={activeGroup}
              activeCategory={activeCategory}
              setActiveGroup={setActiveGroup}
              groups={groups}
              search={search}
              isPlayerOpen={showPlayer || selectedSeries}
              onPlay={(c) => { 
                if (c.isSeries) {
                  setSelectedSeries(c);
                } else {
                  playChannel(c); 
                  checkChannelStatus(c); 
                }
              }}
            />
          </div>
        </main>
      </div>

      {/* Series Episode Selector Modal (Premium Glass) */}
      {selectedSeries && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedSeries(null)} />
          <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#1A1C22] border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#F7941D]/10 to-transparent">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedSeries.name}</h2>
                <p className="text-[#F7941D] text-[10px] font-black uppercase tracking-widest mt-1">{selectedSeries.episodes.length} Episódios Disponíveis</p>
              </div>
              <button 
                onClick={() => setSelectedSeries(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#F7941D] transition-all"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 no-scrollbar">
              {selectedSeries.episodes.map((ep, idx) => (
                <button
                  key={ep.url + idx}
                  onClick={() => {
                    playChannel(ep);
                    checkChannelStatus(ep);
                    setSelectedSeries(null);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-[#F7941D] border border-white/5 hover:border-[#F7941D] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black group-hover:bg-white/20">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate uppercase tracking-tight">{ep.name}</p>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest group-hover:text-white/60">HD Stream • {ep.group}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      <input type="file" id="m3u-file-input" accept=".m3u,.m3u8,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />

      {showPlayer && (
        <VideoPlayer channel={activeChannel} channels={filteredChannels} onClose={closePlayer} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <MainContent />
    </PlayerProvider>
  );
}
