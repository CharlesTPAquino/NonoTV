import React, { useState, useMemo, useRef, useEffect } from 'react';
import useDeviceProfile from '../../hooks/useDeviceProfile';
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
  const profile = useDeviceProfile();
  const [limit, setLimit] = useState(profile.gridLimit || 60);
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
  const isLiveCategory = activeCategory === 'live';

  const displayChannels = useMemo(() => {
    const sliced = standard.slice(0, limit);
    if (isLiveCategory) {
      return sliced.map(ch => {
        if (ch.type === 'live') return ch;
        return { ...ch, type: 'live' };
      });
    }
    return sliced;
  }, [standard, limit, isLiveCategory]);

  const maxCarousels = profile.carousels || 12;

  return (
    <div className="w-full">
      {isHome ? (
        <div className="space-y-12 md:space-y-16 lg:space-y-24">
          <HeroSection 
            channels={[...featured, ...standard]} 
            onPlay={onPlay} 
            validity={channelValidity} 
            isPlayerOpen={isPlayerOpen}
            autoRotate={profile.heroAutoRotate}
            heroInterval={profile.heroInterval}
          />
          
          <div className="space-y-8 md:space-y-12 lg:space-y-16 pb-32">
            {groupedAll && Object.entries(groupedAll).slice(0, maxCarousels).map(([group, items]) => (
              <div key={group}>
                <div className="flex items-center justify-between mb-3 md:mb-5 px-2 md:px-0">
                   <h2 className="text-sm md:text-base font-semibold text-white/80 tracking-tight">{group}</h2>
                   <button onClick={() => setActiveGroup(group)} className="flex items-center gap-1 text-white/25 hover:text-white/50 transition-colors">
                      <span className="text-[8px] font-medium tracking-wide">Ver tudo</span>
                      <ChevronRight size={12} />
                   </button>
                </div>
                <ChannelCarousel 
                  channels={items} 
                  onPlay={onPlay} 
                  validity={channelValidity} 
                  isPlayerOpen={isPlayerOpen}
                  maxItems={profile.carouselItems}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white/90 tracking-tight leading-tight">
              {isSearching ? search : activeGroup === 'All' ? (CATEGORY_META[activeCategory]?.label || activeCategory) : activeGroup}
            </h2>
            <p className="text-white/25 text-[8px] font-medium tracking-wide mt-1">{standard.length} itens</p>
          </div>

          {groups.length > 1 && (
            <div className="flex items-center gap-1.5 mb-4 md:mb-6 overflow-x-auto no-scrollbar">
              {groups.slice(0, 20).map((g) => (
                <button key={g.id} onClick={() => setActiveGroup(g.name)} className={`flex-shrink-0 px-4 py-1.5 rounded-md text-[8px] font-medium tracking-wide transition-all whitespace-nowrap ${activeGroup === g.name ? 'bg-white text-black' : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/60'}`}>
                  {g.name}
                </button>
              ))}
            </div>
          )}

          <div className={`grid ${isPosterContent ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'} gap-3 md:gap-4 lg:gap-6`}>
            {displayChannels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onPlay={() => onPlay(ch)} isValid={channelValidity[ch.id]} isPlayerOpen={isPlayerOpen} />
            ))}
          </div>

          {standard.length > limit && (
            <div className="mt-16 md:mt-20 flex justify-center pb-32">
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
