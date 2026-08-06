import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check, Plane, Users, PartyPopper, FolderPlus } from 'lucide-react';

export const CreateExpenseFolderModal: React.FC = () => {
  const { isCreateExpenseFolderOpen, setIsCreateExpenseFolderOpen, addTrip, currency } = useExpenses();

  const [name, setName] = useState('Travel');
  const [category, setCategory] = useState('Travel');
  const [budget, setBudget] = useState('300');
  const [daysCount, setDaysCount] = useState<number>(3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isCreateExpenseFolderOpen) return null;

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
      type: 'EXPENSE',
    });

    setIsCreateExpenseFolderOpen(false);
  };

  const templates = [
    { label: 'Travel', icon: Plane, cat: 'Travel', defaultB: 300, days: 3 },
    { label: 'Team', icon: Users, cat: 'Team', defaultB: 150, days: 2 },
    { label: 'Party', icon: PartyPopper, cat: 'Party', defaultB: 100, days: 1 },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsCreateExpenseFolderOpen(false)}
    >
      <form
        className="glass-panel"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderColor: 'rgba(46, 170, 220, 0.4)',
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
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Expense Folder</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Travel & Event Organizer</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateExpenseFolderOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Templates Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Templates
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
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                    backgroundColor: isActive ? 'rgba(46, 170, 220, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
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
            placeholder="e.g. Travel, SiemReap, Party"
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
                border: '1px solid var(--accent)',
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
                      border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                      backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
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
