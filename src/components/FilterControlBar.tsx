import React, { useState } from 'react';
import { useTheme, hexToRgba } from '../context/ThemeContext';
import { useExpenses, DateRangeOption, SortOption } from '../context/ExpenseContext';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { PaymentMethod } from '../types';

import { TripFolderBar } from './TripFolderBar';

interface FilterControlBarProps {
  screenType?: 'EXPENSE' | 'SAVING';
}

export const FilterControlBar: React.FC<FilterControlBarProps> = ({ screenType = 'EXPENSE' }) => {
  const { pageColors } = useTheme();
  const screenAccent = screenType === 'SAVING'
    ? pageColors?.SAVING || '#00E676'
    : pageColors?.EXPENSES || '#6C5CE7';

  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentFilter,
    setPaymentFilter,
    dateRangeFilter,
    setDateRangeFilter,
    sortBy,
    setSortBy,
    resetAllFilters,
    categories,
    expenses,
  } = useExpenses();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    searchQuery !== '' ||
    categoryFilter !== null ||
    paymentFilter !== 'ALL' ||
    dateRangeFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  // Strict Screen-Specific Category Filtering
  const isSavingScreen = screenType === 'SAVING';

  const screenItems = expenses.filter(e => {
    if (isSavingScreen) {
      return e.type === 'SAVING' || e.categoryId.startsWith('cat-saving');
    }
    return e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income');
  });

  const visibleCategories = categories.filter(cat => {
    if (isSavingScreen) {
      return cat.type === 'SAVING' || cat.id.startsWith('cat-saving');
    }
    return cat.type !== 'SAVING' && cat.type !== 'INCOME' && !cat.id.startsWith('cat-saving');
  });

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Universal Search Input & Filter Drawer Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '42px',
          padding: '0 12px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          backgroundColor: 'var(--bg-card)',
          marginBottom: '8px',
        }}
      >
        <Search size={16} color={screenAccent} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search..."
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
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        )}

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            border: hasActiveFilters ? `1px solid ${screenAccent}` : '1px solid var(--border-glass)',
            backgroundColor: hasActiveFilters ? screenAccent : 'rgba(255, 255, 255, 0.06)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Filter"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Screen-Specific Category Chips Carousel */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingTop: '2px',
          paddingBottom: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          className="glass-pill"
          onClick={() => setCategoryFilter(null)}
          style={{
            backgroundColor: categoryFilter === null ? screenAccent : 'rgba(255, 255, 255, 0.06)',
            borderColor: categoryFilter === null ? screenAccent : 'var(--border-glass)',
            color: categoryFilter === null ? '#FFF' : 'var(--text-primary)',
          }}
        >
          All ({screenItems.length})
        </button>

        {visibleCategories.map(cat => {
          const isActive = categoryFilter === cat.id;
          const count = screenItems.filter(e => e.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              className="glass-pill"
              onClick={() => setCategoryFilter(isActive ? null : cat.id)}
              style={{
                backgroundColor: isActive ? screenAccent : 'rgba(255, 255, 255, 0.06)',
                borderColor: isActive ? screenAccent : 'var(--border-glass)',
                color: isActive ? '#FFF' : 'var(--text-primary)',
              }}
            >
              <CategoryIconRenderer icon={cat.icon} size={12} color={isActive ? '#FFF' : screenAccent} />
              <span>
                {cat.name} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Expansion Drawer */}
      {showAdvanced && (
        <div
          className="glass-panel"
          style={{
            padding: '14px',
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Payment Method Filter */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Payment
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(['ALL', 'Cash', 'Bank'] as const).map(pm => {
                const isActive = paymentFilter === pm;
                return (
                  <button
                    key={pm}
                    className="glass-pill"
                    onClick={() => setPaymentFilter(pm as any)}
                    style={{
                      backgroundColor: isActive ? screenAccent : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isActive ? screenAccent : 'var(--border-glass)',
                      color: isActive ? '#FFF' : 'var(--text-primary)',
                    }}
                  >
                    {pm === 'ALL' ? 'All' : pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Period Filter */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Period
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'THIS_MONTH', label: 'Month' },
                { id: 'TODAY', label: 'Today' },
              ].map(dr => {
                const isActive = dateRangeFilter === dr.id;
                return (
                  <button
                    key={dr.id}
                    className="glass-pill"
                    onClick={() => setDateRangeFilter(dr.id as DateRangeOption)}
                    style={{
                      backgroundColor: isActive ? screenAccent : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isActive ? screenAccent : 'var(--border-glass)',
                      color: isActive ? '#FFF' : 'var(--text-primary)',
                    }}
                  >
                    {dr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By Order */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Sort
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'NEWEST', label: 'Newest' },
                { id: 'HIGHEST', label: 'Highest' },
                { id: 'LOWEST', label: 'Lowest' },
                { id: 'OLDEST', label: 'Oldest' },
              ].map(sb => {
                const isActive = sortBy === sb.id;
                return (
                  <button
                    key={sb.id}
                    className="glass-pill"
                    onClick={() => setSortBy(sb.id as SortOption)}
                    style={{
                      backgroundColor: isActive ? screenAccent : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isActive ? screenAccent : 'var(--border-glass)',
                      color: isActive ? '#FFF' : 'var(--text-primary)',
                    }}
                  >
                    {sb.label}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                resetAllFilters();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 123, 114, 0.35)',
                backgroundColor: 'rgba(255, 123, 114, 0.15)',
                color: 'var(--accent-danger)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};
