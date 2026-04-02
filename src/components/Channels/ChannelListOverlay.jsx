import React, { useState, useMemo } from 'react';
import { X, ChevronRight, Tv, Radio, Search } from 'lucide-react';

export default function ChannelListOverlay({ isOpen, onClose, channels, groups, activeGroup, setActiveGroup, onPlayChannel, currentChannel }) {
  const [search, setSearch] = useState('');

  const filteredChannels = useMemo(() => {
    if (!channels || channels.length === 0) return [];
    let filtered = channels;
    
    if (search) {
      filtered = filtered.filter(c => 
        c && c.name && c.name.toLowerCase().includes(search.toLowerCase()) ||
        c && c.group && c.group.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (activeGroup && activeGroup !== 'All') {
      filtered = filtered.filter(c => c && c.group === activeGroup);
    }
    
    return filtered;
  }, [channels, search, activeGroup]);

  if (!isOpen) return null;

  return (
    <div className="channel-list-overlay animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Tv size={24} className="text-[#F7941D]" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Canais Ao Vivo</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar canal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-full text-white text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="px-6 py-3 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveGroup('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeGroup === 'All' ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Todos
          </button>
          {groups.slice(0, 10).map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeGroup === g.name ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChannels.map((channel, idx) => {
          const isActive = currentChannel?.id === channel.id;
          
          return (
            <button
              key={channel.id || idx}
              onClick={() => { onPlayChannel(channel); onClose(); }}
              className={`channel-list-item w-full text-left ${isActive ? 'bg-white/10' : ''}`}
            >
              {/* Channel Number */}
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40">
                {idx + 1}
              </div>

              {/* Channel Logo/Icon */}
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Radio size={18} className="text-white/40" />
                )}
              </div>

              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${isActive ? 'text-[#F7941D]' : 'text-white'}`}>
                  {channel.name}
                </p>
                <p className="text-xs text-white/40 truncate">{channel.group}</p>
              </div>

              {/* Live Indicator */}
              {channel.type === 'live' && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}

              <ChevronRight size={16} className="text-white/20" />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <p className="text-center text-xs text-white/30 font-medium">
          {filteredChannels.length} canais disponíveis
        </p>
      </div>
    </div>
  );
}
