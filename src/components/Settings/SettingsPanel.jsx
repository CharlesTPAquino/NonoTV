import React, { useState, useEffect } from 'react';
import { X, Server, Wifi, Heart, History, Upload, Download, RefreshCw, Settings, ChevronRight, Activity, Cloud, Bug, Shield, Database, Zap, User, LogOut, Calendar, CreditCard } from 'lucide-react';
import ServerHealthDashboard from './ServerHealthDashboard';
import SyncTab from './SyncTab';
import DiagnosticPanel from './DiagnosticPanel';
import { useAuth } from '../../context/AuthContext';

/**
 * PAINEL DE CONFIGURAÇÕES - REDESIGN ULTRA ELITE 4K
 * Interface de vidro reflexivo, abas modernas e estética premium.
 */

export default function SettingsPanel({
  isOpen, onClose, sources, activeSource, onSelectSource, onRefresh,
  favorites, history, onRemoveFavorite, onToggleFavorite, onImportChannels,
  onExportChannels, onClearHistory, getSourceStatus, resetSourceStatus,
  getSettings, updateSettings, initialTab = 'sources'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const panelRef = React.useRef(null);
  
  // Atualizar tab inicial quando changing
  // Atualizar tab inicial quando mudar
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  
  // Definir tabs aqui para poder usar no useEffect
  const tabs = [
    { id: 'sources',    label: 'Fontes',      icon: Database },
    { id: 'status',     label: 'Sinal',       icon: Activity },
    { id: 'favorites',  label: 'Favoritos',   icon: Heart },
    { id: 'history',    label: 'Histórico',   icon: History },
    { id: 'subscription', label: 'Assinatura', icon: CreditCard },
    { id: 'settings',   label: 'Ajustes',     icon: Settings },
    { id: 'diagnostic', label: 'Sistema',     icon: Shield },
  ];

  const settings = getSettings();

  // Hook de autenticação
  const { user, isLocalAuth, logout } = useAuth() || {};
  
  // Estado para dados do banco
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  // Buscar dados atualizados do Supabase
  useEffect(() => {
    if (activeTab === 'subscription') {
      fetchSubscriptionData();
    }
  }, [activeTab]);

  const fetchSubscriptionData = async () => {
    setLoadingSubscription(true);
    const userName = localStorage.getItem('nono_auth_name');
    
    if (!userName) {
      setLoadingSubscription(false);
      return;
    }

    const VITE_SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL;
    const VITE_SUPABASE_ANON_KEY = import.meta?.env?.VITE_SUPABASE_ANON_KEY;

    if (VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
        
        const { data, error } = await supabase
          .from('clients')
          .select('name, plan, expires, active, created_at')
          .eq('name', userName)
          .single();

        if (data && !error) {
          setSubscriptionData(data);
          // Atualizar localStorage com dados do banco
          localStorage.setItem('nono_auth_plan', String(data.plan || 30));
          if (data.expires) {
            localStorage.setItem('nono_auth_expiry', String(data.expires));
          }
        }
      } catch (err) {
        console.log('[Assinatura] Erro ao buscar dados:', err.message);
      }
    }
    setLoadingSubscription(false);
  };

  // Calcular dias restantes
  const getExpiryInfo = () => {
    // Primeiro tenta usar dados do banco (mais atualizado)
    if (subscriptionData?.expires) {
      const daysLeft = Math.ceil((subscriptionData.expires - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 ? daysLeft : 0;
    }
    // Fallback para localStorage
    const expiry = localStorage.getItem('nono_auth_expiry');
    if (!expiry || expiry <= 0) return null;
    const daysLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysRemaining = getExpiryInfo();
  const userName = localStorage.getItem('nono_auth_name') || (user?.name || 'Usuário');
  const userPlan = subscriptionData?.plan || localStorage.getItem('nono_auth_plan') || (user?.plan || '30');

  // Função para logout
  const handleLogout = async () => {
    if (logout) {
      await logout();
    } else {
      localStorage.removeItem('nono_auth_token');
      localStorage.removeItem('nono_auth_expiry');
      localStorage.removeItem('nono_auth_name');
      localStorage.removeItem('nono_auth_plan');
      localStorage.removeItem('nono_password');
      localStorage.removeItem('nono_device_id');
    }
    window.location.reload();
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
    a.download = 'NonoTV_Elite_Playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500" data-nav-zone="settings">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#050505]/60 backdrop-blur-[80px] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.8)] reflective-glass">
        
        {/* Reflection Highlight */}
        <div className="absolute top-0 right-0 w-1/2 h-64 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none z-0" />

        {/* Sidebar Tabs (Desktop/Tablet) */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 z-10 bg-black/20">
          <div className="flex items-center gap-4 mb-10 px-2">
             <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center ">
                <Settings size={20} className="text-white" />
             </div>
             <div>
                <h2 className="text-white font-black text-lg tracking-tighter uppercase leading-none">Painel Elite</h2>
                <span className="text-white/50 text-[8px] font-black uppercase tracking-[0.4em] mt-1 block">Configurações</span>
             </div>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  tabIndex={0}
                  data-focusable
                  data-nav-zone="settings-tabs"
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 whitespace-nowrap group
                    ${isActive 
                      ? 'bg-red-600 text-white shadow-2xl shadow-red-600/20' 
                      : 'text-white/30 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-none focus:ring-2 focus:ring-white/30'}`}
                >
                  <Icon size={20} className={`shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 hidden md:block">
             <div className="p-5 rounded-[1.5rem] bg-white/5 border border-white/5 text-center">
                <Zap size={24} className="mx-auto text-white/50 mb-3 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Status do Sinal</p>
                <p className="text-white text-[10px] font-bold mt-1">4K ULTRA HIGH SPEED</p>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
          
          {/* Internal Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
             <div>
                <h3 className="text-white font-black text-2xl tracking-tighter uppercase">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Gerenciamento de Experiência Elite 4K
                </p>
             </div>
              <button
                data-close-panel
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {activeTab === 'sources' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between bg-white/5 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20/20">
                       <Database size={24} className="text-white/50" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">Repositório de Fontes</h4>
                      <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-1">{sources.length} Servidores Disponíveis</p>
                    </div>
                  </div>
                  <button
                    onClick={handleImportM3U}
                    className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 hover:bg-red-500 transition-all shadow-xl shadow-red-600/20"
                  >
                    <Upload size={14} />
                    Importar M3U
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sources.map(source => {
                    const isActive = activeSource?.id === source.id;
                    const status = getSourceStatus?.(source.id);
                    
                    return (
                      <button
                        key={source.id}
                        tabIndex={0}
                        data-focusable
                        data-nav-zone="settings-sources"
                        onClick={() => onSelectSource(source)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectSource(source);
                          }
                        }}
                        className={`group relative flex items-center gap-4 p-5 rounded-[1.5rem] transition-all duration-500 border
                          ${isActive
                            ? 'bg-red-600 text-white border-red-500 shadow-2xl shadow-red-600/20 scale-[1.02]'
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                          isActive ? 'bg-white/15 border-white/20 text-white' : 'bg-black/40 border-white/10 text-white/20'
                        }`}>
                          <Server size={20} />
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-black text-xs uppercase tracking-widest truncate">{source.name}</p>
                          <p className={`text-[9px] font-bold truncate mt-1 ${isActive ? 'text-white/60' : 'text-white/10'}`}>
                            {source.url}
                          </p>
                        </div>
                        
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive ? 'bg-black/10' : 'bg-white/5 group-hover:bg-white group-hover:text-black'
                        }`}>
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleExportM3U}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Download size={16} />
                    Backup Local
                  </button>
                  <button
                    onClick={onRefresh}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] hover:bg-red-500 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.25)]"
                  >
                    <RefreshCw size={16} />
                    Sincronizar Agora
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ServerHealthDashboard sources={sources} onSelectSource={onSelectSource} />
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {favorites?.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 border border-white/5 rounded-[2rem]">
                    <Heart size={48} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest">Sua lista está vazia</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favorites?.map(fav => (
                      <div key={fav.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/15 transition-all">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
                           <Heart size={18} className="text-white fill-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white text-xs uppercase tracking-widest truncate">{fav.name}</p>
                          <p className="text-white/20 text-[9px] font-bold uppercase truncate">{fav.group}</p>
                        </div>
                        <button
                          onClick={() => onRemoveFavorite(fav.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{history?.length} Registros</span>
                   {history?.length > 0 && (
                    <button onClick={onClearHistory} className="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">
                      Limpar Tudo
                    </button>
                   )}
                </div>
                <div className="space-y-3">
                  {history?.map(hist => (
                    <div key={hist.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-white/20">
                        <History size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-white text-xs uppercase tracking-widest">{hist.name}</p>
                        <p className="text-white/20 text-[9px] font-bold uppercase mt-1">
                          Visto em {new Date(hist.lastWatched).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Card do Usuário */}
                <div className="p-8 bg-gradient-to-br from-white/10 to-transparent border border-white/20/20 rounded-[1.5rem]">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/30">
                      <User size={40} className="text-white" />
                    </div>
                    <div>
                      <p className="font-black text-white text-2xl tracking-tighter uppercase">{userName}</p>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {isLocalAuth ? 'Conta Local' : 'Conta Premium'}
                      </p>
                      {loadingSubscription && (
                        <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-1">Sincronizando...</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Info do Plano */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-red-500" />
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Plano</p>
                      </div>
                      <p className="text-white text-lg font-black">{userPlan} dias</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={16} className="text-red-500" />
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Validade</p>
                      </div>
                      <p className="text-white text-lg font-black">
                        {daysRemaining !== null ? `${daysRemaining} dias` : 'Ilimitado'}
                      </p>
                    </div>
                  </div>

                  {/* Contador Regressivo Visual */}
                  {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                        ⚠️ Sua assinatura expira em {daysRemaining} dia{daysRemaining > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status da Conta */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-[1.5rem]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-white text-xs uppercase tracking-widest">Status da Conta</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${subscriptionData?.active === false ? 'text-red-400' : 'text-green-400'}`}>
                        ● {subscriptionData?.active === false ? 'Inativa' : 'Ativa'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Activity size={20} className="text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Dados do Banco (Debug) */}
                {subscriptionData && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-2">Dados do Servidor</p>
                    <p className="text-white/40 text-[8px] font-mono">
                      ID: {subscriptionData.name} | Plano: {subscriptionData.plan} dias | Expira: {subscriptionData.expires ? new Date(subscriptionData.expires).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                )}

                {/* Botão Sair */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:scale-[1.02] transition-all shadow-2xl shadow-red-600/20"
                >
                  <LogOut size={18} />
                  Sair da Conta
                </button>
              </div>
            )}

{activeTab === 'settings' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[1.5rem]">
                  <div>
                    <p className="font-black text-white text-xs uppercase tracking-widest">Fallback Automático</p>
                    <p className="text-white/20 text-[9px] font-bold uppercase mt-1">Alternar fontes em caso de falha de sinal</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoFallback: !settings.autoFallback })}
                    className={`w-12 h-7 rounded-full transition-all p-1 ${
                      settings.autoFallback ? 'bg-red-600' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-xl transition-transform ${
                      settings.autoFallback ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[1.5rem]">
                  <div>
                    <p className="font-black text-white text-xs uppercase tracking-widest">Buffering Inteligente</p>
                    <p className="text-white/20 text-[9px] font-bold uppercase mt-1">Pré-carregar canais para troca instantânea</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ enablePrefetch: !settings.enablePrefetch })}
                    className={`w-12 h-7 rounded-full transition-all p-1 ${
                      settings.enablePrefetch ? 'bg-red-600' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xl ${
                      settings.enablePrefetch ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* App Version */}
                <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-[1.5rem] mt-6">
                  <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] mb-2">Versão do App</span>
                  <span className="text-white/50 text-sm font-black tracking-tighter">NonoTV Elite 4K v4.9</span>
                  <span className="text-white/10 text-[8px] font-bold uppercase tracking-widest mt-1">Build {new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )}

            {activeTab === 'diagnostic' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DiagnosticPanel sources={sources} resetSourceStatus={resetSourceStatus} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}