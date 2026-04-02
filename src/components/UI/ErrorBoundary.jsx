import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Algo deu errado</h1>
          <p className="text-white/50 text-center mb-8 max-w-md">
            O aplicativo encontrou um erro inesperado. Isso pode ser causado por dados corrompidos ou um problema de compatibilidade.
          </p>
          <div className="flex gap-4">
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Home size={20} />
              <span>Tentar Novamente</span>
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-6 py-3 bg-[#F7941D] hover:bg-[#F7941D]/80 rounded-xl transition-colors text-black font-bold"
            >
              <RefreshCw size={20} />
              <span>Recarregar App</span>
            </button>
          </div>
          {this.state.error && (
            <p className="text-white/30 text-xs mt-8 max-w-lg text-center">
              Erro: {this.state.error.message || 'Erro desconhecido'}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
