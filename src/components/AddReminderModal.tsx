import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderCategory } from '../types';
import { X, Bell, Check, Calendar, Clock, AlertCircle } from 'lucide-react';

export const AddReminderModal: React.FC = () => {
  const { isAddReminderOpen, setIsAddReminderOpen, addReminder } = useReminders();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [level, setLevel] = useState<'URGENT' | 'FLAGGED' | 'SIMPLE'>('SIMPLE');
  const [category, setCategory] = useState<ReminderCategory>('TASK');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('12:00');
  const [alertEnabled, setAlertEnabled] = useState(true);

  if (!isAddReminderOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder({
      title: title.trim(),
      notes: notes.trim(),
      category,
      priority: level === 'SIMPLE' ? 'LOW' : 'HIGH',
      level,
      dueDate,
      dueTime,
      alertEnabled,
    });

    setTitle('');
    setNotes('');
    setIsAddReminderOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsAddReminderOpen(false)}
    >
      <form
        className="glass-panel"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '24px',
          borderColor: 'rgba(46, 170, 220, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Reminder</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Bills"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Notes Input Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Details"
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Level Switcher (Simple, Flagged, Urgent) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setLevel('SIMPLE')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '16px',
                border: level === 'SIMPLE' ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                backgroundColor: level === 'SIMPLE' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                color: level === 'SIMPLE' ? '#FFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Simple
            </button>

            <button
              type="button"
              onClick={() => setLevel('FLAGGED')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '16px',
                border: level === 'FLAGGED' ? '1px solid #FB8C00' : '1px solid var(--border-glass)',
                backgroundColor: level === 'FLAGGED' ? 'rgba(251, 140, 0, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: level === 'FLAGGED' ? '#FB8C00' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Flagged
            </button>

            <button
              type="button"
              onClick={() => setLevel('URGENT')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '16px',
                border: level === 'URGENT' ? '1px solid #FF4081' : '1px solid var(--border-glass)',
                backgroundColor: level === 'URGENT' ? 'rgba(255, 64, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: level === 'URGENT' ? '#FF4081' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Category Pill Switcher (Flex-Wrap Grid) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(
              [
                { id: 'TASK', label: 'Task' },
                { id: 'STUDY', label: 'Study' },
                { id: 'MEETING', label: 'Meeting' },
                { id: 'FUN', label: 'Fun' },
                { id: 'SPORT', label: 'Sport' },
                { id: 'BILLS', label: 'Bills' },
                { id: 'SAVINGS', label: 'Savings' },
                { id: 'WORK', label: 'Work' },
                { id: 'HEALTH', label: 'Health' },
              ] as const
            ).map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as ReminderCategory)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: category === cat.id ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                  backgroundColor: category === cat.id ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                  color: category === cat.id ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Alert Notification Toggle Pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>Alert Notification</span>
          <button
            type="button"
            className="glass-pill"
            onClick={() => setAlertEnabled(!alertEnabled)}
            style={{
              backgroundColor: alertEnabled ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)',
              color: alertEnabled ? '#FFF' : 'var(--text-muted)',
              fontSize: '11px',
              padding: '4px 12px',
            }}
          >
            {alertEnabled ? 'On' : 'Off'}
          </button>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '6px',
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
};
