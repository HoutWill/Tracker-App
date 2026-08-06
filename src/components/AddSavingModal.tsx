import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { PaymentMethod } from '../types';
import { X, Plus, PiggyBank } from 'lucide-react';

export const AddSavingModal: React.FC = () => {
  const { isAddSavingOpen, setIsAddSavingOpen, addExpense, categories, currency, trips, selectedTripId } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [tripId, setTripId] = useState<string | undefined>(selectedTripId || undefined);
  const [notes, setNotes] = useState('');

  // Pure Savings Vault categories list
  const savingCategories = categories.filter(c => c.type === 'SAVING' || c.id.startsWith('cat-saving'));
  const savingFolders = trips.filter(t => t.type === 'SAVING' || ['vault', 'emergency', 'goal', 'gold', 'stocks'].includes(t.category.toLowerCase()));

  useEffect(() => {
    if (isAddSavingOpen) {
      setCategoryId(savingCategories[0]?.id || 'cat-saving-vault');
      setPaymentMethod('Bank');
      setDateStr(new Date().toISOString().split('T')[0]);
      setTripId(selectedTripId || undefined);
    }
  }, [isAddSavingOpen, selectedTripId]);

  if (!isAddSavingOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) {
      alert('Please enter a valid deposit title and amount.');
      return;
    }

    const cat = categories.find(c => c.id === categoryId) || savingCategories[0];

    await addExpense({
      title: title.trim(),
      amount: num,
      currency: currency,
      type: 'SAVING',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: dateStr,
      paymentMethod,
      notes: notes.trim(),
      tripId: tripId,
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddSavingOpen(false);
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
      onClick={() => setIsAddSavingOpen(false)}
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
          borderColor: 'rgba(126, 231, 135, 0.4)',
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

        {/* Deposit Amount Input */}
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
              color: 'var(--accent-success)',
              fontSize: '15px',
              fontWeight: 800,
              marginTop: '4px',
              outline: 'none',
            }}
          />
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
