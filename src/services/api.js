import { CapacitorHttp } from '@capacitor/core';

const IS_NATIVE = typeof window !== 'undefined' && !!(window.Capacitor);
const PROXY_URL = 'http://localhost:3131';

/**
 * Universal Master Fetcher:
 * Redesenhado do zero para máxima compatibilidade Mi Stick / TV Box.
 */
export async function syncSource(url) {
  // 🎭 Camuflagem Profissional (Simula o VLC Player)
  const headers = {
    'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18', // Essencial para burlar bloqueios IPTV
    'Accept': '*/*',
    'Accept-Language': 'pt-BR,pt;q=0.9',
    'Connection': 'keep-alive'
  };

  try {
    // 📺 1. MODO NATIVO (Estratégia APK Principal)
    if (IS_NATIVE) {
      console.log('[Native Sync] Iniciando túnel nativo para:', url);
      const res = await CapacitorHttp.get({
        url,
        headers,
        connectTimeout: 30000, // 30 segundos — redes IPTV oscilam
        readTimeout: 30000
      });
      
      if (res.status === 200 && res.data) {
        return res.data;
      }
      throw new Error(`Servidor IPTV recusou (Status ${res.status})`);
    }

    // 💻 2. MODO DESENVOLVEDOR (Browser Sync)
    if (import.meta.env.DEV) {
      try {
        const proxyRes = await fetch(`${PROXY_URL}/${url}`, { headers });
        if (proxyRes.ok) return await proxyRes.text();
      } catch (e) {
        console.warn('[Network] Proxy Offline no PC, tentando sinal direto...');
      }
    }

    // 🌐 3. MODO FINAL (Fallback Direto do Navegador)
    const directRes = await fetch(url, { headers });
    if (!directRes.ok) throw new Error(`HTTP ${directRes.status}`);
    return await directRes.text();

  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Conexão recusada (Sem Internet ou Bloqueio de IP)');
    }
    throw error;
  }
}
