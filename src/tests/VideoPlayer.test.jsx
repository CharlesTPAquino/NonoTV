import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VideoPlayer from '../components/Player/VideoPlayer';

import { PlayerProvider } from '../context/PlayerContext';

vi.mock('../context/SourceContext', () => ({
  useSources: () => ({ activeSource: { url: 'http://test.com/stream' } })
}));

vi.mock('../services/EPGService', () => ({
  fetchEPG: vi.fn(),
  getCurrentProgram: vi.fn(),
  getNextProgram: vi.fn(),
}));

// Mock do hook useHlsPlayer para evitar erro de mídia no JSDOM durante build
vi.mock('../hooks/useHlsPlayer', () => ({
  default: vi.fn(() => ({
    playerState: { 
      playing: true, 
      buffering: false, 
      error: null,
      audioTracks: [],
      subtitles: [],
      activeAudio: -1,
      activeSubtitle: -1
    },
    togglePlay: vi.fn(),
    changeQuality: vi.fn(),
    changeAudio: vi.fn(),
    changeSubtitle: vi.fn()
  }))
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockChannel = {
  id: '1',
  name: 'Globo HD',
  url: 'https://example.com/stream.m3u8',
  group: 'Abertos',
  logo: '',
  type: 'live',
};

const mockChannels = [mockChannel];

describe('VideoPlayer', () => {
  it('deve renderizar o titulo do canal e botao Fechar', () => {
    const handleClose = vi.fn();

    render(
      <PlayerProvider>
        <VideoPlayer
          channel={mockChannel}
          channels={mockChannels}
          onClose={handleClose}
        />
      </PlayerProvider>
    );

    const elements = screen.getAllByText('Globo HD');
    expect(elements.length).toBeGreaterThan(0);

    const title = elements.find(el => el.tagName === 'H2');
    expect(title).toBeInTheDocument();

    const closeButtons = screen.getAllByLabelText('Fechar');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('deve disparar onClose ao clicar no botao de fechar', () => {
    const handleClose = vi.fn();

    render(
      <PlayerProvider>
        <VideoPlayer
          channel={mockChannel}
          channels={mockChannels}
          onClose={handleClose}
        />
      </PlayerProvider>
    );

    const closeButtons = screen.getAllByLabelText('Fechar');
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
