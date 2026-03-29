import { aiHub } from './AIHub';

class BaseSkill {
  constructor(name, config = {}) {
    this.name = name;
    this.description = config.description || '';
    this.parameters = config.parameters || {};
    this.examples = config.examples || [];
  }

  async execute(params = {}) {
    throw new Error('execute() must be implemented');
  }

  validate(params) {
    const required = Object.entries(this.parameters)
      .filter(([_, p]) => p.required)
      .map(([key]) => key);
    
    const missing = required.filter(key => !params[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
    
    return true;
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      examples: this.examples
    };
  }
}

class ChannelRecommendationSkill extends BaseSkill {
  constructor() {
    super('channel_recommendation', {
      description: 'Recomenda canais baseados no histórico de visualização',
      parameters: {
        limit: { type: 'number', required: false, default: 10 },
        category: { type: 'string', required: false },
        timeSlot: { type: 'string', required: false }
      },
      examples: [
        'Recomende 5 canais de esportes',
        'O que assistir agora à noite?'
      ]
    });
  }

  async execute(params = {}) {
    const { useSources } = await import('../../context/SourceContext');
    const context = useSources?.();
    
    if (!context) {
      return { error: 'Context not available' };
    }

    const { history, channels } = context;
    
    const analysis = await aiHub.analyzeViewingPatterns(history || [], channels || []);
    
    let recommendations = analysis.recommendedChannels || [];
    
    if (params.category) {
      recommendations = recommendations.filter(c => 
        (c.group || '').toLowerCase().includes(params.category.toLowerCase())
      );
    }
    
    return {
      recommendations: recommendations.slice(0, params.limit || 10),
      insights: analysis.insights,
      categories: analysis.preferredCategories
    };
  }
}

class EPGAnalysisSkill extends BaseSkill {
  constructor() {
    super('epg_analysis', {
      description: 'Analisa a programação EPG e encontra programas interessantes',
      parameters: {
        channelId: { type: 'string', required: false },
        hours: { type: 'number', required: false, default: 4 },
        genre: { type: 'string', required: false }
      },
      examples: [
        'O que está passando agora?',
        'Encontre filmes nas próximas 3 horas'
      ]
    });
  }

  async execute(params = {}) {
    const { epgService } = await import('../EPGService');
    
    const allPrograms = Object.values(epgService.channelPrograms || {});
    const flatPrograms = allPrograms.flat();
    
    const now = new Date();
    const endTime = new Date(now.getTime() + (params.hours || 4) * 60 * 60 * 1000);
    
    let programs = flatPrograms.filter(p => 
      p.start <= endTime && p.stop > now
    );
    
    if (params.genre) {
      programs = programs.filter(p => 
        (p.category || '').toLowerCase().includes(params.genre.toLowerCase())
      );
    }
    
    programs.sort((a, b) => a.start - b.start);
    
    return {
      programs: programs.slice(0, 20),
      count: programs.length,
      timeRange: {
        start: now.toISOString(),
        end: endTime.toISOString()
      }
    };
  }
}

class ContentSearchSkill extends BaseSkill {
  constructor() {
    super('content_search', {
      description: 'Busca canais e conteúdo usando linguagem natural',
      parameters: {
        query: { type: 'string', required: true },
        type: { type: 'string', required: false, default: 'channel' }
      },
      examples: [
        'Encontre canais de futebol',
        'Busca séries de ação'
      ]
    });
  }

  async execute(params = {}) {
    this.validate(params);
    
    const { useSources } = await import('../../context/SourceContext');
    const context = useSources?.();
    
    const results = await aiHub.smartSearch(
      params.query,
      context?.channels || [],
      null
    );
    
    return results;
  }
}

class ChannelDescriptionSkill extends BaseSkill {
  constructor() {
    super('channel_description', {
      description: 'Gera descrição para um canal usando IA',
      parameters: {
        channelId: { type: 'string', required: true }
      },
      examples: [
        'Descreva o canal Globo'
      ]
    });
  }

