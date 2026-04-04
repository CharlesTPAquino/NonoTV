/**
 * NonoTV AI Hub — P3 + P4 + Video Stitcher
 * 
 * P3: AI Metadata Enrichment (batch Gemini + cache)
 * P4: Auto-quality selector (adapta resolução ao bandwidth)
 * Stitcher: Google Video Stitcher para play instantâneo
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY || "";
const STITCHER_PROJECT_ID = "3722493286327444324";
const STITCHER_LOCATION = "us-central1";
const STITCHER_API = `https://videostitcher.googleapis.com/v1/projects/${STITCHER_PROJECT_ID}/locations/${STITCHER_LOCATION}`;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// ==================== P3: AI Metadata Enrichment ====================

const AI_CACHE_KEY = 'nono_ai_metadata';
const AI_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

function getCachedMetadata() {
  try {
    const cached = localStorage.getItem(AI_CACHE_KEY);
    if (!cached) return {};
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > AI_CACHE_TTL) return {};
    return data.entries || {};
  } catch { return {}; }
}

function setCachedMetadata(entries) {
  try {
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify({
      entries,
      timestamp: Date.now()
    }));
  } catch {}
}

/**
 * P3.1: Batch enrichment com rate limiting e cache
 * Enriquece canais sem descrição em lotes de 10
 */
async function batchEnrichMetadata(channels, batchSize = 10, onProgress = null) {
  if (!genAI) return channels;
  
  const cache = getCachedMetadata();
  const enriched = [];
  let enrichedCount = 0;
  let cacheHitCount = 0;

  const channelsToEnrich = channels.filter(ch => {
    if (cache[ch.id]) {
      cacheHitCount++;
      enriched.push({ ...ch, description: cache[ch.id], aiEnriched: true });
      return false;
    }
    if (ch.description && ch.description.length > 20) return false;
    return true;
  });

  if (channelsToEnrich.length === 0) return channels;

  for (let i = 0; i < channelsToEnrich.length; i += batchSize) {
    const batch = channelsToEnrich.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(ch => aiService.enrichMetadata(ch.name, ch.group || ''))
    );

    results.forEach((result, idx) => {
      const ch = batch[idx];
      if (result.status === 'fulfilled' && result.value) {
        cache[ch.id] = result.value;
        enriched.push({ ...ch, description: result.value, aiEnriched: true });
        enrichedCount++;
      } else {
        enriched.push(ch);
      }
    });

    if (onProgress) {
      onProgress(Math.min(i + batchSize, channelsToEnrich.length), channelsToEnrich.length);
    }

    // Rate limiting — 1.5s entre lotes para não estourar quota
    if (i + batchSize < channelsToEnrich.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  setCachedMetadata(cache);
  console.log(`[AI Batch] ${enrichedCount} novos, ${cacheHitCount} cache`);
  return enriched;
}

/**
 * P3.2: Get AI recommendations
 * Retorna canais baseado em popularidade e grupo
 */
function getRecommendations(channels, count = 8) {
  if (!channels || channels.length === 0) return [];
  
  const groupCounts = {};
  channels.forEach(ch => {
    const group = ch.group || 'Geral';
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  });

  const popularGroups = Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([group]) => group);

  const recommended = channels.filter(ch => popularGroups.includes(ch.group || 'Geral'));
  const shuffled = recommended.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * P3.3: Semantic Search
 * Traduz fala natural em filtros
 */
async function semanticSearch(query) {
  if (!genAI) return { search: query, category: 'All' };
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o cérebro de um app IPTV. Receba uma frase e retorne APENAS um JSON com: 'search' (termo simplificado), 'category' ('live', 'movie', 'series' ou 'All'). Ex: 'Quero ver um desenho' -> { 'search': 'infantil', 'category': 'live' }"
    });
    const result = await model.generateContent(query);
    const text = result.response.text();
    return JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch {
    return { search: query, category: 'All' };
  }
}

// ==================== P4: Auto-Quality Selector ====================

const QUALITY_PROFILES = {
  'slow-2g': { maxBufferLength: 60, maxMaxBufferLength: 120, maxBufferSize: 30 * 1000 * 1000, startLevel: 0, capLevelToPlayerSize: true, testBandwidth: false, abrEwmaDefaultEstimate: 500000 },
  '2g':      { maxBufferLength: 45, maxMaxBufferLength: 90,  maxBufferSize: 40 * 1000 * 1000, startLevel: -1, capLevelToPlayerSize: true, testBandwidth: true, abrEwmaDefaultEstimate: 1000000 },
  '3g':      { maxBufferLength: 30, maxMaxBufferLength: 60,  maxBufferSize: 60 * 1000 * 1000, startLevel: -1, capLevelToPlayerSize: true, testBandwidth: true, abrEwmaDefaultEstimate: 2000000 },
  '4g':      { maxBufferLength: 20, maxMaxBufferLength: 40,  maxBufferSize: 80 * 1000 * 1000, startLevel: -1, capLevelToPlayerSize: false, testBandwidth: true, abrEwmaDefaultEstimate: 5000000 },
};

