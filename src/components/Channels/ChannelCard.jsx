import React from 'react';
import { Play } from 'lucide-react';

export default function ChannelCard({ channel, onPlay, isValid }) {
  return (
    <div 
      onClick={() => onPlay(channel)}
      className="group bg-[#1a191b] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.05] hover:-translate-y-2 transition-all duration-300 border border-white/5 hover:border-[#b6a0ff]/40 shadow-lg relative"
    >
      <div className="absolute top-3 right-3 z-10">
        <div className={`w-3 h-3 rounded-full border-2 border-[#1a191b] ${
          isValid === true ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
          isValid === false ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
          'bg-gray-500 opacity-50'
        }`} />
      </div>

      <div className="aspect-video relative bg-black/40 flex items-center justify-center p-6">
        <img 
          src={channel.logo || `https://via.placeholder.com/200?text=${channel.name}`} 
          alt={channel.name} 
          className="max-h-full max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[#b6a0ff] p-3 rounded-full text-black shadow-xl">
            <Play size={24} fill="black"/>
          </div>
        </div>
      </div>
      <div className="p-4 flex items-center gap-3">
        <span className="text-2xl">{channel.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm truncate">{channel.name}</h3>
          <p className="text-[10px] text-[#adaaac] font-black uppercase tracking-widest">{channel.group}</p>
        </div>
      </div>
    </div>
  );
}
