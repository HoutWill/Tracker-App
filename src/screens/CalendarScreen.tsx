import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, getTodayDateString, KHR_PER_USD } from '../services/storageService';
import { getDateDetails, getCambodiaHolidaysForYear } from '../services/khmerCalendarService';
import { CategoryIconRenderer } from '../components/CategoryIconRenderer';
import { BuddhaIcon, BenOfferingIcon, CambodiaFlagBadge } from '../components/CalendarCustomIcons';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  PiggyBank,
} from 'lucide-react';

type CalendarViewMode = 'MONTH' | 'YEAR';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const CalendarScreen: React.FC = () => {
  const {
    expenses,
    currency,
    setSelectedExpenseForEdit,
    deleteExpense,
    setIsAddExpenseOpen,
    setSelectedDate,
  } = useExpenses();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDateString());
  const [isHolidaysOpen, setIsHolidaysOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const emptyLeadingCells = Array.from({ length: firstDayOfWeek });

  const days: any[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dateDetails = getDateDetails(dateStr);
    const dayItems = expenses.filter(e => e.date === dateStr);

    const dayExpSum = dayItems
      .filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId?.startsWith('cat-saving') && e.categoryId !== 'cat-income'))
      .reduce((sum, e) => sum + e.amount, 0);

    const daySavSum = dayItems
      .filter(e => e.type === 'SAVING' || e.categoryId?.startsWith('cat-saving'))
      .reduce((sum, e) => sum + e.amount, 0);

    const netDailyBalance = daySavSum - dayExpSum;

    days.push({
      dateStr,
      dayNum: d,
      dayExpSum,
      daySavSum,
      netDailyBalance,
      count: dayItems.length,
      dateDetails,
      dayItems,
    });
  }

  const selectedDateDetails = getDateDetails(selectedDay);

  const yearMonths = SHORT_MONTH_NAMES.map((name, idx) => {
    const monthPrefix = `${year}-${(idx + 1).toString().padStart(2, '0')}`;
    const mExpenses = expenses.filter(e => e.date.startsWith(monthPrefix));

    const mExpSum = mExpenses
      .filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId?.startsWith('cat-saving') && e.categoryId !== 'cat-income'))
      .reduce((sum, e) => sum + e.amount, 0);

    const mSavSum = mExpenses
      .filter(e => e.type === 'SAVING' || e.categoryId?.startsWith('cat-saving'))
      .reduce((sum, e) => sum + e.amount, 0);

    const netUSD = mSavSum - mExpSum;

    return { monthIdx: idx, monthName: name, netUSD, count: mExpenses.length };
  });

  const totalYearNetUSD = yearMonths.reduce((sum, m) => sum + m.netUSD, 0);

  const prevYear = () => setViewDate(new Date(year - 1, month, 1));
  const nextYear = () => setViewDate(new Date(year + 1, month, 1));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleTodayClick = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDay(getTodayDateString());
  };

  const selectedDayItems = expenses.filter(e => e.date === selectedDay);
  const selectedDayExpSum = selectedDayItems
    .filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId?.startsWith('cat-saving') && e.categoryId !== 'cat-income'))
    .reduce((sum, e) => sum + e.amount, 0);
  const selectedDaySavSum = selectedDayItems
    .filter(e => e.type === 'SAVING' || e.categoryId?.startsWith('cat-saving'))
    .reduce((sum, e) => sum + e.amount, 0);
  const selectedDayNetUSD = selectedDaySavSum - selectedDayExpSum;

  const formatCellAmount = (netUSD: number) => {
    if (netUSD === 0) return '';
    const absUSD = Math.abs(netUSD);
    const prefix = netUSD > 0 ? '+' : '-';

    if (currency === 'KHR') {
      const khrVal = absUSD * 4000;
      return prefix + (khrVal >= 1000 ? Math.round(khrVal / 1000) + 'k' : '៛' + Math.round(khrVal));
    }
    return prefix + '$' + (absUSD >= 1000 ? (absUSD / 1000).toFixed(1) + 'k' : (absUSD % 1 === 0 ? absUSD : absUSD.toFixed(1)));
  };

  const formatSecondaryVal = (amountUSD: number, primaryCurrency: string) => {
    if (primaryCurrency === 'USD') {
      const khrVal = Math.round(amountUSD * KHR_PER_USD);
      return `៛${khrVal.toLocaleString()}`;
    } else {
      return `$${amountUSD.toFixed(2)}`;
    }
  };

  const getCategoryTheme = (item: any) => {
    const isSaving = item.type === 'SAVING' || item.categoryId?.startsWith('cat-saving');
    const isIncome = item.type === 'INCOME' || item.categoryId === 'cat-income';
    if (isSaving) return { color: '#30D158', bg: 'rgba(48, 209, 88, 0.12)' };
    if (isIncome) return { color: '#4A99E9', bg: 'rgba(74, 153, 233, 0.12)' };
    switch ((item.categoryName || '').toLowerCase()) {
      case 'food':
        return { color: '#F3A85B', bg: 'rgba(243, 168, 91, 0.12)' };
      case 'drink':
      case 'coffee':
        return { color: '#ED6C6C', bg: 'rgba(237, 108, 108, 0.12)' };
      case 'transport':
        return { color: '#4A99E9', bg: 'rgba(74, 153, 233, 0.12)' };
      case 'groceries':
        return { color: '#30D158', bg: 'rgba(48, 209, 88, 0.12)' };
      case 'bills':
      case 'shopping':
      case 'party':
        return { color: '#EC668C', bg: 'rgba(236, 102, 140, 0.12)' };
      case 'fun':
      case 'team':
        return { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)' };
      default:
        return { color: '#F3A85B', bg: 'rgba(243, 168, 91, 0.12)' };
    }
  };

  const formatHolidayDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return { monthName: '', dayNum: 0, dayOfWeek: '', formatted: dateStr };
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = parseInt(parts[2], 10);
    return { monthName, dayNum, dayOfWeek, formatted: `${dayOfWeek}, ${monthName} ${dayNum}` };
  };

  const currentMonthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  const monthHolidays = getCambodiaHolidaysForYear(year).filter(h => h.dateStr.startsWith(currentMonthPrefix));

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Top Header Bar: Month Navigation, Today Pill, and Segmented Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Month Title & Chevron Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            {viewMode === 'YEAR' ? `Year ${year}` : `${MONTH_NAMES[month]} ${year}`}
          </h2>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="glass-pill"
              onClick={viewMode === 'YEAR' ? prevYear : prevMonth}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="glass-pill"
              onClick={viewMode === 'YEAR' ? nextYear : nextMonth}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Controls: Today Button & Segmented View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="glass-pill"
            onClick={handleTodayClick}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Today
          </button>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--pill-bg)',
              borderRadius: '10px',
              padding: '2px',
              border: '1px solid var(--border-glass)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('MONTH')}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'MONTH' ? '#4A99E9' : 'transparent',
                color: viewMode === 'MONTH' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode('YEAR')}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'YEAR' ? '#4A99E9' : 'transparent',
                color: viewMode === 'YEAR' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Slim Month Holidays Collapsible Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '10px 14px',
          marginBottom: '14px',
          borderRadius: '16px',
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(237, 108, 108, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CambodiaFlagBadge size={16} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Holidays
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 500 }}>
                {monthHolidays.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHolidaysOpen(!isHolidaysOpen)}
            className="glass-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {isHolidaysOpen ? 'Hide' : 'Show'}
            {isHolidaysOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Collapsible List of Holidays */}
        {isHolidaysOpen && (
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
            {monthHolidays.length > 0 ? (
              monthHolidays.map(h => {
                const dateInfo = formatHolidayDate(h.dateStr);
                const isSelected = selectedDay === h.dateStr;

                return (
                  <div
                    key={h.dateStr + h.nameEn}
                    onClick={() => {
                      setSelectedDay(h.dateStr);
                      setViewDate(new Date(h.dateStr + 'T00:00:00'));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(237, 108, 108, 0.15)' : 'var(--pill-bg)',
                      border: isSelected ? '1px solid #ED6C6C' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(237, 108, 108, 0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: '8px', fontWeight: 700, color: '#ED6C6C', textTransform: 'uppercase' }}>
                          {dateInfo.monthName}
                        </span>
                        <span className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {dateInfo.dayNum}
                        </span>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.nameKh || h.nameEn}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.nameEn}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#ED6C6C',
                        backgroundColor: 'rgba(237, 108, 108, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                    >
                      Holiday
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                None
              </div>
            )}
          </div>
        )}
      </div>

      {/* YEAR VIEW MODE */}
      {viewMode === 'YEAR' && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px', borderRadius: '20px' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--pill-bg)',
              marginBottom: '14px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Net</div>
            <div
              className="tabular-nums"
              style={{
                fontSize: '22px',
                fontWeight: 800,
                marginTop: '2px',
                color: totalYearNetUSD >= 0 ? '#30D158' : '#ED6C6C',
              }}
            >
              {(totalYearNetUSD >= 0 ? '+' : '') + formatCurrency(totalYearNetUSD, currency)}
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
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderColor: 'var(--border-glass)',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '14px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{m.monthName}</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    marginTop: '2px',
                    color: m.netUSD > 0 ? '#30D158' : m.netUSD < 0 ? '#ED6C6C' : 'var(--text-muted)',
                  }}
                >
                  {m.netUSD !== 0 ? formatCellAmount(m.netUSD) : '-'}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {m.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH VIEW GRID MODE */}
      {viewMode === 'MONTH' && (
        <div
          className="glass-panel"
          style={{
            padding: '12px 10px',
            marginBottom: '16px',
            borderRadius: '20px',
            borderColor: 'var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          {/* Day of Week Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => {
              const isWeekendHeader = idx === 0 || idx === 6;
              return (
                <div
                  key={d}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isWeekendHeader ? '#ED6C6C' : 'var(--text-muted)',
                    padding: '2px 0',
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* 7-Column Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {emptyLeadingCells.map((_, i) => (
              <div key={'empty-' + i} style={{ height: '54px' }} />
            ))}

            {days.map(item => {
              const isSel = selectedDay === item.dateStr;
              const isToday = item.dateStr === getTodayDateString();
              const isHoliday = !!item.dateDetails.holiday;
              const isBuddhaDay = item.dateDetails.isBuddhaDay;
              const net = item.netDailyBalance;
              const dayOfWeekNum = new Date(item.dateStr + 'T00:00:00').getDay();
              const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
              const hasExpense = item.dayExpSum > 0;
              const hasSaving = item.daySavSum > 0;

              // Up to 3 discrete micro-dots underneath
              const dots: { color: string; id: string }[] = [];
              if (isHoliday) dots.push({ color: '#ED6C6C', id: 'h' });
              if (isBuddhaDay && dots.length < 3) dots.push({ color: '#F3A85B', id: 'b' });
              if (hasExpense && dots.length < 3) dots.push({ color: '#4A99E9', id: 'e' });
              if (hasSaving && dots.length < 3) dots.push({ color: '#30D158', id: 's' });

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDay(item.dateStr)}
                  style={{
                    position: 'relative',
                    height: '54px',
                    borderRadius: '12px',
                    border: isSel
                      ? '1.5px solid #4A99E9'
                      : isToday
                      ? '1px solid rgba(74, 153, 233, 0.4)'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: isHoliday
                      ? 'rgba(237, 108, 108, 0.12)'
                      : isSel
                      ? 'var(--pill-hover)'
                      : 'var(--pill-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 1px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Day Number Badge */}
                  {isToday ? (
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#4A99E9',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {item.dayNum}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSel ? 800 : 600,
                        color: isHoliday
                          ? '#ED6C6C'
                          : isSel
                          ? 'var(--text-primary)'
                          : isWeekend
                          ? '#ED6C6C'
                          : 'var(--text-secondary)',
                        lineHeight: '22px',
                      }}
                    >
                      {item.dayNum}
                    </span>
                  )}

                  {/* Net Cashflow Amount Display */}
                  {net !== 0 ? (
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 700,
                        color: net > 0 ? '#30D158' : '#ED6C6C',
                        lineHeight: 1,
                      }}
                    >
                      {formatCellAmount(net)}
                    </div>
                  ) : (
                    <div style={{ height: '8px' }} />
                  )}

                  {/* Micro-Dots Indicators */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '2.5px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '4px',
                    }}
                  >
                    {dots.map(d => (
                      <span
                        key={d.id}
                        style={{
                          width: '3.5px',
                          height: '3.5px',
                          borderRadius: '50%',
                          backgroundColor: d.color,
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Agenda Bento Section */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          borderRadius: '20px',
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Bento Header: Title & Day Net Balance */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.2px',
              }}
            >
              Activity
            </h3>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
              {selectedDateDetails.formattedDateEn}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              className="tabular-nums"
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: selectedDayNetUSD > 0 ? '#30D158' : selectedDayNetUSD < 0 ? '#ED6C6C' : 'var(--text-secondary)',
              }}
            >
              {(selectedDayNetUSD > 0 ? '+' : '') + formatCurrency(selectedDayNetUSD, currency)}
            </span>
          </div>
        </div>

        {/* Status Metrics Pills Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          <span
            className="glass-pill"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--pill-bg)',
            }}
          >
            Items: {selectedDayItems.length}
          </span>
          <span
            className="glass-pill"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: selectedDayExpSum > 0 ? '#ED6C6C' : 'var(--text-secondary)',
              backgroundColor: 'var(--pill-bg)',
            }}
          >
            Expenses: {formatCurrency(selectedDayExpSum, currency)}
          </span>
          <span
            className="glass-pill"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: selectedDaySavSum > 0 ? '#30D158' : 'var(--text-secondary)',
              backgroundColor: 'var(--pill-bg)',
            }}
          >
            Savings: {formatCurrency(selectedDaySavSum, currency)}
          </span>

          {/* Holiday Badge */}
          {selectedDateDetails.holiday && (
            <span
              className="glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#ED6C6C',
                backgroundColor: 'rgba(237, 108, 108, 0.12)',
                borderColor: 'rgba(237, 108, 108, 0.25)',
              }}
            >
              <CambodiaFlagBadge size={12} />
              <span>{selectedDateDetails.holiday.nameEn}</span>
            </span>
          )}

          {/* Buddhist Holy Day Badge */}
          {selectedDateDetails.isBuddhaDay && !selectedDateDetails.holiday && (
            <span
              className="glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#F3A85B',
                backgroundColor: 'rgba(243, 168, 91, 0.12)',
                borderColor: 'rgba(243, 168, 91, 0.25)',
              }}
            >
              <BuddhaIcon size={12} color="#F3A85B" />
              <span>Uposatha</span>
            </span>
          )}

          {/* Cultural Season Badge */}
          {selectedDateDetails.culturalEvent && !selectedDateDetails.holiday && (
            <span
              className="glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#4A99E9',
                backgroundColor: 'rgba(74, 153, 233, 0.12)',
                borderColor: 'rgba(74, 153, 233, 0.25)',
              }}
            >
              <BenOfferingIcon size={12} color="#4A99E9" />
              <span>Season</span>
            </span>
          )}
        </div>

        {/* Transactions Stack for Selected Day */}
        {selectedDayItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedDayItems.map(item => {
              const theme = getCategoryTheme(item);
              const isSaving = item.type === 'SAVING' || item.categoryId?.startsWith('cat-saving');
              const isIncome = item.type === 'INCOME' || item.categoryId === 'cat-income';
              const formattedMain = formatCurrency(item.amount, currency);
              const secondaryFormatted = formatSecondaryVal(item.amount, currency);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedExpenseForEdit(item)}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Left: Category Icon Badge & Information */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        backgroundColor: theme.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.color,
                        flexShrink: 0,
                      }}
                    >
                      {isSaving ? (
                        <PiggyBank size={20} color={theme.color} />
                      ) : (
                        <CategoryIconRenderer icon={item.categoryIcon || 'receipt-outline'} size={20} color={theme.color} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {item.title || item.categoryName}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                          marginTop: '2px',
                        }}
                      >
                        {item.paymentMethod || 'Cash'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts & Quick Delete Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          letterSpacing: '-0.2px',
                          color: isSaving || isIncome ? '#30D158' : '#ED6C6C',
                        }}
                      >
                        {isSaving || isIncome ? `+${formattedMain}` : `-${formattedMain}`}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-secondary)',
                          marginTop: '1px',
                          fontWeight: 500,
                        }}
                      >
                        {secondaryFormatted}
                      </div>
                    </div>

                    {/* Inline Quick Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete?')) {
                          deleteExpense(item.id);
                        }
                      }}
                      className="glass-pill"
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        border: '1px solid var(--border-glass)',
                        backgroundColor: 'rgba(237, 108, 108, 0.08)',
                        color: '#ED6C6C',
                        cursor: 'pointer',
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(74, 153, 233, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4A99E9',
                marginBottom: '2px',
              }}
            >
              <Calendar size={18} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Quiet
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              None
            </div>
          </div>
        )}

        {/* Quick Add Action Button */}
        <button
          type="button"
          onClick={() => {
            setSelectedDate(selectedDay);
            setIsAddExpenseOpen(true);
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            backgroundColor: '#4A99E9',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            marginTop: '12px',
            boxShadow: '0 4px 14px rgba(74, 153, 233, 0.25)',
            transition: 'opacity 0.15s ease',
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
