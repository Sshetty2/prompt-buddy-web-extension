import platformReducer, {
  initializePlatform,
  updateInputSelector,
  updateShortcuts,
  cleanupPlatform,
  PLATFORM_CONFIGS,
  getCurrentPlatform,
  setupInputObserver,
  getInputElement,
  getInputObserver,
  findAndSetInputElement,
  platformMiddleware,
  setInputElement,
  setInputObserver
} from '../../store/platformSlice';
import { AIPlatform, PlatformState } from '../../store/types';

describe('platformSlice', () => {
  const initialState: PlatformState = {
    config: {
      current        : null,
      isInitialized  : false,
      lastInitAttempt: 0
    },
    input: {
      elementSelector: '',
      lastUpdate     : 0
    },
    shortcuts: {
      enabled : true,
      bindings: {
        togglePopover: ['Control', 'Space'],
        applyChanges : ['Control', 'Enter']
      }
    }
  };

  beforeEach(() => {
    // Reset DOM refs before each test
    setInputElement(null);
    setInputObserver(null);
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      expect(platformReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle initializePlatform', () => {
      const payload = {
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#prompt-textarea'
      };

      const state = platformReducer(initialState, initializePlatform(payload));

      expect(state.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CHATGPT]);
      expect(state.config.isInitialized).toBe(true);
      expect(state.input.elementSelector).toBe('#prompt-textarea');
    });

    it('should handle updateInputSelector', () => {
      const newSelector = '#new-textarea';
      const state = platformReducer(initialState, updateInputSelector(newSelector));

      expect(state.input.elementSelector).toBe(newSelector);
      expect(state.input.lastUpdate).toBeGreaterThan(0);
    });

    it('should handle updateShortcuts with enabled only', () => {
      const state = platformReducer(initialState, updateShortcuts({ enabled: false }));

      expect(state.shortcuts.enabled).toBe(false);
      expect(state.shortcuts.bindings).toEqual(initialState.shortcuts.bindings);
    });

    it('should handle updateShortcuts with bindings only', () => {
      const newBindings = { togglePopover: ['Alt', 'Space'] };

      const state = platformReducer(
        initialState,
        updateShortcuts({ bindings: newBindings })
      );

      expect(state.shortcuts.enabled).toBe(true);
      expect(state.shortcuts.bindings.togglePopover).toEqual(['Alt', 'Space']);
      expect(state.shortcuts.bindings.applyChanges).toEqual(['Control', 'Enter']);
    });

    it('should handle cleanupPlatform', () => {
      const modifiedState: PlatformState = {
        ...initialState,
        config: {
          ...initialState.config,
          current      : PLATFORM_CONFIGS[AIPlatform.CHATGPT],
          isInitialized: true
        }
      };

      const state = platformReducer(modifiedState, cleanupPlatform());

      expect(state).toEqual(initialState);
    });
  });

  describe('DOM management', () => {
    it('should handle input element management', () => {
      const element = document.createElement('div');
      setInputElement(element);
      expect(getInputElement()).toBe(element);

      setInputElement(null);
      expect(getInputElement()).toBeNull();
    });

    it('should handle observer management', () => {
      const observer = new MutationObserver(() => undefined); // No-op observer for testing
      setInputObserver(observer);
      expect(getInputObserver()).toBe(observer);

      setInputObserver(null);
      expect(getInputObserver()).toBeNull();
    });

    it('should find and set input element', () => {
      document.body.innerHTML = '<div id="test-input"></div>';
      const element = findAndSetInputElement('#test-input');

      expect(element).toBeTruthy();
      expect(getInputElement()).toBe(element);
    });

    it('should handle setupInputObserver', () => {
      const input = document.createElement('div');
      const callback = jest.fn();
      const observer = setupInputObserver(input, {
        selector    : '',
        useInnerHTML: false
      }, callback);

      expect(observer).toBeTruthy();
      expect(getInputObserver()).toBe(observer);

      // Cleanup
      observer.disconnect();
    });
  });

  describe('platform utilities', () => {
    it('should detect current platform', () => {
      // Mock window.location
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        host: 'chat.openai.com'
      };

      expect(getCurrentPlatform()).toBe(AIPlatform.CHATGPT);

      // Restore original location
      window.location = originalLocation;
    });

    it('should return null for unknown platform', () => {
      // Mock window.location
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        host: 'unknown.com'
      };

      expect(getCurrentPlatform()).toBeNull();

      // Restore original location
      window.location = originalLocation;
    });
  });

  describe('middleware', () => {
    it('should handle initializePlatform action', () => {
      const middleware = platformMiddleware();
      const next = jest.fn();
      const action = initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      });

      document.body.innerHTML = '<div id="test-input"></div>';
      middleware(next)(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(getInputElement()).toBeTruthy();
    });

    it('should handle cleanupPlatform action', () => {
      const middleware = platformMiddleware();
      const next = jest.fn();
      const action = cleanupPlatform();

      // Set up initial state
      const element = document.createElement('div');
      const observer = new MutationObserver(() => undefined); // No-op observer for testing
      setInputElement(element);
      setInputObserver(observer);

      middleware(next)(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(getInputElement()).toBeNull();
      expect(getInputObserver()).toBeNull();
    });
  });
});
