import React, { useMemo, useState, useEffect } from 'react';
import ChannelCard from './ChannelCard';
import HeroSection from './HeroSection';
import ChannelCarousel from './ChannelCarousel';
import { ChevronDown, ArrowLeft } from 'lucide-react';

const PREMIUM_KEYWORDS = ['premiere', 'hbo', 'sportv', 'espn', 'telecine', 'globo', 'record', 'sbt', 'cnn', 'tnt'];

// Grid cols adapts to content type: posters (movies/series) need fewer cols
const getGridClass = (type) => {
  if (type === 'movie' || type === 'series') {
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4';
  }
  return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4';
};

export default function ChannelGrid({ channels, onPlay, validity, activeGroup, activeCategory, setActiveGroup, search, isPlayerOpen }) {
  const [limit, setLimit] = useState(100);
  useEffect(() => { setLimit(100); }, [channels, activeGroup, activeCategory]);

  const isSearching = search && search.trim().length > 0;
  const isHome = activeCategory === 'All' && activeGroup === 'All' && !isSearching;

  const { featured, standard } = useMemo(() => {
    const feat = [], std = [];
    channels.forEach(c => {
      const name = c.name.toLowerCase();
      if (PREMIUM_KEYWORDS.some(kw => name.includes(kw))) feat.push(c);
      else std.push(c);
    });
    return { featured: feat, standard: std };
  }, [channels]);

  const groupedAll = useMemo(() =>
    channels.reduce((acc, ch) => {
      const g = ch.group || 'Outros';
      if (!acc[g]) acc[g] = [];
      acc[g].push(ch);
      return acc;
    }, {})
  , [channels]);

  const displayChannels = channels.slice(0, limit);
  const gridClass = getGridClass(activeCategory);

  // ── Search Mode ──
  if (isSearching) {
    if (channels.length === 0) return <div className="text-center py-20 text-white/20 font-bold uppercase tracking-widest">Nenhum canal encontrado para "{search}"</div>;
    return (
      <div className={gridClass}>
        {displayChannels.map(ch => (
          <ChannelCard key={ch.url} channel={ch} onPlay={onPlay} isValid={validity[ch.id]} isPlayerOpen={isPlayerOpen} />
        ))}
      </div>
    );
  }

  // ── Home Mode (Carousels) ──
  if (isHome) {
    if (channels.length === 0) return <div className="text-center py-20 text-gray-500/40 font-black uppercase tracking-[0.4em]">Sincronizando Sinal...</div>;
    const carouselGroups = Object.entries(groupedAll).slice(0, 10);
    return (
      <div className="space-y-16 animate-in fade-in duration-700">
        <HeroSection channels={[...featured, ...standard]} onPlay={onPlay} />
        
        {/* Featured Section */}
        {featured.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-[#F7941D] rounded-full shadow-[0_0_15px_rgba(247,148,29,0.5)]" />
              <h2 className="text-base font-black text-white uppercase tracking-[0.2em]">Canais Premium</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {featured.slice(0, 24).map(ch => (
                <div key={ch.id} className="flex-shrink-0 w-[240px] md:w-[280px]">
                  <ChannelCard channel={ch} onPlay={onPlay} isValid={validity[ch.id]} isPlayerOpen={isPlayerOpen} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Carousels per Group (Discovery Mode) */}
        {carouselGroups.map(([groupName, groupChannels]) => (
          <ChannelCarousel 
            key={groupName} 
            title={groupName} 
            channels={groupChannels} 
            onPlay={onPlay} 
            validity={validity} 
            isPlayerOpen={isPlayerOpen} 
            onViewAll={() => setActiveGroup(groupName)} 
          />
        ))}
      </div>
    );
  }

  // ── Category / Group Mode (Grouped Sections - DDD Pattern) ──
  const channelsByGroup = useMemo(() => {
    const groups = {};
    displayChannels.forEach(ch => {
      const g = ch.group || 'Diversos';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ch);
    });
    return Object.entries(groups);
  }, [displayChannels]);

  if (displayChannels.length === 0) return <div className="text-center py-32 text-white/10 font-black uppercase tracking-[0.5em]">Conteúdo Indisponível</div>;

  return (
    <div className="space-y-20 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      {channelsByGroup.map(([groupName, groupList]) => (
        <section key={groupName} className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-[#F7941D]/60 rounded-full" />
              <h3 className="text-sm font-black text-white uppercase tracking-[0.25em]">{groupName}</h3>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{groupList.length} itens</span>
          </div>

          <div className={gridClass}>
            {groupList.map(ch => (
              <ChannelCard key={ch.id} channel={ch} onPlay={onPlay} isValid={validity[ch.id]} isPlayerOpen={isPlayerOpen} />
            ))}
          </div>
        </section>
      ))}

      {channels.length > limit && (
        <div className="flex justify-center pt-10">
          <button
            onClick={() => setLimit(prev => prev + 100)}
            className="group relative px-12 py-4 bg-white/5 hover:bg-[#F7941D] border border-white/10 hover:border-[#F7941D] rounded-2xl transition-all duration-500 text-white/40 hover:text-white font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">Explorar Mais <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" /></span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </div>
      )}
    </div>
  );
}
