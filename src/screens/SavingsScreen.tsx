import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme, hexToRgba, getPresetColor } from '../context/ThemeContext';
import { ExpenseCard } from '../components/ExpenseCard';
import { FilterControlBar } from '../components/FilterControlBar';
import { TripFolderBar } from '../components/TripFolderBar';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { SAVING_QUICK_PRESETS } from '../constants/presets';
import { formatCurrency, StorageService } from '../services/storageService';
import { PaymentMethod, QuickPreset } from '../types';
import { Plus, Zap, CheckCircle2, Layers, SearchX, X, Check, PiggyBank, Target, TrendingUp, Trash2 } from 'lucide-react';

const SAVING_PRESET_ICONS = [
  'piggy-bank', 'vault', 'wallet', 'shield-check', 'target', 'trending-up',
  'coins', 'sparkles', 'lock', 'card', 'briefcase', 'gift', 'building', 'home',
  'plane', 'heart'
];

export const SavingsScreen: React.FC = () => {
  const { pageColors } = useTheme();
  const pageAccent = pageColors?.SAVING || '#00B894';

  const {
    expenses,
    filteredExpenses,
    currency,
    categories,
    savingGoal,
    setSavingGoal,
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
  const [presetDate, setPresetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Edit Savings Goal Target state
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>(savingGoal.toString());

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

  const currentGoal = savingGoal || 2000;
  const goalProgressPct = Math.min(100, Math.round((totalSavingUSD / currentGoal) * 100));

  const handleOpenPresetModal = (preset: QuickPreset) => {
    setActivePreset(preset);
    setPresetAmount(preset.amount.toString());
    setPresetCurrency(preset.currency || 'USD');
    setPresetDate(new Date().toISOString().split('T')[0]);
    setSelectedPayment('Bank');
  };

  const handleConfirmPreset = async () => {
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

    await addExpense({
      title: activePreset.title,
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

    setToastMsg(`Saved "${activePreset.title}" (${formatCurrency(amountUSD, currency)})!`);
    setActivePreset(null);
    setTimeout(() => setToastMsg(null), 3000);
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
    setSavingGoal(val);
    setIsEditingGoal(false);
    setToastMsg(`Saving goal updated to ${formatCurrency(val, currency)}!`);
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

    const updatedList = [...presetsList, newPreset];
    setPresetsList(updatedList);
    StorageService.savePresetsList('SAVING', updatedList);

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
            border: `1px solid ${hexToRgba(pageAccent, 0.4)}`,
            backgroundColor: hexToRgba(pageAccent, 0.18),
            color: pageAccent,
            fontSize: '14px',
            fontWeight: 800,
            marginBottom: '14px',
            boxShadow: `0 8px 24px ${hexToRgba(pageAccent, 0.25)}`,
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Unified All-in-One Hero Vault Card displaying Saved, Goal, Progress Bar, and Metrics */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          borderColor: hexToRgba(pageAccent, 0.4),
          backgroundColor: hexToRgba(pageAccent, 0.12),
          marginBottom: '16px',
        }}
      >
        {/* Top Header Row with Goal Editor Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pageAccent }}>
            <PiggyBank size={20} />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>Vault</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="glass-pill"
              onClick={() => {
                setCustomGoalInput(currentGoal.toString());
                setIsEditingGoal(true);
              }}
              style={{ fontSize: '11px', padding: '3px 8px', color: pageAccent, borderColor: hexToRgba(pageAccent, 0.4) }}
              title="Set Saving Goal Target"
            >
              <Target size={12} /> Goal: {formatCurrency(currentGoal, currency)}
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
              {savingItems.length}
            </span>
          </div>
        </div>

        {/* Main Big Balance Amount */}
        <div
          className="tabular-nums"
          style={{
            fontSize: '34px',
            fontWeight: 800,
            letterSpacing: '-0.8px',
            color: pageAccent,
            marginBottom: '14px',
          }}
        >
          {hideBalances ? '••••••••' : formatCurrency(totalSavingUSD, currency)}
        </div>

        {/* Savings Goal Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Target: {formatCurrency(currentGoal, currency)}
            </span>
            <span style={{ color: pageAccent, fontWeight: 800 }}>
              {goalProgressPct}% Completed
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
                width: `${goalProgressPct}%`,
                backgroundColor: pageAccent,
                borderRadius: '4px',
                boxShadow: `0 0 10px ${hexToRgba(pageAccent, 0.4)}`,
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
                borderRadius: '8px',
                backgroundColor: hexToRgba(pageAccent, 0.2),
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
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Saved</div>
              <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800, color: pageAccent }}>
                {hideBalances ? '••••' : formatCurrency(totalSavingUSD, currency)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: hexToRgba(pageAccent, 0.2),
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
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Average</div>
              <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800 }}>
                {hideBalances ? '••••' : formatCurrency(averageSavingUSD, currency)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: hexToRgba(pageAccent, 0.2),
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
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Goal</div>
              <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 800 }}>
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
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
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
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Savings Goal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Target Goal Amount
              </label>
              <input
                type="number"
                step="100"
                value={customGoalInput}
                onChange={e => setCustomGoalInput(e.target.value)}
                placeholder="2000"
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
              {[1000, 2000, 3000, 5000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  className="glass-pill"
                  onClick={() => setCustomGoalInput(amt.toString())}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: customGoalInput === amt.toString() ? pageAccent : 'rgba(255, 255, 255, 0.06)',
                    borderColor: customGoalInput === amt.toString() ? pageAccent : 'var(--border-glass)',
                    color: customGoalInput === amt.toString() ? '#FFF' : 'var(--text-primary)',
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

      {/* Saving Folder Vault & Target Organizer Bar */}
      <TripFolderBar type="SAVING" />

      {/* Grid 1-Tap Savings Quick Log Section with Vibrant Colorful Icons */}
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
            const tileColor = getPresetColor(idx + 1); // Offset by 1 for distinct colorful distribution
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
                  borderColor: hexToRgba(tileColor, 0.35),
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
                    +{formatCurrency(preset.amount, currency)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={18} color={pageAccent} />
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Records</h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: hexToRgba(pageAccent, 0.2),
              color: pageAccent,
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

      {/* Floating Action Button (FAB) for Savings Add */}
      <button
        onClick={() => setIsAddSavingOpen(true)}
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
          boxShadow: `0 8px 24px ${hexToRgba(pageAccent, 0.4)}`,
          cursor: 'pointer',
          zIndex: 40,
        }}
        title="Deposit"
      >
        <Plus size={26} />
      </button>
    </div>
  );
};
