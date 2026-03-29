import { CapacitorHttp } from '@capacitor/core';

const PROXY_URL = 'http://localhost:3131';

const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

const headers = {
  'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
  'Accept': '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Connection': 'keep-alive'
};

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

function isDevMode() {
  return import.meta?.env?.DEV === true && window.location?.hostname === 'localhost';
}

async function tryPublicProxy(url, proxyIndex = 0, maxRetries = 2) {
  if (proxyIndex >= PUBLIC_PROXIES.length || proxyIndex >= maxRetries) {
    throw new Error('All public proxies failed');
  }
  
  const proxy = PUBLIC_PROXIES[proxyIndex];
  console.log(`[API] Tentando proxy público ${proxyIndex + 1}: ${proxy}`);
  
  try {
    const proxyUrl = proxy + encodeURIComponent(url);
    const response = await fetch(proxyUrl, {
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(15000)
    });
    
    if (response.ok) {
      console.log(`[API] Proxy público ${proxyIndex + 1} funcionou!`);
      return await response.text();
    }
    
    console.warn(`[API] Proxy público ${proxyIndex + 1} falhou com status ${response.status}`);
    return await tryPublicProxy(url, proxyIndex + 1, maxRetries);
  } catch (error) {
    console.warn(`[API] Proxy público ${proxyIndex + 1} erro:`, error.message);
    return await tryPublicProxy(url, proxyIndex + 1, maxRetries);
  }
}

async function tryCapacitorHttp(url) {
  console.log('[APK] Tentando CapacitorHttp para:', url);
  
  try {
    const res = await CapacitorHttp.get({ 
      url, 
      headers,
      responseType: 'text',
      connectTimeout: 60000,
      readTimeout: 60000
    });
    
    console.log('[APK] CapacitorHttp status:', res.status);
    
    if (res.status === 200) {
      return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    }
    
    throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    console.error('[APK] CapacitorHttp erro:', error.message);
    throw error;
  }
}

async function tryDirectFetch(url) {
  console.log('[API] Tentando fetch direto para:', url);
  
  try {
    const res = await fetch(url, { 
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(30000)
    });
    
    if (res.ok) {
      return await res.text();
    }
    
    throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    console.error('[API] Fetch direto erro:', error.message);
    throw error;
  }
}

export async function syncSource(url) {
  console.log('[API] syncSource chamada para:', url);
  console.log('[API] isNativePlatform():', isNativePlatform());
  console.log('[API] isDevMode():', isDevMode());
  
  const IS_NATIVE = isNativePlatform();
  const IS_DEV = isDevMode();
  
  if (IS_DEV && !IS_NATIVE) {
    console.log('[DEV] Modo desenvolvimento detectado - usando proxy local');
    try {
      const proxyRes = await fetch(`${PROXY_URL}/?url=${encodeURIComponent(url)}`, { 
        headers,
        signal: AbortSignal.timeout(15000)
      });
      
      if (proxyRes.ok) {
        console.log('[DEV] Proxy local funcionou!');
        return await proxyRes.text();
      }
      
      console.warn('[DEV] Proxy local falhou, tentando fallback...');
    } catch (e) {
      console.warn('[DEV] Proxy local erro:', e.message);
    }
    
    try {
      console.log('[DEV] Tentando fetch direto...');
      return await tryDirectFetch(url);
    } catch {
      console.log('[DEV] Tentando proxies públicos...');
      return await tryPublicProxy(url, 0, 2);
    }
  }
  
  if (IS_NATIVE) {
    console.log('[APK] Modo nativo detectado');
    
    try {
      const result = await tryCapacitorHttp(url);
      console.log('[APK] CapacitorHttp funcionou!');
      return result;
    } catch (capacitorError) {
      console.warn('[APK] CapacitorHttp falhou:', capacitorError.message);
      console.log('[APK] Tentando proxies públicos como fallback...');
      
      try {
        return await tryPublicProxy(url, 0, 2);
      } catch (proxyError) {
        console.warn('[APK] Proxies públicos falharam:', proxyError.message);
        console.log('[APK] Tentando fetch nativo direto...');
        
        try {
          return await tryDirectFetch(url);
        } catch (directError) {
          console.error('[APK] Todas as opções falharam!');
          throw new Error(`Falha ao conectar: ${capacitorError.message}`);
        }
      }
    }
  }
  
  console.log('[WEB] Modo produção web detectado');
  try {
    return await tryDirectFetch(url);
  } catch {
    console.log('[WEB] Fetch direto falhou, tentando proxies públicos...');
    return await tryPublicProxy(url, 0, 2);
  }
}

export default { syncSource };
