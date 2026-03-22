import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useHlsPlayer } from '../../hooks/useHlsPlayer';
import { 
    X, Play, Pause, Maximize, Minimize2, Activity, Sparkles, Zap, Wand2, 
    ExternalLink, Copy, Check, Tv, Settings, Volume2, VolumeX, List, Monitor 
} from 'lucide-react';

// LISTA DE PROXIES: Prioridade para o Proxy Local
const PROXY_LIST = [
    "http://localhost:3131/", // Proxy Local (anti-CORS)
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://proxy.cors.sh/"
];

function QualityMenu({ qualities, current, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!qualities?.length) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-[10px] font-black uppercase text-white tracking-widest leading-none outline-none focus:ring-2 focus:ring-[#F7941D]">
        <Settings size={12} /> {current === -1 ? 'Auto' : qualities[current]?.label}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-zinc-950/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[120px] z-[100000] animate-in slide-in-from-bottom-2 duration-200">
          {[{ id: -1, label: 'Auto' }, ...qualities].map(q => (
            <button key={q.id} onClick={() => { onSelect(q.id); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase transition-colors ${current === q.id ? 'bg-[#F7941D]/20 text-[#F7941D]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
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
        <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-all outline-none focus:ring-2 focus:ring-white/30 rounded-lg" aria-label="Fechar Canais"><X size={20} /></button>
      </div>
      <div className="p-4 border-b border-white/5">
        <input type="text" placeholder="BUSCAR FILME / CANAL..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[10px] uppercase font-bold placeholder-white/20 focus:outline-none focus:border-[#6366F1]/50 transition-all tracking-widest" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filtered.map(ch => (
          <button key={ch.id} onClick={() => onSelect(ch)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-[#F7941D] ${activeChannel?.id === ch.id ? 'bg-[#F7941D]/15 border border-[#F7941D]/30 translate-x-1' : 'hover:bg-white/5 border border-transparent hover:translate-x-1'}`}>
            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 shadow-lg">
                {ch.logo ? <img src={ch.logo} className="w-full h-full object-contain" alt=""/> : <Tv size={18} className="text-white/10"/>}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`text-[11px] font-black uppercase tracking-tighter truncate leading-tight ${activeChannel?.id === ch.id ? 'text-[#F7941D]' : 'text-white/80'}`}>{ch.name}</p>
              <p className="text-[8px] text-white/20 truncate font-bold uppercase tracking-widest">{ch.group}</p>
            </div>
            {activeChannel?.id === ch.id && <div className="w-2 h-2 rounded-full bg-[#F7941D] shadow-[0_0_10px_#F7941D] animate-pulse" />}
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

  const isVOD = useMemo(() => {
    const g = (activeChannel?.group || '').toUpperCase();
    return g.includes('FILME') || g.includes('SERIE') || g.includes('VOD') || g.includes('CINEMA');
  }, [activeChannel]);

  const handleFatalError = useCallback(() => {
    if (proxyIdx < PROXY_LIST.length - 1) {
        setProxyIdx(prev => prev + 1);
    }
  }, [proxyIdx]);

  const {
      videoRef, playerState, loadUrl, togglePlay, toggleMute, setVolume, setQuality, togglePip 
  } = useHlsPlayer(handleFatalError);

  useEffect(() => {
    const rawUrl = activeChannel?.url?.trim();
    if (!rawUrl) return;
    
    // VODs (filmes/séries) já começam tentando via proxy local para evitar bloqueios
    const startIdx = isVOD ? 0 : -1;
    const currentIdx = proxyIdx < 0 && isVOD ? 0 : proxyIdx;
    
    const finalUrl = currentIdx === -1 
      ? rawUrl 
      : PROXY_LIST[currentIdx] + (currentIdx === 0 ? rawUrl : encodeURIComponent(rawUrl));
      
    loadUrl(finalUrl, currentIdx >= 0);
  }, [activeChannel, proxyIdx, isVOD, loadUrl]);

  useEffect(() => { 
    setActiveChannel(channel); 
    setProxyIdx(-1); 
  }, [channel]);

  // Interceptar o botão Voltar do Android para fechar o player, não o app
  useEffect(() => {
    // Adiciona entrada fake no histórico para o gesto de voltar detectar
    window.history.pushState({ playerOpen: true }, '');
    
    const handlePopState = (e) => {
      // Quando o usuário arrasta para voltar/aperta Voltar, fecha o player
      onClose?.();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Limpa a entrada fake do histórico ao fechar
      if (window.history.state?.playerOpen) {
        window.history.back();
      }
    };
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case 'f': (containerRef.current?.requestFullscreen || containerRef.current?.webkitRequestFullscreen)?.call(containerRef.current); break;
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
  const showLoading = (buffering || (proxyIdx >= 0 && !playing));
  const showError = proxyIdx === PROXY_LIST.length - 1 && !playing && !buffering;

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
      <div ref={containerRef} onMouseMove={resetTimer} onTouchStart={resetTimer} className="relative w-full h-full" style={{ cursor: showControls ? 'default' : 'none' }}>
        <video ref={videoRef} onClick={togglePlay} className={`w-full h-full object-contain transition-all duration-700 ${pip ? 'opacity-0' : 'opacity-100'} ${aiEnhancer ? 'contrast-[1.15] saturate-[1.25]' : ''}`} crossOrigin="anonymous" playsInline />

        {/* Tela PiP */}
        {pip && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-[#F7941D]/10 rounded-full flex items-center justify-center mx-auto border border-[#F7941D]/30 animate-pulse text-[#F7941D]">
                      <Minimize2 size={40} />
                    </div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Reproduzindo em Modo Miniatura</p>
                </div>
            </div>
        )}

        {/* Tela de Sincronizando / Loading — COM BOTÃO FECHAR */}
        {showLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-40 backdrop-blur-sm animate-in fade-in">
                {/* Botão fechar no canto superior direito */}
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-4 rounded-full bg-white/10 border border-white/20 text-white hover:bg-red-500/30 hover:border-red-500 transition-all outline-none focus:ring-4 focus:ring-red-500 active:scale-90"
                  aria-label="Fechar player"
                >
                  <X size={28} />
                </button>
                
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-[3px] border-t-[#F7941D] border-white/5 rounded-full animate-spin" />
                        <Zap className="absolute inset-0 m-auto text-[#F7941D] animate-bounce w-8 h-8 drop-shadow-[0_0_10px_#F7941D]" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[#F7941D] font-black text-xs uppercase tracking-[0.4em] animate-pulse">
                            {proxyIdx === 0 ? 'Engine Local Ativa (L3131)' : proxyIdx > 0 ? `AI: Tunelando Rota ${proxyIdx}` : isVOD ? 'Carregando VOD...' : 'Sincronizando Mídia...'}
                        </p>
                        <p className="text-white/20 text-[8px] uppercase font-bold tracking-[0.2em]">
                          {isVOD ? 'Iniciando via Proxy Anti-Bloqueio' : 'NonoTV Signal System'}
                        </p>
                    </div>
                    {/* Botão cancelar abaixo também */}
                    <button 
                      onClick={onClose}
                      className="mt-4 px-8 py-3 rounded-full border border-white/20 text-white/50 text-[10px] uppercase font-black tracking-widest hover:bg-white/10 hover:text-white transition-all outline-none focus:ring-2 focus:ring-white/30"
                    >
                      Cancelar
                    </button>
                </div>
            </div>
        )}

        {/* Tela de Erro Final */}
        {showError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/98 z-[100] p-10 animate-in zoom-in duration-500">
                {/* Botão fechar no topo */}
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-4 rounded-full bg-white/10 border border-white/20 text-white hover:bg-red-500/30 hover:border-red-500 transition-all outline-none focus:ring-4 focus:ring-red-500"
                  aria-label="Fechar"
                  title="Fechar"
                >
                  <X size={28} />
                </button>
                
                <div className="max-w-xl space-y-12 text-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mx-auto">
                      <Activity size={48} className="text-red-500 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-4xl font-black text-white uppercase tracking-tighter">Sinal Bloqueado</h4>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                          O servidor bloqueou todos os túneis. Use um player externo.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <button onClick={() => window.location.href=`intent://${activeChannel.url.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=org.videolan.vlc;end`} className="flex items-center justify-center gap-4 px-10 py-6 bg-white text-black rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl outline-none focus:ring-4 focus:ring-white">
                            <ExternalLink size={20} /> Abrir no VLC
                        </button>
                        <button onClick={copyLink} className="flex items-center justify-center gap-4 px-10 py-6 bg-white/5 border border-white/10 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all outline-none focus:ring-4 focus:ring-white/30">
                            {copied ? <Check size={20} className="text-[#10B981]" /> : <Copy size={20} />} {copied ? 'Link no Clip!' : 'Copiar Link'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Painel de Canais Lateral */}
        {showSwitcher && (
          <ChannelSwitcher channels={channels} activeChannel={activeChannel} onSelect={(ch) => { setActiveChannel(ch); setProxyIdx(-1); setShowSwitcher(false); }} onClose={() => setShowSwitcher(false)} />
        )}

        {/* Controles do Player */}
        <div className={`absolute inset-0 flex flex-col justify-between transition-all duration-500 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Header — Título + Botões de Fechar/Canais */}
            <div className="p-8 bg-gradient-to-b from-black/95 via-black/40 to-transparent flex items-start justify-between">
                <div className="flex gap-6 max-w-3xl">
                    <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl shrink-0 overflow-hidden">
                        {activeChannel.logo ? <img src={activeChannel.logo} className="w-full h-full object-contain p-2" alt=""/> : <Tv className="text-white/10" size={28}/>}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter truncate leading-none max-w-lg">{activeChannel.name}</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> {isVOD ? 'VOD CINEMA' : 'LIVE'}
                            </span>
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">{activeChannel.group}</span>
                            {proxyIdx >= 0 && <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/10 border border-[#10B981]/40 rounded-full text-[9px] font-black text-[#10B981] uppercase tracking-widest leading-none"><Monitor size={10}/> Proxy Ativo</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setShowSwitcher(!showSwitcher)} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-[#F7941D] hover:border-[#F7941D] transition-all hover:scale-110 active:scale-90 outline-none focus:ring-4 focus:ring-[#F7941D]" title="Lista de Canais"><List size={24} /></button>
                   <button onClick={onClose} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all hover:scale-110 active:scale-90 outline-none focus:ring-4 focus:ring-red-500" aria-label="Fechar" title="Fechar"><X size={24} /></button>
                </div>
            </div>

            {/* Footer — Controles de Play/Volume/Qualidade */}
            <div className="p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-8 flex-wrap">
                <button onClick={togglePlay} className="text-white hover:text-[#F7941D] transition-all transform hover:scale-110 active:scale-90 p-2 outline-none focus:ring-4 focus:ring-[#F7941D] rounded-full">
                    {playing ? <Pause size={52} fill="currentColor"/> : <Play size={52} fill="currentColor"/>}
                </button>
                
                <div className="flex items-center gap-6">
                   {/* Volume */}
                   <div className="flex items-center gap-4">
                       <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-1">{muted ? <VolumeX size={28} /> : <Volume2 size={28} />}</button>
                       <input 
                         type="range" min={0} max={1} step={0.1} 
                         value={muted ? 0 : playerState.volume} 
                         onChange={(e) => setVolume(parseFloat(e.target.value))} 
                         className="w-24 accent-[#F7941D] h-1" 
                       />
                   </div>
                   
                   <QualityMenu qualities={qualities} current={quality} onSelect={setQuality} />
                   
                   {/* AI Enhancer */}
                   <button onClick={() => setAiEnhancer(!aiEnhancer)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 outline-none focus:ring-2 focus:ring-amber-500 ${aiEnhancer ? 'bg-amber-500 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                        <Wand2 size={15} /> <span className="text-[10px] font-black uppercase tracking-widest">AI Sharp</span>
                   </button>
                </div>

                <div className="flex-1" />

                {/* Botão PiP (Minimize) */}
                <button 
                  onClick={togglePip} 
                  className={`p-4 rounded-2xl transition-all outline-none focus:ring-4 focus:ring-[#F7941D] ${pip ? 'bg-[#F7941D] text-white shadow-[0_0_20px_rgba(247,148,29,0.5)]' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`} 
                  title="Picture in Picture (P)"
                >
                  <Minimize2 size={24}/>
                </button>
                
                {/* Botão Tela Cheia */}
                <button 
                  onClick={() => { (containerRef.current?.requestFullscreen || containerRef.current?.webkitRequestFullscreen)?.call(containerRef.current); }} 
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all hover:-rotate-12 active:scale-90 outline-none focus:ring-4 focus:ring-white/30" 
                  title="Tela Cheia (F)"
                >
                  <Maximize size={24}/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
