import { CapacitorHttp } from '@capacitor/core';

const PROXY_URL = 'http://localhost:3131';
const CACHE_KEY = 'nono_epg_cache';
const CACHE_DURATION = 1000 * 60 * 60;

function getProxyUrl(url) {
  if (import.meta.env.DEV) {
    return `${PROXY_URL}/?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function extractXtreamCredentials(url) {
  try {
    const urlObj = new URL(url);
    const username = urlObj.searchParams.get('username');
    const password = urlObj.searchParams.get('password');
    const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.split('/get.php')[0]}`;
    
    if (username && password) {
      return { baseUrl, username, password };
    }
    return null;
  } catch {
    return null;
  }
}

export function detectEPGUrl(sourceUrl) {
  const xtream = extractXtreamCredentials(sourceUrl);
  
  if (xtream) {
    return {
      type: 'xtream',
      url: `${xtream.baseUrl}/xmltv.php?username=${xtream.username}&password=${xtream.password}`
    };
  }
  
  if (sourceUrl.includes('m3u') || sourceUrl.includes('playlist')) {
    const baseUrl = sourceUrl.replace(/(\/playlist|\/lista|\/index).*\.m3u.*/i, '/xmltv.xml');
    if (baseUrl !== sourceUrl) {
      return { type: 'm3u', url: baseUrl };
    }
  }
  
  return null;
}

