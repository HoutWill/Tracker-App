import React, { useState, useEffect, useRef } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderCategory } from '../types';
import { X, Bell, Check, Calendar, Clock, AlertCircle, Mic, Square } from 'lucide-react';
import { syncToAppleCalendar } from '../services/calendarSyncService';
import { startVoiceRecognition } from '../services/speechService';

const getFutureTimeString = (minutesToAdd: number = 5) => {
  const now = new Date(Date.now() + minutesToAdd * 60 * 1000);
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
  const { isAddReminderOpen, setIsAddReminderOpen, addReminder, presetDraft, setPresetDraft } = useReminders();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [level, setLevel] = useState<'URGENT' | 'FLAGGED' | 'SIMPLE'>('SIMPLE');
  const [category, setCategory] = useState<ReminderCategory>('TASK');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState(getFutureTimeString(5));
  const [endTime, setEndTime] = useState(getFutureTimeString(35));
  const [alertDate, setAlertDate] = useState(getTodayDateString());
  const [alertTime, setAlertTime] = useState(getFutureTimeString(5));
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

  // Automatically pre-populate modal when opening normally or with a Preset
  useEffect(() => {
    if (isAddReminderOpen) {
      setDueDate(getTodayDateString());
      setDueTime(getFutureTimeString(5));
      setEndTime(getFutureTimeString(35));
      setAlertDate(getTodayDateString());
      setAlertTime(getFutureTimeString(5));

      if (presetDraft) {
        setTitle(presetDraft.title || '');
        if (presetDraft.category) setCategory(presetDraft.category);
        if (presetDraft.level) setLevel(presetDraft.level as any);
        if (presetDraft.notes) setNotes(presetDraft.notes);
      } else {
        setTitle('');
        setNotes('');
        setCategory('TASK');
        setLevel('SIMPLE');
      }
    }
  }, [isAddReminderOpen, presetDraft]);

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
      endTime,
      alertDate,
      alertTime,
      alertEnabled,
    });

    if (syncCalendar) {
      syncToAppleCalendar({
        title: title.trim(),
        notes: notes.trim(),
        dueDate,
        dueTime,
        endTime,
        alertDate,
        alertTime,
        category,
      });
    }

    setTitle('');
    setNotes('');
    setPresetDraft(null);
    setIsAddReminderOpen(false);
  };

  const handleClose = () => {
    setPresetDraft(null);
    setIsAddReminderOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={handleClose}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: 'calc(100vw - 32px)',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderRadius: '24px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              Reminder
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input with Voice Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Title</label>
            <button
              type="button"
              onClick={() => handleVoiceInput('title')}
              style={{
                background: 'none',
                border: 'none',
                color: activeField === 'title' ? '#EC668C' : 'var(--accent)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Mic size={12} />
              <span>{activeField === 'title' ? 'Listening' : 'Voice'}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={activeField === 'title' ? 'Listening...' : 'Title'}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '14px',
              border: activeField === 'title' ? '1.5px solid #EC668C' : '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Notes Input with Voice Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes</label>
            <button
              type="button"
              onClick={() => handleVoiceInput('notes')}
              style={{
                background: 'none',
                border: 'none',
                color: activeField === 'notes' ? '#EC668C' : 'var(--accent)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Mic size={12} />
              <span>{activeField === 'notes' ? 'Listening' : 'Voice'}</span>
            </button>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={activeField === 'notes' ? 'Listening...' : 'Details'}
            rows={2}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: activeField === 'notes' ? '1.5px solid #EC668C' : '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Type / Level Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLevel('SIMPLE')}
              style={{
                padding: '10px',
                borderRadius: '14px',
                border: level === 'SIMPLE' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
                backgroundColor: level === 'SIMPLE' ? 'var(--pill-bg)' : 'var(--pill-bg)',
                color: level === 'SIMPLE' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Simple
            </button>

            <button
              type="button"
              onClick={() => setLevel('FLAGGED')}
              style={{
                padding: '10px',
                borderRadius: '14px',
                border: level === 'FLAGGED' ? '1.5px solid #F3A85B' : '1px solid var(--border-glass)',
                backgroundColor: level === 'FLAGGED' ? 'rgba(243, 168, 91, 0.15)' : 'var(--pill-bg)',
                color: level === 'FLAGGED' ? '#F3A85B' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Flagged
            </button>

            <button
              type="button"
              onClick={() => setLevel('URGENT')}
              style={{
                padding: '10px',
                borderRadius: '14px',
                border: level === 'URGENT' ? '1.5px solid #EC668C' : '1px solid var(--border-glass)',
                backgroundColor: level === 'URGENT' ? '#EC668C' : 'var(--pill-bg)',
                color: level === 'URGENT' ? '#FFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                  padding: '6px 14px',
                  borderRadius: '14px',
                  border: category === cat.id ? '1.5px solid #4A99E9' : '1px solid var(--border-glass)',
                  backgroundColor: category === cat.id ? '#4A99E9' : 'var(--pill-bg)',
                  color: category === cat.id ? '#FFF' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: category === cat.id ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '10px 12px',
              borderRadius: '14px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
              colorScheme: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Start Time & End Time Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Start</label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                padding: '9px 8px',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                colorScheme: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>End</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                padding: '9px 8px',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                colorScheme: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Dedicated Alert Card Container */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '18px',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={14} color="#F3A85B" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>Alert</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            <div style={{ minWidth: 0 }}>
              <input
                type="date"
                value={alertDate}
                onChange={e => setAlertDate(e.target.value)}
                style={{
                  width: '100%',
                  minWidth: 0,
                  padding: '8px 6px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <input
                type="time"
                value={alertTime}
                onChange={e => setAlertTime(e.target.value)}
                style={{
                  width: '100%',
                  minWidth: 0,
                  padding: '8px 6px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Apple Calendar Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#30D158" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Sync</span>
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
              transition: 'all 0.15s ease',
            }}
          >
            {syncCalendar ? 'Sync' : 'Off'}
          </button>
        </div>

        {/* Submit Action Button */}
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            backgroundColor: 'var(--accent)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(108, 92, 231, 0.35)',
            marginTop: '4px',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
