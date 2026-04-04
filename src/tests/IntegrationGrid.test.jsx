import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChannelGrid from '../components/Channels/ChannelGrid';

// Mocks necessários para o ambiente de teste Vitest/JSDOM
vi.mock('../services/SmartServerOrchestrator', () => ({
  detectDeviceProfile: () => ({ isTV: false, label: 'Desktop' }),
  detectStreamType: () => 'live'
}));

// Mock do AutoSizer para prover dimensões em ambiente de teste
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ children }) => children({ height: 800, width: 1000 }),
  default: ({ children }) => children({ height: 800, width: 1000 })
}));

// Mock simplificado do react-window para o teste de integração
vi.mock('react-window', () => ({
  FixedSizeGrid: ({ children, itemData, columnCount, rowCount }) => {
    const items = [];
    for (let r = 0; r < Math.min(rowCount, 2); r++) {
      for (let c = 0; c < columnCount; c++) {
        const index = r * columnCount + c;
        if (index < itemData.channels.length) {
          items.push(
            <div key={index}>
              {React.createElement(children, {
                columnIndex: c,
                rowIndex: r,
                style: {},
                data: itemData
              })}
            </div>
          );
        }
      }
    }
    return <div>{items}</div>;
  }
}));

const mockChannels = Array.from({ length: 5 }, (_, i) => ({
  id: `ch_${i}`,
  name: `Canal ${i}`,
  group: 'Geral',
  url: `http://test.com/${i}.m3u8`
}));

describe('Integração: ChannelGrid + VirtualChannelGrid', () => {
  it('deve renderizar os canais corretamente no modo categoria', () => {
    render(
      <ChannelGrid 
        channels={mockChannels}
        activeGroup="All"
        activeCategory="tv"
        setActiveGroup={() => {}}
        groups={[{ id: 'g1', name: 'Geral' }]}
        onPlay={() => {}}
        search=""
        isPlayerOpen={false}
        isValidating={false}
      />
    );

    expect(screen.getByText('Canal 0')).toBeInTheDocument();
    expect(screen.getByText('Canal 1')).toBeInTheDocument();
  });

  it('deve exibir skeleton quando a lista estiver vazia (comportamento padrão)', () => {
    const { container } = render(
      <ChannelGrid 
        channels={[]}
        activeGroup="All"
        activeCategory="tv"
        setActiveGroup={() => {}}
        groups={[]}
        onPlay={() => {}}
        search=""
        isPlayerOpen={false}
        isValidating={false}
      />
    );

    // No ChannelGrid.jsx, se channels.length === 0, ele renderiza o ChannelGridSkeleton
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
