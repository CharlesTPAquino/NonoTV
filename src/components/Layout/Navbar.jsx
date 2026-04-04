import React from 'react';
import { Search, Settings, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function Navbar({ search, setSearch, syncStatus, onOpenSettings, serverStatus }) {
  const isOnline = serverStatus === 'online' || serverStatus === 'connected';
  const isOffline = serverStatus === 'offline' || serverStatus === 'error';

  return (
    <nav className="relative shrink-0 h-16 md:h-20 flex items-center px-4 md:px-8 z-[90]">
      {/* Background */}
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

      <div className="w-full flex items-center justify-between relative z-10">
        {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative flex items-center w-full bg-white/5 border border-white/5 rounded-xl backdrop-blur-xl focus-within:border-[#F7941D]/50 transition-all">
            <Search className="ml-3 text-white/20 focus-within:text-[#F7941D] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch && setSearch(e.target.value)}
              className="w-full h-10 pl-2 pr-3 bg-transparent outline-none text-xs font-bold text-white placeholder:text-white/10 uppercase tracking-widest"
            />
          </div>
        </div>

        {/* Right - Server Status + Settings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl backdrop-blur-xl">
            {isOnline && <CheckCircle size={12} className="text-green-500" />}
            {isOffline && <XCircle size={12} className="text-red-500" />}
            {!isOnline && !isOffline && <Zap size={12} className="text-[#F7941D] animate-pulse" />}
            <span className={`text-[8px] font-black uppercase tracking-widest hidden sm:inline ${isOnline ? 'text-green-500' : isOffline ? 'text-red-500' : 'text-white/40'}`}>
              {isOnline ? 'ON' : isOffline ? 'OFF' : '...'}
            </span>
          </div>

          <button 
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
