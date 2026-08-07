import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const InstallPwaBanner: React.FC = () => {
  const { pageColors } = useTheme();
  const accentColor = pageColors?.EXPENSES || '#6C5CE7';
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pitrack_pwa_banner_dismissed');
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pitrack_pwa_banner_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div
      style={{
        margin: '10px 14px 4px 14px',
        padding: '12px 14px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          <Smartphone size={18} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
            App
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Tap</span>
            <Share size={12} color={accentColor} />
            <span>Share</span>
            <span>➔</span>
            <PlusSquare size={12} color={accentColor} />
            <span>Add to Home Screen</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};
