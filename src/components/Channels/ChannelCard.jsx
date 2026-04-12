import React, { useState, memo } from 'react';
import { Film, Tv } from 'lucide-react';
import { prefetchService } from '../../services/PrefetchService';

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
      onFocus={() => {
        if (!isPlayerOpen) {
          setHover(true);
          window._prefetchTimer = setTimeout(() => {
            prefetchService.prefetchChannel(channel);
          }, 800);
        }
      }}
      onBlur={() => {
        setHover(false);
        if (window._prefetchTimer) clearTimeout(window._prefetchTimer);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(channel);
        }
      }}
      tabIndex={0}
      data-focusable
      data-nav-zone="grid"
      className="group relative flex flex-col w-full text-left outline-none select-none transition-all duration-300 active:scale-95"
    >
      <div
        className={`relative w-full overflow-hidden ${isLive ? 'aspect-[4/3] flex flex-col' : 'aspect-[2/3]'}`}
        style={{
          background: isLive ? 'linear-gradient(165deg, #121216 0%, #020202 100%)' : 'var(--surface-card)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0px',
          boxShadow: hover 
            ? '0 30px 60px -12px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.12)' 
            : '0 12px 24px -8px rgba(0,0,0,0.6)',
          transform: hover ? 'translateY(-8px) scale(1.04)' : 'none',
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Deep Ambient Occlusion Glow */}
        <div className={`absolute -inset-2 transition-opacity duration-700 opacity-0 group-hover:opacity-20 pointer-events-none bg-white blur-2xl z-0`} style={{ borderRadius: '0px' }} />

        {/* ── POSTER (Filmes/Séries) ── */}
        {isPoster && (
          <>
            {!err && channel.logo ? (
              <img src={channel.logo} alt={channel.name} loading="lazy" onError={() => setErr(true)}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                style={{ filter: hover ? 'brightness(1.1) saturate(1.1)' : 'brightness(0.85)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]">
                 <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/5">
                    <Film size={20} className="text-white/20" />
                 </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10">
              <h3 className="text-[12px] md:text-[13px] font-bold leading-tight line-clamp-2 text-white tracking-tight drop-shadow-lg">
                {channel.name}
              </h3>
              {channel.group && (
                <p className="text-[9px] font-bold mt-1 uppercase tracking-[0.15em] text-white/30 truncate">
                  {channel.group}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── LIVE — Centered Premium Logo ── */}
        {isLive && (
          <div className="relative flex-1 min-h-0 overflow-hidden bg-transparent flex flex-col z-10">
            {!err && channel.logo ? (
              <div className="absolute inset-0 flex items-center justify-center p-7 md:p-9">
                <img src={channel.logo} alt={channel.name} loading="lazy" onError={() => setErr(true)}
                  className="w-full h-full object-contain transition-all duration-700 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  style={{ transform: hover ? 'scale(1.2) rotate(-2deg)' : 'scale(1)' }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-14 h-14 bg-white/5 flex items-center justify-center border border-white/5">
                    <Tv size={24} className="text-white/10" />
                 </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
          </div>
        )}

        {/* ── Status Badges (Premium Style) ── */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {isLive && (
            <div className="px-2 py-0.5 bg-red-600 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(220,38,38,0.3)]">
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE</span>
            </div>
          )}
        </div>

        {q && (
          <div className="absolute top-3 right-3 z-20">
            <div className={`px-1.5 py-0.5 text-[8px] font-black border backdrop-blur-md tracking-widest ${
              q.label === '4K' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-white/50'
            }`}>
              {q.label}
            </div>
          </div>
        )}

        {/* ── Channel Title (Live Only) ── */}
        {isLive && (
          <div className="shrink-0 px-4 pb-4 pt-1 bg-transparent relative z-10">
            <h3 className="text-[12px] md:text-[13px] font-bold leading-tight line-clamp-1 text-white/95 tracking-tight group-hover:text-white transition-colors">
              {channel.name}
            </h3>
            <p className="text-[9px] font-black mt-1.5 truncate text-white/20 uppercase tracking-[0.2em]">
              {channel.group || 'Geral'}
            </p>
          </div>
        )}

        {/* ── Play Button Overlay ── */}
        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
           <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
           </div>
        </div>
        </div>
        </button>
  );
}

export default memo(ChannelCard);
