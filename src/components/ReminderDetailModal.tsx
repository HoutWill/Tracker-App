import React from 'react';
import { ReminderItem } from '../types';
import { useReminders } from '../context/ReminderContext';
import { X, Bell, Calendar, Clock, CheckSquare, Square, Trash2, Tag, Share2 } from 'lucide-react';
import { syncToAppleCalendar, shareToAppleReminders } from '../services/calendarSyncService';

interface ReminderDetailModalProps {
  reminder: ReminderItem | null;
  onClose: () => void;
}

export const ReminderDetailModal: React.FC<ReminderDetailModalProps> = ({ reminder, onClose }) => {
  const { toggleReminder, deleteReminder } = useReminders();

  if (!reminder) return null;

  const handleToggle = () => {
    toggleReminder(reminder.id);
  };

  const handleShareAppleReminders = async () => {
    await shareToAppleReminders({
      title: reminder.title,
      notes: reminder.notes,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      category: reminder.category,
    });
  };

  const handleSyncAppleCalendar = () => {
    syncToAppleCalendar({
      title: reminder.title,
      notes: reminder.notes,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      category: reminder.category,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Delete this reminder?')) {
      deleteReminder(reminder.id);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        zIndex: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-glass)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={15} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
              Reminder Detail
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
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
            <X size={18} />
          </button>
        </div>

        {/* Title & Level Row */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: reminder.completed ? 'line-through' : 'none',
                letterSpacing: '-0.1px',
              }}
            >
              {reminder.title}
            </h2>
            {reminder.level === 'URGENT' && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--accent-danger)',
                }}
              >
                Urgent
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Tag size={10} /> {reminder.category.charAt(0) + reminder.category.slice(1).toLowerCase()}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: reminder.alertEnabled ? 'rgba(16, 185, 129, 0.1)' : 'var(--pill-bg)',
                color: reminder.alertEnabled ? 'var(--accent-success)' : 'var(--text-muted)',
                border: '1px solid var(--border-glass)',
              }}
            >
              {reminder.alertEnabled ? 'Alert On' : 'Alert Off'}
            </span>
          </div>
        </div>

        {/* Date & Time Box */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Date</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{reminder.dueDate}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Time</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{reminder.dueTime || 'Task'}</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {reminder.notes ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>Notes</label>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: 1.4,
              }}
            >
              {reminder.notes}
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={handleShareAppleReminders}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#FF9500',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(255, 149, 0, 0.3)',
            }}
          >
            <Share2 size={15} />
            <span>Way 1: Share to Apple Reminders</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAppleCalendar}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#30D158',
              color: '#141416',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(48, 209, 88, 0.3)',
            }}
          >
            <Calendar size={15} />
            <span>Way 2: Add to Apple Calendar</span>
          </button>

          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <button
              type="button"
              onClick={handleToggle}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                backgroundColor: reminder.completed ? 'var(--pill-bg)' : 'var(--accent)',
                color: reminder.completed ? 'var(--text-primary)' : '#FFF',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {reminder.completed ? <Square size={15} /> : <CheckSquare size={15} />}
              <span>{reminder.completed ? 'Mark Pending' : 'Mark Complete'}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--accent-danger)',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

