import { aiHub } from './AIHub';
import { serverHealthService } from '../ServerHealthService';

class BaseAgent {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      interval: config.interval || 60000,
      enabled: config.enabled ?? true,
      ...config
    };
    this.running = false;
    this.intervalId = null;
    this.history = [];
  }

  async start() {
    if (this.running || !this.config.enabled) return;
    
    console.log(`[Agent:${this.name}] Starting...`);
    this.running = true;
    
    await this.execute();
    
    this.intervalId = setInterval(() => this.execute(), this.config.interval);
  }

  stop() {
    if (!this.running) return;
    
    console.log(`[Agent:${this.name}] Stopping...`);
    this.running = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async execute() {
    try {
      const result = await this.run();
      this.history.push({
        timestamp: Date.now(),
        success: true,
        result
      });
      
      if (this.history.length > 100) {
        this.history = this.history.slice(-100);
      }
      
      return result;
    } catch (error) {
      console.error(`[Agent:${this.name}] Error:`, error);
      
      this.history.push({
        timestamp: Date.now(),
        success: false,
        error: error.message
      });
      
      return null;
    }
  }

  async run() {
    throw new Error('run() must be implemented');
  }

  getHistory() {
    return this.history;
  }

  getStatus() {
    const lastRun = this.history[this.history.length - 1];
    return {
      name: this.name,
      running: this.running,
      lastRun: lastRun?.timestamp,
      lastSuccess: lastRun?.success,
      totalRuns: this.history.length
    };
  }
}

class HealthMonitorAgent extends BaseAgent {
  constructor() {
    super('HealthMonitor', {
      interval: 300000,
      enabled: true,
      alertThreshold: 3
    });
    this.alertThreshold = 3;
    this.failureCount = {};
  }

  async run() {
    const sources = await this.getSources();
    const results = await Promise.all(
      sources.map(source => this.checkSource(source))
    );

    const healthy = results.filter(r => r.healthy).length;
    const total = results.length;
    
    console.log(`[HealthMonitor] ${healthy}/${total} sources healthy`);

    const unhealthy = results.filter(r => !r.healthy);
    
    if (unhealthy.length > 0) {
      for (const source of unhealthy) {
        this.failureCount[source.id] = (this.failureCount[source.id] || 0) + 1;
        
        if (this.failureCount[source.id] >= this.alertThreshold) {
          await this.alert(source);
        }
      }
    } else {
      this.failureCount = {};
    }

    return {
      healthy,
      total,
      unhealthy: unhealthy.map(u => u.id),
      timestamp: Date.now()
    };
  }

  async getSources() {
    try {
      const { useSources } = await import('../../context/SourceContext');
      const context = useSources?.();
      return context?.sources || [];
    } catch {
      return [];
    }
  }

  async checkSource(source) {
    const start = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(source.url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      return {
        id: source.id,
        name: source.name,
        healthy: response.ok,
        latency: Date.now() - start,
        status: response.status
      };
    } catch (error) {
      return {
        id: source.id,
        name: source.name,
        healthy: false,
        error: error.message,
        latency: Date.now() - start
      };
    }
  }

  async alert(source) {
    console.warn(`[HealthMonitor] ALERT: ${source.name} failed ${this.alertThreshold} times`);
    
    try {
      await aiHub.chat([
        { 
          role: 'system', 
          content: 'Você é um assistente de monitoramento de TV IP. Reporte problemas de forma clara e concisa.' 
        },
        {
          role: 'user',
          content: `Alerta: O servidor "${source.name}" está fora do ar há ${this.alertThreshold} verificações. Erro: ${source.error}. Notifique o usuário sobre este problema e sugira ações.`
        }
      ]);
    } catch {
      console.log('[HealthMonitor] AI alert skipped (AI not available)');
    }
  }
}

class RecommendationAgent extends BaseAgent {
  constructor() {
    super('Recommendation', {
      interval: 1800000,
      enabled: true,
      minHistorySize: 5
    });
    this.cachedRecommendations = null;
  }

  async run() {
    const { useSources } = await import('../../context/SourceContext');
    const context = useSources?.();
    
    if (!context) {
      return { error: 'Context not available' };
    }

    const { history, channels } = context;
    
    if (!history || history.length < this.config.minHistorySize) {
      console.log(`[Recommendation] Not enough history (${history?.length || 0})`);
      return { cached: true, recommendations: this.cachedRecommendations };
    }

    try {
      const recommendations = await aiHub.analyzeViewingPatterns(history, channels);
      this.cachedRecommendations = recommendations;
      
      return recommendations;
    } catch (error) {
      console.error('[Recommendation] Error:', error);
      return { error: error.message, cached: true, recommendations: this.cachedRecommendations };
    }
  }

