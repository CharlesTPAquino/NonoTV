/**
 * NonoTV — M3U Parser Simplificado
 */
import { detectStreamType } from '../services/streamService';

export function parseM3U(content) {
  if (!content) return [];

  const lines = content.split('\n');
  const items = [];
  let currentItem = null;

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
      const rawName = commaIdx > -1 ? line.substring(commaIdx + 1).trim() : 'Canal Sem Nome';
      
      const groupTitle = groupMatch ? groupMatch[1].trim() : 'Geral';
      
      currentItem.name  = rawName;
      currentItem.group = groupTitle || 'Geral';
      currentItem.logo  = logoMatch ? logoMatch[1] : '';
      currentItem.id    = Math.random().toString(36).substring(2, 9) + Date.now();

    } else if (line.startsWith('http') && currentItem) {
      currentItem.url = line.trim();
      currentItem.type = detectStreamType(currentItem.url, currentItem.group, currentItem.name);
      items.push(currentItem);
      currentItem = null;
    }
  }

  return items;
}