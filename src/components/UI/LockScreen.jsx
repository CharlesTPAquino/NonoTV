import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import AuthService from '../../services/AuthService';

export default function LockScreen({ onUnlock }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await AuthService.validate(username, password);
    if (result.success) {
      onUnlock();
    } else {
      alert('Credenciais inválidas');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-80 space-y-4">
        <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <input type="text" placeholder="Usuário" className="w-full p-4 bg-white/5 rounded-xl text-white" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Senha" className="w-full p-4 bg-white/5 rounded-xl text-white" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full p-4 bg-red-600 text-white rounded-xl font-bold">{loading ? '...' : 'Acessar'}</button>
      </form>
    </div>
  );
}
