import { Search, Activity } from 'lucide-react';

export default function Navbar({ search, setSearch, sources, onSelectSource }) {
  const handleExit = () => {
    // Capacitor/Cordova runtime (Mi Stick / APK)
    if (navigator.app?.exitApp) { navigator.app.exitApp(); return; }
    // Fallback navegador
    window.close();
  };

  return (
    <nav className="fixed top-0 w-full h-20 glass-header text-white z-50 px-4 md:px-8 flex items-center justify-between cinematic-shadow">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative group/logo">
            <img 
              src="/logo.png" 
              alt="NONOTV" 
              className="h-10 md:h-14 w-auto object-contain cinematic-shadow block [.logo-failed_&]:hidden" 
              onError={(e) => { e.target.parentElement.classList.add('logo-failed'); }} 
            />
            <div className="hidden [.logo-failed_&]:block font-black text-2xl md:text-4xl tracking-tighter text-white drop-shadow-2xl">
              NONO<span className="text-[#F7941D]">TV</span>
            </div>
          </div>
        </div>

        {sources && (
          <div className="hidden lg:block relative ml-4">
            <select 
              onChange={(e) => onSelectSource(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full px-6 py-2 pr-12 text-[9px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:ring-2 focus:ring-[#F7941D] appearance-none cursor-pointer hover:bg-white/10 transition-all shadow-lg"
            >
              {sources.map(s => (
                <option key={s.url} value={s.url} className="bg-[#050505]">{s.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7941D]">
              <Search size={10} className="rotate-90" />
            </div>
          </div>
        )}
      </div>
      
      <div className="relative flex-1 max-w-lg mx-4 md:mx-12">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-[#F7941D]" size={16} />
        <input 
          type="text" 
          placeholder="O que vamos assistir?" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-14 pr-6 outline-none focus:ring-2 focus:ring-[#F7941D]/40 transition-all text-xs md:text-sm font-bold placeholder:text-white/20 focus:bg-white/10 shadow-inner"
        />
      </div>
      
      <div className="flex items-center gap-3">
        {/* Signal Indicator - Hidden on very small screens */}
        <div className="group relative hidden sm:block">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F7941D] cinematic-shadow hover:bg-[#F7941D] hover:text-white transition-all cursor-pointer glow-orange">
            <Activity size={18} />
          </div>
        </div>

        {/* Exit Button */}
        <button
          id="btn-exit-app"
          onClick={handleExit}
          className="group relative w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-red-500"
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
