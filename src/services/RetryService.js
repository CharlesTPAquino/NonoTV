import { SyncManager } from './SyncManager';
import { recordMetric } from './SmartServerOrchestrator';

const DEFAULT_CONFIG = {
  maxRetries: 2,
  baseDelay: 2000,
  maxDelay: 15000,
  backoffMultiplier: 2,
  circuitBreakerThreshold: 10,
  circuitBreakerDuration: 2 * 60 * 1000
};

export class RetryService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.circuitBreakers = new Map();
  }

  async executeWithRetry(fn, sourceId, sourceName = 'Unknown') {
    const { maxRetries, baseDelay, backoffMultiplier } = this.config;
    const startTime = Date.now();
    
    if (SyncManager.isSourceBlocked(sourceId)) {
      console.log(`[RetryService] Fonte ${sourceName} está bloqueada pelo circuit breaker`);
      recordMetric('circuit_breaker', 0, false);
      throw new Error('SOURCE_BLOCKED');
    }

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        const latency = Date.now() - startTime;
        
        if (attempt > 0) {
          console.log(`[RetryService] ${sourceName}: Sucesso na tentativa ${attempt + 1} (latency: ${latency}ms)`);
          SyncManager.resetSourceHealth(sourceId);
        }
        
        recordMetric('success', latency, true);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`[RetryService] ${sourceName}: Falha na tentativa ${attempt + 1}/${maxRetries + 1}`, error.message);

        if (attempt < maxRetries) {
          const delay = Math.min(
            baseDelay * Math.pow(backoffMultiplier, attempt),
            this.config.maxDelay
          );
          console.log(`[RetryService] ${sourceName}: Aguardando ${delay}ms antes de tentar novamente...`);
          await this.sleep(delay);
        }
      }
    }

    const failures = SyncManager.incrementSourceFailure(sourceId);
    console.log(`[RetryService] ${sourceName}: Falhas totais: ${failures}`);
    recordMetric('failure', 0, false);

    if (failures >= this.config.circuitBreakerThreshold) {
      console.log(`[RetryService] ${sourceName}: Circuit breaker ativado!`);
      SyncManager.blockSource(sourceId, this.config.circuitBreakerDuration);
      recordMetric('circuit_breaker', 0, false);
    }

    throw lastError;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeWithFallback(sources, fn, onFallback) {
    const settings = SyncManager.getSettings();
    const fallbackOrder = SyncManager.getFallbackOrder();
    
    const sortedSources = [...sources].sort((a, b) => {
      const aFailures = SyncManager.getSourceFailures(a.id);
      const bFailures = SyncManager.getSourceFailures(b.id);
      return aFailures - bFailures;
    });

    const tried = [];

    for (const source of sortedSources) {
      if (SyncManager.isSourceBlocked(source.id)) {
        console.log(`[RetryService] Pulando fonte bloqueada: ${source.name}`);
        tried.push({ source, status: 'blocked' });
        continue;
      }

      try {
        console.log(`[RetryService] Tentando fonte: ${source.name}`);
        const result = await this.executeWithRetry(
          () => fn(source),
          source.id,
          source.name
        );
        return { result, source, tried };
      } catch (error) {
        console.log(`[RetryService] Fonte ${source.name} falhou:`, error.message);
        tried.push({ source, status: 'failed', error: error.message });
        
        if (onFallback) {
          onFallback(source, error, tried.length);
        }
      }
    }

    throw new Error('ALL_SOURCES_FAILED');
  }

  async executeSmartFallback(urls, fetchFn, onAttempt) {
    const errors = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      if (onAttempt) {
        onAttempt(i + 1, urls.length, url);
      }
      
      try {
        console.log(`[RetryService] Tentando URL ${i + 1}/${urls.length}: ${url.substring(0, 50)}...`);
        const result = await fetchFn(url);
        console.log(`[RetryService] Sucesso na URL ${i + 1}`);
        return { result, urlIndex: i, errors };
      } catch (error) {
        console.log(`[RetryService] URL ${i + 1} falhou:`, error.message);
        errors.push({ url, error: error.message });
        
        if (i < urls.length - 1) {
          await this.sleep(1000);
        }
      }
    }
    
    throw new Error(`ALL_URLS_FAILED: ${errors.map(e => e.error).join(', ')}`);
  }

  getCircuitBreakerStatus(sourceId) {
    const health = SyncManager.getSourceHealth()[sourceId];
    if (!health) return { blocked: false };
    
    return {
      blocked: SyncManager.isSourceBlocked(sourceId),
      failures: health.failures || 0,
      blockedUntil: health.blockedUntil || null,
      lastChecked: health.lastChecked
    };
  }

  resetCircuitBreaker(sourceId) {
    SyncManager.unblockSource(sourceId);
  }

  getAllCircuitBreakerStatus() {
    const health = SyncManager.getSourceHealth();
    return Object.entries(health).map(([id, data]) => ({
      sourceId: id,
      blocked: SyncManager.isSourceBlocked(id),
      failures: data.failures || 0,
      blockedUntil: data.blockedUntil || null,
      lastChecked: data.lastChecked
    }));
  }
}

export const retryService = new RetryService();

export default retryService;
