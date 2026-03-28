import React, { useState } from 'react';
import {
  Settings,
  X,
  Server,
  Wifi,
  Check,
  RefreshCw,
  Zap,
  ChevronRight,
  Play,
  Shield,
  Database,
  Heart,
  History,
  Upload,
  Download,
  Clock,
  AlertTriangle,
  Cpu
} from 'lucide-react';

export default function SettingsPanel({
  isOpen,
  onClose,
  sources,
  activeSource,
  onSelectSource,
  onRefresh,
  favorites,
  history,
  sourceHealth,
  onAddFavorite,
  onRemoveFavorite,
  onToggleFavorite,
  onImportChannels,
  onExportChannels,
  onClearHistory,
  getSourceStatus,
  resetSourceStatus,
  getSettings,
  updateSettings
}) {
  const [testingId, setTestingId] = useState(null);
  const [healthScores, setHealthScores] = useState({});
  const [activeTab, setActiveTab] = useState('sources');
  const settings = getSettings();

  const testSource = async source => {
    setTestingId(source.id);
    const startTime = Date.now();
    try {
      await fetch(source.url, { method: 'HEAD', mode: 'no-cors' });
      const latency = Date.now() - startTime;
      const score = latency < 500 ? 'excellent' : latency < 1500 ? 'good' : 'slow';
      setHealthScores(prev => ({ ...prev, [source.id]: { latency, score } }));
    } catch {
      setHealthScores(prev => ({ ...prev, [source.id]: { latency: -1, score: 'offline' } }));
    }
    setTestingId(null);
  };

  const getScoreColor = score => {
    if (score === 'excellent') return 'text-green-400';
    if (score === 'good') return 'text-yellow-400';
    if (score === 'slow') return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = score => {
    if (score === 'excellent') return 'Excelente';
    if (score === 'good') return 'Bom';
    if (score === 'slow') return 'Lento';
    return 'Offline';
  };

  const handleImportM3U = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.m3u,.m3u8';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        onImportChannels(text);
      }
    };
    input.click();
  };

  const handleExportM3U = () => {
    const m3uContent = onExportChannels();
    const blob = new Blob([m3uContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NonoTV_playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'sources', label: 'Fontes', icon: Server },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'sync', label: 'Sync', icon: RefreshCw },
  ];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a0b0f] border border-gray-800 rounded-3xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center">
              <Settings size={24} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Configurações</h2>
              <p className="text-gray-500 text-sm">Gerenciar fontes, favoritos e sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-800 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server size={20} className="text-orange-500" />
                  Fontes IPTV
                </h3>
                <button
                  onClick={handleImportM3U}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-gray-400 text-sm hover:text-white transition-all"
                >
                  <Upload size={14} />
                  Importar M3U
                </button>
              </div>

              <div className="space-y-3">
                {sources.map(source => {
                  const isActive = activeSource?.id === source.id;
                  const health = healthScores[source.id];
                  const circuitStatus = getSourceStatus(source.id);

                  return (
                    <button
                      key={source.id}
                      onClick={() => onSelectSource(source)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'bg-orange-600/10 border-orange-500'
                          : 'bg-[#1a1c25] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {isActive ? <Check size={20} /> : <Server size={20} />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-white">{source.name}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[200px]">{source.url}</p>
                          {circuitStatus?.blocked && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertTriangle size={10} />
                              Bloqueado temporariamente
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {circuitStatus?.failures > 0 && (
                          <span className="text-xs text-gray-500">
                            {circuitStatus.failures} falhas
                          </span>
                        )}
                        {health && (
                          <div className={`text-right ${getScoreColor(health.score)}`}>
                            <p className="text-xs font-bold">{getScoreLabel(health.score)}</p>
                            <p className="text-xs">{health.latency}ms</p>
                          </div>
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            testSource(source);
                          }}
                          disabled={testingId === source.id}
                          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          <RefreshCw size={16} className={testingId === source.id ? 'animate-spin' : ''} />
                        </button>
                        {circuitStatus?.blocked && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              resetSourceStatus(source.id);
                            }}
                            className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:text-red-300"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleExportM3U}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 rounded-xl text-gray-400 text-sm hover:text-white transition-all"
              >
                <Download size={16} />
                Exportar Lista Atual (M3U)
              </button>

              <button
                onClick={onRefresh}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all"
              >
                <Zap size={20} />
                Detectar Melhor Fonte (AI)
              </button>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart size={20} className="text-orange-500" />
                Meus Favoritos
              </h3>
              {favorites?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum favorito ainda</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {favorites?.map(fav => (
                    <div key={fav.id} className="flex items-center justify-between p-3 bg-[#1a1c25] rounded-xl">
                      <div className="flex items-center gap-3">
                        <Heart size={16} className="text-orange-500 fill-orange-500" />
                        <div>
                          <p className="font-bold text-white text-sm">{fav.name}</p>
                          <p className="text-gray-500 text-xs">{fav.group}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-gray-500 text-xs text-center">
                Total: {favorites?.length || 0} favoritos
              </p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History size={20} className="text-orange-500" />
                  Histórico
                </h3>
                <button
                  onClick={onClearHistory}
                  className="text-red-400 text-xs hover:text-red-300"
                >
                  Limpar Tudo
                </button>
              </div>
              {history?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum histórico ainda</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history?.map(hist => (
                    <div key={hist.id} className="flex items-center justify-between p-3 bg-[#1a1c25] rounded-xl">
                      <div className="flex items-center gap-3">
                        <Play size={16} className="text-gray-400" />
                        <div>
                          <p className="font-bold text-white text-sm">{hist.name}</p>
                          <p className="text-gray-500 text-xs flex items-center gap-2">
                            <Clock size={10} />
                            {new Date(hist.lastWatched).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {hist.watchTime}s assistido
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw size={20} className="text-orange-500" />
                Configurações de Sync
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#1a1c25] rounded-xl">
                  <div>
                    <p className="font-bold text-white">Fallback Automático</p>
                    <p className="text-gray-500 text-xs">Troca de fonte automaticamente se falhar</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoFallback: !settings.autoFallback })}
                    className={`w-12 h-6 rounded-full transition-all ${
                      settings.autoFallback ? 'bg-orange-500' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      settings.autoFallback ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1a1c25] rounded-xl">
                  <div>
                    <p className="font-bold text-white">Prefetch de Canais</p>
                    <p className="text-gray-500 text-xs">Carrega próximo canal em background</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ enablePrefetch: !settings.enablePrefetch })}
                    className={`w-12 h-6 rounded-full transition-all ${
                      settings.enablePrefetch ? 'bg-orange-500' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      settings.enablePrefetch ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1a1c25] rounded-xl">
                  <div>
                    <p className="font-bold text-white">Prefetch Próximo Canal</p>
                    <p className="text-gray-500 text-xs">Pré-carrega o próximo canal</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ prefetchNext: !settings.prefetchNext })}
                    className={`w-12 h-6 rounded-full transition-all ${
                      settings.prefetchNext ? 'bg-orange-500' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      settings.prefetchNext ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="p-4 bg-[#1a1c25] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu size={16} className="text-orange-500" />
                      <p className="font-bold text-white">Circuit Breaker</p>
                    </div>
                    <span className="text-gray-500 text-xs">Após 5 falhas</span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Bloqueia temporariamente fontes com muitas falhas para evitar lentidão.
                  </p>
                </div>

                <div className="p-4 bg-[#1a1c25] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-500" />
                      <p className="font-bold text-white">Retry com Backoff</p>
                    </div>
                    <span className="text-gray-500 text-xs">3 tentativas</span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Tenta novamente com intervalo crescente (1s, 2s, 4s) antes de desistir.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-bold text-white mb-3">Cache TTL</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#1a1c25] rounded-xl">
                    <p className="text-gray-500 text-xs">Canais</p>
                    <p className="text-white font-bold">60 min</p>
                  </div>
                  <div className="p-3 bg-[#1a1c25] rounded-xl">
                    <p className="text-gray-500 text-xs">EPG</p>
                    <p className="text-white font-bold">60 min</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
