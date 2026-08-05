import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { CategoryBadge } from './CategoryBadge';
import { NOTION_TAG_COLORS } from '../constants/theme';

export const AnalyticsSummary: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, currency, categories } = useExpenses();

  const totalSpentUSD = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Group by category
  const categoryTotals: { [catId: string]: { name: string; icon: string; color: any; amountUSD: number } } = {};

  expenses.forEach(item => {
    if (!categoryTotals[item.categoryId]) {
      categoryTotals[item.categoryId] = {
        name: item.categoryName,
        icon: item.categoryIcon,
        color: item.categoryColor,
        amountUSD: 0,
      };
    }
    categoryTotals[item.categoryId].amountUSD += item.amount;
  });

  const catList = Object.values(categoryTotals).sort((a, b) => b.amountUSD - a.amountUSD);

  // Monthly Budget Target (default $1,000 USD)
  const monthlyBudget = 1000;
  const progressPercent = Math.min(100, Math.round((totalSpentUSD / monthlyBudget) * 100));

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>📊 Monthly Spending Breakdown</Text>

      {/* Main Budget Progress Card */}
      <View style={[styles.budgetBox, { backgroundColor: theme.bgMain, borderColor: theme.border }]}>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Monthly Budget ($1,000 Goal)</Text>
          <Text style={[styles.budgetVal, { color: theme.textPrimary }]}>
            {formatCurrency(totalSpentUSD, currency)} / {formatCurrency(monthlyBudget, currency)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBg, { backgroundColor: theme.bgHover }]}>
          <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: progressPercent > 90 ? '#FF7B72' : theme.accent }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.textMuted }]}>{progressPercent}% of target budget used</Text>
      </View>

      {/* Top Categories Progress list */}
      <Text style={[styles.catHeaderTitle, { color: theme.textSecondary }]}>Top Spending Categories</Text>
      <View style={styles.catList}>
        {catList.slice(0, 5).map((cat, idx) => {
          const percentage = totalSpentUSD > 0 ? Math.round((cat.amountUSD / totalSpentUSD) * 100) : 0;
          const tagCol = NOTION_TAG_COLORS[cat.color] || NOTION_TAG_COLORS.gray;
          const barColor = theme.isDark ? tagCol.darkText : tagCol.lightText;

          return (
            <View key={idx} style={styles.catRow}>
              <View style={styles.catMetaRow}>
                <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} size="sm" />
                <Text style={[styles.catPrice, { color: theme.textPrimary }]}>
                  {formatCurrency(cat.amountUSD, currency)} ({percentage}%)
                </Text>
              </View>

              <View style={[styles.catBarBg, { backgroundColor: theme.bgHover }]}>
                <View style={[styles.catBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  budgetBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  budgetVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  catHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  catList: {
    gap: 8,
  },
  catRow: {
    gap: 4,
  },
  catMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catPrice: {
    fontSize: 11,
    fontWeight: '700',
  },
  catBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
