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

  // Strict Color Directives: Expense = RED, Saving = GREEN, Income = GREEN
  const itemColor = isSaving || isIncome ? 'var(--accent-success)' : 'var(--accent-danger)';
  const itemBg = isSaving || isIncome ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 82, 82, 0.12)';
  const itemBorder = isSaving || isIncome ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 82, 82, 0.3)';

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
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        borderColor: 'var(--border-glass)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Category Icon Container (Clean Neutral Glass Container) */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            backgroundColor: 'var(--pill-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            flexShrink: 0,
          }}
        >
          {isSaving ? <PiggyBank size={18} /> : <CategoryIconRenderer icon={item.categoryIcon || 'receipt-outline'} size={18} color="var(--text-primary)" />}
        </div>

        {/* Info Column (Standard Text Primary Color) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '14px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Category Name Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-glass)',
              }}
            >
              <CategoryIconRenderer icon={item.categoryIcon || 'receipt'} size={11} color="var(--text-secondary)" />
              {item.categoryName}
            </span>

            {/* Type Badge: Expense = Red, Saving = Green */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: itemBg,
                color: itemColor,
                border: `1px solid ${itemBorder}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {isSaving ? (
                <>
                  <PiggyBank size={10} /> Saving
                </>
              ) : isIncome ? (
                <>
                  <ArrowUpRight size={10} /> Income
                </>
              ) : (
                <>
                  <ArrowDownRight size={10} /> Expense
                </>
              )}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-secondary)',
              }}
            >
              {item.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Right Price Column */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: itemColor,
            }}
          >
            {isSaving ? `+${formattedMain}` : isIncome ? `+${formattedMain}` : formattedMain}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {secondaryVal} • {item.date}
          </div>
        </div>
      </div>
    </div>
  );
};
