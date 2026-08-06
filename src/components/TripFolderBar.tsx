import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { FolderPlus, Folder, Calendar, Plus, X, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface TripFolderBarProps {
  type?: 'EXPENSE' | 'SAVING';
}

export const TripFolderBar: React.FC<TripFolderBarProps> = ({ type = 'EXPENSE' }) => {
  const isSaving = type === 'SAVING';
  const {
    trips,
    selectedTripId,
    setSelectedTripId,
    setSelectedTripForEdit,
    setIsCreateTripOpen,
    setIsCreateExpenseFolderOpen,
    setIsCreateSavingFolderOpen,
    setIsAddExpenseOpen,
    setIsAddSavingOpen,
    deleteTrip,
    expenses,
    currency,
    hideBalances,
  } = useExpenses();

  // Filter trips by screen type
  const visibleTrips = trips.filter(t => {
    if (isSaving) {
      return t.type === 'SAVING' || ['vault', 'emergency', 'goal', 'gold', 'stocks', 'income', 'house', 'gadget', 'phone', 'car'].includes(t.category.toLowerCase());
    }
    return t.type !== 'SAVING' && !['vault', 'emergency', 'goal', 'house', 'gadget', 'phone'].includes(t.category.toLowerCase());
  });

  const activeTrip = visibleTrips.find(t => t.id === selectedTripId);

  // Calculate spent/saved amount for selected trip strictly
  const tripSpentUSD = activeTrip
    ? expenses
        .filter(e => {
          if (isSaving) {
            if (e.type !== 'SAVING' && !e.categoryId.startsWith('cat-saving')) return false;
          } else {
            if (e.type === 'SAVING' || e.categoryId.startsWith('cat-saving')) return false;
          }

          if (e.tripId === activeTrip.id) return true;
          const tripCat = activeTrip.category.toLowerCase();
          const tripName = activeTrip.name.toLowerCase();
          if (e.categoryName.toLowerCase() === tripName || e.categoryName.toLowerCase() === tripCat) return true;
          if (e.categoryId.toLowerCase().includes(tripCat) || e.categoryId.toLowerCase().includes(tripName)) return true;
          if (e.title.toLowerCase().includes(tripName) || e.title.toLowerCase().includes(tripCat)) return true;
          return false;
        })
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const tripBudgetUSD = activeTrip?.budget || 0;
  const tripProgress = tripBudgetUSD > 0 ? Math.min(100, Math.round((tripSpentUSD / tripBudgetUSD) * 100)) : 0;

  const formattedSpent = hideBalances ? '••••' : formatCurrency(tripSpentUSD, currency);
  const formattedBudget = hideBalances ? '••••' : formatCurrency(tripBudgetUSD, currency);

  const accentColor = isSaving ? 'var(--accent-success)' : 'var(--accent)';
  const borderAccent = isSaving ? 'rgba(126, 231, 135, 0.4)' : 'rgba(46, 170, 220, 0.4)';
  const bgAccent = isSaving ? 'rgba(126, 231, 135, 0.12)' : 'rgba(46, 170, 220, 0.12)';

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Horizontal Folders Carousel Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {/* Create Folder Pill Button */}
        <button
          onClick={() => (isSaving ? setIsCreateSavingFolderOpen(true) : setIsCreateExpenseFolderOpen(true))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '12px',
            border: `1px solid ${borderAccent}`,
            backgroundColor: bgAccent,
            color: accentColor,
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <FolderPlus size={14} />
          Folder
        </button>

        {/* All Filter Pill */}
        <button
          onClick={() => setSelectedTripId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '12px',
            border: selectedTripId === null ? `1px solid ${accentColor}` : '1px solid var(--border-glass)',
            backgroundColor: selectedTripId === null ? accentColor : 'rgba(255, 255, 255, 0.05)',
            color: selectedTripId === null ? '#FFF' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: selectedTripId === null ? 800 : 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Folder size={14} />
          All
        </button>

        {/* Dynamic Trip Folder Pills */}
        {visibleTrips.map(t => {
          const isSelected = selectedTripId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTripId(isSelected ? null : t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '12px',
                border: isSelected ? `1px solid ${accentColor}` : '1px solid var(--border-glass)',
                backgroundColor: isSelected ? (isSaving ? 'rgba(126, 231, 135, 0.22)' : 'rgba(46, 170, 220, 0.22)') : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? accentColor : 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <CategoryIconRenderer icon={t.category.toLowerCase()} size={14} />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Dedicated Active Trip Summary Card */}
      {activeTrip && (
        <div
          className="glass-panel"
          style={{
            marginTop: '10px',
            padding: '14px',
            borderColor: 'rgba(46, 170, 220, 0.35)',
            backgroundColor: 'rgba(46, 170, 220, 0.06)',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(46, 170, 220, 0.2)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CategoryIconRenderer icon={activeTrip.category.toLowerCase()} size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{activeTrip.name}</h4>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(46, 170, 220, 0.2)',
                      color: 'var(--accent)',
                    }}
                  >
                    Folder
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {activeTrip.startDate} → {activeTrip.endDate}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => (isSaving ? setIsAddSavingOpen(true) : setIsAddExpenseOpen(true))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: accentColor,
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                Add
              </button>
              <button
                onClick={() => setSelectedTripForEdit(activeTrip)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                }}
                title="Edit Folder"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete folder "${activeTrip.name}"?`)) {
                    deleteTrip(activeTrip.id);
                  }
                }}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 123, 114, 0.3)',
                  backgroundColor: 'rgba(255, 123, 114, 0.1)',
                  color: 'var(--accent-danger)',
                  cursor: 'pointer',
                }}
                title="Delete Folder"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setSelectedTripId(null)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                title="Close Filter"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Spent: {formattedSpent}</span>
              <span style={{ color: 'var(--text-muted)' }}>Budget: {formattedBudget}</span>
            </div>
            <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${tripProgress}%`,
                  backgroundColor: tripProgress >= 100 ? 'var(--accent-danger)' : 'var(--accent)',
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
