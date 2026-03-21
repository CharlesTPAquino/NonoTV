import React, { useMemo, useState, useEffect } from 'react';
import ChannelCard from './ChannelCard';
import { Activity, Star, ChevronDown } from 'lucide-react';

export default function ChannelGrid({ channels, onPlay, validity, activeGroup }) {
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    setLimit(100);
  }, [channels, activeGroup]);

  if (channels.length === 0) {
    return (
      <div className="text-center py-20 text-[#adaaac]">
        Nenhum canal encontrado.
      </div>
    );
  }

  // Busca profunda para o Carro Chefe
  const premiumKeywords = ['premiere', 'hbo', 'telecine', 'sportv', 'espn', 'combate'];
  
  const { featured, standard } = useMemo(() => {
    const feat = [];
    const std = [];
    
    channels.forEach(c => {
      const name = c.name.toLowerCase();
      if (premiumKeywords.some(kw => name.includes(kw))) {
        feat.push(c);
      } else {
        std.push(c);
      }
    });
    
    return { featured: feat, standard: std };
  }, [channels]);

  // Agrupamento (Limitado por paginação para evitar travamentos)
  const slicedStandard = standard.slice(0, limit);
  const groupedStandard = useMemo(() => {
    if (activeGroup !== 'All') return { [activeGroup]: slicedStandard };
    
    return slicedStandard.reduce((acc, channel) => {
      const group = channel.group || 'Outros';
      if (!acc[group]) acc[group] = [];
      acc[group].push(channel);
      return acc;
    }, {});
  }, [slicedStandard, activeGroup]);

  return (
    <div className="space-y-12">
      {featured.length > 0 && activeGroup === 'All' && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-[#b6a0ff]/20 pb-4">
            <Star className="text-[#b6a0ff]" fill="currentColor" size={24} />
            <h2 className="text-2xl font-black text-[#b6a0ff] uppercase tracking-wider">Canais Premium ao Vivo</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-8 pt-4">
            {featured.slice(0, 20).map((channel) => ( // Limite de premium para não travar
              <ChannelCard 
                key={channel.id} 
                channel={channel} 
                onPlay={onPlay} 
                isValid={validity[channel.id]}
              />
            ))}
          </div>
        </section>
      )}

      {Object.entries(groupedStandard).map(([groupName, groupChannels]) => {
        if (groupChannels.length === 0) return null;
        
        return (
          <section key={groupName} className="relative">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white/90">
                {groupName}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-8 pt-4">
              {groupChannels.map((channel) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onPlay={onPlay} 
                  isValid={validity[channel.id]}
                />
              ))}
            </div>
          </section>
        );
      })}

      {standard.length > limit && (
        <div className="flex justify-center mt-12 pb-12">
          <button 
            onClick={() => setLimit(prev => prev + 100)}
            className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-[#b6a0ff] font-bold tracking-widest uppercase text-sm"
          >
            Carregar Mais <ChevronDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
