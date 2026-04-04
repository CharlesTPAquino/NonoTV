import React, { useState, memo } from 'react';
import { Film } from 'lucide-react';

function getContentType(channel) {
  const type = channel.type || 'live';
  if (type === 'movie') return 'movie';
  if (type === 'series') return 'series';
  return 'live';
}

function getQualityBadge(name) {
  if (!name) return null;
  if (/4K|UHD/i.test(name)) return { label: '4K', color: 'bg-[#00E5FF]/90 text-black' };
  if (/FHD|1080/i.test(name)) return { label: 'FHD', color: 'bg-blue-500/90 text-white' };
  if (/HD|720/i.test(name)) return { label: 'HD', color: 'bg-emerald-500/90 text-white' };
  return null;
}

function ChannelCard({ channel, onPlay, isValid, isPlayerOpen }) {
  if (!channel || !channel.name) return null;
  
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const contentType = getContentType(channel);
  const isPoster = contentType === 'movie' || contentType === 'series';
  const isLive = contentType === 'live';
  const quality = getQualityBadge(channel.name);

  const aspectClass = isLive ? 'aspect-[4/3]' : 'aspect-[2/3]';
  const containerRadius = isLive ? 'rounded-none' : 'rounded-xl';

  const handleClick = (e) => {
    setIsHovered(false);
    // Pass card rect for shared element transition
    const rect = e.currentTarget.getBoundingClientRect();
    onPlay(channel, rect);
  };

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
      <div className={`relative ${aspectClass} w-full ${containerRadius} overflow-hidden ${isLive ? 'bg-black' : 'bg-[#252528]'} border ${isLive ? 'border-none' : 'border-white/[0.06]'} group-hover:border-white/[0.10] transition-all duration-300 ${isLive ? 'flex flex-col' : ''}`}>
        
        {/* Artwork Area */}
        <div className={`relative ${isLive ? 'flex-1 min-h-0' : 'absolute inset-0'} overflow-hidden`}>
          {/* Logo Image */}
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
            <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${isLive ? 'bg-black' : 'bg-[#252528]'}`}>
              {!isLive && (
                <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white/[0.10]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Gradient: subtle for poster */}
          {isPoster && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          )}

          {/* Type Badge - Top Left */}
          <div className="absolute top-2 left-2 z-10">
            {isLive && (
              <div className="flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-1.5 py-0.5 rounded">
                <div className="w-1 h-1 rounded-full bg-white" />
                <span className="text-white text-[6px] font-semibold uppercase tracking-wider">Ao Vivo</span>
              </div>
            )}
            {contentType === 'movie' && (
              <div className="flex items-center gap-1 bg-white/90 text-black px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[6px]">
                <Film size={7} className="fill-black" />
                <span>Filme</span>
              </div>
            )}
            {contentType === 'series' && (
              <div className="flex items-center gap-1 bg-indigo-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-white font-semibold uppercase tracking-wider text-[6px]">
                <span>Série</span>
              </div>
            )}
          </div>

          {/* Quality Badge - Top Right */}
          {quality && (
            <div className="absolute top-2 right-2 z-10">
              <div className={`px-1.5 py-0.5 rounded font-semibold text-[6px] uppercase tracking-wider ${quality.color}`}>
                {quality.label}
              </div>
            </div>
          )}
          {!quality && channel.aiEnriched && (
            <div className="absolute top-2 right-2 z-10">
              <div className="px-1.5 py-0.5 rounded font-semibold text-[6px] uppercase tracking-wider bg-[#F7941D]/90 text-black">
                ✨ AI
              </div>
            </div>
          )}

          {/* Info Area */}
          {isPoster ? null : (
            <div className="shrink-0 px-2.5 py-1.5 bg-[#1a1a1d]">
              <h3 className="font-medium text-[10px] text-white/80 leading-snug line-clamp-2">
                {channel.name}
              </h3>
              {channel.group && (
                <p className="text-white/30 text-[7px] font-medium mt-0.5 truncate">
                  {channel.group}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default memo(ChannelCard);
