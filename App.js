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
import { Ionicons } from '@expo/vector-icons';

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

      {/* Liquid Glass iOS Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? 'rgba(25, 25, 25, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'home'
              ? { backgroundColor: isDark ? 'rgba(46, 170, 220, 0.18)' : 'rgba(46, 170, 220, 0.1)' }
              : null,
          ]}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={20}
            color={activeTab === 'home' ? theme.accent : theme.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'home' ? theme.accent : theme.textMuted }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'calendar'
              ? { backgroundColor: isDark ? 'rgba(46, 170, 220, 0.18)' : 'rgba(46, 170, 220, 0.1)' }
              : null,
          ]}
          onPress={() => setActiveTab('calendar')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'calendar' ? 'calendar' : 'calendar-outline'}
            size={20}
            color={activeTab === 'calendar' ? theme.accent : theme.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'calendar' ? theme.accent : theme.textMuted }]}>
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'analytics'
              ? { backgroundColor: isDark ? 'rgba(46, 170, 220, 0.18)' : 'rgba(46, 170, 220, 0.1)' }
              : null,
          ]}
          onPress={() => setActiveTab('analytics')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'analytics' ? 'stats-chart' : 'stats-chart-outline'}
            size={20}
            color={activeTab === 'analytics' ? theme.accent : theme.textMuted}
          />
          <Text style={[styles.tabText, { color: activeTab === 'analytics' ? theme.accent : theme.textMuted }]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'settings'
              ? { backgroundColor: isDark ? 'rgba(46, 170, 220, 0.18)' : 'rgba(46, 170, 220, 0.1)' }
              : null,
          ]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
            size={20}
            color={activeTab === 'settings' ? theme.accent : theme.textMuted}
          />
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
    height: 60,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.2,
  },
});
