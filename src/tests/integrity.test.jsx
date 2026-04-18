import { describe, it, expect, vi } from 'vitest';

describe('INTEGRIDADE — Testes de Integridade de Dados', () => {
  describe('M3U Parser', () => {
    const mockM3UContent = `#EXTM3U url-tvg="http://example.com/epg.xml"
#EXTINF:-1 tvg-name="Canal 1" tvg-logo="http://example.com/logo.png" group-title="Filmes",Canal 1
http://example.com/stream1.m3u8
#EXTINF:-1 tvg-name="Canal 2" tvg-logo="http://example.com/logo2.png" group-title="Séries",Canal 2
http://example.com/stream2.m3u8
#EXTINF:-1 tvg-name="Canal 3" group-title="Ao Vivo",Canal 3
http://example.com/stream3.m3u8`;

    const parseM3U = (content) => {
      const lines = content.split('\n');
      const channels = [];
      let currentChannel = null;

      for (const line of lines) {
        if (line.startsWith('#EXTINF:')) {
          const match = line.match(/#EXTINF:.*?tvg-name="(.*?)".*?group-title="(.*?)".*?,(.*)/);
          if (match) {
            currentChannel = {
              name: match[3].trim(),
              group: match[2],
              logo: '',
            };
          }
        } else if (line.trim() && !line.startsWith('#') && currentChannel) {
          currentChannel.url = line.trim();
          channels.push(currentChannel);
          currentChannel = null;
        }
      }
      return channels;
    };

    it('deve parsear conteúdo M3U corretamente', () => {
      const channels = parseM3U(mockM3UContent);
      expect(channels).toHaveLength(3);
    });

    it('deve extrair nome do canal', () => {
      const channels = parseM3U(mockM3UContent);
      expect(channels[0].name).toBe('Canal 1');
      expect(channels[1].name).toBe('Canal 2');
    });

    it('deve extrair grupo do canal', () => {
      const channels = parseM3U(mockM3UContent);
      expect(channels[0].group).toBe('Filmes');
      expect(channels[1].group).toBe('Séries');
      expect(channels[2].group).toBe('Ao Vivo');
    });

    it('deve extrair URL do stream', () => {
      const channels = parseM3U(mockM3UContent);
      expect(channels[0].url).toBe('http://example.com/stream1.m3u8');
    });

    it('deve lidar com M3U vazio', () => {
      const channels = parseM3U('#EXTM3U\n');
      expect(channels).toHaveLength(0);
    });

    it('deve lidar com M3U malformado', () => {
      const channels = parseM3U('não é um M3U válido');
      expect(channels).toHaveLength(0);
    });
  });

  describe('Detecção de Stream', () => {
    const detectStreamType = (url) => {
      if (!url) return 'unknown';
      
      const ext = url.split('?')[0].split('.').pop().toLowerCase();
      const hasM3U8 = url.includes('m3u8') || url.includes('m3u');
      const hasHls = url.includes('hls') || url.includes('live');
      
      if (hasM3U8 || ext === 'm3u8' || ext === 'm3u') return 'hls';
      if (ext === 'mp4') return 'mp4';
      if (ext === 'mkv') return 'mkv';
      if (ext === 'ts') return 'ts';
      if (ext === 'webm') return 'webm';
      if (hasHls) return 'hls';
      
      return 'unknown';
    };

    it('deve detectar streams HLS', () => {
      expect(detectStreamType('http://example.com/stream.m3u8')).toBe('hls');
      expect(detectStreamType('http://example.com/live/playlist.m3u')).toBe('hls');
      expect(detectStreamType('http://example.com/hls/stream')).toBe('hls');
    });

    it('deve detectar streams MP4', () => {
      expect(detectStreamType('http://example.com/video.mp4')).toBe('mp4');
    });

    it('deve detectar streams MKV', () => {
      expect(detectStreamType('http://example.com/video.mkv')).toBe('mkv');
    });

    it('deve detectar streams TS', () => {
      expect(detectStreamType('http://example.com/video.ts')).toBe('ts');
    });

    it('deve detectar streams WebM', () => {
      expect(detectStreamType('http://example.com/video.webm')).toBe('webm');
    });

    it('deve retornar unknown para URL inválida', () => {
      expect(detectStreamType('')).toBe('unknown');
      expect(detectStreamType(null)).toBe('unknown');
    });

    it('deve忽略 query params na detecção', () => {
      expect(detectStreamType('http://example.com/stream.m3u8?token=abc')).toBe('hls');
    });
  });

  describe('Validação de Channel', () => {
    const validateChannel = (channel) => {
      const errors = [];
      
      if (!channel) {
        errors.push('Channel é nulo');
        return { valid: false, errors };
      }
      
      if (!channel.name || typeof channel.name !== 'string') {
        errors.push('Nome inválido');
      }
      
      if (!channel.url || typeof channel.url !== 'string') {
        errors.push('URL inválida');
      } else if (!channel.url.startsWith('http')) {
        errors.push('URL deve começar com http');
      }
      
      if (channel.group && typeof channel.group !== 'string') {
        errors.push('Grupo deve ser string');
      }
      
      return { valid: errors.length === 0, errors };
    };

    it('deve validar canal válido', () => {
      const channel = { name: 'Canal 1', url: 'http://example.com/stream.m3u8', group: 'Filmes' };
      const result = validateChannel(channel);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar canal sem nome', () => {
      const channel = { url: 'http://example.com/stream.m3u8' };
      const result = validateChannel(channel);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nome inválido');
    });

    it('deve.reject canal sem URL', () => {
      const channel = { name: 'Canal 1' };
      const result = validateChannel(channel);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('URL inválida');
    });

    it('deve rejecting URL sem http', () => {
      const channel = { name: 'Canal 1', url: 'ftp://example.com/stream.m3u8' };
      const result = validateChannel(channel);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('URL deve começar com http');
    });

    it('deve rejecting canal nulo', () => {
      const result = validateChannel(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Channel é nulo');
    });
  });

  describe('Cache de Canais', () => {
    const createChannelCache = () => {
      const cache = new Map();
      
      return {
        set: (key, value, ttl = 3600000) => {
          cache.set(key, { data: value, expiry: Date.now() + ttl });
        },
        get: (key) => {
          const item = cache.get(key);
          if (!item) return null;
          if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
          }
          return item.data;
        },
        delete: (key) => cache.delete(key),
        clear: () => cache.clear(),
        size: () => cache.size,
      };
    };

    it('deve armazenar e recuperar canal', () => {
      const cache = createChannelCache();
      const channel = { name: 'Canal 1', url: 'http://example.com/stream.m3u8' };
      
      cache.set('channel-1', channel);
      expect(cache.get('channel-1')).toEqual(channel);
    });

    it('deve expirar cache após TTL', async () => {
      const cache = createChannelCache();
      const channel = { name: 'Canal 1' };
      
      cache.set('channel-1', channel, 100); // 100ms
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('channel-1')).toBeNull();
    });

    it('deve deletar item do cache', () => {
      const cache = createChannelCache();
      cache.set('channel-1', { name: 'Canal 1' });
      
      cache.delete('channel-1');
      expect(cache.get('channel-1')).toBeNull();
    });

    it('deve limpar todo o cache', () => {
      const cache = createChannelCache();
      cache.set('channel-1', { name: 'Canal 1' });
      cache.set('channel-2', { name: 'Canal 2' });
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });
});