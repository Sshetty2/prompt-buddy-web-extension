import { Card, Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import PromptBuddyPopover from './components/PromptBuddyPopover';
import { setIsPopoverOpen, setIsStale } from './store/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/types';

const { TextArea } = Input;

function App () {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch();
  const isPopoverOpen = useSelector((state: RootState) => state.ui.isPopoverOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        dispatch(setIsPopoverOpen(!isPopoverOpen));
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <main style={{
      boxSizing: 'border-box',
      position : 'fixed',
      top      : 0,
      left     : 0
    }}
    >
      <Card
        title="Prompt Buddy"
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
}

export default App;
