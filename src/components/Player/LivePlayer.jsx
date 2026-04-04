import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, List, Info } from 'lucide-react';
import useHlsPlayer from '../../hooks/useHlsPlayer';
import { usePlayer } from '../../context/PlayerContext';
import useDeviceProfile from '../../hooks/useDeviceProfile';
import { setNavigationEnabled } from '../../utils/spatialNavigation';

/**
 * NonoTV — LIVE ELITE PLAYER
 * Ambiente exclusivo para transmissões em tempo real (HLS/TS).
 */
export default function LivePlayer({ channel, channels, onClose }) {
  const videoRef = useRef(null);
  const { playChannel } = usePlayer();
  const [showOverlay, setShowOverlay] = useState(true);
  const overlayTimer = useRef(null);
  const { isLite } = useDeviceProfile();

  const { playerState, togglePlay } = useHlsPlayer(channel?.url, videoRef);
  const { buffering, error } = playerState;

  useEffect(() => {
    setNavigationEnabled(false);
    return () => setNavigationEnabled(true);
  }, []);

  const triggerOverlay = useCallback(() => {
    setShowOverlay(true);
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = setTimeout(() => setShowOverlay(false), 4000);
  }, []);

  const zapping = useCallback((direction) => {
    const idx = channels.findIndex(c => c.id === channel.id);
    if (direction === 'next' && idx < channels.length - 1) playChannel(channels[idx + 1]);
    if (direction === 'prev' && idx > 0) playChannel(channels[idx - 1]);
    triggerOverlay();
  }, [channels, channel, playChannel, triggerOverlay]);

  useEffect(() => {
    const handleKeys = (e) => {
      const isBackKey = e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4 || e.keyCode === 10009 || e.keyCode === 461;
      
      if (isBackKey) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        zapping('prev');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        zapping('next');
      } else if (e.key === 'Enter' || e.key === 'OK') {
        triggerOverlay();
      }
    };
    window.addEventListener('keydown', handleKeys, true);
    return () => window.removeEventListener('keydown', handleKeys, true);
  }, [zapping, onClose, triggerOverlay]);

  return (
    <div className="fixed inset-0 z-[10000] bg-black overflow-hidden" onClick={triggerOverlay}>
      <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline />

      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
        className="absolute top-4 right-4 z-[10001] w-14 h-14 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all border border-white/10"
      >
        <X size={32} />
      </button>

      <div className={`absolute inset-0 transition-all duration-500 ${showOverlay ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="absolute top-0 left-0 right-0 p-10 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 ${isLite ? 'bg-black/90' : 'bg-white/5 backdrop-blur-xl shadow-2xl'} rounded-2xl p-2 border border-white/10`}>
              <img src={channel.logo} alt="" decoding="async" loading="lazy" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse uppercase">Live</span>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{channel.group}</span>
              </div>
              <h2 className="text-white text-4xl font-black tracking-tighter uppercase italic">{channel.name}</h2>
            </div>
          </div>
          <div className="w-14" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/90 to-transparent">
           <div className="flex items-center gap-4 text-[#F59E0B] mb-4">
              <List size={20} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Lista de Canais • Zapping Ativo</span>
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
