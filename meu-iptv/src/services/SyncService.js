import { Capacitor } from '@capacitor/core';

/**
 * SyncService: Conexão com servidores IPTV
 * Implementação simplificada que funciona no Android
 */

export const fetchSource = async (url) => {
  console.log('[SyncService] Fetching:', url);

  const isNative = Capacitor.isNativePlatform();
  console.log('[SyncService] Platform:', isNative ? 'Android' : 'Web');

  // Timeout de 30 segundos
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'NonoTV/3.1'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      return await response.text();
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    clearTimeout(timeout);
    console.error('[SyncService] Error:', error.message);
    throw error;
  }
};

export default { fetchSource };