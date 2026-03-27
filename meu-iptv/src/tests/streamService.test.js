import { describe, it, expect } from 'vitest';
import { parseM3U } from '../utils/m3uParser';
import { detectStreamType, detectCodec } from '../services/streamService';

describe('m3uParser', () => {
  const simpleM3U = `#EXTM3U
#EXTINF:-1 tvg-name="Globo" tvg-logo="http://ex.com/logo.png" group-title="TV Aberta",Globo
http://ex.com/globo.m3u8
#EXTINF:-1 tvg-name="SBT" group-title="TV Aberta",SBT
http://ex.com/sbt.m3u8
#EXTINF:-1 tvg-name="Filme 1" group-title="Filmes",Filme 1
http://ex.com/filme1.mp4
#EXTINF:-1 tvg-name="Serie 1" group-title="Séries",Serie 1 Ep 01
http://ex.com/serie1.mp4`;

  it('deve parsear M3U básico corretamente', () => {
    const result = parseM3U(simpleM3U);
    
    expect(result).toHaveLength(4);
    expect(result[0].name).toBe('Globo');
    expect(result[0].group).toBe('TV Aberta');
    expect(result[0].logo).toBe('http://ex.com/logo.png');
  });

  it('deve detectar tipo live para streams HLS', () => {
    const result = parseM3U(simpleM3U);
    
    expect(result[0].type).toBe('live'); // Globo
    expect(result[1].type).toBe('live'); // SBT
  });

  it('deve detectar tipo movie para arquivos MP4', () => {
    const result = parseM3U(simpleM3U);
    
    expect(result[2].type).toBe('movie'); // Filme 1
  });

  it('deve detectar tipo series para episódios', () => {
    const result = parseM3U(simpleM3U);
    
    expect(result[3].type).toBe('series'); // Serie 1
  });

  it('deve retornar array vazio para conteúdo inválido', () => {
    expect(parseM3U(null)).toEqual([]);
    expect(parseM3U(undefined)).toEqual([]);
    expect(parseM3U('')).toEqual([]);
    expect(parseM3U('não é um m3u válido')).toEqual([]);
  });

  it('deve gerar IDs únicos para cada canal', () => {
    const result = parseM3U(simpleM3U);
    const ids = result.map(c => c.id);
    
    // Verifica que não há IDs duplicados
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('streamService - detectStreamType', () => {
  it('deve retornar movie para URLs com extensão mp4', () => {
    expect(detectStreamType('http://ex.com/filme.mp4')).toBe('movie');
    expect(detectStreamType('http://ex.com/filme.mkv')).toBe('movie');
  });

  it('deve retornar movie para group-title contendo FILME', () => {
    expect(detectStreamType('http://ex.com/canal.m3u8', 'Filmes')).toBe('movie');
    expect(detectStreamType('http://ex.com/canal.m3u8', 'Cinema')).toBe('movie');
    expect(detectStreamType('http://ex.com/canal.m3u8', 'VOD')).toBe('movie');
  });

  it('deve retornar series para group-title contendo SERIE', () => {
    expect(detectStreamType('http://ex.com/ep.m3u8', 'Séries')).toBe('series');
    expect(detectStreamType('http://ex.com/ep.m3u8', 'Serie')).toBe('series');
  });

  it('deve retornar series para nome contendo S0 ou EPISODIO', () => {
    expect(detectStreamType('http://ex.com/ep.m3u8', '', 'Serie 1 S01')).toBe('series');
    expect(detectStreamType('http://ex.com/ep.m3u8', '', 'Episodio 1')).toBe('series');
  });

  it('deve retornar live como padrão para URLs HLS', () => {
    expect(detectStreamType('http://ex.com/canal.m3u8')).toBe('live');
    expect(detectStreamType('http://ex.com/playlist.m3u')).toBe('live');
  });
});

describe('streamService - detectCodec', () => {
  it('deve detectar codec para MP4', () => {
    const result = detectCodec('http://ex.com/filme.mp4', 'movie');
    expect(result.codec).toBe('h264');
    expect(result.container).toBe('mp4');
  });

  it('deve detectar codec para MKV', () => {
    const result = detectCodec('http://ex.com/filme.mkv', 'movie');
    expect(result.codec).toBe('hevc');
    expect(result.container).toBe('mkv');
  });

  it('deve retornar HLS para streams ao vivo', () => {
    const result = detectCodec('http://ex.com/canal.m3u8', 'live');
    expect(result.codec).toBe('hls');
    expect(result.container).toBe('m3u8');
  });
});