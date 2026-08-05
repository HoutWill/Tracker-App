import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { SearchIcon, AiSparkleIcon } from './SvgIcons';

export const HeaderNotion: React.FC = () => {
  const { theme } = useTheme();
  const { currency, setCurrency, searchQuery, setSearchQuery, setIsAiChatOpen, setIsQuickAddOpen } = useExpenses();

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'KHR' : 'USD');
  };

  return (
    <View style={styles.container}>
      {/* Cover Header Banner */}
      <View style={[styles.coverBanner, { backgroundColor: theme.isDark ? '#262A33' : '#E8EEF5' }]}>
        <View style={styles.coverGradientPattern} />
      </View>

      {/* Page Header Content */}
      <View style={[styles.headerContent, { backgroundColor: theme.bgMain }]}>
        {/* Emoji Icon & Actions row */}
        <View style={styles.topRow}>
          <View style={[styles.emojiBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={styles.emojiText}>💸</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Currency Pill Toggle */}
            <TouchableOpacity
              style={[styles.currencyPill, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={toggleCurrency}
              activeOpacity={0.8}
            >
              <Text style={[styles.currencyText, { color: theme.textPrimary }]}>
                {currency === 'USD' ? '🇺🇸 $ USD' : '🇰🇭 ៛ KHR'}
              </Text>
            </TouchableOpacity>

            {/* AI Assistant Button */}
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: '#3A2E4C', borderColor: '#D2A8FF' }]}
              onPress={() => setIsAiChatOpen(true)}
              activeOpacity={0.8}
            >
              <AiSparkleIcon size={16} color="#D2A8FF" />
              <Text style={styles.aiButtonText}>AI Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Title */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>Personal Expenses</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Notion Database • Quick Add Shortcuts • AI Assistant
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <SearchIcon size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search expenses, notes, or categories..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  coverBanner: {
    height: 90,
    width: '100%',
    overflow: 'hidden',
  },
  coverGradientPattern: {
    height: '100%',
    opacity: 0.3,
    backgroundColor: '#2EAADC',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: -24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiText: {
    fontSize: 26,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  aiButtonText: {
    color: '#D2A8FF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
});
