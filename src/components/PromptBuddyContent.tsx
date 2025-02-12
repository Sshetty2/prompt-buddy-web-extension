import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { SettingOutlined, CloseOutlined, SyncOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ECurrentTone, ESuggestionCategory, RootState } from '../store/types';
import { setIsPopoverOpen, setRewrittenPrompt, setSelectedSuggestions } from '../store/uiSlice';
import { regenerateSuggestions } from '../store/suggestionsSlice';
import RobotSVG from './RobotSVG';

const { TextArea } = Input;

const TONE_COLORS: Record<ECurrentTone, string> = {
  [ECurrentTone.formal]      : 'magenta',
  [ECurrentTone.informal]    : 'cyan',
  [ECurrentTone.technical]   : 'purple',
  [ECurrentTone.casual]      : 'blue',
  [ECurrentTone.confused]    : 'orange',
  [ECurrentTone.aggressive]  : 'red',
  [ECurrentTone.friendly]    : 'green',
  [ECurrentTone.professional]: 'geekblue',
  [ECurrentTone.academic]    : 'volcano',
  [ECurrentTone.curious]     : 'gold'
};

const PromptBuddyContent = () => {
  const dispatch = useDispatch();

  const isStale = useSelector((state: RootState) => state.ui.isStale);
  const data = useSelector((state: RootState) => state.suggestions);
  const rewrittenPrompt = useSelector((state: RootState) => state.ui.rewrittenPrompt);
  const firstRewrite = useSelector((state: RootState) => state.ui.firstRewrite);
  const error = useSelector((state: RootState) => state.ui.error);
  const originalPrompt = useSelector((state: RootState) => state.ui.originalPrompt);

  const { suggestions, summary, current_tone } = data;

  const buildCollapseItems = useCallback(() => Object.entries(suggestions).map(([category, items]) => ({
    key     : category,
    label   : category.charAt(0).toUpperCase() + category.slice(1),
    children: items?.map((suggestion: string, index: number) => (
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
          onChange={e => dispatch(setSelectedSuggestions({
            category     : category as ESuggestionCategory,
            suggestionIdx: index,
            value        : e.target.checked
          }))}
        />
      </ul>
    ))
  })), [dispatch, suggestions]);

  if (!data) {
    return null;
  }

  // TODO: Split component tree
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
      {error && (
        <Alert
          message={error}
          banner
          closable
          type="error"
          style={{ marginBottom: '8px' }}
        />
      )}

      {originalPrompt === '' && (
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
                  <strong>{import.meta.env.VITE_AI_NAME}</strong>
                </Flex>
              }
            >
              {summary}
            </Card>
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
        <Splitter.Panel style={{
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
            <Card style={{
              background: '#f0f0f0',
              color     : '#4E4E4E',
              maxHeight : '200px',
              overflow  : 'auto'
            }}
            >
              {originalPrompt}
            </Card >
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
              {current_tone.map(tag => (
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
          <div style={{
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
              // eslint-disable-next-line no-eq-null
              value={rewrittenPrompt != null ? rewrittenPrompt : firstRewrite}
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
            <Tooltip title="Regenerate Suggestions">
              <div>
                <Button
                  type="default"
                  icon={<SyncOutlined />}
                  onClick={() => dispatch(regenerateSuggestions())}
                  disabled={isStale}
                />
              </div>
            </Tooltip>
            <Tooltip title="Apply Rewrite">
              <div>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => {
                    // TODO: send to input box
                  }}
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
