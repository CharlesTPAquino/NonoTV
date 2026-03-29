/**
 * Server Health Check Service
 * Testa automaticamente servidores IPTV e remove os offline
 */

const HEALTH_CACHE_KEY = 'nono_server_health';
const TEST_TIMEOUT = 10000;

const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  
  if (window.Capacitor?.isNativePlatform?.()) {
    return true;
  }
  
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') {
    return true;
  }
  
  if (typeof android !== 'undefined') {
    return true;
  }
  
  return false;
}

function getCachedHealth() {
  try {
    const cached = localStorage.getItem(HEALTH_CACHE_KEY);
    if (!cached) return {};
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > 3600000) {
      return {};
    }
    return data.health || {};
  } catch {
    return {};
  }
}

function setCachedHealth(health) {
  try {
    localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
      health,
      timestamp: Date.now()
    }));
  } catch {
    // Silent fail
  }
}

export function buildSourceUrl(source) {
  if (source.username && source.password) {
    const baseUrl = source.url.replace(/\?.*$/, '');
    return `${baseUrl}?username=${source.username}&password=${source.password}&type=m3u_plus`;
  }
  if (source.mac) {
    return `${source.url}/${source.mac}/get.php?username=${source.mac.replace(/:/g, '')}&password=${source.mac.replace(/:/g, '')}&type=m3u_plus`;
  }
  return source.url;
}

async function tryFetchWithCapacitorHttp(url) {
  const { CapacitorHttp } = await import('@capacitor/core');
  
  try {
    const res = await CapacitorHttp.get({
      url,
      headers: {
        'User-Agent': 'VLC/3.0.18',
        'Accept': '*/*'
      },
      connectTimeout: TEST_TIMEOUT,
      readTimeout: TEST_TIMEOUT
    });
    
    if (res.status === 200) {
      return { success: true, data: res.data };
    }
    
    return { success: false, status: res.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function tryFetchWithProxy(url) {
  for (const proxy of PUBLIC_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const res = await fetch(proxyUrl, {
        headers: { 'User-Agent': 'VLC/3.0.18' },
        signal: AbortSignal.timeout(TEST_TIMEOUT)
      });
      
      if (res.ok) {
        return { success: true };
      }
    } catch {
      continue;
    }
  }
  return { success: false };
}

async function tryDirectFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VLC/3.0.18' },
      mode: 'cors',
      signal: AbortSignal.timeout(TEST_TIMEOUT)
    });
    
    if (res.ok) {
      return { success: true };
    }
    
    return { success: false, status: res.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testServer(source) {
  const url = buildSourceUrl(source);
  const isNative = isNativePlatform();
  
  console.log(`[HealthCheck] Testando ${source.name} (Native: ${isNative})`);
  console.log(`[HealthCheck] URL: ${url}`);
  
  if (isNative) {
    const result = await tryFetchWithCapacitorHttp(url);
    if (result.success) {
      console.log(`[HealthCheck] ${source.name}: ONLINE (CapacitorHttp)`);
      return { online: true, status: 200, method: 'capacitor' };
    }
    
    console.log(`[HealthCheck] CapacitorHttp falhou, tentando proxy...`);
    const proxyResult = await tryFetchWithProxy(url);
    if (proxyResult.success) {
      console.log(`[HealthCheck] ${source.name}: ONLINE (Proxy)`);
      return { online: true, status: 200, method: 'proxy' };
    }
    
    console.log(`[HealthCheck] ${source.name}: OFFLINE`);
    return { online: false, status: 'failed', method: 'native' };
  }
  
  const devUrl = window.location?.hostname === 'localhost';
  if (devUrl) {
    try {
      const res = await fetch(`http://localhost:3131/?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(TEST_TIMEOUT)
      });
      
      if (res.ok) {
        return { online: true, status: 200, method: 'dev-proxy' };
      }
    } catch {
      // Fall through
    }
  }
  
  const directResult = await tryDirectFetch(url);
  if (directResult.success) {
    return { online: true, status: 200, method: 'direct' };
  }
  
  const proxyResult = await tryFetchWithProxy(url);
  if (proxyResult.success) {
    return { online: true, status: 200, method: 'proxy' };
  }
  
  return { online: false, status: 'failed', method: 'none' };
}

export async function testAllSources(sources, onProgress) {
  const results = {};
  const cached = getCachedHealth();
  
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    
    if (onProgress) {
      onProgress(i + 1, sources.length, source.name);
    }
    
    if (cached[source.id]?.online && cached[source.id]?.testedAt) {
      const cacheAge = Date.now() - cached[source.id].testedAt;
      if (cacheAge < 3600000) {
        results[source.id] = cached[source.id];
        continue;
      }
    }
    
    const result = await testServer(source);
    results[source.id] = {
      ...result,
      testedAt: Date.now()
    };
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  setCachedHealth(results);
  return results;
}

export function getWorkingSources(sources, health) {
  return sources.filter(source => {
    const h = health[source.id];
    return h && h.online;
  });
}

export function getBestSource(sources, health) {
  const working = getWorkingSources(sources, health);
  if (working.length === 0) return null;
  
  return working.sort((a, b) => (a.priority || 999) - (b.priority || 999))[0];
}

export function clearHealthCache() {
  localStorage.removeItem(HEALTH_CACHE_KEY);
}

export default {
  testAllSources,
  getWorkingSources,
  getBestSource,
  clearHealthCache,
  buildSourceUrl
};
