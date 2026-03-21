import React from 'react';
import { 
  Home, Tv, Trophy, Film, Library, Newspaper, 
  Baby, Music, Radio, Church, Sparkles, AlertCircle, 
  Clapperboard, Monitor, Heart, Play, Star
} from 'lucide-react';

const getIconForGroup = (name) => {
  const n = name.toUpperCase();
  if (n === 'ALL' || n === 'INÍCIO' || n === 'TODOS') return Home;
  if (n.includes('ESPORTE') || n.includes('SPORT') || n.includes('PREMIERE') || n.includes('DAZN')) return Trophy;
  if (n.includes('FILME') || n.includes('VOD') || n.includes('CINEMA')) return Film;
  if (n.includes('SERIE') || n.includes('SEASON') || n.includes('NETFLIX')) return Clapperboard;
  if (n.includes('INFANTIL') || n.includes('KIDS') || n.includes('DESENHOS')) return Baby;
  if (n.includes('NOTICIA') || n.includes('NEWS')) return Newspaper;
  if (n.includes('DOCUMENTARIO') || n.includes('CURIOSIDADE')) return Library;
  if (n.includes('MUSICA') || n.includes('MUSIC')) return Music;
  if (n.includes('RADIO')) return Radio;
  if (n.includes('RELIGIAO') || n.includes('GOSPEL') || n.includes('IGREJA')) return Church;
  if (n.includes('4K') || n.includes('FHD') || n.includes('UHD')) return Sparkles;
  if (n.includes('ADULTO') || n.includes('HOT') || n.includes('SEX')) return AlertCircle;
  if (n.includes('ABERTO') || n.includes('GLOBO') || n.includes('CANAL')) return Monitor;
  if (n.includes('FAVORITO')) return Heart;
  if (n.includes('PLAY')) return Play;
  if (n.includes('PREMIUM') || n.includes('VIP')) return Star;
  return Tv;
};

const getDSColorForGroup = (name) => {
  const n = name.toUpperCase();
  if (n.includes('ESPORTE')) return 'bg-[#F59E0B]'; // Amber
  if (n.includes('FILME')) return 'bg-[#F43F5E]';   // Rose
  if (n.includes('SERIE')) return 'bg-[#6366F1]';   // Indigo
  if (n.includes('INFANTIL')) return 'bg-[#0EA5E9]'; // Sky
  if (n.includes('4K')) return 'bg-[#10B981]';      // Emerald
  return 'bg-[#3F3F3F]'; // Default gray for others
};

export default function Sidebar({ groups, activeGroup, setActiveGroup }) {
  // Adiciona a opção "Todos" se não houver
  const allGroups = [
    { id: 'all', name: 'All' },
    ...groups.filter(g => g.name !== 'All')
  ];

  return (
    <aside className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-20 hover:w-64 glass-sidebar py-6 transition-all duration-500 z-40 overflow-hidden flex flex-col group/sidebar cinematic-shadow border-r border-white/5">
      <div className="space-y-3 px-3 flex-1 overflow-y-auto custom-scrollbar">
        {allGroups.map(group => {
          const Icon = getIconForGroup(group.name);
          const iconColor = getDSColorForGroup(group.name);
          const isActive = activeGroup === group.name;
          
          return (
            <button
              key={group.id || group.name}
              onClick={() => setActiveGroup(group.name)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-500 whitespace-nowrap overflow-hidden group/item relative ${
                isActive 
                  ? 'bg-white/10' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6366F1] rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
              )}

              {/* Icon Container */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                isActive 
                  ? `${iconColor} text-white shadow-xl scale-110 rotate-0` 
                  : 'bg-white/5 text-gray-400 group-hover/item:bg-white/10 group-hover/item:text-white group-hover/item:scale-110'
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all duration-500 ${
                isActive 
                  ? 'text-white opacity-100' 
                  : 'opacity-0 scale-95 group-hover/sidebar:opacity-100 group-hover/sidebar:scale-100'
              }`}>
                {group.name === 'All' ? 'Início' : group.name}
              </span>

              {/* Active Dot for Closed View */}
              {isActive && (
                <div className="absolute right-4 w-1 h-1 bg-[#6366F1] rounded-full opacity-100 group-hover/sidebar:opacity-0 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Branding */}
      <div className="mt-auto px-4 py-4 border-t border-white/5 flex items-center gap-4 group-hover/sidebar:justify-start justify-center transition-all">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#10B981] flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-lg">
          NT
        </div>
        <div className="hidden group-hover/sidebar:block overflow-hidden transition-all">
          <p className="text-[9px] font-black text-white tracking-widest uppercase truncate">Premium Plan</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Server Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
