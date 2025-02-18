import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { rootSaga } from '../../store/sagas';
import suggestionsReducer, {
  fetchSuggestions,
  regenerateSuggestions,
  setSuggestions
} from '../../store/suggestionsSlice';
import uiReducer, {
  setIsLoading,
  setError,
  setIsStale,
  setRewrittenPrompt
} from '../../store/uiSlice';
import platformReducer, {
  initializePlatform,
  platformMiddleware
} from '../../store/platformSlice';
import { AIPlatform, ESuggestionCategory, RootState } from '../../store/types';

describe('Redux Store Integration', () => {
  const mockApiResponse = {
    suggestions: {
      [ESuggestionCategory.tone]       : ['formal'],
      [ESuggestionCategory.clarity]    : null,
      [ESuggestionCategory.specificity]: null,
      [ESuggestionCategory.context]    : null,
      [ESuggestionCategory.format]     : null
    },
    current_tone: [],
    summary     : 'Test summary',
    rewrite     : 'Test rewrite'
  };

  const rootReducer = combineReducers({
    suggestions: suggestionsReducer,
    ui         : uiReducer,
    platform   : platformReducer
  });

  const ignoredActions = [
    'platform/initializePlatform',
    'platform/cleanupPlatform',
    'suggestions/updateNewState',
    'suggestions/setSelectedSuggestion',
    'suggestions/updateSuggestionStatus'
  ];

  const ignoredPaths = [
    'platform.input.element',
    'platform.input.observer',
    'suggestions.new.categories.*.lastUpdated',
    'suggestions.new.status.lastFetch'
  ];

  const setupStore = (preloadedState?: Partial<RootState>) => {
    const sagaMiddleware = createSagaMiddleware();

    const store = configureStore({
      reducer   : rootReducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: {
          ignoredActions,
          ignoredPaths
        },
        immutableCheck: import.meta.env.DEV,
        thunk         : true
      })
        .concat(sagaMiddleware)
        .concat(platformMiddleware),
      preloadedState
    });

    sagaMiddleware.run(rootSaga);

    return store;
  };

  describe('Fetch Suggestions Flow', () => {
    it('should handle the complete fetch suggestions flow', async () => {
      const store = setupStore({
        ui: {
          isStale            : true,
          isPopoverOpen      : false,
          isLoading          : false,
          error              : null,
          originalPrompt     : 'test prompt',
          firstRewrite       : '',
          rewrittenPrompt    : null,
          suggestionsSelected: {
            [ESuggestionCategory.tone]       : [],
            [ESuggestionCategory.clarity]    : [],
            [ESuggestionCategory.specificity]: [],
            [ESuggestionCategory.context]    : [],
            [ESuggestionCategory.format]     : []
          },
          promptSuggestionsByCategory: {
            [ESuggestionCategory.tone]       : null,
            [ESuggestionCategory.clarity]    : null,
            [ESuggestionCategory.specificity]: null,
            [ESuggestionCategory.context]    : null,
            [ESuggestionCategory.format]     : null
          },
          platformConfig: null
        }
      });

      // Initialize platform first
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      await expectSaga(rootSaga)
        .withState(store.getState())
        .provide([
          [
            matchers.call.fn(fetch),
            {
              ok  : true,
              json: () => mockApiResponse
            }
          ]
        ])
        .dispatch(fetchSuggestions('test prompt'))
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setRewrittenPrompt(null))
        .put(setSuggestions(mockApiResponse))
        .put(setIsStale(false))
        .put(setIsLoading(false))
        .silentRun();

      const finalState = store.getState();
      expect(finalState.ui.isStale).toBe(false);
      expect(finalState.ui.isLoading).toBe(false);
      expect(finalState.ui.error).toBeNull();
    });

    it('should handle API errors in the complete flow', async () => {
      const store = setupStore({
        ui: {
          isStale            : true,
          isPopoverOpen      : false,
          isLoading          : false,
          error              : null,
          originalPrompt     : 'test prompt',
          firstRewrite       : '',
          rewrittenPrompt    : null,
          suggestionsSelected: {
            [ESuggestionCategory.tone]       : [],
            [ESuggestionCategory.clarity]    : [],
            [ESuggestionCategory.specificity]: [],
            [ESuggestionCategory.context]    : [],
            [ESuggestionCategory.format]     : []
          },
          promptSuggestionsByCategory: {
            [ESuggestionCategory.tone]       : null,
            [ESuggestionCategory.clarity]    : null,
            [ESuggestionCategory.specificity]: null,
            [ESuggestionCategory.context]    : null,
            [ESuggestionCategory.format]     : null
          },
          platformConfig: null
        }
      });

      // Initialize platform first
      store.dispatch(initializePlatform({
        platform       : AIPlatform.CHATGPT,
        elementSelector: '#test-input'
      }));

      const error = new Error('API Error');
      await expectSaga(rootSaga)
        .withState(store.getState())
        .provide([
          [
            matchers.call.fn(fetch),
            Promise.reject(error)
          ]
        ])
        .dispatch(fetchSuggestions('test prompt'))
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setRewrittenPrompt(null))
        .put(setError('Error: API Error'))
        .put(setIsLoading(false))
        .silentRun();

      const finalState = store.getState();
      expect(finalState.ui.error).toBe('Error: API Error');
      expect(finalState.ui.isLoading).toBe(false);
    });
  });

  describe('Regenerate Suggestions Flow', () => {
    it('should handle the complete regenerate suggestions flow', async () => {
      const store = setupStore({
        ui: {
          isStale            : true,
          isPopoverOpen      : false,
          isLoading          : false,
          error              : null,
          originalPrompt     : 'test prompt',
          firstRewrite       : 'first rewrite',
          rewrittenPrompt    : 'edited rewrite',
          suggestionsSelected: {
            [ESuggestionCategory.tone]       : ['formal'],
            [ESuggestionCategory.clarity]    : [],
            [ESuggestionCategory.specificity]: [],
            [ESuggestionCategory.context]    : [],
            [ESuggestionCategory.format]     : []
          },
          promptSuggestionsByCategory: {
            [ESuggestionCategory.tone]       : ['formal', 'casual'],
            [ESuggestionCategory.clarity]    : null,
            [ESuggestionCategory.specificity]: null,
            [ESuggestionCategory.context]    : null,
            [ESuggestionCategory.format]     : null
          },
          platformConfig: null
        },
        platform: {
          config: {
            current: {
              selector    : '#test-input',
              useInnerHTML: false
            },
            isInitialized  : true,
            lastInitAttempt: Date.now()
          },
          input: {
            elementSelector: '#test-input',
            lastUpdate     : Date.now()
          },
          shortcuts: {
            enabled : true,
            bindings: {
              togglePopover: ['Control', 'Space'],
              applyChanges : ['Control', 'Enter']
            }
          }
        }
      });

      await expectSaga(rootSaga)
        .withState(store.getState())
        .provide([
          [
            matchers.call.fn(fetch),
            {
              ok  : true,
              json: () => mockApiResponse
            }
          ]
        ])
        .dispatch(regenerateSuggestions())
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setSuggestions(mockApiResponse))
        .put(setIsStale(false))
        .put(setIsLoading(false))
        .silentRun();

      const finalState = store.getState();
      expect(finalState.ui.isStale).toBe(false);
      expect(finalState.ui.isLoading).toBe(false);
      expect(finalState.ui.error).toBeNull();
    });
  });
});
