/**
 * NonoTV - Fontes IPTV Ativas
 * Projeto Principal - Mantido em /Secretária/IPTV/meu-iptv/
 * 
 * ATENÇÃO: As credenciais têm fallback para valores padrão.
 * Em produção, use variáveis de ambiente (see .env.example)
 * ou implemente um sistema de autenticação externo.
 * 
 * Atualizado: 29/03/2026
 */

import { CREDENTIALS, buildUrl } from './credentials';

export const SOURCES = [
  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === FONTES PÚBLICAS ===
  { 
    id: 'ramys-brasil',
    name: '🇧🇷 Ramys Mundial', 
    url: 'https://raw.githubusercontent.com/Ramys/Iptv-Brasil-2026/master/CanaisIPTV.m3u',
    category: 'Grátis',
    status: 'testing'
  },
  { 
    id: 'iptv-org-global',
    name: '🌐 Global (Lite)', 
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    category: 'Grátis',
    status: 'stable'
  },

  // === FONTES ANTIGAS DO APK ===
  { 
    id: 'kazing-old',
    name: '🔵 Kazing Premium', 
    url: 'https://kazing.online/lista.m3u',
    category: 'Misto',
    status: 'testing'
  },

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === FONTES DO APK ANTIGO ===
  ...CREDENTIALS.kazingfun.accounts.map((acc, i) => ({
    id: `kazingfun-${i + 1}`,
    name: `🔵 Kazing Fun (${acc.user})`,
    url: buildUrl(CREDENTIALS.kazingfun.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  ...CREDENTIALS.americakg.accounts.map((acc, i) => ({
    id: `americakg-${i + 1}`,
    name: `🌎 AmericaKG (${acc.user})`,
    url: buildUrl(CREDENTIALS.americakg.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === CANAL PRO (Novo - 23/03/2026) ===
  ...CREDENTIALS.canalpro.accounts.map((acc, i) => ({
    id: `cpro-${i + 1}`,
    name: `💎 ${acc.user}`,
    url: buildUrl(CREDENTIALS.canalpro.host, acc.user, acc.pass),
    category: 'Premium',
    expires: acc.expires
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === FONTES SAWSAX (Premium) ===
  ...CREDENTIALS.sawsax.accounts.map((acc, i) => ({
    id: `sawsax-${i + 1}`,
    name: `🔷 Premium (${acc.user})`,
    url: buildUrl(CREDENTIALS.sawsax.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === cdn4k.info (Cristiano) ===
  ...CREDENTIALS.cdn4k.accounts.map((acc, i) => ({
    id: `cdn4k-${i + 1}`,
    name: `📡 Cristiano (${acc.user})`,
    url: buildUrl(CREDENTIALS.cdn4k.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['24/03/2026', '22/04/2026', '11/04/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === 18FEITISARIA86.ORG ===
  ...CREDENTIALS.feitisaria.accounts.map((acc, i) => ({
    id: `18fe-${i + 1}`,
    name: `🔮 Feitissaria (${acc.user})`,
    url: buildUrl(CREDENTIALS.feitisaria.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['Em breve', '13/04/2026', '14/04/2026', '14/04/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === ULTRAFLEX.TOP ===
  ...CREDENTIALS.ultraflex.accounts.map((acc, i) => ({
    id: `ultra-${i + 1}`,
    name: `⚡ Ultraflex (${acc.user})`,
    url: buildUrl(CREDENTIALS.ultraflex.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['14/04/2026', '17/04/2026', '10/10/2026', '12/04/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === ZEROUM.BLOG ===
  ...CREDENTIALS.zeroum.accounts.map((acc, i) => ({
    id: `zero-${i + 1}`,
    name: `🎯 ZeroUm (${acc.user})`,
    url: buildUrl(CREDENTIALS.zeroum.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['11/04/2026', '05/04/2026', '17/04/2026', '15/04/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === P2PREMIUM.CLUB ===
  ...CREDENTIALS.p2premium.accounts.map((acc, i) => ({
    id: `p2p-${i + 1}`,
    name: `📺 P2Premium (${acc.user})`,
    url: buildUrl(CREDENTIALS.p2premium.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['12/03/2026', '22/03/2026', '04/04/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === WOVAVA.TOP ===
  ...CREDENTIALS.wovava.accounts.map((acc, i) => ({
    id: `wova-${i + 1}`,
    name: `🌟 Wovava (${acc.user})`,
    url: buildUrl(CREDENTIALS.wovava.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['08/03/2026', '30/07/2027', '05/03/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === 4KSMARTERSPRO.COM ===
  ...CREDENTIALS.fourksmart.accounts.map((acc, i) => ({
    id: `4ks-${i + 1}`,
    name: `🎬 4KSmart (${acc.user})`,
    url: buildUrl(CREDENTIALS.fourksmart.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['24/04/2027', '04/10/2026', '11/10/2026'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === ETHERTOO.SBS (Ramys) ===
  ...CREDENTIALS.ramys.accounts.map((acc, i) => ({
    id: `ramys-${i + 1}`,
    name: `🔮 Ramys (${acc.user})`,
    url: buildUrl(CREDENTIALS.ramys.host, acc.user, acc.pass),
    category: 'Premium',
    expires: ['28/03/2026', '10/03/2027'][i]
  })),

  // 💎 ©️🄾🄼🄿🅁🄴🄽🅂🅂🄾🅄🅁 💎
  // === BRAZILZÃO TV (DESABILITADO - Problema no servidor) ===
  // ...CREDENTIALS.brazilzao.accounts.map((acc, i) => ({
  //   id: `brazilzao-${i + 1}`,
  //   name: `🇧🇷 Brazilzão (${acc.user})`,
  //   url: buildUrl(CREDENTIALS.brazilzao.host, acc.user, acc.pass),
  //   category: 'Premium',
  //   expires: '16/04/2026'
  // })),
];

export default SOURCES;
