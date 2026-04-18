/**
 * ConnectivityBooster.js — Motor de Aceleração de Conectividade
 * Otimizado para AmerikaKG v2.0
 */
class ConnectivityBooster {
  constructor() { 
    this.activePreconnects = new Set();
    this.dnsCache = new Map();
  }
  
  async prewarm(url) {
    if (!url || this.activePreconnects.has(url)) return;
    try {
      const domain = new URL(url).origin;
      
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
      
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
        const dnsLink = document.createElement('link');
        dnsLink.rel = 'dns-prefetch';
        dnsLink.href = domain;
        document.head.appendChild(dnsLink);
      }
      
      this.activePreconnects.add(url);
      fetch(url, { method: 'HEAD', mode: 'no-cors', priority: 'low' }).catch(() => {});
    } catch (e) { console.warn('[Booster] Prewarm erro:', e.message); }
  }
  
  getOptimizedHeaders(baseHeaders = {}) {
    return { 
      ...baseHeaders, 
      'Connection': 'keep-alive', 
      'Keep-Alive': 'timeout=60, max=100',
      'X-Priority': 'High',
      'X-Accelerated': 'true'
    };
  }
  
  async shadowConnect(url) {
    if (!url) return;
    
    const is AmerikaKG = url.includes('americakg.xyz');
    const iterations = is AmerikaKG ? 5 : 3;
    
    for(let i = 0; i < iterations; i++) {
      setTimeout(() => this.prewarm(url), i * 100);
    }
    
    if (is AmerikaKG) {
      console.log('[Booster] AmerikaKG detectado: modo turbo ativado');
    }
  }
}

export const connectivityBooster = new ConnectivityBooster();
export default connectivityBooster;
