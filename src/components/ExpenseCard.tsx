import React from 'react';
import { ExpenseItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { PiggyBank, ArrowDownRight, ArrowUpRight } from 'lucide-react';

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

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ item, onPress }) => {
  const { currency, hideBalances, setSelectedExpenseForEdit } = useExpenses();

  const isSaving = item.type === 'SAVING' || item.categoryId.startsWith('cat-saving');
  const isIncome = item.type === 'INCOME' || item.categoryId === 'cat-income';

  // Category Color Map (Soft Muted iOS Pastels)
  const getCategoryTheme = () => {
    if (isSaving) return { color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)', border: 'rgba(48, 209, 88, 0.25)' };
    if (isIncome) return { color: '#4A99E9', bg: 'rgba(74, 153, 233, 0.15)', border: 'rgba(74, 153, 233, 0.25)' };
    switch (item.categoryName.toLowerCase()) {
      case 'food': return { color: '#F3A85B', bg: 'rgba(243, 168, 91, 0.15)', border: 'rgba(243, 168, 91, 0.25)' };
      case 'drink': case 'coffee': return { color: '#ED6C6C', bg: 'rgba(237, 108, 108, 0.15)', border: 'rgba(237, 108, 108, 0.25)' };
      case 'transport': return { color: '#4A99E9', bg: 'rgba(74, 153, 233, 0.15)', border: 'rgba(74, 153, 233, 0.25)' };
      case 'groceries': return { color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)', border: 'rgba(48, 209, 88, 0.25)' };
      case 'bills': return { color: '#EC668C', bg: 'rgba(236, 102, 140, 0.15)', border: 'rgba(236, 102, 140, 0.25)' };
      case 'shopping': case 'party': return { color: '#EC668C', bg: 'rgba(236, 102, 140, 0.15)', border: 'rgba(236, 102, 140, 0.25)' };
      case 'fun': case 'team': return { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.25)' };
      default: return { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.25)' };
    }
  };

  const theme = getCategoryTheme();

  const formattedMain = formatCurrency(item.amount, currency);
  const secondaryCurrency = currency === 'USD' ? 'KHR' : 'USD';
  const secondaryVal = formatCurrency(item.amount, secondaryCurrency);

  return (
    <div
      className="glass-panel"
      onClick={onPress || (() => setSelectedExpenseForEdit(item))}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        marginBottom: '10px',
        borderRadius: '18px',
        cursor: 'pointer',
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
        borderColor: 'var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {/* Rounded Square Icon Badge */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.color,
            flexShrink: 0,
          }}
        >
          {isSaving ? <PiggyBank size={20} color={theme.color} /> : <CategoryIconRenderer icon={item.categoryIcon || 'receipt-outline'} size={20} color={theme.color} />}
        </div>

        {/* Clean Info Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.2px',
              marginBottom: '4px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </h4>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.categoryName} &nbsp; {item.paymentMethod} &nbsp; {formatDateStr(item.date)}
          </div>
        </div>
      </div>

      {/* Right Price Column with Privacy Blur Filter */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingLeft: '10px' }}>
        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '-0.2px',
              color: isSaving || isIncome ? '#30D158' : '#FF5B5B',
            }}
          >
            {isSaving ? `+${formattedMain}` : isIncome ? `+${formattedMain}` : `-${formattedMain}`}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '2px',
              fontWeight: 500,
            }}
          >
            {secondaryVal}
          </div>
        </div>
      </div>
    </div>
  );
};
