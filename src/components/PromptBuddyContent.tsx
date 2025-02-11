import { Card, Button, Space, Tooltip, Input, Collapse, Tag, ConfigProvider, Splitter, Flex, Checkbox } from 'antd';
import { SettingOutlined, CloseOutlined, SyncOutlined, ArrowRightOutlined } from '@ant-design/icons';
import RobotSVG from './RobotSVG';

const { TextArea } = Input;
const { Panel } = Collapse;

const TONE_COLORS = {
  formal      : 'magenta',
  informal    : 'cyan',
  technical   : 'purple',
  casual      : 'blue',
  confused    : 'orange',
  aggressive  : 'red',
  friendly    : 'green',
  professional: 'geekblue',
  academic    : 'volcano'
} as const;

const PromptBuddyContent = ({
  setIsPopoverOpen,
  isStale,
  setIsStale,
  originalPrompt,
  setOriginalPrompt,
  rewrittenPrompt,
  setRewrittenPrompt,
  data,
  onRegenerate,
  onApply
}: {
  setIsPopoverOpen: (isOpen: boolean) => void;
  isStale: boolean;
  setIsStale: (stale: boolean) => void;
  originalPrompt: string;
  setOriginalPrompt: (prompt: string) => void;
  rewrittenPrompt: string;
  setRewrittenPrompt: (prompt: string) => void;
  data: any;
  onRegenerate: () => void;
  onApply: () => void;
}) => {
  if (!data) {
    return null;
  }

  const buildCollapseItems = (suggestions: any) => Object.entries(suggestions).map(([category, items]) => ({
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
            top         : '5px',
            position    : 'relative'
          }}
          onChange={() => setIsStale(true)}
        /> {/* Mark as stale if modified */}
      </ul>
    ))
  }));

  const { suggestions, tone, summary, rewrite } = data;

  return (
    <Card
      size="small"
      style={{
        width  : 580,
        padding: '8px',
        gap    : '12px',
        border : isStale ? '2px solid orange' : '1px solid #ddd'
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
                items={buildCollapseItems(suggestions)}
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
              {tone.current.map(tag => (
                <Tag
                  style={{ marginInlineEnd: '6px' }}
                  key={tag}
                  color={TONE_COLORS[tag]}
                >
                  {tag}
                </Tag>
              ))}
            </Flex>
            {/* <small>💡 {suggestions[0]}</small> */}
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
              value={rewrite}
              style={{
                flexGrow : 'inherit',
                minHeight: '100px',
                maxHeight: '300px'
              }}
              onChange={e => {
                setRewrittenPrompt(e.target.value);
                setIsStale(true); // Mark as stale if modified
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
                  onClick={onRegenerate}
                  disabled={!isStale}
                />
              </div>
            </Tooltip>
            <Tooltip title="Apply Rewrite">
              <div>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={onApply}
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
