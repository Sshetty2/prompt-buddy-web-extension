// API Response Types
export interface PromptSuggestions {
  suggestions: {
    tone: string[];
    clarity: string[];
    specificity: string[];
    context: string[];
    format: string[];
  };
  current_tone: string[];
  summary: string;
  rewrite: string;
}

// UI State Types
export interface UIState {
  isStale: boolean;
  isLoading: boolean;
  error: string | null;
  originalPrompt: string;
  rewrittenPrompt: string;
}

// Slice States
export interface PromptSuggestionsState extends PromptSuggestions {

  // Any additional suggestion-specific state can go here
}

export interface UISliceState extends UIState {

  // Any additional UI-specific state can go here
}

// Root State
export interface RootState {
  suggestions: PromptSuggestionsState;
  ui: UISliceState;
}
