import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { TripFolderBar } from '../components/TripFolderBar';
import { ArtPresetGrid } from '../components/ArtPresetGrid';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { SAVING_QUICK_PRESETS } from '../constants/presets';
import { formatCurrency, StorageService, getTodayDateString, getStartOfWeekDateString, getEndOfWeekDateString } from '../services/storageService';
import { PaymentMethod, QuickPreset, BudgetPeriod } from '../types';
import { Plus, Zap, CheckCircle2, Layers, SearchX, X, Check, PiggyBank, Target, TrendingUp, Trash2, CreditCard } from 'lucide-react';

const SAVING_PRESET_ICONS = [
  'piggy-bank', 'vault', 'wallet', 'shield-check', 'target', 'trending-up',
  'coins', 'sparkles', 'lock', 'card', 'briefcase', 'gift', 'building', 'home',
  'plane', 'heart'
];

interface SavingsScreenProps {
  onSwitchTab?: (tab: 'EXPENSES' | 'SAVINGS') => void;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({ onSwitchTab }) => {
  const { pageColors } = useTheme();
  const pageAccent = pageColors?.SAVING || '#00B894';

  const {
    expenses,
    filteredExpenses,
    currency,
    categories,
    savingGoal,
    setSavingGoal,
    savingGoals,
    setSavingGoalTarget,
    savingPeriod,
    setSavingPeriod,
    cycleHistory,
    archiveCycleSnapshot,
    hideBalances,
    addExpense,
    setIsAddSavingOpen,
    setSelectedExpenseForEdit,
    selectedTripId,
    trips,
  } = useExpenses();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [presetsList, setPresetsList] = useState<QuickPreset[]>([]);
  const [activePreset, setActivePreset] = useState<QuickPreset | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Bank');
  const [presetAmount, setPresetAmount] = useState<string>('');
  const [presetCurrency, setPresetCurrency] = useState<'USD' | 'KHR'>('USD');
  const [presetDate, setPresetDate] = useState<string>(getTodayDateString());

  // Edit Savings Goal Target state
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>(savingGoal.toString());
  const [editSavingPeriod, setEditSavingPeriod] = useState<BudgetPeriod>(savingPeriod);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // New Preset Modal state
  const [isCreatingPreset, setIsCreatingPreset] = useState<boolean>(false);
  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [newPresetAmount, setNewPresetAmount] = useState<string>('');
  const [newPresetCurrency, setNewPresetCurrency] = useState<'USD' | 'KHR'>('USD');
  const [newPresetCategory, setNewPresetCategory] = useState<string>('');
  const [newPresetIcon, setNewPresetIcon] = useState<string>('piggy-bank');

  const savingCategories = categories.filter(c => c.type === 'SAVING' || c.id.startsWith('cat-saving'));

  useEffect(() => {
    const list = StorageService.getPresetsList('SAVING', SAVING_QUICK_PRESETS);
    setPresetsList(list);
    if (savingCategories.length > 0) {
      setNewPresetCategory(savingCategories[0].id);
      setNewPresetIcon(savingCategories[0].icon || 'piggy-bank');
    }
  }, []);

  // Savings only filter
  const savingItems = expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));
  const filteredSavingItems = filteredExpenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const totalSavingUSD = savingItems.reduce((sum, e) => sum + e.amount, 0);
  const averageSavingUSD = savingItems.length > 0 ? totalSavingUSD / savingItems.length : 0;

  // Period Savings Calculation for Multi-Period Goals (Daily / Weekly / Monthly)
  const getActivePeriodSavingUSD = () => {
    const todayStr = getTodayDateString();
    if (savingPeriod === 'DAILY') {
      return savingItems.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
    }
    if (savingPeriod === 'WEEKLY') {
      const startW = getStartOfWeekDateString();
      const endW = getEndOfWeekDateString();
      return savingItems.filter(e => e.date >= startW && e.date <= endW).reduce((sum, e) => sum + e.amount, 0);
    }
    const monthPrefix = todayStr.substring(0, 7);
    return savingItems.filter(e => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0);
  };

  const activePeriodSavingUSD = getActivePeriodSavingUSD();
  const currentGoal = savingGoal || (savingPeriod === 'DAILY' ? 50 : savingPeriod === 'WEEKLY' ? 500 : 2000);
  const goalProgressPct = Math.min(100, Math.round((activePeriodSavingUSD / currentGoal) * 100));


  const handleOpenPresetModal = (preset: QuickPreset) => {
    setActivePreset(preset);
    setPresetAmount(preset.amount.toString());
    setPresetCurrency(preset.currency || 'USD');
    setPresetDate(getTodayDateString());
    setSelectedPayment('Bank');
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
    StorageService.savePresetsList('SAVING', updatedList);

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
    setToastMsg(`Saved "${presetTitle}" (${formatCurrency(amountUSD, currency)})!`);
    setTimeout(() => setToastMsg(null), 3000);

    addExpense({
      title: presetTitle,
      amount: amountUSD,
      currency: presetCurrency,
      type: 'SAVING',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: presetDate,
      paymentMethod: selectedPayment,
      notes: `Vault deposit via ${selectedPayment}`,
      tripId: matchingTrip?.id,
    });
  };

  const handleDeletePreset = (presetId: string) => {
    if (window.confirm('Delete this preset?')) {
      const updatedList = presetsList.filter(p => p.id !== presetId);
      setPresetsList(updatedList);
      StorageService.savePresetsList('SAVING', updatedList);
      setActivePreset(null);
      setToastMsg('Preset deleted!');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customGoalInput);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid goal amount.');
      return;
    }
    setSavingGoalTarget(editSavingPeriod, val);
    setIsEditingGoal(false);
    const periodLabel = editSavingPeriod === 'DAILY' ? 'Day' : editSavingPeriod === 'WEEKLY' ? 'Week' : 'Month';
    setToastMsg(`${periodLabel} savings goal updated to ${formatCurrency(val, currency)}!`);
    setTimeout(() => setToastMsg(null), 2500);
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

    const cat = categories.find(c => c.id === newPresetCategory) || savingCategories[0] || categories[0];

    const amountUSD = newPresetCurrency === 'KHR' ? num / 4000 : num;

    const newPreset: QuickPreset = {
      id: 'preset-custom-saving-' + Date.now(),
      title: newPresetTitle.trim(),
      amount: amountUSD,
      currency: newPresetCurrency,
      categoryId: cat.id,
      icon: newPresetIcon || cat.icon || 'piggy-bank',
      type: 'SAVING',
    };

    const updatedList = [newPreset, ...presetsList];
    setPresetsList(updatedList);
    StorageService.savePresetsList('SAVING', updatedList);

    setNewPresetTitle('');
    setNewPresetAmount('');
    setIsCreatingPreset(false);
    setToastMsg(`Added preset "${newPreset.title}"!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleReorderPresets = (updatedList: QuickPreset[]) => {
    setPresetsList(updatedList);
    StorageService.savePresetsList('SAVING', updatedList);
  };


  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>

      {/* Top Segmented Group Bar: Expenses vs Saving */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '3px',
          borderRadius: '12px',
          marginBottom: '14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
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
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <CreditCard size={15} />
          <span>Expenses</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchTab?.('SAVINGS')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '9px',
            border: '1px solid var(--border-glass)',
            backgroundColor: 'var(--pill-hover)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <PiggyBank size={15} style={{ color: pageAccent }} />
          <span>Saving</span>
        </button>
      </div>

      {/* Unified All-in-One Hero Vault Card displaying Saved, Goal, Progress Bar, and Metrics */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 20px',
          border: '1px solid var(--border-glass)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Top Header Row with Goal Editor Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
            <PiggyBank size={18} style={{ color: pageAccent }} />
            <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.1px' }}>Vault</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Multi-Period Cycle Dropdown Select */}
            <select
              value={savingPeriod}
              onChange={e => setSavingPeriod(e.target.value as BudgetPeriod)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-glass)',
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Select Saving Cycle"
            >
              <option value="DAILY" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Day</option>
              <option value="WEEKLY" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Week</option>
              <option value="MONTHLY" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Month</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setCustomGoalInput(currentGoal.toString());
                setEditSavingPeriod(savingPeriod);
                setIsEditingGoal(true);
              }}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
              title="Set Saving Goal Target"
            >
              <Target size={12} style={{ flexShrink: 0, color: pageAccent }} />
              <span>Goal: {formatCurrency(currentGoal, currency)}</span>
            </button>

            <button
              type="button"
              className="glass-pill"
              onClick={() => setIsHistoryOpen(true)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-glass)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              History
            </button>
          </div>
        </div>

        {/* Main Big Balance Amount */}
        <div
          className="tabular-nums"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          {hideBalances ? '••••••••' : formatCurrency(totalSavingUSD, currency)}
        </div>

        {/* Savings Goal Progress Bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Goal ({formatCurrency(currentGoal, currency)})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: pageAccent, fontWeight: 700 }}>
                {goalProgressPct}%
              </span>
              {goalProgressPct >= 100 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(48, 209, 88, 0.15)',
                    border: '1px solid rgba(48, 209, 88, 0.3)',
                    color: 'var(--accent-success)',
                  }}
                >
                  Milestone
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              height: '6px',
              borderRadius: '3px',
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${goalProgressPct}%`,
                backgroundColor: pageAccent,
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Integrated Bottom 3-Metrics Bar inside the Vault Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '10px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: pageAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PiggyBank size={13} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>Saved</div>
              <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {hideBalances ? '••••' : formatCurrency(totalSavingUSD, currency)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: pageAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TrendingUp size={13} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Average</div>
              <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {hideBalances ? '••••' : formatCurrency(averageSavingUSD, currency)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: pageAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Target size={13} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Goal</div>
              <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {hideBalances ? '••••' : formatCurrency(currentGoal, currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Savings Goal Modal */}
      {isEditingGoal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsEditingGoal(false)}
        >
          <form
            className="glass-panel"
            onSubmit={handleSaveGoal}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} style={{ color: pageAccent }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Goal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Cycle
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(p => {
                  const label = p === 'DAILY' ? 'Day' : p === 'WEEKLY' ? 'Week' : 'Month';
                  const isActive = editSavingPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setEditSavingPeriod(p);
                        setCustomGoalInput(savingGoals[p].toString());
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
                      {label} (${savingGoals[p]})
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
                step="50"
                value={customGoalInput}
                onChange={e => setCustomGoalInput(e.target.value)}
                placeholder="2000"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'var(--pill-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[250, 500, 1000, 2000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomGoalInput(amt.toString())}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: customGoalInput === amt.toString() ? 'var(--pill-hover)' : 'var(--pill-bg)',
                    border: customGoalInput === amt.toString() ? '1px solid var(--border-glass)' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="glass-pill"
              style={{
                justifyContent: 'center',
                padding: '10px',
                backgroundColor: pageAccent,
                borderColor: pageAccent,
                color: '#FFF',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              <span>Save</span>
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
                <PiggyBank size={18} color={pageAccent} />
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
              {cycleHistory.filter(c => c.type === 'SAVING').length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Empty History
                </div>
              ) : (
                cycleHistory
                  .filter(c => c.type === 'SAVING')
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
                          Saved {formatCurrency(snap.actualAmount, currency)} / Goal {formatCurrency(snap.targetAmount, currency)}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: 'var(--accent-success)',
                        }}
                      >
                        Milestone
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

      {/* Saving Folder Vault & Target Organizer Bar */}
      <TripFolderBar type="SAVING" />

      {/* Futuristic 3D Neo-Glass Art Preset Grid */}
      <ArtPresetGrid
        presetsList={presetsList}
        currency={currency}
        pageAccent={pageAccent}
        onSelectPreset={handleOpenPresetModal}
        onAddPreset={() => setIsCreatingPreset(true)}
        onDeletePreset={handleDeletePreset}
        onReorderPresets={handleReorderPresets}
        colorOffset={1}
      />

      {/* Add New Savings Preset Modal */}
      {isCreatingPreset && (
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
          onClick={() => setIsCreatingPreset(false)}
        >
          <form
            className="glass-panel"
            onSubmit={handleCreateNewPreset}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderColor: hexToRgba(pageAccent, 0.35),
            }}
          >
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
                placeholder="Gold, Crypto..."
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
                      backgroundColor: newPresetCurrency === 'USD' ? pageAccent : 'rgba(255, 255, 255, 0.05)',
                      color: '#FFF',
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
                      backgroundColor: newPresetCurrency === 'KHR' ? pageAccent : 'rgba(255, 255, 255, 0.05)',
                      color: '#FFF',
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
                {savingCategories.map(cat => {
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
                {SAVING_PRESET_ICONS.map(ic => {
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

      {/* Quick Preset Confirmation / Delete Modal */}
      {activePreset && (
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
          onClick={() => setActivePreset(null)}
        >
          <div
            className="glass-panel"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderColor: hexToRgba(pageAccent, 0.35),
            }}
          >
            {/* Header with Delete Option */}
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
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Deposit</h3>
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
                    color: pageAccent,
                    fontSize: '14px',
                    fontWeight: 800,
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
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
                      color: presetCurrency === 'USD' ? '#FFFFFF' : 'var(--text-secondary)',
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
                      color: presetCurrency === 'KHR' ? '#FFFFFF' : 'var(--text-secondary)',
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

            {/* Payment Source Selector */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Source
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
                style={{
                  width: '100%',
                  height: '40px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Layers size={16} style={{ color: pageAccent }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>Records</h3>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-glass)',
            }}
          >
            {filteredSavingItems.length}
          </span>
        </div>

        <FilterControlBar screenType="SAVING" />
      </div>

      {/* Savings List */}
      <div>
        {filteredSavingItems.length > 0 ? (
          filteredSavingItems.map(item => (
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
