import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Clock, Signal, Zap } from 'lucide-react';
import { testAllSources, getWorkingSources, clearHealthCache } from '../../services/ServerHealthService';

export default function ServerHealthDashboard({ sources, onSelectSource, compact = false }) {
  const [health, setHealth] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, source: '' });

  const runHealthCheck = useCallback(async () => {
    setIsTesting(true);
    try {
      const results = await testAllSources(sources, (current, total, name) => {
        setProgress({ current, total, source: name });
      });
      setHealth(results);
    } catch (err) {
      console.error('[HealthDashboard] Erro:', err);
    } finally {
      setIsTesting(false);
      setProgress({ current: 0, total: 0, source: '' });
    }
  }, [sources]);

  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 300000);
    return () => clearInterval(interval);
  }, [runHealthCheck]);

  const workingSources = getWorkingSources(sources, health);
  const bestSource = workingSources[0];

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Signal size={14} className={workingSources.length > 0 ? 'text-emerald-500' : 'text-red-500'} />
          <span className="text-xs font-bold text-white/60">
            {workingSources.length}/{sources.length} online
          </span>
        </div>
        <button
          onClick={runHealthCheck}
          disabled={isTesting}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={14} className={isTesting ? 'animate-spin text-white/50' : 'text-white/40'} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Status dos Servidores</h3>
          <p className="text-xs text-white/40 font-medium mt-1">
            {workingSources.length} de {sources.length} online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runHealthCheck}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-xl text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            {isTesting ? 'Testando...' : 'Atualizar'}
          </button>
          <button
            onClick={() => { clearHealthCache(); runHealthCheck(); }}
            className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Limpar cache"
          >
            <Zap size={14} />
          </button>
        </div>
      </div>

      {isTesting && (
        <div className="bg-white/5 border border-white/20/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw size={16} className="text-white/50 animate-spin" />
            <span className="text-sm font-bold text-white/80">
              Testando {progress.source}...
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {sources.map(source => {
          const h = health[source.id] || {};
          const isOnline = h.online;
          const isWorking = workingSources.find(s => s.id === source.id);
          
          return (
            <button
              key={source.id}
              onClick={() => onSelectSource && onSelectSource(source)}
              className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left ${
                isWorking 
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isOnline ? 'bg-emerald-500/10' : 'bg-red-500/10'
              }`}>
                {isOnline ? (
                  <CheckCircle size={20} className="text-emerald-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{source.name}</p>
                <p className="text-xs text-white/40 truncate">{source.category}</p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {h.status && (
                  <span className={`text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                    {h.status === 200 ? 'OK' : h.status}
                  </span>
                )}
                {h.testedAt && (
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(h.testedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {bestSource && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/20/20">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
            Melhor Servidor
          </p>
          <button
            onClick={() => onSelectSource && onSelectSource(bestSource)}
            className="w-full flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Wifi size={16} className="text-white/50" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-white">{bestSource.name}</p>
              <p className="text-xs text-white/40">{bestSource.category}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
              Conectar
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
