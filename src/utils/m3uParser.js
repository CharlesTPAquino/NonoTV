/**
 * NonoTV — M3U Parser v2
 * Detecção de tipo ampla para playlists IPTV brasileiras
 */
export function parseM3U(content) {
  if (!content) return [];

  const lines = content.split('\n');
  const items = [];
  let currentItem = null;
  const seriesMap = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentItem = {};

      const nameMatch  = line.match(/tvg-name="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const logoMatch  = line.match(/tvg-logo="([^"]+)"/i);
      // Encontra a vírgula que separa atributos do nome do canal.
      // Estratégia: primeira vírgula APÓS a última aspa fechada (fim dos atributos).
      // Para linhas sem atributos (ex: #EXTINF:-1,Canal, Com, Virgula),
      // usa a primeira vírgula — preserva vírgulas no nome.
      const lastQuoteIdx = line.lastIndexOf('"');
      const commaIdx = lastQuoteIdx >= 0
        ? line.indexOf(',', lastQuoteIdx)   // após atributos entre aspas
        : line.indexOf(',');                // sem atributos: primeira vírgula

      currentItem.name  = (nameMatch ? nameMatch[1] : commaIdx > -1 ? line.substring(commaIdx + 1).trim() : '').trim() || 'Canal';
      currentItem.group = (groupMatch ? groupMatch[1] : 'Geral').trim();
      currentItem.logo  = logoMatch ? logoMatch[1] : '';
      currentItem.id    = Math.random().toString(36).substring(2, 9) + Date.now();

    } else if (line.startsWith('http') && currentItem) {
      currentItem.url  = line;
      currentItem.type = detectType(currentItem);

      if (currentItem.type === 'series') {
        const baseName = extractSeriesBase(currentItem.name);
        const key      = normalize(baseName);

        if (!seriesMap.has(key)) {
          seriesMap.set(key, { ...currentItem, name: baseName, isSeries: true, episodes: [currentItem] });
        } else {
          seriesMap.get(key).episodes.push(currentItem);
        }
      } else {
        items.push(currentItem);
      }

      currentItem = null;
    }
  }

  seriesMap.forEach(serie => items.push(serie));
  console.log(`[Parser] ${items.length} itens (${[...seriesMap.values()].length} séries agrupadas)`);
  return items;
}

// ─── Detecção de tipo ampla para playlists BR ─────────────────────────────────

function detectType(c) {
  const group = removeDiacritics((c.group || '')).toUpperCase();
  const name  = removeDiacritics((c.name  || '')).toUpperCase();
  const url   = (c.url || '').toLowerCase();

  // ── Séries ───────────────────────────────────────────────────────────────────
  const seriesKeywords = [
    'SERIE', 'SERIES', 'SEASON', 'TEMPORADA', 'EPISODIO', 'EPISODE',
    'S0', 'S1', 'S2', 'S3', 'S4', // S01, S02...
  ];
  if (seriesKeywords.some(k => group.includes(k) || name.includes(k))) return 'series';
  if (/S\d{1,2}E\d{1,2}/i.test(c.name)) return 'series'; // padrão S01E01
  if (url.includes('/series/') || url.includes('/serie/'))           return 'series';

  // ── Filmes ────────────────────────────────────────────────────────────────────
  const movieKeywords = [
    'FILME', 'FILMES', 'MOVIE', 'MOVIES', 'CINEMA', 'VOD',
    'LANCAMENTO', 'LANÇAMENTO', 'ESTREIA', '4K', 'DUBLADO',
    'LEGENDADO', 'NACIONAL', 'INTERNACIONAL',
  ];
  if (movieKeywords.some(k => group.includes(k)))          return 'movie';
  if (['FILME', 'FILMES', 'MOVIE', 'MOVIES'].some(k => name.includes(k))) return 'movie';
  if (url.includes('/movie/') || url.includes('/filme/'))  return 'movie';
  // Extensão de arquivo = VOD direto
  if (/\.(mp4|mkv|avi|mov|m4v)(\?|$)/i.test(url))         return 'movie';

  // ── Ao vivo (padrão) ──────────────────────────────────────────────────────────
  return 'live';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalize(str) {
  return removeDiacritics(str).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function extractSeriesBase(name) {
  // Remove padrões como S01E02, T1, Ep3, 1x02 do final do nome
  return name
    .replace(/\s*[-–]\s*S\d+\s*E\d+.*/i, '')
    .replace(/\s*S\d{1,2}E\d{1,2}.*/i, '')
    .replace(/\s*T\d+\s*Ep\d+.*/i, '')
    .replace(/\s*\d+x\d+.*/i, '')
    .replace(/\s*[-–|]\s*Ep(isodio|isódio)?\s*\d+.*/i, '')
    .trim();
}
