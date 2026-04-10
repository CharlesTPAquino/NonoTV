import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 80;

export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (disabled) return;
    startY.current = e.touches[0].clientY;
  }, [disabled]);

  const handleTouchMove = useCallback((e) => {
    if (disabled) return;
    
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      setIsPulling(diff > PULL_THRESHOLD);
    }
  }, [disabled]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isPulling) {
      setIsPulling(false);
      return;
    }

    setIsPulling(false);
    setIsRefreshing(true);
    
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  }, [disabled, isPulling, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isPulling ? 'h-16' : 'h-0'
        }`}
      >
        <div className={`flex items-center gap-2 ${isRefreshing ? 'animate-spin' : ''} text-white/50`}>
          <RefreshCw size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isRefreshing ? 'Atualizando...' : 'Puxe para atualizar'}
          </span>
        </div>
      </div>
      
      <div
        className="transition-transform duration-300"
        style={{
          transform: isPulling ? `translateY(${Math.min(currentY.current - startY.current, PULL_THRESHOLD)}px)` : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
