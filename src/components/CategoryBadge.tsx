import React from 'react';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { useTheme, hexToRgba } from '../context/ThemeContext';

interface Props {
  name: string;
  icon?: string;
  color?: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<Props> = ({ name, icon = 'receipt-outline', size = 'sm' }) => {
  const { pageColors } = useTheme();
  const accentColor = pageColors?.EXPENSES || '#6C5CE7';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: '6px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 700,
        backgroundColor: hexToRgba(accentColor, 0.14),
        color: accentColor,
        border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
      }}
    >
      <CategoryIconRenderer icon={icon} size={12} color={accentColor} />
      {name}
    </span>
  );
};
