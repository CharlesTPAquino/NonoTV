import React, { useState, useEffect } from 'react';
import { Cloud, Copy, Check, Share2, Download, Upload, Trash2, Clock } from 'lucide-react';
import { CloudSyncService } from '../../services/CloudSyncService';

export default function SyncTab({ favorites, history }) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [importData, setImportData] = useState('');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    setSyncStatus(CloudSyncService.getSyncStatus());
  }, []);

  const handleExport = () => {
    const data = CloudSyncService.exportData(favorites, history, []);
    const jsonString = JSON.stringify(data, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nonotv-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSyncStatus(CloudSyncService.getSyncStatus());
  };

  const handleCopyData = () => {
    const data = CloudSyncService.exportData(favorites, history, []);
    const encoded = btoa(JSON.stringify(data));
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importData.trim()) return;
    
    try {
      const decoded = atob(importData.trim());
      const result = CloudSyncService.importData(decoded);
      setImportResult(result);
      
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setImportResult({ success: false, error: 'Código inválido' });
    }
  };

  const handleClearCloud = () => {
    if (confirm('Tem certeza que deseja limpar os dados na nuvem?')) {
      CloudSyncService.clearCloudData();
      setSyncStatus(CloudSyncService.getSyncStatus());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Sincronização na Nuvem</h3>
        <p className="text-xs text-white/40">Faça backup dos seus favoritos e histórico</p>
      </div>

      {syncStatus?.lastSync && (
        <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 rounded-lg p-3">
          <Clock size={14} />
          <span>Última sincronização: {new Date(syncStatus.lastSync.exportedAt).toLocaleString()}</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl text-black font-medium hover:bg-white/90 transition-colors"
        >
          <Download size={18} />
          Exportar Dados (JSON)
        </button>

        <button
          onClick={handleCopyData}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#27272A] rounded-xl text-white font-medium hover:bg-[#3F3F46] transition-colors"
        >
          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          {copied ? 'Copiado!' : 'Copiar Dados (Base64)'}
        </button>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-xs font-semibold text-white mb-3">Importar Dados</h4>
        <textarea
          value={importData}
          onChange={(e) => {
            setImportData(e.target.value);
            setImportResult(null);
          }}
          placeholder="Cole o código Base64 aqui..."
          className="w-full h-24 bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder-white/30 resize-none focus:border-white/20 focus:outline-none"
        />
        
        {importResult && (
          <div className={`mt-2 text-xs ${importResult.success ? 'text-emerald-500' : 'text-red-500'}`}>
            {importResult.success 
              ? `Importado! ${importResult.favoritesCount} favoritos, ${importResult.historyCount} histórico`
              : `Erro: ${importResult.error}`
            }
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!importData.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-3 bg-[#27272A] rounded-xl text-white font-medium hover:bg-[#3F3F46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={18} />
          Importar Dados
        </button>
      </div>

      {syncStatus?.hasCloudData && (
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={handleClearCloud}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-medium hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={18} />
            Limpar Dados na Nuvem
          </button>
        </div>
      )}

      <div className="text-xs text-white/30 text-center pt-2">
        ID do dispositivo: {syncStatus?.deviceId?.substring(0, 12)}...
      </div>
    </div>
  );
}
