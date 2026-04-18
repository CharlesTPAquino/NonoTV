import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const { login, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Preencha email e senha');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    console.log('[LoginScreen] Result:', result);
    
    if (result.success) {
      setSuccess('Login realizado com sucesso!');
      setTimeout(() => {
        onLoginSuccess?.();
      }, 500);
    } else {
      setError(result.error + (result.details ? ` (${result.details})` : ''));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
            <Lock size={40} className="text-white/60" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">
            NonoTV Elite 4K
          </h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.3em] mt-2">
            Sistema de Acesso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">
              Usuário / Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              placeholder="Digite seu usuário"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <p className="text-green-400 text-xs font-semibold">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Validando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/30 text-[10px] font-medium">
            {isSupabaseConfigured ? 'Sistema Online' : 'Modo Local'}
          </p>
        </div>
      </div>
    </div>
  );
}