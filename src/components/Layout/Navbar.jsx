import { Search, Activity } from 'lucide-react';

export default function Navbar({ search, setSearch, sources, onSelectSource }) {
  const handleExit = () => {
    // Capacitor/Cordova runtime (Mi Stick / APK)
    if (navigator.app?.exitApp) { navigator.app.exitApp(); return; }
    // Fallback navegador
    window.close();
  };

  return (
    <nav className="fixed top-0 w-full h-20 glass-header text-white z-50 px-8 flex items-center justify-between cinematic-shadow">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative group/logo">
            <img 
              src="/logo.png" 
              alt="NONOTV" 
              className="h-16 w-auto object-contain cinematic-shadow block [.logo-failed_&]:hidden" 
              onError={(e) => { e.target.parentElement.classList.add('logo-failed'); }} 
            />
            <div className="hidden [.logo-failed_&]:block font-black text-4xl tracking-tighter text-white drop-shadow-2xl">
              NONO<span className="text-[#F7941D]">TV</span>
            </div>
          </div>
        </div>

        {sources && (
          <div className="hidden lg:block relative">
            <select 
              onChange={(e) => onSelectSource(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full px-6 py-2 pr-12 text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-[#F7941D] appearance-none cursor-pointer hover:bg-white/20 transition-all shadow-lg"
            >
              {sources.map(s => (
                <option key={s.url} value={s.url} className="bg-[#050505]">{s.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7941D]">
              <Search size={12} className="rotate-90" />
            </div>
          </div>
        )}
      </div>
      
      <div className="relative w-full max-w-lg mx-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="O que você quer assistir hoje?" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-16 pr-8 focus:outline-none focus:border-[#F7941D]/60 transition-all text-sm font-bold placeholder:text-gray-400 focus:bg-white/[0.15] focus:shadow-[0_0_40px_rgba(229,9,20,0.15)] shadow-inner"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Indicador de sinal */}
        <div className="group relative">
          <div className="w-11 h-11 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/20 flex items-center justify-center text-[#F7941D] cinematic-shadow hover:bg-[#F7941D] hover:text-white transition-all cursor-pointer glow-orange">
            <Activity size={20} />
          </div>
          <div className="absolute top-14 right-0 bg-[#0E1217] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl">
            Sinal Estável
          </div>
        </div>

        {/* Botão de Sair — para controle remoto do Mi Stick / TV */}
        <button
          id="btn-exit-app"
          onClick={handleExit}
          title="Sair do App"
          className="group relative w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all cursor-pointer"
        >
          {/* Ícone de Sair (door exit) */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="absolute top-14 right-0 bg-[#0E1217] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl text-white">
            Sair do App
          </span>
        </button>
      </div>
    </nav>
  );
}
