import { Capacitor } from '@capacitor/core';

const FETCH_TIMEOUT = 5000;
const PARALLEL_TEST_COUNT = 3;

class AISyncService {
  constructor() {
    this.cache = new Map();
    this.healthScores = new Map();
    this.preferredSource = null;
  }

  async testSourceLatency(url) {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
      });

      clearTimeout(timeout);
      const latency = performance.now() - startTime;
      return { success: true, latency };
    } catch (error) {
      return { success: false, latency: Infinity };
    }
  }

  async fetchWithFallback(sources, onProgress) {
    const results = [];
    const workingSources = sources.filter(s => s.url && s.url.startsWith('http'));

    if (workingSources.length === 0) {
      throw new Error('Nenhuma fonte disponível');
    }

    for (let i = 0; i < Math.min(PARALLEL_TEST_COUNT, workingSources.length); i++) {
      const source = workingSources[i];
      onProgress?.(`Testando ${source.name}...`, i / workingSources.length);

      const testResult = await this.testSourceLatency(source.url);
      const score = testResult.success ? this.calculateHealthScore(testResult.latency) : 0;

      this.healthScores.set(source.id, score);
      results.push({ source, ...testResult, score });
    }

    const sorted = results.sort((a, b) => b.score - a.score);
    const best = sorted.find(r => r.success) || results[0];

    if (best && best.source) {
      this.preferredSource = best.source;
      this.cache.set(best.source.id, { timestamp: Date.now(), score: best.score });
    }

    return best;
  }

  calculateHealthScore(latency) {
    if (latency < 500) return 100;
    if (latency < 1000) return 80;
    if (latency < 2000) return 60;
    if (latency < 3000) return 40;
    return 20;
  }

  async fetchSource(source, onProgress) {
    if (!source?.url) {
      throw new Error('Fonte inválida');
    }

    onProgress?.('Conectando...', 0.1);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT * 3);

    try {
      onProgress?.('Baixando lista...', 0.5);

      const response = await fetch(source.url, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          'User-Agent': 'NonoTV/4.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      onProgress?.('Processando...', 0.8);

      const text = await response.text();

      onProgress?.('Concluído!', 1);

      return text;
    } catch (error) {
      clearTimeout(timeout);

      const cached = this.getCachedSource(source.id);
      if (cached) {
        onProgress?.('Usando cache offline...', 1);
        return cached;
      }

      throw error;
    }
  }

  getHealthScore(sourceId) {
    return this.healthScores.get(sourceId) || 0;
  }

  getPreferredSource() {
    return this.preferredSource;
  }

  setCachedSource(sourceId, data) {
    this.cache.set(sourceId, { data, timestamp: Date.now() });
  }

  getCachedSource(sourceId) {
    const cached = this.cache.get(sourceId);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
    return null;
  }

  async autoSelectBestSource(sources) {
    const results = await Promise.all(
      sources.slice(0, 5).map(async source => {
        const result = await this.testSourceLatency(source.url);
        return {
          source,
          ...result,
          score: result.success ? this.calculateHealthScore(result.latency) : 0,
        };
      })
    );

    const sorted = results.sort((a, b) => b.score - a.score);
    return sorted[0]?.source || sources[0];
  }
}

export const aiSyncService = new AISyncService();
export default AISyncService;
