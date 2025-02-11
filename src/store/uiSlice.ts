import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UISliceState } from './types';

const initialState: UISliceState = {
  isStale        : true,
  isLoading      : false,
  error          : null,
  originalPrompt : '',
  rewrittenPrompt: ''
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
    },
    resetUI: () => initialState
  }
});

export const {
  setIsStale,
  setIsLoading,
  setError,
  setOriginalPrompt,
  setRewrittenPrompt,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;
