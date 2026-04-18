const PROXY_URL = 'http://localhost:3131';

const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://r.jina.ai/http://'
];

const TIMEOUT_MS = 25000;
const PRIORITY_TIMEOUT = 45000;

const headers = {
  'User-Agent': 'NonoTV/4.2 (Android/Streaming)',
  'Accept': '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache'
};

function isDevMode() {
  return import.meta?.env?.DEV === true && window.location?.hostname === 'localhost';
}

function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') return true;
  if (typeof android !== 'undefined') return true;
  return false;
}

function getTimeoutForUrl(url) {
  if (url?.includes('americakg.xyz')) return PRIORITY_TIMEOUT;
  return TIMEOUT_MS;
}

function isPrioritySource(url) {
  return url?.includes('americakg.xyz');
}

function preconnectAggressive(url) {
  if (typeof document === 'undefined') return;
  try {
    const domain = new URL(url).origin;
    if (document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    console.log('[API] Preconnect ativo para:', domain);
  } catch (e) {}
}

async function tryPublicProxy(url, proxyIndex = 0) {
  if (proxyIndex >= PUBLIC_PROXIES.length) {
    throw new Error('All public proxies failed');
  }
  
  const proxy = PUBLIC_PROXIES[proxyIndex];
  const timeout = getTimeoutForUrl(url);
  console.log(`[API] Tentando proxy ${proxyIndex + 1}/${PUBLIC_PROXIES.length} (timeout: ${timeout}ms)`);
  
  preconnectAggressive(url);
  
  try {
    const proxyUrl = proxy + encodeURIComponent(url);
    const response = await fetch(proxyUrl, {
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(timeout),
      priority: isPrioritySource(url) ? 'high' : 'auto'
    });
    
    if (response.ok) {
      console.log(`[API] Sucesso via proxy ${proxyIndex + 1}`);
      return await response.text();
    }
    
    console.warn(`[API] Proxy ${proxyIndex + 1} falhou (${response.status})`);
    return await tryPublicProxy(url, proxyIndex + 1);
  } catch (error) {
    console.warn(`[API] Proxy ${proxyIndex + 1} erro: ${error.message}`);
    return await tryPublicProxy(url, proxyIndex + 1);
  }
}

async function tryDirectFetch(url) {
  const timeout = getTimeoutForUrl(url);
  console.log(`[API] Tentando fetch direto (timeout: ${timeout}ms)`);
  
  preconnectAggressive(url);
  
  try {
    const res = await fetch(url, { 
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(timeout),
      priority: isPrioritySource(url) ? 'high' : 'auto'
    });
    
    if (res.ok) {
      console.log('[API] Sucesso via fetch direto');
      return await res.text();
    }
    
    throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    console.error('[API] Fetch direto erro:', error.message);
    throw error;
  }
}

export async function syncSource(url) {
  console.log('[API] syncSource:', url?.substring(0, 60), '...');
  console.log('[API] isNative:', isNativePlatform(), 'isDev:', isDevMode());
  
  const IS_DEV = isDevMode();
  const IS_NATIVE = isNativePlatform();
  const IS_PRIORITY = isPrioritySource(url);
  
  if (IS_DEV && !IS_NATIVE) {
    console.log('[DEV] Tentando proxy local');
    try {
      const proxyRes = await fetch(`${PROXY_URL}/?url=${encodeURIComponent(url)}`, { 
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (proxyRes.ok) return await proxyRes.text();
    } catch (e) {
      console.warn('[DEV] Proxy local falhou');
    }
  }
  
  if (IS_NATIVE) {
    if (IS_PRIORITY) {
      console.log('[APK] AmerikaKG detectado: tentativa direta primeiro (sem proxy)');
      try {
        return await tryDirectFetch(url);
      } catch {
        console.log('[APK] AmerikaKG direto falhou, tentando público...');
        try {
          return await tryPublicProxy(url);
        } catch {
          throw new Error('AmerikaKG indisponível');
        }
      }
    }
    
    console.log('[APK] Modo nativo: tentando fetch direto primeiro');
    try {
      return await tryDirectFetch(url);
    } catch {
      console.log('[APK] Fetch falhou, tentando proxies públicos');
      try {
        return await tryPublicProxy(url);
      } catch {
        throw new Error('Nenhuma opção funcionou');
      }
    }
  }
  
  console.log('[WEB] Modo web: tentando fetch direto primeiro (sem proxy)');
  try {
    return await tryDirectFetch(url);
  } catch {
    console.log('[WEB] Proxies falharam, tentando público...');
    try {
      return await tryPublicProxy(url);
    } catch {
      throw new Error('Falha ao conectar');
    }
  }
}

export default { syncSource };
