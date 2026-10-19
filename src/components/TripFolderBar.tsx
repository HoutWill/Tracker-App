import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, getTodayDateString } from '../services/storageService';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { TripFolder } from '../types';
import { Folder, Wallet, Plus, X, Trash2, Edit3, Sparkles } from 'lucide-react';

interface TripFolderBarProps {
  type?: 'EXPENSE' | 'SAVING';
  selectedMonth?: string;
}

const formatFolderDate = (dateStr: string): string => {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '';
  const [, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]}`;
};

export const TripFolderBar: React.FC<TripFolderBarProps> = ({ type = 'EXPENSE', selectedMonth }) => {
  const isSaving = type === 'SAVING';
  const { pageColors, isDark } = useTheme();
  const {
    trips,
    selectedTripId,
    setSelectedTripId,
    setSelectedTripForEdit,
    setIsCreateExpenseFolderOpen,
    setIsCreateSavingFolderOpen,
    setIsAddExpenseOpen,
    setIsAddSavingOpen,
    deleteTrip,
    expenses,
    currency,
  } = useExpenses();

  // Active month key (defaults to current month in Cambodia UTC+7, e.g. "2026-10")
  const currentMonthKey = selectedMonth || getTodayDateString().slice(0, 7);

  // Primary accent colors adhering to iOS 18 Muted Pastel palette
  const accentColor = isSaving
    ? pageColors?.SAVING || '#30D158'
    : pageColors?.EXPENSES || '#4A99E9';

  // Filter trips by screen type
  const visibleTrips = trips.filter(t => {
    if (isSaving) {
      return t.type === 'SAVING' || ['vault', 'emergency', 'goal', 'gold', 'stocks', 'income', 'house', 'gadget', 'phone', 'car'].includes(t.category.toLowerCase());
    }
    return t.type !== 'SAVING' && !['vault', 'emergency', 'goal', 'house', 'gadget', 'phone'].includes(t.category.toLowerCase());
  });

  const activeTrip = visibleTrips.find(t => t.id === selectedTripId);

  // Helper to check if an expense matches a specific trip
  const isExpenseInTrip = (e: any, trip: TripFolder) => {
    if (e.tripId === trip.id) return true;
    const tripCat = trip.category.toLowerCase();
    const tripName = trip.name.toLowerCase();
    if (e.categoryName && (e.categoryName.toLowerCase() === tripName || e.categoryName.toLowerCase() === tripCat)) return true;
    if (e.categoryId && (e.categoryId.toLowerCase().includes(tripCat) || e.categoryId.toLowerCase().includes(tripName))) return true;
    if (e.title && (e.title.toLowerCase().includes(tripName) || e.title.toLowerCase().includes(tripCat))) return true;
    return false;
  };

  // Helper to check if an expense belongs to ANY visible trip/folder
  const isExpenseInAnyVisibleTrip = (e: any) => {
    return visibleTrips.some(t => isExpenseInTrip(e, t));
  };

  // 1. Current Month Expenses (strictly scoped to currentMonthKey, resetting each month!)
  const monthItems = expenses.filter(e => {
    if (isSaving) {
      if (e.type !== 'SAVING' && !e.categoryId.startsWith('cat-saving')) return false;
    } else {
      if (e.type === 'SAVING' || e.categoryId.startsWith('cat-saving')) return false;
    }
    return e.date ? e.date.startsWith(currentMonthKey) : false;
  });

  // 2. Separate General (non-folder) expenses for the Current Month
  const generalMonthItems = monthItems.filter(e => !isExpenseInAnyVisibleTrip(e));
  const generalMonthUSD = generalMonthItems.reduce((sum, e) => sum + e.amount, 0);
  const generalMonthCount = generalMonthItems.length;

  // 3. Metrics per folder strictly for the Current Month
  const getFolderMetrics = (trip: TripFolder) => {
    const folderItems = monthItems.filter(e => isExpenseInTrip(e, trip));
    const spentUSD = folderItems.reduce((sum, e) => sum + e.amount, 0);
    const budgetUSD = trip.budget || 0;
    const remainingUSD = Math.max(0, budgetUSD - spentUSD);
    const progress = budgetUSD > 0 ? Math.min(100, Math.round((spentUSD / budgetUSD) * 100)) : 0;

    return {
      folderItems,
      itemCount: folderItems.length,
      spentUSD,
      budgetUSD,
      remainingUSD,
      progress,
    };
  };

  // Active trip specific metrics
  const activeMetrics = activeTrip ? getFolderMetrics(activeTrip) : null;
  const activeTripIndex = activeTrip ? visibleTrips.findIndex(t => t.id === activeTrip.id) : 0;
  const folderColors = ['#4A99E9', '#ED6C6C', '#F3A85B', '#EC668C', '#30D158', '#6C7B8A', '#8B5CF6'];
  const activeColor = folderColors[Math.max(0, activeTripIndex) % folderColors.length];

  // Theme-aware card surface and border styles
  const cardBg = isDark ? 'var(--bg-card)' : '#FFFFFF';
  const defaultBorder = isDark ? '1px solid var(--border-glass)' : '1px solid rgba(0, 0, 0, 0.08)';
  const trackBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* 1. iOS 18 Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Folder size={18} color={accentColor} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
            {isSaving ? 'Vaults' : 'Folders'}
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: hexToRgba(accentColor, 0.18),
              color: accentColor,
            }}
          >
            {visibleTrips.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => (isSaving ? setIsCreateSavingFolderOpen(true) : setIsCreateExpenseFolderOpen(true))}
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: accentColor,
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            boxShadow: `0 2px 8px ${hexToRgba(accentColor, 0.3)}`,
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      {/* 2. iOS 18 Bento Horizontal Carousel (No redundant twin cards!) */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Card 1: General Living Expenses Envelope (Current Month) */}
        <div
          onClick={() => setSelectedTripId(selectedTripId === 'GENERAL' ? null : 'GENERAL')}
          style={{
            width: '126px',
            minWidth: '126px',
            padding: '12px 14px',
            borderRadius: '18px',
            border: (selectedTripId === 'GENERAL' || selectedTripId === null) ? `2px solid ${accentColor}` : defaultBorder,
            backgroundColor: cardBg,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: (selectedTripId === 'GENERAL' || selectedTripId === null)
              ? `0 4px 14px ${hexToRgba(accentColor, isDark ? 0.25 : 0.15)}`
              : '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: (selectedTripId === 'GENERAL' || selectedTripId === null) ? 'scale(1.02)' : 'none',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: hexToRgba(accentColor, isDark ? 0.2 : 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
              }}
            >
              <Wallet size={16} />
            </div>
            {(selectedTripId === 'GENERAL' || selectedTripId === null) && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: hexToRgba(accentColor, isDark ? 0.25 : 0.15),
                  color: accentColor,
                }}
              >
                Active
              </span>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              General
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
              {generalMonthCount} Items
            </div>
            <div
              className="tabular-nums"
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: (selectedTripId === 'GENERAL' || selectedTripId === null) ? accentColor : 'var(--text-secondary)',
                marginTop: '6px',
              }}
            >
              {formatCurrency(generalMonthUSD, currency)}
            </div>
          </div>
        </div>

        {/* Dynamic Trip / Vault Folder Cards (Strictly Current Month Metrics) */}
        {visibleTrips.map((t, idx) => {
          const isSelected = selectedTripId === t.id;
          const cardColor = folderColors[idx % folderColors.length];
          const metrics = getFolderMetrics(t);

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTripId(isSelected ? null : t.id)}
              style={{
                width: '142px',
                minWidth: '142px',
                padding: '12px 14px',
                borderRadius: '18px',
                border: isSelected ? `2px solid ${cardColor}` : defaultBorder,
                backgroundColor: cardBg,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected
                  ? `0 4px 14px ${hexToRgba(cardColor, isDark ? 0.25 : 0.15)}`
                  : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'scale(1.02)' : 'none',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: hexToRgba(cardColor, isDark ? 0.2 : 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cardColor,
                  }}
                >
                  <CategoryIconRenderer icon={t.category.toLowerCase()} size={16} color={cardColor} />
                </div>

                {isSelected ? (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: hexToRgba(cardColor, isDark ? 0.25 : 0.15),
                      color: cardColor,
                    }}
                  >
                    Active
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: metrics.progress >= 100 ? '#ED6C6C' : 'var(--text-muted)',
                    }}
                  >
                    {metrics.progress}%
                  </span>
                )}
              </div>

              <div style={{ marginTop: '10px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={t.name}
                >
                  {t.name}
                </div>

                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatCurrency(metrics.spentUSD, currency)} / {formatCurrency(metrics.budgetUSD, currency)}
                </div>

                {/* Sleek iOS Micro Progress Bar */}
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: trackBg,
                    overflow: 'hidden',
                    marginTop: '8px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${metrics.progress}%`,
                      backgroundColor: metrics.progress >= 100 ? '#ED6C6C' : cardColor,
                      borderRadius: '2px',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Card N+1: + New Dashed Bento Card */}
        <div
          onClick={() => (isSaving ? setIsCreateSavingFolderOpen(true) : setIsCreateExpenseFolderOpen(true))}
          style={{
            width: '96px',
            minWidth: '96px',
            padding: '12px 14px',
            borderRadius: '18px',
            border: `1.5px dashed ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.16)'}`,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          title="Create"
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <Plus size={16} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            New
          </span>
        </div>
      </div>

      {/* 3. Quick Starter Templates (shown when 0 folders exist) */}
      {visibleTrips.length === 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '10px 14px',
            borderRadius: '14px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color={accentColor} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isSaving ? 'Vaults' : 'Envelopes'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {(isSaving ? ['Emergency', 'Car', 'House'] : ['Travel', 'Party', 'Team']).map(template => (
              <button
                key={template}
                type="button"
                onClick={() => (isSaving ? setIsCreateSavingFolderOpen(true) : setIsCreateExpenseFolderOpen(true))}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: defaultBorder,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  color: 'var(--text-secondary)',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. REDESIGNED iOS 18 Compact & Optically Balanced Active Folder Capsule */}
      {activeTrip && activeMetrics && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '18px',
            border: `1px solid ${hexToRgba(activeColor, isDark ? 0.35 : 0.25)}`,
            backgroundColor: cardBg,
            boxShadow: isDark
              ? `0 4px 14px ${hexToRgba(activeColor, 0.15)}`
              : '0 2px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Main Content: Left info with inline pill, Right compact actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {/* Left: Icon Badge + Title + Inline Left Pill + Dates */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  backgroundColor: hexToRgba(activeColor, isDark ? 0.2 : 0.12),
                  color: activeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CategoryIconRenderer icon={activeTrip.category.toLowerCase()} size={18} color={activeColor} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {activeTrip.name}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backgroundColor: hexToRgba(activeColor, isDark ? 0.25 : 0.14),
                      color: activeColor,
                      flexShrink: 0,
                    }}
                  >
                    {formatCurrency(activeMetrics.remainingUSD, currency)} Left
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatFolderDate(activeTrip.startDate)} – {formatFolderDate(activeTrip.endDate)} • Budget {formatCurrency(activeMetrics.budgetUSD, currency)}
                </div>
              </div>
            </div>

            {/* Right: Tightly Grouped Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => (isSaving ? setIsAddSavingOpen(true) : setIsAddExpenseOpen(true))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: activeColor,
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: `0 2px 6px ${hexToRgba(activeColor, 0.25)}`,
                }}
              >
                <Plus size={13} />
                <span>Add</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTripForEdit(activeTrip)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  border: defaultBorder,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Edit"
              >
                <Edit3 size={13} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete folder "${activeTrip.name}"?`)) {
                    deleteTrip(activeTrip.id);
                  }
                }}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  border: '1px solid rgba(237, 108, 108, 0.25)',
                  backgroundColor: isDark ? 'rgba(237, 108, 108, 0.12)' : 'rgba(237, 108, 108, 0.08)',
                  color: '#ED6C6C',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>

              <button
                type="button"
                onClick={() => setSelectedTripId(null)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  border: defaultBorder,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Micro Progress Bar */}
          <div
            style={{
              height: '4px',
              borderRadius: '2px',
              backgroundColor: trackBg,
              overflow: 'hidden',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${activeMetrics.progress}%`,
                backgroundColor: activeMetrics.progress >= 100 ? '#ED6C6C' : activeColor,
                borderRadius: '2px',
                transition: 'width 0.25s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
