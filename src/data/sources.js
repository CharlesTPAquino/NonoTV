/**
 * NonoTV - Premium Sources Database
 * Adicione ou remova seus servidores IPTV aqui. 
 * Este arquivo é isolado para evitar perda de dados em atualizações de código.
 * 
 * Atualizado: 28/03/2026
 */

export const SOURCES = [
  // === FONTES TESTADAS E FUNCIONANDO ===
  { 
    id: '123tv-1',
    name: '123TV Premium', 
    url: 'http://123.123tv.to:8080/get.php?username=IpdafRUkSN&password=XSFfLYcjr6&type=m3u_plus',
    category: 'M3U Plus'
  },
  { 
    id: 'meusrv-1',
    name: 'MeuServidor Top #1', 
    url: 'http://meusrv.top:80/get.php?username=781382867&password=443613344&type=m3u_plus',
    category: 'Premium'
  },
  { 
    id: 'meusrv-2',
    name: 'MeuServidor Top #2', 
    url: 'http://meusrv.top:80/get.php?username=383786486&password=398856376&type=m3u_plus',
    category: 'Premium'
  },
  { 
    id: 'meusrv-3',
    name: 'MeuServidor Top #3', 
    url: 'http://meusrv.top:80/get.php?username=388847590&password=713974775&type=m3u_plus',
    category: 'Premium'
  },
  { 
    id: 'meusrv-4',
    name: 'MeuServidor Top #4', 
    url: 'http://meusrv.top:80/get.php?username=131987870&password=677189455&type=m3u_plus',
    category: 'Premium'
  },

  // === FONTES ABERTAS ===
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
