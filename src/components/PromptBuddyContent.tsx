import { Card, Button, Space, Tooltip, Input, Collapse, Tag, ConfigProvider, Splitter, Flex, Checkbox } from 'antd';
import { SettingOutlined, CloseOutlined, SyncOutlined, ArrowRightOutlined } from '@ant-design/icons';
import RobotSVG from './RobotSVG';
import { ECurrentTone, ESuggestionCategory, RootState } from '../store/types';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { setIsStale, setRewrittenPrompt, setSelectedSuggestions } from '../store/uiSlice';
import { fetchSuggestions } from '../store/suggestionsSlice';

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
  [ECurrentTone.academic]    : 'volcano'
};

const PromptBuddyContent = ({ setIsPopoverOpen, originalPrompt }: {
  setIsPopoverOpen: (isOpen: boolean) => void;
  originalPrompt: string;
}) => {
  const dispatch = useDispatch();

  const isStale = useSelector((state: RootState) => state.ui.isStale);

  const data = useSelector((state: RootState) => state.suggestions);
  const rewrittenPrompt = useSelector((state: RootState) => state.ui.rewrittenPrompt);
  const firstRewrite = useSelector((state: RootState) => state.ui.firstRewrite);

  const { suggestions, summary, current_tone } = data;

  const buildCollapseItems = useCallback(() => Object.entries(suggestions).map(([category, items]) => ({
    key     : category,
    label   : category.charAt(0).toUpperCase() + category.slice(1),
    children: items.map((suggestion: string, index: number) => (
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
            onClick={() => setIsPopoverOpen(false)}
          />
        </Space>
      }
    >
      <Splitter style={{
        display      : 'flex',
        flexDirection: 'row'
      }}
      >

        {/* LEFT PANEL: AI Summary & Suggestions */}

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

            {/* Suggestions (Accordion) */}

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

        {/* RIGHT PANEL: Prompt & Actions */}
        <Splitter.Panel style={{
          paddingLeft  : '10px',
          gap          : '10px',
          display      : 'flex',
          flexDirection: 'column'
        }}
        >
          {/* Original Prompt (Read-only) */}
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

          {/* Tone Information */}
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

          {/* Rewrite Prompt (Editable) */}
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
              value={rewrittenPrompt || firstRewrite}
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

          {/* Actions */}
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
                  onClick={() => dispatch(fetchSuggestions(originalPrompt))}
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
                    // send to input box
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
