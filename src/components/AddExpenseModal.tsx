import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { getTodayDateString } from '../services/storageService';
import { PaymentMethod } from '../types';
import { X, Plus, ArrowDownRight, Mic, Square } from 'lucide-react';
import { startVoiceRecognition } from '../services/speechService';

export const AddExpenseModal: React.FC = () => {
  const { isAddExpenseOpen, setIsAddExpenseOpen, addExpense, categories, currency, trips, selectedTripId } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [dateStr, setDateStr] = useState(getTodayDateString());
  const [tripId, setTripId] = useState<string | undefined>(selectedTripId || undefined);
  const [notes, setNotes] = useState('');
  const [activeField, setActiveField] = useState<'title' | 'notes' | null>(null);

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
      setDateStr(getTodayDateString());
      setTripId(selectedTripId || undefined);
    }
  }, [isAddExpenseOpen, selectedTripId]);

  if (!isAddExpenseOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    const cat = categories.find(c => c.id === categoryId) || expenseCategories[0];

    // Close modal and reset inputs INSTANTLY for 0ms UI lag
    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddExpenseOpen(false);

    addExpense({
      title: title.trim(),
      amount: num,
      currency: currency,
      type: 'EXPENSE',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: dateStr,
      paymentMethod,
      notes: notes.trim(),
      tripId: tripId,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsAddExpenseOpen(false)}
    >
      <form
        className="glass-panel"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderColor: 'rgba(46, 170, 220, 0.35)',
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

        {/* Amount Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            required
            style={{
              width: '100%',
              height: '42px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--accent-danger)',
              fontSize: '15px',
              fontWeight: 800,
              marginTop: '4px',
              outline: 'none',
            }}
          />
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
