import { SmartCache } from './SmartCache';
import { parseM3U } from '../utils/m3uParser';

const PREFETCH_QUEUE = new Map();
const MAX_CONCURRENT_PREFETCH = 3;
const PREFETCH_TIMEOUT = 30000;

let isPrefetching = false;

export const SmartPrefetchService = {
  async prefetchSource(source) {
    if (!source || !source.url) return null;

    if (PREFETCH_QUEUE.has(source.id)) {
      console.log(`[SmartPrefetch] Fonte ${source.id} já está na fila de prefetch`);
      return PREFETCH_QUEUE.get(source.id);
    }

    if (PREFETCH_QUEUE.size >= MAX_CONCURRENT_PREFETCH) {
      console.log(`[SmartPrefetch] Fila cheia (${PREFETCH_QUEUE.size}/${MAX_CONCURRENT_PREFETCH}), aguardando...`);
      const oldestKey = PREFETCH_QUEUE.keys().next().value;
      PREFETCH_QUEUE.delete(oldestKey);
    }

    const promise = this._fetchAndCacheSource(source);
    PREFETCH_QUEUE.set(source.id, promise);

    try {
      const result = await promise;
      PREFETCH_QUEUE.delete(source.id);
      return result;
    } catch (error) {
      PREFETCH_QUEUE.delete(source.id);
      throw error;
    }
  },

  async _fetchAndCacheSource(source) {
    console.log(`[SmartPrefetch] Iniciando prefetch para ${source.name}`);

    const { syncSource } = await import('./api');

    const text = await Promise.race([
      syncSource(source.url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_PREFETCH')), PREFETCH_TIMEOUT))
    ]);

    const channels = parseM3U(text);

    if (channels && channels.length > 0) {
      await SmartCache.set(source.id, null, channels, source.url, source.name);
      console.log(`[SmartPrefetch] Cache atualizado para ${source.name}: ${channels.length} canais`);
      return { source, channels, success: true };
    }

    return { source, channels: [], success: false };
  },

  async prefetchMultiple(sources, concurrency = MAX_CONCURRENT_PREFETCH) {
    console.log(`[SmartPrefetch] Prefetch múltiplo: ${sources.length} fontes`);

    const results = [];
    const queue = [...sources];

    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(source => this.prefetchSource(source))
      );

      results.push(...batchResults);

      if (queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    console.log(`[SmartPrefetch] Concluído: ${successful}/${sources.length} fontes cacheadas`);
    return results;
  },

  async prefetchSmartSelection(sources, options = {}) {
    const {
      maxSources = 5,
      preferHealthy = true,
      preferFavorites = true,
      userHistory = [],
      sourceHealth = {}
    } = options;

    console.log(`[SmartPrefetch] Seleção inteligente de fontes para prefetch`);

    let sourcesToPrefetch = [...sources];

    if (preferHealthy && Object.keys(sourceHealth).length > 0) {
      sourcesToPrefetch.sort((a, b) => {
        const healthA = sourceHealth[a.id]?.lastSuccess || 0;
        const healthB = sourceHealth[b.id]?.lastSuccess || 0;
        return healthB - healthA;
      });
    }

    if (preferFavorites && userHistory.length > 0) {
      const favoriteSources = new Set(userHistory.map(h => h.sourceId));
      sourcesToPrefetch.sort((a, b) => {
        const aFav = favoriteSources.has(a.id) ? 1 : 0;
        const bFav = favoriteSources.has(b.id) ? 1 : 0;
        return bFav - aFav;
      });
    }

    sourcesToPrefetch = sourcesToPrefetch.slice(0, maxSources);

    return this.prefetchMultiple(sourcesToPrefetch, 2);
  },

  async prefetchByCategory(sources, category, maxSources = 3) {
    const categorySources = sources.filter(s => s.category === category);
    console.log(`[SmartPrefetch] Prefetch por categoria "${category}": ${categorySources.length} fontes`);
    return this.prefetchMultiple(categorySources.slice(0, maxSources), 2);
  },

  getQueueStatus() {
    return {
      size: PREFETCH_QUEUE.size,
      maxConcurrent: MAX_CONCURRENT_PREFETCH,
      keys: Array.from(PREFETCH_QUEUE.keys())
    };
  },

  clearQueue() {
    PREFETCH_QUEUE.clear();
    console.log('[SmartPrefetch] Fila de prefetch limpa');
  }
};

export default SmartPrefetchService;