  getRecommendations() {
    return this.cachedRecommendations;
  }
}

class ContentDiscoveryAgent extends BaseAgent {
  constructor() {
    super('ContentDiscovery', {
      interval: 3600000,
      enabled: true
    });
    this.discovered = [];
  }

  async run() {
    const query = this.getDiscoveryQuery();
    
    try {
      const { searchContent } = await import('./MCPClient');
      const results = await searchContent(query, 'channel');
      
      const newChannels = results.results.filter(
        r => !this.discovered.find(d => d.id === r.id)
      );
      
      this.discovered = [...this.discovered, ...newChannels].slice(-50);
      
      return {
        query,
        found: results.count,
        new: newChannels.length,
        channels: newChannels
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  getDiscoveryQuery() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'notícias';
    if (hour >= 12 && hour < 18) return 'esportes';
    if (hour >= 18 && hour < 22) return 'novelas';
    return 'filmes';
  }

  getDiscovered() {
    return this.discovered;
  }
}

class PredictiveBufferAgent extends BaseAgent {
  constructor() {
    super('PredictiveBuffer', {
      interval: 60000,
      enabled: true,
      predictionWindow: 3
    });
    this.patterns = {};
  }

  async run() {
    const { useSources, usePlayer } = await Promise.all([
      import('../../context/SourceContext'),
      import('../../context/PlayerContext')
    ]);
    
    const sourceContext = useSources?.();
    const playerContext = usePlayer?.();
    
    if (!sourceContext?.history || !playerContext?.activeChannel) {
      return { skipped: true, reason: 'No data' };
    }

    const prediction = this.predictNextChannel(
      sourceContext.history,
      playerContext.activeChannel,
      this.config.predictionWindow
    );

    if (prediction) {
      await this.prefetch(prediction);
    }

    return {
      current: playerContext.activeChannel.name,
      prediction,
      confidence: prediction?.confidence || 0
    };
  }

  predictNextChannel(history, currentChannel, window) {
    const recent = history.slice(0, 20);
    
    const currentIdx = recent.findIndex(c => c.id === currentChannel.id);
    
    if (currentIdx === -1 || currentIdx >= recent.length - 2) {
      return null;
    }

    const nextChannel = recent[currentIdx + 1];
    
    if (!nextChannel) return null;

    return {
      channel: nextChannel,
      confidence: 0.7,
      reason: 'sequential_watch'
    };
  }

  async prefetch(prediction) {
    console.log(`[PredictiveBuffer] Prefetching ${prediction.channel.name}`);
    
    try {
      const { prefetchService } = await import('../PrefetchService');
      await prefetchService.prefetchChannel(prediction.channel);
    } catch {
      console.log('[PredictiveBuffer] Prefetch failed');
    }
  }
}

class AgentManager {
  constructor() {
    this.agents = {
      healthMonitor: new HealthMonitorAgent(),
      recommendation: new RecommendationAgent(),
      contentDiscovery: new ContentDiscoveryAgent(),
      predictiveBuffer: new PredictiveBufferAgent()
    };
  }

  async startAll() {
    console.log('[AgentManager] Starting all agents...');
    
    for (const [name, agent] of Object.entries(this.agents)) {
      await agent.start();
    }
    
    return this.getStatus();
  }

  stopAll() {
    console.log('[AgentManager] Stopping all agents...');
    
    for (const agent of Object.values(this.agents)) {
      agent.stop();
    }
  }

  start(name) {
    const agent = this.agents[name];
    if (agent) {
      agent.start();
    }
  }

  stop(name) {
    const agent = this.agents[name];
    if (agent) {
      agent.stop();
    }
  }

  getStatus() {
    return Object.fromEntries(
      Object.entries(this.agents).map(([name, agent]) => [name, agent.getStatus()])
    );
  }

  getAgent(name) {
    return this.agents[name];
  }

  getAllHistory() {
    return Object.fromEntries(
      Object.entries(this.agents).map(([name, agent]) => [name, agent.getHistory()])
    );
  }
}

export const aiAgents = new AgentManager();
export default aiAgents;
