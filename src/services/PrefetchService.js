import Hls from 'hls.js';
import { detectDeviceProfile } from './SmartServerOrchestrator';

/**
 * AI-Zapping Prefetch Service v4.8
 * Antecipa o carregamento de canais baseando-se no foco do usuário e poder de hardware.
 */
class PrefetchService {
  constructor() {
    this.prefetchedUrls = new Map();
    this.maxPrefetch = 3;
    this.activePrefetchCount = 0;
  }

  async prefetchChannel(channel) {
    if (!channel?.url) return null;
    
    // Filtro de Hardware: Só prefetch em dispositivos potentes
    const profile = detectDeviceProfile();
    if (profile.label === 'Resiliência') return null; // Lite não faz prefetch

    if (this.prefetchedUrls.has(channel.url)) return this.prefetchedUrls.get(channel.url);
    if (this.activePrefetchCount >= this.maxPrefetch) return null;

    return new Promise((resolve) => {
      try {
        this.activePrefetchCount++;
        
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            maxBufferLength: 5, // Baixa apenas 5s para 'aquecer'
            manifestLoadingMaxRetry: 1,
            fragLoadingMaxRetry: 1
          });

          hls.loadSource(channel.url);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log(`[AI-Zapping] Canal aquecido: ${channel.name}`);
            this.prefetchedUrls.set(channel.url, { hls, channel, timestamp: Date.now() });
            this.activePrefetchCount--;
            this.cleanupOldPrefetch();
            resolve({ success: true });
          });

          hls.on(Hls.Events.ERROR, () => {
            hls.destroy();
            this.activePrefetchCount--;
            resolve({ success: false });
          });
        } else {
          this.activePrefetchCount--;
          resolve({ success: false });
        }
      } catch {
        this.activePrefetchCount--;
        resolve({ success: false });
      }
    });
  }

  cleanupOldPrefetch() {
    if (this.prefetchedUrls.size <= this.maxPrefetch) return;
    const oldestUrl = Array.from(this.prefetchedUrls.keys())[0];
    const data = this.prefetchedUrls.get(oldestUrl);
    if (data?.hls) data.hls.destroy();
    this.prefetchedUrls.delete(oldestUrl);
  }

  getWarmHls(url) {
    return this.prefetchedUrls.get(url)?.hls || null;
  }

  clearAll() {
    this.prefetchedUrls.forEach(d => d.hls?.destroy());
    this.prefetchedUrls.clear();
  }
}

export const prefetchService = new PrefetchService();
export default prefetchService;
