import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChannelCard from '../components/Channels/ChannelCard';

// Dummy channel for testing
const mockChannel = {
  id: 1,
  name: 'Globo HD',
  group: 'TV ABERTA',
  url: 'http://test.com/stream.m3u8',
  logo: 'globo.png'
};

describe('ChannelCard', () => {
  it('deve renderizar o nome e o grupo do canal', () => {
    render(
      <ChannelCard channel={mockChannel} onPlay={() => {}} isValid={true} isPlayerOpen={false} />
    );
    
    expect(screen.getByText('Globo HD')).toBeInTheDocument();
    expect(screen.getByText('TV ABERTA')).toBeInTheDocument();
  });

  it('deve chamar onPlay com os dados do canal ao ser clicado', () => {
    const handlePlay = vi.fn();
    render(
      <ChannelCard channel={mockChannel} onPlay={handlePlay} isValid={true} isPlayerOpen={false} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handlePlay).toHaveBeenCalledWith(mockChannel);
  });

  it('nao deve mostrar video renderizado via Hover se o player estiver aberto', () => {
    const { container } = render(
      <ChannelCard channel={mockChannel} onPlay={() => {}} isValid={true} isPlayerOpen={true} />
    );
    
    // Simula hover
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // O vídeo não deve ser renderizado se isPlayerOpen for true
    const video = container.querySelector('video');
    expect(video).not.toBeInTheDocument();
  });
});
