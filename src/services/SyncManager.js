const STORAGE_KEYS = {
  FAVORITES: 'nono_favorites',
  HISTORY: 'nono_history',
  SETTINGS: 'nono_settings',
  SOURCE_HEALTH: 'nono_source_health',
  FALLBACK_ORDER: 'nono_fallback_order',
  CACHE_CONFIG: 'nono_cache_config'
};

const DEFAULT_CACHE_CONFIG = {
  channels: 60 * 60 * 1000,
  epg: 60 * 60 * 1000,
  sources: 24 * 60 * 60 * 1000
};

import { parseM3U } from '../utils/m3uParser';
import { CloudSyncService } from './CloudSyncService';

export const SyncManager = {
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch {
      return [];
    }
  },

  addFavorite(channel) {
    const favorites = this.getFavorites();
    const exists = favorites.find(f => f.id === channel.id || f.url === channel.url);
    if (!exists) {
      favorites.push({
        id: channel.id,
        name: channel.name,
        url: channel.url,
        logo: channel.logo,
        group: channel.group,
        type: channel.type,
        addedAt: Date.now()
      });
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      
      // Sincronização em nuvem assíncrona
      CloudSyncService.syncFavorites(favorites).catch(err => 
        console.warn('[SyncManager] Falha no sync cloud de favoritos:', err)
      );
    }
    return favorites;
  },

  removeFavorite(channelId) {
    const favorites = this.getFavorites().filter(f => f.id !== channelId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    
    // Sincronização em nuvem assíncrona
    CloudSyncService.syncFavorites(favorites).catch(err => 
      console.warn('[SyncManager] Falha no sync cloud de favoritos:', err)
    );
    
    return favorites;
  },

  isFavorite(channelId) {
    return this.getFavorites().some(f => f.id === channelId);
  },

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    } catch {
      return [];
    }
  },

  addToHistory(channel, watchTime = 0) {
    const history = this.getHistory();
    const existing = history.find(h => h.id === channel.id);
    
    if (existing) {
      existing.lastWatched = Date.now();
      existing.watchTime = watchTime;
      existing.playCount = (existing.playCount || 0) + 1;
    } else {
      history.unshift({
        id: channel.id,
        name: channel.name,
        url: channel.url,
        logo: channel.logo,
        group: channel.group,
        type: channel.type,
        lastWatched: Date.now(),
        watchTime,
        playCount: 1
      });
    }
    
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    
    // Sincronização em nuvem assíncrona (com debounce implícito pela frequência de chamadas)
    CloudSyncService.syncHistory(trimmed).catch(err => 
      console.warn('[SyncManager] Falha no sync cloud de histórico:', err)
    );
    
    return trimmed;
  },

  clearHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    
    // Limpa na nuvem também
    CloudSyncService.syncHistory([]).catch(err => 
      console.warn('[SyncManager] Falha ao limpar histórico na nuvem:', err)
    );
    
    return [];
  },

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  },

  getDefaultSettings() {
    return {
      autoSync: false,
      syncInterval: 30 * 60 * 1000,
      cacheTTL: DEFAULT_CACHE_CONFIG,
      preferHD: true,
      autoFallback: true,
      maxRetries: 3,
      retryDelay: 1000,
      enablePrefetch: true,
      prefetchNext: true
    };
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  getSourceHealth() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SOURCE_HEALTH)) || {};
    } catch {
      return {};
    }
  },

  saveSourceHealth(healthData) {
    localStorage.setItem(STORAGE_KEYS.SOURCE_HEALTH, JSON.stringify(healthData));
  },

  updateSourceHealth(sourceId, health) {
    const healthData = this.getSourceHealth();
    healthData[sourceId] = {
      ...healthData[sourceId],
      ...health,
      lastChecked: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.SOURCE_HEALTH, JSON.stringify(healthData));
    return healthData;
  },

  getSourceFailures(sourceId) {
    const healthData = this.getSourceHealth();
    return healthData[sourceId]?.failures || 0;
  },

  incrementSourceFailure(sourceId) {
    const healthData = this.getSourceHealth();
    if (!healthData[sourceId]) {
      healthData[sourceId] = { failures: 0, lastChecked: Date.now() };
    }
    healthData[sourceId].failures = (healthData[sourceId].failures || 0) + 1;
    healthData[sourceId].lastChecked = Date.now();
    localStorage.setItem(STORAGE_KEYS.SOURCE_HEALTH, JSON.stringify(healthData));
    return healthData[sourceId].failures;
  },

  resetSourceHealth(sourceId) {
    const healthData = this.getSourceHealth();
    if (healthData[sourceId]) {
      healthData[sourceId].failures = 0;
      healthData[sourceId].lastChecked = Date.now();
      localStorage.setItem(STORAGE_KEYS.SOURCE_HEALTH, JSON.stringify(healthData));
    }
  },

  isSourceBlocked(sourceId) {
    const healthData = this.getSourceHealth();
    const source = healthData[sourceId];
    if (!source?.blockedUntil) return false;
    return Date.now() < source.blockedUntil;
  },

  blockSource(sourceId, durationMs = 5 * 60 * 1000) {
    const healthData = this.getSourceHealth();
    healthData[sourceId] = {
      ...healthData[sourceId],
      blockedUntil: Date.now() + durationMs,
      lastChecked: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.SOURCE_HEALTH, JSON.stringify(healthData));
  },

  unblockSource(sourceId) {
    const healthData = this.getSourceHealth();
    if (healthData[sourceId]) {
      delete healthData[sourceId].blockedUntil;
      localStorage.setItem(STORAGE_KEYS.SOURCE_HEALTH, JSON.stringify(healthData));
    }
  },

  unblockAllSources() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SOURCE_HEALTH);
      console.log('[SyncManager] Todas as fontes foram desbloqueadas');
      return true;
    } catch (e) {
      console.error('[SyncManager] Erro ao desbloquear fontes:', e);
      return false;
    }
  },

  getFallbackOrder() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FALLBACK_ORDER)) || [];
    } catch {
      return [];
    }
  },

  setFallbackOrder(order) {
    localStorage.setItem(STORAGE_KEYS.FALLBACK_ORDER, JSON.stringify(order));
  },

  getCacheConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHE_CONFIG)) || DEFAULT_CACHE_CONFIG;
    } catch {
      return DEFAULT_CACHE_CONFIG;
    }
  },

  updateCacheConfig(config) {
    const current = this.getCacheConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.CACHE_CONFIG, JSON.stringify(updated));
    return updated;
  },

  exportData() {
    return {
      favorites: this.getFavorites(),
      history: this.getHistory(),
      settings: this.getSettings(),
      exportedAt: Date.now()
    };
  },

  importData(data) {
    if (data.favorites) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
    }
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    return true;
  },

  exportToM3U(channels) {
    let m3u = '#EXTM3U\n';
    channels.forEach(ch => {
      m3u += `#EXTINF:-1 tvg-name="${ch.name}" tvg-logo="${ch.logo || ''}" group-title="${ch.group || ''}",${ch.name}\n`;
      m3u += `${ch.url}\n`;
    });
    return m3u;
  },

  parseM3U(content) {
    return parseM3U(content);
  }
};

export default SyncManager;
