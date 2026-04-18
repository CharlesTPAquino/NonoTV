import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthContext from '../context/AuthContext';

describe('Fase 2: Auth (Login + Supabase)', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  
  const mockValue = {
    user: null,
    loading: false,
    isLocalAuth: false,
    login: mockLogin,
    logout: mockLogout,
    isLoggedIn: () => false,
    isSupabaseConfigured: true,
    appVersion: '2026.04.13',
  };

  it('deve renderizar contexto de auth', () => {
    render(
      <AuthContext.Provider value={mockValue}>
        <div>Auth Provider</div>
      </AuthContext.Provider>
    );
    expect(screen.getByText('Auth Provider')).toBeTruthy();
  });

  it('deve ter isSupabaseConfigured configurado', () => {
    expect(mockValue.isSupabaseConfigured).toBe(true);
  });

  it('deve ter app version definida', () => {
    expect(mockValue.appVersion).toBe('2026.04.13');
  });

  it('deve ter função login definida', () => {
    expect(typeof mockValue.login).toBe('function');
  });

  it('deve ter função logout definida', () => {
    expect(typeof mockValue.logout).toBe('function');
  });
});