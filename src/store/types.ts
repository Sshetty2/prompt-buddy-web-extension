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

// eslint-disable-next-line no-shadow
export enum ECurrentTone {
  formal = 'formal',
  informal = 'informal',
  inquisitive = 'inquisitive',
  informative = 'informative',
  technical = 'technical',
  casual = 'casual',
  confused = 'confused',
  aggressive = 'aggressive',
  friendly = 'friendly',
  professional = 'professional',
  academic = 'academic',
  curious = 'curious'
}

// API Response type
export interface PromptSuggestionsData {
  suggestions: SuggestionCategory;
  current_tone: ECurrentTone[];
  summary: string;
  rewrite: string;
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

export interface NewSuggestionState {
  categories: Record<ESuggestionCategory, {
    available: string[] | null;
    selected: string[];
    lastUpdated: number;
  }>;
  analysis: {
    tones: ECurrentTone[];
    summary: string;
    confidence: number;
  };
  status: {
    isStale: boolean;
    lastFetch: number;
    retryCount: number;
    error: string | null;
  };
}

export interface PlatformState {
  config: {
    current: PlatformConfig | null;
    isInitialized: boolean;
    lastInitAttempt: number;
  };
  input: {
    elementSelector: string;
    lastUpdate: number;
  };
  shortcuts: {
    enabled: boolean;
    bindings: {
      togglePopover: string[];
      applyChanges: string[];
    };
  };
}

export interface RootState {
  suggestions: NewSuggestionState;
  ui: UIState;
  platform: PlatformState;
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

export interface ErrorState {
  code: string;
  message: string;
  timestamp: number;
  context?: {
    action: string;
    params?: Record<string, unknown>;
  };
}

export interface BatchUpdatePayload {
  suggestions?: Partial<NewSuggestionState>;
  status?: Partial<NewSuggestionState['status']>;
}

export type PromptSource = 'user' | 'ai' | 'suggestion';

export interface PromptUpdatePayload {
  text: string;
  source: PromptSource;
  timestamp: number;
}

export interface DOMRefs {
  inputElement: HTMLElement | null;
  observer: MutationObserver | null;
}
