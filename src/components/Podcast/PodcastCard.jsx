import React from 'react';
import { Clock, MessageSquare, Play, Mic } from 'lucide-react';
import { formatDuration } from '../../utils/formatTime';

/**
 * CARD DE PODCAST INDIVIDUAL - REDESIGN ULTRA ELITE 4K
 * Exibe um podcast com estética premium, glassmorphism e efeitos reflexivos.
 */

export default function PodcastCard({ podcast, onPress }) {
  const { id, title, date, callCount, duration, thumbnail } = podcast;

  const handleClick = (e) => {
    e.preventDefault();
    onPress?.(podcast);
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-full aspect-video md:aspect-[16/10] bg-[#1C1C1E] rounded-2xl md:rounded-[2rem] overflow-hidden transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#F7941D]/50 reflective-glass border border-white/5 hover:border-white/20 shadow-2xl text-left"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7941D]/0 via-transparent to-[#F7941D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

      {/* Thumbnail Area */}
      <div className="absolute inset-0 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 brightness-[0.7] group-hover:brightness-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#27272A] to-[#09090B] flex items-center justify-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
              <Mic className="w-8 h-8 text-white/20" />
            </div>
          </div>
        )}
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-40" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end z-10">
        {/* Metadata Top */}
        <div className="absolute top-5 right-5 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-2xl rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
            {formatDate(date)}
          </div>
        </div>

        {/* Title & Info */}
        <div className="relative translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
             <span className="w-2 h-2 bg-[#F7941D] rounded-full animate-pulse shadow-[0_0_10px_#F7941D]" />
             <span className="text-[#F7941D] text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-md">Podcast Premium</span>
          </div>
          
          <h3 className="text-white font-black text-lg md:text-xl lg:text-2xl leading-tight mb-4 line-clamp-2 drop-shadow-2xl tracking-tight">
            {title}
          </h3>

          <div className="flex items-center gap-5 text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span>{callCount} Chamadas</span>
            </div>
          </div>
        </div>

        {/* Play Button Icon - Hover Only */}
        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 delay-200">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F7941D] text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(247,148,29,0.4)] hover:scale-110 active:scale-90 transition-all border-4 border-white/20">
            <Play className="w-7 h-7 fill-black ml-1.5" />
          </div>
        </div>
      </div>
      
      {/* Glossy Quina */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
    </button>
  );
}

/**
 * Função auxiliar: Formatar data em formato curto
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}