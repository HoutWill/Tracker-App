import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  bgMain: string;
  bgCard: string;
  bgCardHover: string;
  bgMainLight: string;
  bgCardLight: string;
  bgCardHoverLight: string;
  accent: string;
  border: string;
}

export type HolidayTheme = AppTheme;

export const APP_THEMES: AppTheme[] = [
  {
    id: 'DEFAULT',
    name: 'Midnight',
    description: 'Navy',
    bgMain: '#0B131E',
    bgCard: '#151D2A',
    bgCardHover: '#1E293B',
    bgMainLight: '#F8FAFC',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#F1F5F9',
    accent: '#4A99E9',
    border: 'rgba(74, 153, 233, 0.2)',
  },
  {
    id: 'ONYX',
    name: 'Onyx',
    description: 'Pitch',
    bgMain: '#000000',
    bgCard: '#141416',
    bgCardHover: '#1E1E22',
    bgMainLight: '#F2F2F7',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#E5E5EA',
    accent: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.15)',
  },
  {
    id: 'CHARCOAL',
    name: 'Charcoal',
    description: 'Titanium',
    bgMain: '#121214',
    bgCard: '#1C1C20',
    bgCardHover: '#26262C',
    bgMainLight: '#F4F4F6',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#E9E9EB',
    accent: '#6C7B8A',
    border: 'rgba(108, 123, 138, 0.25)',
  },
  {
    id: 'EMERALD',
    name: 'Emerald',
    description: 'Forest',
    bgMain: '#081410',
    bgCard: '#10221B',
    bgCardHover: '#183027',
    bgMainLight: '#F0FDF4',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#DCFCE7',
    accent: '#30D158',
    border: 'rgba(48, 209, 88, 0.2)',
  },
  {
    id: 'AMETHYST',
    name: 'Amethyst',
    description: 'Lavender',
    bgMain: '#100B1A',
    bgCard: '#1C142C',
    bgCardHover: '#281D3E',
    bgMainLight: '#FAF5FF',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#F3E8FF',
    accent: '#8B5CF6',
    border: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'ESPRESSO',
    name: 'Espresso',
    description: 'Mocha',
    bgMain: '#140D0A',
    bgCard: '#221712',
    bgCardHover: '#2E2019',
    bgMainLight: '#FFFBEB',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#FEF3C7',
    accent: '#F3A85B',
    border: 'rgba(243, 168, 91, 0.25)',
  },
  {
    id: 'CRIMSON',
    name: 'Crimson',
    description: 'Ruby',
    bgMain: '#180A0E',
    bgCard: '#271117',
    bgCardHover: '#351820',
    bgMainLight: '#FFF1F2',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#FFE4E6',
    accent: '#ED6C6C',
    border: 'rgba(237, 108, 108, 0.25)',
  },
];

export const HOLIDAY_THEMES = APP_THEMES;

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
    id: 'SKY',
    name: 'Sky',
    description: 'Soft',
    accent: '#4A99E9',
    expensesColor: '#4A99E9',
    savingColor: '#30D158',
  },
  {
    id: 'CORAL',
    name: 'Coral',
    description: 'Warm',
    accent: '#ED6C6C',
    expensesColor: '#ED6C6C',
    savingColor: '#30D158',
  },
  {
    id: 'PEACH',
    name: 'Peach',
    description: 'Gold',
    accent: '#F3A85B',
    expensesColor: '#F3A85B',
    savingColor: '#4A99E9',
  },
  {
    id: 'ROSE',
    name: 'Rose',
    description: 'Pink',
    accent: '#EC668C',
    expensesColor: '#EC668C',
    savingColor: '#30D158',
  },
  {
    id: 'MINT',
    name: 'Mint',
    description: 'Green',
    accent: '#30D158',
    expensesColor: '#30D158',
    savingColor: '#4A99E9',
  },
  {
    id: 'STEEL',
    name: 'Steel',
    description: 'Charcoal',
    accent: '#6C7B8A',
    expensesColor: '#6C7B8A',
    savingColor: '#30D158',
  },
  {
    id: 'MINIMAL_WHITE',
    name: 'White',
    description: 'Clean',
    accent: '#FFFFFF',
    expensesColor: '#FFFFFF',
    savingColor: '#E2E8F0',
  },
];

export interface PageColors {
  EXPENSES: string;
  SAVING: string;
}

export const DEFAULT_PAGE_COLORS: PageColors = {
  EXPENSES: '#4A99E9',
  SAVING: '#30D158',
};

export const COLOR_PALETTE_OPTIONS = [
  { name: 'Sky', hex: '#4A99E9' },
  { name: 'Coral', hex: '#ED6C6C' },
  { name: 'Peach', hex: '#F3A85B' },
  { name: 'Rose', hex: '#EC668C' },
  { name: 'Mint', hex: '#30D158' },
  { name: 'Steel', hex: '#6C7B8A' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'White', hex: '#FFFFFF' },
];

