import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderItem } from '../types';
import {
  X,
  ChevronLeft,
  Plus,
  Search,
  List,
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
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

  const getCategoryBarColor = (category: string, level?: string) => {
    if (level === 'URGENT') return '#FF4081';
    switch (category) {
      case 'BILLS': return '#E53935';
      case 'SAVINGS': return '#00E676';
      case 'STUDY': return '#AB47BC';
      case 'MEETING': return '#FB8C00';
      case 'SPORT': return '#4CAF50';
      case 'FUN': return '#FF4081';
      case 'WORK': return '#1E88E5';
      case 'HEALTH': return '#00E676';
      default: return '#2EAADC';
    }
  };

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
    { title: 'Morning', icon: <Sun size={14} color="#FFB300" />, items: morningTasks },
    { title: 'Afternoon', icon: <SunMedium size={14} color="#FB8C00" />, items: afternoonTasks },
    { title: 'Evening', icon: <Moon size={14} color="#AB47BC" />, items: eveningTasks },
    { title: 'Anytime', icon: <Clock size={14} color="#2EAADC" />, items: anytimeTasks },
  ].filter(s => s.items.length > 0);

  const renderTaskCard = (r: ReminderItem) => {
    const barColor = getCategoryBarColor(r.category, r.level);
    return (
      <div
        key={r.id}
        onClick={() => onSelectReminderDetail(r)}
        style={{
          backgroundColor: 'rgba(30, 30, 35, 0.85)',
          borderLeft: `4px solid ${barColor}`,
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          opacity: r.completed ? 0.5 : 1,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Left Checkbox & Title Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              toggleReminder(r.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: r.completed ? '#00E676' : 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {r.completed ? <CheckSquare size={22} /> : <Square size={22} />}
          </button>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#FFF',
                  textDecoration: r.completed ? 'line-through' : 'none',
                }}
              >
                {r.title}
              </span>
              {r.level === 'URGENT' && (
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 64, 129, 0.25)',
                    color: '#FF4081',
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
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={10} color="rgba(255, 255, 255, 0.4)" />
                <span>{r.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Time Display */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.8)' }}>
            {r.dueTime || 'All-day'}
          </div>
          <div style={{ fontSize: '9px', fontWeight: 800, color: barColor, marginTop: '2px' }}>
            {r.category}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(20px)',
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Header Navigation Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            padding: '6px 12px',
            borderRadius: '18px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            color: '#FFF',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} />
          <span>{fullMonth}</span>
        </button>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddReminderOpen(true);
              onClose();
            }}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 82, 82, 0.2)',
              border: 'none',
              color: '#FF5252',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Optional Search Bar */}
      {isSearchOpen && (
        <div style={{ padding: '8px 20px' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Main Agenda List Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Date Divider Section */}
        <div
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: isToday ? '#FF5252' : '#FFF',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{dateHeader}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
            {filteredReminders.length} Tasks
          </span>
        </div>        {/* Task Items Grouped by Time of Day (Morning, Afternoon, Evening, Anytime) */}
        {sections.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sections.map(section => (
              <div key={section.title}>
                {/* Time Section Divider Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.icon}
                  <span>{section.title}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                    ({section.items.length})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.items.map(r => renderTaskCard(r))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '13px',
            }}
          >
            No tasks scheduled on {dateHeader}.
          </div>
        )}
      </div>

      {/* Floating iOS Bottom Pill Dock */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px 24px 20px',
        }}
      >
        {/* Floating Left "Today" Pill */}
        <button
          type="button"
          onClick={() => {
            // Closes modal and resets view if needed
            onClose();
          }}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            backgroundColor: 'rgba(40, 40, 45, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFF',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          Today
        </button>

        {/* Floating Right Action Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(40, 40, 45, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsAddReminderOpen(true);
              onClose();
            }}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', padding: 0 }}
            title="Add Task"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
