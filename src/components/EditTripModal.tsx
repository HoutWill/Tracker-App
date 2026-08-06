import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check, Trash2, Plane, Users, PartyPopper, Edit3 } from 'lucide-react';

export const EditTripModal: React.FC = () => {
  const { selectedTripForEdit, setSelectedTripForEdit, updateTrip, deleteTrip, currency } = useExpenses();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Travel');
  const [budget, setBudget] = useState('300');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (selectedTripForEdit) {
      setName(selectedTripForEdit.name);
      setCategory(selectedTripForEdit.category);
      setBudget(selectedTripForEdit.budget.toString());
      setStartDate(selectedTripForEdit.startDate);
      setEndDate(selectedTripForEdit.endDate);
    }
  }, [selectedTripForEdit]);

  if (!selectedTripForEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBudget = parseFloat(budget);
    if (!name.trim() || isNaN(numBudget) || numBudget <= 0) {
      alert('Please enter a valid title and budget.');
      return;
    }

    updateTrip(selectedTripForEdit.id, {
      name: name.trim(),
      category: category,
      budget: numBudget,
      startDate: startDate,
      endDate: endDate,
    });

    setSelectedTripForEdit(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete folder "${selectedTripForEdit.name}"?`)) {
      deleteTrip(selectedTripForEdit.id);
      setSelectedTripForEdit(null);
    }
  };

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
      onClick={() => setSelectedTripForEdit(null)}
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
              <Edit3 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Edit</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Modify folder properties</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: 'rgba(255, 123, 114, 0.15)',
                border: '1px solid rgba(255, 123, 114, 0.3)',
                color: 'var(--accent-danger)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Delete Folder"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedTripForEdit(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Icons */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
            {[
              { label: 'Travel', icon: Plane, cat: 'Travel' },
              { label: 'Team', icon: Users, cat: 'Team' },
              { label: 'Party', icon: PartyPopper, cat: 'Party' },
            ].map(t => {
              const isActive = category === t.cat;
              const Icon = t.icon;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setCategory(t.cat)}
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

        {/* Start Date & End Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                marginTop: '4px',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              End
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                marginTop: '4px',
                outline: 'none',
              }}
            />
          </div>
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
            backgroundColor: 'var(--accent)',
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
