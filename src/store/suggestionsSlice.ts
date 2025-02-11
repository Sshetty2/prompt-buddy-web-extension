import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PromptSuggestions, PromptSuggestionsState } from './types';

const initialState: PromptSuggestionsState = {
  suggestions: {
    tone       : [],
    clarity    : [],
    specificity: [],
    context    : [],
    format     : []
  },
  current_tone: [],
  summary     : '',
  rewrite     : ''
};

const suggestionsSlice = createSlice({
  name    : 'suggestions',
  initialState,
  reducers: {
    setSuggestions: (state, action: PayloadAction<PromptSuggestions>) => ({
      ...state,
      ...action.payload
    }),
    clearSuggestions: () => initialState,
    fetchSuggestions: (state, _: PayloadAction<string>) => state
  }
});

export const {
  setSuggestions,
  clearSuggestions,
  fetchSuggestions
} = suggestionsSlice.actions;

export default suggestionsSlice.reducer;
