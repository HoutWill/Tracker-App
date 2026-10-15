import React from 'react';

interface BootstrapIconProps {
  name: string; // e.g. "wallet2", "pie-chart", "calendar-event", "currency-dollar"
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BootstrapIcon: React.FC<BootstrapIconProps> = ({
  name,
  size = 18,
  color = 'currentColor',
  className = '',
  style = {},
}) => {
  const cleanName = name.startsWith('bi-') ? name : `bi-${name}`;

  return (
    <i
      className={`bi ${cleanName} ${className}`.trim()}
      style={{
        fontSize: `${size}px`,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export default BootstrapIcon;
