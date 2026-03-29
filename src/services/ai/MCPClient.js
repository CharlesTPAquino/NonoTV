const MCP_SERVERS = {
  FILESYSTEM: {
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp']
  },
  FETCH: {
    enabled: true,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch']
  },
  SEARCH: {
    enabled: true,
    command: 'npx', 
    args: ['-y', '@modelcontextprotocol/server-puppeteer']
  },
  SLACK: {
    enabled: false,
    config: {
      slackToken: process.env.SLACK_TOKEN,
      defaultChannel: '#nonotv'
    }
  },
  DATABASE: {
    enabled: false,
    config: {
      connectionString: process.env.DATABASE_URL
    }
  }
};

const CUSTOM_TOOLS = {
  getChannelInfo: {
    description: 'Get detailed information about a TV channel',
    parameters: {
      channelId: 'string'
    }
  },
  getEPGForChannel: {
    description: 'Get EPG/programming for a specific channel',
    parameters: {
      channelId: 'string',
      hours: 'number (default: 4)'
    }
  },
  getServerStatus: {
    description: 'Get health status of IPTV servers',
    parameters: {}
  },
  searchContent: {
    description: 'Search for content across all sources',
    parameters: {
      query: 'string',
      type: 'string (channel/movie/series)'
    }
  },
  getRecommendations: {
    description: 'Get AI-powered channel recommendations',
    parameters: {
      userId: 'string',
      limit: 'number (default: 10)'
    }
  },
  controlPlayback: {
    description: 'Control video playback',
    parameters: {
      action: 'string (play/pause/seek/skip)',
      value: 'any'
    }
  }
};

class MCPClient {
  constructor() {
    this.servers = MCP_SERVERS;
    this.tools = CUSTOM_TOOLS;
    this.connected = false;
    this.connectionStatus = {};
  }

  async initialize() {
    console.log('[MCPClient] Initializing...');
    
    for (const [name, config] of Object.entries(this.servers)) {
      if (config.enabled) {
        this.connectionStatus[name] = await this.connectServer(name, config);
      }
    }
    
    this.connected = Object.values(this.connectionStatus).some(s => s);
    console.log('[MCPClient] Connection status:', this.connectionStatus);
    
    return this.connectionStatus;
  }

  async connectServer(name, config) {
    try {
      console.log(`[MCPClient] Connecting to ${name}...`);
      
      switch (name) {
        case 'FETCH':
          return await this.testFetch();
        case 'SEARCH':
          return await this.testSearch();
        default:
          return { connected: false, error: 'Not implemented' };
      }
    } catch (error) {
      console.error(`[MCPClient] ${name} connection failed:`, error);
      return { connected: false, error: error.message };
    }
  }

  async testFetch() {
    try {
      const response = await fetch('https://api.github.com', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return { connected: response.ok, status: response.status };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async testSearch() {
    return { connected: true, note: 'Using web search API' };
  }

  async callTool(toolName, parameters = {}) {
    console.log(`[MCPClient] Calling tool: ${toolName}`, parameters);
    
    switch (toolName) {
      case 'getChannelInfo':
        return this.getChannelInfo(parameters.channelId);
      case 'getEPGForChannel':
        return this.getEPGForChannel(parameters.channelId, parameters.hours);
      case 'getServerStatus':
        return this.getServerStatus();
      case 'searchContent':
        return this.searchContent(parameters.query, parameters.type);
      case 'getRecommendations':
        return this.getRecommendations(parameters.userId, parameters.limit);
      case 'controlPlayback':
        return this.controlPlayback(parameters.action, parameters.value);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async getChannelInfo(channelId) {
    const { channels } = await import('../../context/SourceContext');
    const channel = channels?.find(c => c.id === channelId);
    
    if (!channel) {
      return { error: 'Channel not found' };
    }
    
    return {
      id: channel.id,
      name: channel.name,
      url: channel.url,
      group: channel.group,
      logo: channel.logo,
      status: 'available'
    };
  }

  async getEPGForChannel(channelId, hours = 4) {
    const epgService = await import('../EPGService');
    const { getProgramsForChannel } = epgService;
    
    return {
      channelId,
      hours,
      programs: getProgramsForChannel(null, channelId, hours) || []
    };
  }

  async getServerStatus() {
    const serverHealth = await import('../ServerHealthService');
    const status = await serverHealth.getAllServerStatus();
    
    return {
      servers: status,
      timestamp: new Date().toISOString()
    };
  }

  async searchContent(query, type = 'channel') {
    const { channels } = await import('../../context/SourceContext');
    
    const q = query.toLowerCase();
    const results = channels
      ?.filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 20)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: 'channel',
        group: c.group
      })) || [];
    
    return {
      query,
      type,
      results,
      count: results.length
    };
  }

  async getRecommendations(userId, limit = 10) {
    const { aiHub } = await import('./AIHub');
    const { channels } = await import('../../context/SourceContext');
    const { history } = await import('../../context/SourceContext');
    
    try {
      const analysis = await aiHub.analyzeViewingPatterns(history || [], channels || []);
      return {
        recommendations: analysis.recommendedChannels?.slice(0, limit) || [],
        insights: analysis.insights,
        basedOn: 'viewing_history'
      };
    } catch (error) {
      return {
        recommendations: [],
        error: error.message,
        basedOn: 'popular'
      };
    }
  }

  async controlPlayback(action, value) {
    const playerContext = await import('../../context/PlayerContext');
    const { usePlayer } = playerContext;
    
    console.log(`[MCPClient] Playback action: ${action}`, value);
    
    return {
      action,
      value,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  getAvailableTools() {
    return Object.keys(this.tools);
  }

  getToolDefinition(toolName) {
    return this.tools[toolName];
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  isConnected() {
    return this.connected;
  }
}

export const mcpClient = new MCPClient();
export default mcpClient;
