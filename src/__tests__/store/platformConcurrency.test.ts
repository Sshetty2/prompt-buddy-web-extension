import { configureStore, Reducer } from '@reduxjs/toolkit';
import platformReducer, {
  initializePlatform,
  cleanupPlatform,
  updateShortcuts,
  selectShortcuts,
  setupInputObserver,
  getInputElement,
  getInputObserver,
  PLATFORM_CONFIGS
} from '../../store/platformSlice';
import { AIPlatform, PlatformState } from '../../store/types';

describe('Platform Concurrency', () => {
  const setupStore = (preloadedState?: Partial<PlatformState>) => configureStore({
    reducer       : { platform: platformReducer as Reducer<PlatformState> },
    preloadedState: preloadedState ? { platform: preloadedState as PlatformState } : undefined
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    const observer = getInputObserver();

    if (observer) {
      observer.disconnect();
    }
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Concurrent Platform Operations', () => {
    it('should handle concurrent platform initializations', async () => {
      const store = setupStore();
      document.body.innerHTML = `
        <div id="chatgpt-input">ChatGPT</div>
        <div id="claude-input">Claude</div>
      `;

      // Create multiple initialization promises
      const initPromises = [
        Promise.resolve(store.dispatch(initializePlatform({
          platform       : AIPlatform.CHATGPT,
          elementSelector: '#chatgpt-input'
        }))),
        Promise.resolve(store.dispatch(initializePlatform({
          platform       : AIPlatform.CLAUDE,
          elementSelector: '#claude-input'
        })))
      ];

      // Execute initializations concurrently
      await Promise.all(initPromises);

      // Last initialization should win
      const state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CLAUDE]);
      expect(getInputElement()?.id).toBe('claude-input');
    });

    it('should handle concurrent shortcut updates', async () => {
      const store = setupStore();

      // Create multiple shortcut update promises
      const updatePromises = [
        Promise.resolve(store.dispatch(updateShortcuts({
          enabled : true,
          bindings: { togglePopover: ['Alt', 'Space'] }
        }))),
        Promise.resolve(store.dispatch(updateShortcuts({ bindings: { togglePopover: ['Control', 'Space'] } }))),
        Promise.resolve(store.dispatch(updateShortcuts({ enabled: false })))
      ];

      // Execute updates concurrently
      await Promise.all(updatePromises);

      // Last update should win for each property
      const shortcuts = selectShortcuts(store.getState());
      expect(shortcuts.enabled).toBe(false);
      expect(shortcuts.bindings.togglePopover).toEqual(['Control', 'Space']);
    });

    it('should handle concurrent observer setup', async () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const input = document.getElementById('test-input') as HTMLElement;
      const callbacks = [
        jest.fn(),
        jest.fn(),
        jest.fn()
      ];

      // Create multiple observer setup promises
      const observerPromises = callbacks.map(async callback => {
        const observer = await Promise.resolve(setupInputObserver(
          input,
          {
            selector    : '#test-input',
            useInnerHTML: false
          },
          callback
        ));

        return observer;
      });

      // Setup observers concurrently
      const observers = await Promise.all(observerPromises);

      // Only the last observer should be active
      input.textContent = 'New text';
      jest.runAllTimers();

      expect(callbacks[0]).not.toHaveBeenCalled();
      expect(callbacks[1]).not.toHaveBeenCalled();
      expect(callbacks[2]).toHaveBeenCalledWith('New text');
      expect(getInputObserver()).toBe(observers[observers.length - 1]);

      // Cleanup
      observers.forEach(observer => observer.disconnect());
    });

    it('should handle concurrent error conditions', async () => {
      const store = setupStore();
      document.body.innerHTML = '<div id="test-input">Test</div>';

      // Create promises that mix successful and failing operations
      const operationPromises = [
        // Valid initialization
        Promise.resolve(store.dispatch(initializePlatform({
          platform       : AIPlatform.CHATGPT,
          elementSelector: '#test-input'
        }))),

        // Invalid initialization
        Promise.reject(new Error('Initialization failed')),

        // Cleanup during error
        Promise.resolve(store.dispatch(cleanupPlatform())),

        // Valid initialization after error
        Promise.resolve(store.dispatch(initializePlatform({
          platform       : AIPlatform.CLAUDE,
          elementSelector: '#test-input'
        })))
      ];

      // Execute operations concurrently and catch errors
      await Promise.allSettled(operationPromises);

      // Verify system recovered and maintained consistent state
      const state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CLAUDE]);
      expect(getInputElement()?.id).toBe('test-input');
    });

    it('should handle observer errors during concurrent operations', async () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const input = document.getElementById('test-input') as HTMLElement;

      // Create callbacks with mixed behavior
      const callbacks = [
        jest.fn(),
        jest.fn(() => {
          throw new Error('Observer error');
        }),
        jest.fn()
      ];

      // Setup observers concurrently
      const observerPromises = callbacks.map(async callback => {
        try {
          const observer = await Promise.resolve(setupInputObserver(
            input,
            {
              selector    : '#test-input',
              useInnerHTML: false
            },
            callback
          ));

          return observer;
        } catch (error) {
          return null;
        }
      });

      const observers = (await Promise.all(observerPromises)).filter(Boolean);

      // Verify system maintains consistency after errors
      input.textContent = 'New text';
      jest.runAllTimers();

      expect(callbacks[0]).not.toHaveBeenCalled();
      expect(callbacks[2]).toHaveBeenCalledWith('New text');
      expect(getInputObserver()).toBeTruthy();

      // Cleanup
      observers.forEach(observer => observer?.disconnect());
    });

    it('should handle mixed success/failure in concurrent operations', async () => {
      const store = setupStore();
      document.body.innerHTML = '<div id="test-input">Test</div>';

      // Mix of successful and failing operations
      const operations = [
        // Valid shortcut update
        store.dispatch(updateShortcuts({
          enabled : true,
          bindings: { togglePopover: ['Alt', 'Space'] }
        })),

        // Invalid platform initialization
        Promise.reject(new Error('Invalid platform')),

        // Valid cleanup
        store.dispatch(cleanupPlatform()),

        // Error during observer setup
        Promise.reject(new Error('Observer setup failed')),

        // Valid platform initialization
        store.dispatch(initializePlatform({
          platform       : AIPlatform.CHATGPT,
          elementSelector: '#test-input'
        }))
      ];

      // Execute mixed operations
      await Promise.allSettled(operations);

      // Verify final state is consistent
      const state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CHATGPT]);
      expect(getInputElement()?.id).toBe('test-input');
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Alt', 'Space']);
    });
  });
});
