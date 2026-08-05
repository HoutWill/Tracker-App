import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { HeaderNotion } from '../components/HeaderNotion';
import { CalendarHeader } from '../components/CalendarHeader';
import { ExpenseCard } from '../components/ExpenseCard';
import { PlusIcon, AiSparkleIcon } from '../components/SvgIcons';
import { formatCurrency } from '../services/storageService';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    expenses,
    currency,
    selectedDate,
    searchQuery,
    setIsQuickAddOpen,
    setIsAiChatOpen,
    setSelectedExpenseForEdit,
  } = useExpenses();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const currentList = Array.isArray(expenses) ? expenses : [];

  // Filter expenses
  let filtered = currentList.filter(item => {
    if (!item) return false;
    if (selectedDate && item.date !== selectedDate) return false;
    if (activeCategoryFilter && item.categoryId !== activeCategoryFilter) return false;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchCat = (item.categoryName || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      return matchTitle || matchCat || matchNotes;
    }
    return true;
  });

  const totalFilteredUSD = filtered.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => (item && item.id ? item.id : 'item-' + index)}
        renderItem={({ item }) => (
          item ? <ExpenseCard item={item} onPress={() => setSelectedExpenseForEdit(item)} /> : null
        )}
        ListHeaderComponent={
          <View>
            <HeaderNotion />
            <CalendarHeader />

            {/* Notion Database Table View Header */}
            <View style={[styles.dbHeader, { borderColor: theme.border }]}>
              <View style={styles.dbHeaderTitleRow}>
                <Text style={[styles.dbTitle, { color: theme.textPrimary }]}>📋 Transactions Database</Text>

                <View style={[styles.countBadge, { backgroundColor: theme.bgCard }]}>
                  <Text style={[styles.countText, { color: theme.accent }]}>{filtered.length} entries</Text>
                </View>
              </View>

              <Text style={[styles.totalSumText, { color: theme.textSecondary }]}>
                Total Filtered Spend: <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{formatCurrency(totalFilteredUSD, currency)}</Text>
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No expenses found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try clearing filters or tap the + button below to add a new transaction!
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Action Button (FAB) - Quick Add */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => setIsQuickAddOpen(true)}
        activeOpacity={0.8}
      >
        <PlusIcon size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Floating AI Assistant Trigger */}
      <TouchableOpacity
        style={[styles.fabAi, { backgroundColor: '#3A2E4C', borderColor: '#D2A8FF' }]}
        onPress={() => setIsAiChatOpen(true)}
        activeOpacity={0.8}
      >
        <AiSparkleIcon size={22} color="#D2A8FF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dbHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  dbHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dbTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalSumText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabAi: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
