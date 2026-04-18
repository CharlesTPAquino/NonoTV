import { useState, useEffect, useCallback, useRef } from 'react';

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const HEALTH_CACHE_KEY = 'nono_auto_health';

export function useAutoHealthCheck(sources, enabled = true) {
  const [healthStatus, setHealthStatus] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const intervalRef = useRef(null);

  const checkAllSources = useCallback(async () => {
    if (!sources || sources.length === 0) return;
    
    setIsChecking(true);
    const results = {};
    
    const checkPromises = sources.map(async (source) => {
      try {
        const startTime = Date.now();
        const response = await fetch(source.url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(10000)
        });
        const latency = Date.now() - startTime;
        
        results[source.id] = {
          healthy: response.ok,
          latency,
          status: response.ok ? 'online' : 'offline',
          lastCheck: Date.now()
        };
      } catch (error) {
        results[source.id] = {
          healthy: false,
          latency: null,
          status: 'error',
          error: error.message,
          lastCheck: Date.now()
        };
      }
    });
    
    await Promise.all(checkPromises);
    
    setHealthStatus(results);
    setLastCheck(Date.now());
    
    try {
      localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
        health: results,
        timestamp: Date.now()
      }));
    } catch {}
    
    setIsChecking(false);
  }, [sources]);

  useEffect(() => {
    if (!enabled || !sources || sources.length === 0) return;
    
    // Carregar cache anterior
    try {
      const cached = localStorage.getItem(HEALTH_CACHE_KEY);
      if (cached) {
        const { health, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 60000) {
          setHealthStatus(health);
          setLastCheck(timestamp);
        }
      }
    } catch {}
    
    // Primeira verificação imediata
    checkAllSources();
    
    // Configurar intervalo
    intervalRef.current = setInterval(checkAllSources, HEALTH_CHECK_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sources, enabled, checkAllSources]);

  const getHealthySources = useCallback(() => {
    return sources?.filter(s => healthStatus[s.id]?.healthy) || [];
  }, [sources, healthStatus]);

  const getBestSource = useCallback(() => {
    const healthy = getHealthySources();
    if (healthy.length === 0) return sources?.[0] || null;
    
    return healthy.sort((a, b) => {
      const latencyA = healthStatus[a.id]?.latency || Infinity;
      const latencyB = healthStatus[b.id]?.latency || Infinity;
      return latencyA - latencyB;
    })[0];
  }, [sources, healthStatus, getHealthySources]);

  const getStatusSummary = useCallback(() => {
    const total = sources?.length || 0;
    const healthy = getHealthySources().length;
    const offline = total - healthy;
    
    return {
      total,
      healthy,
      offline,
      lastCheck
    };
  }, [sources, healthStatus, getHealthySources, lastCheck]);

  return {
    healthStatus,
    isChecking,
    lastCheck,
    checkAllSources,
    getHealthySources,
    getBestSource,
    getStatusSummary
  };
}

export default useAutoHealthCheck;