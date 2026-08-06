import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { PaymentMethod } from '../types';
import { X, Check, PiggyBank, Trash2 } from 'lucide-react';

export const EditSavingModal: React.FC = () => {
  const { selectedExpenseForEdit, setSelectedExpenseForEdit, updateExpense, deleteExpense, categories, currency } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');

  const isSavingItem = selectedExpenseForEdit?.type === 'SAVING' || selectedExpenseForEdit?.categoryId.startsWith('cat-saving');

  // Pure Savings Vault categories list
  const savingCategories = categories.filter(c => c.type === 'SAVING' || c.id.startsWith('cat-saving'));

  useEffect(() => {
    if (selectedExpenseForEdit && isSavingItem) {
      setTitle(selectedExpenseForEdit.title || '');
      setAmount(selectedExpenseForEdit.amount ? selectedExpenseForEdit.amount.toString() : '0');
      setCategoryId(selectedExpenseForEdit.categoryId || savingCategories[0]?.id || 'cat-saving-vault');
      setPaymentMethod(selectedExpenseForEdit.paymentMethod || 'Bank');
      setDateStr(selectedExpenseForEdit.date || new Date().toISOString().split('T')[0]);
      setNotes(selectedExpenseForEdit.notes || '');
    }
  }, [selectedExpenseForEdit]);

  if (!selectedExpenseForEdit || !isSavingItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) {
      alert('Please enter a valid title and amount.');
      return;
    }

    const cat = categories.find(c => c.id === categoryId) || savingCategories[0];

    const editId = selectedExpenseForEdit.id;
    // Close modal INSTANTLY for 0ms UI lag
    setSelectedExpenseForEdit(null);

    updateExpense(editId, {
      title: title.trim(),
      amount: num,
      type: 'SAVING',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: dateStr,
      paymentMethod,
      notes: notes.trim(),
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete deposit "${selectedExpenseForEdit.title}"?`)) {
      const editId = selectedExpenseForEdit.id;
      // Close modal INSTANTLY for 0ms UI lag
      setSelectedExpenseForEdit(null);
      deleteExpense(editId);
    }
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
      onClick={() => setSelectedExpenseForEdit(null)}
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
          borderColor: 'rgba(0, 230, 118, 0.4)',
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
                backgroundColor: 'rgba(0, 230, 118, 0.15)',
                border: '1px solid rgba(0, 230, 118, 0.4)',
                color: 'var(--accent-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Edit</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: 'rgba(255, 82, 82, 0.15)',
                border: '1px solid rgba(255, 82, 82, 0.3)',
                color: 'var(--accent-danger)',
                borderRadius: '10px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedExpenseForEdit(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
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
            Amount ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
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

        {/* Notes Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Memo
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
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

        {/* Save Button */}
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
          <Check size={18} />
          Save
        </button>
      </form>
    </div>
  );
};
