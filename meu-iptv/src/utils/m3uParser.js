/**
 * NonoTV — M3U Parser "Enhanced"
 * Now with intelligent stream type detection (Live/VOD/Series)
 */
import { detectStreamType } from '../services/streamService';

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
      
      // Captura o NOME REAL
      let commaIdx = -1;
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"') inQuotes = !inQuotes;
        if (line[j] === ',' && !inQuotes) {
          commaIdx = j;
          break;
        }
      }
      const rawName = commaIdx > -1 ? line.substring(commaIdx + 1).trim() : 'Canal Sem Nome';
      
      const groupTitle = groupMatch ? groupMatch[1].trim() : 'Geral';
      
      currentItem.name  = rawName;
      currentItem.group = groupTitle || 'Geral';
      currentItem.logo  = logoMatch ? logoMatch[1] : '';
      currentItem.id    = Math.random().toString(36).substring(2, 9) + Date.now();

    } else if (line.startsWith('http') && currentItem) {
      currentItem.url = line.trim();
      
      // Intelligent type detection
      currentItem.type = detectStreamType(currentItem.url, currentItem.group, currentItem.name);

      // Agrupamento de Séries
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

  // Adiciona as séries processadas
  seriesMap.forEach(serie => items.push(serie));
  return items;
}

function extractSeriesBase(name) {
  return name.replace(/\s*[-–|].*/i, '').trim();
}