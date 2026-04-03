/**
 * NonoTV — M3U Parser Otimizado
 * Processamento em chunks para listas grandes
 */

export function parseM3U(content, onProgress) {
  if (!content) return [];

  const lines = content.split('\n');
  const totalLines = lines.length;
  const result = {
    live: [],
    movie: [],
    series: []
  };
  
  let currentItem = null;
  const seriesMap = new Map();
  
  const CHUNK_SIZE = 1000;
  let processedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentItem = {};
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const commaIdx = line.indexOf(',');
      const rawName = commaIdx > -1 ? line.substring(commaIdx + 1).trim() : 'Canal Sem Nome';
      
      currentItem.name = rawName;
      currentItem.group = (groupMatch ? groupMatch[1] : 'Geral').trim() || 'Geral';
      currentItem.logo = logoMatch ? logoMatch[1] : '';
      currentItem.id = `ch_${i}_${Math.random().toString(36).substring(2, 5)}`;

    } else if (line.startsWith('http') && currentItem) {
      currentItem.url = line.trim();
      const type = detectType(currentItem);
      currentItem.type = type;

      if (type === 'series') {
        const baseName = extractSeriesBase(currentItem.name);
        if (!seriesMap.has(baseName)) {
          const serie = { ...currentItem, isSeries: true, episodes: [currentItem] };
          seriesMap.set(baseName, serie);
          result.series.push(serie);
        } else {
          seriesMap.get(baseName).episodes.push(currentItem);
        }
      } else if (type === 'movie') {
        result.movie.push(currentItem);
      } else {
        result.live.push(currentItem);
      }
      currentItem = null;
    }

    processedLines++;
    if (onProgress && processedLines % CHUNK_SIZE === 0) {
      onProgress(processedLines, totalLines);
    }
  }
  
  // Retornar flat list mas priorizando LIVE
  return [...result.live, ...result.movie, ...result.series];
}

function detectType(c) {
  if (!c) return 'live';
  const group = (c.group || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const name = (c.name || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const url = (c.url || '').toLowerCase();

  if (group.includes('SERIE') || name.includes('S0') || url.includes('/series/')) return 'series';
  if (group.includes('FILME') || group.includes('VOD') || url.includes('/movie/')) return 'movie';
  if (/\.(mp4|mkv|avi|mov|m4v)(\?|$)/i.test(url)) return 'movie';
  
  return 'live';
}

function extractSeriesBase(name) {
  return name.replace(/\s*[-–|].*/i, '').trim();
}

export function parseM3UFast(content) {
  if (!content) return [];
  
  const items = [];
  const lines = content.split('\n');
  
  let currentItem = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('#EXTINF:')) continue;
    
    const urlLine = lines[i + 1]?.trim();
    if (!urlLine || !urlLine.startsWith('http')) continue;
    
    const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
    const groupMatch = line.match(/group-title="([^"]+)"/i);
    const commaIdx = line.indexOf(',');
    const name = commaIdx > -1 ? line.substring(commaIdx + 1).trim() : 'Canal';
    
    items.push({
      id: `ch_${Math.random().toString(36).substring(2, 9)}${i}`,
      name,
      group: groupMatch ? groupMatch[1] : 'Geral',
      logo: logoMatch ? logoMatch[1] : '',
      url: urlLine,
      type: 'live'
    });
    
    i++;
  }
  
  return items;
}

export function groupChannelsByCategory(channels) {
  const categories = {};
  
  for (const channel of channels) {
    const group = channel.group || 'Geral';
    if (!categories[group]) {
      categories[group] = [];
    }
    categories[group].push(channel);
  }
  
  return categories;
}

export function sortChannels(channels, sortBy = 'name') {
  return [...channels].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'group') return (a.group || '').localeCompare(b.group || '');
    return 0;
  });
}
