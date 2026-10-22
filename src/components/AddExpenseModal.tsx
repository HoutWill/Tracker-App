import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { getTodayDateString } from '../services/storageService';
import { PaymentMethod } from '../types';
import { X, Plus, ArrowDownRight, Mic, Square } from 'lucide-react';
import { startVoiceRecognition } from '../services/speechService';

export const AddExpenseModal: React.FC = () => {
  const { isAddExpenseOpen, setIsAddExpenseOpen, addExpense, categories, currency, trips, selectedTripId, selectedDate } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [itemCurrency, setItemCurrency] = useState<'USD' | 'KHR'>(currency || 'USD');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [dateStr, setDateStr] = useState(getTodayDateString());
  const [tripId, setTripId] = useState<string | undefined>(selectedTripId || undefined);
  const [notes, setNotes] = useState('');
  const [activeField, setActiveField] = useState<'title' | 'notes' | null>(null);

  const quickUSDAmounts = [1, 1.5, 2, 2.5, 3, 5, 10, 20];
  const quickKHRAmounts = [1000, 2000, 4000, 5000, 10000, 20000, 40000, 50000];
  const quickAmounts = itemCurrency === 'KHR' ? quickKHRAmounts : quickUSDAmounts;

  const recognitionRef = useRef<any>(null);

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setActiveField(null);
  };

  const handleVoiceInput = (field: 'title' | 'notes') => {
    if (activeField === field) {
      stopVoiceInput();
      return;
    }

    stopVoiceInput();
    setActiveField(field);

    const rec = startVoiceRecognition(
      (text, isFinal) => {
        if (field === 'title') {
          setTitle(text);
        } else {
          setNotes(text);
        }
        if (isFinal) {
          stopVoiceInput();
        }
      },
      () => setActiveField(null),
      () => setActiveField(null)
    );

    recognitionRef.current = rec;
  };

  // Pure Expense categories list
  const expenseCategories = categories.filter(c => c.type !== 'SAVING' && c.type !== 'INCOME' && !c.id.startsWith('cat-saving'));

  useEffect(() => {
    if (isAddExpenseOpen) {
      setCategoryId(expenseCategories[0]?.id || 'cat-food');
      setPaymentMethod('Cash');
      setDateStr(selectedDate || getTodayDateString());
      setTripId(selectedTripId || undefined);
      setItemCurrency(currency || 'USD');
    }
  }, [isAddExpenseOpen, selectedTripId, selectedDate, currency]);

  if (!isAddExpenseOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    const cleanTitle = title.trim().slice(0, 150);
    if (!cleanTitle || isNaN(num) || num <= 0 || num > 1000000000) {
      alert('Invalid');
      return;
    }

    const cat = categories.find(c => c.id === categoryId) || expenseCategories[0];
    const safeDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : getTodayDateString();

    // Close modal and reset inputs INSTANTLY for 0ms UI lag
    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddExpenseOpen(false);

    const amountUSD = itemCurrency === 'KHR' ? num / 4000 : num;

    addExpense({
      title: cleanTitle,
      amount: amountUSD,
      currency: itemCurrency,
      amountOriginal: num,
      type: 'EXPENSE',
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
    <div className="modal-sheet-overlay" onClick={() => setIsAddExpenseOpen(false)}>
      <form
        className="modal-sheet-content"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{ borderColor: 'rgba(46, 170, 220, 0.35)' }}
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
                backgroundColor: 'rgba(46, 170, 220, 0.15)',
                border: '1px solid rgba(46, 170, 220, 0.35)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowDownRight size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Expense</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input with Voice & Cancel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Title
            </label>
            <button
              type="button"
              onClick={() => handleVoiceInput('title')}
              style={{
                background: 'none',
                border: 'none',
                color: activeField === 'title' ? 'var(--accent-danger)' : 'var(--accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title="Speak to dictate title"
            >
              {activeField === 'title' ? <Square size={13} fill="currentColor" /> : <Mic size={14} />}
              <span>{activeField === 'title' ? 'Cancel' : 'Voice'}</span>
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={activeField === 'title' ? 'Listening... Speak now' : 'Coffee, Dinner...'}
            required
            style={{
              width: '100%',
              height: '42px',
              padding: '0 12px',
              borderRadius: '10px',
              border: activeField === 'title' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              marginTop: '4px',
              outline: 'none',
            }}
          />
        </div>

        {/* Amount & Currency Input */}
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
                color: 'var(--accent-danger)',
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
                  backgroundColor: itemCurrency === 'USD' ? 'var(--accent)' : 'transparent',
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
                  backgroundColor: itemCurrency === 'KHR' ? 'var(--accent)' : 'transparent',
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
                    backgroundColor: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-glass)',
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

        {/* Expense Category Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px', paddingBottom: '4px' }}>
            {expenseCategories.map(cat => {
              const isActive = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="glass-pill"
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border-glass)',
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

        {/* Payment Method Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Payment
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
                    backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border-glass)',
                    color: isActive ? '#FFF' : 'var(--text-primary)',
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

        {/* Optional Trip Folder Selector */}
        {trips.length > 0 && (
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
                  backgroundColor: !tripId ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: !tripId ? 'var(--accent)' : 'var(--border-glass)',
                  color: !tripId ? '#FFF' : 'var(--text-primary)',
                  fontSize: '11px',
                }}
              >
                None
              </button>
              {trips.map(t => {
                const isActive = tripId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className="glass-pill"
                    onClick={() => setTripId(t.id)}
                    style={{
                      backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border-glass)',
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

        {/* Notes Input with Voice & Cancel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Notes
            </label>
            <button
              type="button"
              onClick={() => handleVoiceInput('notes')}
              style={{
                background: 'none',
                border: 'none',
                color: activeField === 'notes' ? 'var(--accent-danger)' : 'var(--accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title="Speak to dictate notes"
            >
              {activeField === 'notes' ? <Square size={13} fill="currentColor" /> : <Mic size={14} />}
              <span>{activeField === 'notes' ? 'Cancel' : 'Voice'}</span>
            </button>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder={activeField === 'notes' ? 'Listening... Speak now' : 'Notes...'}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: activeField === 'notes' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
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
            backgroundColor: 'var(--accent)',
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
  );
};
