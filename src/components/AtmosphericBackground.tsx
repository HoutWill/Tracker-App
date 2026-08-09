import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface IconParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  char: string;
  rotation: number;
  rotSpeed: number;
  wobble: number;
  wobbleSpeed: number;
}

export const AtmosphericBackground: React.FC = () => {
  // Disabled floating canvas particles per user directive
  return null;
};
