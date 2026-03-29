import React, { useMemo } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import ChannelCard from './ChannelCard';

export default function AIRecommendations({ channels, onPlay, validity = {}, isPlayerOpen = false }) {
  const recommendations = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    
    try {
      const { aiService } = require('../../services/AIService');
      return aiService.getRecommendations(channels, 8);
    } catch {
      return channels.slice(0, 8);
    }
  }, [channels]);

  if (recommendations.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-[#F7941D] to-[#FFD700] rounded-full shadow-[0_0_12px_#F7941D]" />
        <Sparkles size={18} className="text-[#F7941D]" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Recomendado Para Você
        </h2>
        <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded-full">
          AI
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-6 px-6">
        {recommendations.map((channel, idx) => (
          <div
            key={channel.id || idx}
            className="flex-shrink-0 w-[160px] md:w-[180px]"
          >
            <ChannelCard
              channel={channel}
              onPlay={() => onPlay(channel)}
              isValid={validity[channel.id]}
              isPlayerOpen={isPlayerOpen}
            />
          </div>
        ))}

        <button className="flex-shrink-0 w-[120px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 hover:border-[#F7941D]/30 hover:bg-[#F7941D]/5 transition-all">
          <ChevronRight size={24} className="text-white/30" />
          <span className="text-xs font-bold text-white/30 uppercase tracking-wider text-center px-2">
            Ver Mais
          </span>
        </button>
      </div>
    </section>
  );
}
