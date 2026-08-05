import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExpenseItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, convertCurrency } from '../services/storageService';
import { CategoryBadge } from './CategoryBadge';

interface ExpenseCardProps {
  item: ExpenseItem;
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ item, onPress }) => {
  const { theme } = useTheme();
  const { currency } = useExpenses();

  const formattedMain = formatCurrency(item.amount, currency);
  const secondaryCurrency = currency === 'USD' ? 'KHR' : 'USD';
  const secondaryVal = formatCurrency(item.amount, secondaryCurrency);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftCol}>
        {/* Emoji Block Icon */}
        <View style={[styles.iconBox, { backgroundColor: theme.bgMain }]}>
          <Text style={styles.emojiText}>{item.categoryIcon || '💸'}</Text>
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.propsRow}>
            {/* Category Property Pill */}
            <CategoryBadge
              name={item.categoryName}
              color={item.categoryColor}
              size="sm"
            />

            {/* Payment Method Badge */}
            <View style={[styles.paymentPill, { backgroundColor: theme.bgHover }]}>
              <Text style={[styles.paymentText, { color: theme.textSecondary }]}>
                {item.paymentMethod}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right Price Column */}
      <View style={styles.rightCol}>
        <Text style={[styles.mainPrice, { color: theme.textPrimary }]}>
          {formattedMain}
        </Text>
        <Text style={[styles.secondaryPrice, { color: theme.textMuted }]}>
          {secondaryVal}
        </Text>
        <Text style={[styles.dateText, { color: theme.textMuted }]}>
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  propsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  paymentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  mainPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryPrice: {
    fontSize: 11,
    marginTop: 1,
  },
  dateText: {
    fontSize: 10,
    marginTop: 2,
  },
});
