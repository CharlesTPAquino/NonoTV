import React from 'react';
import { Home, Tv, Newspaper, Map, Globe2, TestTube } from 'lucide-react';

const icons = {
  home: Home,
  tv: Tv,
  newspaper: Newspaper,
  map: Map,
  public: Globe2,
  biotech: TestTube
};

export default function Sidebar({ groups, activeGroup, setActiveGroup }) {
  return (
    <aside className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-20 hover:w-64 bg-[#0e0e0f]/90 backdrop-blur-3xl border-r border-white/5 py-8 transition-all duration-300 z-40 overflow-hidden flex flex-col group/sidebar shadow-2xl">
      <div className="space-y-2 px-3 flex-1 overflow-y-auto custom-scrollbar">
        {groups.map(group => {
          const Icon = icons[group.icon] || Tv;
          const isActive = activeGroup === group.name;
          
          return (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.name)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden ${isActive ? 'bg-[#b6a0ff] text-black font-bold' : 'text-[#adaaac] hover:bg-white/10 hover:text-white'}`}
            >
              <div className="shrink-0">
                <Icon size={24} />
              </div>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-medium">
                {group.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
