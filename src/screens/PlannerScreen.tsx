import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { getTodayDateString } from '../services/storageService';
import {
  Bell,
  CheckSquare,
  Square,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Check,
  Flag,
  Inbox,
  CalendarDays,
} from 'lucide-react';

type FilterTab = 'TODAY' | 'SCHEDULED' | 'ALL' | 'FLAGGED';

export const PlannerScreen: React.FC = () => {
  const { pageColors } = useTheme();
  const pageAccent = pageColors?.EXPENSES || '#6C5CE7';

  const {
    reminders,
    toggleReminder,
    deleteReminder,
    setIsAddReminderOpen,
    isNotificationEnabled,
    requestNotificationPermission,
  } = useReminders();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('TODAY');

  const today = getTodayDateString();

  const todayReminders = reminders.filter(r => r.dueDate === today);
  const scheduledReminders = reminders.filter(r => r.dueDate > today);
  const flaggedReminders = reminders.filter(r => r.priority === 'HIGH');
  const completedReminders = reminders.filter(r => r.completed);

  const displayedReminders = reminders.filter(r => {
    if (activeFilter === 'TODAY') return r.dueDate === today;
    if (activeFilter === 'SCHEDULED') return r.dueDate > today;
    if (activeFilter === 'FLAGGED') return r.priority === 'HIGH';
    return true; // ALL
  });

  const completionPct = reminders.length > 0 ? Math.round((completedReminders.length / reminders.length) * 100) : 0;

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Header Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>Planner</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reminders, Todos & Alerts</p>
        </div>

        {/* Web Push Alert Permission Pill Button */}
        <button
          type="button"
          className="glass-pill"
          onClick={requestNotificationPermission}
          style={{
            backgroundColor: isNotificationEnabled ? hexToRgba(pageAccent, 0.2) : 'rgba(255, 255, 255, 0.06)',
            borderColor: isNotificationEnabled ? hexToRgba(pageAccent, 0.4) : 'var(--border-glass)',
            color: isNotificationEnabled ? pageAccent : 'var(--text-muted)',
            fontSize: '11px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          title="Enable Native Push Alerts"
        >
          <Bell size={13} />
          <span>{isNotificationEnabled ? 'Alerts' : 'Enable'}</span>
        </button>
      </div>

      {/* Hero iPhone Reminders Glass Widget Card */}
      <div
        className="glass-panel"
        style={{
          padding: '18px',
          borderRadius: '24px',
          borderColor: hexToRgba(pageAccent, 0.35),
          backgroundColor: hexToRgba(pageAccent, 0.1),
          marginBottom: '16px',
        }}
      >
        {/* Widget Top Progress Ring Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: hexToRgba(pageAccent, 0.25),
                color: pageAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>Widget</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{completedReminders.length} of {reminders.length} Done</div>
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: hexToRgba(pageAccent, 0.2),
              color: pageAccent,
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            {completionPct}%
          </div>
        </div>

        {/* 4 iOS Reminders Category Tiles (2x2 Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Today Tile */}
          <button
            type="button"
            onClick={() => setActiveFilter('TODAY')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '16px',
              border: activeFilter === 'TODAY' ? `2px solid ${pageAccent}` : '1px solid var(--border-glass)',
              backgroundColor: activeFilter === 'TODAY' ? hexToRgba(pageAccent, 0.2) : 'rgba(255, 255, 255, 0.05)',
              textAlign: 'left',
              cursor: 'pointer',
              minHeight: '70px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CalendarDays size={18} color="var(--accent-success)" />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{todayReminders.length}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '6px' }}>Today</span>
          </button>

          {/* Scheduled Tile */}
          <button
            type="button"
            onClick={() => setActiveFilter('SCHEDULED')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '16px',
              border: activeFilter === 'SCHEDULED' ? `2px solid ${pageAccent}` : '1px solid var(--border-glass)',
              backgroundColor: activeFilter === 'SCHEDULED' ? hexToRgba(pageAccent, 0.2) : 'rgba(255, 255, 255, 0.05)',
              textAlign: 'left',
              cursor: 'pointer',
              minHeight: '70px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Clock size={18} color="var(--accent)" />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{scheduledReminders.length}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '6px' }}>Scheduled</span>
          </button>

          {/* All Tile */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '16px',
              border: activeFilter === 'ALL' ? `2px solid ${pageAccent}` : '1px solid var(--border-glass)',
              backgroundColor: activeFilter === 'ALL' ? hexToRgba(pageAccent, 0.2) : 'rgba(255, 255, 255, 0.05)',
              textAlign: 'left',
              cursor: 'pointer',
              minHeight: '70px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Inbox size={18} color="var(--text-primary)" />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{reminders.length}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '6px' }}>All</span>
          </button>

          {/* Flagged Tile */}
          <button
            type="button"
            onClick={() => setActiveFilter('FLAGGED')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '16px',
              border: activeFilter === 'FLAGGED' ? `2px solid ${pageAccent}` : '1px solid var(--border-glass)',
              backgroundColor: activeFilter === 'FLAGGED' ? hexToRgba(pageAccent, 0.2) : 'rgba(255, 255, 255, 0.05)',
              textAlign: 'left',
              cursor: 'pointer',
              minHeight: '70px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Flag size={18} color="var(--accent-warning)" />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{flaggedReminders.length}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '6px' }}>Flagged</span>
          </button>
        </div>
      </div>

      {/* Reminders & Todo Checklist Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
          {activeFilter === 'TODAY' ? 'Today' : activeFilter === 'SCHEDULED' ? 'Scheduled' : activeFilter === 'FLAGGED' ? 'Flagged' : 'Todos'}
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
          {displayedReminders.length} Items
        </span>
      </div>

      {/* Checklist List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedReminders.length > 0 ? (
          displayedReminders.map(r => (
            <div
              key={r.id}
              className="glass-panel"
              style={{
                padding: '14px 16px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                opacity: r.completed ? 0.6 : 1,
                border: r.completed ? '1px solid var(--border-glass)' : `1px solid ${hexToRgba(pageAccent, 0.3)}`,
              }}
            >
              {/* Left Checkbox & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleReminder(r.id)}
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
                  {r.completed ? <CheckSquare size={22} /> : <Square size={22} />}
                </button>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      textDecoration: r.completed ? 'line-through' : 'none',
                      color: r.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {r.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={11} /> {r.dueDate} {r.dueTime ? `@ ${r.dueTime}` : ''}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor: r.category === 'BILLS' ? 'rgba(255, 82, 82, 0.15)' : r.category === 'SAVINGS' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(46, 170, 220, 0.15)',
                        color: r.category === 'BILLS' ? 'var(--accent-danger)' : r.category === 'SAVINGS' ? 'var(--accent-success)' : 'var(--accent)',
                      }}
                    >
                      {r.category === 'BILLS' ? 'Bills' : r.category === 'SAVINGS' ? 'Savings' : 'Task'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => deleteReminder(r.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No reminders found in this category.
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) to Add Reminder */}
      <button
        onClick={() => setIsAddReminderOpen(true)}
        style={{
          position: 'fixed',
          bottom: '76px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: pageAccent,
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${hexToRgba(pageAccent, 0.45)}`,
          cursor: 'pointer',
          zIndex: 40,
        }}
        title="Add Reminder"
      >
        <Plus size={26} />
      </button>
    </div>
  );
};
