import React, { useMemo } from 'react';
import { Play, Tv } from 'lucide-react';

export default function SeriesGroup({ channels, onPlay, isPlayerOpen }) {
  const uniqueSeries = useMemo(() => {
    const seen = new Set();
    return channels.filter(ch => {
      const key = ch.group || ch.name.replace(/S\d+|T\d+|Season|Temporada|EP?|E\d+/gi, '').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [channels]);

  if (channels.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Tv size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Séries</h2>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            {uniqueSeries.length} {uniqueSeries.length === 1 ? 'série' : 'séries'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {uniqueSeries.map((channel, idx) => (
          <button
            key={`${channel.id}-${idx}`}
            onClick={() => onPlay(channel)}
            className="group relative flex flex-col w-full text-left rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 focus-visible:ring-2 focus-visible:ring-[#F7941D] outline-none"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={channel.originalName || channel.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-50"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <span className="text-white/40 text-sm font-bold text-center line-clamp-3">
                    {channel.originalName || channel.name}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute top-3 left-3 z-10">
                <span className="flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                  <Tv size={10} />
                  SÉRIE
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F7941D] rounded-full blur-lg opacity-50" />
                  <div className="relative w-14 h-14 rounded-full bg-[#F7941D] flex items-center justify-center shadow-xl border-2 border-white/30">
                    <Play size={22} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                <h3 className="font-black text-sm text-white leading-tight line-clamp-2 drop-shadow-lg">
                  {channel.originalName || channel.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                    {channel.group || 'Série'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
