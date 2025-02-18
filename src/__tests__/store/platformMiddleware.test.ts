import { configureStore, combineReducers } from '@reduxjs/toolkit';
import platformReducer, {
  platformMiddleware,
  initializePlatform,
  cleanupPlatform,
  getInputElement,
  getInputObserver,
  setupInputObserver
} from '../../store/platformSlice';
import { AIPlatform } from '../../store/types';

describe('Platform Middleware', () => {
  const rootReducer = combineReducers({ platform: platformReducer });

  const setupStore = () => configureStore({
    reducer   : rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(platformMiddleware)
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

  describe('initializePlatform', () => {
    it('should find and set input element when element exists', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input"></div>';
      const store = setupStore();

      // Act
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      // Assert
      const inputElement = getInputElement();
      expect(inputElement).toBeTruthy();
      expect(inputElement?.id).toBe('test-input');
    });

    it('should not set input element when element does not exist', () => {
      // Setup
      const store = setupStore();

      // Act
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#nonexistent-input'
      }));

      // Assert
      expect(getInputElement()).toBeNull();
    });

    it('should handle multiple initializations', () => {
      // Setup
      document.body.innerHTML = `
        <div id="first-input"></div>
        <div id="second-input"></div>
      `;
      const store = setupStore();

      // Act - First initialization
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#first-input'
      }));

      const firstElement = getInputElement();
      expect(firstElement?.id).toBe('first-input');

      // Act - Second initialization
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CLAUDE,
        elementSelector: '#second-input'
      }));

      const secondElement = getInputElement();
      expect(secondElement?.id).toBe('second-input');
    });
  });

  describe('cleanupPlatform', () => {
    it('should clean up input element and observer', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input"></div>';
      const store = setupStore();

      // Initialize first
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      expect(getInputElement()).toBeTruthy();

      // Act
      store.dispatch(cleanupPlatform());

      // Assert
      expect(getInputElement()).toBeNull();
      expect(getInputObserver()).toBeNull();
    });

    it('should handle cleanup when no element is set', () => {
      // Setup
      const store = setupStore();

      // Act
      store.dispatch(cleanupPlatform());

      // Assert
      expect(getInputElement()).toBeNull();
      expect(getInputObserver()).toBeNull();
    });

    it('should handle multiple cleanup calls', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input"></div>';
      const store = setupStore();

      // Initialize
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      // Act - Multiple cleanups
      store.dispatch(cleanupPlatform());
      store.dispatch(cleanupPlatform());

      // Assert
      expect(getInputElement()).toBeNull();
      expect(getInputObserver()).toBeNull();
    });
  });

  describe('Input Observer', () => {
    it('should observe text content changes', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const input = document.getElementById('test-input') as HTMLElement;
      const callback = jest.fn();

      // Create observer
      const observer = setupInputObserver(input, {
        selector    : '#test-input',
        useInnerHTML: false
      }, callback);

      // Simulate text content change
      input.textContent = 'New text';

      // Let the event loop process the mutation
      jest.runAllTimers();

      // Assert
      expect(callback).toHaveBeenCalledWith('New text');
      expect(getInputObserver()).toBe(observer);

      // Cleanup
      observer.disconnect();
    });

    it('should observe innerHTML changes when configured', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input"><span>Initial text</span></div>';
      const input = document.getElementById('test-input') as HTMLElement;
      const callback = jest.fn();

      // Create observer with innerHTML config
      const observer = setupInputObserver(input, {
        selector    : '#test-input',
        useInnerHTML: true
      }, callback);

      // Simulate innerHTML change
      input.innerHTML = '<span>New text</span>';

      // Let the event loop process the mutation
      jest.runAllTimers();

      // Assert
      expect(callback).toHaveBeenCalledWith('<span>New text</span>');
      expect(getInputObserver()).toBe(observer);

      // Cleanup
      observer.disconnect();
    });

    it('should handle observer disconnection', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const input = document.getElementById('test-input') as HTMLElement;
      const callback = jest.fn();

      // Create and immediately disconnect observer
      const observer = setupInputObserver(input, {
        selector    : '#test-input',
        useInnerHTML: false
      }, callback);
      observer.disconnect();

      // Simulate text change
      input.textContent = 'New text';

      // Let the event loop process
      jest.runAllTimers();

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple observers', () => {
      // Setup
      document.body.innerHTML = `
        <div id="first-input">First text</div>
        <div id="second-input">Second text</div>
      `;
      const firstInput = document.getElementById('first-input') as HTMLElement;
      const secondInput = document.getElementById('second-input') as HTMLElement;
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      // Create first observer
      const firstObserver = setupInputObserver(
        firstInput,
        {
          selector    : '#first-input',
          useInnerHTML: false
        },
        firstCallback
      );

      // Verify first observer is set
      expect(getInputObserver()).toBe(firstObserver);

      // Create second observer (should disconnect first)
      const secondObserver = setupInputObserver(
        secondInput,
        {
          selector    : '#second-input',
          useInnerHTML: false
        },
        secondCallback
      );

      // Verify second observer replaced first
      expect(getInputObserver()).toBe(secondObserver);

      // Simulate changes to both inputs
      firstInput.textContent = 'New first text';
      secondInput.textContent = 'New second text';

      // Let the event loop process
      jest.runAllTimers();

      // Assert only second callback was called
      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith('New second text');

      // Cleanup
      secondObserver.disconnect();
    });
  });

  describe('Platform State Updates', () => {
    it('should update platform state while maintaining DOM refs', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input"></div>';
      const store = setupStore();

      // Initialize
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      const initialElement = getInputElement();
      expect(initialElement?.id).toBe('test-input');

      // Verify platform state
      const state = store.getState();
      expect(state.platform.config.current).toEqual({
        selector    : '#prompt-textarea',
        useInnerHTML: false
      });
      expect(state.platform.config.isInitialized).toBe(true);
      expect(state.platform.input.elementSelector).toBe('#test-input');

      // DOM refs should be maintained separately from Redux state
      expect(getInputElement()).toBe(initialElement);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid selectors gracefully', () => {
      // Setup
      const store = setupStore();

      // Act - Try to initialize with invalid selector
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: 'invalid selector []'
      }));

      // Assert
      expect(getInputElement()).toBeNull();
      const state = store.getState();
      expect(state.platform.config.isInitialized).toBe(true); // State still updates
      expect(state.platform.input.elementSelector).toBe('invalid selector []');
    });

    it('should handle observer errors gracefully', () => {
      // Setup
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const input = document.getElementById('test-input') as HTMLElement;
      const callback = jest.fn(() => {
        throw new Error('Callback error');
      });

      // Create observer
      const observer = setupInputObserver(input, {
        selector    : '#test-input',
        useInnerHTML: false
      }, callback);

      // Simulate text change
      input.textContent = 'New text';

      // Let the event loop process
      jest.runAllTimers();

      // Assert observer still exists despite callback error
      expect(getInputObserver()).toBe(observer);

      // Cleanup
      observer.disconnect();
    });
  });
});
