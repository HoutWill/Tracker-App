import React, { useState } from 'react';
import { useExpenses, TypeTabOption } from '../context/ExpenseContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { TripFolderBar } from '../components/TripFolderBar';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { EXPENSE_QUICK_PRESETS, SAVING_QUICK_PRESETS, QUICK_PRESETS } from '../constants/presets';
import { formatCurrency } from '../services/storageService';
import { PaymentMethod, TransactionType } from '../types';
import { Plus, Zap, Filter, CheckCircle2, Layers, SearchX, X, Check, PiggyBank, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    expenses,
    filteredExpenses,
    currency,
    categories,
    monthlyBudget,
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
  const [activePreset, setActivePreset] = useState<typeof QUICK_PRESETS[0] | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [selectedType, setSelectedType] = useState<TransactionType>('EXPENSE');
  const [presetAmount, setPresetAmount] = useState<string>('');
  const [presetDate, setPresetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const expenseItems = expenses.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));
  const savingItems = expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const totalExpenseUSD = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const totalSavingUSD = savingItems.reduce((sum, e) => sum + e.amount, 0);

  const budgetProgress = Math.min(100, Math.round((totalExpenseUSD / (monthlyBudget || 1000)) * 100));

  // Dynamic presets based on active top tab
  const displayedPresets =
    activeTypeTab === 'SAVING'
      ? SAVING_QUICK_PRESETS
      : activeTypeTab === 'EXPENSE'
      ? EXPENSE_QUICK_PRESETS
      : QUICK_PRESETS;

  const handleOpenPresetModal = (preset: typeof QUICK_PRESETS[0]) => {
    setActivePreset(preset);
    setPresetAmount(preset.amount.toString());
    setPresetDate(new Date().toISOString().split('T')[0]);
    setSelectedPayment('Cash');
    setSelectedType(preset.type || (preset.categoryId.startsWith('cat-saving') ? 'SAVING' : 'EXPENSE'));
  };

  const handleConfirmPreset = async () => {
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

    await addExpense({
      title: activePreset.title,
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

    setToastMsg(`Logged ${selectedType} "${activePreset.title}" (${formatCurrency(num, currency)})!`);
    setActivePreset(null);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Toast Feedback Notification */}
      {toastMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(126, 231, 135, 0.35)',
            backgroundColor: 'rgba(126, 231, 135, 0.15)',
            color: 'var(--accent-success)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Segmented Category Mode Switcher: Expenses vs Savings vs All */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '14px',
          gap: '4px',
        }}
      >
        {[
          { id: 'EXPENSE', label: 'Expenses Only', icon: ArrowDownRight, count: expenseItems.length },
          { id: 'SAVING', label: 'Savings Vault', icon: PiggyBank, count: savingItems.length },
          { id: 'ALL', label: 'All Records', icon: Layers, count: expenses.length },
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
                padding: '10px 6px',
                borderRadius: '10px',
                border: isActive
                  ? tab.id === 'SAVING'
                    ? '1px solid var(--accent-success)'
                    : '1px solid var(--accent)'
                  : '1px solid transparent',
                backgroundColor: isActive
                  ? tab.id === 'SAVING'
                    ? 'rgba(126, 231, 135, 0.2)'
                    : 'var(--accent)'
                  : 'transparent',
                color: isActive
                  ? tab.id === 'SAVING'
                    ? 'var(--accent-success)'
                    : '#FFF'
                  : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>({tab.count})</span>
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
                {budgetProgress}% of {formatCurrency(monthlyBudget || 1000, currency)} target
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
              Dedicated Savings & Emergency Vault Funds
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
            }}
          >
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

      {/* Floating Action Button (FAB) for Quick Add */}
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
          backgroundColor: activeTypeTab === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)',
          color: activeTypeTab === 'SAVING' ? '#141416' : '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(46, 170, 220, 0.4)',
          cursor: 'pointer',
          zIndex: 40,
        }}
        title="Record New Entry"
      >
        <Plus size={26} />
      </button>
    </div>
  );
};
