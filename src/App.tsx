import { Input } from 'antd';
import { useState, useEffect } from 'react';
import PromptBuddyPopover from './components/PromptBuddyPopover';

const { TextArea } = Input;

function App () {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setIsPopoverOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
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
          placeholder="Type your prompt here... (Ctrl+Space to toggle helper)"
          style={{ marginTop: '20px' }}
        />

        <PromptBuddyPopover
          isPopoverOpen={isPopoverOpen}
          setIsPopoverOpen={setIsPopoverOpen}
        />
      </div>
    </main>
  );
}

export default App;
