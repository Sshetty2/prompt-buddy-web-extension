// eslint-disable-next-line no-shadow
export enum ESuggestionCategory {
  tone = 'tone',
  clarity = 'clarity',
  specificity = 'specificity',
  context = 'context',
  format = 'format'
}

type SuggestionCategory = Record<ESuggestionCategory, string[] | null>;

type SuggestionCategorySelected = Record<ESuggestionCategory, string[]>;

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
  academic = 'academic',
  curious = 'curious'
}

export interface UIState {
  isPopoverOpen: boolean;
  isStale: boolean;
  isLoading: boolean;
  error: string | null;
  originalPrompt: string;
  firstRewrite: string;
  rewrittenPrompt: string | null;
  suggestionsSelected: SuggestionCategorySelected;
  promptSuggestionsByCategory: SuggestionCategory;
  platformConfig: PlatformConfig | null;
}

export interface RootState {
  suggestions: PromptSuggestionsData;
  ui: UIState;
}

export interface PlatformConfig {
  selector: string;
  useInnerHTML: boolean;
}

// eslint-disable-next-line no-shadow
export enum AIPlatform {
  CHATGPT = 'chatgpt.com',
  CLAUDE = 'claude.ai',
  PERPLEXITY = 'perplexity.ai'
}

