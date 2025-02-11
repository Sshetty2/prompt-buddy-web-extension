/* eslint-disable max-len */
import { ConfigProvider, Popover } from 'antd';
import PromptBuddyContent from './PromptBuddyContent';
import PromptBuddyIcon from './PromptBuddyIcon';
import { withReduxStore } from './withReduxStore';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../store/types';
import { fetchSuggestions } from '../store/suggestionsSlice';
import PromptBuddyLoading from './PromptBuddyLoading';
import './styles.css';

const PromptBuddyPopover = ({ isPopoverOpen, setIsPopoverOpen }: {
  isPopoverOpen: boolean,
  setIsPopoverOpen: (isOpen: boolean) => void,
}) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading);

  useEffect(() => {
    dispatch(fetchSuggestions('Tell me if a blow dryer a good birthday gift?'));
  }, [dispatch]);

  const originalPrompt = 'Tell me if a blow dryer a good birthday gift?';

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
            <PromptBuddyContent
              originalPrompt={originalPrompt}
              setIsPopoverOpen={setIsPopoverOpen}
            />
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
        <PromptBuddyIcon
          isPopoverOpen={isPopoverOpen}
          setIsPopoverOpen={setIsPopoverOpen}
        />
      </Popover>

    </ConfigProvider>
  );
};

const PromptBuddyPopoverWithRedux = withReduxStore(PromptBuddyPopover);

export default PromptBuddyPopoverWithRedux;
