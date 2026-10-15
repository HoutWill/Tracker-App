import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { formatCurrency, getTodayDateString, SHORT_MONTH_NAMES } from '../services/storageService';
import {
  PieChart,
  ArrowDownRight,
  PiggyBank,
  Layers,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  ChevronDown,
  TrendingUp,
  Award,
  Calendar,
  Zap,
  Search,
} from 'lucide-react';
import { ExpenseItem } from '../types';

type StatsTab = 'EXPENSE' | 'SAVING' | 'ALL';
type StatsScope = 'MONTH' | 'ALL';

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const StatsScreen: React.FC = () => {
  const { expenses, currency, setSelectedExpenseForEdit } = useExpenses();
  const [activeTab, setActiveTab] = useState<StatsTab>('EXPENSE');
  const [scope, setScope] = useState<StatsScope>('MONTH');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  // Month navigation window offset (0 = current 6 months ending this month)
  const [windowOffset, setWindowOffset] = useState<number>(0);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(5);

  const todayStr = getTodayDateString();
  const currentMonthStr = todayStr.slice(0, 7);
  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const todayDate = new Date(tY, tM - 1, tD);

  // Separate Expenses & Savings
  const allExpenseItems = useMemo(
    () => expenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income')),
    [expenses]
  );
  const allSavingItems = useMemo(
    () => expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving')),
    [expenses]
  );

  // 6-Month Rolling Window Calculation for Bar Chart
  const barChartData = useMemo(() => {
    const endMonthOffset = windowOffset * 6;
    const targetEndDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + endMonthOffset, 1);

    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(targetEndDate.getFullYear(), targetEndDate.getMonth() - (5 - i), 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const moStr = (mo + 1).toString().padStart(2, '0');
      const prefix = `${yr}-${moStr}`;
      const daysInMonth = new Date(yr, mo + 1, 0).getDate();

      const expSum = allExpenseItems.filter(e => e.date.startsWith(prefix)).reduce((sum, e) => sum + e.amount, 0);
      const savSum = allSavingItems.filter(e => e.date.startsWith(prefix)).reduce((sum, e) => sum + e.amount, 0);

      return {
        name: SHORT_MONTH_NAMES[mo],
        fullName: `${FULL_MONTH_NAMES[mo]} ${yr}`,
        prefix,
        yr,
        mo,
        daysInMonth,
        expSum,
        savSum,
        idx: i,
      };
    });
  }, [allExpenseItems, allSavingItems, windowOffset, todayDate]);

  const activeMonthData = barChartData[selectedMonthIdx] || barChartData[5];

  // Filter Items Based on Active Scope ('MONTH' vs 'ALL')
  const scopedExpenseItems = useMemo(() => {
    if (scope === 'MONTH') {
      return allExpenseItems.filter(e => e.date.startsWith(activeMonthData.prefix));
    }
    return allExpenseItems;
  }, [allExpenseItems, scope, activeMonthData.prefix]);

  const scopedSavingItems = useMemo(() => {
    if (scope === 'MONTH') {
      return allSavingItems.filter(e => e.date.startsWith(activeMonthData.prefix));
    }
    return allSavingItems;
  }, [allSavingItems, scope, activeMonthData.prefix]);

  // Aggregate Key Statistics
  const totalExpenseUSD = useMemo(
    () => scopedExpenseItems.reduce((sum, e) => sum + e.amount, 0),
    [scopedExpenseItems]
  );
  const totalSavingUSD = useMemo(
    () => scopedSavingItems.reduce((sum, e) => sum + e.amount, 0),
    [scopedSavingItems]
  );
  const netBalanceUSD = totalSavingUSD - totalExpenseUSD;

  // Daily Average Spend Calculation
  const dailyAverageExpenseUSD = useMemo(() => {
    if (totalExpenseUSD === 0) return 0;
    if (scope === 'MONTH') {
      const isCurrentMonth = activeMonthData.prefix === currentMonthStr;
      const days = isCurrentMonth ? Math.max(1, tD) : activeMonthData.daysInMonth;
      return totalExpenseUSD / days;
    }
    // For ALL scope, calculate days across all transactions (min 30)
    if (allExpenseItems.length === 0) return 0;
    const timestamps = allExpenseItems.map(e => new Date(e.date).getTime()).filter(t => !isNaN(t));
    if (timestamps.length === 0) return totalExpenseUSD / 30;
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps, Date.now());
    const daysPassed = Math.max(30, Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24)));
    return totalExpenseUSD / daysPassed;
  }, [totalExpenseUSD, scope, activeMonthData, currentMonthStr, tD, allExpenseItems]);

  // Peak Single Transaction in Scoped Selection
  const peakExpenseItem = useMemo(() => {
    if (scopedExpenseItems.length === 0) return null;
    return scopedExpenseItems.reduce((max, e) => (e.amount > max.amount ? e : max), scopedExpenseItems[0]);
  }, [scopedExpenseItems]);

  const peakSavingItem = useMemo(() => {
    if (scopedSavingItems.length === 0) return null;
    return scopedSavingItems.reduce((max, e) => (e.amount > max.amount ? e : max), scopedSavingItems[0]);
  }, [scopedSavingItems]);

  // Average per Saving Entry
  const avgSavingEntryUSD = useMemo(() => {
    if (scopedSavingItems.length === 0) return 0;
    return totalSavingUSD / scopedSavingItems.length;
  }, [totalSavingUSD, scopedSavingItems]);

  // Savings Rate %
  const savingsRatePct = useMemo(() => {
    const totalCashflow = totalExpenseUSD + totalSavingUSD;
    if (totalCashflow === 0) return 0;
    return Math.round((totalSavingUSD / totalCashflow) * 100);
  }, [totalExpenseUSD, totalSavingUSD]);

  // Category Breakdown for Expenses
  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: string; sum: number; count: number; items: ExpenseItem[] }>();
    scopedExpenseItems.forEach(item => {
      const key = item.categoryName || item.title || 'General';
      const icon = item.categoryIcon || 'receipt-outline';
      const existing = map.get(key);
      if (existing) {
        existing.sum += item.amount;
        existing.count += 1;
        existing.items.push(item);
      } else {
        map.set(key, {
          id: item.categoryId || key,
          name: key,
          icon,
          sum: item.amount,
          count: 1,
          items: [item],
        });
      }
    });

    return Array.from(map.values())
      .map(group => ({
        ...group,
        pct: totalExpenseUSD > 0 ? Math.round((group.sum / totalExpenseUSD) * 100) : 0,
      }))
      .sort((a, b) => b.sum - a.sum);
  }, [scopedExpenseItems, totalExpenseUSD]);

  // Category Breakdown for Savings
  const savingBreakdown = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: string; sum: number; count: number; items: ExpenseItem[] }>();
    scopedSavingItems.forEach(item => {
      const key = item.categoryName || item.title || 'Vault';
      const icon = item.categoryIcon || 'piggy-bank';
      const existing = map.get(key);
      if (existing) {
        existing.sum += item.amount;
        existing.count += 1;
        existing.items.push(item);
      } else {
        map.set(key, {
          id: item.categoryId || key,
          name: key,
          icon,
          sum: item.amount,
          count: 1,
          items: [item],
        });
      }
    });

    return Array.from(map.values())
      .map(group => ({
        ...group,
        pct: totalSavingUSD > 0 ? Math.round((group.sum / totalSavingUSD) * 100) : 0,
      }))
      .sort((a, b) => b.sum - a.sum);
  }, [scopedSavingItems, totalSavingUSD]);

  // Filtered Breakdowns for Search Filter
  const filteredExpenseBreakdown = useMemo(() => {
    if (!filterQuery.trim()) return expenseBreakdown;
    const q = filterQuery.toLowerCase();
    return expenseBreakdown.filter(cat => cat.name.toLowerCase().includes(q));
  }, [expenseBreakdown, filterQuery]);

  const filteredSavingBreakdown = useMemo(() => {
    if (!filterQuery.trim()) return savingBreakdown;
    const q = filterQuery.toLowerCase();
    return savingBreakdown.filter(cat => cat.name.toLowerCase().includes(q));
  }, [savingBreakdown, filterQuery]);

  // Bar Chart Max Values for Proportionate Heights
  const maxExpenseBarVal = Math.max(...barChartData.map(b => b.expSum), 100);
  const maxSavingBarVal = Math.max(...barChartData.map(b => b.savSum), 100);
  const maxCombinedBarVal = Math.max(...barChartData.map(b => Math.max(b.expSum, b.savSum)), 100);

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* 1. Main Mode Switcher: Expenses vs Savings vs All */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '16px',
          marginBottom: '12px',
          backgroundColor: 'var(--pill-bg)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        }}
      >
        {[
          { id: 'EXPENSE', label: 'Expenses', icon: ArrowDownRight, color: '#4A99E9' },
          { id: 'SAVING', label: 'Savings', icon: PiggyBank, color: '#30D158' },
          { id: 'ALL', label: 'All', icon: Layers, color: '#48484A' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as StatsTab);
                setExpandedCatId(null);
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 6px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isActive ? tab.color : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Interactive 6-Month Overview Bar Chart */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          borderRadius: '20px',
          marginBottom: '14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Chart Header & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: activeTab === 'EXPENSE' ? 'rgba(74, 153, 233, 0.15)' : activeTab === 'SAVING' ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'EXPENSE' ? '#4A99E9' : activeTab === 'SAVING' ? '#30D158' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart2 size={16} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.2px' }}>Overview</h3>
          </div>

          {/* Month Window Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setWindowOffset(prev => prev - 1)}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Previous"
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', padding: '0 4px' }}>
              {barChartData[0].name} - {barChartData[5].name}
            </span>
            <button
              onClick={() => setWindowOffset(prev => Math.min(0, prev + 1))}
              disabled={windowOffset >= 0}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: windowOffset >= 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                opacity: windowOffset >= 0 ? 0.35 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: windowOffset >= 0 ? 'default' : 'pointer',
              }}
              title="Next"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Selected Month Tooltip Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            marginBottom: '14px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {activeMonthData.fullName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab === 'EXPENSE' && (
              <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 900, color: '#4A99E9' }}>
                {formatCurrency(activeMonthData.expSum, currency)}
              </span>
            )}
            {activeTab === 'SAVING' && (
              <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 900, color: '#30D158' }}>
                {formatCurrency(activeMonthData.savSum, currency)}
              </span>
            )}
            {activeTab === 'ALL' && (
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 800 }} className="tabular-nums">
                <span style={{ color: '#4A99E9' }}>-{formatCurrency(activeMonthData.expSum, currency)}</span>
                <span style={{ color: '#30D158' }}>+{formatCurrency(activeMonthData.savSum, currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: '110px',
            padding: '0 4px',
            paddingBottom: '22px',
          }}
        >
          {/* Subtle Grid Lines */}
          <div style={{ position: 'absolute', inset: 0, bottom: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.1 }}>
            <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
            <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
            <div style={{ borderTop: '1px dashed var(--text-muted)' }} />
          </div>

          {barChartData.map((bar, idx) => {
            const isSelected = selectedMonthIdx === idx;
            const expHeight = Math.max(8, Math.round((bar.expSum / (activeTab === 'ALL' ? maxCombinedBarVal : maxExpenseBarVal)) * 100));
            const savHeight = Math.max(8, Math.round((bar.savSum / (activeTab === 'ALL' ? maxCombinedBarVal : maxSavingBarVal)) * 100));

            return (
              <div
                key={bar.prefix}
                onClick={() => setSelectedMonthIdx(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1,
                  cursor: 'pointer',
                  padding: '4px 2px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '75px', width: '100%', justifyContent: 'center' }}>
                  {(activeTab === 'EXPENSE' || activeTab === 'ALL') && (
                    <div
                      style={{
                        width: activeTab === 'ALL' ? '7px' : '14px',
                        height: `${expHeight}%`,
                        backgroundColor: isSelected ? '#4A99E9' : 'rgba(74, 153, 233, 0.35)',
                        borderRadius: '3px 3px 1px 1px',
                        transition: 'height 0.2s ease, background-color 0.15s ease',
                      }}
                    />
                  )}
                  {(activeTab === 'SAVING' || activeTab === 'ALL') && (
                    <div
                      style={{
                        width: activeTab === 'ALL' ? '7px' : '14px',
                        height: `${savHeight}%`,
                        backgroundColor: isSelected ? '#30D158' : 'rgba(48, 209, 88, 0.35)',
                        borderRadius: '3px 3px 1px 1px',
                        transition: 'height 0.2s ease, background-color 0.15s ease',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: isSelected ? 800 : 500,
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

      {/* 3. Scope Switcher Pill Bar (Month vs All) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '0 2px',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
          {scope === 'MONTH' ? activeMonthData.name : 'All'}
        </span>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '2px',
          }}
        >
          <button
            onClick={() => setScope('MONTH')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: scope === 'MONTH' ? 'var(--accent)' : 'transparent',
              color: scope === 'MONTH' ? '#FFFFFF' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Month
          </button>
          <button
            onClick={() => setScope('ALL')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: scope === 'ALL' ? 'var(--accent)' : 'transparent',
              color: scope === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All
          </button>
        </div>
      </div>

      {/* 4. iOS 18 Muted Pastel Bento Grid (2x2) */}
      {activeTab === 'EXPENSE' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {/* Bento 1: Total Spend */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(74, 153, 233, 0.15)',
                  color: '#4A99E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDownRight size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#4A99E9', backgroundColor: 'rgba(74, 153, 233, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Spend
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {formatCurrency(totalExpenseUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Total
              </div>
            </div>
          </div>

          {/* Bento 2: Daily Average */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(243, 168, 91, 0.15)',
                  color: '#F3A85B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#F3A85B', backgroundColor: 'rgba(243, 168, 91, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Pacing
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {formatCurrency(dailyAverageExpenseUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Daily
              </div>
            </div>
          </div>

          {/* Bento 3: Peak Single Spend */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(236, 102, 140, 0.15)',
                  color: '#EC668C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#EC668C', backgroundColor: 'rgba(236, 102, 140, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Highest
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {peakExpenseItem ? formatCurrency(peakExpenseItem.amount, currency) : formatCurrency(0, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {peakExpenseItem?.categoryName || 'Peak'}
              </div>
            </div>
          </div>

          {/* Bento 4: Transaction Count */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(108, 123, 138, 0.15)',
                  color: '#6C7B8A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#6C7B8A', backgroundColor: 'rgba(108, 123, 138, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Volume
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {scopedExpenseItems.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Entries
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SAVING' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {/* Bento 1: Vault Total */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(48, 209, 88, 0.15)',
                  color: '#30D158',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PiggyBank size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#30D158', backgroundColor: 'rgba(48, 209, 88, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Saved
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: '#30D158', lineHeight: 1.1 }}>
                {formatCurrency(totalSavingUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Vault
              </div>
            </div>
          </div>

          {/* Bento 2: Average Deposit */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(243, 168, 91, 0.15)',
                  color: '#F3A85B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#F3A85B', backgroundColor: 'rgba(243, 168, 91, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Deposit
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {formatCurrency(avgSavingEntryUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Average
              </div>
            </div>
          </div>

          {/* Bento 3: Savings Rate */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(74, 153, 233, 0.15)',
                  color: '#4A99E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#4A99E9', backgroundColor: 'rgba(74, 153, 233, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Growth
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {savingsRatePct}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Rate
              </div>
            </div>
          </div>

          {/* Bento 4: Entries Count */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(108, 123, 138, 0.15)',
                  color: '#6C7B8A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#6C7B8A', backgroundColor: 'rgba(108, 123, 138, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Volume
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {scopedSavingItems.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Entries
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ALL' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {/* Bento 1: Expenses */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(74, 153, 233, 0.15)',
                  color: '#4A99E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDownRight size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#4A99E9', backgroundColor: 'rgba(74, 153, 233, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Out
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {formatCurrency(totalExpenseUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Expenses
              </div>
            </div>
          </div>

          {/* Bento 2: Savings */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(48, 209, 88, 0.15)',
                  color: '#30D158',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PiggyBank size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#30D158', backgroundColor: 'rgba(48, 209, 88, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                In
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: '#30D158', lineHeight: 1.1 }}>
                {formatCurrency(totalSavingUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Savings
              </div>
            </div>
          </div>

          {/* Bento 3: Net Cashflow */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: netBalanceUSD >= 0 ? 'rgba(48, 209, 88, 0.15)' : 'rgba(237, 108, 108, 0.15)',
                  color: netBalanceUSD >= 0 ? '#30D158' : '#ED6C6C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={16} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: netBalanceUSD >= 0 ? '#30D158' : '#ED6C6C',
                  backgroundColor: netBalanceUSD >= 0 ? 'rgba(48, 209, 88, 0.12)' : 'rgba(237, 108, 108, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                Cashflow
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div
                className="tabular-nums"
                style={{
                  fontSize: '19px',
                  fontWeight: 900,
                  color: netBalanceUSD >= 0 ? '#30D158' : '#ED6C6C',
                  lineHeight: 1.1,
                }}
              >
                {(netBalanceUSD >= 0 ? '+' : '') + formatCurrency(netBalanceUSD, currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Net
              </div>
            </div>
          </div>

          {/* Bento 4: Savings Rate */}
          <div
            className="glass-panel"
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(243, 168, 91, 0.15)',
                  color: '#F3A85B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#F3A85B', backgroundColor: 'rgba(243, 168, 91, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                Growth
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {savingsRatePct}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                Rate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Category Breakdown with Filter & Tap-to-Drill-Down */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          borderRadius: '20px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Breakdown Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieChart size={16} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.2px' }}>Breakdown</h3>
          </div>

          {/* Quick Filter Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              width: '110px',
            }}
          >
            <Search size={12} color="var(--text-muted)" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeTab === 'EXPENSE' && (
            filteredExpenseBreakdown.length > 0 ? (
              filteredExpenseBreakdown.map(cat => {
                const isExpanded = expandedCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    style={{
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(74, 153, 233, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CategoryIconRenderer icon={cat.icon} size={16} color="#4A99E9" />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {cat.count}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div>
                          <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {formatCurrency(cat.sum, currency)}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#4A99E9' }}>
                            {cat.pct}%
                          </div>
                        </div>
                        <ChevronDown
                          size={16}
                          color="var(--text-muted)"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '5px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cat.pct}%`, backgroundColor: '#4A99E9', borderRadius: '3px' }} />
                    </div>

                    {/* Expanded Individual Transaction Entries */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
                          Entries
                        </div>
                        {cat.items.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedExpenseForEdit(item)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              cursor: 'pointer',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.title}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {item.date} • {item.paymentMethod || 'Cash'}
                              </div>
                            </div>
                            <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 900, color: '#4A99E9' }}>
                              {formatCurrency(item.amount, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                Empty
              </div>
            )
          )}

          {activeTab === 'SAVING' && (
            filteredSavingBreakdown.length > 0 ? (
              filteredSavingBreakdown.map(cat => {
                const isExpanded = expandedCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    style={{
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(48, 209, 88, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CategoryIconRenderer icon={cat.icon} size={16} color="#30D158" />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {cat.count}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div>
                          <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 900, color: '#30D158' }}>
                            {formatCurrency(cat.sum, currency)}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#30D158' }}>
                            {cat.pct}%
                          </div>
                        </div>
                        <ChevronDown
                          size={16}
                          color="var(--text-muted)"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '5px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cat.pct}%`, backgroundColor: '#30D158', borderRadius: '3px' }} />
                    </div>

                    {/* Expanded Individual Savings Entries */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
                          Entries
                        </div>
                        {cat.items.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedExpenseForEdit(item)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(48, 209, 88, 0.08)',
                              cursor: 'pointer',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.title}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {item.date} • {item.paymentMethod || 'Vault'}
                              </div>
                            </div>
                            <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 900, color: '#30D158' }}>
                              {formatCurrency(item.amount, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                Empty
              </div>
            )
          )}

          {activeTab === 'ALL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Expenses Breakdown Section */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#4A99E9', marginBottom: '8px', letterSpacing: '0.3px' }}>
                  Expenses
                </div>
                {filteredExpenseBreakdown.length > 0 ? (
                  filteredExpenseBreakdown.map(cat => (
                    <div
                      key={cat.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-glass)',
                        marginBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CategoryIconRenderer icon={cat.icon} size={15} color="#4A99E9" />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({cat.count})</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCurrency(cat.sum, currency)}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#4A99E9', marginLeft: '6px' }}>
                          {cat.pct}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0' }}>Empty</div>
                )}
              </div>

              {/* Savings Breakdown Section */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#30D158', marginBottom: '8px', letterSpacing: '0.3px' }}>
                  Savings
                </div>
                {filteredSavingBreakdown.length > 0 ? (
                  filteredSavingBreakdown.map(cat => (
                    <div
                      key={cat.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-glass)',
                        marginBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CategoryIconRenderer icon={cat.icon} size={15} color="#30D158" />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({cat.count})</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: '#30D158' }}>
                          {formatCurrency(cat.sum, currency)}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#30D158', marginLeft: '6px' }}>
                          {cat.pct}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0' }}>Empty</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
