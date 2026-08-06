import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { PaymentMethod, TransactionType } from '../types';
import { X, Trash2, Check, PiggyBank, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const ExpenseDetailModal: React.FC = () => {
  const {
    selectedExpenseForEdit,
    setSelectedExpenseForEdit,
    updateExpense,
    deleteExpense,
    categories,
  } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedExpenseForEdit) {
      setTitle(selectedExpenseForEdit.title || '');
      setAmount(selectedExpenseForEdit.amount ? selectedExpenseForEdit.amount.toString() : '0');
      setType(selectedExpenseForEdit.type || (selectedExpenseForEdit.categoryId === 'cat-saving' ? 'SAVING' : 'EXPENSE'));
      setCategoryId(selectedExpenseForEdit.categoryId || categories[0]?.id || 'cat-food');
      setPaymentMethod(selectedExpenseForEdit.paymentMethod || 'Cash');
      setDateStr(selectedExpenseForEdit.date || new Date().toISOString().split('T')[0]);
      setNotes(selectedExpenseForEdit.notes || '');
    }
  }, [selectedExpenseForEdit]);

  if (!selectedExpenseForEdit) return null;

  const handleUpdate = async () => {
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) {
      alert('Please enter a valid title and positive amount.');
      return;
    }

    const selectedCat = categories.find(c => c.id === categoryId) || categories[0];

    await updateExpense(selectedExpenseForEdit.id, {
      title: title.trim(),
      amount: num,
      type,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      categoryIcon: selectedCat.icon,
      categoryColor: selectedCat.color,
      paymentMethod,
      date: dateStr,
      notes: notes.trim(),
    });
    setSelectedExpenseForEdit(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${selectedExpenseForEdit.title}"?`)) {
      deleteExpense(selectedExpenseForEdit.id);
      setSelectedExpenseForEdit(null);
    }
  };

  return (
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
      onClick={() => setSelectedExpenseForEdit(null)}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(46, 170, 220, 0.15)',
                border: '1px solid rgba(46, 170, 220, 0.3)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryIconRenderer icon={selectedExpenseForEdit.categoryIcon || 'receipt-outline'} size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Edit Record</h3>
          </div>
          <button
            onClick={() => setSelectedExpenseForEdit(null)}
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
              const isActive = type === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  className="glass-pill"
                  onClick={() => setType(t.id as TransactionType)}
                  style={{
                    justifyContent: 'center',
                    padding: '8px 4px',
                    backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border-glass)',
                    color: isActive ? '#FFF' : 'var(--text-primary)',
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

        {/* Title Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Title / Name
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
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

        {/* Amount Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Amount (USD $)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
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

        {/* Category Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px', paddingBottom: '4px' }}>
            {categories.map(cat => {
              const isActive = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
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
            Payment Method
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {(['Cash', 'Bank'] as const).map(pm => {
              const isActive = paymentMethod === pm;
              return (
                <button
                  key={pm}
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
            Date (YYYY-MM-DD)
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
            Notes / Memo
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

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 123, 114, 0.35)',
              backgroundColor: 'rgba(255, 123, 114, 0.15)',
              color: 'var(--accent-danger)',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>

          <button
            onClick={handleUpdate}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
