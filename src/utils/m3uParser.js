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
      
      const logoMatch  = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      
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

  seriesMap.forEach(serie => items.push(serie));
  return items;
}

function detectType(c) {
  const groupUpper = c.group.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const url = c.url.toLowerCase();

  // SÉRIES: group-title contém exatamente "SERIE" (não "Canais de Serie", etc)
  const isSeriesGroup = /^\s*SERIE\s*$/.test(groupUpper);
  
  // Séries: padrões explícitos de episódio no nome
  const seriesPatterns = [
    /S\d{1,2}E\d{1,2}/i,        // S01E01, S1E1, S01E1
    /\d{1,2}X\d{1,2}/i,          // 1x01, 2x03
    /\bSEASON\s*\d+/i,           // Season 1
    /\bEPISODE\s*\d+/i,          // Episode 1  
    /\bTEMPORADA\s*\d+/i,        // Temporada 1
    /\bEP\.?\s*\d+/i,            // EP 1, EP1
    /\bT\d{1,2}\s*E\d{1,2}/i,   // T1E1
  ];
  const hasEpisodePattern = seriesPatterns.some(p => p.test(c.name));
  
  if (isSeriesGroup || hasEpisodePattern || url.includes('/series/')) return 'series';

  // FILMES: group-title é exatamente FILME, MOVIE ou VOD
  const isMovieGroup = /^\s*(FILME|MOVIE|VOD)\s*$/.test(groupUpper);
  
  // Filmes: extensões de vídeo conhecidas
  const videoExtensions = /\.(mp4|mkv|avi|mov|m4v|wmv|flv|webm)(\?|$)/i.test(url);
  
  if (isMovieGroup || videoExtensions) return 'movie';

  // Ao Vivo: tudo o resto (inclui "Canais de Filmes", "Canais de Séries", etc)
  return 'live';
}

function extractSeriesBase(name) {
  // Remove tudo a partir de indicadores de episódio
  const episodeIndicators = [
    /\s+S\d{1,2}E\d{1,2}.*$/i,    // S01E01
    /\s+\d{1,2}X\d{1,2}.*$/i,     // 1x01
    /\s+Season\s*\d+.*$/i,         // Season 1
    /\s+Episode\s*\d+.*$/i,        // Episode 1
    /\s+Temporada\s*\d+.*$/i,      // Temporada 1
    /\s+EP\.?\s*\d+.*$/i,         // EP 1
    /\s+\d{1,3}\s*-\s*\d{1,3}.*$/i, // 1-10, 01-10
  ];
  
  let baseName = name;
  for (const pattern of episodeIndicators) {
    baseName = baseName.replace(pattern, '');
  }
  
  return baseName.trim() || name;
}
