import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, RotateCw, Settings } from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import useDeviceProfile from '../../hooks/useDeviceProfile';
import { setNavigationEnabled } from '../../utils/spatialNavigation';

/**
 * NonoTV — CINEMA VOD PLAYER
 * Ambiente exclusivo para Filmes e Séries (MP4/MKV).
 */
export default function CinemaPlayer({ channel, onClose }) {
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const hideTimer = useRef(null);
  const { isLite } = useDeviceProfile();

  const { playerState, togglePlay } = useHlsPlayer(channel?.url, videoRef);
  const { playing, buffering } = playerState;

  useEffect(() => {
    setNavigationEnabled(false);
    return () => setNavigationEnabled(true);
  }, []);

  const triggerControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing && !buffering) {
      hideTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
  }, [playing, buffering]);

  useEffect(() => {
    const handleKeys = (e) => {
      const isBackKey = e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4 || e.keyCode === 10009 || e.keyCode === 461;
      
      if (isBackKey) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        seek(-15);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        seek(15);
      } else if (e.key === 'Enter' || e.key === 'OK') {
        triggerControls();
      } else if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeys, true);
    return () => window.removeEventListener('keydown', handleKeys, true);
  }, [onClose, triggerControls, togglePlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      triggerControls();
    }
  };

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = x / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = clickedProgress * videoRef.current.duration;
    }
  };

  const currentTime = videoRef.current?.currentTime || 0;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#0A0A0B] flex items-center justify-center overflow-hidden" onMouseMove={triggerControls}>
      <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline />

      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
        className="absolute top-4 right-4 z-[10001] w-16 h-16 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all border border-white/10"
      >
        <X size={32} />
      </button>

      <div className={`absolute inset-0 bg-gradient-to-t from-black/100 via-transparent to-black/80 transition-opacity duration-700 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center">
          <div>
            <h2 className="text-white text-4xl font-black tracking-tighter drop-shadow-2xl uppercase italic">{channel.name}</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-2">NonoTV Cinema Elite • Ultra HD</p>
          </div>
          <div className="w-16" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-12">
          <button onClick={() => seek(-15)} className={`w-16 h-16 rounded-full ${isLite ? 'bg-black/80' : 'bg-white/5 backdrop-blur-md'} flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90 border border-white/10`}><RotateCcw size={28} /></button>
          <button onClick={togglePlay} className={`w-24 h-24 rounded-full bg-[#F59E0B] flex items-center justify-center text-black ${isLite ? '' : 'shadow-[0_0_50px_rgba(245,158,11,0.4)] hover:scale-110'} transition-all border-4 border-black/20`}>
            {playing ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
          <button onClick={() => seek(15)} className={`w-16 h-16 rounded-full ${isLite ? 'bg-black/80' : 'bg-white/5 backdrop-blur-md'} flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90 border border-white/10`}><RotateCw size={28} /></button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="flex items-center gap-6 mb-4 px-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}</span>
            <div className="h-px flex-1 bg-white/10" />
            <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
          </div>
          <div 
            className="group relative h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm border border-white/5"
            onClick={handleProgressBarClick}
          >
            <div className="absolute top-0 left-0 h-full bg-[#F59E0B] shadow-[0_0_20px_#F59E0B]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="w-20 h-20 border-8 border-[#F59E0B]/20 border-t-[#F59E0B] rounded-full animate-spin shadow-[0_0_50px_rgba(245,158,11,0.3)]" />
        </div>
      )}
    </div>
  );
}
