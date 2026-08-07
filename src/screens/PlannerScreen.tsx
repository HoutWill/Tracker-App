import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderDetailModal } from '../components/ReminderDetailModal';
import { PlannerDayAgendaModal } from '../components/PlannerDayAgendaModal';
import { ReminderItem } from '../types';
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
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

type FilterTab = 'TODAY' | 'SCHEDULED' | 'ALL' | 'FLAGGED' | 'URGENT' | 'COMPLETED';

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

  const [plannerTab, setPlannerTab] = useState<'REMINDERS' | 'CALENDAR'>('REMINDERS');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('TODAY');
  const [selectedReminderForDetail, setSelectedReminderForDetail] = useState<ReminderItem | null>(null);

  // Planner Calendar View State
  const [calViewDate, setCalViewDate] = useState<Date>(new Date());
  const [calSelectedDate, setCalSelectedDate] = useState<string>(getTodayDateString());
  const [isPlannerDayModalOpen, setIsPlannerDayModalOpen] = useState<boolean>(false);

  const today = getTodayDateString();

  const todayReminders = reminders.filter(r => r.dueDate === today && !r.completed);
  const scheduledReminders = reminders.filter(r => r.dueDate > today && !r.completed);
  const flaggedReminders = reminders.filter(r => r.priority === 'HIGH' && !r.completed);
  const urgentReminders = reminders.filter(r => r.level === 'URGENT' && !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const displayedReminders = reminders.filter(r => {
    if (activeFilter === 'TODAY') return r.dueDate === today && !r.completed;
    if (activeFilter === 'SCHEDULED') return r.dueDate > today && !r.completed;
    if (activeFilter === 'FLAGGED') return r.priority === 'HIGH' && !r.completed;
    if (activeFilter === 'URGENT') return r.level === 'URGENT' && !r.completed;
    if (activeFilter === 'COMPLETED') return r.completed;
    return true; // ALL
  });

  const completionPct = reminders.length > 0 ? Math.round((completedReminders.length / reminders.length) * 100) : 0;

  // Calendar Math inside Planner
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const emptyLeadingCells = Array.from({ length: firstDayOfWeek });

  const calDays: Array<{ dateStr: string; dayNum: number; dayReminders: ReminderItem[] }> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dayReminders = reminders.filter(r => r.dueDate === dateStr);
    calDays.push({ dateStr, dayNum: d, dayReminders });
  }

  const selectedCalReminders = reminders.filter(r => r.dueDate === calSelectedDate);

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Header Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>Planner</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reminders, Todos & Alerts</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Add Reminder Button */}
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

          <button
            type="button"
            className="glass-pill"
            onClick={() => setIsAddReminderOpen(true)}
            style={{
              backgroundColor: pageAccent,
              borderColor: pageAccent,
              color: '#FFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '5px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Top Segmented Tab Switcher (Reminders vs Calendar) */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '3px',
          borderRadius: '12px',
          marginBottom: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
        }}
      >
        <button
          type="button"
          onClick={() => setPlannerTab('REMINDERS')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '9px',
            border: plannerTab === 'REMINDERS' ? '1px solid var(--border-glass)' : '1px solid transparent',
            backgroundColor: plannerTab === 'REMINDERS' ? 'var(--pill-hover)' : 'transparent',
            color: plannerTab === 'REMINDERS' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: plannerTab === 'REMINDERS' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Bell size={14} />
          <span>Reminders</span>
        </button>

        <button
          type="button"
          onClick={() => setPlannerTab('CALENDAR')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '9px',
            border: plannerTab === 'CALENDAR' ? '1px solid var(--border-glass)' : '1px solid transparent',
            backgroundColor: plannerTab === 'CALENDAR' ? 'var(--pill-hover)' : 'transparent',
            color: plannerTab === 'CALENDAR' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: plannerTab === 'CALENDAR' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Calendar size={14} />
          <span>Calendar</span>
        </button>
      </div>

      {plannerTab === 'REMINDERS' ? (
        <>

      {/* 6 Reminders Category Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
        {/* Today Tile */}
        <button
          type="button"
          onClick={() => setActiveFilter('TODAY')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            border: activeFilter === 'TODAY' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={16} color="#3B82F6" />
            </div>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{todayReminders.length}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--text-secondary)' }}>Today</span>
        </button>

        {/* Scheduled Tile */}
        <button
          type="button"
          onClick={() => setActiveFilter('SCHEDULED')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            border: activeFilter === 'SCHEDULED' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#EF4444" />
            </div>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{scheduledReminders.length}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--text-secondary)' }}>Scheduled</span>
        </button>

        {/* All Tile */}
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            border: activeFilter === 'ALL' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--pill-bg)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Inbox size={16} color="var(--text-secondary)" />
            </div>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{reminders.length}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--text-secondary)' }}>All</span>
        </button>

        {/* Flagged Tile */}
        <button
          type="button"
          onClick={() => setActiveFilter('FLAGGED')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            border: activeFilter === 'FLAGGED' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flag size={16} color="#F59E0B" />
            </div>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{flaggedReminders.length}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--text-secondary)' }}>Flagged</span>
        </button>

        {/* Urgent Tile */}
        <button
          type="button"
          onClick={() => setActiveFilter('URGENT')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            border: activeFilter === 'URGENT' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#EC4899" />
            </div>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{urgentReminders.length}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--text-secondary)' }}>Urgent</span>
        </button>

        {/* Completed Tile */}
        <button
          type="button"
          onClick={() => setActiveFilter('COMPLETED')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            border: activeFilter === 'COMPLETED' ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="#10B981" />
            </div>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{completedReminders.length}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--text-secondary)' }}>Completed</span>
        </button>
      </div>

      {/* Reminders & Todo Checklist Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 2px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {activeFilter === 'TODAY' ? 'Today' : activeFilter === 'SCHEDULED' ? 'Scheduled' : activeFilter === 'FLAGGED' ? 'Flagged' : activeFilter === 'URGENT' ? 'Urgent' : activeFilter === 'COMPLETED' ? 'Completed' : 'Todos'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(true)}
            style={{
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {displayedReminders.length} Items
          </span>
        </div>
      </div>

      {/* Checklist List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayedReminders.length > 0 ? (
          displayedReminders.map(r => (
            <div
              key={r.id}
              className="glass-panel"
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                opacity: r.completed ? 0.55 : 1,
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              {/* Left Checkbox & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
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
                  {r.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>

                <div
                  style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setSelectedReminderForDetail(r)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: r.completed ? 'line-through' : 'none',
                        color: r.completed ? 'var(--text-muted)' : 'var(--text-primary)',
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
                          backgroundColor: 'rgba(236, 72, 153, 0.12)',
                          color: '#EC4899',
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 400 }}>
                      {r.notes}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={11} /> {r.dueDate} {r.dueTime ? `@ ${r.dueTime}` : ''}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--pill-bg)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      {r.category.charAt(0) + r.category.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Detail Icon Button */}
              <button
                type="button"
                onClick={() => setSelectedReminderForDetail(r)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Detail"
              >
                <Info size={15} />
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => deleteReminder(r.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No reminders found in this category.
          </div>
        )}
      </div>
      </>
      ) : (
        /* PLANNER CALENDAR TAB VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Calendar Month Header Switcher */}
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => setCalViewDate(new Date(year, month - 1, 1))}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <ChevronLeft size={20} />
            </button>

            <span style={{ fontSize: '16px', fontWeight: 800 }}>
              {calViewDate.toLocaleString('default', { month: 'long' })} {year}
            </span>

            <button
              type="button"
              onClick={() => setCalViewDate(new Date(year, month + 1, 1))}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Month Grid */}
          <div className="glass-panel" style={{ padding: '14px', borderRadius: '20px' }}>
            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {emptyLeadingCells.map((_, i) => (
                <div key={'empty-' + i} style={{ height: '48px' }} />
              ))}

              {calDays.map(item => {
                const isSel = calSelectedDate === item.dateStr;
                const isToday = item.dateStr === today;
                const count = item.dayReminders.length;
                const hasUrgent = item.dayReminders.some(r => r.level === 'URGENT' && !r.completed);

                return (
                  <div
                    key={item.dateStr}
                    onClick={() => {
                      setCalSelectedDate(item.dateStr);
                      setIsPlannerDayModalOpen(true);
                    }}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      border: isSel ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                      backgroundColor: isSel
                        ? 'rgba(46, 170, 220, 0.25)'
                        : isToday
                        ? 'rgba(255, 64, 129, 0.15)'
                        : count > 0
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800, color: isToday ? '#FF4081' : 'var(--text-primary)' }}>
                      {item.dayNum}
                    </span>

                    {count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span
                          style={{
                            fontSize: '8px',
                            fontWeight: 800,
                            padding: '0 4px',
                            borderRadius: '4px',
                            backgroundColor: hasUrgent ? '#FF4081' : 'var(--accent)',
                            color: '#FFF',
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Tasks Agenda */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Tasks on {calSelectedDate}</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {selectedCalReminders.length} Tasks
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedCalReminders.length > 0 ? (
                selectedCalReminders.map(r => (
                  <div
                    key={r.id}
                    className="glass-panel"
                    onClick={() => setSelectedReminderForDetail(r)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      borderLeft: r.level === 'URGENT' ? '4px solid #FF4081' : '4px solid var(--accent)',
                      cursor: 'pointer',
                      opacity: r.completed ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleReminder(r.id);
                        }}
                        style={{ background: 'none', border: 'none', color: r.completed ? 'var(--accent-success)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        {r.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, textDecoration: r.completed ? 'line-through' : 'none' }}>
                          {r.title}
                        </div>
                        {r.notes && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.notes}</div>}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{r.dueTime || 'Task'}</div>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>{r.category}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No tasks scheduled on {calSelectedDate}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder Detail Modal */}
      <ReminderDetailModal
        reminder={selectedReminderForDetail}
        onClose={() => setSelectedReminderForDetail(null)}
      />

      {/* Planner Date Click Agenda Pop-up Modal matching user iOS screenshot */}
      <PlannerDayAgendaModal
        selectedDay={isPlannerDayModalOpen ? calSelectedDate : null}
        onClose={() => setIsPlannerDayModalOpen(false)}
        onSelectReminderDetail={r => setSelectedReminderForDetail(r)}
      />
    </div>
  );
};
