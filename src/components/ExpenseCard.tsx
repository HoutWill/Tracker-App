import React from 'react';
import { ExpenseItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, KHR_PER_USD } from '../services/storageService';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { PiggyBank } from 'lucide-react';

interface ExpenseCardProps {
  item: ExpenseItem;
  onPress?: () => void;
}

const formatDateStr = (dateStr: string) => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return `${d} ${dateObj.toLocaleString('en-US', { month: 'short' })} ${y}`;
  } catch (e) {
    return dateStr;
  }
};

const formatSecondaryVal = (amountUSD: number, primaryCurrency: string) => {
  if (primaryCurrency === 'USD') {
    const khrVal = Math.round(amountUSD * KHR_PER_USD);
    return `៛${khrVal.toLocaleString()}`;
  } else {
    return `$${amountUSD.toFixed(2)}`;
  }
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ item, onPress }) => {
  const { currency, hideBalances, setSelectedExpenseForEdit } = useExpenses();

  const isSaving = item.type === 'SAVING' || item.categoryId.startsWith('cat-saving');
  const isIncome = item.type === 'INCOME' || item.categoryId === 'cat-income';

  // Soft Pastel Light Badge Theme matching screenshot
  const getCategoryTheme = () => {
    if (isSaving) return { color: '#30D158', bg: '#F0FDF4' };
    if (isIncome) return { color: '#4A99E9', bg: '#F0F6FF' };
    switch ((item.categoryName || '').toLowerCase()) {
      case 'food':
        return { color: '#F3A85B', bg: '#FFF5EB' };
      case 'drink':
      case 'coffee':
        return { color: '#ED6C6C', bg: '#FFF0F0' };
      case 'transport':
        return { color: '#4A99E9', bg: '#F0F6FF' };
      case 'groceries':
        return { color: '#30D158', bg: '#F0FDF4' };
      case 'bills':
      case 'shopping':
      case 'party':
        return { color: '#EC668C', bg: '#FFF0F5' };
      case 'fun':
      case 'team':
        return { color: '#A78BFA', bg: '#F5F3FF' };
      default:
        return { color: '#F3A85B', bg: '#FFF5EB' };
    }
  };

  const theme = getCategoryTheme();

  const formattedMain = formatCurrency(item.amount, currency);
  const secondaryFormatted = formatSecondaryVal(item.amount, currency);

  return (
    <div
      className="glass-panel"
      onClick={onPress || (() => setSelectedExpenseForEdit(item))}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        marginBottom: '10px',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
        border: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {/* Soft Cream/Pastel Icon Badge matching user screenshot */}
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: theme.bg,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.color,
            flexShrink: 0,
          }}
        >
          {isSaving ? (
            <PiggyBank size={22} color={theme.color} />
          ) : (
            <CategoryIconRenderer icon={item.categoryIcon || 'receipt-outline'} size={22} color={theme.color} />
          )}
        </div>

        {/* Clean Info Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '-0.2px',
              margin: '0 0 3px 0',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.25',
            }}
          >
            {item.title || item.categoryName}
          </h4>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.paymentMethod || 'Cash'} • {formatDateStr(item.date)}
          </div>
        </div>
      </div>

      {/* Right Price Column matching user screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingLeft: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: isSaving || isIncome ? '#30D158' : '#FF5B5B',
            }}
          >
            {hideBalances
              ? '••••'
              : isSaving
              ? `+${formattedMain}`
              : isIncome
              ? `+${formattedMain}`
              : `-${formattedMain}`}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginTop: '2px',
              fontWeight: 500,
            }}
          >
            {hideBalances ? '••••' : secondaryFormatted}
          </div>
        </div>
      </div>
    </div>
  );
};
