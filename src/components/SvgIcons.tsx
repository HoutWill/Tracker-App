import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const NotionDatabaseIcon: React.FC<IconProps> = ({ size = 20, color = '#2EAADC' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M3 9H21" stroke={color} strokeWidth="2" />
    <Path d="M9 9V21" stroke={color} strokeWidth="2" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, color = '#888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" />
  </Svg>
);

export const AiSparkleIcon: React.FC<IconProps> = ({ size = 20, color = '#D2A8FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
      fill={color}
    />
    <Path
      d="M19 2L20.2 5.8L24 7L20.2 8.2L19 12L17.8 8.2L14 7L17.8 5.8L19 2Z"
      fill={color}
      opacity="0.7"
    />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 20, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

export const TagIcon: React.FC<IconProps> = ({ size = 18, color = '#888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7" cy="7" r="1.5" fill={color} />
  </Svg>
);

export const WalletIcon: React.FC<IconProps> = ({ size = 20, color = '#888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="15" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M16 12.5H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M2 9H22" stroke={color} strokeWidth="2" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = '#888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path d="M20 20L16.5 16.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const BackTapIcon: React.FC<IconProps> = ({ size = 20, color = '#2EAADC' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="2" width="12" height="20" rx="3" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="7" r="2" fill={color} opacity="0.6" />
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Path d="M2 12C2 12 4 10 4 12C4 14 2 12 2 12Z" fill={color} />
  </Svg>
);
