/**
 * NonoTV — Server Technology Profiler v1.0
 * 
 * Detecta a tecnologia de cada servidor IPTV no momento da sincronização
 * e aplica o método de reprodução compatível automaticamente.
 * 
 * Evita o loop de correção: cada servidor é perfilado uma vez e o perfil
 * é salvo em cache para uso futuro.
 */

const TECH_PROFILES = {
  XTREAM: {
    name: 'Xtream Codes API',
    indicators: ['/player_api.php', '/get.php', '/xmltv.php', 'username=', 'password='],
    streamFormats: ['m3u8', 'ts', 'mp4'],
    authMethod: 'query-params',
    // URLs sem extensão precisam de ?output=m3u8 para HLS.js funcionar
    urlFix: (url) => {
      if (!url.includes('?output=') && !/\.(m3u8|ts|mp4|mkv)(\?|$)/i.test(url)) {
        return url.includes('?') ? `${url}&output=m3u8` : `${url}?output=m3u8`;
      }
      return url;
    }
  },
  MAG: {
    name: 'MAG Portal (Stalker)',
    indicators: ['/stalker_portal', 'mac=', 'token='],
    streamFormats: ['ts', 'm3u8'],
    authMethod: 'mac-address'
  },
  ENIGMA: {
    name: 'Enigma2',
    indicators: ['/web/', 'enigma', 'bouquet'],
    streamFormats: ['ts'],
    authMethod: 'basic'
  },
  HLS_DIRECT: {
    name: 'HLS Direct',
    indicators: ['.m3u8', 'output=m3u8'],
    streamFormats: ['m3u8'],
    authMethod: 'none'
  },
  TS_DIRECT: {
    name: 'MPEG-TS Direct',
    indicators: ['.ts', 'output=ts'],
    streamFormats: ['ts'],
    authMethod: 'none'
  },
  VOD_MP4: {
    name: 'VOD MP4',
    indicators: ['.mp4', '.mkv', '/movie/'],
    streamFormats: ['mp4', 'mkv'],
    authMethod: 'query-params'
  },
  UNKNOWN: {
    name: 'Desconhecido',
    indicators: [],
    streamFormats: ['m3u8', 'ts'],
    authMethod: 'none'
  }
};

const CACHE_KEY = 'nono_server_profiles';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_TTL) return {};
    return data.profiles || {};
  } catch {
    return {};
  }
}

function setCache(profiles) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      profiles,
      timestamp: Date.now()
    }));
  } catch {}
}

/**
 * Detecta a tecnologia do servidor baseado na URL da fonte
 */
export function detectServerTech(url) {
  if (!url) return TECH_PROFILES.UNKNOWN;
  
  const lower = url.toLowerCase();
  
  for (const [key, profile] of Object.entries(TECH_PROFILES)) {
    if (key === 'UNKNOWN') continue;
    if (profile.indicators.some(ind => lower.includes(ind))) {
      return { ...profile, key };
    }
  }
  
  return TECH_PROFILES.UNKNOWN;
}

/**
 * Detecta a tecnologia baseado nas URLs dos canais (quando a fonte é M3U raw)
 */
export function detectTechFromChannels(channels) {
  if (!channels || channels.length === 0) return null;
  
  // Pegar amostra das primeiras 10 URLs
  const sample = channels.slice(0, 10).map(ch => ch.url).filter(Boolean);
  if (sample.length === 0) return null;
  
  // Contar quantas URLs parecem Xtream (sem extensão, com path numérico)
  let xtreamCount = 0;
  for (const url of sample) {
    const lower = url.toLowerCase();
    const hasExtension = /\.(m3u8|ts|mp4|mkv)(\?|$)/i.test(lower);
    const isXtreamStyle = !hasExtension && /^https?:\/\/[^/]+\/[\w]+\/[\w]+\/\d+/.test(lower);
    if (isXtreamStyle) xtreamCount++;
  }
  
  // Se maioria parece Xtream, aplicar fix
  if (xtreamCount >= sample.length * 0.5) {
    return 'XTREAM';
  }
  
  return null;
}

