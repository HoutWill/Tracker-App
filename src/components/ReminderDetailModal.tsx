import React, { useState, useEffect } from 'react';
import { ReminderItem, ReminderCategory } from '../types';
import { useReminders } from '../context/ReminderContext';
import { formatCleanDate } from '../services/storageService';
import { triggerHaptic } from '../services/soundService';
import { X, Bell, Calendar, Clock, CheckSquare, Square, Trash2, Tag, Share2, Edit3, Save, CheckCircle2, Circle, Plus, MoreHorizontal } from 'lucide-react';
import { RichTextNotesEditor, renderRichFormattedText } from './RichTextNotesEditor';
import { syncToAppleCalendar, shareToAppleReminders, getGoogleCalendarUrl } from '../services/calendarSyncService';

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

  // Interactive Checklist Sub-Items State
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState<string>('');
  const [isAddingChecklist, setIsAddingChecklist] = useState<boolean>(false);

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
      
      // Default checklist if none exists
      const initialChecklist = reminder.checklist && reminder.checklist.length > 0
        ? reminder.checklist
        : [
            { id: 'cl-1', text: 'Review scope & objectives', done: true },
            { id: 'cl-2', text: 'Confirm schedule & timeline', done: false },
          ];
      setChecklist(initialChecklist);
      setIsEditing(false);
    }
  }, [reminder]);

  if (!reminder) return null;

  const handleToggleChecklistItem = (id: string) => {
    triggerHaptic(10);
    const updated = checklist.map(item => item.id === id ? { ...item, done: !item.done } : item);
    setChecklist(updated);
    updateReminder(reminder.id, { checklist: updated });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItemText.trim()) return;
    triggerHaptic(10);
    const newItem = { id: 'cl-' + Date.now(), text: newChecklistItemText.trim(), done: false };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewChecklistItemText('');
    setIsAddingChecklist(false);
    updateReminder(reminder.id, { checklist: updated });
  };

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
      checklist,
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
    const payload = {
      title: editTitle || reminder.title,
      notes: editNotes || reminder.notes,
      dueDate: editDueDate || reminder.dueDate,
      dueTime: editDueTime || reminder.dueTime,
      endTime: editEndTime || reminder.endTime,
      alertDate: editAlertDate || reminder.alertDate,
      alertTime: editAlertTime || reminder.alertTime,
      category: editCategory || reminder.category,
    };
    const gUrl = getGoogleCalendarUrl(payload);
    window.open(gUrl, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this reminder?')) {
      deleteReminder(reminder.id);
      onClose();
    }
  };

  return (
    <div className="modal-sheet-overlay" onClick={onClose}>
      <div className="modal-sheet-content" onClick={e => e.stopPropagation()}>
        {/* iOS Drag Handle */}
        <div className="modal-sheet-handle" />
        {/* Top Control Bar: Close button right, edit left */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '4px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: isEditing ? 'rgba(99, 102, 241, 0.2)' : 'var(--pill-bg)',
              color: isEditing ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '12px',
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
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
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
                  borderRadius: '12px',
                  backgroundColor: 'var(--pill-bg)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
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
                    padding: '8px 6px',
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

              <div style={{ minWidth: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>End</label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={e => setEditEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 6px',
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
              <RichTextNotesEditor
                value={editNotes}
                onChange={setEditNotes}
                placeholder="Description or notes..."
                rows={3}
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
          /* Remade View Detail Mode Matching Screenshot */
          <>
            {/* Title & Priority Badge Pill Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.4px',
                  lineHeight: '1.25',
                  margin: 0,
                  flex: 1,
                  textDecoration: reminder.completed ? 'line-through' : 'none',
                }}
              >
                {reminder.title}
              </h2>

              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: reminder.level === 'URGENT' ? 'rgba(236, 102, 140, 0.18)' : reminder.level === 'FLAGGED' ? 'rgba(243, 168, 91, 0.18)' : 'rgba(74, 153, 233, 0.18)',
                  border: `1px solid ${reminder.level === 'URGENT' ? 'rgba(236, 102, 140, 0.35)' : reminder.level === 'FLAGGED' ? 'rgba(243, 168, 91, 0.35)' : 'rgba(74, 153, 233, 0.35)'}`,
                  color: reminder.level === 'URGENT' ? '#EC668C' : reminder.level === 'FLAGGED' ? '#F3A85B' : '#4A99E9',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                {reminder.level === 'URGENT' ? 'High Priority' : reminder.level === 'FLAGGED' ? 'Flagged' : 'Simple'}
              </span>
            </div>

            {/* Metadata Row: Due Date & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Due date
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <Calendar size={15} color="var(--text-secondary)" />
                  <span>{formatCleanDate(reminder.dueDate)}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Category
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <Tag size={15} color="var(--text-secondary)" />
                  <span>{reminder.category ? reminder.category.charAt(0) + reminder.category.slice(1).toLowerCase() : 'Task'}</span>
                </div>
              </div>
            </div>

            {/* Description / Notes Section with Rich Formatting */}
            {reminder.notes && (
              <div style={{ padding: '12px 14px', borderRadius: '14px', backgroundColor: 'var(--pill-bg)', border: '1px solid var(--border-glass)' }}>
                {renderRichFormattedText(reminder.notes)}
              </div>
            )}

            {/* Check List Section matching user screenshot */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Check List</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingChecklist(!isAddingChecklist)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              </div>

              {/* Checklist Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--pill-bg)',
                      border: '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ color: item.done ? '#00E5FF' : 'var(--text-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {item.done ? <CheckCircle2 size={18} fill="rgba(0, 229, 255, 0.2)" /> : <Circle size={18} />}
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: item.done ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}

                {isAddingChecklist && (
                  <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={newChecklistItemText}
                      onChange={e => setNewChecklistItemText(e.target.value)}
                      placeholder="New checklist item..."
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--pill-bg)',
                        border: '1px solid var(--accent)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--accent)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Primary Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleToggle}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: reminder.completed ? 'var(--pill-bg)' : '#30D158',
                    color: reminder.completed ? 'var(--text-primary)' : '#141416',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: reminder.completed ? 'none' : '0 4px 14px rgba(48, 209, 88, 0.35)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{reminder.completed ? 'Mark Pending' : 'Complete Task'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--accent-danger)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleShareAppleReminders}
                  style={{
                    padding: '9px 10px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--pill-bg)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Share2 size={13} />
                  <span>Apple Reminders</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAppleCalendar}
                  style={{
                    padding: '9px 10px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--pill-bg)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar size={13} />
                  <span>Apple Calendar</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

