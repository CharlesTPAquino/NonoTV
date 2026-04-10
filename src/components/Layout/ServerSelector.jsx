import React, { useState, useEffect } from 'react';
import { ChevronDown, Server, Laptop, Activity, Plus, Check, Satellite, SignalHigh } from 'lucide-react';
import { useSources } from '../../context/SourceContext';

export default function ServerSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { sources, activeSource, selectSource, isLoading } = useSources();

  // Fecha ao selecionar ou clicar fora (aproximação)
  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e) => { if (!e.target.closest('.server-selector-container')) setIsOpen(false); };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isOpen]);

  const handleSelect = (s) => {
    selectSource(s);
    setIsOpen(false);
  };

  return (
    <div className="relative server-selector-container">
      {/* Botão de Trigger Premium */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-5 px-8 py-4 h-14 rounded-3xl transition-all duration-700 font-black text-[10px] uppercase tracking-[0.2em] outline-none border focus:ring-4 focus:ring-white/40 ${activeSource ? 'bg-white/10 border-white/15 text-white/50' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
      >
        <div className="relative">
          <Satellite size={16} className={isLoading ? 'animate-bounce' : 'animate-pulse'} />
          {activeSource && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
        </div>
        <span className="hidden md:block">
           {isLoading ? 'Sintonizando...' : (activeSource?.name || 'Fonte Local')}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-700 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Cinematic Panel */}
      {isOpen && (
        <div className="absolute top-full mt-6 right-0 w-80 bg-[#121418]/95 backdrop-blur-3xl border border-white/5 rounded-[40px] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-[200] animate-in fade-in slide-in-from-top duration-700">
           <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-4 mb-2 flex items-center gap-3">
                 <SignalHigh size={12} className="text-emerald-500" /> Rede de Satélites
              </p>

              {/* Fonte Local */}
              <button 
                onClick={() => handleSelect(null)}
                className={`w-full group p-5 rounded-[28px] border flex items-center gap-5 transition-all duration-500 ${!activeSource ? 'bg-red-600 border-red-500 text-white shadow-[0_15px_30px_rgba(220,38,38,0.25)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
              >
                 <div className="w-10 h-10 bg-black/30 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                    <Laptop size={18} />
                 </div>
                 <div className="flex-1 text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest">Fonte Local</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${!activeSource ? 'text-white/70' : 'text-white/20'}`}>Sistema Principal</p>
                 </div>
                 {!activeSource && <Check size={16} />}
              </button>

              <div className="w-full h-px bg-white/5 my-2" />

              {/* Servidores Externos */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                 {sources.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className={`w-full p-5 rounded-[28px] border flex items-center gap-5 transition-all duration-500 ${activeSource?.id === s.id ? 'bg-red-600 border-red-500 text-white shadow-[0_15px_30px_rgba(220,38,38,0.25)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                    >
                       <div className="w-10 h-10 bg-black/30 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                          <Server size={18} className={activeSource?.id === s.id ? 'text-white' : 'text-white/20'} />
                       </div>
                       <div className="flex-1 text-left">
                          <p className="text-[11px] font-black uppercase tracking-widest truncate">{s.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${activeSource?.id === s.id ? 'text-white/70' : 'text-white/20'}`}>{s.category || 'Premium'}</p>
                       </div>
                       {activeSource?.id === s.id ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-emerald-500/30" />}
                    </button>
                 ))}
              </div>

              {/* Botão Adicionar (Placeholder para Wow) */}
              <button className="w-full mt-4 h-14 border border-white/10 border-dashed rounded-[28px] flex items-center justify-center gap-3 text-white/10 hover:text-white/40 hover:border-white/30 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
                 <Plus size={16} /> Novo Satélite
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
