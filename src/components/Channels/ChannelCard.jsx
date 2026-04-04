import React, { useState, memo } from 'react';
import { Play, Film, Tv } from 'lucide-react';

function getContentType(channel) {
  const type = channel.type || 'live';
  if (type === 'movie') return 'movie';
  if (type === 'series') return 'series';
  return 'live';
}

function ChannelCard({ channel, onPlay, isValid, isPlayerOpen }) {
  if (!channel || !channel.name) return null;
  
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const contentType = getContentType(channel);
  const isPoster = contentType === 'movie' || contentType === 'series';
  const isLive = contentType === 'live';

  const aspectClass = isLive ? 'aspect-video' : 'aspect-[2/3]';
  const containerRadius = isLive ? 'rounded-xl' : 'rounded-xl';

  const handleClick = () => { setIsHovered(false); onPlay(channel); };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !isPlayerOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !isPlayerOpen && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group relative flex flex-col w-full text-left outline-none transition-all duration-300 select-none"
    >
      {/* Main Container */}
      <div className={`relative ${aspectClass} w-full ${containerRadius} overflow-hidden bg-[#252528] border border-white/[0.06] group-hover:border-white/[0.12] transition-all duration-300`}>
        
        {/* Artwork */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`w-full h-full transition-all duration-300 ${
                isPoster ? 'object-cover' : 'object-contain p-4'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#252528]">
              <Tv className="w-7 h-7 text-white/[0.08] mb-2" />
              <span className="text-white/[0.15] text-[7px] font-bold text-center uppercase tracking-widest line-clamp-2">
                {channel.name}
              </span>
            </div>
          )}
        </div>

        {/* Subtle bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* Type Badge */}
        <div className="absolute top-2.5 left-2.5 z-20">
          {isLive && (
            <div className="flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <div className="w-1 h-1 rounded-full bg-white" />
              <span className="text-white text-[7px] font-bold uppercase tracking-wide">Ao Vivo</span>
            </div>
          )}
          {contentType === 'movie' && (
            <div className="flex items-center gap-1 bg-white/90 text-black px-2 py-0.5 rounded-md font-bold uppercase tracking-wide text-[7px]">
              <Film size={8} className="fill-black" />
              <span>Filme</span>
            </div>
          )}
          {contentType === 'series' && (
            <div className="flex items-center gap-1 bg-indigo-500/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-white font-bold uppercase tracking-wide text-[7px]">
              <span>Série</span>
            </div>
          )}
        </div>

        {/* Play Icon on Hover */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Play size={16} className="fill-black ml-0.5 text-black" />
          </div>
        </div>

        {/* Info Area */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
          <h3 className="font-bold text-[11px] text-white/90 leading-tight line-clamp-2 group-hover:text-white transition-colors">
            {channel.name}
          </h3>
          {channel.group && (
            <p className="text-white/30 text-[8px] font-medium uppercase tracking-wide mt-0.5 truncate">
              {channel.group}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default memo(ChannelCard);
