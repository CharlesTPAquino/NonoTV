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
  
  // Check Capacitor first
  if (window.Capacitor?.isNativePlatform?.()) {
    return true;
  }
  
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') {
    return true;
  }
  
  // Check for Android WebView
  if (typeof android !== 'undefined') {
    return true;
  }
  
  // Check user agent for mobile
  const ua = navigator?.userAgent || '';
  if (ua.includes('Android') || ua.includes('Mobile')) {
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
      connectTimeout: 15000,
      readTimeout: 30000
    });
    
    console.log('[APK] CapacitorHttp status:', res.status, 'data length:', res.data?.length);
    
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
    console.log('[APK] Modo nativo detectado - tentando múltiplas opções em paralelo');
    
    // Try all methods in parallel, return first success
    const results = await Promise.allSettled([
      tryCapacitorHttp(url),
      tryPublicProxy(url, 0, 1),
      tryDirectFetch(url)
    ]);
    
    // Find successful result
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'fulfilled' && results[i].value) {
        const methodNames = ['CapacitorHttp', 'PublicProxy', 'DirectFetch'];
        console.log(`[APK] Sucesso com método: ${methodNames[i]}`);
        return results[i].value;
      }
    }
    
    // All failed
    console.error('[APK] Todas as opções falharam!');
    const errors = results.map(r => r.reason?.message || 'Unknown error').join(', ');
    throw new Error(`Falha ao conectar: ${errors}`);
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
