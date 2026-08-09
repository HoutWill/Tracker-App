import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { TripFolderBar } from '../components/TripFolderBar';
import { ArtPresetGrid } from '../components/ArtPresetGrid';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { EXPENSE_QUICK_PRESETS } from '../constants/presets';
import { formatCurrency, StorageService, getTodayDateString, getStartOfWeekDateString, getEndOfWeekDateString } from '../services/storageService';
import { PaymentMethod, QuickPreset, BudgetPeriod } from '../types';
import { Plus, Zap, TrendingUp, Filter, CheckCircle2, Layers, SearchX, X, Check, ArrowDownRight, Trash2, Target, Edit3, CreditCard, PiggyBank, Calendar, ChevronDown, Hash, Award, Eye, EyeOff, Wallet } from 'lucide-react';

const PRESET_ICONS = [
  'receipt', 'laptop', 'coffee', 'utensils', 'car', 'shopping-cart',
  'shopping-bag', 'film', 'gamepad2', 'cpu', 'smartphone', 'home',
  'bus', 'plane', 'zap', 'shirt', 'tv', 'music', 'dumbbell',
  'heart', 'gift', 'book-open', 'scissors', 'wifi', 'camera',
  'flame', 'building', 'credit-card'
];

interface ExpensesScreenProps {
  onSwitchTab?: (tab: 'EXPENSES' | 'SAVINGS') => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ onSwitchTab }) => {
  const { pageColors } = useTheme();
  const pageAccent = pageColors?.EXPENSES || '#6C5CE7';

  const {
    expenses,
    filteredExpenses,
    currency,
    setCurrency,
    categories,
    monthlyBudget,
    setMonthlyBudget,
    budgetTargets,
    setBudgetTarget,
    budgetPeriod,
    setBudgetPeriod,
    cycleHistory,
    archiveCycleSnapshot,
    depositRolloverToSavings,
    hideBalances,
    toggleHideBalances,
    addExpense,
    setIsAddExpenseOpen,
    setSelectedExpenseForEdit,
    selectedTripId,
    trips,
  } = useExpenses();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [presetsList, setPresetsList] = useState<QuickPreset[]>([]);
  const [activePreset, setActivePreset] = useState<QuickPreset | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [presetAmount, setPresetAmount] = useState<string>('');
  const [presetCurrency, setPresetCurrency] = useState<'USD' | 'KHR'>('USD');
  const [presetDate, setPresetDate] = useState<string>(getTodayDateString());

  // Date Check filter state
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Edit Budget Target state
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>(monthlyBudget.toString());
  const [editBudgetPeriod, setEditBudgetPeriod] = useState<BudgetPeriod>(budgetPeriod);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // New Preset Modal state
  const [isCreatingPreset, setIsCreatingPreset] = useState<boolean>(false);
  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [newPresetAmount, setNewPresetAmount] = useState<string>('');
  const [newPresetCurrency, setNewPresetCurrency] = useState<'USD' | 'KHR'>('USD');
  const [newPresetCategory, setNewPresetCategory] = useState<string>('');
  const [newPresetIcon, setNewPresetIcon] = useState<string>('receipt');

  const expenseCategories = categories.filter(c => c.type !== 'SAVING' && c.type !== 'INCOME' && !c.id.startsWith('cat-saving'));

  useEffect(() => {
    const list = StorageService.getPresetsList('EXPENSE', EXPENSE_QUICK_PRESETS);
    setPresetsList(list);
    if (expenseCategories.length > 0) {
      setNewPresetCategory(expenseCategories[0].id);
      setNewPresetIcon(expenseCategories[0].icon || 'receipt');
    }
  }, []);

  // Expenses filter (with optional Check Date filter)
  const rawExpenseItems = expenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));
  const expenseItems = selectedDateFilter
    ? rawExpenseItems.filter(e => e.date === selectedDateFilter)
    : rawExpenseItems;
  const filteredExpenseItems = filteredExpenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));

  const totalExpenseUSD = expenseItems.reduce((sum, e) => sum + e.amount, 0);

  // Reworked Financial Insights:
  // 1. Daily Average across active days
  const uniqueDays = Array.from(new Set(rawExpenseItems.map(e => e.date)));
  const dailyAvgUSD = uniqueDays.length > 0 ? rawExpenseItems.reduce((sum, e) => sum + e.amount, 0) / uniqueDays.length : 0;

  // 2. Total Transactions Count
  const totalTxCount = expenseItems.length;

  // 3. Peak Transaction Amount
  const maxTxUSD = expenseItems.length > 0 ? Math.max(...expenseItems.map(e => e.amount)) : 0;

  // Period Expense Calculation for Multi-Period Budgeting (Daily / Weekly / Monthly)
  const getActivePeriodExpenseUSD = () => {
    const todayStr = getTodayDateString();
    if (budgetPeriod === 'DAILY') {
      return expenseItems.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
    }
    if (budgetPeriod === 'WEEKLY') {
      const startW = getStartOfWeekDateString();
      const endW = getEndOfWeekDateString();
      return expenseItems.filter(e => e.date >= startW && e.date <= endW).reduce((sum, e) => sum + e.amount, 0);
    }
    const monthPrefix = todayStr.substring(0, 7);
    return expenseItems.filter(e => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0);
  };

  const activePeriodExpenseUSD = getActivePeriodExpenseUSD();
  const currentBudget = monthlyBudget || (budgetPeriod === 'DAILY' ? 35 : budgetPeriod === 'WEEKLY' ? 250 : 1000);
  const remainingBudgetUSD = Math.max(0, currentBudget - activePeriodExpenseUSD);
  const budgetProgress = Math.min(100, Math.round((activePeriodExpenseUSD / currentBudget) * 100));

  const handleOpenPresetModal = (preset: QuickPreset) => {
    setActivePreset(preset);
    setPresetAmount(preset.amount.toString());
    setPresetCurrency(preset.currency || 'USD');
    setPresetDate(getTodayDateString());
    setSelectedPayment('Cash');
  };

  const handleConfirmPreset = () => {
    if (!activePreset) return;

    const num = parseFloat(presetAmount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const updatedList = presetsList.map(p => (p.id === activePreset.id ? { ...p, amount: num, currency: presetCurrency } : p));
    setPresetsList(updatedList);
    StorageService.savePresetsList('EXPENSE', updatedList);

    const cat = categories.find(c => c.id === activePreset.categoryId) || categories[0];

    const amountUSD = presetCurrency === 'KHR' ? num / 4000 : num;

    const matchingTrip = selectedTripId
      ? trips.find(t => t.id === selectedTripId)
      : trips.find(t =>
          t.name.toLowerCase() === activePreset.title.toLowerCase() ||
          t.category.toLowerCase() === activePreset.title.toLowerCase() ||
          activePreset.categoryId.includes(t.category.toLowerCase())
        );

    // Reset preset popover & set toast INSTANTLY for 0ms UI lag
    const presetTitle = activePreset.title;
    setActivePreset(null);
    setToastMsg(`Logged "${presetTitle}" (${formatCurrency(amountUSD, currency)})!`);
    setTimeout(() => setToastMsg(null), 3000);

    addExpense({
      title: presetTitle,
      amount: amountUSD,
      currency: presetCurrency,
      type: 'EXPENSE',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: presetDate,
      paymentMethod: selectedPayment,
      notes: `Quick log via ${selectedPayment}`,
      tripId: matchingTrip?.id,
    });
  };

  const handleDeletePreset = (presetId: string) => {
    if (window.confirm('Delete this preset?')) {
      const updatedList = presetsList.filter(p => p.id !== presetId);
      setPresetsList(updatedList);
      StorageService.savePresetsList('EXPENSE', updatedList);
      setActivePreset(null);
      setToastMsg('Preset deleted!');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customBudgetInput);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid budget amount.');
      return;
    }
    setBudgetTarget(editBudgetPeriod, val);
    setIsEditingBudget(false);
    const periodLabel = editBudgetPeriod === 'DAILY' ? 'Day' : editBudgetPeriod === 'WEEKLY' ? 'Week' : 'Month';
    setToastMsg(`${periodLabel} budget updated to ${formatCurrency(val, currency)}!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleRolloverSurplus = () => {
    if (remainingBudgetUSD <= 0) {
      alert('No unspent budget surplus available for rollover.');
      return;
    }
    const periodLabel = budgetPeriod === 'DAILY' ? 'Day' : budgetPeriod === 'WEEKLY' ? 'Week' : 'Month';
    archiveCycleSnapshot({
      type: 'BUDGET',
      period: budgetPeriod,
      periodKey: getTodayDateString(),
      targetAmount: currentBudget,
      actualAmount: activePeriodExpenseUSD,
      status: 'SURPLUS',
      surplusAmount: remainingBudgetUSD,
    });
    depositRolloverToSavings(remainingBudgetUSD, `Budget Surplus (${periodLabel}) Rollover`);
    setToastMsg(`Rolled over ${formatCurrency(remainingBudgetUSD, currency)} to Vault!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCategorySelect = (catId: string) => {
    setNewPresetCategory(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat && cat.icon) {
      setNewPresetIcon(cat.icon);
    }
  };

  const handleCreateNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newPresetAmount);
    if (!newPresetTitle.trim() || isNaN(num) || num <= 0) {
      alert('Please enter a valid title and amount.');
      return;
    }

    const cat = categories.find(c => c.id === newPresetCategory) || expenseCategories[0] || categories[0];

    const amountUSD = newPresetCurrency === 'KHR' ? num / 4000 : num;

    const newPreset: QuickPreset = {
      id: 'preset-custom-' + Date.now(),
      title: newPresetTitle.trim(),
      amount: amountUSD,
      currency: newPresetCurrency,
      categoryId: cat.id,
      icon: newPresetIcon || cat.icon || 'receipt',
      type: 'EXPENSE',
    };

    const updatedList = [newPreset, ...presetsList];
    setPresetsList(updatedList);
    StorageService.savePresetsList('EXPENSE', updatedList);

    setNewPresetTitle('');
    setNewPresetAmount('');
    setIsCreatingPreset(false);
    setToastMsg(`Added preset "${newPreset.title}"!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleReorderPresets = (updatedList: QuickPreset[]) => {
    setPresetsList(updatedList);
    StorageService.savePresetsList('EXPENSE', updatedList);
  };


  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>

      {/* Top Segmented Mode Switcher with Category Color Identity & Live Metrics */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '16px',
          marginBottom: '16px',
          backgroundColor: 'var(--pill-bg)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        }}
      >
        <button
          type="button"
          onClick={() => onSwitchTab?.('EXPENSES')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#4A99E9',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(74, 153, 233, 0.4)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1.01)',
          }}
        >
          <Wallet size={16} />
          <span>Wallet</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchTab?.('SAVINGS')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <PiggyBank size={16} />
          <span>Savings</span>
        </button>
      </div>

      {/* 1. Monthly / Period Overview Hero Bento Card (Matching Image 1) */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 22px',
          borderRadius: '24px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '12px',
        }}
      >
        {/* Top Row: Period Title (Left) | Interactive Month & Date Picker (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            {selectedDateFilter ? `Date: ${selectedDateFilter}` : 'This month'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Interactive Date Check Picker */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: selectedDateFilter ? '#4A99E9' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Calendar size={13} color={selectedDateFilter ? '#4A99E9' : 'var(--text-secondary)'} />
                <span>
                  {selectedDateFilter
                    ? selectedDateFilter
                    : new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <input
                type="date"
                value={selectedDateFilter || ''}
                onChange={(e) => setSelectedDateFilter(e.target.value || null)}
                onClick={(e) => {
                  try { (e.currentTarget as any).showPicker?.(); } catch (err) {}
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 10,
                  border: 'none',
                  margin: 0,
                  padding: 0,
                  WebkitAppearance: 'none',
                }}
                title="Filter by Date"
              />
            </div>

            {selectedDateFilter && (
              <button
                type="button"
                onClick={() => setSelectedDateFilter(null)}
                style={{
                  padding: '2px 7px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--pill-bg)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Show All Dates"
              >
                All
              </button>
            )}
          </div>
        </div>

        {/* Main Big Spending Amount with Eye Toggle directly next to price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            className="tabular-nums"
            style={{
              fontSize: '40px',
              fontWeight: 900,
              letterSpacing: '-1px',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              filter: hideBalances ? 'blur(9px)' : 'none',
              transition: 'filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              userSelect: hideBalances ? 'none' : 'auto',
            }}
          >
            {formatCurrency(totalExpenseUSD, currency)}
          </div>

          <button
            type="button"
            onClick={() => toggleHideBalances()}
            style={{
              padding: '4px',
              background: 'none',
              border: 'none',
              color: hideBalances ? '#4A99E9' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={hideBalances ? 'Show Balance' : 'Hide Balance'}
          >
            {hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Middle Info Row: Remaining Label (Left) & Green Amount (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Remaining</span>
          <span className="tabular-nums" style={{ color: '#30D158', fontWeight: 800 }}>
            {formatCurrency(remainingBudgetUSD, currency)}
          </span>
        </div>

        {/* Thin Cyan Progress Bar */}
        <div
          style={{
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--pill-bg)',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${budgetProgress}%`,
              backgroundColor: '#00E5FF',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Bottom Info Row: Clickable Budget Target (Left) & Avg/day (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <button
            type="button"
            onClick={() => {
              setCustomBudgetInput(currentBudget.toString());
              setEditBudgetPeriod(budgetPeriod);
              setIsEditingBudget(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Tap to Set Budget Target"
          >
            <span>Budget: {formatCurrency(currentBudget, currency)}</span>
            <Edit3 size={11} color="var(--text-muted)" />
          </button>

          <span style={{ fontWeight: 500 }}>
            Avg/day: {formatCurrency(dailyAvgUSD, currency)}
          </span>
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditingBudget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsEditingBudget(false)}
        >
          <form
            className="glass-panel"
            onSubmit={handleSaveBudget}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderColor: hexToRgba(pageAccent, 0.35),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color={pageAccent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Budget</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Cycle
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(p => {
                  const label = p === 'DAILY' ? 'Day' : p === 'WEEKLY' ? 'Week' : 'Month';
                  const isActive = editBudgetPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setEditBudgetPeriod(p);
                        setCustomBudgetInput(budgetTargets[p].toString());
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: isActive ? `1.5px solid ${pageAccent}` : '1px solid var(--border-glass)',
                        backgroundColor: isActive ? hexToRgba(pageAccent, 0.15) : 'var(--pill-bg)',
                        color: isActive ? pageAccent : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {label} (${budgetTargets[p]})
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Target Amount
              </label>
              <input
                type="number"
                step="10"
                value={customBudgetInput}
                onChange={e => setCustomBudgetInput(e.target.value)}
                placeholder="1000"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: pageAccent,
                  fontSize: '16px',
                  fontWeight: 800,
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[100, 250, 500, 1000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  className="glass-pill"
                  onClick={() => setCustomBudgetInput(amt.toString())}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: customBudgetInput === amt.toString() ? pageAccent : 'rgba(255, 255, 255, 0.06)',
                    borderColor: customBudgetInput === amt.toString() ? pageAccent : 'var(--border-glass)',
                    color: customBudgetInput === amt.toString() ? '#FFF' : 'var(--text-primary)',
                  }}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: pageAccent,
                color: '#FFF',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              <Check size={18} />
              Save
            </button>
          </form>
        </div>
      )}

      {/* Cycle History Modal */}
      {isHistoryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="glass-panel"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              maxHeight: '80vh',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderColor: hexToRgba(pageAccent, 0.35),
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color={pageAccent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>History</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cycleHistory.filter(c => c.type === 'BUDGET').length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Empty History
                </div>
              ) : (
                cycleHistory
                  .filter(c => c.type === 'BUDGET')
                  .map(snap => (
                    <div
                      key={snap.id}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {snap.period === 'DAILY' ? 'Day' : snap.period === 'WEEKLY' ? 'Week' : 'Month'} ({snap.periodKey})
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Spent {formatCurrency(snap.actualAmount, currency)} / Limit {formatCurrency(snap.targetAmount, currency)}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: snap.status === 'SURPLUS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: snap.status === 'SURPLUS' ? 'var(--accent-success)' : 'var(--accent-danger)',
                        }}
                      >
                        {snap.status === 'SURPLUS' ? 'Surplus' : 'Overrun'}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Trip Folder Travel & Event Organizer Bar */}
      <TripFolderBar />

      {/* Futuristic 3D Neo-Glass Art Preset Grid */}
      <ArtPresetGrid
        presetsList={presetsList}
        currency={currency}
        pageAccent={pageAccent}
        onSelectPreset={handleOpenPresetModal}
        onAddPreset={() => setIsCreatingPreset(true)}
        onDeletePreset={handleDeletePreset}
        onReorderPresets={handleReorderPresets}
      />

      {/* Add New Preset Modal with Icon & Category Picker */}
      {isCreatingPreset && (
        <div className="modal-sheet-overlay" onClick={() => setIsCreatingPreset(false)}>
          <form
            className="modal-sheet-content"
            onSubmit={handleCreateNewPreset}
            onClick={e => e.stopPropagation()}
            style={{ borderColor: hexToRgba(pageAccent, 0.35) }}
          >
            {/* iOS Drag Handle */}
            <div className="modal-sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color={pageAccent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Preset</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingPreset(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Title
              </label>
              <input
                type="text"
                value={newPresetTitle}
                onChange={e => setNewPresetTitle(e.target.value)}
                placeholder="Tech, Bills..."
                required
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Amount & Currency
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={newPresetAmount}
                  onChange={e => setNewPresetAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{
                    flex: 1,
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: pageAccent,
                    fontSize: '15px',
                    fontWeight: 800,
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '4px', width: '120px' }}>
                  <button
                    type="button"
                    onClick={() => setNewPresetCurrency('USD')}
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      border: newPresetCurrency === 'USD' ? `1px solid ${pageAccent}` : '1px solid var(--border-glass)',
                      backgroundColor: newPresetCurrency === 'USD' ? pageAccent : 'var(--pill-bg)',
                      color: newPresetCurrency === 'USD' ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    $ USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPresetCurrency('KHR')}
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      border: newPresetCurrency === 'KHR' ? `1px solid ${pageAccent}` : '1px solid var(--border-glass)',
                      backgroundColor: newPresetCurrency === 'KHR' ? pageAccent : 'var(--pill-bg)',
                      color: newPresetCurrency === 'KHR' ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ៛ KHR
                  </button>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Category
              </label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px', paddingBottom: '4px' }}>
                {expenseCategories.map(cat => {
                  const isActive = newPresetCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className="glass-pill"
                      onClick={() => handleCategorySelect(cat.id)}
                      style={{
                        backgroundColor: isActive ? pageAccent : 'rgba(255, 255, 255, 0.06)',
                        borderColor: isActive ? pageAccent : 'var(--border-glass)',
                        color: isActive ? '#FFF' : 'var(--text-primary)',
                      }}
                    >
                      <CategoryIconRenderer icon={cat.icon} size={12} color={isActive ? '#FFF' : 'var(--text-secondary)'} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Icon Picker Row */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Icon
              </label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '6px', paddingBottom: '4px' }}>
                {PRESET_ICONS.map(ic => {
                  const isActive = newPresetIcon === ic;
                  return (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewPresetIcon(ic)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: isActive ? `1px solid ${pageAccent}` : '1px solid var(--border-glass)',
                        backgroundColor: isActive ? pageAccent : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#FFF' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <CategoryIconRenderer icon={ic} size={16} />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: pageAccent,
                color: '#FFF',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              <Plus size={18} />
              Save
            </button>
          </form>
        </div>
      )}

      {/* Quick Preset Confirmation / Edit / Delete Modal */}
      {activePreset && (
        <div className="modal-sheet-overlay" onClick={() => setActivePreset(null)}>
          <div
            className="modal-sheet-content"
            onClick={e => e.stopPropagation()}
            style={{ borderColor: hexToRgba(pageAccent, 0.35) }}
          >
            {/* iOS Drag Handle */}
            <div className="modal-sheet-handle" />
            {/* Header with Delete option */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: hexToRgba(pageAccent, 0.15),
                    border: `1px solid ${hexToRgba(pageAccent, 0.35)}`,
                    color: pageAccent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIconRenderer icon={activePreset.icon} size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Confirm</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{activePreset.title}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDeletePreset(activePreset.id)}
                  style={{
                    background: 'rgba(255, 82, 82, 0.15)',
                    border: '1px solid rgba(255, 82, 82, 0.3)',
                    color: 'var(--accent-danger)',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                  }}
                  title="Delete Preset"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setActivePreset(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Editable Amount & Currency Input */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Amount & Currency
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={presetAmount}
                  onChange={e => setPresetAmount(e.target.value)}
                  style={{
                    flex: 1,
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
                {/* Modern Liquid Glass Toggle Switch for Currency */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pill-bg)',
                    border: '1px solid var(--border-glass)',
                    width: '130px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPresetCurrency('USD')}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: presetCurrency === 'USD' ? pageAccent : 'transparent',
                      color: presetCurrency === 'USD' ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: presetCurrency === 'USD' ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: presetCurrency === 'USD' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    $ USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetCurrency('KHR')}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: presetCurrency === 'KHR' ? pageAccent : 'transparent',
                      color: presetCurrency === 'KHR' ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: presetCurrency === 'KHR' ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: presetCurrency === 'KHR' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    ៛ KHR
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Payment
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                {(['Cash', 'Bank'] as const).map(pm => {
                  const isActive = selectedPayment === pm;
                  return (
                    <button
                      key={pm}
                      className="glass-pill"
                      onClick={() => setSelectedPayment(pm)}
                      style={{
                        justifyContent: 'center',
                        padding: '10px',
                        backgroundColor: isActive ? pageAccent : 'rgba(255, 255, 255, 0.06)',
                        borderColor: isActive ? pageAccent : 'var(--border-glass)',
                        color: isActive ? '#FFF' : 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: isActive ? 800 : 600,
                      }}
                    >
                      {pm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Date
              </label>
              <input
                type="date"
                value={presetDate}
                onChange={e => setPresetDate(e.target.value)}
                onClick={(e) => { try { (e.currentTarget as any).showPicker?.(); } catch (err) {} }}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'var(--pill-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '4px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Confirm & Log Button */}
            <button
              onClick={handleConfirmPreset}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: pageAccent,
                color: '#FFF',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              <Check size={18} />
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Database Header & Filter Control Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color={pageAccent} />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Records</h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: hexToRgba(pageAccent, 0.18),
                color: pageAccent,
              }}
            >
              {filteredExpenseItems.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: pageAccent,
              color: '#FFF',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        <FilterControlBar screenType="EXPENSE" />
      </div>

      {/* Expenses List */}
      <div>
        {filteredExpenseItems.length > 0 ? (
          filteredExpenseItems.map(item => (
            <ExpenseCard key={item.id} item={item} onPress={() => setSelectedExpenseForEdit(item)} />
          ))
        ) : (
          <div
            className="glass-panel"
            style={{
              padding: '36px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <SearchX size={36} color="var(--text-muted)" />
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Empty</h4>
          </div>
        )}
      </div>
    </div>
  );
};
