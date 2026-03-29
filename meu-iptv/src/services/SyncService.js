import { CapacitorHttp } from '@capacitor/core';

const FETCH_TIMEOUT = 15000;

const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') return true;
  if (typeof android !== 'undefined') return true;
  return false;
}

async function tryPublicProxy(url, proxyIndex = 0) {
  if (proxyIndex >= PUBLIC_PROXIES.length) {
    throw new Error('All public proxies failed');
  }
  
  const proxy = PUBLIC_PROXIES[proxyIndex];
  try {
    const proxyUrl = proxy + encodeURIComponent(url);
    const response = await fetch(proxyUrl, {
      headers: { 'User-Agent': 'NonoTV/3.0', 'Accept': '*/*' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT)
    });
    
    if (response.ok) {
      return await response.text();
    }
    return await tryPublicProxy(url, proxyIndex + 1);
  } catch {
    return await tryPublicProxy(url, proxyIndex + 1);
  }
}

async function tryCapacitorHttp(url) {
  const res = await CapacitorHttp.get({
    url,
    headers: {
      'User-Agent': 'NonoTV/3.0',
      'Accept': '*/*'
    },
    responseType: 'text',
    connectTimeout: FETCH_TIMEOUT,
    readTimeout: FETCH_TIMEOUT
  });
  
  if (res.status === 200) {
    return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  }
  throw new Error(`HTTP ${res.status}`);
}

export const fetchSource = async (url) => {
  console.log('[SyncService] fetchSource chamada para:', url);
  
  const IS_NATIVE = isNativePlatform();
  
  if (IS_NATIVE) {
    console.log('[SyncService] Modo nativo detectado');
    
    try {
      const result = await tryCapacitorHttp(url);
      console.log('[SyncService] CapacitorHttp funcionou!');
      return result;
    } catch (capacitorError) {
      console.warn('[SyncService] CapacitorHttp falhou:', capacitorError.message);
      
      try {
        return await tryPublicProxy(url);
      } catch {
        try {
          const directRes = await fetch(url, {
            headers: { 'User-Agent': 'NonoTV/3.0' },
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
          });
          if (directRes.ok) return await directRes.text();
        } catch {}
        
        throw new Error(`Falha ao conectar: ${capacitorError.message}`);
      }
    }
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'NonoTV/3.0'
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT)
    });

    if (response.ok) {
      return await response.text();
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout - servidor não respondeu');
    }
    
    console.warn('[SyncService] Fetch direto falhou, tentando proxies...');
    return await tryPublicProxy(url);
  }
};

export default { fetchSource };
