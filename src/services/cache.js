/**
 * Cache Manager v2
 * Versionamento de dados e isolamento de armazenamento local.
 */
const CACHE_VERSION = 'v2';

function getCacheKey(url) {
  return `nonotv_${CACHE_VERSION}_${btoa(url).slice(0, 40)}`;
}

export function saveToCache(url, data) {
  try {
    localStorage.setItem(getCacheKey(url), JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('[Cache] Falha ao salvar:', e.message);
    return false;
  }
}

export function loadFromCache(url) {
  try {
    const raw = localStorage.getItem(getCacheKey(url));
    if (!raw) return null;
    const data = JSON.parse(raw);
    
    // Verificamos a integridade básica dos dados
    if (data.length > 0 && typeof data[0] === 'object') {
      return data;
    }
    return null;
  } catch (e) {
    console.warn('[Cache] Carregamento falhou:', e.message);
    return null;
  }
}

export function clearCache(url) {
  localStorage.removeItem(getCacheKey(url));
}
