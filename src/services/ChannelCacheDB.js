const DB_NAME = 'NonoTVCache';
const DB_VERSION = 2;
const STORE_NAME = 'channels';

let dbInstance = null;

const CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_CACHED_SOURCES = 10;
const MAX_CHANNELS_PER_SOURCE = 2000;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'sourceId' });
        store.createIndex('lastAccess', 'lastAccess', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
      if (event.oldVersion < 2) {
        const db = event.target.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          const tx = event.currentTarget.transaction;
          const store = tx.objectStore(STORE_NAME);
          if (!store.indexNames.contains('cachedAt')) {
            store.createIndex('cachedAt', 'cachedAt', { unique: false });
          }
        }
      }
    };
  });
}

function isExpired(cachedAt) {
  return Date.now() - cachedAt > CACHE_TTL;
}

export const ChannelCacheDB = {
  async save(sourceId, channels, sourceUrl, sourceName) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const channelsToSave = channels.length > MAX_CHANNELS_PER_SOURCE
        ? channels.slice(0, MAX_CHANNELS_PER_SOURCE)
        : channels;

      const data = {
        sourceId,
        sourceUrl,
        sourceName,
        channels: channelsToSave,
        channelCount: channels.length,
        savedChannelCount: channelsToSave.length,
        lastAccess: Date.now(),
        cachedAt: Date.now()
      };

      store.put(data);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      await this.enforceMaxSources();

      const truncated = channels.length > MAX_CHANNELS_PER_SOURCE;
      console.log(`[CacheDB] Salvo ${channelsToSave.length}/${channels.length} canais para ${sourceName}${truncated ? ' (truncado)' : ''}`);
      return true;
    } catch (error) {
      console.error('[CacheDB] Erro ao salvar:', error);
      return false;
    }
  },

  async get(sourceId) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(sourceId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const data = request.result;
          if (data) {
            if (isExpired(data.cachedAt)) {
              console.log(`[CacheDB] Cache expirado para ${sourceId}, removendo...`);
              this.delete(sourceId);
              resolve(null);
              return;
            }
            data.lastAccess = Date.now();
            const updateTx = db.transaction(STORE_NAME, 'readwrite');
            updateTx.objectStore(STORE_NAME).put(data);
          }
          resolve(data || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[CacheDB] Erro ao buscar:', error);
      return null;
    }
  },

  async getWithStaleWhileRevalidate(sourceId, refreshFn) {
    const cached = await this.get(sourceId);

    if (cached) {
      console.log(`[CacheDB] Usando cache para ${sourceId} (${cached.channelCount} canais)`);
      if (refreshFn) {
        refreshFn().catch(err => console.error(`[CacheDB] Erro no refresh:`, err));
      }
      return { channels: cached.channels, source: cached, isStale: false };
    }

    if (refreshFn) {
      const freshData = await refreshFn();
      return { channels: freshData.channels, source: freshData.source, isStale: false };
    }

    return { channels: [], source: null, isStale: false };
  },

  async getAll() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('lastAccess');
      const request = index.openCursor(null, 'prev');

      const results = [];
      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const data = cursor.value;
            if (!isExpired(data.cachedAt)) {
              results.push(data);
            } else {
              this.delete(data.sourceId);
            }
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[CacheDB] Erro ao buscar todos:', error);
      return [];
    }
  },

  async delete(sourceId) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(sourceId);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      return true;
    } catch (error) {
      console.error('[CacheDB] Erro ao deletar:', error);
      return false;
    }
  },

  async clear() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      console.log('[CacheDB] Cache limpo');
      return true;
    } catch (error) {
      console.error('[CacheDB] Erro ao limpar:', error);
      return false;
    }
  },

  async getSize() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  },

  async getTotalChannels() {
    try {
      const all = await this.getAll();
      return all.reduce((sum, source) => sum + (source.channelCount || 0), 0);
    } catch {
      return 0;
    }
  },

  async enforceMaxSources() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('lastAccess');
      const request = index.openCursor(null, 'prev');

      const sources = [];
      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            sources.push(cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      if (sources.length > MAX_CACHED_SOURCES) {
        const toRemove = sources.slice(MAX_CACHED_SOURCES);
        const deleteTx = db.transaction(STORE_NAME, 'readwrite');
        const deleteStore = deleteTx.objectStore(STORE_NAME);
        for (const source of toRemove) {
          deleteStore.delete(source.sourceId);
        }
        await new Promise((resolve) => {
          deleteTx.oncomplete = resolve;
        });
        console.log(`[CacheDB] Removidos ${toRemove.length} caches antigos (limite: ${MAX_CACHED_SOURCES})`);
      }
    } catch (error) {
      console.error('[CacheDB] Erro ao limitar caches:', error);
    }
  },

  async getCacheStats() {
    try {
      const all = await this.getAll();
      const totalSources = all.length;
      const totalChannels = all.reduce((sum, s) => sum + (s.channelCount || 0), 0);
      const oldestCache = all.length > 0
        ? Math.min(...all.map(s => s.cachedAt))
        : null;
      const newestCache = all.length > 0
        ? Math.max(...all.map(s => s.cachedAt))
        : null;

      return {
        totalSources,
        totalChannels,
        oldestCache,
        newestCache,
        cacheHitRate: totalSources > 0 ? 'N/A' : '0%'
      };
    } catch {
      return { totalSources: 0, totalChannels: 0 };
    }
  }
};

export default ChannelCacheDB;
