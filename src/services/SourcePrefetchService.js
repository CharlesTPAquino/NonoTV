import { CapacitorHttp } from '@capacitor/core';
import { parseM3U } from '../utils/m3uParser';
import ChannelCacheDB from './ChannelCacheDB';

const PREFETCH_QUEUE = new Map();

const headers = {
  'User-Agent': 'NonoTV/1.0',
  'Accept': '*/*'
};

async function fetchSource(source) {
  try {
    const res = await CapacitorHttp.get({
      url: source.url,
      headers,
      responseType: 'text',
      connectTimeout: 30000,
      readTimeout: 60000
    });

    if (res.status === 200) {
      return {
        success: true,
        content: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
        source
      };
    }
    return { success: false, source, error: `HTTP ${res.status}` };
  } catch (error) {
    return { success: false, source, error: error.message };
  }
}

export const SourcePrefetchService = {
  async prefetchSource(source) {
    if (PREFETCH_QUEUE.has(source.id)) {
      return null;
    }

    PREFETCH_QUEUE.set(source.id, { source, status: 'fetching' });

    try {
      const result = await fetchSource(source);

      if (result.success) {
        const channels = this.parseM3U(result.content, source.id);
        
        if (channels.length > 0) {
          await ChannelCacheDB.save(source.id, channels, source.url, source.name);
          PREFETCH_QUEUE.set(source.id, { source, status: 'cached', channels });
          console.log(`[SourcePrefetch] ${source.name} pré-carregado com ${channels.length} canais`);
          return { success: true, channels, source };
        }
      }

      PREFETCH_QUEUE.set(source.id, { source, status: 'failed', error: result.error });
      return { success: false, source, error: result.error };
    } catch (error) {
      PREFETCH_QUEUE.set(source.id, { source, status: 'failed', error: error.message });
      return { success: false, source, error: error.message };
    }
  },

  async prefetchMultiple(sources, maxConcurrent = 3) {
    const results = [];
    const queue = [...sources];

    while (queue.length > 0) {
      const batch = queue.splice(0, maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(s => this.prefetchSource(s))
      );
      results.push(...batchResults);
    }

    return results;
  },

  parseM3U(content, sourceId) {
    return parseM3U(content);
  },

  getPrefetchStatus(sourceId) {
    return PREFETCH_QUEUE.get(sourceId) || null;
  },

  getAllPrefetchStatus() {
    return Array.from(PREFETCH_QUEUE.entries()).map(([id, data]) => ({
      sourceId: id,
      ...data
    }));
  },

  clearQueue() {
    PREFETCH_QUEUE.clear();
  }
};

export default SourcePrefetchService;
