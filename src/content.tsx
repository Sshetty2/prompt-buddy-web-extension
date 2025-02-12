import ReactDOM from 'react-dom/client';
import PromptBuddyPopover from './components/PromptBuddyPopover';
import { Provider } from 'react-redux';
import { setIsPopoverOpen, setOriginalPrompt } from './store/uiSlice';
import { createStore } from './store/createStore';

// eslint-disable-next-line no-shadow
enum AIPlatform {
  CHATGPT = 'chatgpt.com',
  CLAUDE = 'claude.ai',
  PERPLEXITY = 'perplexity.ai'
}

interface PlatformConfig {
  selector: string;
  useInnerHTML: boolean;
}

const PLATFORM_CONFIGS: Record<AIPlatform, PlatformConfig> = {
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

const store = createStore();

const waitForWindow = (timeout = 10000): Promise<void> => {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkWindow = () => {
      if (typeof window !== 'undefined') {
        resolve();

        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Window not available after ${timeout}ms`));

        return;
      }

      setTimeout(checkWindow, 100);
    };

    checkWindow();
  });
};

const waitForElement = (selector: string, timeout = 10000): Promise<HTMLElement> => {
  const startTime = Date.now();
  const checkInterval = 1500;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const checkElement = () => {
        const element = document.querySelector(selector) as HTMLElement;

        if (element) {
          resolve(element);

          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found after ${timeout}ms`));

          return;
        }

        setTimeout(checkElement, checkInterval);
      };

      checkElement();
    }, checkInterval);
  });
};

const getCurrentPlatform = (): PlatformConfig | null => {
  const host = window.location.host;
  const platform = Object.keys(PLATFORM_CONFIGS).find(p => host.includes(p));

  return platform ? PLATFORM_CONFIGS[platform as AIPlatform] : null;
};

const wrapInputWithPopover = (input: HTMLElement, platformConfig: PlatformConfig) => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'contents';
  wrapper.style.width = '100%';

  input?.parentNode?.appendChild(wrapper);

  // watch for text input changes
  const observer = new MutationObserver(() => {
    const newText = platformConfig.useInnerHTML ? input.innerHTML : input.textContent;

    if (newText || newText === '') {
      store.dispatch(setOriginalPrompt(newText));
    }
  });

  observer.observe(input, {
    characterData: true,
    childList    : true,
    subtree      : true
  });

  const root = ReactDOM.createRoot(wrapper);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      store.dispatch(setIsPopoverOpen(true));
    }
  };

  const render = () => {
    root.render(
      <Provider store={store}>
        <PromptBuddyPopover />
      </Provider>
    );
  };

  document.addEventListener('keydown', handleKeyDown);
  render();
};

const initializePromptBuddy = async () => {
  try {
    await waitForWindow();

    const platformConfig = getCurrentPlatform();

    if (!platformConfig) {
      return;
    }

    const input = await waitForElement(platformConfig.selector);
    wrapInputWithPopover(input, platformConfig);
  } catch (error) {
    console.error('Failed to initialize PromptBuddy:', error);
  }
};

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'PAGE_RELOADED') {
    initializePromptBuddy();
  }
});

initializePromptBuddy();
