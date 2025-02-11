import { Spin, Flex } from 'antd';

const PromptBuddyLoading = () => (
  <Flex
    vertical
    align="center"
    justify="center"
    style={{
      width       : 600,
      padding     : '40px 20px',
      background  : '#fff',
      borderRadius: '8px',
      opacity     : 1,
      transition  : 'opacity 0.2s ease-in-out',
      animation   : 'fade-in 0.2s ease-in-out'
    }}
  >
    <Spin size="large" />
    <div style={{
      marginTop: '20px',
      color    : '#666',
      textAlign: 'center'
    }}
    >
      <p>Analyzing your prompt...</p>
      <p style={{ fontSize: '14px' }}>Generating helpful suggestions to make it even better!</p>
    </div>
  </Flex>
);

export default PromptBuddyLoading;
