import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { QuickAddModal } from './src/components/QuickAddModal';
import { ExpenseDetailModal } from './src/components/ExpenseDetailModal';
import { AiChatModal } from './src/components/AiChatModal';
import { NotionDatabaseIcon, CalendarIcon, WalletIcon } from './src/components/SvgIcons';
import { ActiveTab } from './src/types';

function MainApp() {
  const { theme, isDark } = useTheme();
  const { setIsQuickAddOpen } = useExpenses();
  const [activeTab, setActiveTab] = useState('home');

  // Deep Link listener (handles expensetracker://quick-add from Back-Tap or external shortcuts)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    try {
      const handleDeepLink = (event: { url: string }) => {
        if (event.url && event.url.includes('quick-add')) {
          setIsQuickAddOpen(true);
        }
      };

      Linking.getInitialURL().then(url => {
        if (url && url.includes('quick-add')) {
          setIsQuickAddOpen(true);
        }
      });

      const subscription = Linking.addEventListener('url', handleDeepLink);
      return () => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      };
    } catch (e) {
      // Ignore linking errors on web
    }
  }, [setIsQuickAddOpen]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bgMain} />

      {/* Main View Area */}
      <View style={styles.contentArea}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Notion Bottom Tab Navigation Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'home' ? { backgroundColor: theme.bgHover } : null]}
          onPress={() => setActiveTab('home')}
        >
          <NotionDatabaseIcon size={20} color={activeTab === 'home' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'home' ? theme.accent : theme.textMuted }]}>
            Database
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'calendar' ? { backgroundColor: theme.bgHover } : null]}
          onPress={() => setActiveTab('calendar')}
        >
          <CalendarIcon size={20} color={activeTab === 'calendar' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'calendar' ? theme.accent : theme.textMuted }]}>
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'analytics' ? { backgroundColor: theme.bgHover } : null]}
          onPress={() => setActiveTab('analytics')}
        >
          <WalletIcon size={20} color={activeTab === 'analytics' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'analytics' ? theme.accent : theme.textMuted }]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'settings' ? { backgroundColor: theme.bgHover } : null]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.gearIcon, { color: activeTab === 'settings' ? theme.accent : theme.textMuted }]}>⚙️</Text>
          <Text style={[styles.tabText, { color: activeTab === 'settings' ? theme.accent : theme.textMuted }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global Modals */}
      <QuickAddModal />
      <ExpenseDetailModal />
      <AiChatModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <MainApp />
      </ExpenseProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentArea: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  gearIcon: {
    fontSize: 16,
  },
});
