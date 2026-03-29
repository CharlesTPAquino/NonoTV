import React, { useState, useMemo } from 'react';
import ChannelCard from './ChannelCard';
import HeroSection from './HeroSection';
import ChannelCarousel from './ChannelCarousel';
import { LayoutGrid, Tv, Clapperboard, MonitorPlay, WifiOff } from 'lucide-react';

const CATEGORY_META = {
  live:   { label: 'TV Ao Vivo',  icon: Tv,           hint: 'Carregue uma lista IPTV no menu superior para ver canais ao vivo.' },
  movie:  { label: 'Filmes',      icon: Clapperboard,  hint: 'Carregue uma lista com filmes (VOD). Fontes como Kazing ou ZeroUm incluem filmes.' },
  series: { label: 'Séries',      icon: MonitorPlay,   hint: 'Carregue uma lista com séries. Os episódios são agrupados automaticamente.' },
};

export default function ChannelGrid({ channels, activeGroup, activeCategory, setActiveGroup, groups, onPlay, search, isPlayerOpen, channelValidity = {}, isValidating = false }) {
  const [limit, setLimit] = useState(50);
  const isSearching = search && search.length > 0;

  const { groupedAll, featured, standard } = useMemo(() => {
    if (activeCategory !== 'All') {
      return { groupedAll: null, featured: [], standard: channels };
    }
    const featuredList = channels.filter(c => c.logo && c.group).slice(0, 10);
    const standardList = channels.filter(c => !featuredList.includes(c));
    const grouped = channels.reduce((acc, ch) => {
      const g = ch.group || 'Geral';
      if (!acc[g]) acc[g] = [];
      if (acc[g].length < 20) acc[g].push(ch);
      return acc;
    }, {});
    return { groupedAll: grouped, featured: featuredList, standard: standardList };
  }, [channels, activeCategory]);

  const displayChannels = standard.slice(0, limit);
  const isHome = activeCategory === 'All' && activeGroup === 'All' && !isSearching;

  if (displayChannels.length === 0 && !isHome) {
    const meta = CATEGORY_META[activeCategory];
    const Icon = meta?.icon || Tv;
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
          <Icon size={40} className="text-white/20" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white/50 font-black uppercase tracking-[0.4em] text-xs">
            {isSearching ? 'Nenhum resultado' : `Sem ${meta?.label || 'conteúdo'}`}
          </p>
          <p className="text-white/20 text-[10px] uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            {isSearching ? `Nada encontrado para "${search}"` : meta?.hint || 'Carregue uma lista IPTV no menu superior.'}
          </p>
        </div>
        {!isSearching && activeCategory !== 'All' && (
          <div className="flex items-center gap-2 px-5 py-3 bg-[#F7941D]/5 border border-[#F7941D]/10 rounded-2xl">
            <WifiOff size={12} className="text-[#F7941D]/50" />
            <span className="text-[#F7941D]/50 text-[9px] font-black uppercase tracking-widest">Use o menu de fontes para carregar conteúdo</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`transition-all duration-700 ${isPlayerOpen ? 'opacity-30 scale-95 blur-md pointer-events-none' : 'opacity-100 scale-100'}`}>
      {isHome ? (
        <div className="space-y-16 animate-in fade-in duration-700">
          <HeroSection channels={[...featured, ...standard]} onPlay={onPlay} validity={channelValidity} isPlayerOpen={isPlayerOpen} />
          <div className="space-y-12 pb-20">
            {groupedAll && Object.entries(groupedAll).slice(0, 8).map(([group, items]) => (
              <ChannelCarousel key={group} title={group} channels={items} onPlay={onPlay} onSeeAll={() => setActiveGroup(group)} validity={channelValidity} isPlayerOpen={isPlayerOpen} />
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-10 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 text-[#F7941D] mb-2">
                <LayoutGrid size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {isSearching ? 'Resultados' : CATEGORY_META[activeCategory]?.label || 'Explorar'}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                {isSearching ? search : activeGroup === 'All' ? (CATEGORY_META[activeCategory]?.label || activeCategory) : activeGroup}
              </h2>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-2">
                {displayChannels.length} {displayChannels.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {groups.slice(0, 15).map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.name)}
                  className={`relative px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeGroup === g.name 
                      ? 'bg-[#F7941D] text-black border-[#F7941D] shadow-[0_0_30px_rgba(247,148,29,0.4)] scale-105' 
                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {g.name}
                  {activeGroup === g.name && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {displayChannels.map((ch, idx) => (
              <ChannelCard key={ch.id} channel={ch} onPlay={() => onPlay(ch)} index={idx} isValid={channelValidity[ch.id]} />
            ))}
          </div>
          {standard.length > limit && (
            <div className="mt-20 flex justify-center pb-20">
              <button onClick={() => setLimit(prev => prev + 50)} className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-[30px] overflow-hidden transition-all hover:bg-white hover:text-black">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#F7941D] scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <span className="relative text-xs font-black uppercase tracking-[0.3em]">Carregar Mais</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
