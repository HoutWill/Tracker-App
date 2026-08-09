import React, { useState, useRef, useEffect } from 'react';
import { useReminders } from '../context/ReminderContext';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { getTodayDateString, formatCleanDate, StorageService } from '../services/storageService';
import { ReminderDetailModal } from '../components/ReminderDetailModal';
import { PlannerDayAgendaModal } from '../components/PlannerDayAgendaModal';
import { PlannerPresetGrid } from '../components/PlannerPresetGrid';
import { ReminderItem, ReminderCategory, PlannerPreset } from '../types';
import { PLANNER_QUICK_PRESETS } from '../constants/presets';
import { triggerHaptic } from '../services/soundService';
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
  ChevronDown,
  SlidersHorizontal,
  Info,
  Layers,
  Search,
  Mic,
  X,
  Zap,
  CheckCircle2,
  MoreHorizontal,
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

  // Dynamic Planner Presets State
  const [plannerPresets, setPlannerPresets] = useState<PlannerPreset[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState<boolean>(false);
  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [newPresetCategory, setNewPresetCategory] = useState<ReminderCategory>('TASK');
  const [newPresetLevel, setNewPresetLevel] = useState<'URGENT' | 'FLAGGED' | 'SIMPLE'>('SIMPLE');
  const [newPresetIcon, setNewPresetIcon] = useState<string>('bell');

  useEffect(() => {
    const list = StorageService.getPlannerPresetsList(PLANNER_QUICK_PRESETS);
    setPlannerPresets(list);
  }, []);

  const handleSelectPreset = (preset: PlannerPreset) => {
    triggerHaptic(12);
    openAddReminderWithPreset({
      title: preset.title,
      category: preset.category,
      level: preset.level,
    });
  };

  const handleReorderPresets = (updated: PlannerPreset[]) => {
    setPlannerPresets(updated);
    StorageService.savePlannerPresetsList(updated);
  };

  const handleDeletePreset = (presetId: string) => {
    if (window.confirm('Delete this preset?')) {
      const updated = plannerPresets.filter(p => p.id !== presetId);
      setPlannerPresets(updated);
      StorageService.savePlannerPresetsList(updated);
    }
  };

  const handleCreateNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetTitle.trim()) {
      alert('Please enter a preset title');
      return;
    }

    const newPreset: PlannerPreset = {
      id: 'p-custom-' + Date.now(),
      title: newPresetTitle.trim(),
      category: newPresetCategory,
      level: newPresetLevel,
      icon: newPresetIcon || 'bell',
    };

    const updated = [newPreset, ...plannerPresets];
    setPlannerPresets(updated);
    StorageService.savePlannerPresetsList(updated);

    setNewPresetTitle('');
    setIsCreatingPreset(false);
    triggerHaptic(15);
  };


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
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [isPlannerDayModalOpen, setIsPlannerDayModalOpen] = useState<boolean>(false);

  const today = getTodayDateString();

  const todayReminders = reminders.filter(r => r.dueDate === today && !r.completed);
  const scheduledReminders = reminders.filter(r => r.dueDate > today && !r.completed);
  const flaggedReminders = reminders.filter(r => r.priority === 'HIGH' && !r.completed);
  const urgentReminders = reminders.filter(r => r.level === 'URGENT' && !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const [periodTab, setPeriodTab] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('ALL');

  const isThisWeek = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const first = now.getDate() - now.getDay();
      const last = first + 6;
      const startOfWeek = new Date(now.setDate(first));
      const endOfWeek = new Date(now.setDate(last));
      return d >= startOfWeek && d <= endOfWeek;
    } catch (e) {
      return false;
    }
  };

  const displayedReminders = reminders
    .filter(r => {
      // Specific Selected Day Filter
      if (selectedDayFilter && r.dueDate !== selectedDayFilter) return false;

      // Period scope filter
      if (periodTab === 'DAILY' && r.dueDate !== today) return false;
      if (periodTab === 'WEEKLY' && !isThisWeek(r.dueDate)) return false;
      if (periodTab === 'MONTHLY' && !r.dueDate.startsWith(today.slice(0, 7))) return false;
      if (periodTab === 'YEARLY' && !r.dueDate.startsWith(today.slice(0, 4))) return false;

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
    })
    .sort((a, b) => (a.completed === b.completed ? b.createdAt - a.createdAt : a.completed ? 1 : -1));

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
      {/* Main Screen Title Bar matching screenshot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>Planner</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Plan your tasks, stay productive</p>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => triggerHaptic(10)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--pill-bg)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={18} />
          </button>
          <div style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00E5FF' }} />
        </div>
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
        {/* 1. Circular Progress Gauge Hero Card */}
        <div
          className="glass-panel"
          style={{
            padding: '16px 18px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            {/* SVG Circular Progress Gauge */}
            <div style={{ position: 'relative', width: '84px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  fill="transparent"
                  stroke="var(--pill-bg)"
                  strokeWidth="7"
                />
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  fill="transparent"
                  stroke="#00E5FF"
                  strokeWidth="7"
                  strokeDasharray="213.628"
                  strokeDashoffset={213.628 - (213.628 * completionPct) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 42 42)"
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {completionPct}%
                </div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Progress
                </div>
              </div>
            </div>

            {/* Right Header & 4 Count Bento Tiles */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
                    {completionPct >= 100 ? 'Completed!' : completionPct >= 50 ? 'Good progress!' : 'Keep going'}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '1px 0 0 0' }}>
                    Planner status for this cycle
                  </p>
                </div>
                {/* Interactive Date Dropdown Capsule Pill matching user screenshot (Image 2) */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} title="Select Date">
                    <input
                      type="date"
                      value={selectedDayFilter || today}
                      onChange={(e) => {
                        if (e.target.value) {
                          triggerHaptic(10);
                          setSelectedDayFilter(e.target.value);
                        }
                      }}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                      id="hero-planner-date-dropdown-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        const el = document.getElementById('hero-planner-date-dropdown-input') as HTMLInputElement | null;
                        if (el) {
                          if (typeof (el as any).showPicker === 'function') {
                            try {
                              (el as any).showPicker();
                            } catch (err) {
                              el.click();
                            }
                          } else {
                            el.click();
                          }
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        backgroundColor: selectedDayFilter ? 'rgba(74, 153, 233, 0.18)' : 'var(--pill-bg)',
                        border: selectedDayFilter ? '1px solid rgba(74, 153, 233, 0.4)' : '1px solid var(--border-glass)',
                        color: selectedDayFilter ? '#4A99E9' : 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Calendar size={13} color={selectedDayFilter ? '#4A99E9' : 'var(--text-secondary)'} />
                      <span>
                        {(() => {
                          const target = selectedDayFilter || today;
                          const [y, m, d] = target.split('-').map(Number);
                          const dateObj = new Date(y, m - 1, d);
                          return dateObj.toLocaleString('en-US', { month: 'short' }) + ' ' + String(d).padStart(2, '0');
                        })()}
                      </span>
                      <ChevronDown size={13} color={selectedDayFilter ? '#4A99E9' : 'var(--text-secondary)'} />
                    </button>
                  </label>

                  {selectedDayFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setSelectedDayFilter(null);
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--pill-bg)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Show All Dates"
                    >
                      All
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Summary Count Bento Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                <div style={{ padding: '6px 2px', borderRadius: '10px', backgroundColor: 'rgba(74, 153, 233, 0.08)', border: '1px solid rgba(74, 153, 233, 0.2)', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 900, color: '#4A99E9' }}>{reminders.length}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '1px' }}>Total</div>
                </div>
                <div style={{ padding: '6px 2px', borderRadius: '10px', backgroundColor: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.2)', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 900, color: '#30D158' }}>{completedReminders.length}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '1px' }}>Done</div>
                </div>
                <div style={{ padding: '6px 2px', borderRadius: '10px', backgroundColor: 'rgba(236, 102, 140, 0.08)', border: '1px solid rgba(236, 102, 140, 0.2)', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 900, color: '#EC668C' }}>{urgentReminders.length}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '1px' }}>Urgent</div>
                </div>
                <div style={{ padding: '6px 2px', borderRadius: '10px', backgroundColor: 'rgba(243, 168, 91, 0.08)', border: '1px solid rgba(243, 168, 91, 0.2)', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 900, color: '#F3A85B' }}>{flaggedReminders.length}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '1px' }}>Flagged</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cyan Accent Progress Line */}
          <div style={{ marginTop: '12px', marginBottom: '10px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--pill-bg)', overflow: 'hidden' }}>
            <div style={{ width: `${completionPct}%`, height: '100%', backgroundColor: '#00E5FF', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>

          {/* Sub Footer Row: Remaining count & Keep it up! */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>
              {reminders.length - completedReminders.length} remaining
            </span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Keep it up!
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Planner Preset Grid with Drag-and-Drop Relocate & Move */}
        <PlannerPresetGrid
          presetsList={plannerPresets}
          onSelectPreset={handleSelectPreset}
          onAddPreset={() => setIsCreatingPreset(true)}
          onDeletePreset={handleDeletePreset}
          onReorderPresets={handleReorderPresets}
        />

        {/* Add New Planner Preset Modal */}
        {isCreatingPreset && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: '16px',
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Preset</h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingPreset(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNewPreset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title</label>
                  <input
                    type="text"
                    value={newPresetTitle}
                    onChange={e => setNewPresetTitle(e.target.value)}
                    placeholder="Title"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--pill-bg)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select
                    value={newPresetCategory}
                    onChange={e => setNewPresetCategory(e.target.value as ReminderCategory)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--pill-bg)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
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
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Priority</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['SIMPLE', 'FLAGGED', 'URGENT'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewPresetLevel(lvl)}
                        style={{
                          padding: '8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: newPresetLevel === lvl ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
                          backgroundColor: newPresetLevel === lvl ? 'rgba(99, 102, 241, 0.15)' : 'var(--pill-bg)',
                          color: newPresetLevel === lvl ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPreset(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--pill-bg)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--accent)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Todos Section Header matching user screenshot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>Todos</h3>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {reminders.length} items
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowSearchInput(!showSearchInput)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: showSearchInput ? 'rgba(74, 153, 233, 0.2)' : 'var(--pill-bg)',
                border: showSearchInput ? '1px solid #4A99E9' : '1px solid var(--border-glass)',
                color: showSearchInput ? '#4A99E9' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Search"
            >
              <Search size={16} />
            </button>

            <button
              type="button"
              onClick={() => triggerHaptic(10)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Filter Options"
            >
              <SlidersHorizontal size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsAddReminderOpen(true)}
              style={{
                backgroundColor: pageAccent,
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 800,
                padding: '7px 14px',
                borderRadius: '12px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
              }}
            >
              <Plus size={15} strokeWidth={3} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar with Mic Icon */}
        {(showSearchInput || searchQuery) && (
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
              marginBottom: '12px',
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
        )}

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
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
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
              onClick={() => {
                triggerHaptic(12);
                setSelectedReminderForDetail(r);
              }}
              style={{
                padding: '14px 16px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                opacity: r.completed ? 0.55 : 1,
                border: r.completed ? '1px solid var(--border-subtle)' : '1px solid var(--border-glass)',
                backgroundColor: 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Top Row: Checkbox + Title (Left), Capsule Priority Badge (Right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  {/* Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(12);
                      toggleReminder(r.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      backgroundColor: r.completed ? '#30D158' : 'transparent',
                      border: r.completed ? 'none' : '1.5px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {r.completed && <Check size={13} strokeWidth={3} />}
                  </div>

                  {/* Title */}
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      textDecoration: r.completed ? 'line-through' : 'none',
                      color: r.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.title}
                  </span>
                </div>

                {/* Capsule Priority Pill Badge */}
                {r.completed ? (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(48, 209, 88, 0.15)',
                      border: '1px solid rgba(48, 209, 88, 0.35)',
                      color: '#30D158',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    DONE
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: r.level === 'URGENT' ? 'rgba(236, 102, 140, 0.18)' : r.level === 'FLAGGED' ? 'rgba(243, 168, 91, 0.18)' : 'rgba(74, 153, 233, 0.18)',
                      border: `1px solid ${r.level === 'URGENT' ? 'rgba(236, 102, 140, 0.35)' : r.level === 'FLAGGED' ? 'rgba(243, 168, 91, 0.35)' : 'rgba(74, 153, 233, 0.35)'}`,
                      color: r.level === 'URGENT' ? '#EC668C' : r.level === 'FLAGGED' ? '#F3A85B' : '#4A99E9',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    {r.level || 'SIMPLE'}
                  </span>
                )}
              </div>

              {/* Middle Row: Description/Notes */}
              {r.notes && (
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    margin: '0 0 2px 0',
                    lineHeight: '1.4',
                    paddingLeft: '30px',
                  }}
                >
                  {r.notes}
                </p>
              )}

              {/* Bottom Row: Date & Category Pill (Left), Info & Delete Icons (Right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '30px', marginTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} color="var(--text-secondary)" />
                    {formatCleanDate(r.dueDate)} {r.dueTime ? `@ ${r.dueTime}` : ''}
                  </span>

                  {r.category && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--pill-bg)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      {r.category.charAt(0) + r.category.slice(1).toLowerCase()}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReminderForDetail(r);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="View Detail"
                  >
                    <AlertCircle size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(15);
                      deleteReminder(r.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
        /* PLANNER CALENDAR TAB VIEW (iOS 18 Horizontal Date Strip & Timeline Agenda UI) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Header Month Bar Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <button
              type="button"
              onClick={() => setCalViewDate(new Date(year, month - 1, 1))}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              {calViewDate.toLocaleString('default', { month: 'long' })} {year}
            </h3>

            <button
              type="button"
              onClick={() => setCalViewDate(new Date(year, month + 1, 1))}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 2. Scrollable Horizontal Day Strip */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              padding: '4px 2px 10px 2px',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {calDays.map(item => {
              const isSelected = calSelectedDate === item.dateStr;
              const isToday = item.dateStr === today;
              const dateObj = new Date(item.dateStr + 'T00:00:00');
              const dayName = dateObj.toLocaleString('en-US', { weekday: 'short' });
              const hasTasks = item.dayReminders.length > 0;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setCalSelectedDate(item.dateStr);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '52px',
                    height: '68px',
                    padding: '8px 6px',
                    borderRadius: '16px',
                    border: isSelected ? 'none' : isToday ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
                    backgroundColor: isSelected ? '#40C4AA' : isToday ? 'rgba(64, 196, 170, 0.12)' : 'var(--bg-card)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 4px 14px rgba(64, 196, 170, 0.35)' : 'none',
                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <span style={{ fontSize: '17px', fontWeight: 900, lineHeight: 1 }}>{item.dayNum}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', opacity: isSelected ? 0.9 : 0.6 }}>{dayName}</span>
                  {hasTasks && (
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#FFFFFF' : '#30D158',
                        marginTop: '4px',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. Vertical Timeline Agenda View (Bento Event Cards Column) */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
            
            {/* Current Time Indicator Line Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                11:24 AM
              </span>
              <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--text-primary)', borderRadius: '1px', opacity: 0.3 }} />
            </div>

            {/* Agenda Event Cards */}
            {selectedCalReminders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedCalReminders.map((r, idx) => {
                  const cardColors = [
                    { bg: 'var(--pill-bg)', text: 'var(--text-primary)', border: '1px solid var(--border-glass)' },
                    { bg: 'rgba(243, 168, 91, 0.18)', text: '#F3A85B', border: '1px solid rgba(243, 168, 91, 0.35)' },
                    { bg: 'rgba(74, 153, 233, 0.18)', text: '#4A99E9', border: '1px solid rgba(74, 153, 233, 0.35)' },
                    { bg: 'rgba(236, 102, 140, 0.18)', text: '#EC668C', border: '1px solid rgba(236, 102, 140, 0.35)' },
                  ];
                  const cTheme = r.level === 'URGENT' ? cardColors[3] : r.priority === 'HIGH' ? cardColors[1] : cardColors[idx % 3];

                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        triggerHaptic(12);
                        setSelectedReminderForDetail(r);
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '18px',
                        backgroundColor: cTheme.bg,
                        border: cTheme.border,
                        color: cTheme.text,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-card)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: cTheme.text }}>{r.title}</h4>
                        <button type="button" style={{ background: 'none', border: 'none', color: cTheme.text, opacity: 0.7, cursor: 'pointer' }}>
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.85, marginBottom: '8px' }}>
                        <Clock size={13} />
                        <span>{r.dueTime ? r.dueTime : '09:00 - 10:30'}</span>
                      </div>

                      {r.notes && (
                        <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 8px 0', lineHeight: 1.3 }}>
                          {r.notes}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', opacity: 0.85 }}>
                        <span>Category:</span>
                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                          {r.category ? r.category.toLowerCase() : 'Task'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No tasks scheduled for {formatCleanDate(calSelectedDate)}. Tap + to add a reminder!
              </div>
            )}
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
