import uiReducer, {
  setIsStale,
  setOriginalPrompt,
  setRewrittenPrompt,
  setSelectedSuggestions,
  resetUI
} from '../../store/uiSlice';
import { setSuggestions } from '../../store/suggestionsSlice';
import { ESuggestionCategory, UIState } from '../../store/types';

describe('UI Slice', () => {
  const initialState: UIState = {
    isPopoverOpen      : false,
    isStale            : true,
    isLoading          : false,
    error              : null,
    originalPrompt     : '',
    firstRewrite       : '',
    rewrittenPrompt    : null,
    platformConfig     : null,
    suggestionsSelected: {
      tone       : [],
      clarity    : [],
      specificity: [],
      context    : [],
      format     : []
    },
    promptSuggestionsByCategory: {
      tone       : [],
      clarity    : [],
      specificity: [],
      context    : [],
      format     : []
    }
  };

  describe('Automatic Staleness Handling', () => {
    it('should mark as stale when original prompt changes', () => {
      const state = {
        ...initialState,
        firstRewrite: 'Initial prompt',
        isStale     : false
      };

      const newState = uiReducer(state, setOriginalPrompt('Changed prompt'));

      expect(newState.isStale).toBe(true);
    });

    it('should not mark as stale when original prompt matches first rewrite', () => {
      const state = {
        ...initialState,
        firstRewrite: 'Same prompt',
        isStale     : false
      };

      const newState = uiReducer(state, setOriginalPrompt('Same prompt'));

      expect(newState.isStale).toBe(false);
    });

    it('should update staleness when rewritten prompt changes', () => {
      const state = {
        ...initialState,
        firstRewrite  : 'Initial prompt',
        originalPrompt: 'Initial prompt',
        isStale       : true
      };

      const newState = uiReducer(state, setRewrittenPrompt('Modified prompt'));

      expect(newState.isStale).toBe(false);
    });

    it('should update staleness when suggestions are selected', () => {
      const state = {
        ...initialState,
        firstRewrite               : 'Test prompt',
        originalPrompt             : 'Test prompt',
        rewrittenPrompt            : 'Test prompt',
        promptSuggestionsByCategory: {
          ...initialState.promptSuggestionsByCategory,
          tone: ['formal', 'casual']
        }
      };

      const newState = uiReducer(
        state,
        setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 0,
          value        : true
        })
      );

      expect(newState.isStale).toBe(false);
      expect(newState.suggestionsSelected.tone).toEqual(['formal']);
    });

    it('should handle suggestion deselection', () => {
      const state = {
        ...initialState,
        firstRewrite               : 'Test prompt',
        originalPrompt             : 'Test prompt',
        rewrittenPrompt            : 'Test prompt',
        promptSuggestionsByCategory: {
          ...initialState.promptSuggestionsByCategory,
          tone: ['formal', 'casual']
        },
        suggestionsSelected: {
          ...initialState.suggestionsSelected,
          tone: ['formal']
        }
      };

      const newState = uiReducer(
        state,
        setSelectedSuggestions({
          category     : ESuggestionCategory.tone,
          suggestionIdx: 0,
          value        : false
        })
      );

      expect(newState.suggestionsSelected.tone).toEqual([]);
      expect(newState.isStale).toBe(true);
    });
  });

  describe('Controlled Staleness Handling', () => {
    it('should allow setting isStale to true', () => {
      const state = {
        ...initialState,
        isStale: false
      };

      const newState = uiReducer(state, setIsStale(true));

      expect(newState.isStale).toBe(true);
    });

    it('should verify with checkIsStale when setting to false', () => {
      const state = {
        ...initialState,
        firstRewrite  : 'Original prompt',
        originalPrompt: 'Changed prompt',
        isStale       : true
      };

      // Attempt to set isStale to false
      const newState = uiReducer(state, setIsStale(false));

      // Should remain stale because prompts don't match
      expect(newState.isStale).toBe(true);
    });

    it('should handle setSuggestions correctly', () => {
      const state = {
        ...initialState,
        isStale: true
      };

      const suggestions = {
        suggestions: {
          tone       : ['formal'],
          clarity    : [],
          specificity: [],
          context    : [],
          format     : []
        },
        rewrite     : 'Test rewrite',
        current_tone: [],
        summary     : 'Test summary'
      };

      const newState = uiReducer(state, setSuggestions(suggestions));

      expect(newState.firstRewrite).toBe('Test rewrite');
      expect(newState.rewrittenPrompt).toBe('Test rewrite');
      expect(newState.promptSuggestionsByCategory.tone).toEqual(['formal']);
      expect(newState.error).toBeNull();
    });

    it('should maintain firstRewrite when receiving new suggestions', () => {
      const state = {
        ...initialState,
        firstRewrite: 'Original rewrite',
        isStale     : true
      };

      const suggestions = {
        suggestions: {
          tone       : ['formal'],
          clarity    : [],
          specificity: [],
          context    : [],
          format     : []
        },
        rewrite     : 'New rewrite',
        current_tone: [],
        summary     : 'Test summary'
      };

      const newState = uiReducer(state, setSuggestions(suggestions));

      expect(newState.firstRewrite).toBe('Original rewrite');
      expect(newState.rewrittenPrompt).toBe('New rewrite');
    });
  });

  describe('State Reset', () => {
    it('should reset to initial state', () => {
      const modifiedState: UIState = {
        ...initialState,
        isStale            : false,
        originalPrompt     : 'Test prompt',
        firstRewrite       : 'First rewrite',
        rewrittenPrompt    : 'Modified rewrite',
        suggestionsSelected: {
          ...initialState.suggestionsSelected,
          tone: ['formal']
        }
      };

      const newState = uiReducer(modifiedState, resetUI());

      expect(newState).toEqual(initialState);
    });
  });
});
