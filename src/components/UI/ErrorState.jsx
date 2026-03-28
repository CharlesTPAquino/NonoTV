import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Tente novamente mais tarde.',
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mb-6">
        <AlertTriangle size={48} className="text-red-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-gray-400 text-center max-w-md mb-8">{message}</p>

      <div className="flex gap-4">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all hover:shadow-lg"
          >
            <RefreshCw size={20} />
            Tentar novamente
          </button>
        )}
        {showGoHome && onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
          >
            <Home size={20} />
            Voltar ao início
          </button>
        )}
      </div>
    </div>
  );
}

export function NetworkError({ onRetry }) {
  return (
    <ErrorState
      title="Sem conexão"
      message="Verifique sua internet e tente novamente."
      onRetry={onRetry}
      showGoHome={false}
    />
  );
}

export function EmptyState({
  title = 'Nada aqui ainda',
  message = 'Explore outros conteúdos.',
  icon: Icon = AlertTriangle,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
        <Icon size={48} className="text-gray-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-gray-400 text-center">{message}</p>
    </div>
  );
}

export default ErrorState;
