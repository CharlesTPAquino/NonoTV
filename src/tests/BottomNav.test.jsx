import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from '../components/Layout/BottomNav';

describe('Fase 1: Bottom Navigation', () => {
  const mockProps = {
    activeCategory: 'All',
    setActiveCategory: vi.fn(),
    onOpenSearch: vi.fn(),
    onOpenSettings: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar todos os itens de navegação', () => {
    render(<BottomNav {...mockProps} />);
    
    expect(screen.getByText('Início')).toBeTruthy();
    expect(screen.getByText('Ao Vivo')).toBeTruthy();
    expect(screen.getByText('Filmes')).toBeTruthy();
    expect(screen.getByText('Séries')).toBeTruthy();
    expect(screen.getByText('Podcasts')).toBeTruthy();
    expect(screen.getByText('Buscar')).toBeTruthy();
    expect(screen.getByText('Ajustes')).toBeTruthy();
  });

  it('deve chamar setActiveCategory ao clicar em um item', () => {
    render(<BottomNav {...mockProps} />);
    
    fireEvent.click(screen.getByText('Ao Vivo'));
    expect(mockProps.setActiveCategory).toHaveBeenCalledWith('live');
  });

  it('deve chamar onOpenSettings ao clicar em Ajustes', () => {
    render(<BottomNav {...mockProps} />);
    
    fireEvent.click(screen.getByText('Ajustes'));
    expect(mockProps.onOpenSettings).toHaveBeenCalled();
  });

  it('deve ter touch targets >= 44px (min-h-11)', () => {
    render(<BottomNav {...mockProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  it('deve ter botão ativo com estilo diferente', () => {
    render(<BottomNav {...mockProps} activeCategory="live" />);
    
    const aoVivoButton = screen.getByText('Ao Vivo');
    expect(aoVivoButton.closest('button')).toHaveClass('text-white');
  });
});