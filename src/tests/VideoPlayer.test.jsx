import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VideoPlayer from '../components/Player/VideoPlayer';

// Mock do hook useHlsPlayer para evitar erro de mídia no JSDOM durante build
vi.mock('../hooks/useHlsPlayer', () => ({
  useHlsPlayer: vi.fn(() => ({
    playerState: { playing: true, buffering: false, error: null },
    togglePlay: vi.fn(),
    changeQuality: vi.fn()
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
      <VideoPlayer
        channel={mockChannel}
        channels={mockChannels}
        onClose={handleClose}
      />
    );

    // Usa getAllByText porque o nome aparece no header E na lista de canais (sidebar)
    const elements = screen.getAllByText('Globo HD');
    expect(elements.length).toBeGreaterThan(0);

    // Verifica especificamente o título principal (h2)
    const title = elements.find(el => el.tagName === 'H2');
    expect(title).toBeInTheDocument();

    // Botão fechar existe (pode haver mais de um dependendo do estado do player)
    const closeButtons = screen.getAllByLabelText('Fechar');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('deve disparar onClose ao clicar no botao de fechar', () => {
    const handleClose = vi.fn();

    render(
      <VideoPlayer
        channel={mockChannel}
        channels={mockChannels}
        onClose={handleClose}
      />
    );

    const closeButtons = screen.getAllByLabelText('Fechar');
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
