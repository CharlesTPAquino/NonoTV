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
  const quality = getQualityBadge(channel.name);
  const isLive = contentType === 'live';

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
      className={`group relative flex flex-col w-full text-left outline-none transition-all duration-700 select-none ${
        isHovered ? 'z-30 scale-[1.05] md:scale-[1.08]' : 'z-0 scale-100'
      }`}
    >
      {/* Main Container - Aspect 2:3 Premium Poster */}
      <div className="relative aspect-[2/3] w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-[#050505] border border-white/5 group-hover:border-white/20 transition-all duration-700 shadow-2xl group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {/* Reflection Highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none z-30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-30" />

        {/* Channel Artwork */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`w-full h-full transition-all duration-1000 ${
                isPoster ? 'object-cover' : 'object-contain p-8'
              } ${isHovered ? 'scale-110 brightness-[0.4] blur-[2px]' : 'scale-100 brightness-[0.85]'}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1C1C1E] to-[#050505]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Tv className="w-8 h-8 text-white/10" />
              </div>
              <span className="text-white/20 text-xs font-black text-center uppercase tracking-widest leading-relaxed line-clamp-3">
                {channel.name}
              </span>
            </div>
          )}
        </div>

        {/* Video Preview Overlay (Live only) */}
        {isHovered && !isPlayerOpen && hlsLoaded && isLive && (
          <div className="absolute inset-0 z-10 bg-black/40 animate-in fade-in duration-700">
             <video 
              ref={videoRef} 
              muted 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover brightness-[0.6] blur-[1px]" 
            />
          </div>
        )}

        {/* Content Overlays - Gradient & Glass */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-20" />

        {/* Badges - Top Area */}
        <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
          {isLive && (
            <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-2xl border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">AO VIVO</span>
            </div>
          )}
          {contentType === 'movie' && (
            <div className="flex items-center gap-2 bg-[#F7941D] text-black px-3 py-1.5 rounded-xl shadow-2xl border border-white/20">
              <Film size={12} className="fill-black" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">FILME</span>
            </div>
          )}
          {contentType === 'series' && (
            <div className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-white/20">
              <Tv size={12} className="fill-white/20" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">SÉRIE</span>
            </div>
          )}
        </div>

        {/* Quality Badge - Top Right */}
        {quality && (
          <div className="absolute top-4 right-4 z-40">
            <div className={`bg-gradient-to-br ${quality.color} ${quality.glow} text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl border border-white/20 backdrop-blur-md`}>
              {quality.label}
            </div>
          </div>
        )}

        {/* Play Icon - Hover Center */}
        <div className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-700 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="relative group/play">
            <div className="absolute inset-0 bg-[#F7941D] rounded-full blur-3xl opacity-30 group-hover/play:opacity-60 transition-opacity" />
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-all duration-500 group-hover/play:scale-110 active:scale-90 border-4 border-white/20">
              <Play size={28} className="fill-black ml-1.5" />
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className={`absolute bottom-0 left-0 right-0 z-40 p-5 md:p-8 transition-all duration-700 ${
          isHovered ? 'translate-y-0' : 'translate-y-2'
        }`}>
          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
             <div className="w-1.5 h-1.5 bg-[#F7941D] rounded-full shadow-[0_0_8px_#F7941D]" />
             <span className="text-[#F7941D] text-[9px] font-black uppercase tracking-[0.3em] truncate max-w-[150px]">
               {channel.group || 'Elite Stream'}
             </span>
          </div>
          
          <h3 className="font-black text-sm md:text-base lg:text-lg text-white leading-tight tracking-tight drop-shadow-2xl line-clamp-2">
            {channel.name}
          </h3>

          <div className="mt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
            <div className="flex items-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-widest">
              <Clock size={12} />
              <span>Sinal Estável</span>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 text-[#4ADE80] text-[9px] font-black uppercase tracking-widest">
                <Zap size={12} className="fill-[#4ADE80]/20" />
                <span>Online</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Reflection Effect */}
      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-white/5 blur-md rounded-full transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
}

export default memo(ChannelCard);