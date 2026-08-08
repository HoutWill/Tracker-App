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
  const { activeThemeId, isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Default theme has NO background animation (normal clean screen)
    if (activeThemeId === 'DEFAULT') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let symbols: string[] = [];
    let particleCount = 25;
    let isFalling = true;

    if (activeThemeId === 'CHRISTMAS') {
      // Christmas falling snowflakes
      symbols = ['❄️', '❅', '❆', '✨', '❄️'];
      particleCount = 35;
      isFalling = true;
    } else if (activeThemeId === 'CHINESE') {
      // Chinese spring lanterns & gold
      symbols = ['🏮', '🪙', '✨', '🏮', '🏮'];
      particleCount = 30;
      isFalling = false;

    } else if (activeThemeId === 'HALLOWEEN') {
      // Halloween pumpkins, bats & ghosts
      symbols = ['🎃', '🦇', '👻', '🔥', '✨'];
      particleCount = 30;
      isFalling = false;
    }

    const particles: IconParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.floor(Math.random() * 14 + 16), // 16px to 30px
      speedX: (Math.random() - 0.5) * 0.7,
      speedY: isFalling ? Math.random() * 1.3 + 0.5 : -(Math.random() * 1.0 + 0.4),
      opacity: isDark ? Math.random() * 0.65 + 0.25 : Math.random() * 0.45 + 0.2,
      char: symbols[Math.floor(Math.random() * symbols.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.025 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        const currentX = p.x + Math.sin(p.wobble) * 1.6;

        p.y += p.speedY;
        p.x += p.speedX;

        // Loop boundaries smoothly
        if (isFalling && p.y > height + 25) {
          p.y = -25;
          p.x = Math.random() * width;
        } else if (!isFalling && p.y < -25) {
          p.y = height + 25;
          p.x = Math.random() * width;
        }
        if (p.x < -25) p.x = width + 25;
        if (p.x > width + 25) p.x = -25;

        ctx.save();
        ctx.translate(currentX, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [activeThemeId, isDark]);

  if (activeThemeId === 'DEFAULT') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
