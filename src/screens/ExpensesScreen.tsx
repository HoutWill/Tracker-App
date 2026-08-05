import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme, hexToRgba, getPresetColor } from '../context/ThemeContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { EXPENSE_QUICK_PRESETS } from '../constants/presets';
import { formatCurrency, StorageService } from '../services/storageService';
import { PaymentMethod, QuickPreset } from '../types';
import { Plus, Zap, TrendingUp, Filter, CheckCircle2, Layers, SearchX, X, Check, ArrowDownRight, Trash2, Target, Edit3 } from 'lucide-react';

const PRESET_ICONS = [
  'receipt', 'laptop', 'coffee', 'utensils', 'car', 'shopping-cart',
  'shopping-bag', 'film', 'gamepad2', 'cpu', 'smartphone', 'home',
  'bus', 'plane', 'zap', 'shirt', 'tv', 'music', 'dumbbell',
  'heart', 'gift', 'book-open', 'scissors', 'wifi', 'camera',
  'flame', 'building', 'credit-card'
];

export const ExpensesScreen: React.FC = () => {
  const { pageColors } = useTheme();
  const pageAccent = pageColors?.EXPENSES || '#6C5CE7';

  const {
    expenses,
    filteredExpenses,
    currency,
    categories,
    monthlyBudget,
    setMonthlyBudget,
    hideBalances,
    addExpense,
    setIsAddExpenseOpen,
    setSelectedExpenseForEdit,
  } = useExpenses();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [presetsList, setPresetsList] = useState<QuickPreset[]>([]);
  const [activePreset, setActivePreset] = useState<QuickPreset | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Card');
  const [presetAmount, setPresetAmount] = useState<string>('');
  const [presetDate, setPresetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Edit Budget Target state
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>(monthlyBudget.toString());

  // New Preset Modal state
  const [isCreatingPreset, setIsCreatingPreset] = useState<boolean>(false);
  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [newPresetAmount, setNewPresetAmount] = useState<string>('');
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

  // Expenses only filter
  const expenseItems = expenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));
  const filteredExpenseItems = filteredExpenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));

  const totalExpenseUSD = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const totalFilteredUSD = filteredExpenseItems.reduce((sum, e) => sum + e.amount, 0);
  const averageExpenseUSD = expenseItems.length > 0 ? totalExpenseUSD / expenseItems.length : 0;

  const currentBudget = monthlyBudget || 1000;
  const remainingBudgetUSD = Math.max(0, currentBudget - totalExpenseUSD);
  const budgetProgress = Math.min(100, Math.round((totalExpenseUSD / currentBudget) * 100));

  const handleOpenPresetModal = (preset: QuickPreset) => {
    setActivePreset(preset);
    setPresetAmount(preset.amount.toString());
    setPresetDate(new Date().toISOString().split('T')[0]);
    setSelectedPayment('Card');
  };

  const handleConfirmPreset = async () => {
    if (!activePreset) return;

    const num = parseFloat(presetAmount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const updatedList = presetsList.map(p => (p.id === activePreset.id ? { ...p, amount: num } : p));
    setPresetsList(updatedList);
    StorageService.savePresetsList('EXPENSE', updatedList);

    const cat = categories.find(c => c.id === activePreset.categoryId) || categories[0];

    await addExpense({
      title: activePreset.title,
      amount: num,
      currency: activePreset.currency,
      type: 'EXPENSE',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: presetDate,
      paymentMethod: selectedPayment,
      notes: `Quick log via ${selectedPayment}`,
    });

    setToastMsg(`Logged "${activePreset.title}" (${formatCurrency(num, currency)})!`);
    setActivePreset(null);
    setTimeout(() => setToastMsg(null), 3000);
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
    setMonthlyBudget(val);
    setIsEditingBudget(false);
    setToastMsg(`Budget target updated to ${formatCurrency(val, currency)}!`);
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

    const cat = categories.find(c => c.id === newPresetCategory) || expenseCategories[0] || categories[0];

    const newPreset: QuickPreset = {
      id: 'preset-custom-' + Date.now(),
      title: newPresetTitle.trim(),
      amount: num,
      currency: 'USD',
      categoryId: cat.id,
      icon: newPresetIcon || cat.icon || 'receipt',
      type: 'EXPENSE',
    };

    const updatedList = [...presetsList, newPreset];
    setPresetsList(updatedList);
    StorageService.savePresetsList('EXPENSE', updatedList);

    setNewPresetTitle('');
    setNewPresetAmount('');
    setIsCreatingPreset(false);
    setToastMsg(`Added preset "${newPreset.title}"!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Toast Feedback Notification Banner */}
      {toastMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(126, 231, 135, 0.4)',
            backgroundColor: 'rgba(126, 231, 135, 0.18)',
            color: 'var(--accent-success)',
            fontSize: '14px',
            fontWeight: 800,
            marginBottom: '14px',
            boxShadow: '0 8px 24px rgba(0, 230, 118, 0.25)',
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Unified All-in-One Hero Expenses Card with Explicit Budget Target */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          borderColor: hexToRgba(pageAccent, 0.4),
          backgroundColor: hexToRgba(pageAccent, 0.12),
          marginBottom: '16px',
        }}
      >
        {/* Top Header Row with Budget Edit Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pageAccent }}>
            <ArrowDownRight size={20} />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>Expenses</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="glass-pill"
              onClick={() => {
                setCustomBudgetInput(currentBudget.toString());
                setIsEditingBudget(true);
              }}
              style={{ fontSize: '11px', padding: '3px 8px', color: pageAccent, borderColor: hexToRgba(pageAccent, 0.4) }}
              title="Set Target Budget"
            >
              <Target size={12} /> Budget: {formatCurrency(currentBudget, currency)}
            </button>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '8px',
                backgroundColor: hexToRgba(pageAccent, 0.2),
                color: pageAccent,
                border: `1px solid ${hexToRgba(pageAccent, 0.35)}`,
              }}
            >
              {expenseItems.length}
            </span>
          </div>
        </div>

        {/* Main Big Balance Amount */}
        <div
          className="tabular-nums"
          style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '14px' }}
        >
          {hideBalances ? (currency === 'USD' ? '$ ••••••' : '៛ ••••••') : formatCurrency(totalExpenseUSD, currency)}
        </div>

        {/* Spending Budget Target Progress Bar & Remaining Allowance */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Budget: {formatCurrency(currentBudget, currency)}
            </span>
            <span style={{ color: budgetProgress > 90 ? 'var(--accent-danger)' : pageAccent, fontWeight: 800 }}>
              {hideBalances ? '••••' : formatCurrency(remainingBudgetUSD, currency)} Left
            </span>
          </div>

          <div
            style={{
              height: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${budgetProgress}%`,
                backgroundColor: budgetProgress > 90 ? 'var(--accent-danger)' : pageAccent,
                borderRadius: '4px',
                boxShadow: `0 0 10px ${hexToRgba(pageAccent, 0.4)}`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Integrated Bottom Metrics Bar inside the Same Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: hexToRgba(pageAccent, 0.2),
                color: pageAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={14} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Average</div>
              <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800 }}>
                {hideBalances ? '••••' : formatCurrency(averageExpenseUSD, currency)}
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-glass)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: hexToRgba(pageAccent, 0.2),
                color: pageAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Filter size={14} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Filtered</div>
              <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800 }}>
                {hideBalances ? '••••' : formatCurrency(totalFilteredUSD, currency)}
              </div>
            </div>
          </div>
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
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Budget Target</h3>
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
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Target Amount
              </label>
              <input
                type="number"
                step="50"
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
              {[500, 1000, 1500, 2500].map(amt => (
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

      {/* Grid 1-Tap Quick Presets Section with Vibrant Colorful Icons */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color={pageAccent} />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Presets</h3>
          </div>
          <button
            className="glass-pill"
            onClick={() => setIsCreatingPreset(true)}
            style={{ fontSize: '11px', padding: '4px 10px', color: pageAccent, borderColor: hexToRgba(pageAccent, 0.4) }}
          >
            <Plus size={12} /> Add
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {presetsList.map((preset, idx) => {
            const tileColor = getPresetColor(idx);
            return (
              <button
                key={preset.id}
                className="glass-panel"
                onClick={() => handleOpenPresetModal(preset)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  border: `1px solid ${hexToRgba(tileColor, 0.35)}`,
                  backgroundColor: hexToRgba(tileColor, 0.08),
                  textAlign: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    border: `1px solid ${hexToRgba(tileColor, 0.4)}`,
                    backgroundColor: hexToRgba(tileColor, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tileColor,
                  }}
                >
                  <CategoryIconRenderer icon={preset.icon} size={18} color={tileColor} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: '1.2' }}>{preset.title}</div>
                  <div className="tabular-nums" style={{ fontSize: '11px', fontWeight: 800, color: tileColor, marginTop: '2px' }}>
                    {formatCurrency(preset.amount, currency)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add New Preset Modal with Icon & Category Picker */}
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
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={newPresetAmount}
                onChange={e => setNewPresetAmount(e.target.value)}
                placeholder="0.00"
                required
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: pageAccent,
                  fontSize: '15px',
                  fontWeight: 800,
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
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

            {/* Editable Amount Input */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={presetAmount}
                onChange={e => setPresetAmount(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Payment
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                {(['Card', 'Cash', 'Bank', 'Pay'] as const).map(pm => {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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

      {/* Floating Action Button (FAB) for Add */}
      <button
        onClick={() => setIsAddExpenseOpen(true)}
        style={{
          position: 'fixed',
          bottom: '76px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: pageAccent,
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${hexToRgba(pageAccent, 0.45)}`,
          cursor: 'pointer',
          zIndex: 40,
        }}
        title="Add"
      >
        <Plus size={26} />
      </button>
    </div>
  );
};
