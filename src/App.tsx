import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { ReminderProvider } from './context/ReminderContext';
import { Header } from './components/Header';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddSavingModal } from './components/AddSavingModal';
import { AddReminderModal } from './components/AddReminderModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { EditSavingModal } from './components/EditSavingModal';
import { AiChatModal } from './components/AiChatModal';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { SavingsScreen } from './screens/SavingsScreen';
import { StatsScreen } from './screens/StatsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { PlannerScreen } from './screens/PlannerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { CreditCard, PiggyBank, BarChart3, Calendar, Settings, Bell, Wallet } from 'lucide-react';

import { requestPersistentStorage } from './services/storageService';
import { CreateTripModal } from './components/CreateTripModal';
import { CreateExpenseFolderModal } from './components/CreateExpenseFolderModal';
import { CreateSavingFolderModal } from './components/CreateSavingFolderModal';
import { EditTripModal } from './components/EditTripModal';

export type TabName = 'EXPENSES' | 'SAVINGS' | 'STATS' | 'PLANNER' | 'CALENDAR' | 'SETTINGS';

export const AppContent: React.FC = () => {
  const { pageColors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabName>('EXPENSES');

  // Request Web Persistent Storage permission to prevent browser auto-cleaning cache
  useEffect(() => {
    requestPersistentStorage();
  }, []);

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
      {/* Animated Atmospheric Theme Background Effects */}
      <AtmosphericBackground />

      {/* Universal Header */}
      <Header />

      {/* Main Active Screen */}
      <main style={{ flex: 1, paddingBottom: '90px' }}>
        {activeTab === 'EXPENSES' && <ExpensesScreen onSwitchTab={setActiveTab} />}
        {activeTab === 'SAVINGS' && <SavingsScreen onSwitchTab={setActiveTab} />}
        {activeTab === 'STATS' && <StatsScreen />}
        {activeTab === 'PLANNER' && <PlannerScreen />}
        {activeTab === 'CALENDAR' && <CalendarScreen />}
        {activeTab === 'SETTINGS' && <SettingsScreen />}
      </main>

      {/* Dedicated Modals */}
      <AddExpenseModal />
      <AddSavingModal />
      <AddReminderModal />
      <EditExpenseModal />
      <EditSavingModal />
      <AiChatModal />
      <CreateTripModal />
      <CreateExpenseFolderModal />
      <CreateSavingFolderModal />
      <EditTripModal />

      {/* Modern Floating Dock Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: '430px',
          height: '58px',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 6px',
          zIndex: 40,
        }}
      >
        {[
          { id: 'EXPENSES', label: 'Wallet', icon: Wallet },
          { id: 'STATS', label: 'Stats', icon: BarChart3 },
          { id: 'PLANNER', label: 'Planner', icon: Bell },
          { id: 'CALENDAR', label: 'Calendar', icon: Calendar },
          { id: 'SETTINGS', label: 'Settings', icon: Settings },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabName)}
              style={{
                background: isActive ? 'var(--pill-hover)' : 'transparent',
                border: isActive ? '1px solid var(--border-glass)' : '1px solid transparent',
                borderRadius: '12px',
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export const App: React.FC = () => (
  <ReminderProvider>
    <AppContent />
  </ReminderProvider>
);

export default App;
