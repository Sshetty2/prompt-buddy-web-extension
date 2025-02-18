// @ts-nocheck
import suggestionsReducer, { setSuggestions } from '../../store/suggestionsSlice';
import {
  ESuggestionCategory,
  PromptSuggestionsData,
  NewSuggestionState,
  BatchUpdatePayload
} from '../../store/types';

describe('suggestionsSlice', () => {
  const initialLegacyState: PromptSuggestionsData = {
    suggestions: {
      [ESuggestionCategory.tone]       : null,
      [ESuggestionCategory.clarity]    : null,
      [ESuggestionCategory.specificity]: null,
      [ESuggestionCategory.context]    : null,
      [ESuggestionCategory.format]     : null
    },
    current_tone: [],
    summary     : '',
    rewrite     : ''
  };

  const initialNewState: NewSuggestionState = {
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
  };

  const initialState: SuggestionsState = {
    legacy: initialLegacyState,
    new   : initialNewState
  };

  describe('legacy actions', () => {
    it('should handle setSuggestions', () => {
      const legacyData: PromptSuggestionsData = {
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

      const state = suggestionsReducer(initialState, setSuggestions(legacyData));

      expect(state.legacy).toEqual(legacyData);
      expect(state.new).toEqual(initialNewState);
    });

    it('should handle clearSuggestions', () => {
      const modifiedState: SuggestionsState = {
        legacy: {
          ...initialLegacyState,
          summary: 'Modified summary'
        },
        new: {
          ...initialNewState,
          analysis: {
            ...initialNewState.analysis,
            summary: 'Modified new summary'
          }
        }
      };

      const state = suggestionsReducer(modifiedState, clearSuggestions());

      expect(state).toEqual(initialState);
    });
  });

  describe('new state actions', () => {
    it('should handle updateNewState', () => {
      const updatePayload: BatchUpdatePayload = {
        suggestions: {
          categories: {
            [ESuggestionCategory.tone]: {
              available  : ['formal'],
              selected   : [],
              lastUpdated: Date.now()
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
          }
        }
      };

      const state = suggestionsReducer(initialState, updateNewState(updatePayload));

      expect(state.legacy).toEqual(initialLegacyState);
      expect(state.new.categories[ESuggestionCategory.tone].available).toEqual(['formal']);
      expect(state.new.categories[ESuggestionCategory.clarity].available).toBeNull();
    });

    it('should handle setSelectedSuggestion', () => {
      const stateWithSuggestions: SuggestionsState = {
        ...initialState,
        new: {
          ...initialState.new,
          categories: {
            ...initialState.new.categories,
            [ESuggestionCategory.tone]: {
              available  : ['formal', 'casual'],
              selected   : [],
              lastUpdated: 0
            }
          }
        }
      };

      const state = suggestionsReducer(
        stateWithSuggestions,
        setSelectedSuggestion({
          category: ESuggestionCategory.tone,
          index   : 0,
          selected: true
        })
      );

      expect(state.new.categories[ESuggestionCategory.tone].selected).toEqual(['formal']);
      expect(state.legacy).toEqual(initialLegacyState);
    });

    it('should handle updateSuggestionStatus', () => {
      const statusUpdate = {
        isStale: true,
        error  : 'Test error'
      };

      const state = suggestionsReducer(
        initialState,
        updateSuggestionStatus(statusUpdate)
      );

      expect(state.new.status.isStale).toBe(true);
      expect(state.new.status.error).toBe('Test error');
      expect(state.new.status.retryCount).toBe(0);
      expect(state.legacy).toEqual(initialLegacyState);
    });

    it('should handle resetRetryCount', () => {
      const stateWithRetries: SuggestionsState = {
        ...initialState,
        new: {
          ...initialState.new,
          status: {
            ...initialState.new.status,
            retryCount: 3
          }
        }
      };

      const state = suggestionsReducer(stateWithRetries, resetRetryCount());

      expect(state.new.status.retryCount).toBe(0);
      expect(state.legacy).toEqual(initialLegacyState);
    });

    it('should handle incrementRetryCount', () => {
      const state = suggestionsReducer(initialState, incrementRetryCount());

      expect(state.new.status.retryCount).toBe(1);
      expect(state.legacy).toEqual(initialLegacyState);
    });
  });
});
