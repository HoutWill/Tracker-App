import React, { useState, useEffect } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderCategory } from '../types';
import { X, Bell, Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import { syncToAppleCalendar } from '../services/calendarSyncService';

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
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '24px',
          backgroundColor: 'rgba(26, 26, 36, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          color: '#FFF',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#4A99E9" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>Reminder</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(false)}
            style={{ background: 'none', border: 'none', color: '#A0A0B2', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title Input Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Bills"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              fontSize: '14px',
              outline: 'none',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Notes Input Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Notes</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Details"
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none',
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
                padding: '9px 0',
                borderRadius: '14px',
                border: level === 'SIMPLE' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: level === 'SIMPLE' ? '#48484A' : 'rgba(255, 255, 255, 0.06)',
                color: '#FFF',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: level === 'SIMPLE' ? '0 4px 12px rgba(72, 72, 74, 0.4)' : 'none',
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
                border: level === 'FLAGGED' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: level === 'FLAGGED' ? '#F3A85B' : 'rgba(255, 255, 255, 0.06)',
                color: level === 'FLAGGED' ? '#141416' : '#A0A0B2',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: level === 'FLAGGED' ? '0 4px 12px rgba(243, 168, 91, 0.4)' : 'none',
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
                border: level === 'URGENT' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: level === 'URGENT' ? '#EC668C' : 'rgba(255, 255, 255, 0.06)',
                color: level === 'URGENT' ? '#FFF' : '#A0A0B2',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: level === 'URGENT' ? '0 4px 12px rgba(236, 102, 140, 0.4)' : 'none',
              }}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Category Pill Switcher (Flex-Wrap Grid) */}
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
                  padding: '6px 12px',
                  borderRadius: '14px',
                  border: category === cat.id ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: category === cat.id ? '#6C5CE7' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: category === cat.id ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: category === cat.id ? '0 4px 12px rgba(108, 92, 231, 0.4)' : 'none',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Row */}
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
              fontSize: '13px',
              outline: 'none',
              colorScheme: 'dark',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Start Time & End Time Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>Start Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#A0A0B2' }}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
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
            marginTop: '6px',
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
};
