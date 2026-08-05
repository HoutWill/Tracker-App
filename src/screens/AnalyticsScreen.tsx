import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { PieChart, TrendingUp } from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { expenses, categories, currency, hideBalances } = useExpenses();

  const totalUSD = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown = categories.map(cat => {
    const catExpenses = expenses.filter(e => e.categoryId === cat.id);
    const sumUSD = catExpenses.reduce((s, e) => s + e.amount, 0);
    const percentage = totalUSD > 0 ? Math.round((sumUSD / totalUSD) * 100) : 0;

    return {
      ...cat,
      totalUSD: sumUSD,
      count: catExpenses.length,
      percentage,
    };
  }).filter(c => c.totalUSD > 0).sort((a, b) => b.totalUSD - a.totalUSD);

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <PieChart size={20} color="var(--accent)" />
        <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Spending Analytics</h2>
      </div>

      {/* Summary Card */}
      <div className="glass-panel" style={{ padding: '18px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Tracked Expense</div>
        <div className="tabular-nums" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 12px 0' }}>
          {hideBalances ? '••••' : formatCurrency(totalUSD, currency)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} color="var(--accent-success)" />
          <span>Across {categoryBreakdown.length} active spending categories</span>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>Category Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categoryBreakdown.length > 0 ? (
          categoryBreakdown.map(cat => (
            <div key={cat.id} className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(46, 170, 220, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <CategoryIconRenderer icon={cat.icon} size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{cat.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{cat.count} entries</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800 }}>
                    {hideBalances ? '••••' : formatCurrency(cat.totalUSD, currency)}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>{cat.percentage}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${cat.percentage}%`,
                    backgroundColor: 'var(--accent)',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No expense analytics data available.
          </div>
        )}
      </div>
    </div>
  );
};
