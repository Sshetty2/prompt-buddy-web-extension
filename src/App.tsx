import { Input } from 'antd';
import { useEffect, useState } from 'react';
import PromptBuddyPopover from './components/PromptBuddyPopover';
import { setIsPopoverOpen } from './store/uiSlice';
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

  return (
    <main style={{
      padding : '20px',
      maxWidth: '800px',
      margin  : '0 auto'
    }}
    >
      <h1>Prompt Buddy</h1>
      <div style={{ position: 'relative' }}>
        <TextArea
          className="prompt-buddy-input"
          rows={4}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type your prompt here... (Ctrl+Space to toggle helper)"
          style={{ marginTop: '20px' }}
        />
        <PromptBuddyPopover />
      </div>
    </main>
  );
}

export default App;