async function fetchWithProxy(url) {
  const isNative = !!(window.Capacitor?.isNativePlatform?.());
  
  if (isNative) {
    const response = await CapacitorHttp.get({
      url: getProxyUrl(url),
      connectTimeout: 15000,
      readTimeout: 15000
    });
    return response.data;
  }
  
  const res = await fetch(getProxyUrl(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function parseXMLTV(xmlString) {
  const programs = [];
  const channelPrograms = {};
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    const programmeNodes = doc.querySelectorAll('programme');
    
    programmeNodes.forEach(el => {
      const channelId = el.getAttribute('channel');
      const start = el.getAttribute('start');
      const stop = el.getAttribute('stop');
      const title = el.querySelector('title')?.textContent || 'Sem Título';
      const desc = el.querySelector('description')?.textContent || '';
      const category = el.querySelector('category')?.textContent || '';
      const icon = el.querySelector('icon')?.getAttribute('src') || '';
      
      const program = {
        channelId,
        start: new Date(start?.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')),
        stop: new Date(stop?.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')),
        title,
        description: desc,
        category,
        icon
      };
      
      programs.push(program);
      
      if (!channelPrograms[channelId]) {
        channelPrograms[channelId] = [];
      }
      channelPrograms[channelId].push(program);
    });
    
    const canais = doc.querySelectorAll('channel');
    const channelMap = {};
    canais.forEach(el => {
      const id = el.getAttribute('id');
      const name = el.querySelector('display-name')?.textContent || id;
      const icon = el.querySelector('icon')?.getAttribute('src') || '';
      channelMap[id] = { id, name, icon };
    });
    
    return { programs, channelPrograms, channelMap };
  } catch (error) {
    console.error('[EPGService] Parse error:', error);
    return { programs: [], channelPrograms: {}, channelMap: {} };
  }
}

function getCache(key) {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${key}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY}_${key}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Silent fail for localStorage
  }
}

export async function fetchEPG(sourceUrl) {
  const epgInfo = detectEPGUrl(sourceUrl);
  
  if (!epgInfo) {
    console.log('[EPGService] Não foi possível detectar URL de EPG');
    return null;
  }
  
  const cacheKey = btoa(epgInfo.url).slice(0, 32);
  const cached = getCache(cacheKey);
  
  if (cached) {
    console.log('[EPGService] Usando cache');
    return cached;
  }
  
  try {
    console.log('[EPGService] Buscando EPG de:', epgInfo.url);
    const xmlData = await fetchWithProxy(epgInfo.url);
    const parsed = parseXMLTV(xmlData);
    
    if (parsed.programs.length > 0) {
      setCache(cacheKey, parsed);
      console.log('[EPGService] EPG carregado:', parsed.programs.length, 'programas');
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('[EPGService] Erro ao buscar EPG:', error.message);
    return null;
  }
}

export function getCurrentProgram(epgData, channelId) {
  if (!epgData?.channelPrograms?.[channelId]) return null;
  
  const now = new Date();
  const programs = epgData.channelPrograms[channelId];
  
  return programs.find(p => p.start <= now && p.stop > now) || null;
}

export function getNextProgram(epgData, channelId) {
  if (!epgData?.channelPrograms?.[channelId]) return null;
  
  const now = new Date();
  const programs = epgData.channelPrograms[channelId];
  
  return programs.find(p => p.start > now) || null;
}

export function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(start, stop) {
  if (!start || !stop) return '';
  const mins = Math.round((stop - start) / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const minsLeft = mins % 60;
  return `${hours}h${minsLeft ? minsLeft + 'min' : ''}`;
}

export function getProgramsForChannel(epgData, channelId, hours = 4) {
  if (!epgData?.channelPrograms?.[channelId]) return [];
  
  const now = new Date();
  const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const programs = epgData.channelPrograms[channelId];
  
  return programs.filter(p => p.stop > now && p.start < endTime).slice(0, 10);
}

export function getProgramProgress(program) {
  if (!program) return 0;
  const now = new Date();
  const total = program.stop - program.start;
  const elapsed = now - program.start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function isProgramLive(program) {
  if (!program) return false;
  const now = new Date();
  return program.start <= now && program.stop > now;
}

export function isProgramUpcoming(program) {
  if (!program) return false;
  return program.start > new Date();
}

export function getChannelByName(epgData, channelName) {
  if (!epgData?.channelMap) return null;
  
  const searchName = channelName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return Object.values(epgData.channelMap).find(ch => 
    ch.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchName) ||
    searchName.includes(ch.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
}

export function getAllChannelsWithEPG(epgData) {
  if (!epgData?.channelMap) return [];
  
  return Object.values(epgData.channelMap).filter(ch => 
    epgData.channelPrograms?.[ch.id]?.length > 0
  );
}

export function buildCatchupUrl(sourceUrl, streamId, date, durationMinutes = 120) {
  const xtream = extractXtreamCredentials(sourceUrl);
  if (!xtream) return null;
  
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  
  const formatTimestamp = (d) => {
    return d.toISOString().replace(/[-:T]/g, '').split('.')[0] + '00';
  };
  
  const timeshiftUrl = `${xtream.baseUrl}/timeshift/${xtream.username}/${xtream.password}/${formatTimestamp(startDate)}-${formatTimestamp(endDate)}/${streamId}.ts`;
  
  return {
    timeshiftUrl,
    apiUrl: `${xtream.baseUrl}/timeshift.php?username=${xtream.username}&password=${xtream.password}&stream=${streamId}&start=${formatTimestamp(startDate)}&end=${formatTimestamp(endDate)}`
  };
}

export function buildCatchupUrlByTime(sourceUrl, streamId, timestamp) {
  const xtream = extractXtreamCredentials(sourceUrl);
  if (!xtream) return null;
  
  const targetDate = new Date(timestamp * 1000);
  const startTimestamp = formatTimestampForApi(targetDate);
  
  return `${xtream.baseUrl}/timeshift/${xtream.username}/${xtream.password}/${startTimestamp}/${streamId}.ts`;
}

function formatTimestampForApi(date) {
  return date.toISOString().replace(/[-:T]/g, '').split('.')[0] + '00';
}

export function getCatchupDaysAvailable(sourceUrl) {
  const xtream = extractXtreamCredentials(sourceUrl);
  if (!xtream) return 0;
  
  return 7;
}

export function getProgramCatchupUrl(sourceUrl, program, streamId) {
  if (!program?.start) return null;
  
  return buildCatchupUrl(sourceUrl, streamId, program.start, 120);
}

export async function refreshEPG(sourceUrl, force = false) {
  const epgInfo = detectEPGUrl(sourceUrl);
  if (!epgInfo) return null;
  
  const cacheKey = btoa(epgInfo.url).slice(0, 32);
  
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  } else {
    localStorage.removeItem(`${CACHE_KEY}_${cacheKey}`);
  }
  
  try {
    const xmlData = await fetchWithProxy(epgInfo.url);
    const parsed = parseXMLTV(xmlData);
    
    if (parsed.programs.length > 0) {
      setCache(cacheKey, parsed);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('[EPGService] Refresh error:', error.message);
    return null;
  }
}

export default {
  fetchEPG,
  refreshEPG,
  getCurrentProgram,
  getNextProgram,
  getProgramsForChannel,
  getProgramProgress,
  isProgramLive,
  isProgramUpcoming,
  getChannelByName,
  getAllChannelsWithEPG,
  formatTime,
  formatDuration,
  detectEPGUrl,
  extractXtreamCredentials,
  buildCatchupUrl,
  buildCatchupUrlByTime,
  getCatchupDaysAvailable,
  getProgramCatchupUrl
};
