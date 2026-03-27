import React from 'react';
import { Search, Activity, LogOut, LayoutGrid, Globe, Server } from 'lucide-react';
import ServerSelector from './ServerSelector';

export default function Navbar({ search, setSearch, syncStatus }) {
  const handleExit = () => {
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else {
      window.close();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 h-24 bg-[#0A0B0F]/90 backdrop-blur-3xl border-b border-white/5 z-50 px-6 md:px-12 flex items-center justify-between cinematic-shadow">
      
      {/* Search Bar Premium */}
      <div className="relative flex-1 max-w-xl group">
        <div className="absolute inset-0 bg-[#F7941D]/5 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
        <div className="relative z-10 flex items-center bg-white/[0.03] border border-white/5 rounded-3xl focus-within:border-[#F7941D]/30 focus-within:bg-white/5 transition-all duration-500 overflow-hidden shadow-inner">
           <Search className="ml-6 text-white/20 transition-colors group-focus-within:text-[#F7941D]" size={20} />
           <input 
             type="text" 
             placeholder="BUSCAR CANAIS OU FILMES..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full h-14 pl-4 pr-8 bg-transparent outline-none text-sm font-black uppercase tracking-widest placeholder:text-white/5 focus:ring-0"
           />
        </div>
      </div>
      
      {/* Action Deck */}
      <div className="flex items-center gap-6 ml-8">
        <ServerSelector />

        <div className="w-px h-8 bg-white/10 hidden md:block mx-2" />

        <button
          onClick={handleExit}
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-500 group shadow-lg"
          title="Sair"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </nav>
  );
}
