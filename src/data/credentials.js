/**
 * NonoTV - Credentials Manager
 * Lê credenciais de variáveis de ambiente (build time)
 * Fallback para valores padrão em desenvolvimento
 * 
 * ATENÇÃO: Em produção, use .env para evitar expor credenciais
 */

import { getOrchestratedUrl } from '../services/SmartServerOrchestrator';

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
  },

  mx51: {
    host: getEnv('VITE_MX51_HOST', 'http://s.mx51.online'),
    accounts: [
      { user: 'Carlosfxvelha', pass: '753Zdv64725', expires: '26-03-26' },
      { user: 'Emanuele2489', pass: 'Bw23gH', expires: '04-05-26' },
      { user: '82127915', pass: '29584856458', expires: '28-02-26' },
      { user: 'EdilmaT1859868', pass: 'CostaE7676XX', expires: '06-03-26' },
      { user: 'YA4S5BZC', pass: '83UJQma3', expires: '25-02-26' },
      { user: 'renan1041', pass: '54s6d5t322', expires: '05-03-26' },
      { user: 'maiconleal2', pass: 'mai84696722', expires: '05-03-26' },
      { user: '11977398911', pass: 'edvaldo170264', expires: '23-03-26' },
      { user: 'davisangineto001tv', pass: '018191910maac', expires: '12-03-26' },
      { user: 'Luaratv34', pass: 'mnb25301090', expires: '15-03-26' },
      { user: 'Ze290624', pass: 'tv8899546778', expires: '04-03-26' },
      { user: 'fabriciomgodoi1', pass: '5083715604', expires: '08-03-26' },
      { user: 'lrboscariol', pass: '9G58pSucss', expires: '24-03-26' },
      { user: 'hdAD32', pass: '4DaRb3', expires: '18-03-26' },
      { user: 'gustavo41pai', pass: 'iB9352', expires: '24-05-26' },
      { user: 'Jaco1032', pass: 'J15c', expires: '19-03-26' },
      { user: 'adolfo28364916', pass: '29363926384', expires: '14-03-26' },
      { user: 'victoralbuquerque', pass: 'vt2080904050', expires: '14-03-26' },
      { user: 'luiznunes', pass: '937274ab', expires: '11-03-26' },
      { user: '4196356700', pass: 'h4080905065', expires: '02-03-26' },
      { user: '98874014412', pass: 'a988740144a', expires: '22-03-26' },
      { user: '11973636893', pass: 'renatooliveira2023', expires: '01-06-26' },
      { user: '64362502', pass: 'br423374538', expires: '02-03-26' },
      { user: 'eliaspedregu', pass: '29ac09ac12ac', expires: '10-03-26' },
      { user: 'eiuKyO07120', pass: 'Katia19843022', expires: '06-03-26' },
      { user: 'tvteste01', pass: '08000272mac', expires: '10-03-26' },
      { user: 'danilo053', pass: '14122890632', expires: '04-03-26' },
      { user: 'raqueltelefthtertosemp', pass: 'gfdsa5432198', expires: '13-03-26' },
      { user: 'rodrigo7631', pass: 'd654dsf1w4as', expires: '27-02-26' },
      { user: 'tainaraissa', pass: 'CL100724ctv', expires: '17-03-26' },
      { user: 'victorjesus', pass: '1792739627ab', expires: '24-03-26' },
      { user: 'luizval', pass: 'Asd123', expires: '08-03-26' },
      { user: 'MarcosTeo27', pass: 'Mt357992758', expires: '09-03-26' },
      { user: 'reginaldocampos', pass: 'hCKsf9yGtz', expires: '04-04-26' },
      { user: 'didi071056', pass: '071056didi', expires: '23-03-26' },
      { user: 'Cristian13579', pass: 'Cr135', expires: '08-03-26' },
      { user: '19998808440', pass: 'h40809050', expires: '28-02-26' },
      { user: 'Julio41298762', pass: 'C4ABWGQYsp', expires: '14-03-26' },
      { user: '84107381', pass: '87637363838', expires: '25-02-26' },
      { user: 'euniceusa', pass: '23ferre777BBB', expires: '30-09-26' },
      { user: 'Conrado', pass: 'Co102', expires: '11-03-26' },
      { user: 'WENDER024', pass: 'D2c9F1', expires: '13-03-26' },
      { user: 'UoTGA3DlrR', pass: '6XHCsxAOTddr', expires: '18-03-26' },
      { user: 'QNxFXKJweq', pass: 'gTht5ZXmkQ', expires: '23-03-26' },
      { user: 'frodrigues', pass: 'fr9785953118', expires: '03-03-26' },
      { user: 'Sebastiao2782', pass: '68vBWe', expires: '11-05-26' },
      { user: 'Elaine8585', pass: '29337355198', expires: '06-03-26' },
      { user: 'alexandre9938', pass: '99381640xxx', expires: '03-03-26' },
      { user: 'cesar8821', pass: '88217234scs', expires: '02-03-26' },
      { user: 'wagner2025', pass: 'Ee8s9G', expires: '07-03-26' },
      { user: 'valdemarmarli', pass: '55996724808', expires: '03-03-26' },
      { user: 'eddydicabra', pass: '59qv5qoimhr', expires: '06-04-26' },
      { user: 'Andreluis', pass: 'P95eTnEZV', expires: '03-03-26' },
      { user: '11968826329', pass: 'angelo300661', expires: '10-06-26' },
      { user: 'Mg10', pass: 'Vip10', expires: '17-04-26' },
      { user: 'nelsontv', pass: 'JOjo1214tv', expires: '07-03-26' },
      { user: '27047644', pass: '87163592zxc', expires: '24-02-26' },
      { user: 'CrisMae1', pass: 'maiptv98768823', expires: '06-03-26' },
      { user: 'tatiana9944', pass: 'Ta994a', expires: '13-03-26' },
      { user: 'Marise2024', pass: '19305314592', expires: '21-07-26' },
      { user: 'gilvan1326', pass: 'cb67sg39svg', expires: '26-03-26' },
      { user: 'Miranda40s', pass: 'Leloli091hj', expires: '08-03-26' },
      { user: 'silvinha42', pass: 'wagnerd2024', expires: '26-02-26' },
    ]
  },

  amsplay: {
    host: 'http://amsplay.com:80',
    accounts: [
      { user: 'a37167770', pass: '112233Aa', expires: '22-04-26' },
      { user: 'Xjq726PXm75jX', pass: 'Ry83776uY38', expires: '04-04-26' },
      { user: 'Aquiles2', pass: 'Aq96788998', expires: '27-04-26' },
      { user: 'Marcostv1000', pass: 'Ma101214', expires: '14-04-26' },
      { user: '267500', pass: 'pPgp2J', expires: 'ilimitado' },
      { user: '950930', pass: 'Factor4k', expires: '14-04-26' },
      { user: 'Maxwell5680', pass: 'R3aaS1', expires: '17-04-26' },
      { user: 'FranciscoJesuus', pass: '8KFjb6', expires: '02-04-26' },
    ]
  },

  gpamigos: {
    host: getEnv('VITE_GPAMIGOS_HOST', 'http://d.plmv.site'),
    accounts: [
      { user: 'gerivaldovaldo', pass: '100limitscell', expires: '07-04-26' },
    ]
  },

  chefemcasa: {
    host: getEnv('VITE_CHEFEMCASA_HOST', 'http://dj.chefemcasa.store:80'),
    accounts: [
      { user: 'FV280724', pass: 'FV8855338855', expires: '28-04-26' },
    ]
  },

  falcon12: {
    host: getEnv('VITE_FALCON12_HOST', 'http://falcon12.top:80'),
    accounts: [
      { user: '624793687', pass: '377283764', expires: '16-07-26' },
    ]
  },

  sansuygtv: {
    host: getEnv('VITE_SANSUYTV_HOST', 'http://sansuygtv.site:80'),
    accounts: [
      { user: '19998728046', pass: 'eli19734848', expires: '11-04-26' },
    ]
  },
};

export const buildUrl = (host, user, pass) => getOrchestratedUrl(host, user, pass);

export const getSourceUrl = (provider, accountIndex = 0) => {
  const creds = CREDENTIALS[provider];
  if (!creds || !creds.accounts[accountIndex]) return null;
  
  const { user, pass } = creds.accounts[accountIndex];
  return buildUrl(creds.host, user, pass);
};

export default CREDENTIALS;
