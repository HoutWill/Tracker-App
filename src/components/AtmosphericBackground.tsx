import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const AtmosphericBackground: React.FC = () => {
  const { activeThemeId } = useTheme();

  if (activeThemeId === 'DEFAULT') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Christmas Snow Effect */}
      {activeThemeId === 'CHRISTMAS' && (
        <div className="snow-container">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${4 + Math.random() * 6}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.3 + Math.random() * 0.7,
                fontSize: `${12 + Math.random() * 16}px`,
              }}
            >
              ❄
            </div>
          ))}
        </div>
      )}

      {/* Chinese New Year Lanterns & Gold Particles */}
      {activeThemeId === 'CHINESE' && (
        <div className="chinese-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="lantern-float"
              style={{
                left: `${8 + i * 6.2}%`,
                animationDuration: `${6 + Math.random() * 8}s`,
                animationDelay: `${Math.random() * 4}s`,
                fontSize: `${18 + Math.random() * 14}px`,
              }}
            >
              🏮
            </div>
          ))}
        </div>
      )}

      {/* Khmer New Year Sangkranta Golden Glow & Angkor Wat Silhouette */}
      {activeThemeId === 'KHMER' && (
        <div className="khmer-container">
          {/* Radial Sangkranta Sunburst */}
          <div
            style={{
              position: 'absolute',
              top: '-5%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '550px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(241, 196, 15, 0.25) 0%, rgba(243, 156, 18, 0.08) 60%, transparent 80%)',
              filter: 'blur(45px)',
            }}
          />

          {/* Majestic Angkor Wat 5-Tower Temple Vector Silhouette */}
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '92%',
              maxWidth: '440px',
              opacity: 0.22,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 500 240" style={{ width: '100%', height: 'auto' }}>
              <defs>
                <linearGradient id="angkorGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F39C12" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F1C40F" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              {/* Outer Walls & Tiered Platform */}
              <rect x="20" y="210" width="460" height="24" rx="3" fill="url(#angkorGold)" />
              <rect x="40" y="190" width="420" height="22" rx="2" fill="url(#angkorGold)" />
              <rect x="70" y="170" width="360" height="22" rx="2" fill="url(#angkorGold)" />

              {/* Far Left Outer Spire Tower */}
              <path d="M 80 170 L 95 110 L 100 80 L 105 110 L 120 170 Z" fill="url(#angkorGold)" />
              <path d="M 97 80 Q 100 65 103 80 Z" fill="url(#angkorGold)" />

              {/* Inner Left Spire Tower */}
              <path d="M 150 170 L 170 85 L 175 45 L 180 85 L 200 170 Z" fill="url(#angkorGold)" />
              <path d="M 172 45 Q 175 25 178 45 Z" fill="url(#angkorGold)" />

              {/* GRAND CENTRAL HIGH TOWER (Angkor Central Sanctuary) */}
              <rect x="210" y="140" width="80" height="32" fill="url(#angkorGold)" />
              <path d="M 225 140 L 245 40 L 250 10 L 255 40 L 275 140 Z" fill="url(#angkorGold)" />
              {/* Lotus Crown Spire */}
              <path d="M 246 10 Q 250 -10 254 10 Z" fill="#F1C40F" />

              {/* Inner Right Spire Tower */}
              <path d="M 300 170 L 320 85 L 325 45 L 330 85 L 350 170 Z" fill="url(#angkorGold)" />
              <path d="M 322 45 Q 325 25 328 45 Z" fill="url(#angkorGold)" />

              {/* Far Right Outer Spire Tower */}
              <path d="M 380 170 L 395 110 L 400 80 L 405 110 L 420 170 Z" fill="url(#angkorGold)" />
              <path d="M 397 80 Q 400 65 403 80 Z" fill="url(#angkorGold)" />
            </svg>
          </div>

          {/* Floating Gold Sparkles */}
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              className="gold-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.4 + Math.random() * 0.6,
                fontSize: `${10 + Math.random() * 12}px`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Halloween Pumpkin Embers */}
      {activeThemeId === 'HALLOWEEN' && (
        <div className="halloween-container">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="ember-float"
              style={{
                left: `${5 + i * 7}%`,
                animationDuration: `${5 + Math.random() * 7}s`,
                animationDelay: `${Math.random() * 4}s`,
                fontSize: `${16 + Math.random() * 14}px`,
              }}
            >
              {i % 2 === 0 ? '🎃' : '✨'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
