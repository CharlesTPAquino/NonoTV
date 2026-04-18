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

  // 🇺🇸 AMERIKAKG - MELHOR SERVIDOR (Principal)
  ...CREDENTIALS.americakg.accounts.map((acc, i) => ({
    id: `americakg-${i + 1}`,
    name: `🇺🇸 AmerikaKG ${i === 0 ? '(Principal)' : `(${i + 1})`}`,
    url: buildUrl(CREDENTIALS.americakg.host, acc.user, acc.pass),
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
];

export default SOURCES;
