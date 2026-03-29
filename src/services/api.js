const PROXY_URL = 'http://localhost:3131';

const PUBLIC_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

const headers = {
  'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
  'Accept': '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Connection': 'keep-alive'
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

async function tryPublicProxy(url, proxyIndex = 0) {
  if (proxyIndex >= PUBLIC_PROXIES.length) {
    throw new Error('Todos os proxies públicos falharam');
  }
  
  const proxy = PUBLIC_PROXIES[proxyIndex];
  console.log(`[API] Proxy ${proxyIndex + 1}/${PUBLIC_PROXIES.length}: ${proxy}`);
  
  try {
    const proxyUrl = proxy + encodeURIComponent(url);
    const response = await fetch(proxyUrl, {
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(10000)
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
  console.log('[API] Tentando fetch direto...');
  
  try {
    const res = await fetch(url, { 
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(10000)
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
  console.log('[API] syncSource:', url.substring(0, 40), '...');
  
  const IS_DEV = isDevMode();
  const IS_NATIVE = isNativePlatform();
  
  if (IS_DEV && !IS_NATIVE) {
    console.log('[DEV] Modo desenvolvimento');
    try {
      const proxyRes = await fetch(`${PROXY_URL}/?url=${encodeURIComponent(url)}`, { 
        headers,
        signal: AbortSignal.timeout(10000)
      });
      if (proxyRes.ok) return await proxyRes.text();
    } catch (e) {
      console.warn('[DEV] Proxy local falhou');
    }
  }
  
  console.log('[API] Tentando proxies públicos...');
  try {
    return await tryPublicProxy(url);
  } catch (proxyError) {
    console.warn('[API] Proxies falharam, tentando fetch direto...');
    try {
      return await tryDirectFetch(url);
    } catch {
      throw new Error('Falha ao conectar: nenhuma opção funcionou');
    }
  }
}

export default { syncSource };
