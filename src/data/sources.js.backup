/**
 * NonoTV - Fontes IPTV Ativas
 * Todos os servidores premium e públicos
 */

const buildUrl = (host, user, pass) => 
  `${host}/get.php?username=${user}&password=${pass}&type=m3u_plus`;

export const SOURCES = [
  // === FONTES PÚBLICAS ===
  { 
    id: 'iptv-org',
    name: 'IPTV-ORG (Global)', 
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    category: 'Geral',
    status: 'stable'
  },
  { 
    id: 'kazing',
    name: 'Kazing Premium', 
    url: 'https://kazing.online/lista.m3u',
    category: 'Misto',
    status: 'testing'
  },

  // === cdn4k.info (CRISTIANO) ===
  { id: 'cdn4k-01', name: 'Cristiano (Evair83)', url: buildUrl('http://cdn4k.info:80', 'Evair83', 'Kshe99'), category: 'Premium', expires: '24/03/2026' },
  { id: 'cdn4k-02', name: 'Cristiano (Marcio)', url: buildUrl('http://cdn4k.info:80', 'marcio3425', 'flores1802'), category: 'Premium', expires: '22/04/2026' },
  { id: 'cdn4k-03', name: 'Cristiano (Gledson)', url: buildUrl('http://cdn4k.info:80', 'Gledsontvsam', 'five638378'), category: 'Premium', expires: '11/04/2026' },

  // === 18FEITISARIA86.ORG ===
  { id: '18fe-01', name: 'Feitissaria (a37167770)', url: buildUrl('http://18feitisaria86.org:80', 'a37167770', '112233Aa'), category: 'Premium', expires: 'Em breve' },
  { id: '18fe-02', name: 'Feitissaria (d35u8gtq)', url: buildUrl('http://18feitisaria86.org:80', 'd35u8gtq', '3B1dvC'), category: 'Premium', expires: '13/04/2026' },
  { id: '18fe-03', name: 'Feitissaria (juninhosouzax3)', url: buildUrl('http://18feitisaria86.org:80', 'juninhosouzax3', 'Tvon151122'), category: 'Premium', expires: '14/04/2026' },
  { id: '18fe-04', name: 'Feitissaria (volmirsc)', url: buildUrl('http://18feitisaria86.org:80', 'volmirsc', '3x5XFc'), category: 'Premium', expires: '14/04/2026' },

  // === ULTRAFLEX.TOP ===
  { id: 'ultra-01', name: 'Ultraflex (6968392777520)', url: buildUrl('https://ultraflex.top', '6968392777520', '261621377702520'), category: 'Premium', expires: '14/04/2026' },
  { id: 'ultra-02', name: 'Ultraflex (20264973172322)', url: buildUrl('https://ultraflex.top', '20264973172322', '0369888741520'), category: 'Premium', expires: '17/04/2026' },
  { id: 'ultra-03', name: 'Ultraflex (897549710110825)', url: buildUrl('https://ultraflex.top', '897549710110825', '05207413698882'), category: 'Premium', expires: '10/10/2026' },
  { id: 'ultra-04', name: 'Ultraflex (matheuslfzk)', url: buildUrl('https://ultraflex.top', 'matheuslfzk', '@10203040'), category: 'Premium', expires: '12/04/2026' },

  // === ZEROUM.BLOG ===
  { id: 'zero-01', name: 'ZeroUm (958704991)', url: buildUrl('https://zeroum.blog', '958704991', '301063163'), category: 'Premium', expires: '11/04/2026' },
  { id: 'zero-02', name: 'ZeroUm (LuizRicardo11)', url: buildUrl('https://zeroum.blog', 'LuizRicardo11', '445355968'), category: 'Premium', expires: '05/04/2026' },
  { id: 'zero-03', name: 'ZeroUm (389tvbox)', url: buildUrl('https://zeroum.blog', '389tvbox', '210735246'), category: 'Premium', expires: '17/04/2026' },
  { id: 'zero-04', name: 'ZeroUm (638269498)', url: buildUrl('https://zeroum.blog', '638269498', '069221747'), category: 'Premium', expires: '15/04/2026' },

  // === P2PREMIUM.CLUB ===
  { id: 'p2p-01', name: 'P2Premium (Lucos1)', url: buildUrl('http://p2premium.club:80', 'Lucos1', 'Lucos01'), category: 'Premium', expires: '12/03/2026' },
  { id: 'p2p-02', name: 'P2Premium (RaulChavezIPTVCLUB)', url: buildUrl('http://p2premium.club:80', 'RaulChavezIPTVCLUB', 'S2hK7R5zCBHR'), category: 'Premium', expires: '22/03/2026' },
  { id: 'p2p-03', name: 'P2Premium (jparodi)', url: buildUrl('http://p2premium.club:80', 'jparodi', 'FE2rwz9p8KLP'), category: 'Premium', expires: '04/04/2026' },

  // === WOVAVA.TOP ===
  { id: 'wova-01', name: 'Wovava (292330036)', url: buildUrl('http://wovava.top', '292330036', '5179425'), category: 'Premium', expires: '08/03/2026' },
  { id: 'wova-02', name: 'Wovava (437263130)', url: buildUrl('http://wovava.top', '437263130', 'c620q4216g'), category: 'Premium', expires: '30/07/2027' },
  { id: 'wova-03', name: 'Wovava (914795804)', url: buildUrl('http://wovava.top', '914795804', 'q253X5887V'), category: 'Premium', expires: '05/03/2026' },

  // === 4KSMARTERSPRO.COM ===
  { id: '4ks-01', name: '4KSmart (v2ERHdF8)', url: buildUrl('http://4ksmarterspro.com:2052', 'v2ERHdF8', 'rAek4XQ'), category: 'Premium', expires: '24/04/2027' },
  { id: '4ks-02', name: '4KSmart (Abderrahim55lg)', url: buildUrl('http://4ksmarterspro.com:2052', 'Abderrahim55lg', 'uresxts'), category: 'Premium', expires: '04/10/2026' },
  { id: '4ks-03', name: '4KSmart (26092019SZ)', url: buildUrl('http://4ksmarterspro.com:2052', '26092019SZ', '26092020'), category: 'Premium', expires: '11/10/2026' },

  // === ETHERTOO.SBS (Ramys) ===
  { id: 'ramys-01', name: 'Ramys (33174554)', url: buildUrl('http://xlsdfgvertydthdfdfgh5634dsfdsr4f.ethertwo.sbs:80', '33174554', '29784475'), category: 'Premium', expires: '28/03/2026' },
  { id: 'ramys-02', name: 'Ramys (89347528)', url: buildUrl('http://xlsdfgvertydthdfdfgh5634dsfdsr4f.ethertwo.sbs:80', '89347528', '25443698'), category: 'Premium', expires: '10/03/2027' },
];

export default SOURCES;