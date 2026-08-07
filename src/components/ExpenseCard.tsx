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

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ item, onPress }) => {
  const { currency, hideBalances, setSelectedExpenseForEdit } = useExpenses();

  const isSaving = item.type === 'SAVING' || item.categoryId.startsWith('cat-saving');
  const isIncome = item.type === 'INCOME' || item.categoryId === 'cat-income';

  // Category Color Map (Soft Muted iOS Pastels)
  const getCategoryTheme = () => {
    if (isSaving) return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.22)' };
    if (isIncome) return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.22)' };
    switch (item.categoryName.toLowerCase()) {
      case 'food': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.22)' };
      case 'drink': case 'coffee': return { color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', border: 'rgba(217, 119, 6, 0.22)' };
      case 'transport': return { color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.22)' };
      case 'groceries': return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.22)' };
      case 'bills': return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.22)' };
      case 'shopping': case 'party': return { color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.22)' };
      case 'fun': case 'team': return { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.22)' };
      default: return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.22)' };
    }
  };

  const theme = getCategoryTheme();

  const formattedMain = hideBalances
    ? currency === 'USD'
      ? '$ ••••'
      : '៛ ••••'
    : formatCurrency(item.amount, currency);
  const secondaryCurrency = currency === 'USD' ? 'KHR' : 'USD';
  const secondaryVal = hideBalances ? '••••' : formatCurrency(item.amount, secondaryCurrency);

  return (
    <div
      className="glass-panel"
      onClick={onPress || (() => setSelectedExpenseForEdit(item))}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        marginBottom: '10px',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
        borderColor: 'var(--border-glass)',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Category Icon Badge Circle */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.color,
            flexShrink: 0,
            boxShadow: 'none',
          }}
        >
          {isSaving ? <PiggyBank size={20} color={theme.color} /> : <CategoryIconRenderer icon={item.categoryIcon || 'receipt-outline'} size={20} color={theme.color} />}
        </div>

        {/* Info Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '-0.2px',
              marginBottom: '3px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Category Name Pill */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-glass)',
              }}
            >
              {item.categoryName}
            </span>

            {/* Payment Method Badge */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-muted)',
              }}
            >
              {item.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Right Price Column */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingLeft: '8px' }}>
        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '-0.2px',
              color: isSaving || isIncome ? 'var(--accent-success)' : 'var(--accent-danger)',
            }}
          >
            {isSaving ? `+${formattedMain}` : isIncome ? `+${formattedMain}` : `-${formattedMain}`}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
            {secondaryVal} • {item.date}
          </div>
        </div>
      </div>
    </div>
  );
};
