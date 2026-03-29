import React, { useMemo } from 'react';
import { Play, Clock, ChevronRight, Film, Tv } from 'lucide-react';

export default function ContinueWatching({ history = [], onPlayChannel, maxItems = 6 }) {
  const recentItems = useMemo(() => {
    return history
      .filter(item => item.lastWatched && item.url)
      .sort((a, b) => b.lastWatched - a.lastWatched)
      .slice(0, maxItems);
  }, [history, maxItems]);

  if (recentItems.length === 0) return null;

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Agora mesmo';
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    return `${days} dias atrás`;
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-[#F7941D] rounded-full shadow-[0_0_12px_#F7941D]" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Continuar Assistindo
        </h2>
        <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-1 rounded-full">
          {recentItems.length}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-6 px-6">
        {recentItems.map((item) => (
          <button
            key={item.id || item.lastWatched}
            onClick={() => onPlayChannel && onPlayChannel(item)}
            className="group relative min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0"
          >
            <div className="relative aspect-[9/16] md:aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-white/30">
              {item.logo ? (
                <img 
                  src={item.logo} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                  {item.type === 'movie' ? (
                    <Film size={32} className="text-white/20" />
                  ) : (
                    <Tv size={32} className="text-white/20" />
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-bold text-white text-sm truncate mb-1">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                  <Clock size={10} />
                  <span>{formatTime(item.lastWatched)}</span>
                </div>
              </div>

              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#F7941D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Play size={16} fill="currentColor" className="text-black ml-0.5" />
              </div>

              {item.watchTime > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-[#F7941D]"
                    style={{ width: `${Math.min((item.watchTime / 300) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </button>
        ))}

        {recentItems.length > 0 && (
          <button className="min-w-[120px] w-[120px] md:min-w-[160px] md:w-[160px] flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all">
            <ChevronRight size={24} className="text-white/30" />
            <span className="text-xs font-bold text-white/30 uppercase tracking-wider">
              Ver Histórico
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
