self.onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'PARSE_M3U') {
    try {
      const channels = parseM3U(data.content);
      self.postMessage({ 
        type: 'PARSE_RESULT', 
        success: true, 
        channels,
        sourceId: data.sourceId 
      });
    } catch (error) {
      self.postMessage({ 
        type: 'PARSE_RESULT', 
        success: false, 
        error: error.message,
        sourceId: data.sourceId 
      });
    }
  }
};

function parseM3U(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const lines = content.split(/\r?\n/);
  const channels = [];
  let currentChannel = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const info = parseExtInf(line);
      currentChannel = {
        id: `ch_${Date.now()}_${i}`,
        name: info.name || `Canal ${channels.length + 1}`,
        logo: info.logo || '',
        group: info.group || '',
        tvg: info.tvg || {},
        bits: info.bits,
        voice: info.voice,
        url: '',
        type: 'live'
      };
    } else if (line.startsWith('#EXTGRP:')) {
      if (currentChannel) {
        currentChannel.group = line.replace('#EXTGRP:', '').trim();
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentChannel) {
        currentChannel.url = line;
        
        const typeMatch = currentChannel.group?.toLowerCase() || '';
        if (typeMatch.includes('filme') || typeMatch.includes('movie')) {
          currentChannel.type = 'movie';
        } else if (typeMatch.includes('série') || typeMatch.includes('series')) {
          currentChannel.type = 'series';
        } else {
          currentChannel.type = 'live';
        }
        
        channels.push(currentChannel);
        currentChannel = null;
      }
    }
  }

  return channels;
}

function parseExtInf(line) {
  const result = {
    name: '',
    logo: '',
    group: '',
    tvg: {},
    bits: null,
    voice: null
  };

  const nameMatch = line.match(/,(.+)$/);
  if (nameMatch) {
    result.name = nameMatch[1].trim();
  }

  const logoMatch = line.match(/tvg-logo=["']([^"']*)["']/);
  if (logoMatch) {
    result.logo = logoMatch[1].trim();
  }

  const groupMatch = line.match(/group-title=["']([^"']*)["']/);
  if (groupMatch) {
    result.group = groupMatch[1].trim();
  }

  const tvgNameMatch = line.match(/tvg-name=["']([^"']*)["']/);
  if (tvgNameMatch) {
    result.tvg.name = tvgNameMatch[1].trim();
  }

  const tvgIdMatch = line.match(/tvg-id=["']([^"']*)["']/);
  if (tvgIdMatch) {
    result.tvg.id = tvgIdMatch[1].trim();
  }

  return result;
}
