import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PromptSuggestionsData,
  NewSuggestionState,
  ESuggestionCategory,
  ECurrentTone
} from './types';

const initialState: NewSuggestionState = {
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

const parseApiResponse = (data: PromptSuggestionsData): Partial<NewSuggestionState> => {
  const now = Date.now();

  return {
    categories: Object.entries(data.suggestions).reduce((acc, [category, suggestions]) => {
      acc[category as ESuggestionCategory] = {
        available  : suggestions,
        selected   : [],
        lastUpdated: now
      };

      return acc;
    }, {} as NewSuggestionState['categories']),
    analysis: {
      tones     : data.current_tone as ECurrentTone[],
      summary   : data.summary,
      confidence: 1.0
    },
    status: {
      isStale   : false,
      lastFetch : now,
      retryCount: 0,
      error     : null
    }
  };
};

const suggestionsSlice = createSlice({
  name    : 'suggestions',
  initialState,
  reducers: {
    setSuggestions: (state, action: PayloadAction<PromptSuggestionsData>) => {
      const newState = parseApiResponse(action.payload);
      state.categories = newState.categories!;
      state.analysis = newState.analysis!;
      state.status = newState.status!;
    },

    setSelectedSuggestion: (
      state,
      action: PayloadAction<{
        category: ESuggestionCategory;
        suggestionIdx: number;
        value: boolean;
      }>
    ) => {
      const { category, suggestionIdx, value } = action.payload;
      const categoryData = state.categories[category];
      const suggestion = categoryData.available?.[suggestionIdx];

      if (suggestion) {
        if (value) {
          categoryData.selected = [...categoryData.selected, suggestion];
        } else {
          categoryData.selected = categoryData.selected.filter(
            _suggestion => _suggestion !== suggestion
          );
        }
        categoryData.lastUpdated = Date.now();
      }
    },

    updateStatus: (
      state,
      action: PayloadAction<Partial<NewSuggestionState['status']>>
    ) => {
      state.status = {
        ...state.status,
        ...action.payload
      };
    },

    resetState: () => initialState,

    // These actions don't modify state but are handled by sagas
    fetchSuggestions     : (state, _: PayloadAction<string>) => state,
    regenerateSuggestions: state => state
  }
});

export const {
  setSuggestions,
  setSelectedSuggestion,
  updateStatus,
  resetState,
  fetchSuggestions,
  regenerateSuggestions
} = suggestionsSlice.actions;

export const selectSuggestions = (state: { suggestions: NewSuggestionState }) => state.suggestions;

export const selectCategories = (state: { suggestions: NewSuggestionState }) => state.suggestions.categories;

export const selectAnalysis = (state: { suggestions: NewSuggestionState }) => state.suggestions.analysis;

export const selectStatus = (state: { suggestions: NewSuggestionState }) => state.suggestions.status;

export default suggestionsSlice.reducer;
