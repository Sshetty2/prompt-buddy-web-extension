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
  Alert,
  theme as antdTheme
} from 'antd';
import { blue, green, yellow, red } from '@ant-design/colors';

import {

  // SettingOutlined,
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
import { useTheme } from '../theme/ThemeContext';

const { TextArea } = Input;
const { useToken } = antdTheme;

const TONE_COLORS: Record<ECurrentTone, string> = {
  [ECurrentTone.formal]      : 'magenta',
  [ECurrentTone.informal]    : 'cyan',
  [ECurrentTone.technical]   : 'purple',
  [ECurrentTone.casual]      : 'blue',
  [ECurrentTone.inquisitive] : 'gold',
  [ECurrentTone.confused]    : 'orange',
  [ECurrentTone.aggressive]  : 'red',
  [ECurrentTone.informative] : 'green',
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

const getIconColor = (isDisabled: boolean, theme: 'light' | 'dark', colors: string[]) => {
  if (isDisabled) {
    return theme === 'dark' ? '#ffffff40' : '#00000040';
  }

  return theme === 'dark' ? colors[2] : colors[6];
};

const PromptBuddyContent: FC<PromptBuddyContentProps> = ({ writeTextToInput }) => {
  const dispatch = useAppDispatch();
  const { token } = useToken();

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
  const { theme, toggleTheme } = useTheme();

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
        width     : 580,
        padding   : '8px',
        gap       : '12px',
        border    : isStale ? '2px solid orange' : '1px solid green',
        background: token.colorBgContainer
      }}
      title="Prompt Buddy"
      extra={
        <Space>
          <Tooltip title="Settings">
            <div>
              <Button
                type="text"

                size="small"
                onClick={toggleTheme}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
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
          style={{
            marginBottom: '8px',
            background  : token.colorErrorBg || red[1],
            border      : `1px solid ${red[3]}`
          }}
        />
      )}

      {!originalPrompt ? (
        <Alert
          message="No prompt provided. Please enter a prompt to get started."
          banner
          closable
          type="warning"
          style={{
            marginBottom: '8px',
            background  : token.colorWarningBg || yellow[1],
            border      : `1px solid ${yellow[3]}`
          }}
        />
      ) : <Splitter style={{
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
              theme={{
                components: {
                  Card: {
                    bodyPadding     : 12,
                    colorBgContainer: token.colorBgElevated
                  }
                }
              }}
            >
              <Card
                style={{ color: token.colorText }}
                title={
                  <Flex
                    gap="8px"
                    align="center"
                    style={{ color: token.colorText }}
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
                components: {
                  Collapse: {
                    headerPadding   : '10px 10px',
                    colorBgContainer: token.colorBgElevated,
                    colorText       : token.colorText
                  }
                }
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
            <strong style={{ color: token.colorText }}>📜 Original Prompt:</strong>
            <Card
              style={{
                background: token.colorBgElevated,
                color     : token.colorText,
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
            <strong style={{ color: token.colorText }}>🎭 Current Tone:</strong>
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
            <strong style={{ color: token.colorText }}>✏️ Suggested Rewrite:</strong>
            <TextArea
              rows={2}
              autoSize={true}
              value={currentRewrite}
              style={{
                flexGrow  : 'inherit',
                minHeight : '100px',
                maxHeight : '300px',
                background: token.colorBgElevated,
                color     : token.colorText
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
            <Tooltip title="Regenerate suggestions">
              <div>
                <Button
                  type="default"
                  style={{
                    color       : theme === 'dark' ? blue[0] : blue[6],
                    background  : theme === 'dark' ? blue[7] : blue[1],
                    borderColor : theme === 'dark' ? blue[7] : blue[4],
                    borderRadius: 0
                  }}
                  icon={<SyncOutlined style={{ color: getIconColor(!isStale, theme, blue) }}/>}
                  onClick={() => dispatch(regenerateSuggestions())}
                  disabled={!isStale}
                />
              </div>
            </Tooltip>
            <Tooltip title="Apply Rewrite">
              <div>
                <Button
                  type="primary"
                  style={{
                    color       : theme === 'dark' ? green[0] : green[6],
                    background  : theme === 'dark' ? green[7] : green[1],
                    borderColor : theme === 'dark' ? green[7] : green[4],
                    borderRadius: 0
                  }}
                  icon={<ArrowRightOutlined style={{ color: getIconColor(!currentRewrite, theme, green) }}/>}
                  onClick={writeTextToInput}
                  disabled={!currentRewrite}
                />
              </div>
            </Tooltip>
          </div>
        </Splitter.Panel>
      </Splitter>}
    </Card>
  );
};

export default PromptBuddyContent;
