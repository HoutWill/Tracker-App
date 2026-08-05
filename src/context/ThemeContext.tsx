import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeTokens, NOTION_DARK_THEME, NOTION_LIGHT_THEME } from '../constants/theme';
import { StorageService } from '../services/storageService';

interface ThemeContextType {
  theme: ThemeTokens;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: NOTION_DARK_THEME,
  isDark: true,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    StorageService.getTheme().then(storedTheme => {
      setThemeModeState(storedTheme);
    });
  }, []);

  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeModeState(nextMode);
    StorageService.saveTheme(nextMode);
  };

  const setThemeMode = (mode: 'dark' | 'light') => {
    setThemeModeState(mode);
    StorageService.saveTheme(mode);
  };

  const currentTheme = themeMode === 'dark' ? NOTION_DARK_THEME : NOTION_LIGHT_THEME;

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDark: themeMode === 'dark',
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
