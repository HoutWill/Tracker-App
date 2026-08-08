import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HolidayTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bgMain: string;
  bgCard: string;
  bgCardHover: string;
  bgMainLight: string;
  bgCardLight: string;
  bgCardHoverLight: string;
}

export const HOLIDAY_THEMES: HolidayTheme[] = [
  {
    id: 'DEFAULT',
    name: 'Default',
    emoji: '✨',
    description: 'Liquid Glass Dark',
    bgMain: '#0B131E',
    bgCard: '#151720',
    bgCardHover: '#1C1E2B',
    bgMainLight: '#F8FAFC',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#F1F5F9',
  },
  {
    id: 'CHRISTMAS',
    name: 'Christmas',
    emoji: '❄️',
    description: 'Falling Snow & Pines',
    bgMain: '#0B1A15',
    bgCard: '#142721',
    bgCardHover: '#1A332B',
    bgMainLight: '#EBF7F4',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#DFF0EC',
  },
  {
    id: 'CHINESE',
    name: 'Chinese',
    emoji: '🏮',
    description: 'Spring Lanterns & Gold',
    bgMain: '#1C0B0E',
    bgCard: '#2F1117',
    bgCardHover: '#3C161E',
    bgMainLight: '#FDF2F4',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#FBE4E7',
  },

  {
    id: 'HALLOWEEN',
    name: 'Halloween',
    emoji: '🎃',
    description: 'Spooky Embers & Fog',
    bgMain: '#140A1A',
    bgCard: '#24132F',
    bgCardHover: '#2E193C',
    bgMainLight: '#F5EFF9',
    bgCardLight: '#FFFFFF',
    bgCardHoverLight: '#EDE1F4',
  },
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
    id: 'MINIMAL_WHITE',
    name: 'Clean White',
    description: 'Pure Minimalist White & Platinum',
    accent: '#FFFFFF',
    expensesColor: '#FFFFFF',
    savingColor: '#E2E8F0',
  },
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
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Silver', hex: '#E2E8F0' },
  { name: 'Cyan', hex: '#11B5C6' },
  { name: 'Navy', hex: '#0E4F88' },
  { name: 'Cafe', hex: '#C88A58' },
  { name: 'Robotic', hex: '#00FF9D' },
  { name: 'Violet', hex: '#6C5CE7' },
  { name: 'Emerald', hex: '#00B894' },
  { name: 'Gold', hex: '#FDCB6E' },
  { name: 'Rose', hex: '#FF7675' },
];

export const DEFAULT_PRESET_PALETTE = [
  '#6366F1', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#0EA5E9', '#64748B'
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
    '#6C7B8A', '#8B5CF6', '#34D399', '#FBBF24',
    '#38BDF8', '#F472B6', '#A7F3D0', '#FDE047'
  ];
  return mutedPastelPalette[Math.floor(Math.random() * mutedPastelPalette.length)];
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
    const theme = HOLIDAY_THEMES.find(t => t.id === activeThemeId) || HOLIDAY_THEMES[0];
    const pack = COLOR_PACKS.find(p => p.id === activePackId) || COLOR_PACKS[0];

    const bgToUse = isDark ? theme.bgMain : theme.bgMainLight;
    const cardToUse = isDark ? theme.bgCard : theme.bgCardLight;
    const cardHoverToUse = isDark ? theme.bgCardHover : theme.bgCardHoverLight;

    document.body.style.backgroundColor = bgToUse;
    document.documentElement.style.backgroundColor = bgToUse;

    root.style.setProperty('--bg-main', bgToUse);
    root.style.setProperty('--bg-card', cardToUse);
    root.style.setProperty('--bg-card-hover', cardHoverToUse);

    if (isDark) {
      root.style.setProperty('--text-primary', '#F9FAFB');
      root.style.setProperty('--text-secondary', '#9CA3AF');
      root.style.setProperty('--text-muted', '#6B7280');
      root.style.setProperty('--border-glass', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--pill-bg', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--pill-hover', 'rgba(255, 255, 255, 0.08)');
    } else {
      root.style.setProperty('--text-primary', '#0F172A');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border-glass', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--pill-bg', 'rgba(0, 0, 0, 0.03)');
      root.style.setProperty('--pill-hover', 'rgba(0, 0, 0, 0.06)');
    }

    root.style.setProperty('--accent', pack.accent);
    root.style.setProperty('--accent-expenses', pageColors.EXPENSES || pack.expensesColor);
    root.style.setProperty('--accent-saving', pageColors.SAVING || pack.savingColor);
  }, [isDark, activeThemeId, activePackId, pageColors]);

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
    setHolidayTheme('DEFAULT');
    setColorPack('MODERN');
    setPresetPalette(DEFAULT_PRESET_PALETTE);
    localStorage.removeItem('custom_preset_palette');
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
