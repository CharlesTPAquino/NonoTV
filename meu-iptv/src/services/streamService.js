import { Capacitor, CapacitorHttp } from '@capacitor/core';

const PROXY_URL = 'http://localhost:3131';

/**
 * NonoTV Stream Service - Unified Streaming Layer
 * Handles: Live TV (HLS), VOD (MP4), Series with intelligent codec detection
 */

const STREAM_CONFIG = {
  live: {
    timeout: 30000,
    retries: 3,
    headers: {
      'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'Connection': 'keep-alive'
    }
  },
  vod: {
    timeout: 60000,
    retries: 2,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'video/*,*/*',
      'Range': 'bytes=0-'
    }
  }
};

/**
 * Detecta o tipo de stream baseado na URL e metadata
 */
export function detectStreamType(url, groupTitle = '', channelName = '') {
  if (!url) return 'live';
  
  const lower = url.toLowerCase();
  const path = lower.split('?')[0];
  const group = (groupTitle || '').toUpperCase();
  const name = (channelName || '').toUpperCase();

  // Prioridade 1: group-title indica VOD (antes da extensão)
  if (group.includes('FILME') || group.includes('VOD') || group.includes('CINEMA')) {
    return 'movie';
  }

  // Prioridade 2: group-title indica Série
  if (group.includes('SERIE') || group.includes('SÉRIE')) {
    return 'series';
  }
  
  // Prioridade 3: Nome do canal indica Série
  if (name.includes('EPISODIO') || name.includes('EPISÓDIO') || name.includes('EP ') || /S\d{1,2}/.test(name)) {
    return 'series';
  }

  // Prioridade 4: Extensão de arquivo direta (VOD) - só se não tiver grupo definido
  if (!group && /\.(mp4|mkv|avi|mov|m4v|webm|flv)(\?|$)/i.test(path)) {
    return 'movie';
  }

  // Prioridade 5: URL pattern para series
  if (path.includes('/series/') || path.includes('/episodes/') || path.includes('/episodio/')) {
    return 'series';
  }

  // Prioridade 6: URL pattern para movies
  if (path.includes('/movie/') || path.includes('/filme/') || path.includes('/vod/')) {
    return 'movie';
  }

  // Default: Live TV (HLS)
  return 'live';
}

/**
 * Detecta o codec mais eficiente para o stream
 */
export function detectCodec(url, type) {
  const lower = url.toLowerCase();
  
  if (type === 'movie') {
    if (lower.includes('.mp4') || lower.includes('mime=video/mp4')) {
      return { codec: 'h264', container: 'mp4', native: true };
    }
    if (lower.includes('.mkv')) {
      return { codec: 'hevc', container: 'mkv', native: false };
    }
  }

  // HLS streams
  return { codec: 'hls', container: 'm3u8', native: false };
}

/**
 * Busca o conteúdo M3U da fonte
 */
export async function fetchSource(url) {
  const isNative = Capacitor.isNativePlatform();
  const config = STREAM_CONFIG.live;

  try {
    if (isNative) {
      console.log('[StreamService] Modo nativo:', url.substring(0, 50) + '...');
      
      const response = await CapacitorHttp.get({
        url,
        headers: config.headers,
        connectTimeout: config.timeout,
        readTimeout: config.timeout
      });
      
      if (response.status !== 200) {
        throw new Error(`Servidor retornou status ${response.status}`);
      }
      
      return response.data;
    }

    // Web mode with proxy
    if (import.meta.env.DEV) {
      try {
        const proxyRes = await fetch(`${PROXY_URL}/${encodeURIComponent(url)}`, {
          headers: config.headers
        });
        if (proxyRes.ok) return await proxyRes.text();
      } catch (e) {
        console.warn('[StreamService] Proxy offline, tentando direto...');
      }
    }

    // Direct fallback
    const directRes = await fetch(url, { headers: config.headers });
    if (!directRes.ok) throw new Error(`HTTP ${directRes.status}`);
    return await directRes.text();

  } catch (error) {
    console.error('[StreamService] Erro:', error.message);
    throw new Error(
      error.message.includes('Failed to fetch') 
        ? 'Conexão recusada (Sem Internet ou Bloqueio de IP)'
        : error.message
    );
  }
}

/**
 * Valida se uma URL de stream está acessível
 */
export async function validateStreamUrl(url, type = 'live') {
  const config = STREAM_CONFIG[type] || STREAM_CONFIG.live;
  const isNative = Capacitor.isNativePlatform();

  try {
    if (isNative) {
      const response = await CapacitorHttp.get({
        url,
        headers: config.headers,
        connectTimeout: 10000,
        readTimeout: 10000
      });
      return response.status >= 200 && response.status < 400;
    }

    const res = await fetch(url, { 
      method: 'HEAD',
      headers: config.headers
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Prepara a URL do stream com headers corretos
 */
export function prepareStreamUrl(url, type = 'live') {
  const config = STREAM_CONFIG[type] || STREAM_CONFIG.live;
  
  // Para streams HLS, adiciona headers via proxy se necessário
  if (type === 'live' && !url.startsWith('http')) {
    return url;
  }

  return url;
}

export default {
  fetchSource,
  detectStreamType,
  detectCodec,
  validateStreamUrl,
  prepareStreamUrl,
  STREAM_CONFIG
};