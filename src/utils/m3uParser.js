/**
 * NonoTV — M3U Parser "Safe Mode"
 * Foco total na compatibilidade com APKs Android TV
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
      
      // Captura atributos padrão
      const logoMatch  = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      
      // Captura o NOME REAL (Sempre após a PRIMEIRA vírgula da linha #EXTINF que não esteja entre aspas)
      let commaIdx = -1;
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"') inQuotes = !inQuotes;
        if (line[j] === ',' && !inQuotes) {
          commaIdx = j;
          break;
        }
      }
      const rawName  = commaIdx > -1 ? line.substring(commaIdx + 1).trim() : 'Canal Sem Nome';
      
      currentItem.name  = rawName;
      currentItem.group = (groupMatch ? groupMatch[1] : 'Geral').trim() || 'Geral';
      currentItem.logo  = logoMatch ? logoMatch[1] : '';
      currentItem.id    = Math.random().toString(36).substring(2, 9) + Date.now();

    } else if (line.startsWith('http') && currentItem) {
      currentItem.url = line.trim();
      currentItem.type = detectType(currentItem);

      // Agrupamento Inteligente de Séries
      if (currentItem.type === 'series') {
        const baseName = extractSeriesBase(currentItem.name);
        if (!seriesMap.has(baseName)) {
          seriesMap.set(baseName, { 
            ...currentItem, 
            name: baseName, 
            isSeries: true, 
            episodes: [{ ...currentItem, name: currentItem.name }] 
          });
        } else {
          seriesMap.get(baseName).episodes.push({ ...currentItem, name: currentItem.name });
        }
      } else {
        items.push(currentItem);
      }
      currentItem = null;
    }
  }

  // Adiciona as séries processadas ao final da lista
  seriesMap.forEach(serie => items.push(serie));
  return items;
}

function detectType(c) {
  const group = c.group.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const name  = c.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const url   = c.url.toLowerCase();

  // Séries: devem ter padrão claro de episódio (S01E01, 1x01, Season, Episode, Temporada)
  const seriesPatterns = [
    /S\d{1,2}E\d{1,2}/i,        // S01E01, S1E1
    /\d{1,2}X\d{1,2}/i,          // 1x01
    /\bSEASON\s*\d+/i,           // Season 1
    /\bEPISODE\s*\d+/i,          // Episode 1
    /\bTEMPORADA\s*\d+/i,        // Temporada 1
    /\bEP\s*\d+/i,               // EP 1
    /\bE\d{2}\b/i,               // E01 (mas não no início)
  ];
  const hasSeriesPattern = seriesPatterns.some(p => p.test(c.name));
  
  if (group.includes('SERIE') || hasSeriesPattern || url.includes('/series/')) return 'series';
  
  // Filmes: apenas extensões de vídeo conhecidas ou padrão claro de filme no nome
  const moviePatterns = [
    /\.(mp4|mkv|avi|mov|m4v|wmv|flv|webm)(\?|$)/i,
    /\bFILME\b/i,
    /\bMOVIE\b/i,
    /\bVOD\b/i,
  ];
  const hasMoviePattern = moviePatterns.some(p => p.test(c.url + c.name));
  const isMovieGroup = /^\s*(FILME|MOVIE|VOD)\s*$/i.test(c.group);
  
  if (isMovieGroup || (hasMoviePattern && !group.includes('CANAL'))) return 'movie';
  
  return 'live';
}

function extractSeriesBase(name) {
  // Simplificado para garantir que não quebre nomes complexos
  return name.replace(/\s*[-–|].*/i, '').trim();
}
