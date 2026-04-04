import React, { useMemo } from 'react';
import { Play, Tv } from 'lucide-react';

export default function SeriesGroup({ channels, onPlay, isPlayerOpen }) {
  const uniqueSeries = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    const seen = new Set();
    return channels.filter(ch => {
      if (!ch || !ch.name) return false;
      const key = ch.group || ch.name.replace(/S\d+|T\d+|Season|Temporada|EP?|E\d+/gi, '').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [channels]);

  if (!channels || channels.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-1)' }}>
          <Tv size={16} style={{ color: 'var(--text-2)' }} />
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Séries</h2>
          <p className="text-[9px] font-medium uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-3)' }}>
            {uniqueSeries.length} {uniqueSeries.length === 1 ? 'série' : 'séries'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {uniqueSeries.map((channel, idx) => (
          <button
            key={`${channel.id}-${idx}`}
            onClick={() => onPlay(channel)}
            className="group relative flex flex-col w-full text-left outline-none select-none"
            style={{ transition: 'all 180ms cubic-bezier(0.25,0.1,0.25,1)' }}
          >
            <div
              className="relative w-full aspect-[2/3] overflow-hidden"
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-1)',
                borderRadius: 'var(--r)',
                boxShadow: 'var(--depth-1)',
                transition: 'all 180ms cubic-bezier(0.25,0.1,0.25,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--depth-2)'; e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--depth-1)'; e.currentTarget.style.borderColor = 'var(--border-1)'; }}
            >
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={channel.originalName || channel.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-200"
                  style={{ filter: 'brightness(0.9)' }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ background: 'var(--surface-card)' }}>
                  <span className="text-white/30 text-sm font-medium text-center line-clamp-3">
                    {channel.originalName || channel.name}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute top-2 left-2 z-10">
                <span className="badge badge-purple">
                  <Tv size={8} />
                  Série
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-180">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--text-1)', boxShadow: 'var(--depth-btn)' }}>
                  <svg className="w-3.5 h-3.5 ml-0.5" style={{ color: 'var(--surface-card)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                <h3 className="text-[10px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-1)' }}>
                  {channel.originalName || channel.name}
                </h3>
                {channel.group && (
                  <p className="text-[7px] font-medium mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                    {channel.group}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
