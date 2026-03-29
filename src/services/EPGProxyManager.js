import { CapacitorHttp } from '@capacitor/core';

const LOCAL_PROXY = 'http://localhost:3131';

const PUBLIC_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://corsanywhere.herokuapp.com/',
  'https://proxy.corsfix.xyz/?',
];

const OWN_PROXY = import.meta.env.VITE_EPG_PROXY_URL || null;

export const EPG_PROXY_CONFIG = {
  LOCAL_PROXY,
  PUBLIC_PROXIES,
  OWN_PROXY,
  MAX_RETRIES: 3,
  TIMEOUT: 15000,
};

export function getProxyList() {
  const proxies = [];
  
  if (LOCAL_PROXY) {
    proxies.push({ url: LOCAL_PROXY, type: 'local', priority: 1 });
  }
  
  if (OWN_PROXY) {
    proxies.push({ url: OWN_PROXY, type: 'own', priority: 2 });
  }
  
  PUBLIC_PROXIES.forEach((url, idx) => {
    proxies.push({ url, type: 'public', priority: 3 + idx });
  });
  
  return proxies.sort((a, b) => a.priority - b.priority);
}

export async function fetchWithProxyRotation(url, options = {}) {
  const { 
    maxRetries = EPG_PROXY_CONFIG.MAX_RETRIES,
    timeout = EPG_PROXY_CONFIG.TIMEOUT,
    onAttempt,
    onSuccess,
    onError
  } = options;
  
  const proxies = getProxyList();
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries * proxies.length; attempt++) {
    const proxyIndex = Math.floor(attempt / maxRetries);
    const proxy = proxies[proxyIndex];
    
    if (!proxy) break;
    
    const retryCount = attempt % maxRetries;
    
    if (onAttempt) {
      onAttempt({ 
        proxy, 
        attempt: attempt + 1, 
        retryCount,
        url: url.substring(0, 50) + '...'
      });
    }
    
    try {
      const fullUrl = buildProxyUrl(proxy.url, url);
      const result = await fetchWithTimeout(fullUrl, timeout);
      
      if (onSuccess) {
        onSuccess({ proxy, attempt: attempt + 1 });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.log(`[EPGProxy] Failed (${proxy.type}): ${error.message}`);
      
      if (onError) {
        onError({ proxy, error, attempt: attempt + 1 });
      }
    }
  }
  
  throw new Error(`All proxies failed. Last error: ${lastError?.message}`);
}

function buildProxyUrl(proxyUrl, targetUrl) {
  if (proxyUrl.includes('localhost') || proxyUrl.includes('127.0.0.1')) {
    return `${proxyUrl}/?url=${encodeURIComponent(targetUrl)}`;
  }
  
  if (proxyUrl.includes('allorigins')) {
    return `${proxyUrl}${encodeURIComponent(targetUrl)}`;
  }
  
  if (proxyUrl.includes('corsproxy.io') || proxyUrl.includes('proxy.corsfix')) {
    return `${proxyUrl}${encodeURIComponent(targetUrl)}`;
  }
  
  if (proxyUrl.includes('corsanywhere')) {
    return `${proxyUrl}${encodeURIComponent(targetUrl)}`;
  }
  
  return `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;
}

async function fetchWithTimeout(url, timeout) {
  const isNative = !!(window.Capacitor?.isNativePlatform?.());
  
  if (isNative) {
    const response = await CapacitorHttp.get({
      url,
      connectTimeout: timeout,
      readTimeout: timeout
    });
    return response.data;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': '*/*',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    return await res.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function testProxy(proxyUrl) {
  const testUrl = 'https://www.google.com';
  
  try {
    const result = await fetchWithTimeout(buildProxyUrl(proxyUrl, testUrl), 5000);
    return { success: true, latency: 0 };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getProxyStatus() {
  const proxies = getProxyList();
  return proxies.map(p => ({
    url: p.url.replace(/\?.*$/, ''),
    type: p.type,
    priority: p.priority
  }));
}

export default {
  getProxyList,
  fetchWithProxyRotation,
  testProxy,
  getProxyStatus,
  config: EPG_PROXY_CONFIG
};
