import React, { useState, useMemo } from 'react';
import ChannelCard from './ChannelCard';
import HeroSection from './HeroSection';
import ChannelCarousel from './ChannelCarousel';
import { ChannelGridSkeleton, HeroSkeleton } from '../UI/Skeleton';
import { LayoutGrid, Tv, Clapperboard, MonitorPlay, WifiOff, Search, Compass, ChevronRight } from 'lucide-react';

const CATEGORY_META = {
  live:   { label: 'TV AO VIVO',  icon: Tv,           hint: 'Sintonize os melhores canais do mundo em qualidade Ultra 4K.' },
  movie:  { label: 'CINEMA VOD',  icon: Clapperboard,  hint: 'A maior biblioteca de filmes e lançamentos direto na sua tela.' },
  series: { label: 'SÉRIES TV',   icon: MonitorPlay,   hint: 'As séries mais premiadas e maratonáveis disponíveis agora.' },
  podcasts: { label: 'PODCASTS', icon: Compass,       hint: 'Ouça e assista aos melhores podcasts e conversas do momento.' }
};

export default function ChannelGrid({ channels, activeGroup, activeCategory, setActiveGroup, groups, onPlay, search, isPlayerOpen, channelValidity = {}, isValidating = false }) {
  const [limit, setLimit] = useState(60);
  const isSearching = search && search.length > 0;

  const { groupedAll, featured, standard } = useMemo(() => {
    try {
      if (!channels || !Array.isArray(channels) || channels.length === 0) {
        return { groupedAll: null, featured: [], standard: [] };
      }
      
      const validChannels = channels.filter(c => c && typeof c === 'object' && c.name);
      
      if (activeCategory !== 'All' || isSearching) {
        return { groupedAll: null, featured: [], standard: validChannels };
      }

      const featuredList = validChannels.filter(c => c.logo && c.group).slice(0, 15);
      const standardList = validChannels; 
      
      const grouped = {};
      validChannels.forEach(ch => {
        const g = ch.group || 'Geral';
        if (!grouped[g]) grouped[g] = [];
        if (grouped[g].length < 24) grouped[g].push(ch);
      });

      return { groupedAll: grouped, featured: featuredList, standard: standardList };
    } catch (err) {
      console.error('[ChannelGrid] Erro no useMemo:', err);
      return { groupedAll: null, featured: [], standard: channels || [] };
    }
  }, [channels, activeCategory, isSearching]);

  const isHome = activeCategory === 'All' && activeGroup === 'All' && !isSearching;
  const isPosterContent = activeCategory === 'movie' || activeCategory === 'series' || activeCategory === 'podcasts';

  if (standard.length === 0 && !isHome) {
    if (isValidating || (channels.length === 0 && !isSearching)) {
      return (
        <div className="py-12 animate-in fade-in duration-700">
           <ChannelGridSkeleton isPoster={isPosterContent} count={18} />
        </div>
      );
    }
    const meta = CATEGORY_META[activeCategory];
    const Icon = meta?.icon || Tv;
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#F7941D] rounded-[2.5rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative w-32 h-32 rounded-[2.5rem] bg-[#050505] border border-white/10 flex items-center justify-center shadow-2xl reflective-glass">
            <Icon size={48} className="text-[#F7941D]/40" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-white font-black uppercase tracking-[0.5em] text-sm">
            {isSearching ? 'Sem correspondências' : meta?.label || 'Conteúdo Premium'}
          </h3>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
            {isSearching ? `Não encontramos resultados para "${search}" em nosso sinal atual.` : meta?.hint || 'Conecte seu servidor IPTV para liberar o acesso Elite.'}
          </p>
        </div>
      </div>
    );
  }

  const displayChannels = standard.slice(0, limit);

  return (
    <div className="w-full">
      {isHome ? (
        <div className="space-y-24 animate-in fade-in duration-1000">
          <HeroSection channels={[...featured, ...standard]} onPlay={onPlay} validity={channelValidity} isPlayerOpen={isPlayerOpen} />
          
          <div className="space-y-16 pb-32">
            {groupedAll && Object.entries(groupedAll).slice(0, 12).map(([group, items]) => (
              <div key={group}>
                <div className="flex items-center justify-between mb-6 px-2 md:px-0">
                   <div>
                     <h2 className="text-white font-black text-lg md:text-xl lg:text-2xl tracking-tight uppercase">{group}</h2>
                   </div>
                   <button onClick={() => setActiveGroup(group)} className="flex items-center gap-1 text-white/30 hover:text-[#F7941D] transition-colors">
                      <span className="text-[9px] font-black uppercase tracking-widest">Ver Tudo</span>
                      <ChevronRight size={14} />
                   </button>
                </div>
                <ChannelCarousel channels={items} onPlay={onPlay} validity={channelValidity} isPlayerOpen={isPlayerOpen} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header Centralizado */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">
              {isSearching ? search : activeGroup === 'All' ? (CATEGORY_META[activeCategory]?.label || activeCategory) : activeGroup}
            </h2>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-2">{standard.length} Itens Disponíveis</p>
          </div>

          {/* Botões de Categoria - Scroll horizontal, tamanho do conteúdo */}
          {groups.length > 1 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
              {groups.slice(0, 20).map((g) => (
                <button key={g.id} onClick={() => setActiveGroup(g.name)} className={`flex-shrink-0 px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeGroup === g.name ? 'bg-white text-black' : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/60'}`}>
                  {g.name}
                </button>
              ))}
            </div>
          )}

          <div className={`grid ${isPosterContent ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'} gap-4 md:gap-6`}>
            {displayChannels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onPlay={() => onPlay(ch)} isValid={channelValidity[ch.id]} isPlayerOpen={isPlayerOpen} />
            ))}
          </div>

          {standard.length > limit && (
            <div className="mt-20 flex justify-center pb-32">
              <button onClick={() => setLimit(prev => prev + 60)} className="px-12 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                Carregar Mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
