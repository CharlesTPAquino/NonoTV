/**
 * NonoTV - Fontes IPTV Ativas
 * Projeto Principal - Mantido em /Secretária/IPTV/meu-iptv/
 * 
 * ATENÇÃO: As credenciais têm fallback para valores padrão.
 * Em produção, use variáveis de ambiente (see .env.example)
 * ou implemente um sistema de autenticação externo.
 * 
 * Atualizado: 17/04/2026
 */

import { CREDENTIALS, buildUrl } from './credentials';

export const SOURCES = [
  // 🇧🇷 FONTES PÚBLICAS (Sempre disponíveis)
  { 
    id: 'ramys-brasil',
    name: '🇧🇷 Ramys Mundial', 
    url: 'https://raw.githubusercontent.com/Ramys/Iptv-Brasil-2026/master/CanaisIPTV.m3u',
    category: 'Grátis',
    status: 'stable'
  },
  { 
    id: 'iptv-org-global',
    name: '🌐 Global (Lite)', 
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    category: 'Grátis',
    status: 'stable'
  },

  // 🇧🇷 RAMYS (ETHERTWO) - Servidor Principal que está FUNCIONANDO
  ...CREDENTIALS.ramys.accounts.map((acc, i) => ({
    id: `ramys-${i + 1}`,
    name: `🇧🇷 Ramys ${i === 0 ? '(Principal)' : `(${i + 1})`}`,
    url: buildUrl(CREDENTIALS.ramys.host, acc.user, acc.pass),
    category: 'Premium',
    priority: i === 0 ? 'high' : 'fallback'
  })),

  // 🌐 FONTES PREMIUM
  ...CREDENTIALS.wovava.accounts.map((acc, i) => ({
    id: `wova-${i + 1}`,
    name: `🌟 Wovava (${acc.user})`,
    url: buildUrl(CREDENTIALS.wovava.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  ...CREDENTIALS.fourksmart.accounts.map((acc, i) => ({
    id: `4ks-${i + 1}`,
    name: `🎬 4KSmart (${acc.user})`,
    url: buildUrl(CREDENTIALS.fourksmart.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  ...CREDENTIALS.p2premium.accounts.map((acc, i) => ({
    id: `p2p-${i + 1}`,
    name: `📺 P2Premium (${acc.user})`,
    url: buildUrl(CREDENTIALS.p2premium.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 💎 CANAL PRO
  ...CREDENTIALS.canalpro.accounts.map((acc, i) => ({
    id: `cpro-${i + 1}`,
    name: `💎 Canal Pro (${acc.user})`,
    url: buildUrl(CREDENTIALS.canalpro.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 📡 CDN4K
  ...CREDENTIALS.cdn4k.accounts.map((acc, i) => ({
    id: `cdn4k-${i + 1}`,
    name: `📡 CDN4K (${acc.user})`,
    url: buildUrl(CREDENTIALS.cdn4k.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // ⚡ ULTRAFLEX
  ...CREDENTIALS.ultraflex.accounts.map((acc, i) => ({
    id: `ultra-${i + 1}`,
    name: `⚡ Ultraflex (${acc.user})`,
    url: buildUrl(CREDENTIALS.ultraflex.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🎯 ZEROUM
  ...CREDENTIALS.zeroum.accounts.map((acc, i) => ({
    id: `zero-${i + 1}`,
    name: `🎯 ZeroUm (${acc.user})`,
    url: buildUrl(CREDENTIALS.zeroum.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🔮 FEITISARIA
  ...CREDENTIALS.feitisaria.accounts.map((acc, i) => ({
    id: `18fe-${i + 1}`,
    name: `🔮 Feitissaria (${acc.user})`,
    url: buildUrl(CREDENTIALS.feitisaria.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🇧🇷 BRAZILZÃO
  ...CREDENTIALS.brazilzao.accounts.map((acc, i) => ({
    id: `brazilzao-${i + 1}`,
    name: `🇧🇷 Brazilzão (${acc.user})`,
    url: buildUrl(CREDENTIALS.brazilzao.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🔵 KAZING FUN
  ...CREDENTIALS.kazingfun.accounts.map((acc, i) => ({
    id: `kazingfun-${i + 1}`,
    name: `🔵 Kazing Fun (${acc.user})`,
    url: buildUrl(CREDENTIALS.kazingfun.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🇺🇸 AMERICAKG - MELHOR SERVIDOR
  ...CREDENTIALS.americakg.accounts.map((acc, i) => ({
    id: `americakg-${i + 1}`,
    name: `🇺🇸 AmerikaKG ${i === 0 ? '(Principal)' : `(${i + 1})`}`,
    url: buildUrl(CREDENTIALS.americakg.host, acc.user, acc.pass),
    category: 'Premium',
    priority: i === 0 ? 'high' : 'fallback'
  })),

  // 🟢 MX51 (restaurado do backup)
  ...CREDENTIALS.mx51.accounts.map((acc, i) => ({
    id: `mx51-${i + 1}`,
    name: `🟢 MX51 (${acc.user})`,
    url: buildUrl(CREDENTIALS.mx51.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🎬 AMSPLAY (restaurado do backup)
  ...CREDENTIALS.amsplay.accounts.map((acc, i) => ({
    id: `amsplay-${i + 1}`,
    name: `🎬 AmsPlay (${acc.user})`,
    url: buildUrl(CREDENTIALS.amsplay.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 👥 GPAMIGOS (restaurado do backup)
  ...CREDENTIALS.gpamigos.accounts.map((acc, i) => ({
    id: `gpamigos-${i + 1}`,
    name: `👥 GPAmigos (${acc.user})`,
    url: buildUrl(CREDENTIALS.gpamigos.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🍳 CHEFEM CASA (restaurado do backup)
  ...CREDENTIALS.chefemcasa.accounts.map((acc, i) => ({
    id: `chefemcasa-${i + 1}`,
    name: `🍳 Chef em Casa (${acc.user})`,
    url: buildUrl(CREDENTIALS.chefemcasa.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🦅 FALCON12 (restaurado do backup)
  ...CREDENTIALS.falcon12.accounts.map((acc, i) => ({
    id: `falcon12-${i + 1}`,
    name: `🦅 Falcon12 (${acc.user})`,
    url: buildUrl(CREDENTIALS.falcon12.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 📺 SANSUY TV (restaurado do backup)
  ...CREDENTIALS.sansuygtv.accounts.map((acc, i) => ({
    id: `sansuygtv-${i + 1}`,
    name: `📺 Sansuy TV (${acc.user})`,
    url: buildUrl(CREDENTIALS.sansuygtv.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // ⚔️ GOD OF WAR (DNSROT.VIP - USA)
  ...CREDENTIALS.godofwar.accounts.map((acc, i) => ({
    id: `godofwar-${i + 1}`,
    name: `⚔️ God of War ${i + 1}`,
    url: buildUrl(CREDENTIALS.godofwar.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🌙 SUZANOR (FLOWINBLER.NET)
  ...CREDENTIALS.suzanor.accounts.map((acc, i) => ({
    id: `suzanor-${i + 1}`,
    name: `🌙 Suzanor Flowinbler`,
    url: buildUrl(CREDENTIALS.suzanor.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // 🔷 SRV3 (SRV3.SITE)
  ...CREDENTIALS.srv3.accounts.map((acc, i) => ({
    id: `srv3-${i + 1}`,
    name: `🔷 SRV3`,
    url: buildUrl(CREDENTIALS.srv3.host, acc.user, acc.pass),
    category: 'Premium'
  })),

  // ☁️ CLDPLAY (SRV.CLDPLAY.IN)
  ...CREDENTIALS.cldplay.accounts.map((acc, i) => ({
    id: `cldplay-${i + 1}`,
    name: `☁️ CLDPlay`,
    url: buildUrl(CREDENTIALS.cldplay.host, acc.user, acc.pass),
    category: 'Premium'
  })),
];

export default SOURCES;
