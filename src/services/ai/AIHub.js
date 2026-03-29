import { ollamaClient } from './OllamaClient';
import { mcpClient } from './MCPClient';
import { aiAgents } from './AIAgents';
import { aiSkills } from './AISkills';

export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  LOCAL: 'local',
  CLOUD: 'cloud'
};

export const AI_CAPABILITIES = {
  CHAT: 'chat',
  COMPLETION: 'completion',
  EMBEDDING: 'embedding',
  VISION: 'vision',
  STREAMING: 'streaming'
};

class AIHub {
  constructor() {
    this.config = {
      provider: AI_PROVIDERS.LOCAL,
      model: 'llama3.2',
      temperature: 0.7,
      maxTokens: 2048,
      fallbackToCloud: true
    };
    this.initialized = false;
    this.provider = AI_PROVIDERS.LOCAL;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('[AIHub] Initializing...');
    
    const ollamaStatus = await ollamaClient.checkHealth();
    
    if (ollamaStatus.available) {
      this.provider = AI_PROVIDERS.OLLAMA;
      console.log('[AIHub] Using Ollama (local)');
    } else if (this.config.fallbackToCloud) {
      this.provider = AI_PROVIDERS.CLOUD;
      console.log('[AIHub] Falling back to cloud AI');
    } else {
      this.provider = AI_PROVIDERS.LOCAL;
      console.log('[AIHub] Using offline mode');
    }
    
    await mcpClient.initialize();
    
    this.initialized = true;
    console.log('[AIHub] Ready with provider:', this.provider);
  }

  async chat(messages, options = {}) {
    await this.initialize();
    
    const fullOptions = {
      ...this.config,
      ...options
    };

    try {
      if (this.provider === AI_PROVIDERS.OLLAMA) {
        return await ollamaClient.chat(messages, fullOptions);
      }
      
      return await this.cloudChat(messages, fullOptions);
    } catch (error) {
      console.error('[AIHub] Chat error:', error);
      
      if (this.config.fallbackToCloud && this.provider !== AI_PROVIDERS.CLOUD) {
        return await this.cloudChat(messages, fullOptions);
      }
      
      throw error;
    }
  }

  async cloudChat(messages, options) {
    console.log('[AIHub] Using cloud AI (placeholder)');
    return {
      content: 'Cloud AI not configured. Install Ollama models or configure API keys.',
      provider: AI_PROVIDERS.CLOUD
    };
  }

  async analyzeViewingPatterns(history, channels) {
    const prompt = this.buildViewingAnalysisPrompt(history, channels);
    
    const response = await this.chat([
      { role: 'user', content: prompt }
    ]);
    
    try {
      return JSON.parse(response.content);
    } catch {
      return this.parseTextRecommendations(response.content, channels);
    }
  }

  buildViewingAnalysisPrompt(history, channels) {
    const recentChannels = history.slice(0, 20).map(h => ({
      name: h.name,
      category: h.category,
      watchedAt: new Date(h.lastWatched).toLocaleString('pt-BR')
    }));
    
    return `
Analise o histórico de visualização e recomende canais:

Histórico recente:
${JSON.stringify(recentChannels, null, 2)}

Canais disponíveis:
${channels.slice(0, 50).map(c => `- ${c.name} (${c.group || 'Sem grupo'})`).join('\n')}

Retorne JSON com:
{
  "preferredCategories": ["categoria1", "categoria2"],
  "preferredTimeSlots": ["manhã", "tarde", "noite"],
  "recommendedChannels": ["canal1", "canal2"],
  "insights": "brevem texto sobre o padrão"
}
`.trim();
  }

  parseTextRecommendations(text, channels) {
    const recommended = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const channelName = line.replace(/^[-\d. ]*/, '').trim();
      const channel = channels.find(c => 
        c.name.toLowerCase().includes(channelName.toLowerCase())
      );
      if (channel) recommended.push(channel);
    }
    
    return {
      preferredCategories: [],
      preferredTimeSlots: [],
      recommendedChannels: recommended.slice(0, 10),
      insights: text.substring(0, 200)
    };
  }

  async generateChannelDescription(channel) {
    const prompt = `
Gere uma descrição curta (máximo 100 caracteres) para o canal de TV:
Nome: ${channel.name}
Grupo: ${channel.group || 'Não especificado'}

Retorne apenas a descrição, sem markdown.
`.trim();
    
    const response = await this.chat([
      { role: 'user', content: prompt }
    ]);
    
    return response.content.trim();
  }

  async smartSearch(query, channels, epgData = null) {
    const context = this.buildSearchContext(channels, epgData);
    
    const response = await this.chat([
      { role: 'user', content: `
Busque por canais relacionados à: "${query}"

${context}

Retorne JSON:
{
  "results": [{"id": "canal1", "matchReason": "motivo"}],
  "suggestions": ["sugestão1"]
}
`.trim() }
    ]);
    
    try {
      return JSON.parse(response.content);
    } catch {
      return this.fallbackSearch(query, channels);
    }
  }

  buildSearchContext(channels, epgData) {
    const channelList = channels.slice(0, 30).map(c => 
      `${c.name} - ${c.group || 'Sem grupo'}`
    ).join('\n');
    
    let epgContext = '';
    if (epgData?.programs) {
      const now = new Date();
      const current = epgData.programs.filter(p => 
        p.start <= now && p.stop > now
      ).slice(0, 10);
      
      epgContext = `\nProgramação atual:\n${
        current.map(p => `- ${p.title}`).join('\n')
      }`;
    }
    
    return `Canais:${channelList}${epgContext}`;
  }

  fallbackSearch(query, channels) {
    const q = query.toLowerCase();
    const results = channels
      .filter(c => c.name.toLowerCase().includes(q) || 
                 (c.group || '').toLowerCase().includes(q))
      .slice(0, 10)
      .map(c => ({ id: c.id, matchReason: 'Busca textual' }));
    
    return { results, suggestions: [] };
  }

  getAgents() {
    return aiAgents;
  }

  getSkills() {
    return aiSkills;
  }

  getProvider() {
    return this.provider;
  }

  isReady() {
    return this.initialized;
  }
}

export const aiHub = new AIHub();
export default aiHub;
