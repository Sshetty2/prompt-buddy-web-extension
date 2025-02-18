import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { rootSaga } from '../../store/sagas';
import suggestionsReducer, {
  fetchSuggestions,
  setSuggestions,
  regenerateSuggestions
} from '../../store/suggestionsSlice';
import uiReducer, {
  setOriginalPrompt,
  setRewrittenPrompt,
  setSelectedSuggestions,
  setIsLoading,
  setError
} from '../../store/uiSlice';
import platformReducer from '../../store/platformSlice';
import { ESuggestionCategory } from '../../store/types';

describe('Staleness Integration', () => {
  const setupStore = () => {
    const sagaMiddleware = createSagaMiddleware();
    const store = configureStore({
      reducer: {
        suggestions: suggestionsReducer,
        ui         : uiReducer,
        platform   : platformReducer
      },
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware)
    });
    sagaMiddleware.run(rootSaga);

    return store;
  };

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

  describe('Fetch Suggestions Flow', () => {
    it('should fetch suggestions when state is stale', async () => {
      const store = setupStore();

      // Set original prompt to trigger stale state
      await store.dispatch(setOriginalPrompt('Test prompt'));

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
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setSuggestions(mockApiResponse))
        .dispatch(fetchSuggestions('Test prompt'))
        .silentRun();

      const state = store.getState();
      expect(state.ui.isStale).toBe(false);
      expect(state.ui.firstRewrite).toBe('Test rewrite');
      expect(state.ui.rewrittenPrompt).toBe('Test rewrite');
    });

    it('should not fetch suggestions when state is not stale', async () => {
      const store = setupStore();

      // Set up non-stale state
      await store.dispatch(setSuggestions(mockApiResponse));
      await store.dispatch(setOriginalPrompt('Test rewrite')); // Match the rewrite

      await expectSaga(rootSaga)
        .withState(store.getState())
        .not.put(setIsLoading(true))
        .not.put(setSuggestions(mockApiResponse))
        .dispatch(fetchSuggestions('Test rewrite'))
        .silentRun();

      const state = store.getState();
      expect(state.ui.isStale).toBe(false);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle simultaneous prompt updates and suggestion fetching', async () => {
      const store = setupStore();

      // Create multiple concurrent operations
      const operations = [
        store.dispatch(setOriginalPrompt('First prompt')),
        store.dispatch(setOriginalPrompt('Second prompt')),
        expectSaga(rootSaga)
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
          .dispatch(fetchSuggestions('Second prompt'))
          .silentRun()
      ];

      // Execute operations concurrently
      await Promise.all(operations);

      const state = store.getState();
      expect(state.ui.originalPrompt).toBe('Second prompt');
      expect(state.ui.firstRewrite).toBe('Test rewrite');
      expect(state.ui.isStale).toBe(false);
    });

    it('should handle concurrent suggestion selections', async () => {
      const store = setupStore();

      // Set up initial state with suggestions
      await store.dispatch(setSuggestions({
        ...mockApiResponse,
        suggestions: {
          ...mockApiResponse.suggestions,
          tone: ['formal', 'casual', 'technical']
        }
      }));

      // Perform concurrent suggestion selections
      const selections = [
        store.dispatch(setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 0,
          value        : true
        })),
        store.dispatch(setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 1,
          value        : true
        })),
        store.dispatch(setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 2,
          value        : true
        }))
      ];

      await Promise.all(selections);

      const state = store.getState();
      expect(state.ui.suggestionsSelected.tone).toEqual(['formal', 'casual', 'technical']);
      expect(state.ui.isStale).toBe(false);
    });

    it('should handle interleaved prompt updates and suggestion selections', async () => {
      const store = setupStore();

      // Set up initial state
      await store.dispatch(setSuggestions(mockApiResponse));

      // Interleave prompt updates and suggestion selections
      const operations = [
        store.dispatch(setOriginalPrompt('New prompt')), // Makes stale
        store.dispatch(setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 0,
          value        : true
        })), // Should still work
        store.dispatch(setRewrittenPrompt('Modified rewrite')), // Updates rewrite
        expectSaga(rootSaga)
          .withState(store.getState())
          .provide([
            [
              matchers.call.fn(fetch),
              {
                ok  : true,
                json: () => ({
                  ...mockApiResponse,
                  rewrite: 'Latest rewrite'
                })
              }
            ]
          ])
          .dispatch(fetchSuggestions('New prompt'))
          .silentRun()
      ];

      await Promise.all(operations);

      const state = store.getState();
      expect(state.ui.originalPrompt).toBe('New prompt');
      expect(state.ui.rewrittenPrompt).toBe('Latest rewrite');
      expect(state.ui.suggestionsSelected.tone).toEqual(['formal']);
      expect(state.ui.isStale).toBe(false);
    });

    it('should handle rapid suggestion regeneration requests', async () => {
      const store = setupStore();

      // Set up initial state with selected suggestions
      await store.dispatch(setSuggestions(mockApiResponse));
      await store.dispatch(setSelectedSuggestions({
        category     : ESuggestionCategory.tone,
        suggestionIdx: 0,
        value        : true
      }));

      // Create multiple regeneration requests
      const regenerations = Array.from({ length: 3 }, (_, i) => expectSaga(rootSaga)
        .withState(store.getState())
        .provide([
          [
            matchers.call.fn(fetch),
            {
              ok  : true,
              json: () => ({
                ...mockApiResponse,
                rewrite: `Regenerated rewrite ${i + 1}`
              })
            }
          ]
        ])
        .dispatch(regenerateSuggestions())
        .silentRun());

      await Promise.all(regenerations);

      const state = store.getState();
      expect(state.ui.rewrittenPrompt).toBe('Regenerated rewrite 3');
      expect(state.ui.firstRewrite).toBe('Test rewrite'); // Original first rewrite preserved
      expect(state.ui.isStale).toBe(false);
    });
  });

  describe('Error Recovery', () => {
    it('should maintain consistent state during concurrent errors', async () => {
      const store = setupStore();

      // Set up initial state
      await store.dispatch(setOriginalPrompt('Test prompt'));

      // Create mixed success/failure operations
      const operations = [
        store.dispatch(setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 0,
          value        : true
        })), // Will fail (no suggestions yet)
        expectSaga(rootSaga)
          .withState(store.getState())
          .provide([
            [
              matchers.call.fn(fetch),
              Promise.reject(new Error('API Error'))
            ]
          ])
          .dispatch(fetchSuggestions('Test prompt'))
          .silentRun(),
        store.dispatch(setRewrittenPrompt('Manual edit')) // Should succeed
      ];

      await Promise.all(operations);

      const state = store.getState();
      expect(state.ui.error).toBe('Invalid suggestion selection. Please try again.');
      expect(state.ui.rewrittenPrompt).toBe('Manual edit');
      expect(state.ui.isStale).toBe(true); // Remains stale due to error
    });
  });
});
