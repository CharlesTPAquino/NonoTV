import React, { useMemo, useState, useEffect } from 'react';
import ChannelCard from './ChannelCard';
import HeroSection from './HeroSection';
import CategoryTiles from './CategoryTiles';
import ChannelCarousel from './ChannelCarousel';
import { ChevronDown, ArrowLeft } from 'lucide-react';

const PREMIUM_KEYWORDS = ['premiere', 'hbo', 'sportv', 'espn', 'telecine', 'globo', 'record', 'sbt', 'cnn', 'tnt'];

export default function ChannelGrid({ channels, onPlay, validity, activeGroup, setActiveGroup, groups, search }) {
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    setLimit(100);
  }, [channels, activeGroup]);

  // === MODO BUSCA: resultado de pesquisa ===
  const isSearching = search && search.trim().length > 0;

  // === MODO HOME: todos os canais, sem busca ===
  const isHome = activeGroup === 'All' && !isSearching;

  // == Canais premium e standard ==
  const { featured, standard } = useMemo(() => {
    const feat = [], std = [];
    channels.forEach(c => {
      const name = c.name.toLowerCase();
      if (PREMIUM_KEYWORDS.some(kw => name.includes(kw))) feat.push(c);
      else std.push(c);
    });
    return { featured: feat, standard: std };
  }, [channels]);

  // === Agrupamento por categoria (para carrosséis) ===
  const groupedAll = useMemo(() => {
    return channels.reduce((acc, channel) => {
      const group = channel.group || 'Outros';
      if (!acc[group]) acc[group] = [];
      acc[group].push(channel);
      return acc;
    }, {});
  }, [channels]);

  // Contagem de canais por grupo (para os tiles)
  const channelCounts = useMemo(() => {
    const counts = {};
    channels.forEach(c => {
      const group = c.group || 'Outros';
      counts[group] = (counts[group] || 0) + 1;
    });
    return counts;
  }, [channels]);

  // Para o grid normal (modo grupo específico ou busca)
  const slicedChannels = channels.slice(0, limit);
  const groupedGrid = useMemo(() => {
    if (activeGroup !== 'All') return { [activeGroup]: slicedChannels };
    return slicedChannels.reduce((acc, c) => {
      const g = c.group || 'Outros';
      if (!acc[g]) acc[g] = [];
      acc[g].push(c);
      return acc;
    }, {});
  }, [slicedChannels, activeGroup]);

  // === MODO BUSCA ===
  if (isSearching) {
    if (channels.length === 0) {
      return <div className="text-center py-20 text-gray-500">Nenhum canal encontrado para "{search}".</div>;
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#F7941D] rounded-full" />
          <h2 className="text-lg font-black text-[#1D1D1F]">Resultados para "{search}"</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">{channels.length} canais</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {channels.slice(0, 60).map(channel => (
            <ChannelCard key={channel.url} channel={channel} onPlay={onPlay} isValid={validity[channel.url]} />
          ))}
        </div>
      </div>
    );
  }

  // === MODO HOME (All + sem busca): Hero + Categories + Carrosséis ===
  if (isHome) {
    if (channels.length === 0) {
      return <div className="text-center py-20 text-gray-500">Nenhum canal disponível.</div>;
    }

    const carouselGroups = Object.entries(groupedAll).slice(0, 10);

    return (
      <div>
        {/* Hero Banner */}
        <HeroSection channels={[...featured, ...standard]} onPlay={onPlay} />

        {/* Category Tiles */}
        {groups && groups.length > 1 && (
          <CategoryTiles
            groups={groups}
            channelCounts={channelCounts}
            setActiveGroup={setActiveGroup}
          />
        )}

        {/* Canais Premium em Carrossel */}
        {featured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-1 h-7 bg-[#F7941D] rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
              <h2 className="text-xl font-black text-[#1B2838] uppercase tracking-[0.2em]">🌟 Canais Premium</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {featured.slice(0, 20).map(channel => (
                <div key={channel.url} className="flex-shrink-0 w-[200px] md:w-[220px]">
                  <ChannelCard channel={channel} onPlay={onPlay} isValid={validity[channel.url]} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carrosséis por categoria */}
        {carouselGroups.map(([groupName, groupChannels]) => (
          <ChannelCarousel
            key={groupName}
            title={groupName}
            channels={groupChannels}
            onPlay={onPlay}
            validity={validity}
            onViewAll={() => setActiveGroup(groupName)}
          />
        ))}
      </div>
    );
  }

  // === MODO GRUPO ESPECÍFICO: Grid completo ===
  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => setActiveGroup('All')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1D1D1F] text-sm font-bold transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Início
      </button>

      <div className="space-y-16">
        {Object.entries(groupedGrid).map(([groupName, groupChannels]) => {
          if (groupChannels.length === 0) return null;
          return (
            <section key={groupName} className="relative">
              <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-6 bg-[#1B2838]/20 rounded-full" />
                <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">{groupName}</h2>
                <span className="text-[10px] text-gray-500 font-bold uppercase bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                  {groupChannels.length} canais
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
                {groupChannels.map(channel => (
                  <ChannelCard key={channel.url} channel={channel} onPlay={onPlay} isValid={validity[channel.url]} />
                ))}
              </div>
            </section>
          );
        })}

        {activeGroup === 'All' && (
          <div className="flex justify-center mt-20 pb-20">
            <button
              onClick={() => setLimit(prev => prev + 100)}
              className="group flex items-center gap-3 px-10 py-4 bg-white hover:bg-[#F7941D] border border-gray-200 hover:border-[#F7941D] rounded-full transition-all duration-500 text-gray-500 hover:text-white font-black tracking-[0.2em] uppercase text-xs shadow-lg hover:shadow-[0_0_40px_rgba(229,9,20,0.2)]"
            >
              Explorar mais canais <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