/**
 * P4.1: Detecta qualidade da conexão atual
 */
function detectConnectionQuality() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return { effectiveType: '4g', downlink: 10, rtt: 50 };
  return {
    effectiveType: conn.effectiveType || '4g',
    downlink: conn.downlink || 10,
    rtt: conn.rtt || 50,
    saveData: conn.saveData || false
  };
}

/**
 * P4.2: Retorna configuração HLS otimizada para a conexão atual
 */
function getAutoQualityConfig(isLive = true) {
  const conn = detectConnectionQuality();
  const profile = QUALITY_PROFILES[conn.effectiveType] || QUALITY_PROFILES['4g'];
  
  // Se Save-Data está ativo, reduz qualidade
  const finalProfile = conn.saveData
    ? { ...profile, maxBufferLength: Math.max(profile.maxBufferLength / 2, 10), startLevel: 0 }
    : profile;

  // Live vs VOD: live precisa de buffer menor
  const baseConfig = isLive
    ? { liveSyncDurationCount: 4, liveMaxLatencyDurationCount: 8, backBufferLength: 5 }
    : { backBufferLength: 30 };

  return {
    enableWorker: true,
    lowLatencyMode: false,
    manifestLoadingMaxRetry: profile.maxBufferLength > 30 ? 12 : 8,
    levelLoadingMaxRetry: profile.maxBufferLength > 30 ? 12 : 8,
    fragLoadingMaxRetry: profile.maxBufferLength > 30 ? 15 : 10,
    manifestLoadingRetryDelay: profile.maxBufferLength > 30 ? 2000 : 1000,
    abrBandWidthFactor: 0.8,
    abrBandWidthUpFactor: 0.5,
    ...baseConfig,
    ...finalProfile
  };
}

/**
 * P4.3: Monitora mudanças de conexão em tempo real
 */
function onConnectionChange(callback) {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return () => {};
  
  conn.addEventListener('change', () => {
    const info = detectConnectionQuality();
    const config = getAutoQualityConfig();
    callback({ info, config });
  });
  
  return () => conn.removeEventListener('change', callback);
}

// ==================== Export ====================

export const aiService = {
  /**
   * Google Video Stitcher — cria sessão de vídeo costurada para play instantâneo
   * 
   * Funcionamento:
   * 1. Envia URL do stream para o Stitcher
   * 2. Stitcher retorna manifest otimizado com ad-insertion e buffer pré-carregado
   * 3. Player usa o manifest stitchado em vez do original
   * 
   * Fallback: se Stitcher falhar, retorna URL original
   */
  async getStitchedManifest(originalUrl, channelData = {}) {
    if (!API_KEY) {
      console.log('[Stitcher] Sem API key, usando URL original');
      return originalUrl;
    }

    try {
      const sessionData = {
        sourceUri: originalUrl,
        adTagUri: '',
        slateConfig: {
          slateVideoUri: ''
        },
        bumperConfig: {
          enableBumper: false
        }
      };

      const response = await fetch(
        `${STITCHER_API}/liveAdTagDetails?alt=json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY
          },
          body: JSON.stringify(sessionData),
          signal: AbortSignal.timeout(5000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[Stitcher] Sessão criada:', data.name);
        return data.playUri || originalUrl;
      }

      console.warn('[Stitcher] Falha, usando URL original');
      return originalUrl;
    } catch (err) {
      console.warn('[Stitcher] Erro:', err.message, '— fallback para URL original');
      return originalUrl;
    }
  },

  async enrichMetadata(channelName, groupName = "") {
    if (!genAI) return "Sintonize agora no melhor conteúdo do NonoTV Elite 4K.";
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Você é um especialista em TV e Cinema. Sua tarefa é escrever descrições curtas (máximo 150 caracteres) e impactantes para canais de TV ou Filmes de IPTV. Use um tom empolgante e profissional."
      });
      const prompt = `Gere uma descrição atraente para o canal/filme: "${channelName}" que pertence à categoria "${groupName}". Não use aspas.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text || "Aproveite a melhor transmissão em Ultra HD.";
    } catch {
      return "Conteúdo Premium NonoTV Elite 4K.";
    }
  },

  batchEnrichMetadata,
  getRecommendations,
  semanticSearch,
  
  // P4 exports
  detectConnectionQuality,
  getAutoQualityConfig,
  onConnectionChange,
  QUALITY_PROFILES
};

export default aiService;
