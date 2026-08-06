import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { formatCurrency } from '../services/storageService';
import { PieChart, ArrowDownRight, PiggyBank, Layers, Award, ChevronLeft, ChevronRight, BarChart2, ChevronDown, Wallet } from 'lucide-react';

type StatsTab = 'EXPENSE' | 'SAVING' | 'ALL';

export const StatsScreen: React.FC = () => {
  const { expenses, currency, hideBalances, setSelectedExpenseForEdit } = useExpenses();
  const [activeTab, setActiveTab] = useState<StatsTab>('EXPENSE');
  const [expandedExpenseCatId, setExpandedExpenseCatId] = useState<string | null>(null);
  const [expandedSavingCatId, setExpandedSavingCatId] = useState<string | null>(null);

  // Month navigation window offset (0 = current 6 months ending this month)
  const [windowOffset, setWindowOffset] = useState<number>(0);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(5);

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const currentMonthStr = todayDate.toISOString().slice(0, 7);

  const expenseItems = expenses.filter(
    e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income')
  );
  const savingItems = expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const todayExpenseUSD = expenseItems.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
  const monthExpenseUSD = expenseItems.filter(e => e.date.startsWith(currentMonthStr)).reduce((sum, e) => sum + e.amount, 0);
  const totalExpenseUSD = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const totalSavingUSD = savingItems.reduce((sum, e) => sum + e.amount, 0);
  const netBalanceUSD = totalSavingUSD - totalExpenseUSD;

  // Dynamic Expense Category Breakdown
  const expenseGroupMap = new Map<string, { id: string; name: string; icon: string; sum: number; count: number; items: typeof expenseItems }>();
  expenseItems.forEach(item => {
    const key = item.categoryName || item.title || 'General';
    const icon = item.categoryIcon || 'receipt-outline';
    const existing = expenseGroupMap.get(key);
    if (existing) {
      existing.sum += item.amount;
      existing.count += 1;
      existing.items.push(item);
    } else {
      expenseGroupMap.set(key, {
        id: item.categoryId || key,
        name: key,
        icon,
        sum: item.amount,
        count: 1,
        items: [item],
      });
    }
  });

  const expenseBreakdown = Array.from(expenseGroupMap.values())
    .map(group => ({
      ...group,
      pct: totalExpenseUSD > 0 ? Math.round((group.sum / totalExpenseUSD) * 100) : 0,
    }))
    .sort((a, b) => b.sum - a.sum);

  // Dynamic Savings Category Breakdown
  const savingGroupMap = new Map<string, { id: string; name: string; icon: string; sum: number; count: number; items: typeof savingItems }>();
  savingItems.forEach(item => {
    const key = item.categoryName || item.title || 'Vault';
    const icon = item.categoryIcon || 'piggy-bank';
    const existing = savingGroupMap.get(key);
    if (existing) {
      existing.sum += item.amount;
      existing.count += 1;
      existing.items.push(item);
    } else {
      savingGroupMap.set(key, {
        id: item.categoryId || key,
        name: key,
        icon,
        sum: item.amount,
        count: 1,
        items: [item],
      });
    }
  });

  const savingBreakdown = Array.from(savingGroupMap.values())
    .map(group => ({
      ...group,
      pct: totalSavingUSD > 0 ? Math.round((group.sum / totalSavingUSD) * 100) : 0,
    }))
    .sort((a, b) => b.sum - a.sum);

  const topExpenseCategory = expenseBreakdown[0];
  const topSavingCategory = savingBreakdown[0];

  // Dynamic 6-Month Rolling Window Calculation
  const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const FULL_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const endMonthOffset = windowOffset * 6;
  const targetEndDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + endMonthOffset, 1);

  const barChartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(targetEndDate.getFullYear(), targetEndDate.getMonth() - (5 - i), 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const moStr = (mo + 1).toString().padStart(2, '0');
    const prefix = `${yr}-${moStr}`;

    const expSum = expenseItems.filter(e => e.date.startsWith(prefix)).reduce((sum, e) => sum + e.amount, 0);
    const savSum = savingItems.filter(e => e.date.startsWith(prefix)).reduce((sum, e) => sum + e.amount, 0);

    return {
      name: SHORT_MONTH_NAMES[mo],
      fullName: `${FULL_MONTH_NAMES[mo]} ${yr}`,
      prefix,
      expSum,
      savSum,
      idx: i,
    };
  });

  const maxExpenseBarVal = Math.max(...barChartData.map(b => b.expSum), 100);
  const maxSavingBarVal = Math.max(...barChartData.map(b => b.savSum), 100);
  const maxCombinedBarVal = Math.max(...barChartData.map(b => Math.max(b.expSum, b.savSum)), 100);

  const activeMonthData = barChartData[selectedMonthIdx] || barChartData[5];

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Segmented Mode Switcher: Expenses vs Savings vs All */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '16px',
          gap: '4px',
        }}
      >
        {[
          { id: 'EXPENSE', label: 'Expenses', icon: ArrowDownRight },
          { id: 'SAVING', label: 'Savings', icon: PiggyBank },
          { id: 'ALL', label: 'All', icon: Layers },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StatsTab)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 6px',
                borderRadius: '10px',
                border: isActive
                  ? tab.id === 'SAVING'
                    ? '1px solid var(--accent-success)'
                    : tab.id === 'ALL'
                    ? '1px solid #7C4DFF'
                    : '1px solid var(--accent)'
                  : '1px solid transparent',
                backgroundColor: isActive
                  ? tab.id === 'SAVING'
                    ? 'var(--accent-success)'
                    : tab.id === 'ALL'
                    ? '#7C4DFF'
                    : 'var(--accent)'
                  : 'transparent',
                color: isActive ? '#FFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SEPARATE EXPENSES VIEW */}
      {activeTab === 'EXPENSE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Expenses Overview Bar Graph */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            {/* Header & Date Range Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={20} color="var(--accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Overview</h3>
              </div>

              {/* Date Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="glass-pill"
                  onClick={() => setWindowOffset(prev => prev - 1)}
                  style={{ padding: '4px 8px', color: 'var(--text-primary)' }}
                  title="Previous Months"
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
                  {barChartData[0].name} - {barChartData[5].name}
                </span>
                <button
                  className="glass-pill"
                  onClick={() => setWindowOffset(prev => Math.min(0, prev + 1))}
                  disabled={windowOffset >= 0}
                  style={{
                    padding: '4px 8px',
                    color: windowOffset >= 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    opacity: windowOffset >= 0 ? 0.4 : 1,
                  }}
                  title="Next Months"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Selected Month Floating Tooltip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {activeMonthData.fullName}
              </span>
              <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>
                {hideBalances ? '••' : formatCurrency(activeMonthData.expSum, currency)}
              </span>
            </div>

            {/* Pure Expense Bar Chart */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: '130px',
                padding: '0 6px',
                paddingBottom: '24px',
              }}
            >
              {/* Subtle Grid Lines */}
              <div style={{ position: 'absolute', inset: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.15 }}>
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
              </div>

              {barChartData.map((bar, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const expHeightPct = Math.max(10, Math.round((bar.expSum / maxExpenseBarVal) * 100));

                return (
                  <div
                    key={bar.prefix}
                    onClick={() => setSelectedMonthIdx(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '90px', width: '100%', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '18px',
                          height: `${expHeightPct}%`,
                          background: 'linear-gradient(180deg, var(--accent-light) 0%, var(--accent) 100%)',
                          borderRadius: '8px 8px 3px 3px',
                          boxShadow: isSelected ? '0 0 12px var(--accent-glow)' : 'none',
                          transition: 'height 0.3s ease, transform 0.2s ease',
                          transform: isSelected ? 'scaleY(1.05)' : 'scaleY(1)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    >
                      {bar.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sparkline Overview Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Today</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>
                  {hideBalances ? '••' : formatCurrency(todayExpenseUSD, currency)}
                </span>
              </div>
              <div style={{ height: '24px', marginTop: '8px' }}>
                <svg viewBox="0 0 100 24" style={{ width: '100%', height: '100%' }}>
                  <path d="M0,18 C20,10 40,22 60,8 C80,18 90,4 100,12" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Month</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-light)' }}>
                  {hideBalances ? '••' : formatCurrency(monthExpenseUSD, currency)}
                </span>
              </div>
              <div style={{ height: '24px', marginTop: '8px' }}>
                <svg viewBox="0 0 100 24" style={{ width: '100%', height: '100%' }}>
                  <path d="M0,12 C25,20 45,4 70,16 C85,8 95,14 100,6" fill="none" stroke="var(--accent-light)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Top Category Highlight Card */}
          {topExpenseCategory && (
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(108, 92, 231, 0.15)',
                  border: '1px solid rgba(108, 92, 231, 0.3)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Top</div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>{topExpenseCategory.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent)' }}>
                  {hideBalances ? '••••' : formatCurrency(topExpenseCategory.sum, currency)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800 }}>
                  {topExpenseCategory.pct}%
                </div>
              </div>
            </div>
          )}

          {/* Expense Category Breakdown List */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <PieChart size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Breakdown</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {expenseBreakdown.length > 0 ? (
                expenseBreakdown.map(cat => {
                  const isExpanded = expandedExpenseCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <div
                        onClick={() => setExpandedExpenseCatId(isExpanded ? null : cat.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CategoryIconRenderer icon={cat.icon} size={16} color="var(--accent)" />
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({cat.count})</span>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800 }}>
                            {hideBalances ? '••••' : formatCurrency(cat.sum, currency)}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', minWidth: '32px', textAlign: 'right' }}>
                            {cat.pct}%
                          </span>
                          <ChevronDown
                            size={16}
                            color="var(--accent)"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.pct}%`, backgroundColor: 'var(--accent)', borderRadius: '3px' }} />
                      </div>

                      {/* Display Each Data Entry Item Underneath */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>TRANSACTION DATA ENTRIES</div>
                          {cat.items.map(item => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedExpenseForEdit(item)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                cursor: 'pointer',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.date} • {item.paymentMethod || 'Cash'}</div>
                              </div>
                              <span className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)' }}>
                                {hideBalances ? '••' : formatCurrency(item.amount, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SEPARATE SAVINGS VIEW */}
      {activeTab === 'SAVING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Savings Overview Bar Graph */}
          <div className="glass-panel" style={{ padding: '18px', borderColor: 'rgba(0, 230, 118, 0.35)' }}>
            {/* Header & Date Range Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)' }}>
                <BarChart2 size={20} />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Overview</h3>
              </div>

              {/* Date Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="glass-pill"
                  onClick={() => setWindowOffset(prev => prev - 1)}
                  style={{ padding: '4px 8px', color: 'var(--text-primary)' }}
                  title="Previous Months"
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-success)' }}>
                  {barChartData[0].name} - {barChartData[5].name}
                </span>
                <button
                  className="glass-pill"
                  onClick={() => setWindowOffset(prev => Math.min(0, prev + 1))}
                  disabled={windowOffset >= 0}
                  style={{
                    padding: '4px 8px',
                    color: windowOffset >= 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    opacity: windowOffset >= 0 ? 0.4 : 1,
                  }}
                  title="Next Months"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Selected Month Floating Tooltip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid rgba(0, 230, 118, 0.25)',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {activeMonthData.fullName}
              </span>
              <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-success)' }}>
                {hideBalances ? '••' : formatCurrency(activeMonthData.savSum, currency)}
              </span>
            </div>

            {/* Pure Savings Bar Chart */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: '130px',
                padding: '0 6px',
                paddingBottom: '24px',
              }}
            >
              {/* Subtle Grid Lines */}
              <div style={{ position: 'absolute', inset: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.15 }}>
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
              </div>

              {barChartData.map((bar, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const savHeightPct = Math.max(10, Math.round((bar.savSum / maxSavingBarVal) * 100));

                return (
                  <div
                    key={bar.prefix}
                    onClick={() => setSelectedMonthIdx(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(0, 230, 118, 0.15)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '90px', width: '100%', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '18px',
                          height: `${savHeightPct}%`,
                          background: 'linear-gradient(180deg, #69F0AE 0%, var(--accent-success) 100%)',
                          borderRadius: '8px 8px 3px 3px',
                          boxShadow: isSelected ? '0 0 12px rgba(0, 230, 118, 0.4)' : 'none',
                          transition: 'height 0.3s ease, transform 0.2s ease',
                          transform: isSelected ? 'scaleY(1.05)' : 'scaleY(1)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? 'var(--accent-success)' : 'var(--text-muted)',
                      }}
                    >
                      {bar.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Vault Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="glass-panel" style={{ padding: '14px', borderColor: 'rgba(0, 230, 118, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Vault</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-success)' }}>
                  {hideBalances ? '••' : formatCurrency(totalSavingUSD, currency)}
                </span>
              </div>
              <div style={{ height: '24px', marginTop: '8px' }}>
                <svg viewBox="0 0 100 24" style={{ width: '100%', height: '100%' }}>
                  <path d="M0,20 C20,14 40,6 60,12 C80,4 90,16 100,2" fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Entries</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-success)' }}>
                  {savingItems.length}
                </span>
              </div>
              <div style={{ height: '24px', marginTop: '8px' }}>
                <svg viewBox="0 0 100 24" style={{ width: '100%', height: '100%' }}>
                  <path d="M0,10 C30,4 60,18 80,10 C90,12 95,8 100,14" fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Top Savings Bucket Card */}
          {topSavingCategory && (
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'rgba(0, 230, 118, 0.35)' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 230, 118, 0.15)',
                  border: '1px solid rgba(0, 230, 118, 0.35)',
                  color: 'var(--accent-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Top Bucket</div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>{topSavingCategory.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-success)' }}>
                  {hideBalances ? '••••' : formatCurrency(topSavingCategory.sum, currency)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-success)', fontWeight: 800 }}>
                  {topSavingCategory.pct}%
                </div>
              </div>
            </div>
          )}

          {/* Savings Category Breakdown List */}
          <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(0, 230, 118, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-success)' }}>
              <PieChart size={18} />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Breakdown</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {savingBreakdown.length > 0 ? (
                savingBreakdown.map(cat => {
                  const isExpanded = expandedSavingCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 230, 118, 0.04)',
                        border: '1px solid rgba(0, 230, 118, 0.25)',
                      }}
                    >
                      <div
                        onClick={() => setExpandedSavingCatId(isExpanded ? null : cat.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CategoryIconRenderer icon={cat.icon} size={16} color="var(--accent-success)" />
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({cat.count})</span>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-success)' }}>
                            {hideBalances ? '••••' : formatCurrency(cat.sum, currency)}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-success)', minWidth: '32px', textAlign: 'right' }}>
                            {cat.pct}%
                          </span>
                          <ChevronDown
                            size={16}
                            color="var(--accent-success)"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.pct}%`, backgroundColor: 'var(--accent-success)', borderRadius: '3px' }} />
                      </div>

                      {/* Display EACH Individual Savings Data Entry Item */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(0, 230, 118, 0.25)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-success)' }}>SAVINGS DEPOSIT DATA ENTRIES</div>
                          {cat.items.map(item => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedExpenseForEdit(item)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(0, 230, 118, 0.08)',
                                cursor: 'pointer',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.date} • {item.paymentMethod || 'Vault'}</div>
                              </div>
                              <span className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-success)' }}>
                                {hideBalances ? '••' : formatCurrency(item.amount, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPLETE ALL / COMBINED DUAL VIEW (SHOWING ALL STAT CARDS & COMBINED BREAKDOWN) */}
      {activeTab === 'ALL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Dual Overview Bar Chart (Expenses vs Savings Side-by-Side) */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            {/* Header & Date Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={20} color="#7C4DFF" />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Overview</h3>
              </div>

              {/* Date Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="glass-pill"
                  onClick={() => setWindowOffset(prev => prev - 1)}
                  style={{ padding: '4px 8px', color: 'var(--text-primary)' }}
                  title="Previous Months"
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#7C4DFF' }}>
                  {barChartData[0].name} - {barChartData[5].name}
                </span>
                <button
                  className="glass-pill"
                  onClick={() => setWindowOffset(prev => Math.min(0, prev + 1))}
                  disabled={windowOffset >= 0}
                  style={{
                    padding: '4px 8px',
                    color: windowOffset >= 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    opacity: windowOffset >= 0 ? 0.4 : 1,
                  }}
                  title="Next Months"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Selected Month Tooltip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(124, 77, 255, 0.08)',
                border: '1px solid rgba(124, 77, 255, 0.25)',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {activeMonthData.fullName}
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>
                  Exp: {hideBalances ? '••' : formatCurrency(activeMonthData.expSum, currency)}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-success)' }}>
                  Sav: {hideBalances ? '••' : formatCurrency(activeMonthData.savSum, currency)}
                </span>
              </div>
            </div>

            {/* Side-by-Side Dual Bar Chart */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: '130px',
                padding: '0 6px',
                paddingBottom: '24px',
              }}
            >
              {/* Subtle Grid Lines */}
              <div style={{ position: 'absolute', inset: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.15 }}>
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
                <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
              </div>

              {barChartData.map((bar, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const expHeight = Math.max(8, Math.round((bar.expSum / maxCombinedBarVal) * 100));
                const savHeight = Math.max(8, Math.round((bar.savSum / maxCombinedBarVal) * 100));

                return (
                  <div
                    key={bar.prefix}
                    onClick={() => setSelectedMonthIdx(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(124, 77, 255, 0.15)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '90px', width: '100%', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '8px',
                          height: `${expHeight}%`,
                          backgroundColor: 'var(--accent)',
                          borderRadius: '4px 4px 2px 2px',
                        }}
                      />
                      <div
                        style={{
                          width: '8px',
                          height: `${savHeight}%`,
                          backgroundColor: 'var(--accent-success)',
                          borderRadius: '4px 4px 2px 2px',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {bar.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALL Tab Triple Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div className="glass-panel" style={{ padding: '12px 10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Expenses</div>
              <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                {hideBalances ? '••' : formatCurrency(totalExpenseUSD, currency)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 10px', borderColor: 'rgba(0, 230, 118, 0.3)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Savings</div>
              <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-success)', marginTop: '4px' }}>
                {hideBalances ? '••' : formatCurrency(totalSavingUSD, currency)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 10px', borderColor: netBalanceUSD >= 0 ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 82, 82, 0.3)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Net</div>
              <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: netBalanceUSD >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', marginTop: '4px' }}>
                {hideBalances ? '••' : formatCurrency(netBalanceUSD, currency)}
              </div>
            </div>
          </div>

          {/* ALL Tab Combined Breakdown Section */}
          <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(124, 77, 255, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#7C4DFF' }}>
              <PieChart size={18} />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Breakdown</h3>
            </div>

            {/* Expenses Breakdown Subset */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Expenses Categories
              </div>
              {expenseBreakdown.length > 0 ? (
                expenseBreakdown.map(cat => {
                  const isExpanded = expandedExpenseCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(108, 92, 231, 0.05)',
                        border: '1px solid rgba(108, 92, 231, 0.2)',
                      }}
                    >
                      <div
                        onClick={() => setExpandedExpenseCatId(isExpanded ? null : cat.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CategoryIconRenderer icon={cat.icon} size={16} color="var(--accent)" />
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({cat.count})</span>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800 }}>
                            {hideBalances ? '••••' : formatCurrency(cat.sum, currency)}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', minWidth: '32px', textAlign: 'right' }}>
                            {cat.pct}%
                          </span>
                          <ChevronDown
                            size={16}
                            color="var(--accent)"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.pct}%`, backgroundColor: 'var(--accent)', borderRadius: '3px' }} />
                      </div>

                      {/* Display Each Data Entry Item Underneath */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>TRANSACTION DATA ENTRIES</div>
                          {cat.items.map(item => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedExpenseForEdit(item)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                cursor: 'pointer',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.date} • {item.paymentMethod || 'Cash'}</div>
                              </div>
                              <span className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)' }}>
                                {hideBalances ? '••' : formatCurrency(item.amount, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No expense data available</div>
              )}
            </div>

            {/* Savings Breakdown Subset */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Savings Categories
              </div>
              {savingBreakdown.length > 0 ? (
                savingBreakdown.map(cat => {
                  const isExpanded = expandedSavingCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 230, 118, 0.05)',
                        border: '1px solid rgba(0, 230, 118, 0.25)',
                      }}
                    >
                      <div
                        onClick={() => setExpandedSavingCatId(isExpanded ? null : cat.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CategoryIconRenderer icon={cat.icon} size={16} color="var(--accent-success)" />
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({cat.count})</span>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-success)' }}>
                            {hideBalances ? '••••' : formatCurrency(cat.sum, currency)}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-success)', minWidth: '32px', textAlign: 'right' }}>
                            {cat.pct}%
                          </span>
                          <ChevronDown
                            size={16}
                            color="var(--accent-success)"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.pct}%`, backgroundColor: 'var(--accent-success)', borderRadius: '3px' }} />
                      </div>

                      {/* Display EACH Individual Savings Data Entry Item */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(0, 230, 118, 0.25)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-success)' }}>SAVINGS DEPOSIT DATA ENTRIES</div>
                          {cat.items.map(item => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedExpenseForEdit(item)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(0, 230, 118, 0.08)',
                                cursor: 'pointer',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.date} • {item.paymentMethod || 'Vault'}</div>
                              </div>
                              <span className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-success)' }}>
                                {hideBalances ? '••' : formatCurrency(item.amount, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No savings data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
