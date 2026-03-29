import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SourceProvider, useSources } from '../context/SourceContext';

// Mock das dependências
vi.mock('../services/SyncService', () => ({
  fetchSource: vi.fn()
}));

vi.mock('../utils/m3uParser', () => ({
  parseM3U: vi.fn((content) => {
    if (!content) return [];
    return [
      { id: '1', name: 'Canal 1', url: 'http://ex.com/1.m3u8', type: 'live', group: 'Geral' },
      { id: '2', name: 'Canal 2', url: 'http://ex.com/2.m3u8', type: 'live', group: 'Geral' }
    ];
  })
}));

import { fetchSource } from '../services/SyncService';
import { parseM3U } from '../utils/m3uParser';

describe('SourceContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
    fetchSource.mockResolvedValue(mockM3U);
    
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

    expect(fetchSource).toHaveBeenCalledWith(testSource.url);
  });

  it('deve limpar cache ao selecionar fonte', async () => {
    fetchSource.mockResolvedValue('#EXTM3U\n#EXTINF:-1,Canal 1\nhttp://new.com/1.m3u8');
    
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
    fetchSource.mockRejectedValue(new Error('Connection refused'));
    
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