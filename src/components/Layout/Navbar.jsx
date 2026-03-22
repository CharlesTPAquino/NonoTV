import { Search, Activity, Server } from 'lucide-react';

export default function Navbar({ search, setSearch, sources, onSourceSelect, syncStatus }) {
  const handleExit = () => {
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else {
      window.close();
    }
  };

  return (
    <nav className="fixed top-0 w-full h-20 glass-header text-white z-50 px-4 md:px-8 flex items-center justify-between cinematic-shadow">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <img 
            src="/logo.png" 
            alt="NONOTV" 
            className="h-10 md:h-12 w-auto object-contain cinematic-shadow" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="font-black text-2xl md:text-3xl tracking-tighter text-white">
            NONO<span className="text-[#F7941D]">TV</span>
          </div>
        </div>

        {sources && (
          <div className="relative ml-4 flex items-center gap-3">
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="relative group/select">
              <select 
                onChange={(e) => {
                  const source = sources.find(s => s.url === e.target.value);
                  if (source) onSourceSelect(source);
                }}
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 pr-10 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-[#F7941D] appearance-none cursor-pointer hover:bg-white/10 transition-all shadow-xl min-w-[140px]"
              >
                <option value="" className="bg-[#050505]">Fonte Local</option>
                {sources.map(s => (
                  <option key={s.url || s.name} value={s.url} className="bg-[#050505]">{s.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7941D]/60 group-hover/select:text-[#F7941D] transition-colors">
                <Server size={12} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative flex-1 max-w-lg mx-4 md:mx-12 group">
        <div className="absolute inset-0 bg-[#F7941D]/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-[#F7941D]" size={16} />
        <input 
          type="text" 
          placeholder="Busque canais, filmes ou séries..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-14 pr-6 outline-none focus:ring-2 focus:ring-[#F7941D]/40 transition-all text-xs md:text-sm font-bold placeholder:text-white/10 focus:bg-white/10 shadow-inner relative z-10"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="group relative hidden sm:block">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg border ${syncStatus ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500 animate-pulse' : 'bg-white/5 border-white/10 text-white/40 hover:text-[#F7941D]'}`}>
            <Activity size={18} />
          </div>
        </div>

        <button
          onClick={handleExit}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-red-500"
          title="Sair"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
