import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { ExportModal } from '../components/ExportModal';
import { AppearanceModal } from '../components/AppearanceModal';
import { AuthModal, UserAccount } from '../components/AuthModal';
import { getGuestId, setGuestId } from '../services/storageService';
import { BootstrapIcon } from '../components/BootstrapIcon';
import { Settings, Shield, Eye, EyeOff, Download, Trash2, Palette, CheckCircle2, Sparkles, Key, Copy, RefreshCw, User, ShieldCheck, LogIn } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    hideBalances,
    setHideBalances,
    clearAllData,
  } = useExpenses();
  const { activeThemeId, setTheme, themes } = useTheme();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [currentSyncKey, setCurrentSyncKey] = useState(getGuestId());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_account');
      if (saved) setUserAccount(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_account');
    localStorage.removeItem('guest_device_id');
    setUserAccount(null);
    window.location.reload();
  };

  const handleCopySyncKey = () => {
    navigator.clipboard.writeText(currentSyncKey);
    setToastMsg('Sync Key Copied!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleRestoreAccount = () => {
    const key = prompt('Enter your saved Sync Key to restore your database:', currentSyncKey);
    if (key && key.trim()) {
      setGuestId(key.trim());
      setCurrentSyncKey(key.trim());
      setToastMsg('Account Sync Key Updated! Refreshing database...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to reset all expense data? This action cannot be undone.')) {
      await clearAllData();
    }
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Toast Feedback Notification Banner */}
      {toastMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(126, 231, 135, 0.4)',
            backgroundColor: 'rgba(126, 231, 135, 0.18)',
            color: 'var(--accent-success)',
            fontSize: '14px',
            fontWeight: 800,
            marginBottom: '14px',
            boxShadow: 'none',
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Settings size={20} color="var(--accent)" />
        <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Settings</h2>
      </div>

      {/* Account Cloud Sync & User Profile Card */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '20px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: userAccount ? 'rgba(0, 230, 118, 0.15)' : 'rgba(46, 170, 220, 0.15)',
                border: userAccount ? '1px solid rgba(0, 230, 118, 0.35)' : '1px solid rgba(46, 170, 220, 0.35)',
                color: userAccount ? 'var(--accent-success)' : 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {userAccount ? <ShieldCheck size={18} /> : <User size={18} />}
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>
                {userAccount ? userAccount.name : 'Account'}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {userAccount ? userAccount.email : 'Protect & sync data'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: userAccount ? 'rgba(255, 255, 255, 0.08)' : 'var(--accent)',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            {userAccount ? <User size={14} /> : <LogIn size={14} />}
            {userAccount ? 'Profile' : 'Login'}
          </button>
        </div>

        {/* Sync Key Row with Copy & Restore */}
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <BootstrapIcon name="key-fill" size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {currentSyncKey}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleCopySyncKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Copy"
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={handleRestoreAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Restore"
            >
              <RefreshCw size={12} />
              <span>Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Appearance Customizer Card (Interactive Theme Bento) */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '20px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Appearance</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {themes.find(t => t.id === activeThemeId)?.name || 'Theme'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAppearanceModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            <Sparkles size={14} />
            <span>Theme</span>
          </button>
        </div>

        {/* Quick 1-Tap Theme Pills Row */}
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {themes.map(t => {
            const isSelected = activeThemeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #4A99E9' : '1px solid var(--border-glass)',
                  backgroundColor: isSelected ? 'var(--pill-hover)' : 'var(--pill-bg)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: t.accent,
                    display: 'inline-block',
                  }}
                />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy Mode (Hide Balances Toggle) */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BootstrapIcon name="incognito" size={18} color="var(--accent)" />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Privacy</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Blur dashboard spending</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHideBalances(!hideBalances)}
            style={{
              width: '46px',
              height: '26px',
              borderRadius: '13px',
              backgroundColor: hideBalances ? 'var(--accent)' : 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '2px',
            }}
            title="Privacy"
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: '#FFFFFF',
                transform: hideBalances ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}
            />
          </button>
        </div>
      </div>


      {/* Ultra-Clean 1-Row Export CSV Card */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Export</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CSV spreadsheet backup</p>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* App Version Info Card */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Version</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PiTrack PWA Stable Build</p>
          </div>

          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent)',
            }}
          >
            v1.0.0
          </span>
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(255, 123, 114, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-danger)' }}>Reset</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Clear stored database</p>
          </div>

          <button
            onClick={handleClearData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 123, 114, 0.4)',
              backgroundColor: 'rgba(255, 123, 114, 0.15)',
              color: 'var(--accent-danger)',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Dedicated Export Popup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Dedicated Unified Appearance & Theme Customizer Modal */}
      <AppearanceModal
        isOpen={isAppearanceModalOpen}
        onClose={() => setIsAppearanceModalOpen(false)}
      />

      {/* Dedicated Account Authentication & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userAccount}
        onAuthSuccess={u => setUserAccount(u)}
        onLogout={handleLogout}
      />
    </div>
  );
};
