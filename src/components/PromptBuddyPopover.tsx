import { useCallback, useEffect, useMemo } from 'react';
import { ConfigProvider, Popover } from 'antd';
import PromptBuddyContent from './PromptBuddyContent';
import PromptBuddyIcon from './PromptBuddyIcon';
import { fetchSuggestions } from '../store/suggestionsSlice';
import PromptBuddyLoading from './PromptBuddyLoading';
import { setIsStale, setOriginalPrompt } from '../store/uiSlice';
import { useAppDispatch, useAppSelector, usePlatformState } from '../store/hooks';

import './styles.css';

interface PromptBuddyPopoverProps {
  input: HTMLElement | HTMLTextAreaElement | null;
  setInputValue?: (value: string) => void;
}

const PromptBuddyPopover = ({ input, setInputValue }: PromptBuddyPopoverProps) => {
  const dispatch = useAppDispatch();

  // Use typed selectors for better type safety
  const {
    isLoading,
    isPopoverOpen,
    rewrittenPrompt,
    originalPrompt
  } = useAppSelector(state => state.ui);

  // Use platform state hook
  const { config: platformConfig } = usePlatformState();

  const memoizedInputValue = useMemo(() => {
    if (!input) {
      return '';
    }

    try {
      if (setInputValue && 'resizableTextArea' in input) {
        // Handle antd TextArea component
        const textArea = (input as any).resizableTextArea?.textArea;

        return textArea?.value || '';
      }

      return platformConfig?.current?.useInnerHTML ? input.innerHTML : input.textContent || '';
    } catch (error) {
      console.error('Error getting input value:', error);

      return '';
    }
  }, [input, platformConfig, setInputValue]);

  const writeTextToInput = useCallback(() => {
    if (!input || rewrittenPrompt === null) {
      return;
    }

    try {
      if (setInputValue) {
        setInputValue(rewrittenPrompt);
      } else if (platformConfig?.current?.useInnerHTML) {
        input.innerHTML = rewrittenPrompt;
      } else {
        input.textContent = rewrittenPrompt;
      }
      dispatch(setOriginalPrompt(rewrittenPrompt));
      dispatch(setIsStale(true));
    } catch (error) {
      console.error('Error writing text to input:', error);
    }
  }, [dispatch, input, platformConfig, rewrittenPrompt, setInputValue]);

  // Effect to handle suggestion fetching
  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    if (originalPrompt !== memoizedInputValue) {
      dispatch(setOriginalPrompt(memoizedInputValue));
      dispatch(fetchSuggestions(memoizedInputValue));
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPopoverOpen
  ]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            bodyPadding  : 12,
            headerPadding: 12,
            headerHeight : 34
          }
        }
      }}
    >
      <Popover
        content={
          isLoading ? (
            <PromptBuddyLoading />
          ) : (
            <PromptBuddyContent writeTextToInput={writeTextToInput} />
          )
        }
        open={isPopoverOpen}
        trigger={[]}
        placement="topRight"
        styles={{
          body: {
            padding: 0,
            zIndex : 1000
          }
        }}
      >
        <PromptBuddyIcon />
      </Popover>
    </ConfigProvider>
  );
};

export default PromptBuddyPopover;
