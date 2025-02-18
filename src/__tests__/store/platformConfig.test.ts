import { configureStore } from '@reduxjs/toolkit';
import platformReducer, {
  initializePlatform,
  PLATFORM_CONFIGS,
  getCurrentPlatform,
  setupInputObserver
} from '../../store/platformSlice';
import { AIPlatform, PlatformConfig } from '../../store/types';

describe('Platform Configuration', () => {
  const setupStore = () => configureStore({ reducer: { platform: platformReducer } });

  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
  });

  describe('Platform Configs', () => {
    it('should have correct configuration for ChatGPT', () => {
      const config = PLATFORM_CONFIGS[AIPlatform.CHATGPT];
      expect(config).toEqual({
        selector    : '#prompt-textarea',
        useInnerHTML: false
      });
    });

    it('should have correct configuration for Claude', () => {
      const config = PLATFORM_CONFIGS[AIPlatform.CLAUDE];
      expect(config).toEqual({
        selector    : '[aria-label="Write your prompt to Claude"]',
        useInnerHTML: false
      });
    });

    it('should have correct configuration for Perplexity', () => {
      const config = PLATFORM_CONFIGS[AIPlatform.PERPLEXITY];
      expect(config).toEqual({
        selector    : 'textarea',
        useInnerHTML: true
      });
    });
  });

  describe('Platform Detection', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it('should detect ChatGPT platform', () => {
      window.location = {
        ...originalLocation,
        host: 'chat.openai.com'
      };

      expect(getCurrentPlatform()).toBe(AIPlatform.CHATGPT);
    });

    it('should detect Claude platform', () => {
      window.location = {
        ...originalLocation,
        host: 'claude.ai'
      };

      expect(getCurrentPlatform()).toBe(AIPlatform.CLAUDE);
    });

    it('should detect Perplexity platform', () => {
      window.location = {
        ...originalLocation,
        host: 'perplexity.ai'
      };

      expect(getCurrentPlatform()).toBe(AIPlatform.PERPLEXITY);
    });

    it('should return null for unknown platforms', () => {
      window.location = {
        ...originalLocation,
        host: 'unknown.com'
      };

      expect(getCurrentPlatform()).toBeNull();
    });
  });

  describe('Platform-Specific Behavior', () => {
    describe('ChatGPT', () => {
      it('should handle text content updates', () => {
        // Setup
        document.body.innerHTML = '<textarea id="prompt-textarea">Initial text</textarea>';
        const store = setupStore();
        const callback = jest.fn();

        store.dispatch(initializePlatform({
          platform       : AIPlatform.CHATGPT,
          elementSelector: '#prompt-textarea'
        }));

        const input = document.getElementById('prompt-textarea') as HTMLElement;
        const observer = setupInputObserver(
          input,
          PLATFORM_CONFIGS[AIPlatform.CHATGPT],
          callback
        );

        // Simulate text change
        input.textContent = 'New text';
        jest.runAllTimers();

        expect(callback).toHaveBeenCalledWith('New text');
        observer.disconnect();
      });
    });

    describe('Claude', () => {
      it('should handle aria-label selector', () => {
        // Setup
        document.body.innerHTML = '<div aria-label="Write your prompt to Claude">Initial text</div>';
        const store = setupStore();
        const callback = jest.fn();

        store.dispatch(initializePlatform({
          platform       : AIPlatform.CLAUDE,
          elementSelector: '[aria-label="Write your prompt to Claude"]'
        }));

        const input = document.querySelector('[aria-label="Write your prompt to Claude"]') as HTMLElement;
        const observer = setupInputObserver(
          input,
          PLATFORM_CONFIGS[AIPlatform.CLAUDE],
          callback
        );

        // Simulate text change
        input.textContent = 'New text';
        jest.runAllTimers();

        expect(callback).toHaveBeenCalledWith('New text');
        observer.disconnect();
      });
    });

    describe('Perplexity', () => {
      it('should handle innerHTML updates', () => {
        // Setup
        document.body.innerHTML = '<textarea>Initial text</textarea>';
        const store = setupStore();
        const callback = jest.fn();

        store.dispatch(initializePlatform({
          platform       : AIPlatform.PERPLEXITY,
          elementSelector: 'textarea'
        }));

        const input = document.querySelector('textarea') as HTMLElement;
        const observer = setupInputObserver(
          input,
          PLATFORM_CONFIGS[AIPlatform.PERPLEXITY],
          callback
        );

        // Simulate innerHTML change
        input.innerHTML = 'New text';
        jest.runAllTimers();

        expect(callback).toHaveBeenCalledWith('New text');
        observer.disconnect();
      });
    });
  });

  describe('Platform Config Updates', () => {
    it('should handle platform config changes', () => {
      const store = setupStore();
      const initialPlatform = AIPlatform.CHATGPT;
      const newPlatform = AIPlatform.CLAUDE;

      // Initialize with ChatGPT
      store.dispatch(initializePlatform({
        platform       : initialPlatform,
        elementSelector: '#prompt-textarea'
      }));

      let state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[initialPlatform]);

      // Switch to Claude
      store.dispatch(initializePlatform({
        platform       : newPlatform,
        elementSelector: '[aria-label="Write your prompt to Claude"]'
      }));

      state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[newPlatform]);
    });

    it('should maintain platform config after initialization', () => {
      const store = setupStore();
      const platform = AIPlatform.CHATGPT;

      store.dispatch(initializePlatform({
        platform,
        elementSelector: '#prompt-textarea'
      }));

      const state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[platform]);
      expect(state.platform.config.isInitialized).toBe(true);
      expect(state.platform.config.lastInitAttempt).toBeGreaterThan(0);
    });
  });

  describe('Custom Platform Configurations', () => {
    it('should handle custom selectors', () => {
      const customConfig: PlatformConfig = {
        selector    : '#custom-input',
        useInnerHTML: true
      };

      document.body.innerHTML = '<div id="custom-input"><p>Initial text</p></div>';
      const callback = jest.fn();

      const input = document.getElementById('custom-input') as HTMLElement;
      const observer = setupInputObserver(input, customConfig, callback);

      // Simulate innerHTML change
      input.innerHTML = '<p>New text</p>';
      jest.runAllTimers();

      expect(callback).toHaveBeenCalledWith('<p>New text</p>');
      observer.disconnect();
    });
  });
});
