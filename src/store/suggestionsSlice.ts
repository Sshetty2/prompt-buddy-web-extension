import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PromptSuggestionsData } from './types';

const initialState: PromptSuggestionsData = {
  suggestions: {
    tone       : null,
    clarity    : null,
    specificity: null,
    context    : null,
    format     : null
  },
  current_tone: [],
  summary     : '',
  rewrite     : ''
};

const suggestionsSlice = createSlice({
  name    : 'suggestionsData',
  initialState,
  reducers: {
    setSuggestions: (state, action: PayloadAction<PromptSuggestionsData>) => ({
      ...state,
      ...action.payload
    }),
    clearSuggestions     : () => initialState,
    fetchSuggestions     : (state, _: PayloadAction<string>) => state,
    regenerateSuggestions: state => state
  }
});

export const {
  setSuggestions,
  clearSuggestions,
  fetchSuggestions,
  regenerateSuggestions
} = suggestionsSlice.actions;

export default suggestionsSlice.reducer;
