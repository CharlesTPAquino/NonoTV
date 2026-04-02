import React, { useState, useMemo } from 'react';
import ChannelCard from './ChannelCard';
import { ChevronRight, ChevronDown, Play } from 'lucide-react';

export default function CategorySection({
  title,
  channels,
  type,
  onPlay,
  isPlayerOpen,
  showTitle = true,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = type === 'live' ? 12 : 6;

  const paginatedChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    const start = page * ITEMS_PER_PAGE;
    return channels.slice(start, start + ITEMS_PER_PAGE);
  }, [channels, page]);

  const totalPages = channels ? Math.ceil(channels.length / ITEMS_PER_PAGE) : 0;
  const hasMore = page < totalPages - 1;

  const getTypeInfo = () => {
    switch (type) {
      case 'live':
        return { badge: 'AO VIVO', badgeClass: 'bg-red-600', icon: '🔴' };
      case 'movie':
        return { badge: 'FILME', badgeClass: 'bg-purple-600', icon: '🎬' };
      case 'series':
        return { badge: 'SÉRIE', badgeClass: 'bg-emerald-600', icon: '📺' };
      default:
        return { badge: 'TODOS', badgeClass: 'bg-gray-600', icon: '📡' };
    }
  };

  const typeInfo = getTypeInfo();

  if (!channels || channels.length === 0) return null;

  return (
    <section className="mb-12">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-6 group"
      >
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1.5 rounded-lg ${typeInfo.badgeClass} text-white text-[11px] font-bold`}
          >
            {typeInfo.badge}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-orange-500 transition-colors">
            {title}
          </h2>
          <span className="text-gray-500 text-sm font-medium">({channels.length})</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
          {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
        </div>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {paginatedChannels.map((channel, idx) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onPlay={() => onPlay(channel)}
                index={idx}
                isPlayerOpen={isPlayerOpen}
                large
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="
                  inline-flex items-center gap-2
                  px-8 py-4 bg-[#1a1c25] border-2 border-gray-700
                  rounded-xl
                  transition-all duration-200
                  hover:bg-[#252833] hover:border-orange-500 hover:shadow-lg
                  text-[14px] font-bold uppercase tracking-wider text-gray-300 hover:text-white
                "
              >
                Ver mais {title}
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
