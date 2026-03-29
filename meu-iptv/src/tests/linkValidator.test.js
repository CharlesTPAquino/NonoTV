import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateLink } from '../utils/linkValidator';

describe('linkValidator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar true para links válidos que respondem no modo no-cors', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const result = await validateLink('http://example.com/stream.m3u8');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('http://example.com/stream.m3u8', expect.any(Object));
  });

  it('deve retornar false em caso de erro de rede', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
    const result = await validateLink('http://example.com/error.m3u8');
    expect(result).toBe(false);
  });
});
