import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme, COLOR_PALETTE_OPTIONS, PageColors } from '../context/ThemeContext';
import { formatCurrency } from '../services/storageService';
import { Settings, Shield, Eye, EyeOff, Target, Download, Trash2, User, Sun, Moon, Palette, RotateCcw, Check, CheckCircle2 } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { isDark, toggleTheme, pageColors, setPageColor, resetDefaultColors } = useTheme();
  const {
    monthlyBudget,
    setMonthlyBudget,
    hideBalances,
    setHideBalances,
    currency,
    exportCSVData,
    clearAllData,
  } = useExpenses();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleExportCSV = () => {
    const csvContent = exportCSVData();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to reset all expense data? This action cannot be undone.')) {
      await clearAllData();
    }
  };

  const handleSaveColors = () => {
    localStorage.setItem('page_theme_colors', JSON.stringify(pageColors));
    setToastMsg('Saved!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleResetColors = () => {
    resetDefaultColors();
    setToastMsg('Reset!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const pageNames: { key: keyof PageColors; label: string }[] = [
    { key: 'EXPENSES', label: 'Expenses' },
    { key: 'SAVING', label: 'Saving' },
  ];

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

      {/* User Workspace Profile Card */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'rgba(108, 92, 231, 0.15)',
            border: '1px solid rgba(108, 92, 231, 0.3)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Personal Workspace</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Liquid Glass PWA Database</p>
        </div>
      </div>

      {/* Light / Dark Mode Theme Switcher Card */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDark ? <Moon size={18} color="var(--accent)" /> : <Sun size={18} color="#FDCB6E" />}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Theme Mode</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Switch between Dark and Light mode</p>
          </div>
        </div>

        <button
          className="glass-pill"
          onClick={toggleTheme}
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--accent)',
            color: isDark ? 'var(--text-primary)' : '#FFF',
          }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Page Theme Colors Customizer Card (Expenses & Saving Only) */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={18} color="var(--accent)" />
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Page Colors</h4>
          </div>

          <button
            className="glass-pill"
            onClick={handleResetColors}
            style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--accent-danger)', borderColor: 'rgba(255, 82, 82, 0.3)' }}
            title="Reset Default Colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {pageNames.map(p => (
            <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{p.label}</span>

              <div style={{ display: 'flex', gap: '6px' }}>
                {COLOR_PALETTE_OPTIONS.map(c => {
                  const isSelected = pageColors[p.key] === c.hex;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => setPageColor(p.key, c.hex)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: isSelected ? '2px solid #FFF' : '1px solid transparent',
                        boxShadow: isSelected ? `0 0 10px ${c.hex}` : 'none',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                      title={c.name}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Explicit Save Action Button */}
        <button
          onClick={handleSaveColors}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <Check size={18} />
          Save
        </button>
      </div>

      {/* Monthly Budget Goal Selector */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Target size={16} color="var(--accent)" />
          <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Monthly Target Budget</h4>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          {[500, 1000, 1500, 2500].map(amt => (
            <button
              key={amt}
              className="glass-pill"
              onClick={() => setMonthlyBudget(amt)}
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: monthlyBudget === amt ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                borderColor: monthlyBudget === amt ? 'var(--accent)' : 'var(--border-glass)',
                color: monthlyBudget === amt ? '#FFF' : 'var(--text-primary)',
              }}
            >
              {formatCurrency(amt, currency)}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Mode (Hide Balances Toggle) */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={18} color="var(--accent)" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Privacy Mode</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mask values in public ($••••)</p>
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

      {/* Export CSV Data */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Export CSV Report</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Download full transactions backup</p>
          </div>

          <button
            onClick={handleExportCSV}
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
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(255, 123, 114, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-danger)' }}>Reset Data</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Clear stored database entries</p>
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
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