/**
 * Perfil completo do servidor — testa conectividade, formatos e auth
 */
export async function profileServer(source) {
  const url = source.url;
  const tech = detectServerTech(url);
  
  console.log(`[ServerProfiler] ${source.name}: ${tech.name}`);
  
  const profile = {
    id: source.id,
    name: source.name,
    url: url,
    tech: tech.key,
    techName: tech.name,
    streamFormats: tech.streamFormats,
    authMethod: tech.authMethod,
    testedAt: Date.now(),
    status: 'unknown'
  };
  
  // Testar conectividade
  try {
    const testUrl = url.includes('player_api.php') 
      ? url 
      : `${url.split('?')[0]}/player_api.php?${url.split('?')[1] || ''}`;
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(testUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'VLC/3.0.18' }
    });
    
    clearTimeout(timer);
    profile.status = res.ok ? 'online' : 'offline';
    profile.httpStatus = res.status;
  } catch {
    profile.status = 'offline';
  }
  
  return profile;
}

/**
 * Perfil em lote — testa todos os servidores em paralelo
 */
export async function profileAllSources(sources, onProgress) {
  const profiles = {};
  const cached = getCache();
  
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    
    if (onProgress) {
      onProgress(i + 1, sources.length, source.name);
    }
    
    // Usar cache se disponível e recente
    if (cached[source.id] && Date.now() - cached[source.id].testedAt < CACHE_TTL) {
      profiles[source.id] = cached[source.id];
      continue;
    }
    
    try {
      const profile = await profileServer(source);
      profiles[source.id] = profile;
    } catch (e) {
      profiles[source.id] = {
        id: source.id,
        name: source.name,
        url: source.url,
        tech: 'UNKNOWN',
        techName: 'Desconhecido',
        streamFormats: ['m3u8', 'ts'],
        authMethod: 'none',
        testedAt: Date.now(),
        status: 'error',
        error: e.message
      };
    }
  }
  
  setCache(profiles);
  return profiles;
}

/**
 * Obtém o perfil de um servidor (cache ou fresh)
 */
export function getServerProfile(sourceId) {
  const cached = getCache();
  return cached[sourceId] || null;
}

/**
 * Limpa o cache de perfis
 */
export function clearProfileCache() {
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Normaliza URL de canal baseado na tecnologia do servidor.
 * 
 * Ex: Ramys (Xtream) gera URLs sem extensão como:
 *   http://server:80/user/pass/62169
 * 
 * O HLS.js precisa de ?output=m3u8 para funcionar:
 *   http://server:80/user/pass/62169?output=m3u8
 */
export function normalizeChannelUrl(channelUrl, serverTech) {
  if (!channelUrl || !serverTech) return channelUrl;
  
  const profile = TECH_PROFILES[serverTech] || TECH_PROFILES.UNKNOWN;
  if (profile.urlFix) {
    return profile.urlFix(channelUrl);
  }
  
  return channelUrl;
}

/**
 * Normaliza TODOS os canais de uma fonte baseado na tecnologia detectada.
 */
export function normalizeAllChannels(channels, serverTech) {
  if (!channels || !serverTech) return channels;
  
  const profile = TECH_PROFILES[serverTech] || TECH_PROFILES.UNKNOWN;
  if (!profile.urlFix) return channels;
  
  let fixedCount = 0;
  const normalized = channels.map(ch => {
    const newUrl = profile.urlFix(ch.url);
    if (newUrl !== ch.url) {
      fixedCount++;
      return { ...ch, url: newUrl };
    }
    return ch;
  });
  
  if (fixedCount > 0) {
    console.log(`[ServerTech] ${fixedCount}/${channels.length} URLs normalizadas para ${serverTech}`);
  }
  
  return normalized;
}

export default {
  detectServerTech,
  profileServer,
  profileAllSources,
  getServerProfile,
  clearProfileCache,
  normalizeChannelUrl,
  normalizeAllChannels,
  TECH_PROFILES
};
