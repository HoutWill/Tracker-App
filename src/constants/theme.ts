import { NotionColor } from '../types';

export interface ThemeTokens {
  mode: 'dark' | 'light';
  bgMain: string;
  bgCard: string;
  bgSidebar: string;
  bgHover: string;
  bgInput: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  shadow: string;
  statusBadgeBg: string;
  statusBadgeText: string;
}

export const NOTION_DARK_THEME: ThemeTokens = {
  mode: 'dark',
  bgMain: '#191919',       // Notion Obsidian background
  bgCard: '#202020',       // Block background
  bgSidebar: '#1F1F1F',
  bgHover: '#2A2A2A',
  bgInput: '#252525',
  border: '#2E2E2E',
  borderSubtle: '#262626',
  textPrimary: '#E3E3E3',
  textSecondary: '#9B9B9B',
  textMuted: '#686868',
  accent: '#2EAADC',        // Notion blue accent
  accentHover: '#0081B5',
  shadow: 'rgba(0, 0, 0, 0.4)',
  statusBadgeBg: '#2C2C2C',
  statusBadgeText: '#D4D4D4',
};

export const NOTION_LIGHT_THEME: ThemeTokens = {
  mode: 'light',
  bgMain: '#F7F6F3',      // Notion Paper Light background
  bgCard: '#FFFFFF',      // Block background
  bgSidebar: '#F1F0EC',
  bgHover: '#EFEFEF',
  bgInput: '#FFFFFF',
  border: '#E9E9E7',
  borderSubtle: '#F2F1ED',
  textPrimary: '#37352F',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  accent: '#2EAADC',
  accentHover: '#0081B5',
  shadow: 'rgba(15, 15, 15, 0.08)',
  statusBadgeBg: '#EFEFEF',
  statusBadgeText: '#37352F',
};

export const NOTION_TAG_COLORS: Record<NotionColor, { darkBg: string; darkText: string; lightBg: string; lightText: string }> = {
  red: { darkBg: '#492926', darkText: '#FF7B72', lightBg: '#FFE2DD', lightText: '#D44C47' },
  blue: { darkBg: '#1E3A4C', darkText: '#6BB8FF', lightBg: '#DDEBF1', lightText: '#2EAADC' },
  green: { darkBg: '#243D2A', darkText: '#7EE787', lightBg: '#DDEDEA', lightText: '#448361' },
  yellow: { darkBg: '#423B22', darkText: '#F2CC60', lightBg: '#FBF3DB', lightText: '#D9730D' },
  purple: { darkBg: '#3C284C', darkText: '#D2A8FF', lightBg: '#EAE4F2', lightText: '#9065B0' },
  pink: { darkBg: '#4B2638', darkText: '#FFA3D4', lightBg: '#F4DFEB', lightText: '#C14C8A' },
  orange: { darkBg: '#473121', darkText: '#FFA657', lightBg: '#FAEBDD', lightText: '#D9730D' },
  gray: { darkBg: '#2D2D2D', darkText: '#B0B0B0', lightBg: '#E3E2E0', lightText: '#5A5A5A' },
  brown: { darkBg: '#3A2E26', darkText: '#D4A373', lightBg: '#EEE0DA', lightText: '#9F6B53' },
};
