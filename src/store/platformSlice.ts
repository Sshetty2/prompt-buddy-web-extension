import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIPlatform, PlatformConfig, PlatformState, DOMRefs } from './types';

// Store DOM references outside of Redux state
const domRefs: DOMRefs = {
  inputElement: null,
  observer    : null
};

const initialState: PlatformState = {
  config: {
    current        : null,
    isInitialized  : false,
    lastInitAttempt: 0
  },
  input: {
    elementSelector: '',
    lastUpdate     : 0
  },
  shortcuts: {
    enabled : true,
    bindings: {
      togglePopover: ['Control', 'Space'],
      applyChanges : ['Control', 'Enter']
    }
  }
};

export const PLATFORM_CONFIGS: Record<AIPlatform, PlatformConfig> = {
  [AIPlatform.CHATGPT]: {
    selector    : '#prompt-textarea',
    useInnerHTML: false
  },
  [AIPlatform.CLAUDE]: {
    selector    : '[aria-label="Write your prompt to Claude"]',
    useInnerHTML: false
  },
  [AIPlatform.PERPLEXITY]: {
    selector    : 'textarea',
    useInnerHTML: true
  }
};

const platformSlice = createSlice({
  name    : 'platform',
  initialState,
  reducers: {
    initializePlatform: (state, action: PayloadAction<{
      platform: AIPlatform;
      elementSelector: string;
    }>) => {
      const config = PLATFORM_CONFIGS[action.payload.platform];
      state.config = {
        current        : config,
        isInitialized  : true,
        lastInitAttempt: Date.now()
      };
      state.input = {
        elementSelector: action.payload.elementSelector,
        lastUpdate     : Date.now()
      };
    },
    updateInputSelector: (state, action: PayloadAction<string>) => {
      state.input.elementSelector = action.payload;
      state.input.lastUpdate = Date.now();
    },
    updateShortcuts: (state, action: PayloadAction<{
      enabled?: boolean;
      bindings?: Partial<PlatformState['shortcuts']['bindings']>;
    }>) => {
      if (typeof action.payload.enabled === 'boolean') {
        state.shortcuts.enabled = action.payload.enabled;
      }

      if (action.payload.bindings) {
        state.shortcuts.bindings = {
          ...state.shortcuts.bindings,
          ...action.payload.bindings
        };
      }
    },
    cleanupPlatform: () => {
      if (domRefs.observer) {
        domRefs.observer.disconnect();
      }
      domRefs.inputElement = null;
      domRefs.observer = null;

      return initialState;
    }
  }
});

export const {
  initializePlatform,
  updateInputSelector,
  updateShortcuts,
  cleanupPlatform
} = platformSlice.actions;

export default platformSlice.reducer;

export const setInputElement = (element: HTMLElement | null) => {
  domRefs.inputElement = element;
};

export const setInputObserver = (observer: MutationObserver | null) => {
  if (domRefs.observer) {
    domRefs.observer.disconnect();
  }
  domRefs.observer = observer;
};

export const selectPlatformConfig = (state: { platform: PlatformState }) => state.platform.config.current;

export const selectInputSelector = (state: { platform: PlatformState }) => state.platform.input.elementSelector;

export const selectShortcuts = (state: { platform: PlatformState }) => state.platform.shortcuts;

export const getCurrentPlatform = (): AIPlatform | null => {
  const host = window.location.host;
  const platform = Object.keys(PLATFORM_CONFIGS).find(p => host.includes(p));

  return platform ? (platform as AIPlatform) : null;
};

export const setupInputObserver = (
  input: HTMLElement,
  config: PlatformConfig,
  callback: (text: string) => void
): MutationObserver => {
  const observer = new MutationObserver(() => {
    const newText = config.useInnerHTML ? input.innerHTML : input.textContent;

    console.log('newText', newText);

    if (typeof newText === 'string') {
      callback(newText);
    }
  });

  observer.observe(input, {
    characterData: true,
    childList    : true,
    subtree      : true
  });

  setInputObserver(observer);

  return observer;
};

export const getInputElement = (): HTMLElement | null => domRefs.inputElement;

export const getInputObserver = (): MutationObserver | null => domRefs.observer;

export const findAndSetInputElement = (selector: string): HTMLElement | null => {
  const element = document.querySelector(selector) as HTMLElement;

  if (element) {
    setInputElement(element);
  }

  return element;
};

export const platformMiddleware = () => (next: any) => (action: any) => {
  const result = next(action);

  if (action.type === initializePlatform.type) {
    const { elementSelector } = action.payload;
    findAndSetInputElement(elementSelector);
  } else if (action.type === cleanupPlatform.type) {
    setInputElement(null);
    setInputObserver(null);
  }

  return result;
};
