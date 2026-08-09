import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check, PiggyBank, Shield, Target, Home, Laptop, Smartphone, Car, FolderPlus } from 'lucide-react';

export const CreateSavingFolderModal: React.FC = () => {
  const { isCreateSavingFolderOpen, setIsCreateSavingFolderOpen, addTrip, currency } = useExpenses();

  const [name, setName] = useState('House');
  const [category, setCategory] = useState('House');
  const [budget, setBudget] = useState('2000');
  const [daysCount, setDaysCount] = useState<number>(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isCreateSavingFolderOpen) return null;

  const calculateEndDate = (startStr: string, days: number): string => {
    const d = new Date(startStr);
    d.setDate(d.getDate() + Math.max(0, days - 1));
    return d.toISOString().split('T')[0];
  };

  const handleTemplateSelect = (templateName: string, iconCategory: string, defaultBudget: number, defaultDays: number) => {
    setName(templateName);
    setCategory(iconCategory);
    setBudget(defaultBudget.toString());
    setDaysCount(defaultDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBudget = parseFloat(budget);
    if (!name.trim() || isNaN(numBudget) || numBudget <= 0) {
      alert('Please enter a valid target amount and title.');
      return;
    }

    const computedEnd = calculateEndDate(startDate, daysCount);

    addTrip({
      name: name.trim(),
      category: category,
      budget: numBudget,
      currency: currency,
      startDate: startDate,
      endDate: computedEnd,
      status: 'Active',
      type: 'SAVING',
    });

    setIsCreateSavingFolderOpen(false);
  };

  const templates = [
    { label: 'House', icon: Home, cat: 'House', defaultB: 2000, days: 30 },
    { label: 'Gadget', icon: Laptop, cat: 'Gadget', defaultB: 800, days: 30 },
    { label: 'Phone', icon: Smartphone, cat: 'Phone', defaultB: 600, days: 30 },
    { label: 'Car', icon: Car, cat: 'Car', defaultB: 3000, days: 30 },
    { label: 'Vault', icon: PiggyBank, cat: 'Vault', defaultB: 500, days: 30 },
    { label: 'Emergency', icon: Shield, cat: 'Emergency', defaultB: 1000, days: 60 },
  ];

  return (
    <div className="modal-sheet-overlay" onClick={() => setIsCreateSavingFolderOpen(false)}>
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
                border: '1px solid rgba(126, 231, 135, 0.35)',
                color: 'var(--accent-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Saving Folder</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>House, Gadget & Goals</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateSavingFolderOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Goal Templates Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Goal Templates
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
            {templates.map(t => {
              const isActive = category === t.cat;
              const Icon = t.icon;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => handleTemplateSelect(t.label, t.cat, t.defaultB, t.days)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '10px',
                    border: isActive ? '1px solid var(--accent-success)' : '1px solid var(--border-glass)',
                    backgroundColor: isActive ? 'rgba(126, 231, 135, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? 'var(--accent-success)' : 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Folder Title Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Title
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. House, Gadget, Phone, Car"
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

        {/* Duration Days Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Duration (Days)
          </label>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
            <input
              type="number"
              min={1}
              max={365}
              value={daysCount}
              onChange={e => setDaysCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '75px',
                height: '38px',
                padding: '0 8px',
                borderRadius: '10px',
                border: '1px solid var(--accent-success)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 800,
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }}>
              {[1, 3, 7, 14, 30].map(d => {
                const isActive = daysCount === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysCount(d)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '8px',
                      border: isActive ? '1px solid var(--accent-success)' : '1px solid var(--border-glass)',
                      backgroundColor: isActive ? 'var(--accent-success)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#FFF' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    {d}d
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Savings Target Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Target ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            value={budget}
            onChange={e => setBudget(e.target.value)}
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

        {/* Start Date Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
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

        {/* Confirm Create Button */}
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
          Create
        </button>
      </form>
    </div>
  );
};
