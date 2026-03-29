import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn()
  }
}));

import { Capacitor } from '@capacitor/core';
import { fetchSource } from '../services/SyncService';

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchSource - Modo Web (não nativo)', () => {
    it('deve fazer fetch direto com URL válida', async () => {
      Capacitor.isNativePlatform.mockReturnValue(false);
      
      const mockM3U = '#EXTM3U\n#EXTINF:-1 tvg-name="Canal 1",Canal 1\nhttp://exemplo.com/canal1.m3u8';
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockM3U)
      });

      const result = await fetchSource('http://test.com/lista.m3u');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(mockM3U);
    });

    it('deve lançar erro quando fetch direto falha', async () => {
      Capacitor.isNativePlatform.mockReturnValue(false);
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(fetchSource('http://test.com/lista.m3u'))
        .rejects.toThrow();
    });

    it('deve lançar erro com status HTTP diferente de 200', async () => {
      Capacitor.isNativePlatform.mockReturnValue(false);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(fetchSource('http://test.com/lista.m3u'))
        .rejects.toThrow('HTTP 404');
    });
  });

  describe('fetchSource - Modo Nativo (Android)', () => {
    it('deve usar fetch nativo com timeout', async () => {
      Capacitor.isNativePlatform.mockReturnValue(true);
      
      const mockM3U = '#EXTM3U\n#EXTINF:-1,Canal 1\nhttp://exemplo.com/canal1.m3u8';
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockM3U)
      });

      const result = await fetchSource('http://test.com/lista.m3u');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(mockM3U);
    });

    it('deve lançar erro quando fetch falha', async () => {
      Capacitor.isNativePlatform.mockReturnValue(true);
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      await expect(fetchSource('http://test.com/lista.m3u'))
        .rejects.toThrow();
    });
  });
});