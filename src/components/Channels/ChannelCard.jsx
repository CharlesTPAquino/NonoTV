import React, { useState, useRef, useEffect, memo } from 'react';
import { Play, Radio, Film, Clapperboard } from 'lucide-react';
import Hls from 'hls.js';

// Type-driven configuration (aspect ratio, colors, icon)
const TYPE_CONFIG = {
  live:   { ratio: 'aspect-video',       badge: '🔴 AO VIVO', badgeClass: 'bg-red-600',           icon: Radio,       accentColor: 'rgba(239,68,68,0.6)' },
  movie:  { ratio: 'aspect-[2/3]',       badge: '🎬 FILME',   badgeClass: 'bg-[#6366F1]',         icon: Film,        accentColor: 'rgba(99,102,241,0.6)' },
  series: { ratio: 'aspect-[2/3]',       badge: '📺 SÉRIE',   badgeClass: 'bg-[#10B981]',         icon: Clapperboard,accentColor: 'rgba(16,185,129,0.6)' },
};

const FALLBACK_GRADIENT = {
  live:   'from-red-900/80 via-gray-900 to-black',
  movie:  'from-indigo-900/80 via-gray-900 to-black',
  series: 'from-emerald-900/80 via-gray-900 to-black',
};

function ChannelCard({ channel, onPlay, isValid, isPlayerOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const type = channel.type || 'live';
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.live;
  const TypeIcon = config.icon;

  // Kill preview when main player opens
  useEffect(() => {
    if (isPlayerOpen) {
      setIsHovered(false);
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    }
  }, [isPlayerOpen]);

  // HLS Preview (only for live channels on hover)
  useEffect(() => {
    if (type !== 'live' || !isHovered || isPlayerOpen || !videoRef.current) return;
    const video = videoRef.current;
    
    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 2, manifestLoadingMaxRetry: 1 });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    };
  }, [isHovered, type, channel.url, isPlayerOpen]);

  const handleClick = () => { setIsHovered(false); onPlay(channel); };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !isPlayerOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !isPlayerOpen && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative flex flex-col w-full text-left outline-none focus:ring-2 focus:ring-[#F7941D] rounded-2xl overflow-hidden transition-all duration-500 active:scale-95 bg-[#1A1C22] shadow-xl hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${config.ratio} ${
        isHovered ? 'ring-2 ring-[#F7941D] ring-offset-2 ring-offset-[#050505] scale-[1.03]' : ''
      }`}
    >
      {/* ─── Image Area ─── */}
      <div className="absolute inset-0">
        {!imgError && channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            onError={() => setImgError(true)}
            className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${type === 'live' ? 'object-contain p-4' : 'object-cover'}`}
          />
        ) : (
          // Gorgeous Fallback: Gradient + initials
          <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENT[type]} flex items-center justify-center`}>
            <div className="text-white/20 font-black text-5xl select-none truncate px-4">
              {channel.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Video Preview Layer (LIVE only) */}
        {isHovered && type === 'live' && !isPlayerOpen && (
          <div className="absolute inset-0 z-10 bg-black animate-in fade-in duration-500">
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
      </div>

      {/* ─── Top Badges Row ─── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
        <span className={`text-[9px] font-black uppercase tracking-[0.15em] text-white px-2 py-0.5 rounded-full ${config.badgeClass} shadow-lg`}>
          {config.badge}
        </span>
        {/* Signal Dot */}
        <span className={`w-2 h-2 rounded-full border border-black/50 shadow-sm ${isValid !== false ? 'bg-emerald-400' : 'bg-red-500'}`} />
      </div>
      
      {/* ─── Play Button Center ─── */}
      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300">
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-full p-4 scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
          <Play size={22} fill="white" className="text-white" />
        </div>
      </div>

      {/* ─── Glass Footer ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-white text-[11px] leading-tight truncate drop-shadow-xl uppercase tracking-wide">
            {channel.name}
          </h3>
          <p className="text-white/50 text-[9px] font-bold tracking-widest mt-0.5 truncate uppercase">
            {channel.group}
          </p>
        </div>
        <TypeIcon size={16} className="text-white/30 shrink-0 group-hover:text-white/70 transition-colors" />
      </div>
    </button>
  );
}

export default memo(ChannelCard, (prevProps, nextProps) => {
  return (
    prevProps.channel.id === nextProps.channel.id &&
    prevProps.channel.name === nextProps.channel.name &&
    prevProps.channel.logo === nextProps.channel.logo &&
    prevProps.isPlayerOpen === nextProps.isPlayerOpen &&
    prevProps.isValid === nextProps.isValid
  );
});
