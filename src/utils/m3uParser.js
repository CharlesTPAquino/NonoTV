/**
 * NonoTV M3U Parser Otimizado
 * Processa listas gigantes com menos consumo de memória e mais velocidade.
 */
export const parseM3U = (content) => {
  if (!content) return [];
  
  // Lida com quebras de linha Windows/Unix e remove espaços extras
  const lines = content.split(/\r?\n/);
  const channels = [];
  let nextId = 10000;

  const parseContentType = (group, url) => {
    // Normalização para lidar com acentos (SÉRIES -> SERIES)
    const normalizedGroup = group.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const lcUrl = url.toLowerCase();
    
    if (normalizedGroup.includes('SERIE') || normalizedGroup.includes('SEASON') || normalizedGroup.includes('NOVELA') || lcUrl.includes('/series/')) {
      return 'series';
    }
    if (normalizedGroup.includes('FILME') || normalizedGroup.includes('CINE') || normalizedGroup.includes('VOD') || normalizedGroup.includes('MOVIE') || lcUrl.endsWith('.mp4') || lcUrl.endsWith('.av')) {
      return 'movie';
    }
    if (lcUrl.includes('/movie/') || lcUrl.endsWith('.mkv')) {
       return 'movie';
    }
    return 'live';
  };

  for (let i = 0; i < lines.length; i++) {
    try {
      const line = lines[i].trim();
      if (!line.startsWith('#EXTINF:')) continue;

      let url = "";
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith('#')) {
          url = nextLine;
          i = j;
          break;
        } else if (nextLine.startsWith('#EXTINF:')) {
          i = j - 1; // Pula para processar esse EXTINF no próximo loop
          break;
        }
      }
      
      if (!url) continue;

      // Extração robusta de atributos
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const nameMatch = line.match(/,(.*)$/); // Pega tudo após a última vírgula
      
      const name = nameMatch ? nameMatch[1].trim() : "CANAL SEM NOME";
      const group = (groupMatch ? groupMatch[1] : (logoMatch ? 'GERAL' : 'VARIADOS')).trim() || 'GERAL';
      const type = parseContentType(group, url);

      channels.push({
        id: nextId++,
        name: name || 'HD SIGNAL',
        group: group,
        type: type,
        logo: logoMatch ? logoMatch[1] : '',
        url: url,
        emoji: '📺'
      });
    } catch (err) {
      console.warn('Erro ao processar entrada M3U, pulando...', err);
    }
  }

  // ─── Post-Processing: Series Grouping (DDD Pattern) ───
  const processed = [];
  const seriesMap = new Map();

  for (const ch of channels) {
    try {
      if (ch.type === 'series') {
        const cleanName = ch.name
          .replace(/\s[sS]\d+.*$/i, '')
          .replace(/\s\[[sS]\d+.*\]/i, '')
          .replace(/\s\(\d{4}\).*$/i, '')
          .trim() || ch.name;
        
        if (!seriesMap.has(cleanName)) {
          const seriesObj = { ...ch, name: cleanName, isSeries: true, episodes: [ch] };
          seriesMap.set(cleanName, seriesObj);
          processed.push(seriesObj);
        } else {
          seriesMap.get(cleanName).episodes.push(ch);
        }
      } else {
        processed.push(ch);
      }
    } catch {
      processed.push(ch);
    }
  }

  return (processed.length > 0 ? processed : channels).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};
