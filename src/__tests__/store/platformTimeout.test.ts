import { configureStore, Reducer } from '@reduxjs/toolkit';
import platformReducer, {
  initializePlatform,
  updateShortcuts,
  selectShortcuts,
  setupInputObserver,
  getInputElement,
  getInputObserver,
  PLATFORM_CONFIGS
} from '../../store/platformSlice';
import { AIPlatform, PlatformState } from '../../store/types';

describe('Platform Timeout Handling', () => {
  const TIMEOUT = 5000; // 5 seconds timeout
  const RETRY_ATTEMPTS = 3;
  const BACKOFF_DELAY = 1000; // 1 second

  const setupStore = (preloadedState?: Partial<PlatformState>) => configureStore({
    reducer       : { platform: platformReducer as Reducer<PlatformState> },
    preloadedState: preloadedState ? { platform: preloadedState as PlatformState } : undefined
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  function retryOperation<T> (
    operation: () => Promise<T>,
    maxAttempts: number = RETRY_ATTEMPTS,
    backoffDelay: number = BACKOFF_DELAY
  ): Promise<T> {
    let lastError: Error | undefined;

    const executeAttempt = async (attempt: number): Promise<T> => {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timeout')), TIMEOUT);
          })
        ]);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          await delay(backoffDelay * attempt);

          return executeAttempt(attempt + 1);
        }
        throw lastError;
      }
    };

    return executeAttempt(1);
  }

  beforeEach(async () => {
    document.body.innerHTML = '';
    const observer = getInputObserver();

    if (observer) {
      await Promise.resolve(observer.disconnect());
    }
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await Promise.resolve(jest.useRealTimers());
  });

  describe('Partial Recovery Scenarios', () => {
    it('should handle mixed success/retry operations', async () => {
      const store = setupStore();
      document.body.innerHTML = '<div id="test-input">Test</div>';

      let shortcutAttempts = 0;
      let initAttempts = 0;
      let observerAttempts = 0;

      // Shortcuts succeed immediately
      const updateShortcutsOperation = () => {
        shortcutAttempts++;

        return store.dispatch(updateShortcuts({
          enabled : true,
          bindings: { togglePopover: ['Alt', 'Space'] }
        }));
      };

      // Platform init needs retries
      const initPlatformOperation = async () => {
        initAttempts++;

        if (initAttempts < 3) {
          await delay(TIMEOUT + 1000);
          throw new Error('Init timeout');
        }

        return store.dispatch(initializePlatform({
          platform       : AIPlatform.CHATGPT,
          elementSelector: '#test-input'
        }));
      };

      // Observer setup fails completely
      const setupObserverOperation = async () => {
        observerAttempts++;
        await delay(TIMEOUT + 1000);
        throw new Error('Observer setup failed');
      };

      // Execute operations with different outcomes
      const results = await Promise.allSettled([
        updateShortcutsOperation(),
        initPlatformOperation(),
        setupObserverOperation()
      ]);

      // Verify mixed outcomes
      expect(results[0].status).toBe('fulfilled'); // Shortcuts succeed
      expect(results[1].status).toBe('fulfilled'); // Init succeeds after retries
      expect(results[2].status).toBe('rejected'); // Observer setup fails

      const state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CHATGPT]);
      expect(shortcutAttempts).toBe(1);
      expect(initAttempts).toBe(3);
      expect(observerAttempts).toBe(3);
    });

    it('should maintain partial state during recovery', async () => {
      const store = setupStore();
      document.body.innerHTML = '<div id="test-input">Test</div>';

      // Set initial shortcuts (succeeds)
      await store.dispatch(updateShortcuts({
        enabled : true,
        bindings: { togglePopover: ['Alt', 'Space'] }
      }));

      let initAttempts = 0;

      const initOperation = async () => {
        initAttempts++;

        if (initAttempts < 3) {
          await delay(TIMEOUT + 1000);
          throw new Error('Init timeout');
        }

        return store.dispatch(initializePlatform({
          platform       : AIPlatform.CHATGPT,
          elementSelector: '#test-input'
        }));
      };

      // Attempt platform initialization (needs retries)
      await retryOperation(initOperation);

      // Update shortcuts during recovery (succeeds)
      await store.dispatch(updateShortcuts({ bindings: { togglePopover: ['Control', 'Space'] } }));

      const state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(true);
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Control', 'Space']);
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CHATGPT]);
      expect(initAttempts).toBe(3);
    });

    it('should handle observer recovery with partial functionality', async () => {
      const store = setupStore();
      document.body.innerHTML = '<div id="test-input">Initial text</div>';
      const input = document.getElementById('test-input') as HTMLElement;

      // Initialize platform (succeeds)
      await store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      let observerAttempts = 0;

      const setupObserverWithPartialRecovery = async () => {
        observerAttempts++;
        const callback = jest.fn();

        if (observerAttempts === 1) {
          await delay(TIMEOUT + 1000); // First attempt times out
          throw new Error('Observer timeout');
        }

        // Second attempt succeeds but with limited functionality
        const observer = await setupInputObserver(
          input,
          {
            selector    : '#test-input',
            useInnerHTML: false
          },
          callback
        );

        return {
          observer,
          callback
        };
      };

      const { observer, callback } = await retryOperation(setupObserverWithPartialRecovery);

      // Test the partially recovered observer
      input.textContent = 'New text';
      jest.runAllTimers();

      expect(callback).toHaveBeenCalledWith('New text');
      expect(getInputObserver()).toBe(observer);
      expect(observerAttempts).toBe(2);

      await Promise.resolve(observer.disconnect());
    });

    it('should recover from partial platform initialization', async () => {
      const store = setupStore();
      document.body.innerHTML = `
        <div id="input1">Input 1</div>
        <div id="input2">Input 2</div>
      `;

      // First initialization succeeds
      await store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#input1'
      }));

      let switchAttempts = 0;

      const switchPlatform = async () => {
        switchAttempts++;

        if (switchAttempts < 2) {
          await delay(TIMEOUT + 1000);
          throw new Error('Switch timeout');
        }

        return store.dispatch(initializePlatform({
          platform       : AIPlatform.CLAUDE,
          elementSelector: '#input2'
        }));
      };

      // Attempt platform switch (needs retry)
      await retryOperation(switchPlatform);

      const state = store.getState();
      expect(state.platform.config.current).toEqual(PLATFORM_CONFIGS[AIPlatform.CLAUDE]);
      expect(getInputElement()?.id).toBe('input2');
      expect(switchAttempts).toBe(2);
    });
  });
});
