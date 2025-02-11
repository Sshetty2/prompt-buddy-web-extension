import ReactDOM from 'react-dom/client';
import PromptBuddyPopover from './components/PromptBuddyPopover';

const wrapInputWithPopover = (input: HTMLElement) => {
  input.classList.add('prompt-buddy-input');

  const wrapper = document.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.width = '100%';

  input.parentNode?.insertBefore(wrapper, input);

  wrapper.appendChild(input);

  let isPopoverOpen = false;

  const root = ReactDOM.createRoot(wrapper);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      isPopoverOpen = !isPopoverOpen;
      render();
    }
  };

  const render = () => {
    root.render(
      <PromptBuddyPopover isPopoverOpen={isPopoverOpen}>
        {input.outerHTML}
      </PromptBuddyPopover>
    );
  };

  // Add keyboard listener
  document.addEventListener('keydown', handleKeyDown);

  // Initial render
  render();
};

// Function to find input elements
const findAndWrapInputs = () => {
  const selectors = [
    'textarea[placeholder*="Send a message"]', // ChatGPT
    '.claude-textarea', // Claude
    '.perplexity-input' // Perplexity
  ];

  selectors.forEach(selector => {
    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
      if (!input.closest('.ant-popover-wrapper')) {
        wrapInputWithPopover(input as HTMLElement);
      }
    });
  });
};

// Observer to detect new inputs
const observer = new MutationObserver(() => {
  findAndWrapInputs();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree  : true
});

// Initial check
findAndWrapInputs();
