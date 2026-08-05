import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { AnalyticsSummary } from '../components/AnalyticsSummary';
import { formatCurrency } from '../services/storageService';

export const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, currency } = useExpenses();

  const totalUSD = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgUSD = expenses.length > 0 ? totalUSD / expenses.length : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <View style={styles.headerBox}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>📈 Financial Analytics</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Notion Insights & Category Spending Trends
        </Text>
      </View>

      {/* Overview Stat Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Expenses Logged</Text>
          <Text style={[styles.statVal, { color: theme.textPrimary }]}>
            {formatCurrency(totalUSD, currency)}
          </Text>
          <Text style={[styles.statSub, { color: theme.textMuted }]}>{expenses.length} entries</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Average per Transaction</Text>
          <Text style={[styles.statVal, { color: theme.accent }]}>
            {formatCurrency(avgUSD, currency)}
          </Text>
          <Text style={[styles.statSub, { color: theme.textMuted }]}>Per entry avg</Text>
        </View>
      </View>

      <AnalyticsSummary />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
