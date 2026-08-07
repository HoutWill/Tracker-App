import React, { useState, useEffect, useRef } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderCategory } from '../types';
import { X, Bell, Check, Calendar, Clock, AlertCircle, Mic, Square } from 'lucide-react';
import { syncToAppleCalendar } from '../services/calendarSyncService';
import { startVoiceRecognition } from '../services/speechService';

const getCurrentTimeString = () => {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const getEndTimeString = () => {
  const now = new Date(Date.now() + 30 * 60 * 1000);
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const REMINDER_CATEGORIES = [
  { id: 'TASK', label: 'Task' },
  { id: 'STUDY', label: 'Study' },
  { id: 'MEETING', label: 'Meeting' },
  { id: 'FUN', label: 'Fun' },
  { id: 'SPORT', label: 'Sport' },
  { id: 'BILLS', label: 'Bills' },
  { id: 'SAVINGS', label: 'Savings' },
  { id: 'WORK', label: 'Work' },
  { id: 'HEALTH', label: 'Health' },
] as const;

export const AddReminderModal: React.FC = () => {
  const { isAddReminderOpen, setIsAddReminderOpen, addReminder } = useReminders();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [level, setLevel] = useState<'URGENT' | 'FLAGGED' | 'SIMPLE'>('SIMPLE');
  const [category, setCategory] = useState<ReminderCategory>('TASK');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState(getCurrentTimeString());
  const [endTime, setEndTime] = useState(getEndTimeString());
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [syncCalendar, setSyncCalendar] = useState(true);
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

  // Automatically sync to current live date and time whenever modal opens
  useEffect(() => {
    if (isAddReminderOpen) {
      setDueDate(getTodayDateString());
      setDueTime(getCurrentTimeString());
      setEndTime(getEndTimeString());
    }
  }, [isAddReminderOpen]);

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

    if (syncCalendar) {
      syncToAppleCalendar({
        title: title.trim(),
        notes: notes.trim(),
        dueDate,
        dueTime,
        endTime,
        category,
      });
    }

    setTitle('');
    setNotes('');
    setIsAddReminderOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsAddReminderOpen(false)}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '24px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-card)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#4A99E9" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Reminder</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input Pill with Voice & Cancel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Title</label>
            <button
              type="button"
              onClick={() => handleVoiceInput('title')}
              style={{
                background: 'none',
                border: 'none',
                color: activeField === 'title' ? '#EC668C' : '#4A99E9',
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
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={activeField === 'title' ? 'Listening... Speak now' : 'Bills, Workout...'}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '16px',
              border: activeField === 'title' ? '1.5px solid #4A99E9' : '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Notes Input Pill with Voice & Cancel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes</label>
            <button
              type="button"
              onClick={() => handleVoiceInput('notes')}
              style={{
                background: 'none',
                border: 'none',
                color: activeField === 'notes' ? '#EC668C' : '#4A99E9',
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
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={activeField === 'notes' ? 'Listening... Speak now' : 'Details'}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '16px',
              border: activeField === 'notes' ? '1.5px solid #4A99E9' : '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
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
                padding: '9px 0',
                borderRadius: '14px',
                border: level === 'SIMPLE' ? 'none' : '1px solid var(--border-glass)',
                backgroundColor: level === 'SIMPLE' ? '#48484A' : 'var(--pill-bg)',
                color: '#FFF',
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
                padding: '9px 0',
                borderRadius: '14px',
                border: level === 'FLAGGED' ? 'none' : '1px solid var(--border-glass)',
                backgroundColor: level === 'FLAGGED' ? '#F3A85B' : 'var(--pill-bg)',
                color: level === 'FLAGGED' ? '#141416' : 'var(--text-secondary)',
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
                padding: '9px 0',
                borderRadius: '14px',
                border: level === 'URGENT' ? 'none' : '1px solid var(--border-glass)',
                backgroundColor: level === 'URGENT' ? '#EC668C' : 'var(--pill-bg)',
                color: level === 'URGENT' ? '#FFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Category Selector Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {REMINDER_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as ReminderCategory)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '14px',
                  border: category === cat.id ? 'none' : '1px solid var(--border-glass)',
                  backgroundColor: category === cat.id ? '#6C5CE7' : 'var(--pill-bg)',
                  color: category === cat.id ? '#FFF' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: category === cat.id ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              colorScheme: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Start Time & End Time Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Start Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
                colorScheme: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
                colorScheme: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Apple Calendar Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#30D158" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Apple Calendar</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncCalendar(!syncCalendar)}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: syncCalendar ? '#30D158' : 'var(--pill-bg)',
                color: syncCalendar ? '#141416' : 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {syncCalendar ? 'Sync' : 'Off'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: '#6C5CE7',
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
