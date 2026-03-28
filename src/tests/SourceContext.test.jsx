import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SourceProvider, useSources } from '../context/SourceContext';

// Mock das dependências
vi.mock('../utils/m3uParser', () => ({
  parseM3U: vi.fn((content) => {
    if (!content) return [];
    return [
      { id: '1', name: 'Canal 1', url: 'http://ex.com/1.m3u8', type: 'live', group: 'Geral' },
      { id: '2', name: 'Canal 2', url: 'http://ex.com/2.m3u8', type: 'live', group: 'Geral' }
    ];
  })
}));

vi.mock('../services/SyncManager', () => ({
  SyncManager: {
    getFavorites: () => [],
    getHistory: () => [],
    getSourceHealth: () => ({}),
    getSettings: () => ({ autoFallback: true, enablePrefetch: true, prefetchNext: true }),
    updateSettings: vi.fn(),
    getDefaultSettings: () => ({ autoFallback: true }),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    getCacheConfig: () => ({ channels: 3600000, epg: 3600000 }),
    updateSourceHealth: vi.fn()
  }
}));

vi.mock('../services/RetryService', () => ({
  retryService: {
    executeWithRetry: vi.fn((fn) => fn()),
    getCircuitBreakerStatus: () => ({ blocked: false }),
    resetCircuitBreaker: vi.fn()
  }
}));

vi.mock('../services/PrefetchService', () => ({
  prefetchService: {
    prefetchNextChannels: vi.fn(() => Promise.resolve([]))
  }
}));

describe('SourceContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('deve iniciar com canais locais', () => {
    const { result } = renderHook(() => useSources(), {
      wrapper: SourceProvider
    });

    expect(result.current.channels).toBeDefined();
    expect(result.current.sources).toBeDefined();
    expect(result.current.sources.length).toBeGreaterThan(0);
  });

  it('deve carregar fonte corretamente', async () => {
    const mockM3U = '#EXTM3U\n#EXTINF:-1,Canal 1\nhttp://ex.com/1.m3u8';
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockM3U
    });
    
    const { result } = renderHook(() => useSources(), {
      wrapper: SourceProvider
    });

    const testSource = { 
      id: 'test', 
      name: 'Test Source', 
      url: 'http://test.com/lista.m3u' 
    };

    await act(async () => {
      await result.current.selectSource(testSource);
    });

    expect(global.fetch).toHaveBeenCalled();
    const fetchUrl = global.fetch.mock.calls[0][0];
    expect(decodeURIComponent(fetchUrl)).toContain('test.com/lista.m3u');
  });

  it('deve limpar cache ao selecionar fonte', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '#EXTM3U\n#EXTINF:-1,Canal 1\nhttp://new.com/1.m3u8'
    });
    
    const { result } = renderHook(() => useSources(), {
      wrapper: SourceProvider
    });

    const testSource = { 
      id: 'test', 
      name: 'Test Source', 
      url: 'http://new-server.com/lista'
    };

    await act(async () => {
      await result.current.selectSource(testSource);
      await new Promise(r => setTimeout(r, 50));
    });

    expect(result.current.channels).toBeDefined();
    expect(result.current.channels.length).toBeGreaterThan(0);
  });

  it('deve manter canais locais quando erro ocorre', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Connection refused'));
    
    const { result } = renderHook(() => useSources(), {
      wrapper: SourceProvider
    });

    const testSource = { 
      id: 'test', 
      name: 'Test Source', 
      url: 'http://test.com/lista.m3u'
    };

    await act(async () => {
      await result.current.selectSource(testSource);
    });

    expect(result.current.channels).toBeDefined();
  });

  it('deve retornar canais locais ao selecionar fonte nula', async () => {
    const { result } = renderHook(() => useSources(), {
      wrapper: SourceProvider
    });

    await act(async () => {
      await result.current.selectSource(null);
    });

    expect(result.current.activeSource).toBeNull();
  });
});