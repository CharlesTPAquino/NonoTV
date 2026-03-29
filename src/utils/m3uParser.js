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
            name: currentItem.name, 
            originalName: currentItem.name,
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

  if (group.includes('SERIE') || name.includes('S0') || url.includes('/series/')) return 'series';
  if (group.includes('FILME') || group.includes('VOD') || url.includes('/movie/')) return 'movie';
  if (/\.(mp4|mkv|avi|mov|m4v)(\?|$)/i.test(url)) return 'movie';
  
  return 'live';
}

function extractSeriesBase(name) {
  // Simplificado para garantir que não quebre nomes complexos
  return name.replace(/\s*[-–|].*/i, '').trim();
}
