import React from 'react';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { ShieldCheck, Sun, Moon, Sparkles, DollarSign } from 'lucide-react';

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
        height: '60px',
        padding: '0 16px',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Left Brand Identifier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '11px',
            border: `1px solid ${hexToRgba(accentColor, 0.35)}`,
            backgroundColor: hexToRgba(accentColor, 0.14),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            boxShadow: `0 2px 10px ${hexToRgba(accentColor, 0.25)}`,
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.4px', lineHeight: 1.1 }}>
          Vault
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
          title="Toggle Theme"
        >
          {isDark ? <Sun size={15} color="var(--accent)" /> : <Moon size={15} color="var(--accent)" />}
        </button>

        {/* Agent Button Pill */}
        <button
          className="glass-pill"
          onClick={() => setIsAiChatOpen(true)}
          style={{
            backgroundColor: 'rgba(108, 92, 231, 0.15)',
            borderColor: 'rgba(108, 92, 231, 0.35)',
            color: 'var(--accent)',
            height: '34px',
            padding: '0 10px',
            fontSize: '11px',
            fontWeight: 800,
            gap: '4px',
          }}
          title="Open Agent Chat"
        >
          <Sparkles size={14} />
          <span>Agent</span>
        </button>
      </div>
    </header>
  );
};
