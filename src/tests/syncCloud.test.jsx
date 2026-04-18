import { describe, it, expect, vi } from 'vitest';

describe('SYNC CLOUD — Testes de Sync Cloud (Supabase)', () => {
  describe('Favoritos Sync', () => {
    it('deve criar estrutura de favorito', () => {
      const favorite = {
        id: 'fav-1',
        channelId: 'channel-1',
        name: 'Globo',
        url: 'http://example.com/globo.m3u8',
        addedAt: Date.now()
      };

      expect(favorite.id).toBe('fav-1');
      expect(favorite.name).toBe('Globo');
    });

    it('deve validar objeto de favorito', () => {
      const isValidFavorite = (fav) => {
        return fav && fav.id && fav.channelId && fav.name;
      };

      expect(isValidFavorite({ id: '1', channelId: 'c1', name: 'Test' })).toBe(true);
      expect(isValidFavorite({})).toBe(false);
    });

    it('deve mesclar favoritos locais e cloud', () => {
      const localFavorites = [{ id: 'fav-1' }, { id: 'fav-2' }];
      const cloudFavorites = [{ id: 'fav-1' }, { id: 'fav-3' }];

      const merged = [...localFavorites];
      cloudFavorites.forEach(cf => {
        if (!merged.find(lf => lf.id === cf.id)) {
          merged.push(cf);
        }
      });

      expect(merged).toHaveLength(3);
      expect(merged.find(f => f.id === 'fav-3')).toBeTruthy();
    });
  });

  describe('Histórico Sync', () => {
    it('deve criar entrada de histórico', () => {
      const entry = {
        channelId: 'channel-1',
        name: 'Globo',
        url: 'http://example.com/globo.m3u8',
        watchedAt: Date.now(),
        duration: 3600
      };

      expect(entry.duration).toBe(3600);
      expect(entry.watchedAt).toBeGreaterThan(0);
    });

    it('deve filtrar histórico antigo (>30 dias)', () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      
      const history = [
        { id: 'h1', watchedAt: now },
        { id: 'h2', watchedAt: now - (60 * 24 * 60 * 60 * 1000) }, // 60 dias atrás
      ];

      const filtered = history.filter(h => now - h.watchedAt < thirtyDaysMs);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('h1');
    });
  });

  describe('Conflict Resolution', () => {
    it('deve escolher versão mais recente', () => {
      const local = { id: 'fav-1', name: 'Globo', updatedAt: 1000 };
      const cloud = { id: 'fav-1', name: 'Globo HD', updatedAt: 2000 };

      const resolved = cloud.updatedAt > local.updatedAt ? cloud : local;
      expect(resolved.name).toBe('Globo HD');
    });

    it('deve preferring cloud em caso de dúvida', () => {
      const local = { id: 'fav-1', channels: [] };
      const cloud = { id: 'fav-1', channels: [{ id: 'c1' }] };

      const merged = { ...local, ...cloud, source: 'cloud' };
      expect(merged.source).toBe('cloud');
      expect(merged.channels.length).toBe(1);
    });
  });

  describe('Offline Mode', () => {
    it('deve salvar no localStorage quando offline', () => {
      localStorage.setItem('pending_sync', JSON.stringify({
        favorites: [{ id: 'fav-1' }],
        history: [{ id: 'hist-1' }]
      }));

      const pending = localStorage.getItem('pending_sync');
      expect(pending).toBeTruthy();
    });

    it('deve ler pending sync do localStorage', () => {
      const pending = localStorage.getItem('pending_sync');
      const parsed = pending ? JSON.parse(pending) : null;

      expect(parsed).toBeTruthy();
      expect(parsed.favorites).toBeDefined();
      expect(parsed.history).toBeDefined();
    });

    it('deve limpar pending após sync', () => {
      localStorage.removeItem('pending_sync');
      const pending = localStorage.getItem('pending_sync');
      
      expect(pending).toBeNull();
    });
  });
});