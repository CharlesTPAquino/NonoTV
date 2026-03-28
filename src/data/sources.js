/**
 * NonoTV - Premium Sources Database
 * Adicione ou remova seus servidores IPTV aqui. 
 * Este arquivo é isolado para evitar perda de dados em atualizações de código.
 * 
 * Atualizado: 28/03/2026
 */

export const SOURCES = [
  // === FONTES PRINCIPAIS (Recomendadas) ===
  { 
    id: 'business-cdn-1',
    name: 'Business CDN 8K Pro #1', 
    url: 'http://pro.business-cdn-8kpro.ru:80/c/',
    category: 'Principal',
    mac: '00:1A:79:6E:A8:C4',
    expires: '2027-01-27',
    priority: 1
  },
  { 
    id: 'business-cdn-2',
    name: 'Business CDN 8K Pro #2', 
    url: 'http://pro.business-cdn-8kpro.ru:80/c/',
    category: 'Principal',
    mac: '00:1A:79:C4:D9:52',
    expires: '2026-09-18',
    priority: 2
  },
  { 
    id: 'business-cdn-3',
    name: 'Business CDN 8K Pro #3', 
    url: 'http://pro.business-cdn-8kpro.ru:80/c/',
    category: 'Principal',
    mac: '00:1A:79:30:37:11',
    expires: '2026-10-23',
    priority: 3
  },
  { 
    id: 'business-cdn-4',
    name: 'Business CDN 8K Pro #4', 
    url: 'http://pro.business-cdn-8kpro.ru:80/c/',
    category: 'Principal',
    mac: '00:1A:79:00:18:7F',
    expires: '2026-07-25',
    priority: 4
  },

  // === FONTES M3U (Login/Senha) ===
  { 
    id: '123tv-1',
    name: '123TV Premium #1', 
    url: 'http://123.123tv.to:8080/get.php?username=IpdafRUkSN&password=XSFfLYcjr6&type=m3u_plus',
    category: 'M3U Plus',
    username: 'IpdafRUkSN',
    expires: '2026-09-03',
    priority: 5
  },
  { 
    id: '123tv-2',
    name: '123TV Premium #2', 
    url: 'http://123.123tv.to:8080/get.php?username=Yassinehjem&password=sLjup6MbVi&type=m3u_plus',
    category: 'M3U Plus',
    username: 'Yassinehjem',
    expires: '2026-08-19',
    priority: 6
  },
  { 
    id: '123tv-3',
    name: '123TV Premium #3', 
    url: 'http://123.123tv.to:8080/get.php?username=XUjZIvQloK&password=rNoHWsJye3&type=m3u_plus',
    category: 'M3U Plus',
    username: 'XUjZIvQloK',
    expires: '2026-08-07',
    priority: 7
  },
  { 
    id: '123tv-4',
    name: '123TV Premium #4', 
    url: 'http://123.123tv.to:8080/get.php?username=JuergenBanas&password=WkbCL6Ug2s&type=m3u_plus',
    category: 'M3U Plus',
    username: 'JuergenBanas',
    expires: '2026-06-25',
    priority: 8
  },
  { 
    id: '123tv-5',
    name: '123TV Premium #5', 
    url: 'http://123.123tv.to:8080/get.php?username=HXJNn1kiR6&password=BQ9DtxiMKA&type=m3u_plus',
    category: 'M3U Plus',
    username: 'HXJNn1kiR6',
    expires: '2026-05-29',
    priority: 9
  },
  { 
    id: '123tv-6',
    name: '123TV Premium #6', 
    url: 'http://123.123tv.to:8080/get.php?username=pedrocardoso18&password=twxZzARWVX&type=m3u_plus',
    category: 'M3U Plus',
    username: 'pedrocardoso18',
    expires: '2026-05-23',
    priority: 10
  },
  { 
    id: '123tv-7',
    name: '123TV Premium #7', 
    url: 'http://123.123tv.to:8080/get.php?username=dsNGBCtE9d&password=xfTDr5KXaL&type=m3U_plus',
    category: 'M3U Plus',
    username: 'dsNGBCtE9d',
    expires: '2026-05-04',
    priority: 11
  },
  { 
    id: '123tv-8',
    name: '123TV Premium #8', 
    url: 'http://123.123tv.to:8080/get.php?username=LmMLeBPbFG&password=RSQOrW7k6M&type=m3u_plus',
    category: 'M3U Plus',
    username: 'LmMLeBPbFG',
    expires: '2026-04-30',
    priority: 12
  },

  // === FONTES LEGACY (Originais) ===
  { 
    id: 'iptv-org',
    name: 'IPTV-ORG (Global)', 
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    category: 'Estável'
  },
  { 
    id: 'kazing',
    name: 'Kazing Premium', 
    url: 'https://kazing.online/lista.m3u',
    category: 'Premium'
  },
  { 
    id: 'zeroum',
    name: 'ZeroUm Filmes',   
    url: 'https://zero-um.tv/lista.m3u',
    category: 'VOD'
  },
  { 
    id: 'plus',
    name: 'PlusTV (HLS)',    
    url: 'https://bit.ly/plustv-free',
    category: 'Free'
  }
];
