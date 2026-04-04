import React, { useRef } from 'react';
import ChannelCard from './ChannelCard';

export default function ChannelCarousel({ channels, onPlay, validity, isPlayerOpen, maxItems = 15 }) {
  const scrollRef = useRef(null);

  if (!channels || channels.length === 0) return null;

  return (
    <div className="mb-8 md:mb-10">
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {channels.slice(0, maxItems).map((channel) => (
          <div key={channel.id} className="flex-shrink-0 w-[140px] md:w-[160px] lg:w-[180px]">
            <ChannelCard
              channel={channel}
              onPlay={onPlay}
              isValid={validity ? validity[channel.id] : undefined}
              isPlayerOpen={isPlayerOpen}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
