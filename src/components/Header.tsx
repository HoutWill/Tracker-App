import React, { useState, useEffect } from 'react';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { AuthModal, UserAccount } from './AuthModal';
import { ShieldCheck, Sun, Moon, Sparkles, DollarSign, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { isDark, toggleTheme, pageColors } = useTheme();
  const { currency, setCurrency, setIsAiChatOpen } = useExpenses();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_account');
      if (saved) setUserAccount(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_account');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('guest_device_id');
    setUserAccount(null);
    window.location.reload();
  };

  const accentColor = pageColors?.EXPENSES || '#6C5CE7';

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'KHR' : 'USD');
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
        padding: '0 16px',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Left Brand Identifier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo.jpg"
          alt="PiTrack App Icon"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            objectFit: 'cover',
            border: '1px solid var(--border-glass)',
          }}
        />
        <h1 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1, color: 'var(--text-primary)' }}>
          PiTrack
        </h1>
      </div>

      {/* Right Control Action Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Currency Switcher Pill */}
        <button
          className="glass-pill"
          onClick={toggleCurrency}
          style={{
            height: '34px',
            padding: '0 10px',
            fontSize: '11px',
            fontWeight: 800,
            gap: '4px',
          }}
          title="Switch Currency"
        >
          <DollarSign size={13} color="var(--accent)" />
          <span>{currency === 'USD' ? 'USD' : 'KHR'}</span>
        </button>

        {/* Light / Dark Mode Toggle Pill */}
        <button
          className="glass-pill"
          onClick={toggleTheme}
          style={{
            width: '34px',
            height: '34px',
            padding: 0,
            justifyContent: 'center',
          }}
          title="Toggle Dark/Light Theme"
        >
          {isDark ? <Sun size={15} color="var(--accent)" /> : <Moon size={15} color="var(--accent)" />}
        </button>

        {/* Account Link / Login Pill (Positioned at Far Right) */}
        <button
          className="glass-pill"
          onClick={() => setIsAuthModalOpen(!isAuthModalOpen)}
          style={{
            height: '34px',
            padding: '0 10px',
            fontSize: '11px',
            fontWeight: 800,
            gap: '4px',
            borderColor: userAccount ? 'rgba(0, 230, 118, 0.4)' : 'var(--border-glass)',
            backgroundColor: userAccount ? 'rgba(0, 230, 118, 0.12)' : 'var(--pill-bg)',
            color: userAccount ? 'var(--accent-success)' : 'var(--text-primary)',
          }}
          title={userAccount ? `Logged in as ${userAccount.name}` : 'Login / Link Account'}
        >
          {userAccount ? <ShieldCheck size={14} /> : <User size={14} />}
          <span>{userAccount ? userAccount.name.split(' ')[0] : 'Account'}</span>
        </button>
      </div>

      {/* Account Top-Right Dropdown Popover */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userAccount}
        onAuthSuccess={u => {
          setUserAccount(u);
          window.location.reload();
        }}
        onLogout={handleLogout}
        isPopover={true}
      />
    </header>
  );
};
