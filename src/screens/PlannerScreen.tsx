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

      {/* Top Segmented Tab Switcher (Reminders vs Calendar) */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '18px',
          marginBottom: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        }}
      >
        <button
          type="button"
          onClick={() => setPlannerTab('REMINDERS')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '14px',
            border: plannerTab === 'REMINDERS' ? '1px solid var(--accent)' : 'none',
            backgroundColor: plannerTab === 'REMINDERS' ? 'var(--accent)' : 'transparent',
            color: plannerTab === 'REMINDERS' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
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
            padding: '8px 0',
            borderRadius: '14px',
            border: plannerTab === 'CALENDAR' ? '1px solid var(--accent)' : 'none',
            backgroundColor: plannerTab === 'CALENDAR' ? 'var(--accent)' : 'transparent',
            color: plannerTab === 'CALENDAR' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Calendar size={14} />
          <span>Calendar</span>
        </button>
      </div>

      {plannerTab === 'REMINDERS' ? (
        <>

      {/* 6 iOS Reminders Category Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
        {/* Today Tile (Blue) */}
        <button
          type="button"
          onClick={() => setActiveFilter('TODAY')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '20px',
            border: activeFilter === 'TODAY' ? '2px solid #FFF' : 'none',
            backgroundColor: '#1E88E5',
            color: '#FFF',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            boxShadow: '0 8px 20px rgba(30, 136, 229, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{todayReminders.length}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px' }}>Today</span>
        </button>

        {/* Scheduled Tile (Red/Coral) */}
        <button
          type="button"
          onClick={() => setActiveFilter('SCHEDULED')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '20px',
            border: activeFilter === 'SCHEDULED' ? '2px solid #FFF' : 'none',
            backgroundColor: '#E53935',
            color: '#FFF',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            boxShadow: '0 8px 20px rgba(229, 57, 53, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{scheduledReminders.length}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px' }}>Scheduled</span>
        </button>

        {/* All Tile (Dark Grey) */}
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '20px',
            border: activeFilter === 'ALL' ? '2px solid #FFF' : 'none',
            backgroundColor: '#2A2A2E',
            color: '#FFF',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Inbox size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{reminders.length}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px' }}>All</span>
        </button>

        {/* Flagged Tile (Amber/Orange) */}
        <button
          type="button"
          onClick={() => setActiveFilter('FLAGGED')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '20px',
            border: activeFilter === 'FLAGGED' ? '2px solid #FFF' : 'none',
            backgroundColor: '#FB8C00',
            color: '#FFF',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            boxShadow: '0 8px 20px rgba(251, 140, 0, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flag size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{flaggedReminders.length}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px' }}>Flagged</span>
        </button>

        {/* Urgent Tile (Pink/Magenta) */}
        <button
          type="button"
          onClick={() => setActiveFilter('URGENT')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '20px',
            border: activeFilter === 'URGENT' ? '2px solid #FFF' : 'none',
            backgroundColor: '#FF4081',
            color: '#FFF',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            boxShadow: '0 8px 20px rgba(255, 64, 129, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{urgentReminders.length}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px' }}>Urgent</span>
        </button>

        {/* Completed Tile (Slate Grey) */}
        <button
          type="button"
          onClick={() => setActiveFilter('COMPLETED')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '20px',
            border: activeFilter === 'COMPLETED' ? '2px solid #FFF' : 'none',
            backgroundColor: '#546E7A',
            color: '#FFF',
            textAlign: 'left',
            cursor: 'pointer',
            minHeight: '80px',
            boxShadow: '0 8px 20px rgba(84, 110, 122, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{completedReminders.length}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px' }}>Completed</span>
        </button>
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

                <div
                  style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setSelectedReminderForDetail(r)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
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
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 64, 129, 0.2)',
                          color: '#FF4081',
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
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
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor:
                          r.category === 'BILLS'
                            ? 'rgba(255, 82, 82, 0.15)'
                            : r.category === 'SAVINGS'
                            ? 'rgba(0, 230, 118, 0.15)'
                            : r.category === 'STUDY'
                            ? 'rgba(156, 39, 176, 0.15)'
                            : r.category === 'MEETING'
                            ? 'rgba(255, 152, 0, 0.15)'
                            : r.category === 'SPORT'
                            ? 'rgba(76, 175, 80, 0.15)'
                            : r.category === 'FUN'
                            ? 'rgba(233, 30, 99, 0.15)'
                            : 'rgba(46, 170, 220, 0.15)',
                        color:
                          r.category === 'BILLS'
                            ? '#FF5252'
                            : r.category === 'SAVINGS'
                            ? '#00E676'
                            : r.category === 'STUDY'
                            ? '#AB47BC'
                            : r.category === 'MEETING'
                            ? '#FFA726'
                            : r.category === 'SPORT'
                            ? '#66BB6A'
                            : r.category === 'FUN'
                            ? '#EC407A'
                            : 'var(--accent)',
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
                <Info size={16} />
              </button>

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
