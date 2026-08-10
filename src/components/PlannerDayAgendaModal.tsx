import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { renderRichFormattedText } from './RichTextNotesEditor';
import { ReminderItem } from '../types';
import {
  X,
  ChevronLeft,
  Plus,
  Search,
  CheckSquare,
  Square,
  Clock,
  MapPin,
  Sun,
  SunMedium,
  Moon,
} from 'lucide-react';

interface PlannerDayAgendaModalProps {
  selectedDay: string | null;
  onClose: () => void;
  onSelectReminderDetail: (r: ReminderItem) => void;
}

export const PlannerDayAgendaModal: React.FC<PlannerDayAgendaModalProps> = ({
  selectedDay,
  onClose,
  onSelectReminderDetail,
}) => {
  const { reminders, toggleReminder, setIsAddReminderOpen } = useReminders();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');

  if (!selectedDay) return null;

  const d = new Date(selectedDay + 'T00:00:00');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonth = calMonthName(d.getMonth());
  const todayStr = getTodayDateString();
  const isToday = selectedDay === todayStr;
  const dateHeader = `${weekdays[d.getDay()]} – ${d.getDate()} ${months[d.getMonth()]}`;

  const dayReminders = reminders.filter(r => r.dueDate === selectedDay);
  const filteredReminders = dayReminders.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function calMonthName(m: number) {
    const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return names[m] || 'Month';
  }

  // Time Period Grouping (Morning, Afternoon, Evening, Anytime)
  const morningTasks = filteredReminders.filter(r => {
    if (!r.dueTime) return false;
    const hour = parseInt(r.dueTime.split(':')[0], 10);
    return !isNaN(hour) && hour < 12;
  }).sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));

  const afternoonTasks = filteredReminders.filter(r => {
    if (!r.dueTime) return false;
    const hour = parseInt(r.dueTime.split(':')[0], 10);
    return !isNaN(hour) && hour >= 12 && hour < 17;
  }).sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));

  const eveningTasks = filteredReminders.filter(r => {
    if (!r.dueTime) return false;
    const hour = parseInt(r.dueTime.split(':')[0], 10);
    return !isNaN(hour) && hour >= 17;
  }).sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));

  const anytimeTasks = filteredReminders.filter(r => !r.dueTime);

  const sections = [
    { key: 'MORNING', title: 'Morning', icon: <Sun size={13} style={{ color: '#F59E0B' }} />, items: morningTasks },
    { key: 'AFTERNOON', title: 'Afternoon', icon: <SunMedium size={13} style={{ color: '#3B82F6' }} />, items: afternoonTasks },
    { key: 'EVENING', title: 'Evening', icon: <Moon size={13} style={{ color: '#8B5CF6' }} />, items: eveningTasks },
    { key: 'ANYTIME', title: 'Anytime', icon: <Clock size={13} style={{ color: 'var(--text-muted)' }} />, items: anytimeTasks },
  ].filter(s => {
    if (s.items.length === 0) return false;
    if (timeFilter !== 'ALL' && s.key !== timeFilter) return false;
    return true;
  });

  const renderTaskCard = (r: ReminderItem) => {
    return (
      <div
        key={r.id}
        onClick={() => onSelectReminderDetail(r)}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          cursor: 'pointer',
          opacity: r.completed ? 0.55 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        {/* Left Checkbox & Title Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              toggleReminder(r.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: r.completed ? 'var(--accent-success)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {r.completed ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: r.completed ? 'line-through' : 'none',
                }}
              >
                {r.title}
              </span>
              {r.level === 'URGENT' && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: 'var(--accent-danger)',
                  }}
                >
                  Urgent
                </span>
              )}
            </div>

            {r.notes && (
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={10} style={{ color: 'var(--text-muted)' }} />
                <div>{renderRichFormattedText(r.notes)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Time Display */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {r.dueTime || 'All-day'}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', marginTop: '2px' }}>
            {r.category.charAt(0) + r.category.slice(1).toLowerCase()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-sheet-overlay" onClick={onClose}>
      <div className="modal-sheet-content" onClick={e => e.stopPropagation()}>
        {/* iOS Drag Handle */}
        <div className="modal-sheet-handle" />
        {/* Top Header Navigation Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-glass)',
          }}
        >
          {/* Left Back Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={14} />
            <span>{fullMonth}</span>
          </button>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={14} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAddReminderOpen(true);
                onClose();
              }}
              style={{
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Optional Search Bar */}
        {isSearchOpen && (
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-glass)' }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Main Agenda List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Date Divider Section */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isToday ? 'var(--accent)' : 'var(--text-primary)',
              marginBottom: '14px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{dateHeader}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {filteredReminders.length} Tasks
            </span>
          </div>

          {/* Task Items Grouped by Time of Day */}
          {sections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sections.map(section => (
                <div key={section.title}>
                  {/* Time Section Divider Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({section.items.length})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {section.items.map(r => renderTaskCard(r))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px',
              }}
            >
              No tasks scheduled on {dateHeader}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
