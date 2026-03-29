/**
 * Cloud Sync Service
 * Sincroniza favoritos e histórico entre dispositivos
 * 
 * Implementação atual: Exporta/importa JSON localmente
 * Futuro: Integrar com Firebase/Supabase
 */

const STORAGE_KEYS = {
  CLOUD_SYNC: 'nono_cloud_sync',
  LAST_SYNC: 'nono_last_sync'
};

const generateDeviceId = () => {
  let deviceId = localStorage.getItem('nono_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nono_device_id', deviceId);
  }
  return deviceId;
};

const generateSyncCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const CloudSyncService = {
  getDeviceId() {
    return generateDeviceId();
  },

  getLastSync() {
    try {
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? JSON.parse(lastSync) : null;
    } catch {
      return null;
    }
  },

  exportData(favorites, history, channels) {
    const data = {
      version: '1.0',
      deviceId: generateDeviceId(),
      exportedAt: Date.now(),
      favorites: favorites || [],
      history: (history || []).map(h => ({
        ...h,
        lastWatched: h.lastWatched || h.addedAt
      })).slice(0, 50),
      channels: (channels || []).slice(0, 100).map(c => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        group: c.group,
        url: c.url
      }))
    };

    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify({
      exportedAt: data.exportedAt,
      favoritesCount: data.favorites.length,
      historyCount: data.history.length
    }));

    return data;
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.version || !data.favorites) {
        throw new Error('Formato inválido');
      }

      const result = {
        success: true,
        importedAt: Date.now(),
        favoritesCount: data.favorites.length,
        historyCount: data.history?.length || 0
      };

      localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify(result));

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  getStoredData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLOUD_SYNC);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  mergeData(localFavorites, localHistory, cloudData) {
    const merged = {
      favorites: [],
      history: []
    };

    const existingFavorites = new Set(localFavorites.map(f => f.id || f.url));
    
    if (cloudData?.favorites) {
      cloudData.favorites.forEach(fav => {
        if (!existingFavorites.has(fav.id || fav.url)) {
          merged.favorites.push(fav);
        }
      });
    }
    merged.favorites = [...localFavorites, ...merged.favorites];

    const existingHistory = new Set(localHistory.map(h => h.id || h.url));
    
    if (cloudData?.history) {
      cloudData.history.forEach(hist => {
        if (!existingHistory.has(hist.id || hist.url)) {
          merged.history.push(hist);
        }
      });
    }
    
    merged.history = [...localHistory, ...merged.history]
      .sort((a, b) => (b.lastWatched || b.addedAt || 0) - (a.lastWatched || a.addedAt || 0))
      .slice(0, 50);

    return merged;
  },

  clearCloudData() {
    localStorage.removeItem(STORAGE_KEYS.CLOUD_SYNC);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  },

  getSyncStatus() {
    const lastSync = this.getLastSync();
    const cloudData = this.getStoredData();
    
    return {
      hasCloudData: !!cloudData,
      lastSync: lastSync,
      deviceId: generateDeviceId()
    };
  },

  createShareableLink(data) {
    const exported = this.exportData(data.favorites, data.history, data.channels);
    const encoded = btoa(JSON.stringify(exported));
    return {
      code: generateSyncCode(),
      data: encoded,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
  }
};

export default CloudSyncService;
