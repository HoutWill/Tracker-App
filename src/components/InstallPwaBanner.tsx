import React, { useState } from 'react';
import { Share, PlusSquare, X, Smartphone, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const InstallPwaBanner: React.FC = () => {
  const { pageColors } = useTheme();
  const accentColor = pageColors?.EXPENSES || '#4A99E9';
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('pwa_banner_dismissed');
    } catch (e) {
      return true;
    }
  });

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem('pwa_banner_dismissed', 'true');
    } catch (e) {}
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '82px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '860px',
        zIndex: 95,
        padding: '12px 16px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #4A99E9 0%, #6C5CE7 100%)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box',
        animation: 'slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Smartphone size={20} color="#FFFFFF" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.2px' }}>
              Install
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                padding: '2px 6px',
                borderRadius: '6px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
              }}
            >
              App
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, opacity: 0.95 }}>
            <span>Tap</span>
            <Share size={13} color="#FFFFFF" />
            <span>Share</span>
            <ArrowRight size={11} color="#FFFFFF" />
            <PlusSquare size={13} color="#FFFFFF" />
            <span>Add</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};
