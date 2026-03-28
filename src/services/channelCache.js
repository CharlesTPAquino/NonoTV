const DB_NAME = 'nonotv_cache';
const DB_VERSION = 1;
const STORE_NAME = 'channels';
const SOURCE_STORE = 'sources';

let db = null;

export async function initDB() {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const channelStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        channelStore.createIndex('group', 'group', { unique: false });
        channelStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!database.objectStoreNames.contains(SOURCE_STORE)) {
        database.createObjectStore(SOURCE_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function cacheChannels(sourceId, channels) {
  try {
    await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await store.clear();
    
    const channelData = channels.map((ch, index) => ({
      ...ch,
      id: ch.id || `ch_${index}`,
      cachedAt: Date.now()
    }));
    
    for (const channel of channelData) {
      store.put(channel);
    }
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    
    console.log(`[Cache] Armazenados ${channels.length} canais para ${sourceId}`);
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao cachear canais:', error);
    return false;
  }
}

export async function getCachedChannels(sourceId) {
  try {
    await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const channels = request.result;
        if (channels.length > 0) {
          console.log(`[Cache] Carregados ${channels.length} canais do cache`);
        }
        resolve(channels);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Cache] Erro ao buscar canais:', error);
    return [];
  }
}

export async function cacheSource(source) {
  try {
    await initDB();
    
    const tx = db.transaction(SOURCE_STORE, 'readwrite');
    const store = tx.objectStore(SOURCE_STORE);
    
    await store.put({
      ...source,
      cachedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao cachear fonte:', error);
    return false;
  }
}

export async function getCachedSource(sourceId) {
  try {
    await initDB();
    
    const tx = db.transaction(SOURCE_STORE, 'readonly');
    const store = tx.objectStore(SOURCE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(sourceId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Cache] Erro ao buscar fonte:', error);
    return null;
  }
}

export async function getAllCachedSources() {
  try {
    await initDB();
    
    const tx = db.transaction(SOURCE_STORE, 'readonly');
    const store = tx.objectStore(SOURCE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Cache] Erro ao buscar fontes:', error);
    return [];
  }
}

export async function clearCache() {
  try {
    await initDB();
    
    const tx = db.transaction([STORE_NAME, SOURCE_STORE], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(SOURCE_STORE).clear();
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    
    console.log('[Cache] Cache limpo');
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao limpar cache:', error);
    return false;
  }
}

export async function getCacheSize() {
  try {
    await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    return 0;
  }
}
