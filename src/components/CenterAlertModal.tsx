import React from 'react';
import { CheckCircle2, AlertCircle, Bell, X } from 'lucide-react';

interface CenterAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

export const CenterAlertModal: React.FC<CenterAlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={28} color="#FF9F0A" />;
      case 'info':
        return <Bell size={28} color="#64D2FF" />;
      default:
        return <CheckCircle2 size={28} color="#30D158" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: '#1C1C1E',
          border: '1px solid #3A3A3C',
          borderRadius: '20px',
          padding: '24px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ marginBottom: '12px' }}>{getIcon()}</div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px', color: '#FFFFFF' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: '#8E8E93', lineHeight: '1.4', marginBottom: '20px' }}>{message}</p>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#0A84FF',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};
