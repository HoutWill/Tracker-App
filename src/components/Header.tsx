import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { AuthModal, UserAccount } from './AuthModal';
import { ShieldCheck, Sun, Moon, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency } = useExpenses();

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

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'KHR' : 'USD');
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '56px',
        padding: '0 16px',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Left Brand Identifier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo.jpg"
          alt="PiTrack Logo"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            objectFit: 'cover',
            display: 'block',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          }}
        />
        <h1 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, color: 'var(--text-primary)' }}>
          PiTrack
        </h1>
      </div>

      {/* Right Control Action Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Currency Switcher Pill */}
        <button
          type="button"
          onClick={toggleCurrency}
          style={{
            height: '32px',
            padding: '0 10px',
            borderRadius: '10px',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Switch Currency (USD / KHR)"
        >
          <span style={{ color: currency === 'USD' ? '#4A99E9' : '#30D158', fontWeight: 900 }}>
            {currency === 'USD' ? '$' : '៛'}
          </span>
          <span>{currency === 'USD' ? 'USD' : 'KHR'}</span>
        </button>

        {/* Light / Dark Mode Toggle Pill */}
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            borderRadius: '10px',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Toggle Dark/Light Theme"
        >
          {isDark ? <Sun size={15} color="#F3A85B" /> : <Moon size={15} color="#4A99E9" />}
        </button>

        {/* Account Link / Login Pill */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(!isAuthModalOpen)}
          style={{
            height: '32px',
            padding: '0 10px',
            borderRadius: '10px',
            border: userAccount ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid var(--border-glass)',
            backgroundColor: userAccount ? 'rgba(48, 209, 88, 0.12)' : 'var(--pill-bg)',
            color: userAccount ? '#30D158' : 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={userAccount ? `Logged in as ${userAccount.name}` : 'Login / Link Account'}
        >
          {userAccount ? <ShieldCheck size={14} color="#30D158" /> : <User size={14} />}
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
