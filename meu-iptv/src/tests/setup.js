import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock para Capacitor - modo NÃO nativo por padrão (web)
const mockCapacitorHttp = {
  get: vi.fn().mockResolvedValue({ status: 200, data: '#EXTM3U\n' })
};

window.Capacitor = {
  isNativePlatform: vi.fn().mockReturnValue(false),
  CapacitorHttp: mockCapacitorHttp
};

window.CapacitorHttp = mockCapacitorHttp;

// Mock para fetch
global.fetch = vi.fn();

// Mock para localStorage
const mockStorage = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn((key) => mockStorage[key] || null),
    setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
    removeItem: vi.fn((key) => { delete mockStorage[key]; }),
    clear: vi.fn(() => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); })
  },
  writable: true
});

// Mock para console.error/console.log para evitar poluição nos testes
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});