/**
 * DiagnosticPanel — Painel de diagnóstico em tempo real para o NonoTV
 * Testa conectividade nativa vs WebView e mostra o ambiente atual
 */
import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, RefreshCw, Wifi, Shield, Cpu } from 'lucide-react';
import { SyncManager } from '../../services/SyncManager';

function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') return true;
  return false;
}

function StatusBadge({ status, label }) {
  if (status === 'ok')      return <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle size={12}/> {label}</span>;
  if (status === 'fail')    return <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><XCircle size={12}/> {label}</span>;
  if (status === 'loading') return <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><Loader size={12} className="animate-spin"/> Testando...</span>;
  return <span className="flex items-center gap-1 text-[#71717A] text-xs"><AlertCircle size={12}/> {label}</span>;
}

export default function DiagnosticPanel({ sources, resetSourceStatus }) {
  const [results, setResults]   = useState([]);
  const [running, setRunning]   = useState(false);
  const [env, setEnv]           = useState(null);

  const detectEnv = useCallback(() => {
    const isNative = isNativePlatform();
    const isDev    = import.meta?.env?.DEV === true;
    const cap      = window.Capacitor;

    return {
      isNative,
      isDev,
      platform: cap?.platform || 'web',
      capVersion: cap?.PluginHeaders?.['cap-plugin-version'] || 'desconhecida',
      httpPluginActive: !!(cap?.Plugins?.CapacitorHttp || window.CapacitorCustomPlatform),
      userAgent: navigator.userAgent.substring(0, 60) + '...',
    };
  }, []);

  const runDiagnostic = useCallback(async () => {
    setRunning(true);
    const envInfo = detectEnv();
    setEnv(envInfo);
    setResults([]);

    const testUrls = [
      // URL pública sem CORS — boa para testar conectividade básica
      { label: 'Conectividade (Google DNS)', url: 'https://dns.google/resolve?name=google.com&type=A', type: 'public' },
      // Servidor IPTV principal
      { label: 'Servidor sawsax (185.66.90.170)', url: 'http://185.66.90.170/player_api.php', type: 'iptv' },
      // Servidor ultraflex
      { label: 'Servidor ultraflex.top', url: 'https://ultraflex.top/player_api.php', type: 'iptv' },
      // Servidor zeroum
      { label: 'Servidor zeroum.blog', url: 'https://zeroum.blog/player_api.php', type: 'iptv' },
    ];

    for (const test of testUrls) {
      setResults(prev => [...prev, { ...test, status: 'loading', detail: '' }]);
      
      let status = 'fail';
      let detail = '';

      try {
        // Tentar CapacitorHttp primeiro se nativo
        if (envInfo.isNative) {
          try {
            const { CapacitorHttp } = await import('@capacitor/core');
            const res = await CapacitorHttp.get({
              url: test.url,
              connectTimeout: 8000,
              readTimeout: 8000,
            });
            status = (res.status >= 200 && res.status < 500) ? 'ok' : 'fail';
            detail = `CapacitorHttp: HTTP ${res.status}`;
          } catch (e) {
            detail = `CapacitorHttp falhou: ${e.message}`;
            // Tentar fetch nativo
            const res = await fetch(test.url, { signal: AbortSignal.timeout(8000) });
            status = res.ok ? 'ok' : 'fail';
            detail += ` | fetch: HTTP ${res.status}`;
          }
        } else {
          const res = await fetch(test.url, { signal: AbortSignal.timeout(8000) });
          status = res.ok ? 'ok' : 'fail';
          detail = `HTTP ${res.status}`;
        }
      } catch (e) {
        status = 'fail';
        detail = e.message?.substring(0, 60) || 'Timeout ou rede inativa';
      }

      setResults(prev => prev.map(r => r.url === test.url ? { ...r, status, detail } : r));
    }

    setRunning(false);
  }, [detectEnv]);

  const clearAllBlocks = useCallback(() => {
    const health = SyncManager.getSourceHealth();
    Object.keys(health).forEach(id => SyncManager.unblockSource(id));
    // Limpa também failures
    localStorage.removeItem('nono_source_health');
    alert('✅ Todos os bloqueios de CircuitBreaker removidos!\nRecarregue a fonte desejada.');
  }, []);

  const clearAllCache = useCallback(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('nono_v3_'));
    keys.forEach(k => localStorage.removeItem(k));
    alert(`✅ ${keys.length} caches de canal removidos.\nSelecione uma fonte novamente.`);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Diagnóstico de Rede</h3>
        <p className="text-[#71717A] text-xs">Testa a conectividade do dispositivo com os servidores IPTV em tempo real.</p>
      </div>

      {/* Ambiente */}
      {env && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider mb-3">Ambiente Detectado</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-[#F7941D]" />
              <span className="text-[#71717A]">Platform:</span>
              <span className="text-white font-bold">{env.platform}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-[#F7941D]" />
              <span className="text-[#71717A]">Nativo:</span>
              <span className={`font-bold ${env.isNative ? 'text-green-400' : 'text-yellow-400'}`}>
                {env.isNative ? 'Sim (APK)' : 'Não (Browser)'}
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Wifi size={12} className="text-[#F7941D]" />
              <span className="text-[#71717A]">HTTP Plugin:</span>
              <span className={`font-bold ${env.httpPluginActive ? 'text-green-400' : 'text-red-400'}`}>
                {env.httpPluginActive ? 'Ativo' : 'Inativo (modo fetch)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botão de run */}
      <button
        onClick={runDiagnostic}
        disabled={running}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#F7941D] text-black font-bold rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-all"
      >
        <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
        {running ? 'Testando...' : 'Iniciar Diagnóstico'}
      </button>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-start justify-between p-3 bg-[#18181B] border border-[#27272A] rounded-xl gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{r.label}</p>
                {r.detail && <p className="text-[#71717A] text-[10px] mt-0.5 truncate">{r.detail}</p>}
              </div>
              <StatusBadge status={r.status} label={r.status === 'ok' ? 'OK' : r.status === 'fail' ? 'Falhou' : ''} />
            </div>
          ))}
        </div>
      )}

      {/* Ações de Emergência */}
      <div className="pt-3 border-t border-[#27272A] space-y-2">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Ações de Emergência</h4>
        <button
          onClick={clearAllBlocks}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500/20 text-orange-400 font-bold rounded-xl text-xs border border-orange-500/30 hover:bg-orange-500/30 active:scale-95 transition-all"
        >
          <XCircle size={14} />
          Desbloquear Todas as Fontes (Circuit Breaker)
        </button>
        <button
          onClick={clearAllCache}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#27272A] text-[#A1A1AA] font-bold rounded-xl text-xs hover:bg-[#3F3F46] active:scale-95 transition-all"
        >
          <RefreshCw size={14} />
          Limpar Cache de Canais
        </button>
      </div>
    </div>
  );
}
