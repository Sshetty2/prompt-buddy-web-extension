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
  }, []);

  const originalPrompt = 'Tell me if a blow dryer a good birthday gift?';

  const data = {
    suggestions: {
      clarity: [
        'Rephrase to specify who the recipient is (e.g., friend, family member) to assess if a blow dryer is suitable.',
        'Consider mentioning the recipient\'s interests or preferences.'
      ],
      specificity: [
        'Ask for opinions on specific types of blow dryers (e.g., professional, travel size) or brands.'
      ],
      context: [
        'Provide context about the recipient\'s hair type or styling habits to better evaluate the gift choice.'
      ],
      format: [
        'Use a question format that invites detailed responses, such as \'What are the pros and cons of giving a blow dryer as a birthday gift?\'].'
      ]
    },
    tone: {
      current: [
        'casual',
        'friendly'
      ],
      suggestions: [
        'You could make it a bit more playful or inquisitive to spark more engaging responses.'
      ]
    },
    summary: 'A blow dryer for a birthday gift? That’s a hot take! But let’s dig deeper—who’s the lucky recipient, and do they even dry their hair? 🤔',
    rewrite: 'Is a blow dryer a good birthday gift for someone who loves styling their hair?'
  };

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
              data={data}
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