export const DEFAULT_PRESET_PALETTE = [
  '#4A99E9', '#ED6C6C', '#F3A85B',
  '#EC668C', '#30D158', '#8B5CF6',
  '#6C7B8A', '#38BDF8', '#FFFFFF'
];

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return `rgba(74, 153, 233, ${alpha})`;
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

export const generateRandomVibrantHex = (): string => {
  const mutedPastelPalette = [
    '#4A99E9', '#ED6C6C', '#F3A85B', '#EC668C',
    '#6C7B8A', '#8B5CF6', '#30D158', '#FBBF24',
    '#38BDF8', '#F472B6', '#A7F3D0', '#FFFFFF'
  ];
  return mutedPastelPalette[Math.floor(Math.random() * mutedPastelPalette.length)];
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  activeThemeId: string;
  themes: AppTheme[];
  setTheme: (themeId: string) => void;
  setHolidayTheme: (themeId: string) => void;
  activePackId: string;
  colorPacks: ColorPack[];
  setColorPack: (packId: string) => void;
  pageColors: PageColors;
  setPageColor: (pageKey: keyof PageColors, colorHex: string) => void;
  presetPalette: string[];
  setPresetColorItem: (index: number, colorHex: string) => void;
  randomizePresetPalette: () => void;
  resetPresetPaletteToDefault: () => void;
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
    return localStorage.getItem('theme_pack_id') || 'SKY';
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

  const [presetPalette, setPresetPalette] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_preset_palette');
    if (!saved) return DEFAULT_PRESET_PALETTE;
    try {
      const parsed: string[] = JSON.parse(saved);
      return parsed.map((c, i) => (!c ? DEFAULT_PRESET_PALETTE[i % DEFAULT_PRESET_PALETTE.length] : c));
    } catch (e) {
      return DEFAULT_PRESET_PALETTE;
    }
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.documentElement.classList.add('light-theme');
    }

    const root = document.documentElement;
    const theme = APP_THEMES.find(t => t.id === activeThemeId) || APP_THEMES[0];
    const pack = COLOR_PACKS.find(p => p.id === activePackId) || COLOR_PACKS[0];

    const bgToUse = isDark ? theme.bgMain : theme.bgMainLight;
    const cardToUse = isDark ? theme.bgCard : theme.bgCardLight;
    const cardHoverToUse = isDark ? theme.bgCardHover : theme.bgCardHoverLight;

    document.body.style.backgroundColor = bgToUse;
    document.documentElement.style.backgroundColor = bgToUse;

    root.style.setProperty('--bg-main', bgToUse);
    root.style.setProperty('--bg-card', cardToUse);
    root.style.setProperty('--bg-card-hover', cardHoverToUse);
    root.style.setProperty('--border-theme', theme.border);

    if (isDark) {
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#EBEBF5');
      root.style.setProperty('--text-muted', '#8E8E93');
      root.style.setProperty('--border-glass', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--pill-bg', 'rgba(255, 255, 255, 0.06)');
      root.style.setProperty('--pill-hover', 'rgba(255, 255, 255, 0.12)');
    } else {
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#3C3C43');
      root.style.setProperty('--text-muted', '#6C6C70');
      root.style.setProperty('--border-glass', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--pill-bg', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--pill-hover', 'rgba(0, 0, 0, 0.08)');
    }

    root.style.setProperty('--accent', pack.accent);
    root.style.setProperty('--accent-expenses', pageColors.EXPENSES || pack.expensesColor);
    root.style.setProperty('--accent-saving', pageColors.SAVING || pack.savingColor);
  }, [isDark, activeThemeId, activePackId, pageColors]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const setTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    localStorage.setItem('active_theme_id', themeId);
    const theme = APP_THEMES.find(t => t.id === themeId);
    if (theme) {
      setPageColor('EXPENSES', theme.accent);
    }
  };

  const setHolidayTheme = setTheme;

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

  const setPresetColorItem = (index: number, colorHex: string) => {
    setPresetPalette(prev => {
      const updated = [...prev];
      updated[index % updated.length] = colorHex;
      localStorage.setItem('custom_preset_palette', JSON.stringify(updated));
      return updated;
    });
  };

  const randomizePresetPalette = () => {
    const randomColors = DEFAULT_PRESET_PALETTE.map(() => generateRandomVibrantHex());
    setPresetPalette(randomColors);
    localStorage.setItem('custom_preset_palette', JSON.stringify(randomColors));
  };

  const resetPresetPaletteToDefault = () => {
    setPresetPalette(DEFAULT_PRESET_PALETTE);
    localStorage.removeItem('custom_preset_palette');
  };

  const resetDefaultColors = () => {
    setTheme('DEFAULT');
    setColorPack('SKY');
    setPresetPalette(DEFAULT_PRESET_PALETTE);
    localStorage.removeItem('custom_preset_palette');
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      activeThemeId,
      themes: APP_THEMES,
      setTheme,
      setHolidayTheme,
      activePackId,
      colorPacks: COLOR_PACKS,
      setColorPack,
      pageColors,
      setPageColor,
      presetPalette,
      setPresetColorItem,
      randomizePresetPalette,
      resetPresetPaletteToDefault,
      resetDefaultColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
