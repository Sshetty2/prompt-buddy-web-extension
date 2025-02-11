import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ESuggestionCategory, UIState } from './types';
import { checkIsStale } from './checkIsStale';
import { setSuggestions } from './suggestionsSlice';

const initialState: UIState = {
  isStale            : true,
  isLoading          : false,
  error              : null,
  originalPrompt     : '',
  firstRewrite       : '',
  rewrittenPrompt    : null,
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

const uiSlice = createSlice({
  name    : 'ui',
  initialState,
  reducers: {
    setIsStale: (state, action: PayloadAction<boolean>) => {
      state.isStale = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setOriginalPrompt: (state, action: PayloadAction<string>) => {
      state.originalPrompt = action.payload;
    },
    setRewrittenPrompt: (state, action: PayloadAction<string>) => {
      state.rewrittenPrompt = action.payload;
      state.isStale = checkIsStale(state);
    },
    setSelectedSuggestions: (state, action: PayloadAction<{
      category: ESuggestionCategory;
      suggestionIdx: number;
      value: boolean
    }>) => {
      const promptSuggestions = state.promptSuggestionsByCategory[action.payload.category];

      // get the suggestion from the prompt suggestions response
      const suggestion = promptSuggestions?.[action.payload.suggestionIdx];

      // get the selected suggestions
      const selectedSuggestions = state.suggestionsSelected[action.payload.category];

      let newSuggestions = [];

      if (!suggestion) {
        state.error = 'No suggestion found. Please contact support if this persists.';

        return;
      }

      if (action.payload.value) {
        newSuggestions = [...selectedSuggestions, suggestion];
      } else {
        newSuggestions = (selectedSuggestions || []).filter(_suggestion => _suggestion !== suggestion);
      }

      state.suggestionsSelected = {
        ...state.suggestionsSelected,
        [action.payload.category]: newSuggestions
      };

      state.isStale = checkIsStale(state);
    },
    resetUI: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(setSuggestions, (state, action) => {
      state.firstRewrite = action.payload.rewrite;
      state.promptSuggestionsByCategory = action.payload.suggestions;
    });
  }
});

export const {
  setIsStale,
  setIsLoading,
  setError,
  setOriginalPrompt,
  setRewrittenPrompt,
  resetUI,
  setSelectedSuggestions
} = uiSlice.actions;

export default uiSlice.reducer;
