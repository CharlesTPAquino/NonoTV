import React, { useState, useMemo } from 'react';
import { Search, Filter, Mic, SortAsc, Calendar, Flame } from 'lucide-react';
import PodcastCard from './PodcastCard';
import { ChannelGridSkeleton } from '../UI/Skeleton';
import { SEARCHED_PODCASTS } from '../../mocks/podcasts';

/**
 * GRID DE PODCASTS - REDESIGN ULTRA ELITE 4K
 * Lista organizada de podcasts com estética premium e filtros minimalistas.
 */

export default function PodcastGrid({ onSelectPodcast }) {
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('recent');

  const filteredPodcasts = useMemo(() => {
    let result = [...SEARCHED_PODCASTS];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(query) ||
          (podcast.channels && podcast.channels.some((ch) => ch.name.toLowerCase().includes(query)))
      );
    }

    // Sort
    switch (sortOption) {
      case 'recent':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'popular':
        result.sort((a, b) => b.callCount - a.callCount);
        break;
    }

    return result;
  }, [search, sortOption]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
        {/* Search Field */}
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-white/20 group-focus-within:text-[#F7941D] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar podcasts ou convidados..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-[1.5rem] text-white placeholder-white/20 focus:outline-none focus:border-[#F7941D]/50 focus:bg-white/10 transition-all backdrop-blur-xl shadow-2xl"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-xl shrink-0">
          <button
            onClick={() => setSortOption('recent')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              sortOption === 'recent' 
                ? 'bg-[#F7941D] text-black shadow-[0_0_20px_#F7941D]' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar size={14} />
            Recentes
          </button>
          <button
            onClick={() => setSortOption('popular')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              sortOption === 'popular' 
                ? 'bg-[#F7941D] text-black shadow-[0_0_20px_#F7941D]' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame size={14} />
            Populares
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#F7941D] rounded-full shadow-[0_0_10px_#F7941D]" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-white/40">
            {filteredPodcasts.length} Disponíveis
          </span>
        </div>
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="text-[10px] font-black uppercase tracking-widest text-[#F7941D] hover:underline"
          >
            Limpar Busca
          </button>
        )}
      </div>

      {/* Grid Content */}
      {filteredPodcasts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
          {filteredPodcasts.map((podcast, idx) => (
            <div 
              key={podcast.id} 
              className="animate-in fade-in zoom-in-95 duration-500"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <PodcastCard
                podcast={podcast}
                onPress={onSelectPodcast}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 reflective-glass rounded-[3rem] border border-white/5">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
            <Mic className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest mb-2">Sem resultados</h3>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Tente outro termo ou filtro</p>
        </div>
      )}
    </div>
  );
}