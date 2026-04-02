import { ChannelCacheDB } from './ChannelCacheDB';

const MEMORY_CACHE = new Map();
const MEMORY_TTL = 5 * 60 * 1000;

const pendingRequests = new Map();

export const SmartCache = {
  async get(sourceId) {
    const memoryEntry = MEMORY_CACHE.get(sourceId);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < MEMORY_TTL) {
      console.log(`[SmartCache] Hit memória para ${sourceId}`);
      return memoryEntry.data;
    }

    if (memoryEntry) {
      MEMORY_CACHE.delete(sourceId);
    }

    return await ChannelCacheDB.get(sourceId);
  },

  async set(sourceId, data, channels, sourceUrl, sourceName) {
    MEMORY_CACHE.set(sourceId, {
      data,
      timestamp: Date.now()
    });

    return await ChannelCacheDB.save(sourceId, channels, sourceUrl, sourceName);
  },

  async getOrFetch(sourceId, fetchFn) {
    if (pendingRequests.has(sourceId)) {
      console.log(`[SmartCache] Aguardando requisição pendente para ${sourceId}`);
      return pendingRequests.get(sourceId);
    }

    const cached = await this.get(sourceId);
    if (cached) {
      return { data: cached, fromCache: true };
    }

    const promise = fetchFn().then(async (result) => {
      if (result.channels && result.source) {
        await this.set(
          result.source.id,
          result.data,
          result.channels,
          result.source.url,
          result.source.name
        );
      }
      pendingRequests.delete(sourceId);
      return { data: result, fromCache: false };
    }).catch((error) => {
      pendingRequests.delete(sourceId);
      throw error;
    });

    pendingRequests.set(sourceId, promise);
    return promise;
  },

  async getWithStaleWhileRevalidate(sourceId, refreshFn) {
    const cached = await this.get(sourceId);

    if (cached) {
      console.log(`[SmartCache] SWR - usando cache para ${sourceId}`);
      if (refreshFn) {
        refreshFn().catch(err => console.error(`[SmartCache] Erro no refresh:`, err));
      }
      return { data: cached, isStale: false };
    }

    if (refreshFn) {
      const freshData = await refreshFn();
      return { data: freshData, isStale: false };
    }

    return { data: null, isStale: false };
  },

  invalidate(sourceId) {
    MEMORY_CACHE.delete(sourceId);
    return ChannelCacheDB.delete(sourceId);
  },

  clearAll() {
    MEMORY_CACHE.clear();
    return ChannelCacheDB.clear();
  },

  async getStats() {
    const dbStats = await ChannelCacheDB.getCacheStats();
    return {
      ...dbStats,
      memoryCacheSize: MEMORY_CACHE.size,
      pendingRequests: pendingRequests.size
    };
  },

  getMemoryCacheKeys() {
    return Array.from(MEMORY_CACHE.keys());
  }
};

export default SmartCache;
