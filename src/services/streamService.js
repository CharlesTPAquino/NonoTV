/**
 * NonoTV Stream Service - Unified Streaming Layer
 * Handles: Live TV (HLS), VOD (MP4), Series with intelligent codec detection
 */

const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

const PROXY_URL = 'http://localhost:3131';

const STREAM_TIMEOUT = 20000; // 20s para resiliência máxima (padrão v8.6)

const STREAM_CONFIG = {
  live: {
    timeout: 25000,
    retries: 3,
    headers: {
      'User-Agent': 'VLC/3.0.18 NonoTV/4.2',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'Connection': 'keep-alive'
    }
  },
  vod: {
    timeout: 30000,
    retries: 2,
    headers: {
      'User-Agent': 'VLC/3.0.18 NonoTV/4.2',
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
  const group = (groupTitle || '').toLowerCase();
  const name = (channelName || '').toLowerCase();

  if (group.includes('serie') || group.includes('série') || group.includes('episodio') || group.includes('episódio')) {
    return 'series';
  }
  
  if (name.includes('serie') || name.includes('série') || name.includes('episodio') || name.includes('episódio') || name.includes('temporada') || /s\d{2}e\d{2}/i.test(name)) {
    return 'series';
  }
  
  if (path.includes('/series/') || path.includes('/episodes/') || path.includes('/episodio/') || path.includes('/temporada/')) {
    return 'series';
  }

  if (group.includes('filme') || group.includes('vod') || group.includes('cinema') || group.includes('movie')) {
    return 'movie';
  }
  
  if (name.includes('filme') || /\.(mp4|mkv|avi|mov|m4v|webm|flv)$/i.test(path)) {
    return 'movie';
  }

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
 * Busca o conteúdo M3U da fonte com lógica sequencial resiliente
 */
export async function fetchSource(url) {
  const isNative = isNativePlatform();
  const config = STREAM_CONFIG.live;

  // Função para tentar fetch direto
  async function tryDirect() {
    const res = await fetch(url, { 
      headers: config.headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  // Função para tentar proxies
  async function tryProxies() {
    for (const proxy of PUBLIC_PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const res = await fetch(proxyUrl, {
          headers: config.headers
        });
        if (res.ok) return await res.text();
      } catch {
        continue;
      }
    }
    throw new Error('Proxies failed');
  }

  try {
    if (isNative) {
      // APK (CapacitorHttp): Direto primeiro, depois proxies (Fallback Estável)
      try {
        return await tryDirect();
      } catch {
        return await tryProxies();
      }
    }


    // Web mode
    if (import.meta.env.DEV) {
      try {
        const proxyRes = await fetch(`${PROXY_URL}/?url=${encodeURIComponent(url)}`, {
          headers: config.headers
        });
        if (proxyRes.ok) return await proxyRes.text();
      } catch (e) {
        console.warn('[StreamService] Proxy local falhou');
      }
    }

    // Web: proxies primeiro, depois direto
    try {
      return await tryProxies();
    } catch {
      return await tryDirect();
    }

  } catch (error) {
    console.error('[StreamService] Erro:', error.message);
    throw new Error(
      error.message.includes('Failed to fetch') 
        ? 'Conexão recusada (Sem Internet ou Bloqueio de IP)'
        : error.message
    );
  }
}

function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') return true;
  if (typeof android !== 'undefined') return true;
  return false;
}

/**
 * Valida se uma URL de stream está acessível
 */
export async function validateStreamUrl(url, type = 'live') {
  const config = STREAM_CONFIG[type] || STREAM_CONFIG.live;

  try {
    const res = await fetch(url, { 
      method: 'HEAD',
      headers: config.headers
    });
    return res.ok;
  } catch {
    // Try proxy
    try {
      const proxyUrl = PUBLIC_PROXIES[0] + encodeURIComponent(url);
      const res = await fetch(proxyUrl, {
        method: 'HEAD'
      });
      return res.ok;
    } catch {
      return false;
    }
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