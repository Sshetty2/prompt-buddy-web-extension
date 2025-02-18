import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ESuggestionCategory, PlatformConfig, UIState } from './types';
import { checkIsStale } from './checkIsStale';
import { setSuggestions } from './suggestionsSlice';

const initialSuggestionState = {
  tone       : [],
  clarity    : [],
  specificity: [],
  context    : [],
  format     : []
};

const initialState: UIState = {
  isPopoverOpen              : false,
  isStale                    : true,
  isLoading                  : false,
  error                      : null,
  originalPrompt             : '',
  firstRewrite               : '',
  rewrittenPrompt            : null,
  platformConfig             : null,
  suggestionsSelected        : { ...initialSuggestionState },
  promptSuggestionsByCategory: { ...initialSuggestionState }
};

const uiSlice = createSlice({
  name    : 'ui',
  initialState,
  reducers: {
    setIsPopoverOpen: (state, action: PayloadAction<boolean>) => {
      state.isPopoverOpen = action.payload;
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;

      if (action.payload) {
        state.error = null;
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;

      if (action.payload) {
        state.isLoading = false;
      }
    },

    setOriginalPrompt: (state, action: PayloadAction<string>) => {
      const newPrompt = action.payload;
      state.originalPrompt = newPrompt;

      if (state.firstRewrite && state.firstRewrite !== newPrompt) {
        state.isStale = true;
      }
    },

    setRewrittenPrompt: (state, action: PayloadAction<string | null>) => {
      state.rewrittenPrompt = action.payload;

      state.isStale = checkIsStale(state);
    },

    setPlatformConfig: (state, action: PayloadAction<PlatformConfig>) => {
      state.platformConfig = action.payload;
    },

    setSelectedSuggestions: (state, action: PayloadAction<{
      category: ESuggestionCategory;
      suggestionIdx: number;
      value: boolean;
    }>) => {
      const { category, suggestionIdx, value } = action.payload;
      const availableSuggestions = state.promptSuggestionsByCategory[category];
      const selectedSuggestions = state.suggestionsSelected[category];
      const suggestion = availableSuggestions?.[suggestionIdx];

      if (!suggestion) {
        state.error = 'Invalid suggestion selection. Please try again.';

        return;
      }

      if (value) {
        if (!selectedSuggestions.includes(suggestion)) {
          state.suggestionsSelected[category] = [...selectedSuggestions, suggestion];
        }
      } else {
        state.suggestionsSelected[category] = selectedSuggestions.filter(
          _suggestion => _suggestion !== suggestion
        );
      }

      state.isStale = checkIsStale(state);
    },

    setIsStale: (state, action: PayloadAction<boolean>) => {
      // Only allow setting to true if checkIsStale agrees
      // This prevents accidentally marking as not stale when it should be
      if (action.payload) {
        state.isStale = true;
      } else {
        state.isStale = checkIsStale(state);
      }
    },

    resetUI: () => initialState
  },

  extraReducers: builder => {
    builder.addCase(setSuggestions, (state, action) => {
      state.firstRewrite = action.payload.rewrite;

      state.rewrittenPrompt = action.payload.rewrite;
      state.promptSuggestionsByCategory = action.payload.suggestions;

      state.error = null;

      state.isStale = checkIsStale(state);
    });
  }
});

export const {
  setIsStale,
  setIsLoading,
  setError,
  setOriginalPrompt,
  setRewrittenPrompt,
  setIsPopoverOpen,
  resetUI,
  setSelectedSuggestions,
  setPlatformConfig
} = uiSlice.actions;

export default uiSlice.reducer;
