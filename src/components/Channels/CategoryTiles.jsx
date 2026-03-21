import React from 'react';
import { Tv, Radio, Film, Star, Globe, Zap, Heart, Trophy } from 'lucide-react';

const TILE_PALETTES = [
  'from-[#F7941D]/30 to-[#F7941D]/10 border-[#F7941D]/40 hover:border-[#F7941D]/80',
  'from-[#1B2838]/30 to-[#1B2838]/10 border-[#1B2838]/40 hover:border-[#1B2838]/80',
  'from-[#FFC425]/30 to-[#FFC425]/10 border-[#FFC425]/40 hover:border-[#FFC425]/80',
  'from-[#4FC3F7]/30 to-[#4FC3F7]/10 border-[#4FC3F7]/40 hover:border-[#4FC3F7]/80',
  'from-[#8CC63F]/30 to-[#8CC63F]/10 border-[#8CC63F]/40 hover:border-[#8CC63F]/80',
  'from-[#E85D75]/30 to-[#E85D75]/10 border-[#E85D75]/40 hover:border-[#E85D75]/80',
];

const TILE_ICONS = [Film, Tv, Radio, Star, Globe, Zap, Heart, Trophy];

function getGroupIcon(groupName, index) {
  const name = (groupName || '').toLowerCase();
  if (name.includes('esport') || name.includes('sport') || name.includes('futebol')) return Trophy;
  if (name.includes('film') || name.includes('cine') || name.includes('movie')) return Film;
  if (name.includes('not') || name.includes('news') || name.includes('cnn')) return Radio;
  if (name.includes('premium') || name.includes('hbo') || name.includes('star')) return Star;
  if (name.includes('inter') || name.includes('world') || name.includes('global')) return Globe;
  if (name.includes('music') || name.includes('adul')) return Heart;
  if (name.includes('ao vivo') || name.includes('live') || name.includes('canais')) return Tv;
  return TILE_ICONS[index % TILE_ICONS.length];
}

export default function CategoryTiles({ groups, channelCounts, setActiveGroup }) {
  // Filtra o grupo 'All' e pega os demais
  const displayGroups = groups.filter(g => g.name !== 'All').slice(0, 12);

  return (
    <div className="mb-14">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-7 bg-[#F7941D] rounded-full shadow-[0_0_15px_rgba(247,148,29,0.5)]" />
        <h2 className="text-xl font-black text-[#1B2838] uppercase tracking-[0.2em]">Categorias</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayGroups.map((group, index) => {
          const palette = TILE_PALETTES[index % TILE_PALETTES.length];
          const Icon = getGroupIcon(group.name, index);
          const count = channelCounts[group.name] || 0;

          return (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.name)}
              className={`group relative flex flex-col items-start justify-between p-5 rounded-2xl bg-gradient-to-br ${palette} border backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl min-h-[110px] text-left`}
            >
              <Icon 
                size={28} 
                className="text-[#1B2838]/60 group-hover:text-[#1B2838] transition-colors duration-300 mb-3"
              />
              <div>
                <p className="font-black text-[#1B2838] text-sm leading-tight truncate w-full">{group.name}</p>
                {count > 0 && (
                  <p className="text-[#1B2838]/50 text-[10px] mt-0.5 font-medium">{count} canais</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
