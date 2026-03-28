import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UnifiedPlayer from '../components/Player/UnifiedPlayer';
import { PlayerProvider } from '../context/PlayerContext';

vi.mock('../context/SourceContext', () => ({
  useSources: () => ({ activeSource: { url: 'http://test.com/stream' } })
}));

vi.mock('../services/EPGService', () => ({
  fetchEPG: vi.fn(),
  getCurrentProgram: vi.fn(),
  getNextProgram: vi.fn(),
}));

vi.mock('../components/Player/VideoPlayer', () => ({
  default: ({ channel, onClose }) => (
    <div data-testid="video-player">VideoPlayer - {channel?.name}</div>
  ),
}));

vi.mock('../components/Player/VodPlayer', () => ({
  default: ({ channel, onClose }) => (
    <div data-testid="vod-player">VodPlayer - {channel?.name}</div>
  ),
}));

const renderWithProviders = ui => {
  return render(
    <BrowserRouter>
      <PlayerProvider>{ui}</PlayerProvider>
    </BrowserRouter>
  );
};

describe('UnifiedPlayer', () => {
  const mockChannel = { name: 'Test Channel', url: 'http://test.com/stream.m3u8', type: 'live' };
  const mockChannels = [mockChannel];
  const mockOnClose = vi.fn();

  it('deve renderizar VideoPlayer para canais do tipo live', () => {
    const liveChannel = { ...mockChannel, type: 'live' };

    renderWithProviders(
      <UnifiedPlayer channel={liveChannel} channels={mockChannels} onClose={mockOnClose} />
    );

    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByText(/VideoPlayer/)).toBeTruthy();
  });

  it('deve renderizar VodPlayer para canais do tipo movie', () => {
    const movieChannel = { ...mockChannel, type: 'movie', url: 'http://test.com/filme.mp4' };

    renderWithProviders(
      <UnifiedPlayer channel={movieChannel} channels={mockChannels} onClose={mockOnClose} />
    );

    expect(screen.getByTestId('vod-player')).toBeInTheDocument();
    expect(screen.getByText(/VodPlayer/)).toBeTruthy();
  });

  it('deve renderizar VodPlayer para canais do tipo series', () => {
    const seriesChannel = { ...mockChannel, type: 'series', url: 'http://test.com/serie.mp4' };

    renderWithProviders(
      <UnifiedPlayer channel={seriesChannel} channels={mockChannels} onClose={mockOnClose} />
    );

    expect(screen.getByTestId('vod-player')).toBeInTheDocument();
  });

  it('deve usar VideoPlayer como padrao para tipo desconhecido', () => {
    const unknownChannel = { ...mockChannel, type: undefined };

    renderWithProviders(
      <UnifiedPlayer channel={unknownChannel} channels={mockChannels} onClose={mockOnClose} />
    );

    expect(screen.getByTestId('video-player')).toBeInTheDocument();
  });
});
