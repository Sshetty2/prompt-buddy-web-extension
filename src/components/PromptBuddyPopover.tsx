import { useCallback, useEffect, useMemo } from 'react';
import { ConfigProvider, Popover } from 'antd';
import PromptBuddyContent from './PromptBuddyContent';
import PromptBuddyIcon from './PromptBuddyIcon';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { fetchSuggestions } from '../store/suggestionsSlice';
import PromptBuddyLoading from './PromptBuddyLoading';

import './styles.css';
import { setIsStale } from '../store/uiSlice';

const PromptBuddyPopover = ({
  input,
  setInputValue
}: {
  input: HTMLElement | HTMLTextAreaElement | null;
  setInputValue?: (value: string) => void;
}) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading);
  const isPopoverOpen = useSelector((state: RootState) => state.ui.isPopoverOpen);
  const rewrittenPrompt = useSelector((state: RootState) => state.ui.rewrittenPrompt);
  const platformConfig = useSelector((state: RootState) => state.ui.platformConfig);
  const originalPrompt = useSelector((state: RootState) => state.ui.originalPrompt);

  const memoizedInputValue = useMemo(() => {
    if (!input) {
      return '';
    }

    try {
      if (setInputValue && 'resizableTextArea' in input) {
        // @ts-ignore
        return input.resizableTextArea?.textArea?.value || '';
      }

      return platformConfig?.useInnerHTML ? input.innerHTML : input.textContent || '';
    } catch (error) {
      console.error('Error getting input value:', error);

      return '';
    }
  }, [input, platformConfig?.useInnerHTML, setInputValue]);

  const writeTextToInput = useCallback(() => {
    if (!input || rewrittenPrompt === null) {
      return;
    }

    try {
      if (setInputValue) {
        setInputValue(rewrittenPrompt);
      } else if (platformConfig?.useInnerHTML) {
        input.innerHTML = rewrittenPrompt;
      } else {
        input.textContent = rewrittenPrompt;
      }
      dispatch(setIsStale(false));
    } catch (error) {
      console.error('Error writing text to input:', error);
    }
  }, [input, rewrittenPrompt, setInputValue, platformConfig?.useInnerHTML, dispatch]);

  useEffect(() => {
    if (isPopoverOpen && (memoizedInputValue || originalPrompt)) {
      dispatch(fetchSuggestions(memoizedInputValue || originalPrompt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isPopoverOpen]);

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
          isLoading ? <PromptBuddyLoading /> : (
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
