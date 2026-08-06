import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HolidayTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bgMain: string;
}

export const HOLIDAY_THEMES: HolidayTheme[] = [
  { id: 'DEFAULT', name: 'Default', emoji: '✨', description: 'Liquid Glass Dark', bgMain: '#0B131E' },
  { id: 'CHRISTMAS', name: 'Christmas', emoji: '❄️', description: 'Falling Snow & Pines', bgMain: '#0E1E19' },
  { id: 'CHINESE', name: 'Chinese', emoji: '🏮', description: 'Spring Lanterns & Gold', bgMain: '#240A0F' },
  { id: 'KHMER', name: 'Khmer', emoji: '🏛️', description: 'Sangkranta Temple Glow', bgMain: '#1D170A' },
  { id: 'HALLOWEEN', name: 'Halloween', emoji: '🎃', description: 'Spooky Embers & Fog', bgMain: '#1A0C22' },
];

export interface ColorPack {
  id: string;
  name: string;
  description: string;
  accent: string;
  expensesColor: string;
  savingColor: string;
}

export const COLOR_PACKS: ColorPack[] = [
  {
    id: 'MODERN',
    name: 'Modern',
    description: 'PiTrack Cyan & Navy',
    accent: '#11B5C6',
    expensesColor: '#11B5C6',
    savingColor: '#0E4F88',
  },
  {
    id: 'CAFE',
    name: 'Cafe',
    description: 'Espresso & Warm Latte',
    accent: '#C88A58',
    expensesColor: '#C88A58',
    savingColor: '#A0522D',
  },
  {
    id: 'ROBOTIC',
    name: 'Robotic',
    description: 'Cyber Matrix Neon Green',
    accent: '#00FF9D',
    expensesColor: '#00FF9D',
    savingColor: '#00E5FF',
  },
  {
    id: 'VIOLET',
    name: 'Violet',
    description: 'Deep Royal Lavender',
    accent: '#6C5CE7',
    expensesColor: '#6C5CE7',
    savingColor: '#00B894',
  },
  {
    id: 'GOLD',
    name: 'Gold',
    description: 'Sunset Gold & Coral Rose',
    accent: '#FDCB6E',
    expensesColor: '#FF7675',
    savingColor: '#FDCB6E',
  },
  {
    id: 'EMERALD',
    name: 'Emerald',
    description: 'Rich Emerald & Mint Jade',
    accent: '#00B894',
    expensesColor: '#00B894',
    savingColor: '#55E6C1',
  },
];

export interface PageColors {
  EXPENSES: string;
  SAVING: string;
}

export const DEFAULT_PAGE_COLORS: PageColors = {
  EXPENSES: '#11B5C6',
  SAVING: '#0E4F88',
};

export const COLOR_PALETTE_OPTIONS = [
  { name: 'Cyan', hex: '#11B5C6' },
  { name: 'Navy', hex: '#0E4F88' },
  { name: 'Cafe', hex: '#C88A58' },
  { name: 'Robotic', hex: '#00FF9D' },
  { name: 'Violet', hex: '#6C5CE7' },
  { name: 'Emerald', hex: '#00B894' },
  { name: 'Gold', hex: '#FDCB6E' },
  { name: 'Orange', hex: '#FF7675' },
];

export const PRESET_COLOR_PALETTE = [
  '#11B5C6', '#0E4F88', '#C88A58', '#00FF9D', '#6C5CE7',
  '#00B894', '#FDCB6E', '#FF7675', '#FD79A8', '#00CEC9'
];

export const getPresetColor = (index: number): string => {
  return PRESET_COLOR_PALETTE[index % PRESET_COLOR_PALETTE.length];
};

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return `rgba(17, 181, 198, ${alpha})`;
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
  activeThemeId: string;
  setHolidayTheme: (themeId: string) => void;
  activePackId: string;
  setColorPack: (packId: string) => void;
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

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('active_theme_id') || 'DEFAULT';
  });

  const [activePackId, setActivePackId] = useState<string>(() => {
    return localStorage.getItem('theme_pack_id') || 'MODERN';
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

  // Update background when activeThemeId changes
  useEffect(() => {
    const theme = HOLIDAY_THEMES.find(t => t.id === activeThemeId) || HOLIDAY_THEMES[0];
    document.documentElement.style.setProperty('--bg-main', theme.bgMain);
  }, [activeThemeId]);

  // Update accent when activePackId changes
  useEffect(() => {
    const pack = COLOR_PACKS.find(p => p.id === activePackId) || COLOR_PACKS[0];
    document.documentElement.style.setProperty('--accent', pack.accent);
  }, [activePackId]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const setHolidayTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    localStorage.setItem('active_theme_id', themeId);
  };

  const setColorPack = (packId: string) => {
    const pack = COLOR_PACKS.find(p => p.id === packId);
    if (!pack) return;
    setActivePackId(packId);
    localStorage.setItem('theme_pack_id', packId);

    const updatedColors: PageColors = {
      EXPENSES: pack.expensesColor,
      SAVING: pack.savingColor,
    };
    setPageColors(updatedColors);
    localStorage.setItem('page_theme_colors', JSON.stringify(updatedColors));
  };

  const setPageColor = (pageKey: keyof PageColors, colorHex: string) => {
    setPageColors(prev => {
      const updated = { ...prev, [pageKey]: colorHex };
      localStorage.setItem('page_theme_colors', JSON.stringify(updated));
      return updated;
    });
  };

  const resetDefaultColors = () => {
    setHolidayTheme('DEFAULT');
    setColorPack('MODERN');
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      activeThemeId,
      setHolidayTheme,
      activePackId,
      setColorPack,
      pageColors,
      setPageColor,
      resetDefaultColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
