import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ESuggestionCategory, PlatformConfig, UIState } from './types';
import { checkIsStale } from './checkIsStale';
import { setSuggestions } from './suggestionsSlice';

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

const uiSlice = createSlice({
  name    : 'ui',
  initialState,
  reducers: {
    setIsPopoverOpen: (state, action: PayloadAction<boolean>) => {
      state.isPopoverOpen = action.payload;
    },
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

      if (state.firstRewrite !== action.payload) {
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
      value: boolean
    }>) => {
      const promptSuggestions = state.promptSuggestionsByCategory[action.payload.category];

      const suggestion = promptSuggestions?.[action.payload.suggestionIdx];

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
      state.rewrittenPrompt = action.payload.rewrite;
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
  setIsPopoverOpen,
  resetUI,
  setSelectedSuggestions,
  setPlatformConfig
} = uiSlice.actions;

export default uiSlice.reducer;
