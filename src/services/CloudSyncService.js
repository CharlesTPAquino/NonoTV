import { createClient } from '@supabase/supabase-js';

/**
 * Cloud Sync Service v5
 * Gerencia a sincronização de favoritos e histórico com Supabase
 * Fallback automático para localStorage se não configurado
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o cliente apenas se as chaves estiverem presentes
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://your-project-id.supabase.co')
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const STORAGE_KEYS = {
  CLOUD_SYNC: 'nono_cloud_sync',
  LAST_SYNC: 'nono_last_sync',
  DEVICE_ID: 'nono_device_id'
};

const getDeviceId = () => {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
};

export const CloudSyncService = {
  isEnabled() {
    return !!supabase;
  },

  /**
   * Sincroniza favoritos com a nuvem
   */
  async syncFavorites(favorites) {
    if (!this.isEnabled()) return null;

    try {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('nono_sync')
        .upsert({ 
          device_id: deviceId, 
          favorites: favorites,
          updated_at: new Date().toISOString()
        }, { onConflict: 'device_id' });

      if (error) throw error;
      
      this._updateLastSyncStatus('favorites', favorites.length);
      return data;
    } catch (error) {
      console.warn('[CloudSync] Erro ao sincronizar favoritos:', error.message);
      return null;
    }
  },

  /**
   * Sincroniza histórico com a nuvem
   */
  async syncHistory(history) {
    if (!this.isEnabled()) return null;

    try {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('nono_sync')
        .upsert({ 
          device_id: deviceId, 
          history: history,
          updated_at: new Date().toISOString()
        }, { onConflict: 'device_id' });

      if (error) throw error;
      
      this._updateLastSyncStatus('history', history.length);
      return data;
    } catch (error) {
      console.warn('[CloudSync] Erro ao sincronizar histórico:', error.message);
      return null;
    }
  },

  /**
   * Recupera dados da nuvem para o dispositivo atual
   */
  async fetchCloudData() {
    if (!this.isEnabled()) return null;

    try {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('nono_sync')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No rows found
      
      return data;
    } catch (error) {
      console.warn('[CloudSync] Erro ao buscar dados da nuvem:', error.message);
      return null;
    }
  },

  _updateLastSyncStatus(type, count) {
    const status = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '{}');
    status[type] = {
      count,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify(status));
  },

  getSyncStatus() {
    return {
      enabled: this.isEnabled(),
      deviceId: getDeviceId(),
      lastSync: JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '{}')
    };
  }
};

export default CloudSyncService;
