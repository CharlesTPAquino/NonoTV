import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ChannelCard from './ChannelCard';

export default function ChannelCarousel({ title, channels, onPlay, validity, onViewAll }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -600 : 600;
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
    <div className="mb-12 group/carousel">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-1 h-6 bg-[#1B2838]/20 rounded-full" />
          <h2 className="text-lg font-black text-[#1B2838] tracking-tight">{title}</h2>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-[#1B2838]/5 px-2 py-0.5 rounded-full border border-[#1B2838]/10">
            {channels.length} canais
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] text-[#F7941D] font-black uppercase tracking-[0.2em] hover:text-[#1B2838] transition-colors flex items-center gap-1"
        >
          Ver Todos <ChevronRight size={14} />
        </button>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Left scroll button */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 rounded-full bg-[#121212]/90 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#F7941D] transition-all duration-200 shadow-2xl"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {channels.slice(0, 20).map((channel) => (
            <div
              key={channel.url}
              className="flex-shrink-0 w-[200px] md:w-[220px]"
            >
              <ChannelCard
                channel={channel}
                onPlay={onPlay}
                isValid={validity[channel.url]}
              />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        {showRight && channels.length > 4 && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 rounded-full bg-[#121212]/90 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#F7941D] transition-all duration-200 shadow-2xl"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
