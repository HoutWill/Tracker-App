import React, { useState, useEffect } from 'react';
import { useExpenses } from './context/ExpenseContext';
import { useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddSavingModal } from './components/AddSavingModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { EditSavingModal } from './components/EditSavingModal';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { SavingsScreen } from './screens/SavingsScreen';
import { StatsScreen } from './screens/StatsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CreditCard, PiggyBank, BarChart3, Calendar, Settings } from 'lucide-react';

export type TabName = 'EXPENSES' | 'SAVINGS' | 'STATS' | 'CALENDAR' | 'SETTINGS';

export const App: React.FC = () => {
  const { pageColors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabName>('EXPENSES');

  // Dynamically inject custom theme color into CSS Root Variables when switching tabs or changing colors
  useEffect(() => {
    const currentColor = pageColors[activeTab as keyof typeof pageColors] || '#6C5CE7';
    document.documentElement.style.setProperty('--accent', currentColor);
    document.documentElement.style.setProperty('--accent-glow', `${currentColor}4D`);
    document.documentElement.style.setProperty('--accent-light', currentColor);

    if (activeTab === 'SAVINGS') {
      document.documentElement.style.setProperty('--accent-success', currentColor);
    } else {
      document.documentElement.style.setProperty('--accent-success', pageColors.SAVING || '#00E676');
    }
  }, [activeTab, pageColors]);

  return (
    <div
      style={{
        minHeight: '100vh',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Universal Header */}
      <Header />

      {/* Main Active Screen */}
      <main style={{ flex: 1 }}>
        {activeTab === 'EXPENSES' && <ExpensesScreen />}
        {activeTab === 'SAVINGS' && <SavingsScreen />}
        {activeTab === 'STATS' && <StatsScreen />}
        {activeTab === 'CALENDAR' && <CalendarScreen />}
        {activeTab === 'SETTINGS' && <SettingsScreen />}
      </main>

      {/* Dedicated Modals */}
      <AddExpenseModal />
      <AddSavingModal />
      <EditExpenseModal />
      <EditSavingModal />

      {/* Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          height: '64px',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 40,
        }}
      >
        {[
          { id: 'EXPENSES', label: 'Expenses', icon: CreditCard },
          { id: 'SAVINGS', label: 'Saving', icon: PiggyBank },
          { id: 'STATS', label: 'Stats', icon: BarChart3 },
          { id: 'CALENDAR', label: 'Calendar', icon: Calendar },
          { id: 'SETTINGS', label: 'Settings', icon: Settings },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const tabColor = pageColors[tab.id as keyof typeof pageColors] || 'var(--accent)';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabName)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: isActive ? tabColor : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
            >
              <Icon size={19} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 800 : 600 }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
