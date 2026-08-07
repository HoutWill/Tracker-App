import React, { useState, useRef } from 'react';
import { useReminders } from '../context/ReminderContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { getTodayDateString } from '../services/storageService';
import { ReminderDetailModal } from '../components/ReminderDetailModal';
import { PlannerDayAgendaModal } from '../components/PlannerDayAgendaModal';
import { ReminderItem, ReminderCategory } from '../types';
import { startVoiceRecognition } from '../services/speechService';
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
  Layers,
  Search,
  Mic,
  X,
  Zap,
  CheckCircle2,
  Dumbbell,
  Receipt,
  Users,
  BookOpen,
  Heart,
  ShoppingBag,
  Briefcase,
  Droplets,
  ShoppingCart,
} from 'lucide-react';

type FilterTab = 'TODAY' | 'SCHEDULED' | 'ALL' | 'FLAGGED' | 'URGENT' | 'COMPLETED';

export const PlannerScreen: React.FC = () => {
  const { pageColors } = useTheme();
  const pageAccent = pageColors?.EXPENSES || '#6C5CE7';

  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    setIsAddReminderOpen,
    openAddReminderWithPreset,
  } = useReminders();

  const [plannerTab, setPlannerTab] = useState<'REMINDERS' | 'CALENDAR'>('REMINDERS');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [selectedReminderForDetail, setSelectedReminderForDetail] = useState<ReminderItem | null>(null);

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReminderCategory | 'ALL'>('ALL');
  const [isListeningSearch, setIsListeningSearch] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleVoiceSearch = () => {
    if (isListeningSearch) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      setIsListeningSearch(false);
      return;
    }

    setIsListeningSearch(true);
    const rec = startVoiceRecognition(
      (text, isFinal) => {
        setSearchQuery(text);
        if (isFinal) {
          setIsListeningSearch(false);
        }
      },
      () => setIsListeningSearch(false),
      () => setIsListeningSearch(false)
    );
    recognitionRef.current = rec;
  };

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
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchNotes = r.notes ? r.notes.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchNotes) return false;
    }
    // Category pill filter
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;

    // Filter tab
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
      {/* Main Screen Title Bar (Single Add Button Exists Here) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>Planner</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reminders, Todos & Alerts</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddReminderOpen(true)}
          style={{
            backgroundColor: pageAccent,
            color: '#FFF',
            fontSize: '13px',
            fontWeight: 800,
            padding: '8px 18px',
            borderRadius: '14px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
          }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Add</span>
        </button>
      </div>

      {/* Top Segmented Tab Switcher */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '3px',
          borderRadius: '14px',
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
            padding: '8px 0',
            borderRadius: '11px',
            border: plannerTab === 'REMINDERS' ? '1px solid var(--border-glass)' : '1px solid transparent',
            backgroundColor: plannerTab === 'REMINDERS' ? 'var(--pill-hover)' : 'transparent',
            color: plannerTab === 'REMINDERS' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: plannerTab === 'REMINDERS' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Bell size={15} />
          <span>Reminders</span>
        </button>

        <button
          type="button"
          onClick={() => setPlannerTab('CALENDAR')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '11px',
            border: plannerTab === 'CALENDAR' ? '1px solid var(--border-glass)' : '1px solid transparent',
            backgroundColor: plannerTab === 'CALENDAR' ? 'var(--pill-hover)' : 'transparent',
            color: plannerTab === 'CALENDAR' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: plannerTab === 'CALENDAR' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Calendar size={15} />
          <span>Calendar</span>
        </button>
      </div>

      {plannerTab === 'REMINDERS' ? (
        <>
        {/* 1. Task Complete Overview Card */}
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            borderRadius: '24px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#30D158" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Overview</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', backgroundColor: 'rgba(48, 209, 88, 0.15)', color: '#30D158' }}>
                Goal: {reminders.length} items
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {completedReminders.length} done
              </span>
            </div>
          </div>

          {/* Big Completion Percentage Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div className="tabular-nums" style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {completionPct}%
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {reminders.length - completedReminders.length} remaining
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--pill-bg)', border: '1px solid var(--border-glass)', overflow: 'hidden', marginBottom: '12px' }}>
            <div
              style={{
                width: `${completionPct}%`,
                height: '100%',
                backgroundColor: '#30D158',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Metrics Sub-Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-glass)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="#EC668C" /> Urgent: {urgentReminders.length}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flag size={12} color="#F3A85B" /> Flagged: {flaggedReminders.length}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="#6C7B8A" /> Done: {completedReminders.length}
            </span>
          </div>
        </div>

        {/* 2. Quick Presets Bento Grid (Open Add Modal with Pre-populated Info) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', padding: '0 2px' }}>
            <Zap size={15} color="var(--text-secondary)" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>Presets</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'p-1', title: 'Gym', category: 'SPORT', icon: Dumbbell, color: '#EC668C', level: 'FLAGGED' },
              { id: 'p-2', title: 'Bills', category: 'BILLS', icon: Receipt, color: '#F3A85B', level: 'URGENT' },
              { id: 'p-3', title: 'Meeting', category: 'MEETING', icon: Users, color: '#4A99E9', level: 'FLAGGED' },
              { id: 'p-4', title: 'Study', category: 'STUDY', icon: BookOpen, color: '#6C5CE7', level: 'SIMPLE' },
              { id: 'p-5', title: 'Doctor', category: 'HEALTH', icon: Heart, color: '#30D158', level: 'URGENT' },
              { id: 'p-6', title: 'Shopping', category: 'FUN', icon: ShoppingBag, color: '#FF9F0A', level: 'SIMPLE' },
              { id: 'p-7', title: 'Work', category: 'WORK', icon: Briefcase, color: '#6C7B8A', level: 'SIMPLE' },
              { id: 'p-8', title: 'Water', category: 'HEALTH', icon: Droplets, color: '#64D2FF', level: 'SIMPLE' },
              { id: 'p-9', title: 'Groceries', category: 'FUN', icon: ShoppingCart, color: '#A060FF', level: 'SIMPLE' },
            ].map(preset => {
              const IconComponent = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    openAddReminderWithPreset({
                      title: preset.title,
                      category: preset.category as any,
                      level: preset.level as any,
                    });
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    minHeight: '66px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '10px', backgroundColor: hexToRgba(preset.color, 0.15), border: `1px solid ${hexToRgba(preset.color, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: preset.color }}>
                      <IconComponent size={15} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '5px', backgroundColor: hexToRgba(preset.color, 0.15), color: preset.color }}>
                      {preset.level}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '6px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {preset.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Records Section (At Bottom) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '0 2px' }}>
          <Layers size={18} color={pageAccent} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>Records</h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(243, 168, 91, 0.18)',
              color: '#F3A85B',
            }}
          >
            {reminders.length}
          </span>
        </div>

        {/* Search Bar with Mic Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '44px',
            padding: '0 14px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            marginBottom: '10px',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isListeningSearch ? 'Listening... Speak now' : 'Search...'}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            style={{ background: 'none', border: 'none', color: isListeningSearch ? '#EC668C' : pageAccent, cursor: 'pointer', padding: '2px 4px' }}
            title="Voice Search"
          >
            <Mic size={16} />
          </button>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Chips Bar with Vector Icons & Counts */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '14px',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            className="glass-pill"
            onClick={() => setCategoryFilter('ALL')}
            style={{
              backgroundColor: categoryFilter === 'ALL' ? pageAccent : 'var(--pill-bg)',
              borderColor: categoryFilter === 'ALL' ? pageAccent : 'var(--border-glass)',
              color: categoryFilter === 'ALL' ? '#FFF' : 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0,
            }}
          >
            <Inbox size={13} />
            <span>All ({reminders.length})</span>
          </button>

          {[
            { id: 'TASK', label: 'Task', icon: CheckSquare },
            { id: 'STUDY', label: 'Study', icon: BookOpen },
            { id: 'MEETING', label: 'Meeting', icon: Users },
            { id: 'FUN', label: 'Fun', icon: Sparkles },
            { id: 'SPORT', label: 'Sport', icon: Dumbbell },
            { id: 'BILLS', label: 'Bills', icon: Receipt },
            { id: 'WORK', label: 'Work', icon: Briefcase },
            { id: 'HEALTH', label: 'Health', icon: Heart },
          ].map(cat => {
            const count = reminders.filter(r => r.category === cat.id).length;
            const isActive = categoryFilter === cat.id;
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className="glass-pill"
                onClick={() => setCategoryFilter(isActive ? 'ALL' : cat.id as any)}
                style={{
                  backgroundColor: isActive ? pageAccent : 'var(--pill-bg)',
                  borderColor: isActive ? pageAccent : 'var(--border-glass)',
                  color: isActive ? '#FFF' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: isActive ? 800 : 600,
                  padding: '6px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                }}
              >
                <IconComp size={13} />
                <span>{cat.label} ({count})</span>
              </button>
            );
          })}
        </div>

      {/* Reminders & Todo Checklist Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 2px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {activeFilter === 'TODAY' ? 'Today' : activeFilter === 'SCHEDULED' ? 'Scheduled' : activeFilter === 'FLAGGED' ? 'Flagged' : activeFilter === 'URGENT' ? 'Urgent' : activeFilter === 'COMPLETED' ? 'Completed' : 'Todos'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(true)}
            style={{
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {displayedReminders.length} Items
          </span>
        </div>
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
                borderRadius: '20px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleReminder(r.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: r.completed ? '#30D158' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {r.completed ? (
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#30D158', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#141416' }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '1.5px solid var(--border-glass)', backgroundColor: 'var(--pill-bg)' }} />
                  )}
                </button>

                <div
                  style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setSelectedReminderForDetail(r)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
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
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(236, 102, 140, 0.15)',
                          color: '#EC668C',
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 400 }}>
                      {r.notes}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} color="var(--text-muted)" /> {r.dueDate} {r.dueTime ? `@ ${r.dueTime}` : ''}
                    </span>
                    {r.category && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--pill-bg)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-glass)',
                        }}
                      >
                        {r.category.charAt(0) + r.category.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReminderForDetail(r)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="View Detail"
                >
                  <Info size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteReminder(r.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
