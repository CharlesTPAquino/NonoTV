import React, { useState } from 'react';
import { Search, Settings, CheckCircle, XCircle, Zap, Mic, Loader2 } from 'lucide-react';
import { aiService } from '../../services/AIService';

export default function Navbar({ search, setSearch, syncStatus, onOpenSettings, serverStatus, setActiveCategory }) {
  const isOnline = serverStatus === 'online' || serverStatus === 'connected';
  const isOffline = serverStatus === 'offline' || serverStatus === 'error';
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasVoiceSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const handleVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setIsListening(false);
      setIsProcessing(true);
      
      try {
        const intent = await aiService.semanticSearch(speechResult);
        if (intent.category && setActiveCategory) {
          setActiveCategory(intent.category);
        }
        if (intent.search !== undefined && setSearch) {
          setSearch(intent.search);
        }
      } catch (err) {
        console.error("[Voice API] Erro ao interpretar:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setIsProcessing(false);
    };
    
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <nav className="relative shrink-0 h-14 md:h-16 flex items-center px-4 md:px-8 z-[90]">
      {/* Background */}
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

      <div className="w-full flex items-center justify-between relative z-10">
        {/* Search Bar + Logo (Mobile) */}
        <div className="flex items-center flex-1 max-w-md pr-2">
          <div className={`relative flex items-center w-full bg-white/5 border rounded-xl backdrop-blur-xl transition-all ${isListening ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/5 focus-within:border-white/25'}`}>
            <Search className="ml-3 text-white/20 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={isListening ? "Ouvindo..." : isProcessing ? "Processando AI..." : "Buscar ou Falar..."} 
              value={search}
              onChange={(e) => setSearch && setSearch(e.target.value)}
              disabled={isListening || isProcessing}
              className="w-full h-10 pl-2 pr-10 bg-transparent outline-none text-xs font-medium text-white placeholder:text-white/15 tracking-wide"
            />
            
            {hasVoiceSupport && (
              <button 
                onClick={handleVoiceCommand}
                disabled={isListening || isProcessing}
                data-touch-only
                className={`absolute right-2 p-1.5 rounded-lg transition-all outline-none ${isListening ? 'text-red-500 bg-red-500/10' : isProcessing ? 'text-blue-400 bg-blue-400/10' : 'text-white/30 hover:text-white hover:bg-white/10'}`}
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} className={isListening ? 'animate-pulse' : ''} />}
              </button>
            )}
          </div>
        </div>

        {/* Right - Server Status + Settings */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 md:px-3 bg-white/5 border border-white/5 rounded-xl backdrop-blur-xl">
            {isOnline && <CheckCircle size={12} className="text-green-500" />}
            {isOffline && <XCircle size={12} className="text-red-500" />}
            {!isOnline && !isOffline && <Zap size={12} className="text-white/40 animate-pulse" />}
            <span className={`text-[9px] font-bold uppercase tracking-widest hidden md:inline ${isOnline ? 'text-green-500' : isOffline ? 'text-red-500' : 'text-white/30'}`}>
              {isOnline ? 'ON' : isOffline ? 'OFF' : '...'}
            </span>
          </div>

          <button 
            onClick={onOpenSettings}
            tabIndex={0}
            className="w-10 h-10 md:w-9 md:h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus:ring-2 focus:ring-white/50 focus:outline-none"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
