import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderCategory } from '../types';
import { X, Bell, Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import { syncToAppleCalendar, syncToAppleReminders } from '../services/calendarSyncService';

export const AddReminderModal: React.FC = () => {
  const { isAddReminderOpen, setIsAddReminderOpen, addReminder } = useReminders();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState(''); // Description
  const [level, setLevel] = useState<'URGENT' | 'FLAGGED' | 'SIMPLE'>('SIMPLE');
  const [category, setCategory] = useState<ReminderCategory>('TASK');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('12:00'); // Start Time
  const [endTime, setEndTime] = useState('12:30'); // End Time
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [syncReminders, setSyncReminders] = useState(true);

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

    if (syncReminders) {
      syncToAppleReminders({
        title: title.trim(),
        notes: notes.trim(),
        dueDate,
        dueTime,
        category,
      });
    } else if (syncCalendar) {
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
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderRadius: '24px',
          backgroundColor: 'rgba(26, 26, 36, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          color: '#FFF',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#4A99E9" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>Event Reminder</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(false)}
            style={{ background: 'none', border: 'none', color: '#A0A0B2', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Event Title (e.g. Pay Bills)"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description Input (Apple Calendar Format) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Description</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Event details or notes"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Level Switcher (Simple, Flagged, Urgent) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Type</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setLevel('SIMPLE')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '12px',
                border: level === 'SIMPLE' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: level === 'SIMPLE' ? '#48484A' : 'rgba(255, 255, 255, 0.06)',
                color: '#FFF',
                fontSize: '11px',
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
                borderRadius: '12px',
                border: level === 'FLAGGED' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: level === 'FLAGGED' ? '#F3A85B' : 'rgba(255, 255, 255, 0.06)',
                color: level === 'FLAGGED' ? '#141416' : '#A0A0B2',
                fontSize: '11px',
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
                borderRadius: '12px',
                border: level === 'URGENT' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: level === 'URGENT' ? '#EC668C' : 'rgba(255, 255, 255, 0.06)',
                color: level === 'URGENT' ? '#FFF' : '#A0A0B2',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Category Pill Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Category</label>
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
                  padding: '5px 10px',
                  borderRadius: '12px',
                  border: category === cat.id ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: category === cat.id ? '#6C5CE7' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFF',
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

        {/* Date Row (Full Width - Clean Separated Layout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              fontSize: '12px',
              outline: 'none',
              colorScheme: 'dark',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Start Time & End Time Row ("Time to Time" - Non-Overlapping Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Start Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFF',
                fontSize: '12px',
                outline: 'none',
                colorScheme: 'dark',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFF',
                fontSize: '12px',
                outline: 'none',
                colorScheme: 'dark',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            />
          </div>
        </div>

        {/* Alert & Apple Calendar Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>Alert</span>
            <button
              type="button"
              onClick={() => setAlertEnabled(!alertEnabled)}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: alertEnabled ? '#6C5CE7' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFF',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {alertEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={14} color="#FF9F0A" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>Apple Reminders</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncReminders(!syncReminders)}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: syncReminders ? '#FF9F0A' : 'rgba(255, 255, 255, 0.12)',
                color: syncReminders ? '#141416' : '#FFF',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {syncReminders ? 'Sync' : 'Off'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#30D158" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>Apple Calendar</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncCalendar(!syncCalendar)}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: syncCalendar ? '#30D158' : 'rgba(255, 255, 255, 0.12)',
                color: syncCalendar ? '#141416' : '#FFF',
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
            marginTop: '4px',
            boxShadow: '0 6px 18px rgba(108, 92, 231, 0.45)',
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
};
