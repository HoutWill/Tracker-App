import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { ExpenseCard } from '../components/ExpenseCard';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';

type CalendarViewMode = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const CalendarScreen: React.FC = () => {
  const { expenses, currency, hideBalances, setSelectedExpenseForEdit } = useExpenses();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const emptyLeadingCells = Array.from({ length: firstDayOfWeek });

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const totalUSD = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    days.push({ dateStr, dayNum: d, totalUSD, count: dayExpenses.length });
  }

  const yearMonths = SHORT_MONTH_NAMES.map((name, idx) => {
    const monthPrefix = `${year}-${(idx + 1).toString().padStart(2, '0')}`;
    const mExpenses = expenses.filter(e => e.date.startsWith(monthPrefix));
    const totalUSD = mExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { monthIdx: idx, monthName: name, totalUSD, count: mExpenses.length };
  });

  const totalYearUSD = yearMonths.reduce((sum, m) => sum + m.totalUSD, 0);

  const prevYear = () => setViewDate(new Date(year - 1, month, 1));
  const nextYear = () => setViewDate(new Date(year + 1, month, 1));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectedDayExpenses = expenses.filter(e => e.date === selectedDay);
  const selectedDayTotalUSD = selectedDayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const formatCellAmount = (amtUSD: number) => {
    if (hideBalances) return '••';
    if (amtUSD <= 0) return '';
    if (currency === 'KHR') {
      const khrVal = amtUSD * 4000;
      return khrVal >= 1000 ? Math.round(khrVal / 1000) + 'k' : '៛' + Math.round(khrVal);
    }
    return amtUSD >= 1000 ? '$' + (amtUSD / 1000).toFixed(1) + 'k' : '$' + (amtUSD % 1 === 0 ? amtUSD : amtUSD.toFixed(1));
  };

  const getHeaderTitleLabel = () => {
    if (viewMode === 'YEAR') return `Year ${year}`;
    if (viewMode === 'MONTH') return `${MONTH_NAMES[month]} ${year}`;
    if (viewMode === 'WEEK') return `Week of ${selectedDay}`;
    return `Day ${selectedDay}`;
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Top Apple Glass View & Date Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', position: 'relative' }}>
        {/* Apple Glass Dropdown Selector Trigger */}
        <button
          className="glass-pill"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ padding: '8px 14px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', gap: '8px' }}
        >
          <Calendar size={16} color="var(--accent)" />
          <span>{getHeaderTitleLabel()}</span>
          <ChevronDown size={14} color="var(--accent)" />
        </button>

        {/* Navigation Arrow Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="glass-pill"
            onClick={viewMode === 'YEAR' ? prevYear : prevMonth}
            style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="glass-pill"
            onClick={viewMode === 'YEAR' ? nextYear : nextMonth}
            style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dropdown Popover Modal */}
        {isDropdownOpen && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '46px',
              left: 0,
              zIndex: 50,
              width: '280px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }}>
              SELECT CALENDAR VIEW
            </div>
            {[
              { id: 'YEAR', label: 'Year View', desc: '12-month annual overview' },
              { id: 'MONTH', label: 'Month View', desc: '30-day interactive month grid' },
              { id: 'WEEK', label: 'Week View', desc: '7-day weekly breakdown' },
              { id: 'DAY', label: 'Day View', desc: 'Single day transaction focus' },
            ].map(item => {
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setViewMode(item.id as CalendarViewMode);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: isActive ? 'rgba(46, 170, 220, 0.15)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                  {isActive && <Check size={16} color="var(--accent)" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* YEAR VIEW MODE */}
      {viewMode === 'YEAR' && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.04)', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Spent in {year}</div>
            <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>
              {hideBalances ? '••••' : formatCurrency(totalYearUSD, currency)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {yearMonths.map(m => (
              <div
                key={m.monthIdx}
                onClick={() => {
                  setViewDate(new Date(year, m.monthIdx, 1));
                  setViewMode('MONTH');
                }}
                className="glass-panel"
                style={{
                  padding: '10px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderColor: m.totalUSD > 0 ? 'rgba(46, 170, 220, 0.3)' : 'var(--border-glass)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800 }}>{m.monthName}</div>
                <div className="tabular-nums" style={{ fontSize: '11px', fontWeight: 800, color: m.totalUSD > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {m.totalUSD > 0 ? formatCellAmount(m.totalUSD) : '-'}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{m.count} entries</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH VIEW GRID MODE */}
      {viewMode === 'MONTH' && (
        <div className="glass-panel" style={{ padding: '14px', marginBottom: '16px' }}>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {emptyLeadingCells.map((_, i) => (
              <div key={'empty-' + i} style={{ height: '48px' }} />
            ))}

            {days.map(item => {
              const isSel = selectedDay === item.dateStr;
              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              const hasSpend = item.totalUSD > 0;
              const isHighSpend = item.totalUSD >= 30;

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDay(item.dateStr)}
                  style={{
                    height: '48px',
                    borderRadius: '10px',
                    border: isSel ? '2px solid var(--accent)' : isToday ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
                    backgroundColor: isSel
                      ? 'rgba(46, 170, 220, 0.25)'
                      : hasSpend
                      ? isHighSpend
                        ? 'rgba(255, 123, 114, 0.15)'
                        : 'rgba(46, 170, 220, 0.1)'
                      : 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 2px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: isSel ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {item.dayNum}
                  </div>
                  {hasSpend && (
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        color: isHighSpend ? 'var(--accent-danger)' : isSel ? 'var(--accent)' : 'var(--accent-success)',
                      }}
                    >
                      {formatCellAmount(item.totalUSD)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Transactions on {selectedDay}</h4>
        <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>
          {hideBalances ? '••••' : formatCurrency(selectedDayTotalUSD, currency)}
        </span>
      </div>

      {/* Day Transactions List */}
      <div>
        {selectedDayExpenses.length > 0 ? (
          selectedDayExpenses.map(item => (
            <ExpenseCard key={item.id} item={item} onPress={() => setSelectedExpenseForEdit(item)} />
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No transactions recorded on {selectedDay}.
          </div>
        )}
      </div>
    </div>
  );
};
