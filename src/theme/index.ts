import { red, yellow } from '@ant-design/colors';
import { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';

const commonToken = {
  borderRadius: 6,
  colorPrimary: '#297305',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError  : '#ff4d4f',
  colorInfo   : '#1677ff',
  fontFamily  : 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
};

export const lightTheme: ThemeConfig = {
  token: {
    ...commonToken,
    colorBgContainer    : '#ffffff',
    colorBgElevated     : '#f0f0f0',
    colorText           : '#4E4E4E',
    colorTextSecondary  : '#666666',
    colorTextPlaceholder: '#999999',
    colorErrorBg        : red[0],
    colorWarningBg      : yellow[0],
    colorError          : red[5],
    colorWarning        : yellow[5]
  },
  components: {
    Card: {
      colorBgContainer: '#ffffff',
      padding         : 12,
      headerPadding   : 12,
      headerHeight    : 34
    },
    Button: {
      borderRadius            : 0,
      colorBgContainerDisabled: '#f5f5f5',
      colorTextDisabled       : '#00000040'
    },
    Input: {
      borderRadius : 4,
      paddingBlock : 8,
      paddingInline: 12
    },
    Tag  : { borderRadius: 4 },
    Alert: {
      colorText       : '#000000d9',
      colorTextHeading: '#000000d9',
      colorIcon       : 'inherit'
    }
  }
};

export const darkTheme: ThemeConfig = {
  token: {
    ...commonToken,
    colorBgContainer    : '#1f1f1f',
    colorBgElevated     : '#2f2f2f',
    colorText           : '#e0e0e0',
    colorTextSecondary  : '#a0a0a0',
    colorTextPlaceholder: '#999999',
    colorErrorBg        : red[7],
    colorWarningBg      : yellow[7],
    colorError          : red[4],
    colorWarning        : yellow[4]
  },
  components: {
    Card: {
      colorBgContainer: '#1f1f1f',
      padding         : 12,
      headerPadding   : 12,
      headerHeight    : 34
    },
    Button: {
      borderRadius            : 0,
      colorBgContainerDisabled: '#2f2f2f',
      colorTextDisabled       : '#ffffff40'
    },
    Input: {
      borderRadius : 4,
      paddingBlock : 8,
      paddingInline: 12
    },
    Tag  : { borderRadius: 4 },
    Alert: {
      colorText       : '#ffffffd9',
      colorTextHeading: '#ffffffd9',
      colorIcon       : 'inherit'
    }
  }
};
