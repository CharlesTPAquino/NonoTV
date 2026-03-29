import { describe, it, expect } from 'vitest';
import { parseM3U } from '../utils/m3uParser';

describe('m3uParser', () => {
  it('deve converter corretamente um conteúdo M3U básico', () => {
    const content = `
      #EXTM3U
      #EXTINF:-1 tvg-logo="http://logo.com/c1.png" group-title="ESPORTES",Canais Premium 1
      http://streaming.com/playlist.m3u8
    `;
    const result = parseM3U(content);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Canais Premium 1');
    expect(result[0].group).toBe('ESPORTES');
    expect(result[0].logo).toBe('http://logo.com/c1.png');
  });

  it('deve ser resiliente a quebras de linha Windows e Unix', () => {
    const content = "#EXTINF:-1,C1\r\nhttp://link.com\n#EXTINF:-1,C2\nhttp://link2.com";
    const result = parseM3U(content);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('C1');
    expect(result[1].name).toBe('C2');
  });

  it('deve retornar array vazio para conteúdos inválidos', () => {
    expect(parseM3U("")).toEqual([]);
    expect(parseM3U(null)).toEqual([]);
    expect(parseM3U("texto aleatorio")).toEqual([]);
  });

  it('deve lidar com nomes de canais contendo vírgulas extras', () => {
    const content = '#EXTINF:-1,Canal, Com, Virgula\nhttp://link.com';
    const result = parseM3U(content);
    expect(result[0].name).toBe('Canal, Com, Virgula');
  });
});
