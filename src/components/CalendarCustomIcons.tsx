import React from 'react';

interface CustomIconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Crisp Vector Silhouette SVG for Buddhist Holy Days (Uposatha / Lunar Day)
export const BuddhaIcon: React.FC<CustomIconProps> = ({ size = 16, color = '#F39C12', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Halo & Head */}
    <circle cx="12" cy="5" r="2.2" fill={color} />
    <path
      d="M12 1.8C13.8 1.8 15.2 3.2 15.2 5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.8"
    />
    {/* Body / Meditating Posture */}
    <path
      d="M12 7.5C9.8 7.5 8 9.5 7.5 12C7.2 13.5 6.5 14.5 5 15.5C4.5 15.8 4.5 16.5 5.2 16.7C7.5 17.3 16.5 17.3 18.8 16.7C19.5 16.5 19.5 15.8 19 15.5C17.5 14.5 16.8 13.5 16.5 12C16 9.5 14.2 7.5 12 7.5Z"
      fill={color}
    />
    {/* Lotus Petal Base */}
    <path
      d="M4 19C6.5 21.2 9 21.8 12 21.8C15 21.8 17.5 21.2 20 19C17 19.5 14.5 20.5 12 20.5C9.5 20.5 7 19.5 4 19Z"
      fill={color}
    />
    <path
      d="M7 18.2C9 19.5 10.5 20 12 20C13.5 20 15 19.5 17 18.2C15.5 18.8 13.8 19.2 12 19.2C10.2 19.2 8.5 18.8 7 18.2Z"
      fill="#FFF"
      opacity="0.4"
    />
  </svg>
);

// Crisp Vector SVG for Pchum Ben / Kan Ben Offering Season (Bay Ben Rice Bowl)
export const BenOfferingIcon: React.FC<CustomIconProps> = ({ size = 16, color = '#E67E22', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Incense / Offering Glow Stems */}
    <path d="M12 2V6M9 4V7M15 4V7" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
    {/* Pyramid Rice Mound (Bay Ben) */}
    <path d="M12 7L6 14H18L12 7Z" fill={color} />
    {/* Offering Bowl Base */}
    <path
      d="M4 14C4 14 5 18 12 18C19 18 20 14 20 14H4Z"
      fill={color}
      opacity="0.9"
    />
    {/* Pedestal Stand */}
    <path d="M8 18L7 21H17L16 18H8Z" fill={color} />
  </svg>
);

// Cambodian KH Badge for National Holidays
export const CambodiaFlagBadge: React.FC<CustomIconProps> = ({ size = 16, className = '' }) => (
  <span
    className={className}
    style={{
      fontSize: `${Math.max(9, Math.round(size * 0.7))}px`,
      fontWeight: 800,
      color: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '4px',
      padding: '1px 4px',
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      verticalAlign: 'middle',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      letterSpacing: '0.3px',
    }}
    role="img"
    aria-label="Cambodia KH"
  >
    KH
  </span>
);
