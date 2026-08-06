import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { ExportModal } from '../components/ExportModal';
import { AppearanceModal } from '../components/AppearanceModal';
import { AuthModal, UserAccount } from '../components/AuthModal';
import { getGuestId, setGuestId } from '../services/storageService';
import { Settings, Shield, Eye, EyeOff, Download, Trash2, Palette, CheckCircle2, Sparkles, Key, Copy, RefreshCw, User, ShieldCheck, LogIn } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    hideBalances,
    setHideBalances,
    clearAllData,
  } = useExpenses();

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
            boxShadow: '0 8px 24px rgba(0, 230, 118, 0.25)',
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
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
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
              boxShadow: userAccount ? 'none' : '0 4px 14px rgba(46, 170, 220, 0.25)',
            }}
          >
            {userAccount ? <User size={14} /> : <LogIn size={14} />}
            {userAccount ? 'Profile' : 'Login'}
          </button>
        </div>
      </div>

      {/* Unified Appearance Customizer Card (Themes, Colors & Presets) */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={18} color="var(--accent)" />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Appearance</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Themes, colors & presets</p>
            </div>
          </div>

          <button
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
              boxShadow: '0 4px 14px rgba(46, 170, 220, 0.25)',
            }}
          >
            <Sparkles size={14} />
            Theme
          </button>
        </div>
      </div>

      {/* Privacy Mode (Hide Balances Toggle) */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={18} color="var(--accent)" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Privacy</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mask values ($••••)</p>
          </div>
        </div>

        <button
          className="glass-pill"
          onClick={() => setHideBalances(!hideBalances)}
          style={{
            backgroundColor: hideBalances ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
            color: hideBalances ? '#FFF' : 'var(--text-primary)',
          }}
        >
          {hideBalances ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{hideBalances ? 'Hidden' : 'Visible'}</span>
        </button>
      </div>

      {/* Account Sync Key & Database Recovery Card */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={18} color="var(--accent)" />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Backup Key</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Unique account restore key</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="glass-pill"
              onClick={handleCopySyncKey}
              style={{ fontSize: '11px', padding: '5px 10px' }}
              title="Copy Sync Key"
            >
              <Copy size={13} /> Copy
            </button>
            <button
              className="glass-pill"
              onClick={handleRestoreAccount}
              style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--accent)' }}
              title="Restore Database with Key"
            >
              <RefreshCw size={13} /> Restore
            </button>
          </div>
        </div>

        {/* Sync Key Pill */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-glass)',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
          }}
        >
          {currentSyncKey}
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
              boxShadow: '0 4px 14px rgba(46, 170, 220, 0.25)',
            }}
          >
            <Download size={14} />
            Export
          </button>
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
