import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { ExpenseCard } from '../components/ExpenseCard';
import { NOTION_TAG_COLORS } from '../constants/theme';

export const CalendarScreen: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, currency, setSelectedExpenseForEdit } = useExpenses();

  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);

  // Generate days for current month (30 days grid)
  const days: { dateStr: string; dayNum: number; totalUSD: number; count: number }[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const totalUSD = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    days.push({
      dateStr,
      dayNum: d,
      totalUSD,
      count: dayExpenses.length,
    });
  }

  const selectedDayExpenses = expenses.filter(e => e.date === selectedDay);
  const selectedDayTotalUSD = selectedDayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgMain }]}>
      {/* Calendar Header */}
      <View style={[styles.calendarTop, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
          📅 {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Text style={[styles.monthSubtitle, { color: theme.textSecondary }]}>
          Tap any day on the calendar grid to inspect daily spending
        </Text>

        {/* 7-column Calendar Grid */}
        <View style={styles.grid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayHead, i) => (
            <Text key={i} style={[styles.weekHead, { color: theme.textMuted }]}>
              {dayHead}
            </Text>
          ))}

          {days.map(item => {
            const isSel = selectedDay === item.dateStr;
            const isToday = item.dateStr === today.toISOString().split('T')[0];

            return (
              <TouchableOpacity
                key={item.dateStr}
                style={[
                  styles.gridCell,
                  { backgroundColor: theme.bgMain, borderColor: theme.border },
                  isSel ? { borderColor: theme.accent, backgroundColor: theme.isDark ? '#1E2D3B' : '#E6F4FA' } : null,
                  isToday && !isSel ? { borderColor: '#888' } : null,
                ]}
                onPress={() => setSelectedDay(item.dateStr)}
              >
                <Text style={[styles.gridDayNum, { color: theme.textPrimary }, isSel ? { color: theme.accent, fontWeight: '800' } : null]}>
                  {item.dayNum}
                </Text>
                {item.totalUSD > 0 ? (
                  <View style={[styles.dotBadge, { backgroundColor: isSel ? theme.accent : theme.textSecondary }]} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Day Transactions */}
      <View style={[styles.selectedHeader, { borderColor: theme.border }]}>
        <Text style={[styles.selectedTitle, { color: theme.textPrimary }]}>
          Expenses for {selectedDay}
        </Text>
        <Text style={[styles.selectedSum, { color: theme.accent }]}>
          Total: {formatCurrency(selectedDayTotalUSD, currency)}
        </Text>
      </View>

      <FlatList
        data={selectedDayExpenses}
        keyExtractor={(item, index) => (item && item.id ? item.id : 'item-' + index)}
        renderItem={({ item }) => (
          item ? <ExpenseCard item={item} onPress={() => setSelectedExpenseForEdit(item)} /> : null
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No transactions recorded on this date.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarTop: {
    padding: 16,
    borderBottomWidth: 1,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  monthSubtitle: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  weekHead: {
    width: '13.5%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  gridCell: {
    width: '13.5%',
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridDayNum: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotBadge: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedSum: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
});
