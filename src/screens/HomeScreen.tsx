import React, { useState, useEffect } from 'react';
import { useExpenses, TypeTabOption } from '../context/ExpenseContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { TripFolderBar } from '../components/TripFolderBar';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { EXPENSE_QUICK_PRESETS, SAVING_QUICK_PRESETS, QUICK_PRESETS } from '../constants/presets';
import { StorageService, formatCurrency } from '../services/storageService';
import { PaymentMethod, TransactionType, QuickPreset } from '../types';
import { Plus, Zap, Filter, CheckCircle2, Layers, SearchX, X, Check, PiggyBank, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    expenses,
    filteredExpenses,
    currency,
    categories,
    monthlyBudget,
    savingGoal,
    budgetPeriod,
    savingPeriod,
    hideBalances,
    activeTypeTab,
    setActiveTypeTab,
    addExpense,
    setIsAddExpenseOpen,
    setSelectedExpenseForEdit,
    selectedTripId,
    trips,
  } = useExpenses();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<QuickPreset | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [selectedType, setSelectedType] = useState<TransactionType>('EXPENSE');
  const [presetAmount, setPresetAmount] = useState<string>('');
  const [presetDate, setPresetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [expensePresets, setExpensePresets] = useState<QuickPreset[]>([]);
  const [savingPresets, setSavingPresets] = useState<QuickPreset[]>([]);

  useEffect(() => {
    const ep = StorageService.getPresetsList('EXPENSE', EXPENSE_QUICK_PRESETS);
    const sp = StorageService.getPresetsList('SAVING', SAVING_QUICK_PRESETS);
    setExpensePresets(ep);
    setSavingPresets(sp);
  }, []);

  const expenseItems = expenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));
  const savingItems = expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const totalExpenseUSD = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const totalSavingUSD = savingItems.reduce((sum, e) => sum + e.amount, 0);

  const currentBudget = monthlyBudget || (budgetPeriod === 'DAILY' ? 35 : budgetPeriod === 'WEEKLY' ? 250 : 1000);
  const budgetProgress = Math.min(100, Math.round((totalExpenseUSD / currentBudget) * 100));

  const currentGoal = savingGoal || (savingPeriod === 'DAILY' ? 50 : savingPeriod === 'WEEKLY' ? 500 : 2000);
  const savingProgress = Math.min(100, Math.round((totalSavingUSD / currentGoal) * 100));


  // Dynamic presets based on active top tab
  const displayedPresets =
    activeTypeTab === 'SAVING'
      ? (savingPresets.length > 0 ? savingPresets : SAVING_QUICK_PRESETS)
      : activeTypeTab === 'EXPENSE'
      ? (expensePresets.length > 0 ? expensePresets : EXPENSE_QUICK_PRESETS)
      : [...(expensePresets.length > 0 ? expensePresets : EXPENSE_QUICK_PRESETS), ...(savingPresets.length > 0 ? savingPresets : SAVING_QUICK_PRESETS)];


  const handleOpenPresetModal = (preset: QuickPreset) => {
    setActivePreset(preset);
    setPresetAmount(preset.amount.toString());
    setPresetDate(new Date().toISOString().split('T')[0]);
    setSelectedPayment('Cash');
    setSelectedType(preset.type || (preset.categoryId.startsWith('cat-saving') ? 'SAVING' : 'EXPENSE'));
  };

  const handleConfirmPreset = () => {
    if (!activePreset) return;

    const num = parseFloat(presetAmount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const cat = categories.find(c => c.id === activePreset.categoryId) || categories[0];

    const matchingTrip = selectedTripId
      ? trips.find(t => t.id === selectedTripId)
      : trips.find(t =>
          t.name.toLowerCase() === activePreset.title.toLowerCase() ||
          t.category.toLowerCase() === activePreset.title.toLowerCase() ||
          activePreset.categoryId.includes(t.category.toLowerCase())
        );

    // Close modal and show toast feedback INSTANTLY for 0ms UI lag
    const presetTitle = activePreset.title;
    setActivePreset(null);
    setToastMsg(`Logged ${selectedType} "${presetTitle}" (${formatCurrency(num, currency)})!`);
    setTimeout(() => setToastMsg(null), 2500);

    addExpense({
      title: presetTitle,
      amount: num,
      currency: activePreset.currency,
      type: selectedType,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: presetDate,
      paymentMethod: selectedPayment,
      notes: `Quick log (${selectedType}) via ${selectedPayment}`,
      tripId: matchingTrip?.id,
    });
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>

      {/* Top Segmented Mode Switcher: Expenses vs Savings vs All */}
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
        {[
          { id: 'EXPENSE', label: 'Expenses', icon: ArrowDownRight, count: expenseItems.length, color: '#4A99E9' },
          { id: 'SAVING', label: 'Savings', icon: PiggyBank, count: savingItems.length, color: '#30D158' },
          { id: 'ALL', label: 'All', icon: Layers, count: expenses.length, color: '#48484A' },
        ].map(tab => {
          const isActive = activeTypeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTypeTab(tab.id as TypeTabOption)}
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
                boxShadow: isActive ? `0 3px 10px ${tab.color}66` : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span style={{ fontSize: '10px', opacity: 0.85 }}>({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Hero Metrics Container based on selected top mode */}
      <div style={{ marginBottom: '16px' }}>
        {activeTypeTab === 'EXPENSE' && (
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-danger)' }}>
                <ArrowDownRight size={18} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Total Expenses</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(255, 123, 114, 0.15)', color: 'var(--accent-danger)' }}>
                {expenseItems.length} entries
              </span>
            </div>

            <div className="tabular-nums" style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.6px', marginBottom: '12px' }}>
              {hideBalances ? (currency === 'USD' ? '$ ••••••' : '៛ ••••••') : formatCurrency(totalExpenseUSD, currency)}
            </div>

            <div>
              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{ height: '100%', width: `${budgetProgress}%`, backgroundColor: budgetProgress > 90 ? 'var(--accent-danger)' : 'var(--accent)', borderRadius: '3px' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                {budgetProgress}% of {formatCurrency(currentBudget, currency)} ({budgetPeriod === 'DAILY' ? 'Daily' : budgetPeriod === 'WEEKLY' ? 'Weekly' : 'Monthly'}) target
              </div>
            </div>
          </div>
        )}

        {activeTypeTab === 'SAVING' && (
          <div className="glass-panel" style={{ padding: '18px', borderColor: 'rgba(126, 231, 135, 0.35)', backgroundColor: 'rgba(126, 231, 135, 0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-success)' }}>
                <PiggyBank size={18} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Total Vault Savings</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(126, 231, 135, 0.2)', color: 'var(--accent-success)' }}>
                {savingItems.length} entries
              </span>
            </div>

            <div className="tabular-nums" style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--accent-success)', marginBottom: '8px' }}>
              {hideBalances ? '••••' : formatCurrency(totalSavingUSD, currency)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-success)', fontWeight: 700 }}>
              {savingProgress}% of {formatCurrency(currentGoal, currency)} ({savingPeriod === 'DAILY' ? 'Daily' : savingPeriod === 'WEEKLY' ? 'Weekly' : 'Monthly'}) goal
            </div>
          </div>
        )}

        {activeTypeTab === 'ALL' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Expenses</div>
              <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0' }}>
                {hideBalances ? '••••' : formatCurrency(totalExpenseUSD, currency)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{expenseItems.length} entries</div>
            </div>

            <div className="glass-panel" style={{ padding: '14px', borderColor: 'rgba(126, 231, 135, 0.3)', backgroundColor: 'rgba(126, 231, 135, 0.08)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Savings</div>
              <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-success)', margin: '4px 0' }}>
                {hideBalances ? '••••' : formatCurrency(totalSavingUSD, currency)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-success)', fontWeight: 700 }}>{savingItems.length} entries</div>
            </div>
          </div>
        )}
      </div>

      {/* Trip Folder Travel & Event Organizer Bar */}
      <TripFolderBar />

      {/* Dynamic 1-Tap Quick Log Section based on active mode */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color={activeTypeTab === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)'} />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
              {activeTypeTab === 'SAVING' ? '1-Tap Savings Quick Log' : '1-Tap Expense Quick Log'}
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {activeTypeTab === 'SAVING' ? 'Tap to save into vault' : 'Tap to log expense'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {displayedPresets.map(preset => (
            <button
              key={preset.id}
              className="glass-panel"
              onClick={() => handleOpenPresetModal(preset)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                cursor: 'pointer',
                flexShrink: 0,
                borderColor: preset.type === 'SAVING' ? 'rgba(126, 231, 135, 0.35)' : 'var(--border-glass)',
                backgroundColor: preset.type === 'SAVING' ? 'rgba(126, 231, 135, 0.08)' : 'var(--bg-card)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  border: preset.type === 'SAVING' ? '1px solid rgba(126, 231, 135, 0.35)' : '1px solid rgba(46, 170, 220, 0.3)',
                  backgroundColor: preset.type === 'SAVING' ? 'rgba(126, 231, 135, 0.15)' : 'rgba(46, 170, 220, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: preset.type === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)',
                }}
              >
                <CategoryIconRenderer icon={preset.icon} size={16} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{preset.title}</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: preset.type === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)',
                  }}
                >
                  {formatCurrency(preset.amount, currency)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Preset Confirmation Payment Modal */}
      {activePreset && (
        <div className="modal-sheet-overlay" onClick={() => setActivePreset(null)}>
          <div className="modal-sheet-content" onClick={e => e.stopPropagation()}>
            {/* iOS Drag Handle */}
            <div className="modal-sheet-handle" />
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: activePreset.type === 'SAVING' ? 'rgba(126, 231, 135, 0.15)' : 'rgba(46, 170, 220, 0.15)',
                    border: activePreset.type === 'SAVING' ? '1px solid rgba(126, 231, 135, 0.35)' : '1px solid rgba(46, 170, 220, 0.3)',
                    color: activePreset.type === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIconRenderer icon={activePreset.icon} size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Confirm {activePreset.title}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Select type & payment method</span>
                </div>
              </div>
              <button
                onClick={() => setActivePreset(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Transaction Type Selector */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Transaction Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
                {[
                  { id: 'EXPENSE', label: 'Expense', icon: ArrowDownRight },
                  { id: 'SAVING', label: 'Saving', icon: PiggyBank },
                  { id: 'INCOME', label: 'Income', icon: ArrowUpRight },
                ].map(t => {
                  const isActive = selectedType === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      className="glass-pill"
                      onClick={() => setSelectedType(t.id as TransactionType)}
                      style={{
                        justifyContent: 'center',
                        padding: '8px 4px',
                        backgroundColor: isActive
                          ? t.id === 'SAVING'
                            ? 'rgba(126, 231, 135, 0.25)'
                            : 'var(--accent)'
                          : 'rgba(255, 255, 255, 0.06)',
                        borderColor: isActive
                          ? t.id === 'SAVING'
                            ? 'var(--accent-success)'
                            : 'var(--accent)'
                          : 'var(--border-glass)',
                        color: isActive
                          ? t.id === 'SAVING'
                            ? 'var(--accent-success)'
                            : '#FFF'
                          : 'var(--text-primary)',
                        fontSize: '11px',
                        gap: '4px',
                      }}
                    >
                      <Icon size={12} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Amount Input */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Amount (USD $)
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
                        backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-glass)',
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

            {/* Confirm Button */}
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
                backgroundColor: selectedType === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)',
                color: selectedType === 'SAVING' ? '#141416' : '#FFF',
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

      {/* Transactions Database Header & Filter Control Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={18} color="var(--accent)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Transactions Database</h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(46, 170, 220, 0.15)',
              color: 'var(--accent)',
            }}
          >
            {filteredExpenses.length} shown
          </span>
        </div>

        <FilterControlBar />
      </div>

      {/* Expenses List */}
      <div>
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(item => (
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
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>No {activeTypeTab === 'SAVING' ? 'savings' : 'expenses'} match filters</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Try switching your top filter tab, keywords, or payment method.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
