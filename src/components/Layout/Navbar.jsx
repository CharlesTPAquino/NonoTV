import { Search, Tv, Activity } from 'lucide-react';
export default function Navbar({ search, setSearch, sources, onSelectSource }) {
  return (
    <nav className="fixed top-0 w-full h-20 bg-[#0e0e0f]/80 backdrop-blur-md border-b border-white/5 z-50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b6a0ff] rounded-xl flex items-center justify-center text-black">
            <Tv size={24} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">IPTV<span className="text-[#b6a0ff]">MAX</span></span>
        </div>

        {sources && (
          <div className="hidden lg:block relative">
            <select 
              onChange={(e) => onSelectSource(e.target.value)}
              className="bg-[#1a191b] border border-white/10 rounded-lg px-4 py-2 pr-10 text-xs font-bold uppercase tracking-widest text-[#adaaac] focus:outline-none focus:border-[#b6a0ff] appearance-none cursor-pointer hover:bg-[#252426] transition-colors"
            >
              {sources.map(s => (
                <option key={s.url} value={s.url}>{s.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#adaaac]">
              <Search size={14} className="rotate-90" />
            </div>
          </div>
        )}
      </div>
      
      <div className="relative w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#adaaac]" size={20} />
        <input 
          type="text" 
          placeholder="Buscar canais..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1a191b] border border-white/10 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:border-[#b6a0ff] transition-colors text-white placeholder:text-[#adaaac]"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#1a191b] border border-white/10 flex items-center justify-center text-[#b6a0ff]">
          <Activity size={20} />
        </div>
      </div>
    </nav>
  );
}
