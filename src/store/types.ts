// eslint-disable-next-line no-shadow
export enum ESuggestionCategory {
  tone = 'tone',
  clarity = 'clarity',
  specificity = 'specificity',
  context = 'context',
  format = 'format'
}

type SuggestionCategory = Record<ESuggestionCategory, string[]>;

export interface PromptSuggestionsData {
  suggestions: SuggestionCategory;
  current_tone: ECurrentTone[];
  summary: string;
  rewrite: string;
}

// eslint-disable-next-line no-shadow
export enum ECurrentTone {
  formal = 'formal',
  informal = 'informal',
  technical = 'technical',
  casual = 'casual',
  confused = 'confused',
  aggressive = 'aggressive',
  friendly = 'friendly',
  professional = 'professional',
  academic = 'academic'
}

export interface UIState {
  isStale: boolean;
  isLoading: boolean;
  error: string | null;
  originalPrompt: string;
  firstRewrite: string;
  rewrittenPrompt: string;
  suggestionsSelected: SuggestionCategory;
  promptSuggestionsByCategory: SuggestionCategory;
}

export interface RootState {
  suggestions: PromptSuggestionsData;
  ui: UIState;
}
