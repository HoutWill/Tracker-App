import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { X, Check, Plane, Users, PartyPopper, Calendar, DollarSign, FolderPlus, PiggyBank, Shield, Target, Home, Laptop, Smartphone, Car } from 'lucide-react';
import { TransactionType } from '../types';

export const CreateTripModal: React.FC = () => {
  const { isCreateTripOpen, setIsCreateTripOpen, addTrip, currency, activeTypeTab } = useExpenses();

  const [type, setType] = useState<TransactionType>(activeTypeTab === 'SAVING' ? 'SAVING' : 'EXPENSE');
  const [name, setName] = useState(activeTypeTab === 'SAVING' ? 'House' : 'Travel');
  const [category, setCategory] = useState(activeTypeTab === 'SAVING' ? 'House' : 'Travel');
  const [budget, setBudget] = useState(activeTypeTab === 'SAVING' ? '2000' : '300');
  const [daysCount, setDaysCount] = useState<number>(activeTypeTab === 'SAVING' ? 30 : 3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isCreateTripOpen) return null;

  // Calculate end date based on daysCount
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
      alert('Please enter a valid folder title and budget.');
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
      type: type,
    });

    setIsCreateTripOpen(false);
  };

  const expenseTemplates = [
    { label: 'Travel', icon: Plane, cat: 'Travel', defaultB: 300, days: 3 },
    { label: 'Team', icon: Users, cat: 'Team', defaultB: 150, days: 2 },
    { label: 'Party', icon: PartyPopper, cat: 'Party', defaultB: 100, days: 1 },
  ];

  const savingTemplates = [
    { label: 'House', icon: Home, cat: 'House', defaultB: 2000, days: 30 },
    { label: 'Gadget', icon: Laptop, cat: 'Gadget', defaultB: 800, days: 30 },
    { label: 'Phone', icon: Smartphone, cat: 'Phone', defaultB: 600, days: 30 },
    { label: 'Car', icon: Car, cat: 'Car', defaultB: 3000, days: 30 },
    { label: 'Vault', icon: PiggyBank, cat: 'Vault', defaultB: 500, days: 30 },
    { label: 'Emergency', icon: Shield, cat: 'Emergency', defaultB: 1000, days: 60 },
  ];

  const currentTemplates = type === 'SAVING' ? savingTemplates : expenseTemplates;
  const accentColor = type === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)';

  return (
    <div className="modal-sheet-overlay" onClick={() => setIsCreateTripOpen(false)}>
      <form
        className="modal-sheet-content"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{ borderColor: type === 'SAVING' ? 'rgba(126, 231, 135, 0.4)' : 'rgba(46, 170, 220, 0.4)' }}
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
                backgroundColor: type === 'SAVING' ? 'rgba(126, 231, 135, 0.15)' : 'rgba(46, 170, 220, 0.15)',
                border: type === 'SAVING' ? '1px solid rgba(126, 231, 135, 0.35)' : '1px solid rgba(46, 170, 220, 0.35)',
                color: type === 'SAVING' ? 'var(--accent-success)' : 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Folder</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {type === 'SAVING' ? 'House, Gadget & Saving Goals' : 'Travel & Event Organizer'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateTripOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Folder Type Segmented Switch (Expense vs Saving) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-glass)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setName('Travel');
              setCategory('Travel');
              setBudget('300');
              setDaysCount(3);
            }}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: type === 'EXPENSE' ? 'var(--accent)' : 'transparent',
              color: type === 'EXPENSE' ? '#FFF' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: type === 'EXPENSE' ? 800 : 600,
              cursor: 'pointer',
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('SAVING');
              setName('House');
              setCategory('House');
              setBudget('2000');
              setDaysCount(30);
            }}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: type === 'SAVING' ? 'var(--accent-success)' : 'transparent',
              color: type === 'SAVING' ? '#FFF' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: type === 'SAVING' ? 800 : 600,
              cursor: 'pointer',
            }}
          >
            Saving
          </button>
        </div>

        {/* Templates Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Templates
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
            {currentTemplates.map(t => {
              const isActive = category === t.cat;
              const Icon = t.icon;
              const bgActive = type === 'SAVING' ? 'rgba(126, 231, 135, 0.18)' : 'rgba(46, 170, 220, 0.18)';
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
                    border: isActive ? `1px solid ${accentColor}` : '1px solid var(--border-glass)',
                    backgroundColor: isActive ? bgActive : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? accentColor : 'var(--text-primary)',
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
            placeholder="e.g. House, Gadget, Phone, Travel"
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

        {/* Trip Duration Days Selector (Direct Input + Quick Pills) */}
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
                border: `1px solid ${accentColor}`,
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
                      border: isActive ? `1px solid ${accentColor}` : '1px solid var(--border-glass)',
                      backgroundColor: isActive ? accentColor : 'rgba(255, 255, 255, 0.05)',
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

        {/* Trip Budget Input */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Budget ({currency})
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
            backgroundColor: 'var(--accent)',
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
