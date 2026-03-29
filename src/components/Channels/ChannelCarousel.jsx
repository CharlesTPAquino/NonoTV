import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ChannelCard from './ChannelCard';

export default function ChannelCarousel({ title, channels, onPlay, validity, onViewAll, isPlayerOpen }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -400 : 400;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    setShowLeft(container.scrollLeft > 20);
    setShowRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 20);
  };

  if (!channels || channels.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-[#F7941D] hover:text-[#FB923C] font-medium transition-colors"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-9 h-14 bg-[#18181B]/90 border border-[#3F3F46] rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {channels.slice(0, 20).map((channel) => (
            <div key={channel.url} className="flex-shrink-0 w-[180px]">
              <ChannelCard
                channel={channel}
                onPlay={onPlay}
                isValid={validity ? validity[channel.id] : undefined}
                isPlayerOpen={isPlayerOpen}
              />
            </div>
          ))}
        </div>

        {showRight && channels.length > 4 && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-9 h-14 bg-[#18181B]/90 border border-[#3F3F46] rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
