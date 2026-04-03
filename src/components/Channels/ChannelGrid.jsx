import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ChannelCard from './ChannelCard';
import HeroSection from './HeroSection';
import ChannelCarousel from './ChannelCarousel';
import { ChannelGridSkeleton } from '../UI/Skeleton';
import { ChannelGridSkeleton, HeroSkeleton } from '../UI/Skeleton';
import { LayoutGrid, Tv, Clapperboard, MonitorPlay, WifiOff, Search, Compass, ChevronRight } from 'lucide-react';

const CATEGORY_META = {
  live:   { label: 'TV AO VIVO',  icon: Tv,           hint: 'Sintonize os melhores canais do mundo em qualidade Ultra 4K.' },
  movie:  { label: 'CINEMA VOD',  icon: Clapperboard,  hint: 'A maior biblioteca de filmes e lançamentos direto na sua tela.' },
  series: { label: 'SÉRIES TV',   icon: MonitorPlay,   hint: 'As séries mais premiadas e maratonáveis disponíveis agora.' },
  podcasts: { label: 'PODCASTS', icon: Compass,       hint: 'Ouça e assista aos melhores podcasts e conversas do momento.' }
};

export default function ChannelGrid({ channels, activeGroup, activeCategory, setActiveGroup, groups, onPlay, search, isPlayerOpen, channelValidity = {}, isValidating = false }) {
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

      // Home Mode: Separar destaques e agrupar
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

  // Componente de Linha Virtualizada
  const Row = useCallback(({ index, style, data }) => {
    const { itemsPerRow, rowItems, onPlay, channelValidity, isPlayerOpen } = data;
    const items = rowItems[index];

    return (
      <div style={{ ...style, display: 'flex', gap: '24px', paddingLeft: '8px', paddingRight: '8px' }}>
        {items.map((ch) => (
          <div key={ch.id} style={{ width: `calc((100% / ${itemsPerRow}) - 20px)` }}>
            <ChannelCard 
              channel={ch} 
              onPlay={() => onPlay(ch)} 
              isValid={channelValidity[ch.id]} 
              isPlayerOpen={isPlayerOpen} 
            />
          </div>
        ))}
      </div>
    );
  }, []);

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

  return (
    <div className={`h-full transition-all duration-1000 ease-in-out ${isPlayerOpen ? 'opacity-20 scale-95 blur-2xl pointer-events-none' : 'opacity-100 scale-100'}`}>
      {isHome ? (
        <div className="space-y-24 animate-in fade-in duration-1000 overflow-y-auto h-full pr-4 custom-scrollbar">
          <HeroSection channels={[...featured, ...standard]} onPlay={onPlay} validity={channelValidity} isPlayerOpen={isPlayerOpen} />
          
          <div className="space-y-20 pb-32">
            {groupedAll && Object.entries(groupedAll).slice(0, 12).map(([group, items], idx) => (
              <div key={group} className="animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex items-center justify-between mb-8 px-2 md:px-0">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-gradient-to-b from-[#F7941D] to-transparent rounded-full shadow-[0_0_15px_#F7941D]" />
                      <div>
                        <h2 className="text-white font-black text-xl md:text-2xl lg:text-3xl tracking-tighter uppercase">{group}</h2>
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Premium Collection</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => setActiveGroup(group)}
                    className="flex items-center gap-2 text-white/30 hover:text-[#F7941D] transition-colors group/all"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest">Ver Tudo</span>
                      <ChevronRight size={16} className="group-hover/all:translate-x-1 transition-transform" />
                   </button>
                </div>
                <ChannelCarousel channels={items} onPlay={onPlay} validity={channelValidity} isPlayerOpen={isPlayerOpen} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full animate-in slide-in-from-bottom-10 duration-1000">
          {/* Header Exploration */}
          <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 px-2 md:px-0">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-[#F7941D] mb-4">
                <Compass size={18} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  Exploração de Sinal 4K
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                {isSearching ? search : activeGroup === 'All' ? (CATEGORY_META[activeCategory]?.label || activeCategory) : activeGroup}
              </h2>
              <div className="flex items-center gap-4 mt-6">
                 <div className="h-px w-12 bg-[#F7941D]/50" />
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                   {standard.length} Itens Catalogados
                 </p>
              </div>
            </div>

            {/* Filter Pills Elite Style */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
              {groups.slice(0, 20).map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.name)}
                  className={`relative px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border animate-in fade-in slide-in-from-right-4
                    ${activeGroup === g.name 
                      ? 'bg-white text-black border-white shadow-[0_15px_40px_rgba(255,255,255,0.2)] scale-105' 
                      : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Virtualized Grid Layout */}
          <div className="flex-1 min-h-0">
            <AutoSizer>
              {({ height, width }) => {
                // Cálculo dinâmico de colunas baseado na largura
                const minWidth = isPosterContent ? 160 : 240; 
                const itemsPerRow = Math.max(2, Math.floor(width / minWidth));
                
                // Agrupamento de canais em linhas
                const rowItems = [];
                for (let i = 0; i < standard.length; i += itemsPerRow) {
                  rowItems.push(standard.slice(i, i + itemsPerRow));
                }

                // Altura da linha baseada no aspecto (16:9 vs 2:3)
                const rowHeight = isPosterContent 
                  ? (width / itemsPerRow) * 1.5 + 40 // Poster 2:3
                  : (width / itemsPerRow) * 0.5625 + 60; // Live 16:9

                return (
                  <List
                    height={height}
                    width={width}
                    itemCount={rowItems.length}
                    itemSize={rowHeight}
                    itemData={{
                      itemsPerRow,
                      rowItems,
                      onPlay,
                      channelValidity,
                      isPlayerOpen
                    }}
                    className="no-scrollbar"
                    overscanCount={5}
                  >
                    {Row}
                  </List>
                );
              }}
            </AutoSizer>
          </div>
        </div>
      )}
    </div>
  );
}