import React, { useState, memo } from 'react';
import { Film, Tv, Play } from 'lucide-react';
import { prefetchService } from '../../services/PrefetchService';

function PlayButton() {
  return (
    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
      <Play size={20} className="text-black ml-0.5" fill="currentColor" />
    </div>
  );
}

function getContentType(channel) {
  if (!channel?.type) return 'live';
  if (channel.type === 'movie') return 'movie';
  if (channel.type === 'series') return 'series';
  if (channel.type === 'podcast') return 'podcast';
  return 'live';
}

function ChannelCard({ channel, onPlay, isValid, isPlayerOpen }) {
  if (!channel?.name) return null;
  
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const contentType = getContentType(channel);
  const isLive = contentType === 'live';
  const isMovies = contentType === 'movie';
  const isSeries = contentType === 'series';
  const isPodcast = contentType === 'podcast';
  
  const aspectClass = (isMovies || isSeries) ? 'aspect-[2/3]' : 'aspect-video';

  const handleMouseEnter = () => {
    if (!isPlayerOpen) {
      setHover(true);
      window._prefetchTimer = setTimeout(() => {
        prefetchService.prefetchChannel(channel);
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    setHover(false);
    if (window._prefetchTimer) clearTimeout(window._prefetchTimer);
  };

  const handleClick = () => {
    setHover(false);
    onPlay(channel);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => !isPlayerOpen && setHover(true)}
      onBlur={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(channel);
        }
      }}
      tabIndex={0}
      className="group relative flex flex-col w-full text-left outline-none select-none transition-transform duration-200 active:scale-95"
    >
      <div 
        className={`relative w-full ${aspectClass} overflow-hidden rounded-lg bg-zinc-900 border border-white/10`}
        style={{
          transform: hover ? 'translateY(-4px)' : 'none',
          transition: 'all 300ms ease',
          boxShadow: hover ? '0 16px 32px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {!imgError && channel.logo ? (
          <img 
            src={channel.logo} 
            alt={channel.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full ${(isMovies || isSeries) ? 'object-cover' : 'object-contain p-2'}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            {(isMovies || isSeries) ? <Film size={32} className="text-zinc-600" /> : <Tv size={32} className="text-zinc-600" />}
          </div>
        )}
        
        {isLive && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayButton />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
          <h3 className="text-xs font-semibold text-white truncate">{channel.name}</h3>
          {channel.group && <p className="text-[9px] text-zinc-400 truncate">{channel.group}</p>}
        </div>
      </div>
    </button>
  );
}

export default memo(ChannelCard);