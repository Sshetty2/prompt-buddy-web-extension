import React, { createContext, useContext, useState } from 'react';
import { ConfigProvider } from 'antd';
import { ThemeMode, lightTheme, darkTheme } from './index';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme      : 'light',
  toggleTheme: () => undefined
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  //   useEffect(() => {
  //     document.documentElement.setAttribute('data-theme', theme);
  //   }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    console.log('setting theme to', theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme
      }}
    >
      <ConfigProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
