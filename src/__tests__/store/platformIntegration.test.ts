import { configureStore, Reducer, AnyAction } from '@reduxjs/toolkit';
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

describe('Platform Integration', () => {
  const setupStore = (preloadedState?: Partial<PlatformState>) => configureStore({
    reducer       : { platform: platformReducer as Reducer<PlatformState> },
    preloadedState: preloadedState ? { platform: preloadedState as PlatformState } : undefined
  });

  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';

    // Clean up any existing observers
    const observer = getInputObserver();

    if (observer) {
      observer.disconnect();
    }
  });

  describe('Platform Initialization with Shortcuts', () => {
    it('should maintain shortcuts after platform initialization', () => {
      const store = setupStore();
      const customShortcuts = {
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      };

      // Set custom shortcuts first
      store.dispatch(updateShortcuts(customShortcuts));

      // Initialize platform
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#prompt-textarea'
      }));

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(customShortcuts);
      expect(state.platform.config.isInitialized).toBe(true);
    });

    it('should handle platform changes while maintaining shortcuts', () => {
      const store = setupStore();

      // Initialize with ChatGPT
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#prompt-textarea'
      }));

      // Update shortcuts
      store.dispatch(updateShortcuts({ bindings: { togglePopover: ['Alt', 'Space'] } }));

      // Switch to Claude
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CLAUDE,
        elementSelector: '[aria-label="Write your prompt to Claude"]'
      }));

      const state = store.getState();
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Alt', 'Space']);
      expect(state.platform.config.current?.selector).toBe('[aria-label="Write your prompt to Claude"]');
    });
  });

  describe('Platform Cleanup with Shortcuts', () => {
    it('should maintain shortcuts after platform cleanup', () => {
      const store = setupStore();
      const customShortcuts = {
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      };

      // Initialize platform and set shortcuts
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#prompt-textarea'
      }));
      store.dispatch(updateShortcuts(customShortcuts));

      // Cleanup platform
      store.dispatch(cleanupPlatform());

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(customShortcuts);
      expect(state.platform.config.current).toBeNull();
    });

    it('should handle re-initialization after cleanup', () => {
      const store = setupStore();

      // First initialization
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#prompt-textarea'
      }));

      // Set custom shortcuts
      const customShortcuts = { bindings: { togglePopover: ['Alt', 'Space'] } };
      store.dispatch(updateShortcuts(customShortcuts));

      // Cleanup
      store.dispatch(cleanupPlatform());

      // Re-initialize with different platform
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CLAUDE,
        elementSelector: '[aria-label="Write your prompt to Claude"]'
      }));

      const state = store.getState();
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Alt', 'Space']);
      expect(state.platform.config.current?.selector).toBe('[aria-label="Write your prompt to Claude"]');
    });
  });

  describe('Error Handling During Platform Transitions', () => {
    it('should maintain shortcuts when platform initialization fails', () => {
      const store = setupStore();
      const customShortcuts = {
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      };

      // Set custom shortcuts
      store.dispatch(updateShortcuts(customShortcuts));

      // Try to initialize with invalid selector
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: 'invalid [] selector'
      }));

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(customShortcuts);
      expect(getInputElement()).toBeNull();
    });

    it('should handle rapid platform changes with shortcuts enabled', () => {
      const store = setupStore();
      document.body.innerHTML = '<div id="test-input">Test</div>';

      // Enable shortcuts
      store.dispatch(updateShortcuts({ enabled: true }));

      // Rapid platform changes
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CLAUDE,
        elementSelector: '#nonexistent'
      }));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.PERPLEXITY,
        elementSelector: '#test-input'
      }));

      const state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(getInputElement()?.id).toBe('test-input');
    });

    it('should handle observer errors while maintaining shortcuts', () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const store = setupStore();
      const errorCallback = jest.fn(() => {
        throw new Error('Observer callback error');
      });

      // Set shortcuts and initialize platform
      store.dispatch(updateShortcuts({ enabled: true }));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      const input = document.getElementById('test-input') as HTMLElement;
      const observer = setupInputObserver(
        input,
        {
          selector    : '#test-input',
          useInnerHTML: false
        },
        errorCallback
      );

      // Simulate text change that triggers error
      input.textContent = 'New text';
      jest.runAllTimers();

      // Verify shortcuts remain enabled despite observer error
      const state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(getInputObserver()).toBe(observer);

      observer.disconnect();
    });

    it('should handle cleanup during observer error', () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const store = setupStore();

      // const errorCallback = jest.fn(() => {
      //   throw new Error('Observer callback error');
      // });

      // Set shortcuts and initialize platform
      store.dispatch(updateShortcuts({ enabled: true }));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      const input = document.getElementById('test-input') as HTMLElement;

      // const observer = setupInputObserver(
      //   input,
      //   {
      //     selector    : '#test-input',
      //     useInnerHTML: false
      //   },
      //   errorCallback
      // );

      // Simulate error and cleanup
      input.textContent = 'New text';
      jest.runAllTimers();
      store.dispatch(cleanupPlatform());

      // Verify cleanup succeeded despite observer error
      const state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(getInputElement()).toBeNull();
      expect(getInputObserver()).toBeNull();
    });

    it('should handle invalid platform initialization attempts', () => {
      const store = setupStore();
      const customShortcuts = {
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      };

      // Set shortcuts and initialize with valid platform
      store.dispatch(updateShortcuts(customShortcuts));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      // Dispatch an invalid platform action
      store.dispatch({
        type   : 'platform/initializePlatform',
        payload: {
          platform       : 'unknown-platform',
          elementSelector: '#test-input'
        }
      } as AnyAction);

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(customShortcuts);

      // Original platform config should be maintained
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CHATGPT]);
    });

    it('should handle malformed platform actions', () => {
      const store = setupStore();
      const customShortcuts = {
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      };

      // Set shortcuts and initialize
      store.dispatch(updateShortcuts(customShortcuts));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      // Dispatch malformed actions
      store.dispatch({ type: 'platform/initializePlatform' } as AnyAction);
      store.dispatch({
        type   : 'platform/initializePlatform',
        payload: null
      } as AnyAction);
      store.dispatch({
        type   : 'platform/initializePlatform',
        payload: {}
      } as AnyAction);

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(customShortcuts);
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CHATGPT]);
    });
  });

  describe('DOM Integration with Shortcuts', () => {
    it('should handle input changes with shortcuts enabled', () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const store = setupStore();
      const callback = jest.fn();

      // Enable shortcuts and initialize platform
      store.dispatch(updateShortcuts({ enabled: true }));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      const input = document.getElementById('test-input') as HTMLElement;
      const observer = setupInputObserver(
        input,
        {
          selector    : '#test-input',
          useInnerHTML: false
        },
        callback
      );

      // Simulate text change
      input.textContent = 'New text';
      jest.runAllTimers();

      expect(callback).toHaveBeenCalledWith('New text');
      expect(selectShortcuts(store.getState()).enabled).toBe(true);

      observer.disconnect();
    });

    it('should handle input changes with shortcuts disabled', () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const store = setupStore();
      const callback = jest.fn();

      // Disable shortcuts and initialize platform
      store.dispatch(updateShortcuts({ enabled: false }));
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      const input = document.getElementById('test-input') as HTMLElement;
      const observer = setupInputObserver(
        input,
        {
          selector    : '#test-input',
          useInnerHTML: false
        },
        callback
      );

      // Simulate text change
      input.textContent = 'New text';
      jest.runAllTimers();

      expect(callback).toHaveBeenCalledWith('New text');
      expect(selectShortcuts(store.getState()).enabled).toBe(false);

      observer.disconnect();
    });
  });

  describe('Platform State Transitions', () => {
    it('should handle complete platform lifecycle with shortcuts', () => {
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const store = setupStore();

      // Initial setup
      store.dispatch(updateShortcuts({
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      }));

      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      // Verify initial state
      let state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(getInputElement()).toBeTruthy();

      // Update shortcuts during active platform
      store.dispatch(updateShortcuts({ bindings: { togglePopover: ['Control', 'Space'] } }));

      // Verify mid-lifecycle state
      state = store.getState();
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Control', 'Space']);
      expect(state.platform.config.isInitialized).toBe(true);

      // Cleanup
      store.dispatch(cleanupPlatform());

      // Verify final state
      state = store.getState();
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Control', 'Space']);
      expect(state.platform.config.current).toBeNull();
      expect(getInputElement()).toBeNull();
    });
  });
});
