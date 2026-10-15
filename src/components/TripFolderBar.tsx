import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { TripFolder } from '../types';
import { Folder, Plus, X, Trash2, Edit3, Sparkles } from 'lucide-react';

interface TripFolderBarProps {
  type?: 'EXPENSE' | 'SAVING';
}

const formatFolderDate = (dateStr: string): string => {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '';
  const [, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]}`;
};

export const TripFolderBar: React.FC<TripFolderBarProps> = ({ type = 'EXPENSE' }) => {
  const isSaving = type === 'SAVING';
  const { pageColors } = useTheme();
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

  // Helper to calculate folder metrics accurately
  const getFolderMetrics = (trip: TripFolder) => {
    const folderItems = expenses.filter(e => {
      if (isSaving) {
        if (e.type !== 'SAVING' && !e.categoryId.startsWith('cat-saving')) return false;
      } else {
        if (e.type === 'SAVING' || e.categoryId.startsWith('cat-saving')) return false;
      }

      if (e.tripId === trip.id) return true;
      const tripCat = trip.category.toLowerCase();
      const tripName = trip.name.toLowerCase();
      if (e.categoryName.toLowerCase() === tripName || e.categoryName.toLowerCase() === tripCat) return true;
      if (e.categoryId.toLowerCase().includes(tripCat) || e.categoryId.toLowerCase().includes(tripName)) return true;
      if (e.title.toLowerCase().includes(tripName) || e.title.toLowerCase().includes(tripCat)) return true;
      return false;
    });

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

  // Screen total metrics for the "All" Bento card
  const screenItems = expenses.filter(e => {
    if (isSaving) {
      return e.type === 'SAVING' || e.categoryId.startsWith('cat-saving');
    }
    return e.type !== 'SAVING' && !e.categoryId.startsWith('cat-saving');
  });
  const totalAllUSD = screenItems.reduce((sum, e) => sum + e.amount, 0);
  const totalAllCount = screenItems.length;

  // Active trip specific metrics
  const activeMetrics = activeTrip ? getFolderMetrics(activeTrip) : null;
  const activeTripIndex = activeTrip ? visibleTrips.findIndex(t => t.id === activeTrip.id) : 0;
  const folderColors = ['#4A99E9', '#ED6C6C', '#F3A85B', '#EC668C', '#30D158', '#6C7B8A', '#8B5CF6'];
  const activeColor = folderColors[Math.max(0, activeTripIndex) % folderColors.length];

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
            boxShadow: `0 2px 8px ${hexToRgba(accentColor, 0.35)}`,
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      {/* 2. iOS 18 Bento Horizontal Carousel */}
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
        {/* Card 1: All Bento Card */}
        <div
          onClick={() => setSelectedTripId(null)}
          style={{
            width: '120px',
            minWidth: '120px',
            padding: '12px 14px',
            borderRadius: '18px',
            border: selectedTripId === null ? `1.5px solid ${accentColor}` : '1px solid var(--border-glass)',
            backgroundColor: selectedTripId === null ? hexToRgba(accentColor, 0.14) : 'var(--bg-card)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: selectedTripId === null ? 'scale(1.02)' : 'none',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: selectedTripId === null ? hexToRgba(accentColor, 0.22) : 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedTripId === null ? accentColor : 'var(--text-secondary)',
              }}
            >
              <Folder size={16} />
            </div>
            {selectedTripId === null && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: hexToRgba(accentColor, 0.25),
                  color: accentColor,
                }}
              >
                Active
              </span>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              All
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
              {totalAllCount} Items
            </div>
            <div
              className="tabular-nums"
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: selectedTripId === null ? accentColor : 'var(--text-secondary)',
                marginTop: '6px',
              }}
            >
              {formatCurrency(totalAllUSD, currency)}
            </div>
          </div>
        </div>

        {/* Dynamic Trip / Vault Folder Cards */}
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
                border: isSelected ? `1.5px solid ${cardColor}` : '1px solid var(--border-glass)',
                backgroundColor: isSelected ? hexToRgba(cardColor, 0.14) : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'scale(1.02)' : 'none',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: hexToRgba(cardColor, 0.18),
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
                      backgroundColor: hexToRgba(cardColor, 0.25),
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
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
            border: '1.5px dashed rgba(255, 255, 255, 0.18)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-glass)',
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
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
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

      {/* 4. Active Selected Folder Bento Action Panel */}
      {activeTrip && activeMetrics && (
        <div
          className="glass-panel"
          style={{
            marginTop: '10px',
            padding: '14px 16px',
            borderRadius: '18px',
            border: `1px solid ${hexToRgba(activeColor, 0.35)}`,
            backgroundColor: hexToRgba(activeColor, 0.08),
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: hexToRgba(activeColor, 0.2),
                  color: activeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CategoryIconRenderer icon={activeTrip.category.toLowerCase()} size={20} color={activeColor} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                    {activeTrip.name}
                  </h4>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: hexToRgba(activeColor, 0.22),
                      color: activeColor,
                    }}
                  >
                    {isSaving ? 'Vault' : 'Folder'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                  {formatFolderDate(activeTrip.startDate)} → {formatFolderDate(activeTrip.endDate)} • {activeMetrics.itemCount} Items
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => (isSaving ? setIsAddSavingOpen(true) : setIsAddExpenseOpen(true))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeColor,
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTripForEdit(activeTrip)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                title="Edit"
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete folder "${activeTrip.name}"?`)) {
                    deleteTrip(activeTrip.id);
                  }
                }}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid rgba(237, 108, 108, 0.3)',
                  backgroundColor: 'rgba(237, 108, 108, 0.1)',
                  color: '#ED6C6C',
                  cursor: 'pointer',
                }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedTripId(null)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Progress and Breakdown */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Spent: {formatCurrency(activeMetrics.spentUSD, currency)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Left: {formatCurrency(activeMetrics.remainingUSD, currency)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Budget: {formatCurrency(activeMetrics.budgetUSD, currency)}</span>
            </div>
            <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${activeMetrics.progress}%`,
                  backgroundColor: activeMetrics.progress >= 100 ? '#ED6C6C' : activeColor,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
