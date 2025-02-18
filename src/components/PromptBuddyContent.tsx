import { useCallback, FC } from 'react';
import {
  Card,
  Button,
  Space,
  Tooltip,
  Input,
  Collapse,
  Tag,
  ConfigProvider,
  Splitter,
  Flex,
  Checkbox,
  Alert
} from 'antd';
import {
  SettingOutlined,
  CloseOutlined,
  SyncOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { ECurrentTone, ESuggestionCategory } from '../store/types';
import {
  setIsPopoverOpen,
  setRewrittenPrompt,
  setSelectedSuggestions
} from '../store/uiSlice';
import { regenerateSuggestions } from '../store/suggestionsSlice';
import {
  useAppDispatch,
  useAppSelector,
  useSuggestionState
} from '../store/hooks';
import RobotSVG from './RobotSVG';

const { TextArea } = Input;

const TONE_COLORS: Record<ECurrentTone, string> = {
  [ECurrentTone.formal]      : 'magenta',
  [ECurrentTone.informal]    : 'cyan',
  [ECurrentTone.technical]   : 'purple',
  [ECurrentTone.casual]      : 'blue',
  [ECurrentTone.inquisitive] : 'gold',
  [ECurrentTone.confused]    : 'orange',
  [ECurrentTone.aggressive]  : 'red',
  [ECurrentTone.friendly]    : 'green',
  [ECurrentTone.professional]: 'geekblue',
  [ECurrentTone.academic]    : 'volcano',
  [ECurrentTone.curious]     : 'gold'
};

interface SuggestionItemProps {
  suggestion: string;
  index: number;
  category: ESuggestionCategory;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

const SuggestionItemComponent: FC<SuggestionItemProps> = ({
  suggestion,
  index,

  // category,
  isSelected,
  onSelect
}) => (
  <ul
    key={index}
    style={{
      display           : 'flex',
      alignItems        : 'center',
      gap               : '8px',
      paddingInlineStart: '16px'
    }}
  >
    <li>{suggestion}</li>
    <Checkbox
      style={{
        marginBottom: 'auto',
        marginLeft  : 'auto',
        top         : '5px',
        position    : 'relative'
      }}
      checked={isSelected}
      onChange={e => onSelect(e.target.checked)}
    />
  </ul>
);

interface PromptBuddyContentProps {
  writeTextToInput: () => void;
}

const PromptBuddyContent: FC<PromptBuddyContentProps> = ({ writeTextToInput }) => {
  const dispatch = useAppDispatch();

  // Use UI state
  const {
    isStale,
    rewrittenPrompt,
    firstRewrite,
    error: uiError,
    originalPrompt
  } = useAppSelector(state => state.ui);

  // Use suggestion state
  const { categories, analysis, status } = useSuggestionState();
  const suggestionsSelected = useAppSelector(state => state.ui.suggestionsSelected);

  const handleSuggestionSelect = useCallback(
    (category: ESuggestionCategory, index: number, value: boolean) => {
      dispatch(
        setSelectedSuggestions({
          category,
          suggestionIdx: index,
          value
        })
      );
    },
    [dispatch]
  );

  const buildCollapseItems = useCallback(() => {
    type CollapseItem = {
      key: string;
      label: string;
      children: JSX.Element[];
    };

    const isValidItem = (item: CollapseItem | null): item is CollapseItem => item !== null;

    const buildCollapseItem = (
      [category, data]: [string, typeof categories[ESuggestionCategory]]
    ): CollapseItem | null => {
      const { available } = data;

      if (!available?.length) {
        return null;
      }

      const categoryType = category as ESuggestionCategory;
      const label = category.charAt(0).toUpperCase() + category.slice(1);

      const renderSuggestion = (suggestion: string, index: number) => {
        const isSelected = suggestionsSelected[categoryType].includes(suggestion);

        const handleSelect = (checked: boolean) => {
          handleSuggestionSelect(categoryType, index, checked);
        };

        return (
          <SuggestionItemComponent
            key={`${category}-${index}`}
            suggestion={suggestion}
            index={index}
            category={categoryType}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        );
      };

      return {
        key     : category,
        label,
        children: available.map(renderSuggestion)
      };
    };

    return Object.entries(categories)
      .map(buildCollapseItem)
      .filter(isValidItem);
  }, [categories, handleSuggestionSelect, suggestionsSelected]);

  // Don't render if no data or platform config
  if (!categories) {
    return null;
  }

  const currentError = uiError || status.error;

  // Use the rewritten prompt if available, otherwise fall back to first rewrite
  const currentRewrite = rewrittenPrompt ?? firstRewrite;

  return (
    <Card
      size="small"
      style={{
        width  : 580,
        padding: '8px',
        gap    : '12px',
        border : isStale ? '2px solid orange' : '1px solid green'
      }}
      title="Prompt Buddy"
      extra={
        <Space>
          <Tooltip title="Settings">
            <div>
              <Button
                type="text"
                icon={<SettingOutlined />}
                size="small"
              />
            </div>
          </Tooltip>
          <Button
            type="text"
            icon={<CloseOutlined />}
            size="small"
            onClick={() => dispatch(setIsPopoverOpen(false))}
          />
        </Space>
      }
    >
      {currentError && (
        <Alert
          message={currentError}
          banner
          closable
          type="error"
          style={{ marginBottom: '8px' }}
        />
      )}

      {!originalPrompt && (
        <Alert
          message="No prompt provided. Please enter a prompt to get started."
          banner
          closable
          type="warning"
          style={{ marginBottom: '8px' }}
        />
      )}

      <Splitter style={{
        display      : 'flex',
        flexDirection: 'row'
      }}
      >
        {/* Left Panel */}
        <Splitter.Panel
          defaultSize="50%"
          min="30%"
          max="70%"
          style={{ paddingRight: '10px' }}
        >
          <Flex
            vertical
            gap="12px"
          >
            <ConfigProvider
              theme={{ components: { Card: { bodyPadding: 12 } } }}
            >
              <Card
                style={{
                  background: '#f0f0f0',
                  color     : '#4E4E4E'
                }}
                title={
                  <Flex
                    gap="8px"
                    align="center"
                  >
                    <RobotSVG />
                    <strong>{import.meta.env.VITE_AI_NAME.toUpperCase()}</strong>
                  </Flex>
                }
              >
                {analysis.summary}
              </Card>
            </ConfigProvider>
            <ConfigProvider
              theme={{
                token     : { borderRadiusLG: 4 },
                components: { Collapse: { headerPadding: '10px 10px' } }
              }}
            >
              <Collapse
                accordion
                items={buildCollapseItems()}
              />
            </ConfigProvider>
          </Flex>
        </Splitter.Panel>

        {/* Right Panel */}
        <Splitter.Panel
          style={{
            paddingLeft  : '10px',
            gap          : '10px',
            display      : 'flex',
            flexDirection: 'column'
          }}
        >
          <Flex
            vertical
            gap="8px"
          >
            <strong>📜 Original Prompt:</strong>
            <Card
              style={{
                background: '#f0f0f0',
                color     : '#4E4E4E',
                maxHeight : '200px',
                overflow  : 'auto'
              }}
            >
              {originalPrompt}
            </Card>
          </Flex>
          <Flex
            vertical
            gap="8px"
          >
            <strong>🎭 Current Tone:</strong>
            <Flex
              gap="8px 0"
              wrap
            >
              {analysis.tones.map((tag: ECurrentTone) => (
                <Tag
                  style={{ marginInlineEnd: '6px' }}
                  key={tag}
                  color={TONE_COLORS[tag]}
                >
                  {tag}
                </Tag>
              ))}
            </Flex>
          </Flex>
          <div
            style={{
              display      : 'flex',
              flexDirection: 'column',
              gap          : '8px',
              marginBottom : 'auto',
              flexGrow     : 1
            }}
          >
            <strong>✏️ Suggested Rewrite:</strong>
            <TextArea
              rows={2}
              autoSize={true}
              value={currentRewrite}
              style={{
                flexGrow : 'inherit',
                minHeight: '100px',
                maxHeight: '300px'
              }}
              onChange={e => {
                dispatch(setRewrittenPrompt(e.target.value));
              }}
            />
          </div>
          <div style={{
            display       : 'flex',
            justifyContent: 'space-between'
          }}
          >
            <Tooltip title={
              'Regenerate suggestions'
            }
            >
              <div>
                <Button
                  type="default"
                  icon={<SyncOutlined />}
                  onClick={() => dispatch(regenerateSuggestions())}
                  disabled={!isStale}
                />
              </div>
            </Tooltip>
            <Tooltip title="Apply Rewrite">
              <div>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={writeTextToInput}
                  disabled={!currentRewrite}
                />
              </div>
            </Tooltip>
          </div>
        </Splitter.Panel>
      </Splitter>
    </Card>
  );
};

export default PromptBuddyContent;
