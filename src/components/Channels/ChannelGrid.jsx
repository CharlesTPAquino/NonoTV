import React, { useState, useMemo, useRef, useEffect } from 'react';
import useDeviceProfile from '../../hooks/useDeviceProfile';
import ChannelCard from './ChannelCard';
import HeroSection from './HeroSection';
import ChannelCarousel from './ChannelCarousel';
import ContinueWatching from './ContinueWatching';
import { ChannelGridSkeleton, HeroSkeleton } from '../UI/Skeleton';
import { LayoutGrid, Tv, Film, Clapperboard, MonitorPlay, WifiOff, Search, Compass, ChevronRight, Mic } from 'lucide-react';

const CATEGORY_META = {
  live:   { label: 'TV AO VIVO',  icon: Tv,           hint: 'Sintonize os melhores canais do mundo em qualidade Ultra 4K.' },
  movie:  { label: 'CINEMA VOD',  icon: Film,          hint: 'A maior biblioteca de filmes e lançamentos direto na sua tela.' },
  series: { label: 'SÉRIES TV',   icon: MonitorPlay,   hint: 'As séries mais premiadas e maratonáveis disponíveis agora.' },
  podcasts: { label: 'PODCASTS', icon: Mic,            hint: 'Ouça e assista aos melhores podcasts e conversas do momento.' }
};

export default function ChannelGrid({ channels, activeGroup, activeCategory, setActiveGroup, groups, onPlay, search, isPlayerOpen, channelValidity = {}, isValidating = false, history = [], favorites = [] }) {
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

  const catMeta = CATEGORY_META[activeCategory];
  const CatIcon = catMeta?.icon;

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
            history={history}
            favorites={favorites}
          />
          
          {history && history.length > 0 && (
            <div className="mt-8 mb-2 md:mt-12 md:mb-6">
              <ContinueWatching history={history} onPlayChannel={onPlay} />
            </div>
          )}
          
          <div className="space-y-8 md:space-y-12 lg:space-y-16 pb-32">
            {groupedAll && Object.entries(groupedAll).slice(0, maxCarousels).map(([group, items]) => (
              <div key={group}>
                <div className="flex items-center justify-between mb-3 md:mb-5 px-2 md:px-0">
                   <h2 className="text-base md:text-lg font-semibold text-white tracking-tight">{group}</h2>
                   <button onClick={() => setActiveGroup(group)} className="flex items-center gap-1 text-white/25 hover:text-white/50 transition-colors">
                      <span className="text-[9px] font-medium tracking-wide">Ver tudo</span>
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
          {/* Category Header (Premium Ultra Style) */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex flex-col items-center justify-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center mb-2 shadow-2xl">
                {CatIcon && !isSearching && <CatIcon size={32} className="text-white/80" strokeWidth={1} />}
                {isSearching && <Search size={32} className="text-white/80" strokeWidth={1} />}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase italic">
                {isSearching ? search : activeGroup === 'All' ? (catMeta?.label || activeCategory) : activeGroup}
              </h2>
            </div>
            <div className="flex items-center justify-center gap-4">
               <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">{standard.length} Títulos de Elite</p>
               <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>

          {/* Group pills (Sophisticated Style) */}
          {groups.length > 1 && (
            <div className="flex items-center gap-3 mb-10 md:mb-12 overflow-x-auto no-scrollbar pb-2 px-1">
              {groups.slice(0, 30).map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.name)}
                  className={`flex-shrink-0 flex items-center px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
                    activeGroup === g.name
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_8px_20px_rgba(220,38,38,0.25)] scale-105'
                      : 'bg-white/[0.03] text-white/30 border-white/5 hover:bg-white/[0.08] hover:text-white/60 hover:border-white/10'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}


          <div 
            className={`grid gap-5 md:gap-6 lg:gap-8 ${
              isPosterContent 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
            }`}
            data-nav-zone="grid"
          >
            {displayChannels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onPlay={() => onPlay(ch)} isValid={channelValidity[ch.id]} isPlayerOpen={isPlayerOpen} />
            ))}
          </div>

          {standard.length > limit && (
            <div className="mt-16 md:mt-20 flex justify-center pb-32">
              <button onClick={() => setLimit(prev => prev + 60)} className="px-12 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                Carregar Mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
