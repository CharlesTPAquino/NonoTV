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
  if (/4K|UHD/i.test(name)) return { label: '4K', className: 'badge-4k' };
  if (/FHD|1080/i.test(name)) return { label: '1080', className: 'badge-movie' };
  if (/HD|720/i.test(name)) return { label: '720', className: 'badge-movie' };
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

  const handleClick = () => { setIsHovered(false); onPlay(channel); };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !isPlayerOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !isPlayerOpen && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group relative flex flex-col w-full text-left outline-none select-none"
      style={{ transition: 'all var(--duration) var(--ease)' }}
    >
      {/* Main Container — 3D card */}
      <div
        className={`relative ${aspectClass} w-full overflow-hidden ${isLive ? 'flex flex-col' : ''}`}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          boxShadow: isHovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
          transform: isHovered ? 'translateY(-2px)' : 'none',
          transition: 'all var(--duration) var(--ease)',
        }}
      >
        
        {/* Artwork Area */}
        <div className={`relative ${isLive ? 'flex-1 min-h-0' : 'absolute inset-0'} overflow-hidden`}>
          {/* Logo Image */}
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`w-full h-full transition-all duration-200 ${
                isPoster ? 'object-cover' : 'object-contain p-4'
              } ${isHovered ? 'scale-105 brightness-110' : 'scale-100 brightness-90'}`}
            />
          ) : (
            <div className={`absolute inset-0 w-full h-full flex items-center justify-center`} style={{ background: 'var(--bg-card)' }}>
              {!isLive && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
                  <svg className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Gradient: subtle for poster */}
          {isPoster && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          )}

          {/* Type Badge - Top Left */}
          <div className="absolute top-2 left-2 z-10">
            {isLive && (
              <div className="badge badge-live">
                <div className="w-1 h-1 rounded-full bg-current" />
                Ao Vivo
              </div>
            )}
            {contentType === 'movie' && (
              <div className="badge badge-movie">
                <Film size={8} />
                Filme
              </div>
            )}
            {contentType === 'series' && (
              <div className="badge badge-series">
                Série
              </div>
            )}
          </div>

          {/* Quality Badge - Top Right */}
          {quality && (
            <div className="absolute top-2 right-2 z-10">
              <div className={`badge ${quality.className}`}>
                {quality.label}
              </div>
            </div>
          )}
          {!quality && channel.aiEnriched && (
            <div className="absolute top-2 right-2 z-10">
              <div className="badge badge-ai">AI</div>
            </div>
          )}

          {/* Play Icon on Hover */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity var(--duration) var(--ease)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--text-primary)',
                boxShadow: 'var(--shadow-button)',
              }}
            >
              <svg className="w-3.5 h-3.5 ml-0.5" style={{ color: 'var(--bg-card)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Info Area — Live only */}
          {isLive && (
            <div className="shrink-0 px-2.5 py-2" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
              <h3 className="text-[10px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                {channel.name}
              </h3>
              {channel.group && (
                <p className="text-[7px] font-medium mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
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
