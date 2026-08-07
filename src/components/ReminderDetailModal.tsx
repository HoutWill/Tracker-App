import React from 'react';
import { ReminderItem } from '../types';
import { useReminders } from '../context/ReminderContext';
import { X, Bell, Calendar, Clock, CheckSquare, Square, Trash2, AlertCircle, Tag } from 'lucide-react';
import { syncToAppleCalendar, syncToAppleReminders } from '../services/calendarSyncService';

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

  const handleSyncAppleReminders = () => {
    syncToAppleReminders({
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
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
          maxWidth: '380px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '24px',
          borderColor: reminder.level === 'URGENT' ? 'rgba(255, 64, 129, 0.5)' : 'rgba(46, 170, 220, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 900 }}>Detail</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title & Level Row */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: 'var(--text-primary)',
                textDecoration: reminder.completed ? 'line-through' : 'none',
              }}
            >
              {reminder.title}
            </h2>
            {reminder.level === 'URGENT' && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 64, 129, 0.25)',
                  color: '#FF4081',
                }}
              >
                Urgent
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Tag size={11} /> {reminder.category.charAt(0) + reminder.category.slice(1).toLowerCase()}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: reminder.alertEnabled ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: reminder.alertEnabled ? 'var(--accent-success)' : 'var(--text-muted)',
              }}
            >
              {reminder.alertEnabled ? 'Alert On' : 'Alert Off'}
            </span>
          </div>
        </div>

        {/* Date & Time Box */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 16px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Date</div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{reminder.dueDate}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Time</div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{reminder.dueTime || 'Task'}</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {reminder.notes ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes</label>
            <div
              className="glass-panel"
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: 1.4,
              }}
            >
              {reminder.notes}
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleSyncAppleReminders}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#FF9F0A',
              color: '#141416',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(255, 159, 10, 0.3)',
            }}
          >
            <Bell size={16} />
            <span>Add to Apple Reminders</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAppleCalendar}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#30D158',
              color: '#141416',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(48, 209, 88, 0.3)',
            }}
          >
            <Calendar size={16} />
            <span>Add to Apple Calendar</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleToggle}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: reminder.completed ? 'rgba(255, 255, 255, 0.1)' : 'var(--accent)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {reminder.completed ? <Square size={16} /> : <CheckSquare size={16} />}
              <span>{reminder.completed ? 'Pending' : 'Complete'}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 82, 82, 0.3)',
                backgroundColor: 'rgba(255, 82, 82, 0.15)',
                color: '#FF5252',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
