/**
 * Server Health Check Service
 * Testa automaticamente servidores IPTV e remove os.offline
 */

const HEALTH_CACHE_KEY = 'nono_server_health';
const TEST_TIMEOUT = 8000;

function getCachedHealth() {
  try {
    const cached = localStorage.getItem(HEALTH_CACHE_KEY);
    if (!cached) return {};
    const data = JSON.parse(cached);
    // Cache válido por 1 hora
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
    // Silent fail for localStorage
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

function getProxyUrl(targetUrl) {
  if (typeof window === 'undefined') return targetUrl;
  
  const isNative = !!(window.Capacitor?.isNativePlatform?.());
  const isDev = import.meta?.env?.DEV;
  
  // Em app nativo ou produção, usa URL direta
  if (isNative || !isDev) {
    return targetUrl;
  }
  
  // Em desenvolvimento, usa proxy local
  return `http://localhost:3131/?url=${encodeURIComponent(targetUrl)}`;
}

async function testServer(source) {
  const url = buildSourceUrl(source);
  const testUrl = getProxyUrl(url);
  
  console.log(`[HealthCheck] Testando ${source.name}: ${testUrl}`);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors'
    });
    
    if (response.ok || response.status === 302 || response.status === 0) {
      return { online: true, status: response.status || 200 };
    }
    
    return { online: false, status: response.status };
  } catch (error) {
    // Se falhar com proxy, tenta URL direta como fallback
    if (testUrl !== url) {
      console.log(`[HealthCheck] Proxy falhou, tentando URL direta: ${url}`);
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors'
        });
        
        return { online: true, status: 200 };
      } catch {
        // Fallback também falhou
      }
    }
    
    if (error.name === 'AbortError') {
      return { online: false, status: 'timeout' };
    }
    return { online: false, status: error.message };
  }
}

export async function testAllSources(sources, onProgress) {
  const results = {};
  const cached = getCachedHealth();
  
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    
    if (onProgress) {
      onProgress(i + 1, sources.length, source.name);
    }
    
    // Usar cache se disponível e recente
    if (cached[source.id]?.online && cached[source.id]?.testedAt) {
      const cacheAge = Date.now() - cached[source.id].testedAt;
      if (cacheAge < 3600000) { // 1 hora
        results[source.id] = cached[source.id];
        continue;
      }
    }
    
    const result = await testServer(source);
    results[source.id] = {
      ...result,
      testedAt: Date.now()
    };
    
    // Pequeno delay entre testes para não sobrecarregar
    await new Promise(r => setTimeout(r, 500));
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
  
  // Priorizar por priority se disponível
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
