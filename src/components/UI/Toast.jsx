import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className="fixed top-24 right-4 z-[300] flex flex-col gap-3"
        role="region"
        aria-label="Notificações"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    warning: 'bg-amber-600 border-amber-500',
    info: 'bg-blue-600 border-blue-500',
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${colors[type]} shadow-2xl min-w-[280px] max-w-md animate-slide-in-right`}
      role="alert"
    >
      <span className="text-white">{icons[type]}</span>
      <p className="text-white font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white"
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default Toast;
