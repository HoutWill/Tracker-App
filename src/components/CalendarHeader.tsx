import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { NOTION_TAG_COLORS } from '../constants/theme';

export const CalendarHeader: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, currency, selectedDate, setSelectedDate } = useExpenses();

  // Generate last 14 days dates
  const dates: { dateStr: string; dayName: string; dayNum: number; totalUSD: number; colors: any[] }[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();

    // Filter expenses for this date
    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const totalUSD = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Get unique category colors
    const colors = Array.from(new Set(dayExpenses.map(e => e.categoryColor)));

    dates.push({
      dateStr,
      dayName,
      dayNum,
      totalUSD,
      colors,
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Calendar Timeline</Text>
        {selectedDate ? (
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.bgHover }]}
            onPress={() => setSelectedDate(null)}
          >
            <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>Show All</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.hintText, { color: theme.textMuted }]}>Tap a date to filter</Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {dates.map(item => {
          const isSelected = selectedDate === item.dateStr;
          const isToday = item.dateStr === today.toISOString().split('T')[0];

          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.dayCard,
                { backgroundColor: theme.bgMain, borderColor: theme.border },
                isSelected ? { borderColor: theme.accent, backgroundColor: theme.isDark ? '#1E2D3B' : '#E6F4FA' } : null,
                isToday && !isSelected ? { borderColor: '#888' } : null,
              ]}
              onPress={() => setSelectedDate(isSelected ? null : item.dateStr)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayName, { color: theme.textMuted }, isSelected ? { color: theme.accent } : null]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dayNum, { color: theme.textPrimary }, isSelected ? { color: theme.accent, fontWeight: '800' } : null]}>
                {item.dayNum}
              </Text>

              {/* Total Spent Badge */}
              {item.totalUSD > 0 ? (
                <View style={[styles.totalBadge, { backgroundColor: isSelected ? theme.accent : theme.bgHover }]}>
                  <Text style={[styles.totalText, { color: isSelected ? '#FFF' : theme.textPrimary }]}>
                    {formatCurrency(item.totalUSD, currency)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>—</Text>
              )}

              {/* Category Color Dots */}
              <View style={styles.dotsRow}>
                {item.colors.slice(0, 3).map((col, idx) => {
                  const tagCol = NOTION_TAG_COLORS[col] || NOTION_TAG_COLORS.gray;
                  const dotColor = theme.isDark ? tagCol.darkText : tagCol.lightText;
                  return <View key={idx} style={[styles.dot, { backgroundColor: dotColor }]} />;
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
  },
  scrollList: {
    gap: 8,
  },
  dayCard: {
    width: 68,
    height: 84,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 1,
  },
  totalBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  totalText: {
    fontSize: 9,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 10,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    height: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
