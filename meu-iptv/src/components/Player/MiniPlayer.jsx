import React from 'react';
import { Maximize2, X, Play } from 'lucide-react';

export default function MiniPlayer({ channel, onOpen, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 w-80 bg-[#1a191b] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
      <div className="aspect-video relative bg-black flex items-center justify-center cursor-pointer group" onClick={onOpen}>
        <img 
          src={channel.logo || `https://via.placeholder.com/200?text=${channel.name}`} 
          alt={channel.name} 
          className="max-h-full max-w-full object-contain opacity-50 group-hover:opacity-70 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Play size={32} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all" fill="currentColor"/>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between bg-[#1a191b]">
        <div className="flex items-center gap-3 truncate">
          <span className="text-xl shrink-0">{channel.emoji}</span>
          <div className="truncate min-w-0">
            <h4 className="font-bold text-sm truncate">{channel.name}</h4>
            <p className="text-[10px] text-[#b6a0ff] uppercase tracking-wider">{channel.group}</p>
          </div>
        </div>
        <div className="flex gap-2 text-[#adaaac] shrink-0">
          <button onClick={onOpen} className="hover:text-white transition-colors p-1"><Maximize2 size={18}/></button>
          <button onClick={onClose} className="hover:text-white transition-colors p-1"><X size={18}/></button>
        </div>
      </div>
    </div>
  );
}
