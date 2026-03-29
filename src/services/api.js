import { CapacitorHttp } from '@capacitor/core';

const PROXY_URL = 'http://localhost:3131';

const headers = {
  'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
  'Accept': '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Connection': 'keep-alive'
};

/**
 * Universal Master Fetcher
 * Ordem: DEV (proxy) → NATIVO (APK) → DIRETO (fallback)
 */
export async function syncSource(url) {
  // 1. MODO DEV — sempre usa o proxy local para evitar CORS
  // Tem prioridade absoluta sobre qualquer check de ambiente nativo
  if (import.meta.env.DEV) {
    console.log('[DEV] Usando proxy local para:', url);
    try {
      const proxyRes = await fetch(`${PROXY_URL}/?url=${encodeURIComponent(url)}`, { headers });
      if (proxyRes.ok) return await proxyRes.text();
      console.warn('[DEV] Proxy retornou status', proxyRes.status, '— tentando direto...');
    } catch (e) {
      console.warn('[DEV] Proxy offline — tentando fetch direto (instale o proxy!)');
    }
    // Fallback direto (só funciona se CORS extension estiver ativa)
    const directRes = await fetch(url, { headers });
    if (!directRes.ok) throw new Error(`HTTP ${directRes.status}`);
    return await directRes.text();
  }

  // 2. MODO NATIVO (APK real)
  const IS_NATIVE = !!(window.Capacitor?.isNativePlatform?.());
  if (IS_NATIVE) {
    console.log('[APK] Túnel nativo para:', url);
    const res = await CapacitorHttp.get({ url, headers, connectTimeout: 30000, readTimeout: 30000 });
    if (res.status === 200 && res.data) return res.data;
    throw new Error(`Servidor IPTV recusou (Status ${res.status})`);
  }

  // 3. PRODUÇÃO WEB — fetch direto
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}
