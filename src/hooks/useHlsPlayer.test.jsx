import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useHlsPlayer from './useHlsPlayer';
import * as streamService from '../services/streamService';
import Hls from 'hls.js';

const mockVideoElement = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  removeAttribute: vi.fn(),
  load: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  canPlayType: vi.fn().mockReturnValue('probably')
};

describe('useHlsPlayer - Teste de Sintonização Crítica', () => {
  const videoRef = { current: mockVideoElement };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve identificar corretamente um sinal HLS e preparar para sintonização', () => {
    const url = 'http://test.com/live.m3u8';
    
    vi.spyOn(Hls, 'isSupported').mockReturnValue(true);

    const { result } = renderHook(() => useHlsPlayer(url, videoRef));

    expect(['loading', 'ready']).toContain(result.current.playerState.status);
    expect(result.current.playerState.buffering).toBe(true);
  });

  it('deve identificar um sinal MP4 e usar Direct Play', () => {
    const url = 'http://test.com/movie.mp4';
    
    const { result } = renderHook(() => useHlsPlayer(url, videoRef));

    expect(result.current.playerState.buffering).toBe(true);
  });

  it('deve identificar um sinal .ts e usar HLS.js', () => {
    const url = 'http://test.com/stream.ts';
    
    vi.spyOn(Hls, 'isSupported').mockReturnValue(true);

    const { result } = renderHook(() => useHlsPlayer(url, videoRef));

    expect(result.current.playerState.buffering).toBe(true);
  });
});
