/**
 * Smart Server Orchestrator - NonoTV Elite v4.6
 * Integrando Inteligência de Hardware e Rede
 */

const SERVER_CONFIGS = {
  'amsplay.com': { output: 'ts', agent: 'VLC', buffer: 8000 },
  'canal-pro.xyz': { output: 'ts', agent: 'VLC', buffer: 8000 },
  'ultraflex.top': { output: 'm3u8', agent: 'Smarters', buffer: 5000 },
  'default': { output: 'm3u_plus', agent: 'VLC', buffer: 5000 }
};

export const HARDWARE_PROFILES = {
  LITE: { label: 'Resiliência', maxBuffer: 8, abrFactor: 0.7, uiEffects: false, threads: 1 },
  PRO: { label: 'Equilíbrio', maxBuffer: 15, abrFactor: 0.85, uiEffects: true, threads: 2 },
  ELITE: { label: 'Poder Total', maxBuffer: 40, abrFactor: 0.98, uiEffects: true, threads: 4 }
};

export const detectDeviceProfile = () => {
  try {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 2;
    if (cores >= 4 && (memory >= 4 || memory === undefined)) return HARDWARE_PROFILES.ELITE;
    if (cores <= 2 || memory <= 1) return HARDWARE_PROFILES.LITE;
    return HARDWARE_PROFILES.PRO;
  } catch { return HARDWARE_PROFILES.PRO; }
};

let metrics = {};

export const recordMetric = (url, success, responseTime) => {
  try {
    const domain = new URL(url).hostname;
    if (!metrics[domain]) metrics[domain] = { success: 0, fail: 0, avgTime: 0, lastCheck: Date.now() };
    if (success) {
      metrics[domain].success++;
      metrics[domain].avgTime = metrics[domain].avgTime === 0 ? responseTime : (metrics[domain].avgTime + responseTime) / 2;
    } else metrics[domain].fail++;
    metrics[domain].lastCheck = Date.now();
    localStorage.setItem('nono_server_stats', JSON.stringify(metrics));
  } catch (e) {}
};

export const getMetrics = () => {
  try { return JSON.parse(localStorage.getItem('nono_server_stats') || '{}'); } catch { return {}; }
};

export const resetMetrics = () => localStorage.removeItem('nono_server_stats');

export const testSourceSmart = async (url) => {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'HEAD' });
    recordMetric(url, res.ok, Date.now() - start);
    return { ok: res.ok, time: Date.now() - start };
  } catch {
    recordMetric(url, false, 0);
    return { ok: false, time: 0 };
  }
};

export const testSourcesParallel = async (sources) => Promise.all(sources.map(s => testSourceSmart(s.url)));

export const sortSourcesByPerformance = (sources) => {
  const stats = getMetrics();
  return [...sources].sort((a, b) => {
    const timeA = stats[new URL(a.url).hostname]?.avgTime || 9999;
    const timeB = stats[new URL(b.url).hostname]?.avgTime || 9999;
    return timeA - timeB;
  });
};

export const getSourceStatus = (url) => getMetrics()[new URL(url).hostname] || { success: 0, fail: 0, avgTime: 0 };

export const getOrchestratedUrl = (baseUrl, user, pass) => {
  const config = Object.entries(SERVER_CONFIGS).find(([key]) => baseUrl.includes(key))?.[1] || SERVER_CONFIGS.default;
  if (baseUrl.includes('/get.php') || baseUrl.includes('username=')) return baseUrl;
  const outputParam = config.output === 'ts' ? '&output=ts' : config.output === 'm3u8' ? '&output=m3u8' : '';
  return `${baseUrl}/get.php?username=${user}&password=${pass}&type=m3u_plus${outputParam}`;
};

export default {
  detectDeviceProfile,
  getOrchestratedUrl,
  recordMetric,
  getMetrics,
  resetMetrics,
  testSourceSmart,
  testSourcesParallel,
  sortSourcesByPerformance,
  getSourceStatus,
  HARDWARE_PROFILES
};
