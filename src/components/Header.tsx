import React from 'react';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { Wallet, Sun, Moon, CreditCard, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { isDark, toggleTheme, pageColors } = useTheme();
  const { currency, setCurrency, setIsAiChatOpen } = useExpenses();

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
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: `1px solid ${hexToRgba(accentColor, 0.35)}`,
            backgroundColor: hexToRgba(accentColor, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
          }}
        >
          <Wallet size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.4px' }}>Vault</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PWA</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme Toggle Button */}
        <button
          className="glass-pill"
          onClick={toggleTheme}
          style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
          title="Toggle Theme"
        >
          {isDark ? <Sun size={16} color="var(--accent)" /> : <Moon size={16} color="var(--accent)" />}
        </button>

        {/* Currency Toggle Button */}
        <button className="glass-pill" onClick={toggleCurrency} title="Switch Currency">
          <CreditCard size={14} color="var(--accent)" />
          <span>{currency === 'USD' ? 'USD' : 'KHR'}</span>
        </button>

        {/* AI Assistant Button */}
        <button
          className="glass-pill"
          onClick={() => setIsAiChatOpen(true)}
          style={{
            backgroundColor: 'rgba(210, 168, 255, 0.15)',
            borderColor: 'rgba(210, 168, 255, 0.35)',
            color: 'var(--accent-ai)',
            width: '36px',
            height: '36px',
            padding: 0,
            justifyContent: 'center',
          }}
          title="Open AI Assistant"
        >
          <Sparkles size={16} />
        </button>
      </div>
    </header>
  );
};
