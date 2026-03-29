import React, { useState, useEffect } from 'react';
import { X, Server, Wifi, Heart, History, Upload, Download, RefreshCw, Settings, ChevronRight, Activity, Cloud } from 'lucide-react';
import ServerHealthDashboard from './ServerHealthDashboard';
import SyncTab from './SyncTab';

export default function SettingsPanel({
  isOpen,
  onClose,
  sources,
  activeSource,
  onSelectSource,
  onRefresh,
  favorites,
  history,
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
  const [activeTab, setActiveTab] = useState('sources');
  const settings = getSettings();

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
    { id: 'status', label: 'Status', icon: Activity },
    { id: 'sync', label: 'Sync', icon: Cloud },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[85vh] bg-[#0F0F0F] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
          <h2 className="text-lg font-semibold text-white">Configurações</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#27272A] flex items-center justify-center text-[#71717A] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#27272A] px-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#F7941D] text-white'
                    : 'border-transparent text-[#71717A] hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Servidores IPTV</h3>
                  <span className="bg-[#F7941D]/20 text-[#F7941D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {sources.length}
                  </span>
                </div>
                <button
                  onClick={handleImportM3U}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27272A] rounded-lg text-[#A1A1AA] text-xs hover:text-white hover:bg-[#3F3F46] transition-colors"
                >
                  <Upload size={12} />
                  Importar
                </button>
              </div>

              {/* Grid de Servidores */}
              <div className="grid grid-cols-1 gap-3">
                {sources.map(source => {
                  const isActive = activeSource?.id === source.id;
                  const sourceStatus = getSourceStatus?.(source.id);
                  
                  return (
                    <button
                      key={source.id}
                      onClick={() => onSelectSource(source)}
                      className={`group relative flex items-center gap-3 p-3 rounded-2xl transition-all overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-[#F7941D]/20 to-[#F7941D]/5 border border-[#F7941D]/30'
                          : 'bg-[#27272A] border border-transparent hover:border-[#3F3F46] hover:bg-[#3F3F46]'
                      }`}
                    >
                      {/* Indicador ativo */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F7941D]" />
                      )}
                      
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#F7941D] text-white shadow-lg shadow-[#F7941D]/30' : 'bg-[#18181B] text-[#71717A] group-hover:text-white'
                      }`}>
                        <Server size={20} />
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-white/90'}`}>
                            {source.name}
                          </p>
                          {sourceStatus?.isHealthy === false && (
                            <span className="w-2 h-2 bg-red-500 rounded-full" title="Servidor offline" />
                          )}
                        </div>
                        <p className="text-[#71717A] text-xs truncate mt-0.5">{source.url}</p>
                      </div>
                      
                      <div className={`p-2 rounded-lg transition-all ${isActive ? 'bg-[#F7941D] text-white' : 'bg-[#18181B] text-[#71717A] group-hover:text-white'}`}>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status dos Servidores */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">Status dos Servidores</h4>
                <ServerHealthDashboard 
                  sources={sources} 
                  onSelectSource={onSelectSource}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExportM3U}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#27272A] rounded-xl text-[#A1A1AA] text-sm hover:text-white hover:bg-[#3F3F46] transition-colors"
                >
                  <Download size={16} />
                  Exportar
                </button>
                <button
                  onClick={onRefresh}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F7941D] rounded-xl text-white text-sm font-medium hover:bg-[#E8830D] transition-colors"
                >
                  <RefreshCw size={16} />
                  Atualizar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <ServerHealthDashboard 
              sources={sources} 
              onSelectSource={onSelectSource}
            />
          )}

          {activeTab === 'sync' && (
            <SyncTab 
              favorites={favorites} 
              history={history}
            />
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Favoritos</h3>
              {favorites?.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={32} className="mx-auto text-[#3F3F46] mb-3" />
                  <p className="text-[#71717A] text-sm">Nenhum favorito ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites?.map(fav => (
                    <div key={fav.id} className="flex items-center gap-3 p-3 bg-[#27272A] rounded-xl">
                      <Heart size={16} className="text-[#F7941D] fill-[#F7941D]" />
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{fav.name}</p>
                        <p className="text-[#71717A] text-xs">{fav.group}</p>
                      </div>
                      <button
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="text-[#71717A] hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Histórico</h3>
                {history?.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-red-400 text-xs hover:text-red-300"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {history?.length === 0 ? (
                <div className="text-center py-12">
                  <History size={32} className="mx-auto text-[#3F3F46] mb-3" />
                  <p className="text-[#71717A] text-sm">Nenhum histórico ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history?.map(hist => (
                    <div key={hist.id} className="flex items-center gap-3 p-3 bg-[#27272A] rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-[#18181B] flex items-center justify-center text-[#71717A]">
                        <History size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{hist.name}</p>
                        <p className="text-[#71717A] text-xs">
                          {new Date(hist.lastWatched).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Ajustes</h3>
              
              <div className="flex items-center justify-between p-4 bg-[#27272A] rounded-xl">
                <div>
                  <p className="font-medium text-white text-sm">Fallback Automático</p>
                  <p className="text-[#71717A] text-xs">Troca fonte se falhar</p>
                </div>
                <button
                  onClick={() => updateSettings({ autoFallback: !settings.autoFallback })}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    settings.autoFallback ? 'bg-[#F7941D]' : 'bg-[#3F3F46]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoFallback ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#27272A] rounded-xl">
                <div>
                  <p className="font-medium text-white text-sm">Prefetch de Canais</p>
                  <p className="text-[#71717A] text-xs">Carrega próximo canal</p>
                </div>
                <button
                  onClick={() => updateSettings({ enablePrefetch: !settings.enablePrefetch })}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    settings.enablePrefetch ? 'bg-[#F7941D]' : 'bg-[#3F3F46]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.enablePrefetch ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
