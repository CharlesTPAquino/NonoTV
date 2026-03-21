export const parseM3U = (content) => {
  const lines = content.split('\n');
  const channels = [];
  let currentGroup = 'Geral';
  let nextId = 10000;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      const info = line;
      const url = lines[i + 1]?.trim();
      
      if (url && !url.startsWith('#')) {
        // Extract attributes
        const nameMatch = info.match(/,(.*)$/);
        const name = nameMatch ? nameMatch[1].trim() : 'Canal Sem Nome';
        
        const logoMatch = info.match(/tvg-logo="([^"]*)"/);
        const logo = logoMatch ? logoMatch[1] : '';
        
        const groupMatch = info.match(/group-title="([^"]*)"/);
        const group = groupMatch ? groupMatch[1] : currentGroup;

        channels.push({
          id: nextId++,
          name: name,
          group: group,
          emoji: '📺',
          logo: logo,
          url: url
        });
        
        i++; // Skip URL line
      }
    }
  }

  return channels;
};
