import React, { useState, memo } from 'react';
import { Film } from 'lucide-react';

function getContentType(ch) {
  const t = ch.type || 'live';
  if (t === 'movie') return 'movie';
  if (t === 'series') return 'series';
  return 'live';
}

function getQuality(name) {
  if (!name) return null;
  if (/4K|UHD/i.test(name)) return { label: '4K', cls: 'badge-4k' };
  if (/FHD|1080/i.test(name)) return { label: '1080', cls: 'badge-muted' };
  if (/HD|720/i.test(name)) return { label: '720', cls: 'badge-muted' };
  return null;
}

function ChannelCard({ channel, onPlay, isValid, isPlayerOpen }) {
  if (!channel?.name) return null;
  const [hover, setHover] = useState(false);
  const [err, setErr] = useState(false);
  const ct = getContentType(channel);
  const isPoster = ct === 'movie' || ct === 'series';
  const isLive = ct === 'live';
  const q = getQuality(channel.name);

  return (
    <button
      onClick={() => { setHover(false); onPlay(channel); }}
      onMouseEnter={() => !isPlayerOpen && setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => !isPlayerOpen && setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative flex flex-col w-full text-left outline-none select-none"
    >
      <div
        className={`relative w-full overflow-hidden ${isLive ? 'aspect-[4/3] flex flex-col' : 'aspect-[2/3]'}`}
        style={{
          background: 'var(--surface-card)',
          border: hover ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-1)',
          borderRadius: 'var(--r-md)',
          boxShadow: hover ? 'var(--depth-2)' : 'var(--depth-1)',
          transform: hover ? 'translateY(-3px) scale(1.02)' : 'none',
          transition: 'all 200ms cubic-bezier(0.25,0.1,0.25,1)',
        }}
      >
        {/* ── POSTER (Filmes/Séries) — object-cover fills entire card ── */}
        {isPoster && (
          <>
            {!err && channel.logo ? (
              <img src={channel.logo} alt={channel.name} loading="lazy" onError={() => setErr(true)}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-200"
                style={{ filter: hover ? 'brightness(1.1)' : 'brightness(0.9)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--surface-card)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-sidebar)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--text-3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Film/Series title at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
              <h3 className="text-[11px] font-semibold leading-snug line-clamp-2 text-white drop-shadow-md">{channel.name}</h3>
              {channel.group && <p className="text-[8px] font-medium mt-0.5 truncate text-white/40">{channel.group}</p>}
            </div>
          </>
        )}

        {/* ── LIVE — centered logo with contain ── */}
        {isLive && (
          <div className="relative flex-1 min-h-0 overflow-hidden">
            {!err && channel.logo ? (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--surface-elevated)' }}>
                <img src={channel.logo} alt={channel.name} loading="lazy" onError={() => setErr(true)}
                  className="max-w-[75%] max-h-[75%] w-auto h-auto object-contain transition-all duration-200 drop-shadow-lg"
                  style={{ filter: hover ? 'brightness(1.15)' : 'brightness(0.95)' }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--surface-elevated)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-sidebar)', border: '1px solid var(--border-2)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--text-3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Badges ── */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          {isLive && <div className="badge badge-live"><div className="w-1 h-1 rounded-full bg-current" />Ao Vivo</div>}
          {ct === 'movie' && <div className="badge badge-muted"><Film size={8} />Filme</div>}
          {ct === 'series' && <div className="badge badge-purple">Série</div>}
        </div>

        {q && <div className="absolute top-2 right-2 z-10"><div className={`badge ${q.cls}`}>{q.label}</div></div>}
        {!q && channel.aiEnriched && <div className="absolute top-2 right-2 z-10"><div className="badge badge-muted">AI</div></div>}

        {/* ── Play ── */}
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ opacity: hover ? 1 : 0, transition: 'opacity 180ms ease' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--text-1)', boxShadow: 'var(--depth-btn)' }}>
            <svg className="w-4 h-4 ml-0.5" style={{ color: 'var(--surface-card)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>

        {/* ── Info — Live only ── */}
        {isLive && (
          <div className="shrink-0 px-3 py-2.5" style={{ background: 'var(--surface-elevated)', borderTop: '1px solid var(--border-1)' }}>
            <h3 className="text-[11px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-1)' }}>{channel.name}</h3>
            {channel.group && <p className="text-[9px] font-medium mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{channel.group}</p>}
          </div>
        )}
      </div>
    </button>
  );
}

export default memo(ChannelCard);
