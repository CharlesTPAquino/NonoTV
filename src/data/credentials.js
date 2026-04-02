/**
 * NonoTV - Credentials Manager
 * Lê credenciais de variáveis de ambiente (build time)
 * Fallback para valores padrão em desenvolvimento
 * 
 * ATENÇÃO: Em produção, use .env para evitar expor credenciais
 */

const getEnv = (key, fallback = '') => {
  return import.meta?.env?.[key] || fallback;
};

export const CREDENTIALS = {
  sawsax: {
    host: getEnv('VITE_SAWSAX_HOST', 'http://185.66.90.170'),
    accounts: [
      { user: getEnv('VITE_SAWSAX_USER_1', 'welligton7753'), pass: getEnv('VITE_SAWSAX_PASS_1', '2336USDGyewz') },
      { user: getEnv('VITE_SAWSAX_USER_2', 'Jacqueline4848'), pass: getEnv('VITE_SAWSAX_PASS_2', '2Denardi48494') },
      { user: getEnv('VITE_SAWSAX_USER_3', 'Fabianoe8449'), pass: getEnv('VITE_SAWSAX_PASS_3', 'Braga28349') },
      { user: getEnv('VITE_SAWSAX_USER_4', 'Avelino38383'), pass: getEnv('VITE_SAWSAX_PASS_4', 'Tv825955') },
      { user: getEnv('VITE_SAWSAX_USER_5', 'LuizClaudio745'), pass: getEnv('VITE_SAWSAX_PASS_5', 'Quarto28384') },
      { user: getEnv('VITE_SAWSAX_USER_6', 'Karina2838'), pass: getEnv('VITE_SAWSAX_PASS_6', 'Tv1824940') },
      { user: getEnv('VITE_SAWSAX_USER_7', 'Carol39494'), pass: getEnv('VITE_SAWSAX_PASS_7', 'Tv834949') },
      { user: getEnv('VITE_SAWSAX_USER_8', 'Diego28449'), pass: getEnv('VITE_SAWSAX_PASS_8', 'Nogueira2458') },
      { user: getEnv('VITE_SAWSAX_USER_9', 'Matheus2849'), pass: getEnv('VITE_SAWSAX_PASS_9', 'Tv27348559') },
      { user: getEnv('VITE_SAWSAX_USER_10', 'Jessicab3513'), pass: getEnv('VITE_SAWSAX_PASS_10', 'Alves2026') },
      { user: getEnv('VITE_SAWSAX_USER_11', 'Ronaldosv001'), pass: getEnv('VITE_SAWSAX_PASS_11', 'eaX3E912345') },
      { user: getEnv('VITE_SAWSAX_USER_12', 'vinicius8328x'), pass: getEnv('VITE_SAWSAX_PASS_12', '1461UPWMncuv') },
      { user: getEnv('VITE_SAWSAX_USER_13', 'Walmir8239'), pass: getEnv('VITE_SAWSAX_PASS_13', 'Tv294595') },
      { user: getEnv('VITE_SAWSAX_USER_14', 'Jefersonrdw58'), pass: getEnv('VITE_SAWSAX_PASS_14', 'Rdw65489') },
      { user: getEnv('VITE_SAWSAX_USER_15', 'Veronica3013'), pass: getEnv('VITE_SAWSAX_PASS_15', 'Corci2024') },
      { user: getEnv('VITE_SAWSAX_USER_16', 'Felipe3021'), pass: getEnv('VITE_SAWSAX_PASS_16', 'Caracciolo2025') },
    ]
  },
  cdn4k: {
    host: getEnv('VITE_CDN4K_HOST', 'http://cdn4k.info:80'),
    accounts: [
      { user: getEnv('VITE_CDN4K_USER_1', 'Evair83'), pass: getEnv('VITE_CDN4K_PASS_1', 'Kshe99') },
      { user: getEnv('VITE_CDN4K_USER_2', 'marcio3425'), pass: getEnv('VITE_CDN4K_PASS_2', 'flores1802') },
      { user: getEnv('VITE_CDN4K_USER_3', 'Gledsontvsam'), pass: getEnv('VITE_CDN4K_PASS_3', 'five638378') },
    ]
  },
  feitisaria: {
    host: getEnv('VITE_18FE_HOST', 'http://18feitisaria86.org:80'),
    accounts: [
      { user: getEnv('VITE_18FE_USER_1', 'a37167770'), pass: getEnv('VITE_18FE_PASS_1', '112233Aa') },
      { user: getEnv('VITE_18FE_USER_2', 'd35u8gtq'), pass: getEnv('VITE_18FE_PASS_2', '3B1dvC') },
      { user: getEnv('VITE_18FE_USER_3', 'juninhosouzax3'), pass: getEnv('VITE_18FE_PASS_3', 'Tvon151122') },
      { user: getEnv('VITE_18FE_USER_4', 'volmirsc'), pass: getEnv('VITE_18FE_PASS_4', '3x5XFc') },
    ]
  },
  ultraflex: {
    host: getEnv('VITE_ULTRA_HOST', 'https://ultraflex.top'),
    accounts: [
      { user: getEnv('VITE_ULTRA_USER_1', '6968392777520'), pass: getEnv('VITE_ULTRA_PASS_1', '261621377702520') },
      { user: getEnv('VITE_ULTRA_USER_2', '20264973172322'), pass: getEnv('VITE_ULTRA_PASS_2', '0369888741520') },
      { user: getEnv('VITE_ULTRA_USER_3', '897549710110825'), pass: getEnv('VITE_ULTRA_PASS_3', '05207413698882') },
      { user: getEnv('VITE_ULTRA_USER_4', 'matheuslfzk'), pass: getEnv('VITE_ULTRA_PASS_4', '@10203040') },
    ]
  },
  zeroum: {
    host: getEnv('VITE_ZERO_HOST', 'https://zeroum.blog'),
    accounts: [
      { user: getEnv('VITE_ZERO_USER_1', '958704991'), pass: getEnv('VITE_ZERO_PASS_1', '301063163') },
      { user: getEnv('VITE_ZERO_USER_2', 'LuizRicardo11'), pass: getEnv('VITE_ZERO_PASS_2', '445355968') },
      { user: getEnv('VITE_ZERO_USER_3', '389tvbox'), pass: getEnv('VITE_ZERO_PASS_3', '210735246') },
      { user: getEnv('VITE_ZERO_USER_4', '638269498'), pass: getEnv('VITE_ZERO_PASS_4', '069221747') },
    ]
  },
  p2premium: {
    host: getEnv('VITE_P2P_HOST', 'http://p2premium.club:80'),
    accounts: [
      { user: getEnv('VITE_P2P_USER_1', 'Lucos1'), pass: getEnv('VITE_P2P_PASS_1', 'Lucos01') },
      { user: getEnv('VITE_P2P_USER_2', 'RaulChavezIPTVCLUB'), pass: getEnv('VITE_P2P_PASS_2', 'S2hK7R5zCBHR') },
      { user: getEnv('VITE_P2P_USER_3', 'jparodi'), pass: getEnv('VITE_P2P_PASS_3', 'FE2rwz9p8KLP') },
    ]
  },
  wovava: {
    host: getEnv('VITE_WOVA_HOST', 'http://wovava.top'),
    accounts: [
      { user: getEnv('VITE_WOVA_USER_1', '292330036'), pass: getEnv('VITE_WOVA_PASS_1', '5179425') },
      { user: getEnv('VITE_WOVA_USER_2', '437263130'), pass: getEnv('VITE_WOVA_PASS_2', 'c620q4216g') },
      { user: getEnv('VITE_WOVA_USER_3', '914795804'), pass: getEnv('VITE_WOVA_PASS_3', 'q253X5887V') },
    ]
  },
  fourksmart: {
    host: getEnv('VITE_4KS_HOST', 'http://4ksmarterspro.com:2052'),
    accounts: [
      { user: getEnv('VITE_4KS_USER_1', 'v2ERHdF8'), pass: getEnv('VITE_4KS_PASS_1', 'rAek4XQ') },
      { user: getEnv('VITE_4KS_USER_2', 'Abderrahim55lg'), pass: getEnv('VITE_4KS_PASS_2', 'uresxts') },
      { user: getEnv('VITE_4KS_USER_3', '26092019SZ'), pass: getEnv('VITE_4KS_PASS_3', '26092020') },
    ]
  },
  ramys: {
    host: getEnv('VITE_RAMYS_HOST', 'http://xlsdfgvertydthdfdfgh5634dsfdsr4f.ethertwo.sbs:80'),
    accounts: [
      { user: getEnv('VITE_RAMYS_USER_1', '33174554'), pass: getEnv('VITE_RAMYS_PASS_1', '29784475') },
      { user: getEnv('VITE_RAMYS_USER_2', '89347528'), pass: getEnv('VITE_RAMYS_PASS_2', '25443698') },
    ]
  },

  canalpro: {
    host: getEnv('VITE_CANALPRO_HOST', 'http://canal-pro.xyz:8080'),
    accounts: [
      { user: 'Luishernandez', pass: 'Luish11209', expires: '17-04-26' },
      { user: '88198747', pass: 'hf84ug87', expires: '15-11-26' },
      { user: '954082158tv', pass: '65apqz', expires: '16-09-26' },
      { user: '56994554577wsp3ztvcuenta2', pass: '10022024ztv', expires: '12-06-26' },
      { user: '89224505', pass: '07092022', expires: '07-06-26' },
    ]
  },

  brazilzao: {
    host: getEnv('VITE_BRAZILZAO_HOST', 'http://brazilzao.top:80'),
    accounts: [
      { user: getEnv('VITE_BRAZILZAO_USER_1', 'ian123'), pass: getEnv('VITE_BRAZILZAO_PASS_1', '252452469') },
    ]
  },

  kazingfun: {
    host: getEnv('VITE_KAZINGFUN_HOST', 'http://kazing.fun'),
    accounts: [
      { user: getEnv('VITE_KAZINGFUN_USER_1', 'jhonny1729'), pass: getEnv('VITE_KAZINGFUN_PASS_1', '882700994121') },
    ]
  },

  americakg: {
    host: getEnv('VITE_AMERICAKG_HOST', 'http://americakg.xyz'),
    accounts: [
      { user: getEnv('VITE_AMERICAKG_USER_1', 'u7yckwn5'), pass: getEnv('VITE_AMERICAKG_PASS_1', 'agkedgp9') },
    ]
  }
};

export const buildUrl = (host, user, pass) => 
  `${host}/get.php?username=${user}&password=${pass}&type=m3u_plus`;

export const getSourceUrl = (provider, accountIndex = 0) => {
  const creds = CREDENTIALS[provider];
  if (!creds || !creds.accounts[accountIndex]) return null;
  
  const { user, pass } = creds.accounts[accountIndex];
  return buildUrl(creds.host, user, pass);
};

export default CREDENTIALS;
