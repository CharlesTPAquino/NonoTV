import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useHlsPlayer } from '../../hooks/useHlsPlayer';
import { 
    X, Play, Pause, Maximize, Activity, Sparkles, Zap, Wand2, 
    ExternalLink, Info, Copy, Check, Tv, Settings, Volume2, VolumeX, List, Monitor 
} from 'lucide-react';

// LISTA DE PROXIES: Prioridade para o seu novo Proxy Local
const PROXY_LIST = [
    "http://localhost:3131/", // Seu Proxy Local (Definitivo)
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://proxy.cors.sh/"
];

function QualityMenu({ qualities, current, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!qualities?.length) return null;
  return (
    <div className="relative group">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-[10px] font-black uppercase text-white tracking-widest leading-none">
        <Settings size={12} /> {current === -1 ? 'Auto' : qualities[current]?.label}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-zinc-950/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[120px] z-50 animate-in slide-in-from-bottom-2 duration-200">
          {[{ id: -1, label: 'Auto' }, ...qualities].map(q => (
            <button key={q.id} onClick={() => { onSelect(q.id); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase transition-colors ${current === q.id ? 'bg-[#6366F1]/20 text-[#6366F1]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelSwitcher({ channels, activeChannel, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50);
  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-zinc-950/98 backdrop-blur-3xl border-l border-white/10 flex flex-col z-[100] animate-in slide-in-from-right duration-300 shadow-[-50px_0_100px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <span className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3"><Tv size={16} /> Canais</span>
        <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-all"><X size={20} /></button>
      </div>
      <div className="p-4 border-b border-white/5">
        <input type="text" placeholder="BUSCAR FILME / CANAL..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[10px] uppercase font-bold placeholder-white/20 focus:outline-none focus:border-[#6366F1]/50 transition-all font-black tracking-widest" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filtered.map(ch => (
          <button key={ch.id} onClick={() => onSelect(ch)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeChannel?.id === ch.id ? 'bg-[#6366F1]/15 border border-[#6366F1]/30 translate-x-1 outline-none' : 'hover:bg-white/5 border border-transparent hover:translate-x-1'}`}>
            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 shadow-lg group">
                {ch.logo ? <img src={ch.logo} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt=""/> : <Tv size={18} className="text-white/10"/>}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`text-[11px] font-black uppercase tracking-tighter truncate leading-tight ${activeChannel?.id === ch.id ? 'text-[#6366F1]' : 'text-white/80'}`}>{ch.name}</p>
              <p className="text-[8px] text-white/20 truncate font-bold uppercase tracking-widest">{ch.group}</p>
            </div>
            {activeChannel?.id === ch.id && <div className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_10px_#6366F1] animate-pulse" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VideoPlayer({ channel, channels = [], onClose, onNext, onPrev }) {
  const containerRef = useRef(null);
  const [activeChannel, setActiveChannel] = useState(channel);
  const [proxyIdx, setProxyIdx] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [aiEnhancer, setAiEnhancer] = useState(true);
  const [copied, setCopied] = useState(false);
  const hideTimerRef = useRef(null);

  const handleFatalError = useCallback((type) => {
    if (proxyIdx < PROXY_LIST.length - 1) {
        setProxyIdx(prev => prev + 1);
    }
  }, [proxyIdx]);

  const {
      videoRef, playerState, loadUrl, togglePlay, toggleMute, setVolume, setQuality, togglePip 
  } = useHlsPlayer(handleFatalError);

  const isVOD = useMemo(() => {
    const g = (activeChannel?.group || '').toUpperCase();
    return g.includes('FILME') || g.includes('SERIE') || g.includes('VOD');
  }, [activeChannel]);

  useEffect(() => {
    const rawUrl = activeChannel?.url?.trim();
    if (!rawUrl) return;
    const finalUrl = proxyIdx === -1 ? rawUrl : PROXY_LIST[proxyIdx] + (proxyIdx === 0 ? rawUrl : encodeURIComponent(rawUrl));
    loadUrl(finalUrl, proxyIdx >= 0);
  }, [activeChannel, proxyIdx, loadUrl]);

  useEffect(() => { setActiveChannel(channel); setProxyIdx(-1); }, [channel]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case 'f': (containerRef.current.requestFullscreen || containerRef.current.webkitRequestFullscreen)?.call(containerRef.current); break;
        case 'k': case ' ': e.preventDefault(); togglePlay(); break;
        case 'm': toggleMute(); break;
        case 'p': togglePip(); break;
        case 'c': setShowSwitcher(s => !s); break;
        case 'arrowright': onNext?.(); break;
        case 'arrowleft': onPrev?.(); break;
        case 'escape': onClose?.(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, toggleMute, togglePip, onNext, onPrev, onClose]);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => { if (playerState.playing) setShowControls(false); }, 3500);
  }, [playerState.playing]);

  const copyLink = () => {
    navigator.clipboard.writeText(activeChannel.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { playing, muted, buffering, qualities, quality, pip } = playerState;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
      <div ref={containerRef} onMouseMove={resetTimer} className="relative w-full h-full group" style={{ cursor: showControls ? 'default' : 'none' }}>
        <video ref={videoRef} onClick={togglePlay} className={`w-full h-full object-contain transition-all duration-700 ${pip ? 'opacity-0' : 'opacity-100'} ${aiEnhancer ? 'contrast-115 saturate-125' : ''}`} crossOrigin="anonymous" />

        {pip && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-[#6366F1]/10 rounded-full flex items-center justify-center mx-auto border border-[#6366F1]/30 animate-pulse text-[#6366F1] shadow-[0_0_50px_rgba(99,102,241,0.2)]"><Maximize size={40} /></div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Reproduzindo em Modo Miniatura</p>
                </div>
            </div>
        )}

        {(buffering || proxyIdx >= 0) && !playing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-40 backdrop-blur-sm transition-all animate-in fade-in">
                <div className="text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-[3px] border-t-[#6366F1] border-white/5 rounded-full animate-spin" />
                        <Zap className="absolute inset-0 m-auto text-[#6366F1] animate-bounce w-8 h-8 drop-shadow-[0_0_10px_#6366F1]" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[#6366F1] font-black text-xs uppercase tracking-[0.4em] animate-pulse">
                            {proxyIdx === 0 ? 'Engine Local Ativa (L3131)' : proxyIdx > 0 ? `AI: Tunelando Rota ${proxyIdx}` : 'Sincronizando Mídia...'}
                        </p>
                        <p className="text-white/20 text-[8px] uppercase font-bold tracking-[0.2em]">{proxyIdx === 0 ? 'Bypassing CORS via Local Node Server' : 'NonoTV Multi-AI Signal System'}</p>
                    </div>
                </div>
            </div>
        )}

        {proxyIdx === PROXY_LIST.length - 1 && !playing && !buffering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/98 z-[100] p-10 animate-in zoom-in duration-500">
                <div className="max-w-xl space-y-12 text-center relative">
                    <div className="absolute -inset-10 bg-[#6366F1]/5 blur-[80px] rounded-full" />
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mx-auto relative"><Activity size={48} className="text-red-500 animate-pulse" /></div>
                    <div className="space-y-4 relative">
                        <h4 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Bloqueio Crítico</h4>
                        <p className="text-gray-400 text-sm font-bold opacity-70 uppercase tracking-widest text-[11px]">O servidor bloqueou todos os túneis de acesso. Use um player externo.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center relative">
                        <button onClick={() => window.location.href=`intent://${activeChannel.url.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=org.videolan.vlc;end`} className="flex items-center justify-center gap-4 px-10 py-6 bg-white text-black rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)]">
                            <ExternalLink size={20} /> Abrir no VLC (Mi Stick)
                        </button>
                        <button onClick={copyLink} className="flex items-center justify-center gap-4 px-10 py-6 bg-white/5 border border-white/10 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                            {copied ? <Check size={20} className="text-[#10B981]" /> : <Copy size={20} />} {copied ? 'Link no Clip!' : 'Copiar para VLC'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showSwitcher && (
          <ChannelSwitcher channels={channels} activeChannel={activeChannel} onSelect={(ch) => { setActiveChannel(ch); setProxyIdx(-1); }} onClose={() => setShowSwitcher(false)} />
        )}

        <div className={`absolute inset-0 flex flex-col justify-between transition-all duration-500 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="p-10 bg-gradient-to-b from-black/95 via-black/40 to-transparent flex items-start justify-between">
                <div className="flex gap-8 max-w-3xl">
                    <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-[30px] flex items-center justify-center shadow-2xl shrink-0 overflow-hidden relative group/logo">
                        <div className="absolute inset-0 bg-[#6366F1]/10 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                        {activeChannel.logo ? <img src={activeChannel.logo} className="w-full h-full object-contain p-2" alt=""/> : <Tv className="text-white/10" size={32}/>}
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-5xl font-black text-white uppercase tracking-tighter truncate leading-none max-w-xl">{activeChannel.name}</h3>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2.5 px-4 py-1.5 bg-red-500/20 border border-red-500/40 rounded-full text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]" /> {isVOD ? 'VOD CINEMA 4K' : 'LIVE TRANSMISSION'}
                            </span>
                            <span className="text-white/20 text-[11px] font-black uppercase tracking-[0.3em] font-mono">{activeChannel.group}</span>
                            {proxyIdx === 0 && <span className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 border border-[#10B981]/40 rounded-full text-[9px] font-black text-[#10B981] uppercase tracking-widest leading-none"><Monitor size={12}/> Local Proxy On</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-5">
                   <button onClick={() => setShowSwitcher(!showSwitcher)} className="p-6 bg-white/5 border border-white/10 rounded-[32px] text-white/40 hover:text-white hover:bg-[#6366F1] hover:border-[#6366F1] transition-all shadow-2xl hover:scale-110 active:scale-90"><List size={32} /></button>
                   <button onClick={onClose} className="p-6 bg-white/5 border border-white/10 rounded-[32px] text-white/40 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all hover:scale-110 active:scale-90"><X size={32} /></button>
                </div>
            </div>

            <div className="p-12 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-10">
                <button onClick={togglePlay} className="text-white hover:text-[#6366F1] transition-all transform hover:scale-110 active:scale-90 p-2">
                    {playing ? <Pause size={64} fill="currentColor"/> : <Play size={64} fill="currentColor"/>}
                </button>
                
                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-5 group/vol">
                       <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">{muted ? <VolumeX size={32} /> : <Volume2 size={32} />}</button>
                       <div className="w-0 group-hover/vol:w-32 overflow-hidden transition-all duration-500 ease-out">
                            <input type="range" min={0} max={1} step={0.1} value={muted ? 0 : playerState.volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-32 accent-[#6366F1] h-1" />
                       </div>
                   </div>
                   
                   <QualityMenu qualities={qualities} current={quality} onSelect={setQuality} />
                   
                   <button onClick={() => setAiEnhancer(!aiEnhancer)} className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-300 ${aiEnhancer ? 'bg-amber-500 border-amber-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 text-white/20'}`}>
                        <Wand2 size={18} className="animate-pulse" /> <span className="text-[11px] font-black uppercase tracking-widest">{aiEnhancer ? 'AI SHARP ENGINE' : 'SHARP OFF'}</span>
                   </button>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-6">
                    <button onClick={togglePip} className={`p-5 rounded-3xl transition-all ${pip ? 'bg-[#6366F1] text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-white/40 hover:text-white'}`} title="Modo PiP (P)"><Maximize size={28} className="scale-x-[-1]"/></button>
                    <button onClick={() => { (containerRef.current.requestFullscreen || containerRef.current.webkitRequestFullscreen)?.call(containerRef.current); }} className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl text-white/40 hover:text-white transition-all transform hover:-rotate-12 active:scale-90" title="Tela Cheia (F)"><Maximize size={36}/></button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
