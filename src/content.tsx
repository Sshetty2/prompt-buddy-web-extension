import ReactDOM from 'react-dom/client';
import PromptBuddyPopover from './components/PromptBuddyPopover';
import { Provider } from 'react-redux';
import { setIsPopoverOpen, setOriginalPrompt } from './store/uiSlice';
import { createStore } from './store/createStore';
import { AIPlatform } from './store/types';
import {
  getCurrentPlatform,
  initializePlatform,
  setupInputObserver,
  PLATFORM_CONFIGS
} from './store/platformSlice';
import { ThemeProvider } from './theme/ThemeContext';

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

const wrapInputWithPopover = (input: HTMLElement, platform: AIPlatform) => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'contents';
  wrapper.style.width = '100%';

  input?.parentNode?.appendChild(wrapper);

  // Initialize platform state
  store.dispatch(initializePlatform({
    platform,
    elementSelector: PLATFORM_CONFIGS[platform].selector
  }));

  // Set up observer using our platform utilities
  setupInputObserver(
    input,
    PLATFORM_CONFIGS[platform],
    (newText: string) => {
      store.dispatch(setOriginalPrompt(newText));
    }
  );

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
        <ThemeProvider>
          <PromptBuddyPopover
            input={input}
          />
        </ThemeProvider>
      </Provider>
    );
  };

  document.addEventListener('keydown', handleKeyDown);
  render();

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

const initializePromptBuddy = async () => {
  try {
    await waitForWindow();

    const platform = getCurrentPlatform();

    if (!platform) {
      console.warn('No supported platform found');

      return;
    }

    const config = PLATFORM_CONFIGS[platform];
    const input = await waitForElement(config.selector);

    wrapInputWithPopover(input, platform);
  } catch (error) {
    console.error('Failed to initialize PromptBuddy:', error);
  }
};

// Handle extension messages
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'PAGE_RELOADED') {
    initializePromptBuddy();
  }
});

// Initial initialization
initializePromptBuddy();
