import { parseM3U } from '../utils/m3uParser';
import ChannelCacheDB from './ChannelCacheDB';

const PREFETCH_QUEUE = new Map();

const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

const TIMEOUT_MS = 30000;

const headers = {
  'User-Agent': 'VLC/3.0.18 NonoTV/4.2',
  'Accept': '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.9'
};

async function tryFetch(url) {
  try {
    const res = await fetch(url, {
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (res.ok) return await res.text();
    throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    throw e;
  }
}

async function tryProxies(url) {
  for (const proxy of PUBLIC_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const res = await fetch(proxyUrl, {
        headers,
        mode: 'cors',
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (res.ok) return await res.text();
    } catch {
      continue;
    }
  }
  throw new Error('Proxies failed');
}

async function fetchSource(source) {
  try {
    const content = await tryFetch(source.url);
    return { success: true, content, source };
  } catch {
    try {
      const content = await tryProxies(source.url);
      return { success: true, content, source };
    } catch (error) {
      return { success: false, source, error: error.message };
    }
  }
}

export const SourcePrefetchService = {
  async prefetchSource(source) {
    if (PREFETCH_QUEUE.has(source.id)) {
      return PREFETCH_QUEUE.get(source.id);
    }

    PREFETCH_QUEUE.set(source.id, { source, status: 'fetching' });

    try {
      const result = await fetchSource(source);

      if (result.success) {
        const channels = parseM3U(result.content);
        
        if (channels.length > 0) {
          await ChannelCacheDB.save(source.id, channels, source.url, source.name);
          PREFETCH_QUEUE.set(source.id, { source, status: 'cached', channels });
          console.log(`[Prefetch] ${source.name}: ${channels.length} canais`);
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
