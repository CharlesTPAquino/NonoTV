import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, Play, Pause, SkipForward, SkipBack, RefreshCw, Mic, List, Volume2, Maximize2 } from 'lucide-react';
import { formatDuration } from '../../utils/formatTime';
import { usePlayer } from '../../context/PlayerContext';

/**
 * PLAYER DE PODCAST - REDESIGN ULTRA ELITE 4K
 * Reprodução imersiva com estética premium, glassmorphism e efeitos visuais.
 */

export default function PodcastPlayer({ podcast, onClose }) {
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (podcast.calls && podcast.calls.length > 0) {
      setCurrentCall(podcast.calls[0]);
    }
  }, [podcast]);

  useEffect(() => {
    if (currentCall) {
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [currentCall]);

  // Simulação de reprodução
  useEffect(() => {
    let interval;
    if (isPlaying && currentCall) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentCall.duration) {
            if (currentCallIndex < podcast.calls.length - 1) {
              const nextIdx = currentCallIndex + 1;
              setCurrentCallIndex(nextIdx);
              setCurrentCall(podcast.calls[nextIdx]);
              return 0;
            } else {
              setIsPlaying(false);
              return currentCall.duration;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentCall, currentCallIndex, podcast.calls]);

  const handleCallClick = useCallback((call, index) => {
    setCurrentCallIndex(index);
    setCurrentCall(call);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const nextCall = () => {
    if (currentCallIndex < podcast.calls.length - 1) {
      handleCallClick(podcast.calls[currentCallIndex + 1], currentCallIndex + 1);
    }
  };

  const prevCall = () => {
    if (currentCallIndex > 0) {
      handleCallClick(podcast.calls[currentCallIndex - 1], currentCallIndex - 1);
    }
  };

  if (!currentCall) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B] z-[300] flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-700">
      
      {/* Background Dynamic Blur */}
      <div className="absolute inset-0 z-0">
        {podcast.thumbnail && (
          <img 
            src={podcast.thumbnail} 
            className="w-full h-full object-cover opacity-20 blur-[100px] scale-110" 
            alt="blur" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </div>

      {/* Main Player Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Top Header */}
        <header className="p-6 md:p-10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-12 h-12 md:w-14 md:h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full flex items-center justify-center backdrop-blur-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="text-center hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-1 block">Reproduzindo Podcast</span>
            <h2 className="text-white font-black text-lg tracking-tight uppercase">{podcast.title}</h2>
          </div>

          <button
            onClick={() => setShowList(!showList)}
            className={`w-12 h-12 md:w-14 md:h-14 border rounded-full flex items-center justify-center backdrop-blur-2xl transition-all active:scale-90 ${
              showList ? 'bg-white border-white/20 text-black ' : 'bg-white/5 border-white/5 text-white'
            }`}
          >
            <List className="w-6 h-6" />
          </button>
        </header>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          
          {/* Cover Art - Reflective Style */}
          <div className="relative group mb-10 md:mb-14">
            <div className="absolute -inset-4 bg-gradient-to-tr from-white/20 to-white/10 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative w-56 h-56 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl reflective-glass">
              {podcast.thumbnail ? (
                <img
                  src={podcast.thumbnail}
                  alt={podcast.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#27272A] to-[#09090B] flex items-center justify-center">
                  <Mic className="w-20 h-20 text-white/10" />
                </div>
              )}
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#09090B] animate-bounce-slow">
              <Mic className="text-black w-8 h-8" />
            </div>
          </div>

          {/* Episode Info */}
          <div className="max-w-2xl animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-center gap-2 mb-4">
               <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                 Chamada {currentCallIndex + 1} de {podcast.calls.length}
               </span>
            </div>
            
            <h3 className="text-white font-black text-2xl md:text-4xl lg:text-5xl leading-tight mb-4 tracking-tighter drop-shadow-2xl">
              {currentCall.title}
            </h3>
            
            {currentCall.channelName && (
              <p className="text-white/50 font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-8">
                {currentCall.channelName}
              </p>
            )}
          </div>

          {/* Progress Bar Area */}
          <div className="w-full max-w-xl px-4 md:px-0 mb-12">
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md mb-4 group cursor-pointer">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white to-white/50 transition-all duration-1000 "
                style={{ width: `${((currentTime) / currentCall.duration) * 100}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-sm" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              <span className="text-white/60">{formatDuration(currentTime)}</span>
              <span>{formatDuration(currentCall.duration)}</span>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-center gap-6 md:gap-12">
            <button
              onClick={prevCall}
              disabled={currentCallIndex <= 0}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 text-white disabled:opacity-20 transition-all active:scale-90"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-20 h-20 md:w-28 md:h-28 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-110 active:scale-90 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
              ) : (
                <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-2" />
              )}
            </button>

            <button
              onClick={nextCall}
              disabled={currentCallIndex >= podcast.calls.length - 1}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 text-white disabled:opacity-20 transition-all active:scale-90"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <footer className="p-8 hidden md:flex items-center justify-between opacity-40">
           <div className="flex items-center gap-4">
             <Volume2 size={18} />
             <div className="w-24 h-1 bg-white/10 rounded-full" />
           </div>
           <div className="flex items-center gap-4">
             <RefreshCw size={18} className={isPlaying ? 'animate-spin' : ''} />
             <span className="text-[10px] font-black uppercase tracking-widest">Sinal de Áudio HQ</span>
           </div>
           <button className="hover:text-white transition-colors">
             <Maximize2 size={18} />
           </button>
        </footer>
      </div>

      {/* Episodes Sidebar - Glass Style */}
      <aside className={`fixed md:relative inset-y-0 right-0 w-full md:w-[400px] bg-black/40 backdrop-blur-[80px] border-l border-white/10 z-50 transition-transform duration-700 ease-in-out ${
        showList ? 'translate-x-0' : 'translate-x-full md:hidden'
      }`}>
        <div className="h-full flex flex-col p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-white font-black text-xl tracking-tight uppercase">Chamadas</h4>
            <button onClick={() => setShowList(false)} className="md:hidden text-white/40 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {podcast.calls.map((call, index) => (
              <button
                key={index}
                onClick={() => handleCallClick(call, index)}
                className={`w-full group p-4 rounded-2xl flex items-center gap-4 transition-all duration-500 border ${
                  index === currentCallIndex
                    ? 'bg-white border-white/20 text-black '
                    : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  index === currentCallIndex ? 'bg-black/10 border-black/20' : 'bg-black/40 border-white/10'
                }`}>
                  {index === currentCallIndex && isPlaying ? (
                    <div className="flex items-end gap-1 h-3">
                      <div className="w-1 bg-current animate-music-bar-1" />
                      <div className="w-1 bg-current animate-music-bar-2" />
                      <div className="w-1 bg-current animate-music-bar-3" />
                    </div>
                  ) : (
                    <span className="text-xs font-black">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-black truncate mb-0.5 ${
                    index === currentCallIndex ? 'text-black' : 'text-white'
                  }`}>
                    {call.title}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${
                      index === currentCallIndex ? 'text-black/60' : 'text-white/30'
                    }`}>
                      {call.channelName}
                    </p>
                    <span className={`text-[10px] font-bold ${
                      index === currentCallIndex ? 'text-black/40' : 'text-white/20'
                    }`}>
                      {formatDuration(call.duration)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay Mobile for list */}
      {showList && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setShowList(false)} />
      )}
    </div>
  );
}