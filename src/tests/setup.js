import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM após cada teste para evitar poluição
afterEach(() => {
  cleanup();
});

// Mock para o window.matchMedia (necessário para alguns componentes do Tailwind)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // depreciado
    removeListener: vi.fn(), // depreciado
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
