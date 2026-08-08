import React, { useState, useEffect } from 'react';
import { ReminderItem, ReminderCategory } from '../types';
import { useReminders } from '../context/ReminderContext';
import { X, Bell, Calendar, Clock, CheckSquare, Square, Trash2, Tag, Share2, Edit3, Save, Layers } from 'lucide-react';
import { syncToAppleCalendar, shareToAppleReminders } from '../services/calendarSyncService';

interface ReminderDetailModalProps {
  reminder: ReminderItem | null;
  onClose: () => void;
}

export const ReminderDetailModal: React.FC<ReminderDetailModalProps> = ({ reminder, onClose }) => {
  const { toggleReminder, updateReminder, deleteReminder } = useReminders();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form State for Editable Fields
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDueTime, setEditDueTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [editAlertDate, setEditAlertDate] = useState<string>('');
  const [editAlertTime, setEditAlertTime] = useState<string>('');
  const [editCategory, setEditCategory] = useState<ReminderCategory>('TASK');
  const [editLevel, setEditLevel] = useState<'URGENT' | 'FLAGGED' | 'SIMPLE'>('SIMPLE');

  useEffect(() => {
    if (reminder) {
      setEditTitle(reminder.title || '');
      setEditNotes(reminder.notes || '');
      setEditDueDate(reminder.dueDate || '');
      setEditDueTime(reminder.dueTime || '09:00');
      setEditEndTime(reminder.endTime || '');
      setEditAlertDate(reminder.alertDate || reminder.dueDate || '');
      setEditAlertTime(reminder.alertTime || reminder.dueTime || '09:00');
      setEditCategory(reminder.category || 'TASK');
      setEditLevel(reminder.level || 'SIMPLE');
      setIsEditing(false);
    }
  }, [reminder]);

  if (!reminder) return null;

  const handleToggle = () => {
    toggleReminder(reminder.id);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      alert('Title is required');
      return;
    }

    updateReminder(reminder.id, {
      title: editTitle.trim(),
      notes: editNotes.trim(),
      dueDate: editDueDate,
      dueTime: editDueTime,
      endTime: editEndTime,
      alertDate: editAlertDate,
      alertTime: editAlertTime,
      category: editCategory,
      level: editLevel,
      priority: editLevel === 'URGENT' ? 'HIGH' : 'MEDIUM',
    });

    setIsEditing(false);
  };

  const handleShareAppleReminders = async () => {
    await shareToAppleReminders({
      title: editTitle || reminder.title,
      notes: editNotes || reminder.notes,
      dueDate: editDueDate || reminder.dueDate,
      dueTime: editDueTime || reminder.dueTime,
      endTime: editEndTime || reminder.endTime,
      alertDate: editAlertDate || reminder.alertDate,
      alertTime: editAlertTime || reminder.alertTime,
      category: editCategory || reminder.category,
    });
  };

  const handleSyncAppleCalendar = () => {
    syncToAppleCalendar({
      title: editTitle || reminder.title,
      notes: editNotes || reminder.notes,
      dueDate: editDueDate || reminder.dueDate,
      dueTime: editDueTime || reminder.dueTime,
      endTime: editEndTime || reminder.endTime,
      alertDate: editAlertDate || reminder.alertDate,
      alertTime: editAlertTime || reminder.alertTime,
      category: editCategory || reminder.category,
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
          maxWidth: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderRadius: '20px',
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-glass)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={16} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
              {isEditing ? 'Edit Item' : 'Information'}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: isEditing ? 'rgba(99, 102, 241, 0.2)' : 'var(--pill-bg)',
                color: isEditing ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Edit3 size={13} />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>

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
        </div>

        {isEditing ? (
          /* Editable Form Mode */
          <form onSubmit={handleSaveUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pill-bg)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Start</label>
                <input
                  type="time"
                  value={editDueTime}
                  onChange={e => setEditDueTime(e.target.value)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pill-bg)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>End</label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={e => setEditEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pill-bg)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  minWidth: 0,
                  padding: '9px 10px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pill-bg)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Dedicated Alert Date & Alert Time Section */}
            <div style={{ padding: '10px 12px', borderRadius: '14px', backgroundColor: 'var(--pill-bg)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={13} color="#F3A85B" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>Alert</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <input
                    type="date"
                    value={editAlertDate}
                    onChange={e => setEditAlertDate(e.target.value)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      padding: '7px 6px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <input
                    type="time"
                    value={editAlertTime}
                    onChange={e => setEditAlertTime(e.target.value)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      padding: '7px 6px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as ReminderCategory)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pill-bg)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {['TASK', 'BILLS', 'SAVINGS', 'STUDY', 'MEETING', 'FUN', 'SPORT', 'WORK', 'HEALTH'].map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Priority</label>
                <select
                  value={editLevel}
                  onChange={e => setEditLevel(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pill-bg)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="SIMPLE" style={{ backgroundColor: 'var(--bg-card)' }}>Simple</option>
                  <option value="FLAGGED" style={{ backgroundColor: 'var(--bg-card)' }}>Flagged</option>
                  <option value="URGENT" style={{ backgroundColor: 'var(--bg-card)' }}>Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Notes</label>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                rows={3}
                placeholder="Notes or details..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pill-bg)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </form>
        ) : (
          /* View Info Mode */
          <>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
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
                      fontWeight: 700,
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
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
                  <Tag size={10} /> {reminder.category}
                </span>
              </div>
            </div>

            {/* Date & Time Cards */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
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
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Date</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{reminder.dueDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Event Time</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {reminder.dueTime || 'Task'}{reminder.endTime ? ` - ${reminder.endTime}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Alarm Time Box */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(243, 168, 91, 0.12)',
                border: '1px solid rgba(243, 168, 91, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Bell size={15} color="#F3A85B" />
              <div>
                <div style={{ fontSize: '10px', color: '#F3A85B', fontWeight: 700 }}>Alert Alarm Time</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {reminder.alertDate || reminder.dueDate} @ {reminder.alertTime || reminder.dueTime || '09:00'}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {reminder.notes ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Notes</label>
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
          </>
        )}
      </div>
    </div>
  );
};