  async execute(params = {}) {
    this.validate(params);
    
    const { useSources } = await import('../../context/SourceContext');
    const context = useSources?.();
    
    const channel = context?.channels?.find(c => c.id === params.channelId);
    
    if (!channel) {
      return { error: 'Channel not found' };
    }
    
    const description = await aiHub.generateChannelDescription(channel);
    
    return {
      channel: {
        id: channel.id,
        name: channel.name
      },
      description
    };
  }
}

class ViewingInsightSkill extends BaseSkill {
  constructor() {
    super('viewing_insights', {
      description: 'Gera insights sobre hábitos de visualização',
      parameters: {
        timeRange: { type: 'string', required: false, default: 'week' }
      },
      examples: [
        'O que eu mais assisti essa semana?',
        'Meus hábitos de visualização'
      ]
    });
  }

  async execute(params = {}) {
    const { useSources } = await import('../../context/SourceContext');
    const context = useSources?.();
    
    const history = context?.history || [];
    
    if (history.length === 0) {
      return { error: 'No viewing history' };
    }

    const prompt = `
Analise o histórico de visualização e forneça insights:

${JSON.stringify(history.slice(0, 50), null, 2)}

Forneça JSON com:
{
  "totalWatched": número,
  "topChannels": [{"name": "canal", "count": número}],
  "peakHours": ["horário1", "horário2"],
  "favoriteCategories": ["categoria1"],
  "insight": "texto curto com observação interessante"
}
`.trim();

    const response = await aiHub.chat([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        totalWatched: history.length,
        error: 'Could not parse AI response'
      };
    }
  }
}

class SmartPlaylistSkill extends BaseSkill {
  constructor() {
    super('smart_playlist', {
      description: 'Cria playlist inteligente baseada em preferências',
      parameters: {
        name: { type: 'string', required: true },
        criteria: { type: 'string', required: true },
        limit: { type: 'number', required: false, default: 20 }
      },
      examples: [
        'Crie uma playlist com meus canais favoritos',
        'Playlist de filmes para noite'
      ]
    });
  }

  async execute(params = {}) {
    this.validate(params);
    
    const { useSources } = await import('../../context/SourceContext');
    const context = useSources?.();
    
    const analysis = await aiHub.analyzeViewingPatterns(
      context?.history || [],
      context?.channels || []
    );
    
    const playlist = {
      name: params.name,
      channels: analysis.recommendedChannels?.slice(0, params.limit || 20) || [],
      createdAt: new Date().toISOString(),
      criteria: params.criteria
    };
    
    return playlist;
  }
}

class SkillManager {
  constructor() {
    this.skills = {
      channel_recommendation: new ChannelRecommendationSkill(),
      epg_analysis: new EPGAnalysisSkill(),
      content_search: new ContentSearchSkill(),
      channel_description: new ChannelDescriptionSkill(),
      viewing_insights: new ViewingInsightSkill(),
      smart_playlist: new SmartPlaylistSkill()
    };
  }

  getSkill(name) {
    return this.skills[name];
  }

  async executeSkill(name, params = {}) {
    const skill = this.skills[name];
    
    if (!skill) {
      throw new Error(`Skill not found: ${name}`);
    }
    
    return await skill.execute(params);
  }

  getAllSkills() {
    return Object.fromEntries(
      Object.entries(this.skills).map(([name, skill]) => [name, skill.getSchema()])
    );
  }

  getSkillNames() {
    return Object.keys(this.skills);
  }

  async executeNaturalLanguage(input) {
    const response = await aiHub.chat([
      { 
        role: 'system', 
        content: `Você é um assistente de IPTV. Interprete comandos em linguagem natural e execute a skill apropriada.

Skills disponíveis:
${Object.entries(this.skills).map(([name, skill]) => 
  `- ${name}: ${skill.description}`
).join('\n')}

Retorne JSON com:
{
  "skill": "nome_da_skill",
  "params": { "param1": "valor1" }
}
`.trim()
      },
      { role: 'user', content: input }
    ]);

    try {
      const { skill, params } = JSON.parse(response.content);
      return await this.executeSkill(skill, params);
    } catch (error) {
      return { error: error.message, raw: response.content };
    }
  }
}

export const aiSkills = new SkillManager();
export default aiSkills;
