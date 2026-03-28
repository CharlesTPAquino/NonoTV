import Hls from 'hls.js';

class PrefetchService {
  constructor() {
    this.prefetchedUrls = new Map();
    this.prefetchTimeout = null;
    this.maxPrefetch = 3;
  }

  async prefetchChannel(channel, onProgress) {
    if (!channel?.url) return null;

    const url = channel.url.toLowerCase();
    if (!url.includes('.m3u8') && !url.includes('m3u')) {
      return null;
    }

    if (this.prefetchedUrls.has(channel.url)) {
      console.log('[PrefetchService] Já prefetched:', channel.name);
      return this.prefetchedUrls.get(channel.url);
    }

    console.log('[PrefetchService] Prefetching:', channel.name);

    return new Promise((resolve) => {
      try {
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 2,
            maxMaxBufferLength: 10,
            manifestLoadingMaxRetry: 1,
            levelLoadingMaxRetry: 1
          });

          hls.loadSource(channel.url);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('[PrefetchService] Prefetch completo:', channel.name);
            this.prefetchedUrls.set(channel.url, { hls, channel });
            this.cleanupOldPrefetch();
            resolve({ hls, channel, success: true });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.log('[PrefetchService] Erro no prefetch:', channel.name, data.type);
            hls.destroy();
            resolve({ hls: null, channel, success: false, error: data.type });
          });

        } else if (window.MediaSource?.isTypeSupported('application/vnd.apple.mpegurl')) {
          const video = document.createElement('video');
          video.src = channel.url;
          video.preload = 'auto';
          
          video.oncanplay = () => {
            console.log('[PrefetchService] Prefetch completo (Safari):', channel.name);
            this.prefetchedUrls.set(channel.url, { video, channel });
            this.cleanupOldPrefetch();
            resolve({ video, channel, success: true });
          };

          video.onerror = () => {
            console.log('[PrefetchService] Erro no prefetch (Safari):', channel.name);
            resolve({ video: null, channel, success: false, error: 'load error' });
          };
        } else {
          resolve({ channel, success: false, error: 'HLS not supported' });
        }
      } catch (error) {
        console.log('[PrefetchService] Exceção:', error.message);
        resolve({ channel, success: false, error: error.message });
      }
    });
  }

  async prefetchNextChannels(currentChannel, allChannels, count = 2) {
    if (!allChannels || allChannels.length === 0) return [];

    const settings = { preferHD: true, enablePrefetch: true, prefetchNext: true };
    try {
      const stored = JSON.parse(localStorage.getItem('nono_settings'));
      if (stored) Object.assign(settings, stored);
    } catch {}

    if (!settings.enablePrefetch || !settings.prefetchNext) {
      return [];
    }

    const currentIndex = allChannels.findIndex(ch => ch.id === currentChannel?.id);
    if (currentIndex === -1) return [];

    const nextChannels = [];
    for (let i = 1; i <= count; i++) {
      const nextIndex = (currentIndex + i) % allChannels.length;
      nextChannels.push(allChannels[nextIndex]);
    }

    const results = await Promise.all(
      nextChannels.map(ch => this.prefetchChannel(ch))
    );

    return results.filter(r => r?.success);
  }

  cleanupOldPrefetch() {
    if (this.prefetchedUrls.size <= this.maxPrefetch) return;

    const entries = Array.from(this.prefetchedUrls.entries());
    const toRemove = entries.slice(0, entries.length - this.maxPrefetch);

    toRemove.forEach(([url, data]) => {
      if (data.hls) {
        data.hls.destroy();
      }
      if (data.video) {
        data.video.src = '';
        data.video.load();
      }
      this.prefetchedUrls.delete(url);
      console.log('[PrefetchService] Removido do cache:', data.channel?.name);
    });
  }

  getPrefetched(url) {
    return this.prefetchedUrls.get(url);
  }

  hasPrefetched(url) {
    return this.prefetchedUrls.has(url);
  }

  clearAll() {
    this.prefetchedUrls.forEach((data) => {
      if (data.hls) data.hls.destroy();
      if (data.video) {
        data.video.src = '';
        data.video.load();
      }
    });
    this.prefetchedUrls.clear();
    console.log('[PrefetchService] Cache limpo');
  }

  getStatus() {
    return {
      cached: this.prefetchedUrls.size,
      channels: Array.from(this.prefetchedUrls.values()).map(d => d.channel?.name)
    };
  }
}

export const prefetchService = new PrefetchService();

export default prefetchService;
