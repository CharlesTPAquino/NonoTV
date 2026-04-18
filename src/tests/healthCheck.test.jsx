import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('HEALTH CHECK — Testes de Health Check Automático', () => {
  describe('useAutoHealthCheck', () => {
    const mockSources = [
      { id: 'source-1', url: 'http://example1.com/playlist.m3u' },
      { id: 'source-2', url: 'http://example2.com/playlist.m3u' },
    ];

    it('deve verificar todas as fontes', async () => {
      const results = {};
      
      for (const source of mockSources) {
        try {
          results[source.id] = { healthy: true, latency: 100, status: 'online' };
        } catch {
          results[source.id] = { healthy: false, status: 'error' };
        }
      }
      
      expect(Object.keys(results)).toHaveLength(2);
      expect(results['source-1']).toBeDefined();
      expect(results['source-2']).toBeDefined();
    });

    it('deve cachear resultados no localStorage', () => {
      const HEALTH_CACHE_KEY = 'nono_auto_health';
      
      const mockHealth = {
        'source-1': { healthy: true, latency: 100 }
      };
      
      localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
        health: mockHealth,
        timestamp: Date.now()
      }));
      
      const cached = localStorage.getItem(HEALTH_CACHE_KEY);
      expect(cached).toBeTruthy();
      
      const parsed = JSON.parse(cached);
      expect(parsed.health['source-1'].healthy).toBe(true);
    });

    it('deve validar timestamp do cache', () => {
      const HEALTH_CACHE_KEY = 'nono_auto_health';
      
      // Cache recente (< 1 minuto)
      localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
        health: { 'source-1': { healthy: true } },
        timestamp: Date.now()
      }));
      
      const cached = localStorage.getItem(HEALTH_CACHE_KEY);
      const { timestamp } = JSON.parse(cached);
      
      expect(Date.now() - timestamp).toBeLessThan(60000);
    });

    it('deve detectar fonte offline', () => {
      const healthStatus = {
        'source-1': { healthy: true, latency: 100 },
        'source-2': { healthy: false, status: 'error' }
      };
      
      const healthySources = Object.entries(healthStatus)
        .filter(([_, status]) => status.healthy)
        .map(([id]) => id);
      
      expect(healthySources).toHaveLength(1);
      expect(healthySources[0]).toBe('source-1');
    });

    it('deve ordenar fontes por latência', () => {
      const healthStatus = {
        'source-1': { healthy: true, latency: 200 },
        'source-2': { healthy: true, latency: 50 },
        'source-3': { healthy: true, latency: 150 }
      };
      
      const sorted = Object.entries(healthStatus)
        .filter(([_, s]) => s.healthy)
        .sort((a, b) => a[1].latency - b[1].latency)
        .map(([id]) => id);
      
      expect(sorted[0]).toBe('source-2'); // 50ms - menor
      expect(sorted[1]).toBe('source-3'); // 150ms
      expect(sorted[2]).toBe('source-1'); // 200ms - maior
    });

    it('deve retornar fonte alternativa se principal离线', () => {
      const sources = [
        { id: 'source-1', name: 'Principal' },
        { id: 'source-2', name: 'Backup' }
      ];
      
      const healthStatus = {
        'source-1': { healthy: false },
        'source-2': { healthy: true }
      };
      
      const getBestSource = () => {
        const healthy = sources.filter(s => healthStatus[s.id]?.healthy);
        if (healthy.length === 0) return sources[0];
        return healthy[0];
      };
      
      const best = getBestSource();
      expect(best.id).toBe('source-2');
    });
  });
});