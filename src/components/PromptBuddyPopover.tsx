import { useEffect } from 'react';
import { ConfigProvider, Popover } from 'antd';
import PromptBuddyContent from './PromptBuddyContent';
import PromptBuddyIcon from './PromptBuddyIcon';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { fetchSuggestions } from '../store/suggestionsSlice';
import PromptBuddyLoading from './PromptBuddyLoading';

import './styles.css';

const PromptBuddyPopover = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading);
  const originalPrompt = useSelector((state: RootState) => state.ui.originalPrompt);
  const isPopoverOpen = useSelector((state: RootState) => state.ui.isPopoverOpen);

  useEffect(() => {
    if (originalPrompt && isPopoverOpen) {
      dispatch(fetchSuggestions(originalPrompt));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopoverOpen]);

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
            <PromptBuddyContent />
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
