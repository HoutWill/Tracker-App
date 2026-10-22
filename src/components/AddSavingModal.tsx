import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { getTodayDateString } from '../services/storageService';
import { PaymentMethod } from '../types';
import { X, Plus, PiggyBank } from 'lucide-react';

export const AddSavingModal: React.FC = () => {
  const { isAddSavingOpen, setIsAddSavingOpen, addExpense, categories, currency, trips, selectedTripId, selectedDate } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [itemCurrency, setItemCurrency] = useState<'USD' | 'KHR'>(currency || 'USD');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [dateStr, setDateStr] = useState(getTodayDateString());
  const [tripId, setTripId] = useState<string | undefined>(selectedTripId || undefined);
  const [notes, setNotes] = useState('');

  // Pure Savings Vault categories list
  const savingCategories = categories.filter(c => c.type === 'SAVING' || c.id.startsWith('cat-saving'));
  const savingFolders = trips.filter(t => t.type === 'SAVING' || ['vault', 'emergency', 'goal', 'gold', 'stocks'].includes(t.category.toLowerCase()));

  const quickUSDAmounts = [5, 10, 20, 50, 100, 200, 500];
  const quickKHRAmounts = [20000, 40000, 50000, 100000, 200000, 500000, 1000000];
  const quickAmounts = itemCurrency === 'KHR' ? quickKHRAmounts : quickUSDAmounts;

  useEffect(() => {
    if (isAddSavingOpen) {
      setCategoryId(savingCategories[0]?.id || 'cat-saving-vault');
      setPaymentMethod('Bank');
      setDateStr(selectedDate || getTodayDateString());
      setTripId(selectedTripId || undefined);
      setItemCurrency(currency || 'USD');
    }
  }, [isAddSavingOpen, selectedTripId, selectedDate, currency]);

  if (!isAddSavingOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    const cleanTitle = title.trim().slice(0, 150);
    if (!cleanTitle || isNaN(num) || num <= 0 || num > 1000000000) {
      alert('Invalid');
      return;
    }

    const cat = categories.find(c => c.id === categoryId) || savingCategories[0];
    const safeDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : getTodayDateString();

    // Close modal and reset inputs INSTANTLY for 0ms UI lag
    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddSavingOpen(false);

    const amountUSD = itemCurrency === 'KHR' ? num / 4000 : num;

    addExpense({
      title: cleanTitle,
      amount: amountUSD,
      currency: itemCurrency,
      amountOriginal: num,
      type: 'SAVING',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: safeDate,
      paymentMethod,
      notes: notes.trim().slice(0, 500),
      tripId: tripId,
    });
  };

  return (
    <div className="modal-sheet-overlay" onClick={() => setIsAddSavingOpen(false)}>
      <form
        className="modal-sheet-content"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{ borderColor: 'rgba(126, 231, 135, 0.4)' }}
      >
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
                backgroundColor: 'rgba(126, 231, 135, 0.15)',
                border: '1px solid rgba(126, 231, 135, 0.4)',
                color: 'var(--accent-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Deposit</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddSavingOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Vault Deposit..."
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

        {/* Deposit Amount & Currency Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Amount & Currency
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
              style={{
                flex: 1,
                height: '42px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--accent-success)',
                fontSize: '15px',
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
                onClick={() => {
                  if (itemCurrency === 'KHR') {
                    const n = parseFloat(amount);
                    if (!isNaN(n) && n >= 1000) setAmount((n / 4000).toString());
                  }
                  setItemCurrency('USD');
                }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: itemCurrency === 'USD' ? 'var(--accent-success)' : 'transparent',
                  color: itemCurrency === 'USD' ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: itemCurrency === 'USD' ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: itemCurrency === 'USD' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => {
                  if (itemCurrency === 'USD') {
                    const n = parseFloat(amount);
                    if (!isNaN(n) && n > 0 && n <= 100) setAmount((n * 4000).toString());
                  }
                  setItemCurrency('KHR');
                }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: itemCurrency === 'KHR' ? 'var(--accent-success)' : 'transparent',
                  color: itemCurrency === 'KHR' ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: itemCurrency === 'KHR' ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: itemCurrency === 'KHR' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                ៛ KHR
              </button>
            </div>
          </div>
          {/* Quick Amount Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '8px', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {quickAmounts.map(val => {
              const isSelected = parseFloat(amount) === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="glass-pill"
                  style={{
                    padding: '6px 11px',
                    borderRadius: '9px',
                    backgroundColor: isSelected ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isSelected ? 'var(--accent-success)' : 'var(--border-glass)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 800 : 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {itemCurrency === 'KHR' ? `${val.toLocaleString()}៛` : `$${val}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bucket Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Bucket
          </label>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px', paddingBottom: '4px' }}>
            {savingCategories.map(cat => {
              const isActive = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="glass-pill"
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isActive ? 'var(--accent-success)' : 'var(--border-glass)',
                    color: isActive ? '#FFF' : 'var(--text-primary)',
                    fontWeight: isActive ? 800 : 600,
                  }}
                >
                  <CategoryIconRenderer icon={cat.icon} size={12} color={isActive ? '#FFF' : 'var(--accent-success)'} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Source
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {(['Cash', 'Bank'] as const).map(pm => {
              const isActive = paymentMethod === pm;
              return (
                <button
                  key={pm}
                  type="button"
                  className="glass-pill"
                  onClick={() => setPaymentMethod(pm)}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isActive ? 'var(--accent-success)' : 'var(--border-glass)',
                    color: isActive ? '#FFF' : 'var(--text-primary)',
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
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
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

        {/* Optional Saving Folder Selector */}
        {savingFolders.length > 0 && (
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Folder
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              <button
                type="button"
                className="glass-pill"
                onClick={() => setTripId(undefined)}
                style={{
                  backgroundColor: !tripId ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: !tripId ? 'var(--accent-success)' : 'var(--border-glass)',
                  color: !tripId ? '#FFF' : 'var(--text-primary)',
                  fontSize: '11px',
                }}
              >
                None
              </button>
              {savingFolders.map(t => {
                const isActive = tripId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className="glass-pill"
                    onClick={() => setTripId(t.id)}
                    style={{
                      backgroundColor: isActive ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isActive ? 'var(--accent-success)' : 'var(--border-glass)',
                      color: isActive ? '#FFF' : 'var(--text-primary)',
                      fontSize: '11px',
                    }}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Memo Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Memo
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Memo..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              marginTop: '4px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Submit Button */}
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
            backgroundColor: 'var(--accent-success)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '6px',
          }}
        >
          <Plus size={18} />
          Deposit
        </button>
      </form>
    </div>
  );
};
