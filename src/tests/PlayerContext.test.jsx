import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerProvider, usePlayer } from '../context/PlayerContext';

vi.mock('../context/SourceContext', () => ({
  useSources: () => ({ activeSource: { url: 'http://test.com/stream' } })
}));

vi.mock('../services/EPGService', () => ({
  fetchEPG: vi.fn(),
  getCurrentProgram: vi.fn(),
  getNextProgram: vi.fn(),
}));

const TestComponent = () => {
  const { activeChannel, showPlayer, playChannel, closePlayer } = usePlayer();
  return (
    <div>
      <span data-testid="is-open">{showPlayer ? 'Open' : 'Closed'}</span>
      <span data-testid="channel-name">{activeChannel ? activeChannel.name : 'None'}</span>
      <button onClick={() => playChannel({ name: 'Globo HD' })}>Play</button>
      <button onClick={() => closePlayer()}>Close</button>
    </div>
  );
};

describe('PlayerContext', () => {
  it('inicializa com o player fechado e sem canal ativo', () => {
    render(<PlayerProvider><TestComponent /></PlayerProvider>);
    expect(screen.getByTestId('is-open')).toHaveTextContent('Closed');
    expect(screen.getByTestId('channel-name')).toHaveTextContent('None');
  });

  it('atualiza o estado quando playChannel e closePlayer sao chamados', () => {
    render(<PlayerProvider><TestComponent /></PlayerProvider>);
    
    act(() => { screen.getByText('Play').click(); });
    expect(screen.getByTestId('is-open')).toHaveTextContent('Open');
    expect(screen.getByTestId('channel-name')).toHaveTextContent('Globo HD');

    act(() => { screen.getByText('Close').click(); });
    expect(screen.getByTestId('is-open')).toHaveTextContent('Closed');
    expect(screen.getByTestId('channel-name')).toHaveTextContent('None');
  });
});
