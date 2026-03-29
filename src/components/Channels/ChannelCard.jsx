import React, { useState, useRef, useEffect, memo } from 'react';
import { Play, Star, Clock, Film, Tv } from 'lucide-react';

let HlsClass = null;

/**
 * Extrai badges de qualidade do nome do canal
 */
function getQualityBadge(name) {
  if (/4K|UHD/i.test(name)) return { label: '4K', color: 'from-amber-500 to-orange-600' };
  if (/FHD|1080/i.test(name)) return { label: 'FHD', color: 'from-blue-500 to-indigo-600' };
  if (/HD|720/i.test(name)) return { label: 'HD', color: 'from-emerald-500 to-teal-600' };
  if (/H\.?265|HEVC/i.test(name)) return { label: 'H265', color: 'from-purple-500 to-violet-600' };
  return null;
}

function getContentType(channel) {
  const type = channel.type || 'live';
  if (type === 'movie') return 'movie';
  if (type === 'series') return 'series';
  return 'live';
}

function ChannelCard({ channel, onPlay, isValid, isPlayerOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const contentType = getContentType(channel);
  const isPoster = contentType === 'movie' || contentType === 'series';
  const quality = getQualityBadge(channel.name);

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
      const hls = new HlsClass({ maxBufferLength: 2, manifestLoadingMaxRetry: 1 });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(HlsClass.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
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

  // Gera cor de fundo baseada no nome do canal
  const hue = channel.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const bgGradient = `hsl(${hue}, 40%, 15%)`;
  const bgGradient2 = `hsl(${(hue + 40) % 360}, 50%, 8%)`;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !isPlayerOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !isPlayerOpen && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative flex flex-col w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
        isHovered ? 'scale-[1.05] z-20 shadow-2xl shadow-black/60' : 'scale-100 z-0'
      }`}
    >
      {/* Thumbnail Container */}
      <div 
        className={`relative ${isPoster ? 'aspect-[2/3]' : 'aspect-video'} rounded-2xl overflow-hidden`}
        style={{ background: `linear-gradient(135deg, ${bgGradient}, ${bgGradient2})` }}
      >
        
        {/* Channel Logo/Thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`w-full h-full transition-all duration-500 ${
                isPoster ? 'object-cover' : 'object-contain p-4'
              } ${isHovered ? 'scale-110 brightness-75' : 'scale-100 brightness-100'}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className={`${isPoster ? 'w-20 h-20' : 'w-14 h-14'} rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10`}>
                {isPoster ? (
                  <Film size={isPoster ? 32 : 24} className="text-white/30" />
                ) : (
                  <span className="text-2xl font-black text-white/40">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isPoster && (
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest text-center px-4 line-clamp-2">
                  {channel.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Video Preview on Hover (apenas live) */}
        {isHovered && !isPlayerOpen && hlsLoaded && !isPoster && (
          <div className="absolute inset-0 z-10 bg-black/80 animate-fadeIn">
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover" />
          </div>
        )}

        {/* Gradient Overlay (posters) */}
        {isPoster && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        )}

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {contentType === 'live' && (
            <span className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {contentType === 'movie' && (
            <span className="flex items-center gap-1.5 bg-violet-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
              <Film size={10} />
              FILME
            </span>
          )}
          {contentType === 'series' && (
            <span className="flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
              <Tv size={10} />
              SÉRIE
            </span>
          )}
        </div>

        {/* Quality Badge - Top Right */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          {quality && (
            <span className={`bg-gradient-to-r ${quality.color} text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg`}>
              {quality.label}
            </span>
          )}
        </div>

        {/* Play Button Overlay */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent'
        }`}>
          <div className={`relative transition-all duration-300 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}>
            <div className="absolute inset-0 bg-[#F7941D] rounded-full blur-xl opacity-40 animate-pulse" />
            <div className="relative w-14 h-14 rounded-full bg-[#F7941D] flex items-center justify-center shadow-xl border-2 border-white/20">
              <Play size={22} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Bottom Info for Posters */}
        {isPoster && (
          <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-2'
          }`}>
            <h3 className="font-black text-sm text-white leading-tight line-clamp-2 drop-shadow-lg">
              {channel.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                {channel.group || (contentType === 'movie' ? 'Filme' : 'Série')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Channel Info (apenas para live) */}
      {!isPoster && (
        <div className="mt-3 px-1">
          <h3 className={`font-bold text-[13px] text-white truncate leading-tight transition-colors duration-200 ${
            isHovered ? 'text-[#F7941D]' : ''
          }`}>
            {channel.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[#71717A] text-[11px] truncate font-medium">{channel.group || 'TV'}</span>
            <span className="w-1 h-1 rounded-full bg-[#52525B]" />
            <span className="text-[#71717A] text-[11px] font-medium">Ao Vivo</span>
          </div>
        </div>
      )}
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
