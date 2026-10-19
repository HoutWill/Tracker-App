import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { TripFolderBar } from '../components/TripFolderBar';
import { ArtPresetGrid } from '../components/ArtPresetGrid';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { BootstrapIcon } from '../components/BootstrapIcon';
import { SAVING_QUICK_PRESETS } from '../constants/presets';
import { formatCurrency, StorageService, getTodayDateString, getStartOfWeekDateString, getEndOfWeekDateString, formatCleanDate } from '../services/storageService';
import { PaymentMethod, QuickPreset, BudgetPeriod } from '../types';
import { Plus, Zap, CheckCircle2, Layers, SearchX, X, Check, PiggyBank, Target, TrendingUp, Trash2, CreditCard, Edit3, Wallet, ChevronLeft, ChevronRight, Calendar, Eye, EyeOff } from 'lucide-react';

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
    toggleHideBalances,
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

  // Date Check filter state
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Month Selection state (defaults to current month in Cambodia UTC+7 e.g. "2026-10")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getTodayDateString().slice(0, 7));

  const currentMonthKey = getTodayDateString().slice(0, 7);
  const isCurrentMonth = selectedMonth === currentMonthKey;

  const monthDate = new Date(`${selectedMonth}-01T12:00:00Z`);
  const monthName = monthDate.toLocaleString('en-US', { month: 'long', timeZone: 'Asia/Phnom_Penh' });

  const goToPrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(prevStr);
    setSelectedDateFilter(null);
  };

  const goToNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextStr);
    setSelectedDateFilter(null);
  };

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

  // Savings filter (with optional Check Date filter)
  const rawSavingItems = expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));
  const savingItems = selectedDateFilter
    ? rawSavingItems.filter(e => e.date === selectedDateFilter)
    : rawSavingItems;
  const filteredSavingItems = filteredExpenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const totalSavingUSD = savingItems.reduce((sum, e) => sum + e.amount, 0);

  // Monthly savings (strictly scoped to selectedMonth so savings reset each month on the 1st in Cambodia UTC+7)
  const monthSavingItems = rawSavingItems.filter(e => e.date.startsWith(selectedMonth));
  const monthSavingUSD = monthSavingItems.reduce((sum, e) => sum + e.amount, 0);

  // Saved amount shown in the hero card (either single filtered date or selected active month)
  const displaySavingUSD = selectedDateFilter
    ? savingItems.reduce((sum, e) => sum + e.amount, 0)
    : monthSavingUSD;

  // Active savings target
  const currentGoal = savingGoal || (savingPeriod === 'DAILY' ? 50 : savingPeriod === 'WEEKLY' ? 500 : 2000);
  const remainingGoalUSD = Math.max(0, currentGoal - displaySavingUSD);
  const goalProgressPct = Math.min(100, Math.round((displaySavingUSD / currentGoal) * 100));

  // Allowance & Pacing calculation (Cambodia UTC+7)
  const [todayY, todayM, todayD] = getTodayDateString().split('-').map(Number);
  const daysInMonth = new Date(todayY, todayM, 0).getDate();
  const daysRemaining = isCurrentMonth ? Math.max(1, daysInMonth - todayD + 1) : 1;
  const dailySavingsPaceUSD = isCurrentMonth && remainingGoalUSD > 0
    ? remainingGoalUSD / daysRemaining
    : (isCurrentMonth ? 0 : Math.max(0, currentGoal - displaySavingUSD) / daysInMonth);

  // Financial Insights:
  const uniqueDays = Array.from(new Set(rawSavingItems.map(e => e.date)));
  const dailyAvgUSD = uniqueDays.length > 0 ? rawSavingItems.reduce((sum, e) => sum + e.amount, 0) / uniqueDays.length : 0;


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
    if (isNaN(num) || num <= 0 || num > 1000000000) {
      alert('Invalid');
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
    if (isNaN(val) || val <= 0 || val > 1000000000) {
      alert('Invalid');
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
    const cleanTitle = newPresetTitle.trim().slice(0, 100);
    if (!cleanTitle || isNaN(num) || num <= 0 || num > 1000000000) {
      alert('Invalid');
      return;
    }

    const cat = categories.find(c => c.id === newPresetCategory) || savingCategories[0] || categories[0];

    const amountUSD = newPresetCurrency === 'KHR' ? num / 4000 : num;

    const newPreset: QuickPreset = {
      id: 'preset-custom-saving-' + Date.now(),
      title: cleanTitle,
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
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
            backgroundColor: '#30D158',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(48, 209, 88, 0.4)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1.01)',
          }}
        >
          <PiggyBank size={16} />
          <span>Savings</span>
        </button>
      </div>

      {/* 1. Monthly / Period Overview Hero Bento Card */}
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
        {/* Top Row: Month Selector & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={goToPrevMonth}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
              }}
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              {selectedDateFilter ? selectedDateFilter : monthName}
            </span>

            <button
              type="button"
              onClick={goToNextMonth}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
              }}
              title="Next"
            >
              <ChevronRight size={16} />
            </button>

            {isCurrentMonth && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(48, 209, 88, 0.15)',
                  color: '#30D158',
                }}
              >
                Current
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Interactive Date Check Picker */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: selectedDateFilter ? '#30D158' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Calendar size={13} color={selectedDateFilter ? '#30D158' : 'var(--text-secondary)'} />
                <span>
                  {selectedDateFilter
                    ? formatCleanDate(selectedDateFilter)
                    : selectedMonth}
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
                title="Date"
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
                title="All"
              >
                All
              </button>
            )}
          </div>
        </div>

        {/* Main Big Saved Amount with Eye Toggle directly next to price */}
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
            {formatCurrency(displaySavingUSD, currency)}
          </div>

          <button
            type="button"
            onClick={() => toggleHideBalances()}
            style={{
              padding: '4px',
              background: 'none',
              border: 'none',
              color: hideBalances ? '#30D158' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={hideBalances ? 'Show' : 'Hide'}
          >
            {hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Middle Info Row: Remaining Label (Left) & Green Amount (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Remaining</span>
          <span
            className="tabular-nums"
            style={{
              color: '#30D158',
              fontWeight: 800,
              filter: hideBalances ? 'blur(6px)' : 'none',
              transition: 'filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              userSelect: hideBalances ? 'none' : 'auto',
            }}
          >
            {formatCurrency(remainingGoalUSD, currency)}
          </span>
        </div>

        {/* Thin Emerald Accent Progress Bar */}
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
              width: `${goalProgressPct}%`,
              backgroundColor: '#30D158',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Bottom Info Row: Clickable Goal Target (Left) & Average (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <button
            type="button"
            onClick={() => {
              setCustomGoalInput(currentGoal.toString());
              setEditSavingPeriod(savingPeriod);
              setIsEditingGoal(true);
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
            title="Goal"
          >
            <span>Goal: {formatCurrency(currentGoal, currency)}</span>
            <Edit3 size={11} color="var(--text-muted)" />
          </button>

          <span style={{ fontWeight: 500 }}>
            Average: {formatCurrency(dailyAvgUSD, currency)}
          </span>
        </div>
      </div>

      {/* 2. iOS 18 Muted Pastel Bento Grid: Pacing & Growth */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {/* Bento Tile 1: Pacing */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(48, 209, 88, 0.15)',
                  border: '1px solid rgba(48, 209, 88, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BootstrapIcon name="speedometer2" size={15} color="#30D158" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Pacing</span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: remainingGoalUSD <= 0 ? 'rgba(48, 209, 88, 0.15)' : 'rgba(74, 153, 233, 0.15)',
                color: remainingGoalUSD <= 0 ? '#30D158' : '#4A99E9',
              }}
            >
              {remainingGoalUSD <= 0 ? 'Done' : 'Paced'}
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div
              className="tabular-nums"
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                filter: hideBalances ? 'blur(6px)' : 'none',
                transition: 'filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                userSelect: hideBalances ? 'none' : 'auto',
              }}
            >
              {formatCurrency(dailySavingsPaceUSD, currency)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Daily
            </div>
          </div>
        </div>

        {/* Bento Tile 2: Growth */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(243, 168, 91, 0.15)',
                  border: '1px solid rgba(243, 168, 91, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BootstrapIcon name="graph-up-arrow" size={14} color="#F3A85B" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Growth</span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: goalProgressPct >= 100 ? 'rgba(48, 209, 88, 0.15)' : 'rgba(243, 168, 91, 0.15)',
                color: goalProgressPct >= 100 ? '#30D158' : '#F3A85B',
              }}
            >
              {goalProgressPct >= 100 ? 'Done' : goalProgressPct >= 50 ? 'Strong' : 'Active'}
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div
              className="tabular-nums"
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              {goalProgressPct}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              {daysRemaining}d
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
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
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
                Target
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
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
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
                  Empty
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
      <TripFolderBar type="SAVING" selectedMonth={selectedMonth} />

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
                Amount
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
        <div className="modal-sheet-overlay" onClick={() => setActivePreset(null)}>
          <div
            className="modal-sheet-content"
            onClick={e => e.stopPropagation()}
            style={{ borderColor: hexToRgba(pageAccent, 0.35) }}
          >
            {/* iOS Drag Handle */}
            <div className="modal-sheet-handle" />
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
                  title="Delete"
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
                Amount
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
                onClick={(e) => { try { (e.currentTarget as any).showPicker?.(); } catch (err) {} }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

          <button
            type="button"
            onClick={() => setIsAddSavingOpen(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--accent-success)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={14} color="#FFFFFF" />
            <span>Add</span>
          </button>
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
