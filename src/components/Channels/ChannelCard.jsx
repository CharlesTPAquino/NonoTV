import React, { useState, useRef, useEffect, memo } from 'react';
import { Play, Star, Clock, Film, Tv, Info, Zap } from 'lucide-react';

let HlsClass = null;

/**
 * Extrai badges de qualidade do nome do canal
 */
function getQualityBadge(name) {
  if (!name) return null;
  if (/4K|UHD/i.test(name)) return { label: 'ULTRA 4K', color: 'from-[#F7941D] to-[#FBB03B]', glow: 'shadow-[#F7941D]/40' };
  if (/FHD|1080/i.test(name)) return { label: 'FULL HD', color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/40' };
  if (/HD|720/i.test(name)) return { label: 'HD', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/40' };
  return null;
}

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
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const contentType = getContentType(channel);
  const isPoster = contentType === 'movie' || contentType === 'series';
  const isLive = contentType === 'live';
  const quality = getQualityBadge(channel.name);

  // Layout dinâmico: 16:9 para LIVE, 2:3 para VOD
  const aspectClass = isLive ? 'aspect-video' : 'aspect-[2/3]';
  const containerRadius = isLive ? 'rounded-2xl' : 'rounded-[1.5rem] md:rounded-[2rem]';

  useEffect(() => {
    if (isPlayerOpen) {
      setIsHovered(false);
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    }
  }, [isPlayerOpen]);

  useEffect(() => {
    if (!HlsClass) {
      import('hls.js').then((module) => {
        HlsClass = module.default;
        setHlsLoaded(true);
      });
    } else {
      setHlsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isHovered || isPlayerOpen || !videoRef.current || !hlsLoaded || !HlsClass || isPoster) return;
    const video = videoRef.current;
    
    if (HlsClass.isSupported()) {
      const hls = new HlsClass({ 
        maxBufferLength: 2, 
        manifestLoadingMaxRetry: 1,
        enableWorker: true 
      });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    };
  }, [isHovered, channel.url, isPlayerOpen, hlsLoaded, isPoster]);

  const handleClick = () => { setIsHovered(false); onPlay(channel); };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !isPlayerOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !isPlayerOpen && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative flex flex-col w-full text-left outline-none transition-all duration-500 select-none ${
        isHovered ? 'z-30 scale-[1.05]' : 'z-0 scale-100'
      }`}
    >
      {/* Main Container */}
      <div className={`relative ${aspectClass} w-full ${containerRadius} overflow-hidden bg-[#050505] border border-white/5 group-hover:border-[#F7941D]/50 transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_30px_rgba(247,148,29,0.2)]`}>
        
        {/* Reflection Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-30" />

        {/* Artwork */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`w-full h-full transition-all duration-700 ${
                isPoster ? 'object-cover' : 'object-contain p-6'
              } ${isHovered ? 'scale-110 brightness-[0.4] blur-[2px]' : 'scale-100 brightness-[0.85]'}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1C1C1E] to-[#050505]">
              <Tv className="w-8 h-8 text-white/10 mb-2" />
              <span className="text-white/20 text-[8px] font-black text-center uppercase tracking-widest line-clamp-2">
                {channel.name}
              </span>
            </div>
          )}
        </div>

        {/* Video Preview Overlay (Live only) */}
        {isHovered && !isPlayerOpen && hlsLoaded && isLive && (
          <div className="absolute inset-0 z-10 bg-black/40">
             <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover brightness-[0.6]" />
          </div>
        )}

        {/* Dynamic Glow for LIVE */}
        {isLive && isHovered && (
          <div className="absolute inset-0 z-20 border-2 border-red-600/50 animate-pulse" />
        )}

        {/* Content Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-20" />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-40 flex flex-col gap-1.5">
          {isLive && (
            <div className="flex items-center gap-1.5 bg-red-600 px-2 py-1 rounded-lg shadow-xl border border-white/20 pulse-glow">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[8px] font-black uppercase tracking-tighter">AO VIVO</span>
            </div>
          )}
          {contentType === 'movie' && (
            <div className="flex items-center gap-1.5 bg-[#F7941D] text-black px-2 py-1 rounded-lg font-black uppercase tracking-tighter text-[8px]">
              <Film size={10} className="fill-black" />
              <span>FILME</span>
            </div>
          )}
        </div>

        {/* Quality Badge */}
        {quality && (
          <div className="absolute top-3 right-3 z-40">
            <div className={`bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg border border-white/10`}>
              {quality.label}
            </div>
          </div>
        )}

        {/* Play Icon */}
        <div className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-500 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}>
          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border-4 border-white/20`}>
            <Play size={24} className="fill-black ml-1" />
          </div>
        </div>

        {/* Info Area */}
        <div className={`absolute bottom-0 left-0 right-0 z-40 p-4 md:p-6 transition-all duration-500 ${
          isHovered ? 'translate-y-0' : 'translate-y-1'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
             <div className={`w-1 h-1 rounded-full ${isLive ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-[#F7941D]'}`} />
             <span className="text-white/40 text-[8px] font-black uppercase tracking-widest truncate">
               {channel.group || 'Elite'}
             </span>
          </div>
          
          <h3 className={`font-black ${isLive ? 'text-xs md:text-sm' : 'text-sm md:text-base'} text-white leading-tight line-clamp-2`}>
            {channel.name}
          </h3>
        </div>
      </div>
    </button>
  );
}

export default memo(ChannelCard);