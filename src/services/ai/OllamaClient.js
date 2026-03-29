const OLLAMA_HOST = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';
const FALLBACK_MODELS = ['llama3.2', 'llama3.1', 'mistral', 'phi3'];

class OllamaClient {
  constructor() {
    this.host = OLLAMA_HOST;
    this.model = DEFAULT_MODEL;
    this.available = false;
    this.models = [];
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.host}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        this.models = data.models || [];
        this.available = this.models.length > 0;
        
        if (this.available) {
          const preferred = FALLBACK_MODELS.find(m => 
            this.models.some(om => om.name.startsWith(m))
          );
          this.model = preferred || this.models[0].name;
        }
        
        return {
          available: this.available,
          models: this.models,
          currentModel: this.model
        };
      }
      
      return { available: false, error: `HTTP ${response.status}` };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  async chat(messages, options = {}) {
    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2048;
    const stream = options.stream || false;

    const payload = {
      model,
      messages: this.formatMessages(messages),
      temperature,
      max_tokens: maxTokens,
      stream
    };

    try {
      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.message?.content || '',
        model: data.model,
        done: data.done,
        provider: 'ollama'
      };
    } catch (error) {
      console.error('[OllamaClient] Chat error:', error);
      throw error;
    }
  }

  async completion(prompt, options = {}) {
    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2048;

    const payload = {
      model,
      prompt,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || '',
        model: data.model,
        done: data.done,
        provider: 'ollama'
      };
    } catch (error) {
      console.error('[OllamaClient] Completion error:', error);
      throw error;
    }
  }

  async embed(text, options = {}) {
    const model = options.model || this.model;

    const payload = {
      model,
      input: text
    };

    try {
      const response = await fetch(`${this.host}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        embedding: data.embedding,
        model: data.model,
        provider: 'ollama'
      };
    } catch (error) {
      console.error('[OllamaClient] Embed error:', error);
      throw error;
    }
  }

  async generateStreaming(prompt, onChunk, options = {}) {
    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.7;

    const payload = {
      model,
      prompt,
      temperature,
      stream: true
    };

    const response = await fetch(`${this.host}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            fullContent += data.response;
            if (onChunk) onChunk(data.response, data.done);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    return {
      content: fullContent,
      model,
      done: true,
      provider: 'ollama'
    };
  }

  formatMessages(messages) {
    return messages.map(m => ({
      role: m.role || 'user',
      content: m.content
    }));
  }

  getAvailableModels() {
    return this.models;
  }

  getCurrentModel() {
    return this.model;
  }

  setModel(modelName) {
    this.model = modelName;
  }

  isAvailable() {
    return this.available;
  }
}

export const ollamaClient = new OllamaClient();
export default ollamaClient;
