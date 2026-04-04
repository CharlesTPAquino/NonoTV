/**
 * NonoTV — Stream Proxy Service v8.7.0
 * 
 * Resolve o problema de CORS/mixed content para URLs de canais IPTV.
 * 
 * Fluxo:
 * 1. Native (APK): Usa CapacitorHttp para contornar CORS completamente
 * 2. Web Dev: Usa proxy local (localhost:3131)
 * 3. Web Prod: Usa proxies públicos (corsproxy.io, allorigins)
 * 
 * IMPORTANTE: Para HLS streams, NÃO proxyamos o manifest inteiro.
 * Em vez disso, no modo nativo usamos CapacitorHttp para buscar
 * o manifest e criar um blob URL, permitindo que HLS.js funcione.
 */

import { createTimeoutSignal } from '../utils/createTimeoutSignal';

const PUBLIC_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.Capacitor?.platform === 'android' || window.Capacitor?.platform === 'ios') return true;
  if (typeof android !== 'undefined') return true;
  return false;
}

function isDev() {
  return import.meta?.env?.DEV;
}

/**
 * Converte URL de canal para URL proxyada
 * Mantém a URL original se não precisar de proxy
 */
export function getStreamProxyUrl(url) {
  if (!url) return url;
  
  const isNative = isNativePlatform();
  const dev = isDev();
  
  // Native: CapacitorHttp lida com CORS nativamente — URL original funciona
  if (isNative) return url;
  
  // Dev: usa proxy local
  if (dev) {
    return `http://localhost:3131/?url=${encodeURIComponent(url)}`;
  }
  
  // Prod: URL original (servidores IPTV geralmente não bloqueiam)
  return url;
}

/**
 * Fetch de manifest HLS via CapacitorHttp (nativo) ou fetch (web)
 * Retorna o texto do manifest para ser usado pelo HLS.js
 */
export async function fetchHlsManifest(url) {
  const isNative = isNativePlatform();
  const timeout = getAdaptiveTimeout(15000);
  
  if (isNative) {
    return fetchNativeManifest(url, timeout);
  }
  
  // Web: tenta direto primeiro
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VLC/3.0.18', 'Accept': '*/*' },
      signal: createTimeoutSignal(timeout)
    });
    if (res.ok) return await res.text();
  } catch (e) {
    console.warn('[StreamProxy] Fetch direto falhou, tentando proxies...');
  }
  
  // Web: tenta proxies públicos
  for (const proxy of PUBLIC_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const res = await fetch(proxyUrl, {
        signal: createTimeoutSignal(timeout)
      });
      if (res.ok) return await res.text();
    } catch {
      continue;
    }
  }
  
  throw new Error('Falha ao buscar manifest HLS');
}

/**
 * Fetch via CapacitorHttp — contorna CORS completamente no Android
 */
async function fetchNativeManifest(url, timeout) {
  try {
    const { CapacitorHttp } = await import('@capacitor/core');
    const response = await CapacitorHttp.get({
      url,
      headers: {
        'User-Agent': 'VLC/3.0.18',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      },
      connectTimeout: timeout,
      readTimeout: timeout
    });
    
    if (typeof response.data === 'string') return response.data;
    return JSON.stringify(response.data);
  } catch (e) {
    console.warn('[StreamProxy] CapacitorHttp falhou:', e.message);
    throw e;
  }
}

/**
 * Timeout adaptativo baseado no tipo de conexão
 */
function getAdaptiveTimeout(baseMs) {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = conn?.effectiveType || '4g';
  const multipliers = { 'slow-2g': 6, '2g': 4, '3g': 2, '4g': 1 };
  return baseMs * (multipliers[effectiveType] || 1);
}

/**
 * Extrai o domínio base de uma URL para construir URLs relativas
 * (necessário para manifests HLS com URLs relativas)
 */
export function getBaseUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

/**
 * Resolve URLs relativas em um manifest HLS para URLs absolutas
 */
export function resolveRelativeUrls(manifestText, baseUrl) {
  if (!baseUrl || !manifestText) return manifestText;
  
  return manifestText
    .split('\n')
    .map(line => {
      if (line.startsWith('#') || line.startsWith('http') || line.trim() === '') return line;
      if (line.startsWith('/')) return `${baseUrl}${line}`;
      return `${baseUrl}/${line}`;
    })
    .join('\n');
}

export default {
  getStreamProxyUrl,
  fetchHlsManifest,
  getBaseUrl,
  resolveRelativeUrls,
  isNativePlatform
};
