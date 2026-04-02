export class StreamingM3UParser {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 10000;
    this.onProgress = options.onProgress || (() => {});
    this.onChannel = options.onChannel || (() => {});
    this.abortController = null;
    this.channels = [];
    this.buffer = '';
    this.currentChannel = null;
    this.lineCount = 0;
  }

  async parse(response, sourceId) {
    this.abortController = new AbortController();
    this.channels = [];
    this.buffer = '';
    this.currentChannel = null;
    this.lineCount = 0;

    const reader = response.body?.getReader();
    
    if (!reader) {
      const text = await response.text();
      return this.parseText(text, sourceId);
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        if (this.abortController?.signal.aborted) break;

        const chunk = new TextDecoder().decode(value, { stream: true });
        this.buffer += chunk;

        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() || '';

        for (const line of lines) {
          this.processLine(line.trim(), sourceId);
        }

        this.onProgress(this.channels.length, this.lineCount);
      }

      if (this.buffer) {
        this.processLine(this.buffer.trim(), sourceId);
      }

    } finally {
      reader.releaseLock();
    }

    return this.channels;
  }

  parseText(text, sourceId) {
    const lines = text.split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++) {
      this.processLine(lines[i].trim(), sourceId);
      this.onProgress(this.channels.length, i);
    }

    return this.channels;
  }

  processLine(line, sourceId) {
    this.lineCount++;

    if (!line) return;

    if (line.startsWith('#EXTINF:')) {
      const info = this.parseExtInf(line);
      this.currentChannel = {
        id: `ch_${sourceId}_${this.lineCount}`,
        name: info.name || `Canal ${this.channels.length + 1}`,
        logo: info.logo || '',
        group: info.group || '',
        url: '',
        type: 'live'
      };
    } else if (line.startsWith('#EXTGRP:')) {
      if (this.currentChannel) {
        this.currentChannel.group = line.replace('#EXTGRP:', '').trim();
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (this.currentChannel) {
        this.currentChannel.url = line;
        
        const typeMatch = (this.currentChannel.group || '').toLowerCase();
        if (typeMatch.includes('filme') || typeMatch.includes('movie')) {
          this.currentChannel.type = 'movie';
        } else if (typeMatch.includes('série') || typeMatch.includes('series')) {
          this.currentChannel.type = 'series';
        }
        
        this.channels.push(this.currentChannel);
        this.onChannel(this.currentChannel);
        this.currentChannel = null;
      }
    }
  }

  parseExtInf(line) {
    const result = { name: '', logo: '', group: '' };

    const nameMatch = line.match(/,(.+)$/);
    if (nameMatch) result.name = nameMatch[1].trim();

    const logoMatch = line.match(/tvg-logo=["']([^"']*)["']/);
    if (logoMatch) result.logo = logoMatch[1].trim();

    const groupMatch = line.match(/group-title=["']([^"']*)["']/);
    if (groupMatch) result.group = groupMatch[1].trim();

    return result;
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

export function parseM3UStream(content, sourceId, onProgress) {
  const parser = new StreamingM3UParser({
    onProgress: onProgress || (() => {})
  });
  return parser.parseText(content, sourceId);
}

export default StreamingM3UParser;
