import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { fetchSuggestionsSaga, regenerateSuggestionsSaga, rootSaga, fetchFromAPI } from '../../store/sagas';
import {
  fetchSuggestions,
  setSuggestions,
  regenerateSuggestions
} from '../../store/suggestionsSlice';
import {
  setIsLoading,
  setError,
  setIsStale,
  setRewrittenPrompt
} from '../../store/uiSlice';
import { ESuggestionCategory, RootState, PromptSuggestionsData } from '../../store/types';

describe('sagas', () => {
  const mockApiResponse: PromptSuggestionsData = {
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

  describe('fetchSuggestionsSaga', () => {
    it('should handle successful fetch', () => expectSaga(fetchSuggestionsSaga, fetchSuggestions('test prompt'))
      .provide([
        [
          matchers.call.fn(fetchFromAPI),
          mockApiResponse
        ],
        [
          matchers.select<RootState>(state => state.ui.isStale),
          true
        ],
        [
          matchers.select<RootState>(state => state.platform?.config.current),
          {
            selector    : '#test',
            useInnerHTML: false
          }
        ]
      ])
      .put(setIsLoading(true))
      .put(setError(null))
      .put(setRewrittenPrompt(null))
      .put(setSuggestions(mockApiResponse))
      .put(setIsStale(false))
      .put(setIsLoading(false))
      .run());

    it('should not fetch if not stale', () => expectSaga(fetchSuggestionsSaga, fetchSuggestions('test prompt'))
      .provide([
        [
          matchers.select<RootState>(state => state.ui.isStale),
          false
        ]
      ])
      .not.put(setIsLoading(true))
      .not.put(setSuggestions(mockApiResponse))
      .run());

    it('should handle fetch error', () => {
      const error = new Error('API Error');

      return expectSaga(fetchSuggestionsSaga, fetchSuggestions('test prompt'))
        .provide([
          [
            matchers.select<RootState>(state => state.ui.isStale),
            true
          ],
          [
            matchers.select<RootState>(state => state.platform?.config.current),
            {
              selector    : '#test',
              useInnerHTML: false
            }
          ],
          [
            matchers.call.fn(fetchFromAPI),
            throwError(error)
          ]
        ])
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setRewrittenPrompt(null))
        .put(setError('Error: API Error'))
        .put(setIsLoading(false))
        .run();
    });
  });

  describe('regenerateSuggestionsSaga', () => {
    it('should handle successful regeneration', () => {
      const mockState: Partial<RootState> = {
        ui: {
          rewrittenPrompt    : 'test rewrite',
          isPopoverOpen      : false,
          isStale            : true,
          isLoading          : false,
          error              : null,
          originalPrompt     : '',
          firstRewrite       : '',
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
        },
        platform: {
          config: {
            current: {
              selector    : '#test',
              useInnerHTML: false
            },
            isInitialized  : true,
            lastInitAttempt: Date.now()
          },
          input: {
            elementSelector: '#test',
            lastUpdate     : Date.now()
          },
          shortcuts: {
            enabled : true,
            bindings: {
              togglePopover: ['Control', 'Space'],
              applyChanges : ['Control', 'Enter']
            }
          }
        },
        suggestions: {
          categories: {
            [ESuggestionCategory.tone]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.clarity]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.specificity]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.context]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.format]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            }
          },
          analysis: {
            tones     : [],
            summary   : '',
            confidence: 1.0
          },
          status: {
            isStale   : true,
            lastFetch : 0,
            retryCount: 0,
            error     : null
          }
        }
      };

      return expectSaga(regenerateSuggestionsSaga)
        .provide([
          [
            matchers.select(),
            mockState
          ],
          [
            matchers.call.fn(fetchFromAPI),
            mockApiResponse
          ]
        ])
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setSuggestions(mockApiResponse))
        .put(setIsStale(false))
        .put(setIsLoading(false))
        .run();
    });

    it('should handle regeneration error', () => {
      const error = new Error('API Error');
      const mockState: Partial<RootState> = {
        ui: {
          rewrittenPrompt    : 'test rewrite',
          isPopoverOpen      : false,
          isStale            : true,
          isLoading          : false,
          error              : null,
          originalPrompt     : '',
          firstRewrite       : '',
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
        },
        platform: {
          config: {
            current: {
              selector    : '#test',
              useInnerHTML: false
            },
            isInitialized  : true,
            lastInitAttempt: Date.now()
          },
          input: {
            elementSelector: '#test',
            lastUpdate     : Date.now()
          },
          shortcuts: {
            enabled : true,
            bindings: {
              togglePopover: ['Control', 'Space'],
              applyChanges : ['Control', 'Enter']
            }
          }
        },
        suggestions: {
          categories: {
            [ESuggestionCategory.tone]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.clarity]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.specificity]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.context]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.format]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            }
          },
          analysis: {
            tones     : [],
            summary   : '',
            confidence: 1.0
          },
          status: {
            isStale   : true,
            lastFetch : 0,
            retryCount: 0,
            error     : null
          }
        }
      };

      return expectSaga(regenerateSuggestionsSaga)
        .provide([
          [
            matchers.select(),
            mockState
          ],
          [
            matchers.call.fn(fetchFromAPI),
            throwError(error)
          ]
        ])
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setError('Error: API Error'))
        .put(setIsLoading(false))
        .run();
    });

    it('should handle missing platform config', () => {
      const mockState: Partial<RootState> = {
        ui: {
          rewrittenPrompt    : 'test rewrite',
          isPopoverOpen      : false,
          isStale            : true,
          isLoading          : false,
          error              : null,
          originalPrompt     : '',
          firstRewrite       : '',
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
        },
        platform: {
          config: {
            current        : null,
            isInitialized  : false,
            lastInitAttempt: Date.now()
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
        },
        suggestions: {
          categories: {
            [ESuggestionCategory.tone]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.clarity]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.specificity]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.context]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            },
            [ESuggestionCategory.format]: {
              available  : null,
              selected   : [],
              lastUpdated: 0
            }
          },
          analysis: {
            tones     : [],
            summary   : '',
            confidence: 1.0
          },
          status: {
            isStale   : true,
            lastFetch : 0,
            retryCount: 0,
            error     : null
          }
        }
      };

      return expectSaga(regenerateSuggestionsSaga)
        .provide([
          [
            matchers.select(),
            mockState
          ]
        ])
        .put(setIsLoading(true))
        .put(setError(null))
        .put(setError('Error: Platform configuration not found'))
        .put(setIsLoading(false))
        .run();
    });
  });

  describe('rootSaga', () => {
    it('should set up watchers', () => expectSaga(rootSaga)
      .put.actionType(fetchSuggestions.type)
      .put.actionType(regenerateSuggestions.type)
      .silentRun());
  });
});
