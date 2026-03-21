import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ChannelGrid from './components/Channels/ChannelGrid';
import VideoPlayer from './components/Player/VideoPlayer';
import MiniPlayer from './components/Player/MiniPlayer';
import { CHANNELS as INITIAL_CHANNELS, GROUPS as INITIAL_GROUPS } from './data/channels';
import { parseM3U } from './utils/m3uParser';
import { validateLink } from './utils/linkValidator';

const SOURCES = [
  { name: 'Local (Premium)', url: 'local' },
  { name: 'Kazing Premium (Novo!)', url: 'http://kazing.fun/get.php?username=jhonny1729&password=882700994121&type=m3u_plus&output=m3u8' },
  { name: 'ZeroUm Premium (3 Telas)', url: 'https://zeroum.blog/get.php?username=LuizRicardo11&password=445355968&type=m3u_plus&output=m3u8' },
  { name: 'UltraFlex Premium (2 Telas)', url: 'https://ultraflex.top/get.php?username=97772520813953&password=50467775206402&type=m3u_plus&output=m3u8' },
  { name: 'AmericaKG Premium', url: 'http://americakg.xyz/get.php?username=u7yckwn5&password=agkedgp9&type=m3u_plus&output=m3u8' },
  { name: '+ Adicionar URL Própria', url: 'custom' },
  { name: '+ Carregar Arquivo do PC/Celular', url: 'file' },
  { name: 'Brasil (IPTV-org)', url: 'https://iptv-org.github.io/iptv/countries/br.m3u' },
  { name: 'Brasil (Mariosanthos)', url: 'https://raw.githubusercontent.com/mariosanthos/IPTV/main/lista%20m3u' },
  { name: 'Brasil (Ramys Mundial)', url: 'https://raw.githubusercontent.com/Ramys/Iptv-Brasil-2026/master/CanaisIPTV.m3u' },
  { name: 'Brasil (Free-TV)', url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_brazil.m3u8' },
  { name: 'Global (Lite)', url: 'https://iptv-org.github.io/iptv/index.m3u' }
];

export default function App() {
  const [activeGroup, setActiveGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [loading, setLoading] = useState(false);
  const [validity, setValidity] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseM3U(text);
        setChannels(parsed);
      } catch (err) {
        alert('Erro ao processar o arquivo M3U.');
      } finally {
        setLoading(false);
        // Reseta o input para permitir enviar o mesmo arquivo novamente
        event.target.value = null;
      }
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo.');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const fetchSource = async (inUrl) => {
    let url = inUrl;
    
    if (url === 'file') {
      document.getElementById('m3u-file-input').click();
      return;
    }
    
    if (url === 'custom') {
      const customUrl = window.prompt("Cole a URL da sua Lista IPTV (Formato m3u ou m3u8):");
      if (!customUrl) return;
      url = customUrl;
    }
    
    if (url === 'local') {
      setChannels(INITIAL_CHANNELS);
      return;
    }
    
    setLoading(true);
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      const parsed = parseM3U(text);
      setChannels(parsed);
    } catch (err) {
      console.error('Erro ao carregar fonte:', err);
      alert('Erro ao carregar fonte. O link pode ser inválido ou bloqueado (CORS). Se for um arquivo do Telegram, baixe-o e selecione "+ Carregar Arquivo do PC".');
    } finally {
      setLoading(false);
    }
  };

  const checkChannelStatus = async (channel) => {
    const isValid = await validateLink(channel.url);
    setValidity(prev => ({ ...prev, [channel.id]: isValid }));
  };

  useEffect(() => {
    // Carrega automaticamente a primeira fonte externa 'Brasil (IPTV-org)' ao iniciar
    fetchSource(SOURCES[4].url);
  }, []);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchGroup = activeGroup === 'All' || c.group === activeGroup;
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [activeGroup, search, channels]);

  const groups = useMemo(() => {
    if (channels === INITIAL_CHANNELS) return INITIAL_GROUPS;
    const uniqueGroups = [...new Set(channels.map(c => c.group))];
    return [
      { id: 1, name: 'All', icon: 'home' },
      ...uniqueGroups.map((g, i) => ({ id: i + 2, name: g, icon: 'tv' }))
    ];
  }, [channels]);

  return (
    <div className="bg-[#0e0e0f] text-white min-h-screen flex flex-col">
      <Navbar 
        search={search} 
        setSearch={setSearch} 
        sources={SOURCES} 
        onSelectSource={fetchSource}
      />
      
      <div className="flex flex-1 pt-20 overflow-hidden">
        <Sidebar 
          groups={groups} 
          activeGroup={activeGroup} 
          setActiveGroup={setActiveGroup} 
        />
        
        <main className="flex-1 overflow-y-auto p-8 pl-28 custom-scrollbar">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {activeGroup === 'All' ? 'Todos os Canais' : activeGroup}
              </h1>
              <p className="text-[#adaaac] text-sm">{filteredChannels.length} canais encontrados</p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-[#b6a0ff] font-bold text-xs uppercase tracking-widest animate-pulse">
                <div className="w-2 h-2 bg-current rounded-full" />
                Carregando Lista...
              </div>
            )}
          </header>

          <ChannelGrid 
            channels={filteredChannels} 
            validity={validity}
            activeGroup={activeGroup}
            onPlay={(c) => { 
              setActiveChannel(c); 
              setShowPlayer(true); 
              checkChannelStatus(c); // Check status when playing
            }} 
          />
        </main>
      </div>

      <input 
        type="file" 
        id="m3u-file-input" 
        accept=".m3u,.m3u8,.txt" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload}
      />

      {showPlayer && (
        <VideoPlayer channel={activeChannel} channels={channels} onClose={() => setShowPlayer(false)} />
      )}

      {!showPlayer && activeChannel && (
        <MiniPlayer channel={activeChannel} onOpen={() => setShowPlayer(true)} onClose={() => setActiveChannel(null)} />
      )}
    </div>
  );
}
