/**
 * ConnectivityBooster.js — Motor de Aceleração de Conectividade
 */
class ConnectivityBooster {
  constructor() { this.activePreconnects = new Set(); }
  async prewarm(url) {
    if (!url || this.activePreconnects.has(url)) return;
    try {
      const domain = new URL(url).origin;
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      this.activePreconnects.add(url);
      fetch(url, { method: 'HEAD', mode: 'no-cors', priority: 'low' }).catch(() => {});
    } catch (e) { console.warn('[Booster] Prewarm erro:', e.message); }
  }
  getOptimizedHeaders(baseHeaders = {}) {
    return { ...baseHeaders, 'Connection': 'keep-alive', 'Keep-Alive': 'timeout=60', 'X-Priority': 'High' };
  }
  async shadowConnect(url) {
    if (url.includes('americakg.xyz')) {
      for(let i=0; i<3; i++) this.prewarm(url);
    }
  }
}
export const connectivityBooster = new ConnectivityBooster();
export default connectivityBooster;
