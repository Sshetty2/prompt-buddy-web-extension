/* eslint-disable max-classes-per-file */
import '@testing-library/jest-dom';

// Mock the chrome API
global.chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
    onMessage  : {
      addListener   : jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
} as any;

// Mock environment variables
import.meta.env.VITE_AI_NAME = 'Test AI';
import.meta.env.VITE_ENDPOINT_URL = 'http://localhost:3000';

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value   : jest.fn().mockImplementation(query => ({
    matches            : false,
    media              : query,
    onchange           : null,
    addListener        : jest.fn(),
    removeListener     : jest.fn(),
    addEventListener   : jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent      : jest.fn()
  }))
});

// Mock observers
class MockIntersectionObserver implements Partial<IntersectionObserver> {
  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();

  root = null;

  rootMargin = '';

  thresholds = [];
}

class MockResizeObserver implements Partial<ResizeObserver> {
  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;
global.ResizeObserver = MockResizeObserver as any;

// Suppress console errors during tests
console.error = jest.fn();
