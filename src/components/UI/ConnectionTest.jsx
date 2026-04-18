import React, { useState } from 'react';
import { Wifi, WifiOff, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConnectionTest({ onClose }) {
  const { testConnection } = useAuth();
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    const testResult = await testConnection();
    setResults(testResult);
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-card border border-border rounded-3xl p-6">
        <h2 className="text-lg font-black text-white uppercase tracking-wide mb-6">
          Teste de Conexão
        </h2>

        <div className="space-y-4">
          <button
            onClick={runTest}
            disabled={testing}
            className="w-full py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/90 disabled:opacity-50"
          >
            {testing ? 'Testando...' : 'Iniciar Teste'}
          </button>

          {results && (
            <div className="space-y-3 mt-4">
              <div className={`flex items-center gap-3 p-3 rounded-xl ${results.supabaseUrl ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                {results.supabaseUrl ? <CheckCircle size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
                <span className="text-white/80 text-xs">
                  URL Supabase: {results.supabaseUrl || 'Não configurada'}
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl ${results.anonKey ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                {results.anonKey ? <CheckCircle size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
                <span className="text-white/80 text-xs">
                  Chave Anon: {results.anonKey ? 'Configurada' : 'Faltando'}
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl ${results.databaseConnected ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                {results.databaseConnected ? <Database size={18} className="text-green-500" /> : <WifiOff size={18} className="text-red-500" />}
                <span className="text-white/80 text-xs">
                  Banco de Dados: {results.databaseConnected ? 'Conectado' : results.databaseError || 'Erro'}
                </span>
              </div>

              {results.clientsCount !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Database size={18} className="text-white/50" />
                  <span className="text-white/60 text-xs">
                    Clientes no banco: {results.clientsCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 border border-white/20 text-white/60 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-white/5"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}