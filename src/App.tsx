import { Card, Input, Button } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import PromptBuddyPopover from './components/PromptBuddyPopover';
import { setIsPopoverOpen, setIsStale, setOriginalPrompt } from './store/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/types';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const { TextArea } = Input;

const AppContent = () => {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch();
  const isPopoverOpen = useSelector((state: RootState) => state.ui.isPopoverOpen);
  const { theme, toggleTheme } = useTheme();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      dispatch(setIsPopoverOpen(!isPopoverOpen));
    }
  }, [dispatch, isPopoverOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <main style={{
      boxSizing: 'border-box',
      position : import.meta.env.DEV ? 'relative' : 'fixed',
      top      : 0,
      left     : 0
    }}
    >
      <Card
        title={
          <div style={{
            display       : 'flex',
            justifyContent: 'space-between',
            alignItems    : 'center'
          }}
          >
            <span>Prompt Buddy</span>
            <Button
              type="text"
              onClick={toggleTheme}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </div>
        }
        style={{
          width    : '100%',
          height   : '100%',
          padding  : '20px',
          boxSizing: 'inherit'
        }}
      >
        <div style={{ position: 'relative' }}>
          <TextArea
            className="prompt-buddy-input"
            rows={4}
            ref={inputRef}
            value={inputValue}
            onChange={e => {
              dispatch(setIsStale(true));
              setInputValue(e.target.value);
              dispatch(setOriginalPrompt(e.target.value));
            }}
            placeholder="Type your prompt here... (Ctrl+Space to toggle helper)"
            style={{ marginTop: '20px' }}
          />
          <PromptBuddyPopover
            input={inputRef.current}
            setInputValue={setInputValue}
          />
        </div>
      </Card>
    </main>
  );
};

function App () {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
