import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PageColors {
  EXPENSES: string;
  SAVING: string;
}

export const DEFAULT_PAGE_COLORS: PageColors = {
  EXPENSES: '#6C5CE7', // Electric Violet
  SAVING: '#00E676',   // Emerald Green
};

export const COLOR_PALETTE_OPTIONS = [
  { name: 'Violet', hex: '#6C5CE7' },
  { name: 'Emerald', hex: '#00E676' },
  { name: 'Cyan', hex: '#00CEC9' },
  { name: 'Orange', hex: '#FF7675' },
  { name: 'Pink', hex: '#FD79A8' },
  { name: 'Indigo', hex: '#4834D4' },
  { name: 'Gold', hex: '#FDCB6E' },
];

export const PRESET_COLOR_PALETTE = [
  '#6C5CE7', '#00E676', '#00CEC9', '#FF7675', '#FD79A8',
  '#FDCB6E', '#74B9FF', '#A29BFE', '#E17055', '#00B894'
];

export const getPresetColor = (index: number): string => {
  return PRESET_COLOR_PALETTE[index % PRESET_COLOR_PALETTE.length];
};

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return `rgba(108, 92, 231, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  pageColors: PageColors;
  setPageColor: (pageKey: keyof PageColors, colorHex: string) => void;
  resetDefaultColors: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [pageColors, setPageColors] = useState<PageColors>(() => {
    const saved = localStorage.getItem('page_theme_colors');
    if (!saved) return DEFAULT_PAGE_COLORS;
    try {
      return { ...DEFAULT_PAGE_COLORS, ...JSON.parse(saved) };
    } catch (e) {
      return DEFAULT_PAGE_COLORS;
    }
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const setPageColor = (pageKey: keyof PageColors, colorHex: string) => {
    setPageColors(prev => {
      const updated = { ...prev, [pageKey]: colorHex };
      localStorage.setItem('page_theme_colors', JSON.stringify(updated));
      return updated;
    });
  };

  const resetDefaultColors = () => {
    setPageColors(DEFAULT_PAGE_COLORS);
    localStorage.setItem('page_theme_colors', JSON.stringify(DEFAULT_PAGE_COLORS));
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, pageColors, setPageColor, resetDefaultColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
