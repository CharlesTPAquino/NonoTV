import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VideoPlayer from '../components/Player/VideoPlayer';

// Mock do window.matchMedia e addEventListener para evitar erros de render no jsdom
beforeEach(() => {
  window.HTMLMediaElement.prototype.load = vi.fn();
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue();
  window.HTMLMediaElement.prototype.pause = vi.fn();
});

const mockChannel = {
  id: 1,
  name: 'Globo HD',
  url: 'http://example.com/stream.m3u8'
};

const mockChannels = [mockChannel];

describe('VideoPlayer', () => {
  it('deve renderizar o titulo do canal e botao Fechar', () => {
    const handleClose = vi.fn();
    render(
      <VideoPlayer channel={mockChannel} channels={mockChannels} onClose={handleClose} />
    );

    expect(screen.getByText('Globo HD')).toBeInTheDocument();
  });

  it('deve disparar onClose ao clicar no botao de fechar', () => {
    const handleClose = vi.fn();
    render(
      <VideoPlayer channel={mockChannel} channels={mockChannels} onClose={handleClose} />
    );

    // Encontra o botão de Voltar/Fechar pela classe ou ícone (podemos assumir que o texto ou title está ausente, mas podemos procurar o botão)
    const closeButton = screen.getByRole('button', { name: /voltar|fechar/i }) || screen.getAllByRole('button')[0];
    
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
