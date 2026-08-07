import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../services/storageService';
import { getDateDetails, CAMBODIA_NATIONAL_HOLIDAYS, WORLD_CELEBRATION_DAYS } from '../services/khmerCalendarService';
import { ExpenseCard } from '../components/ExpenseCard';
import { BuddhaIcon, BenOfferingIcon, CambodiaFlagBadge } from '../components/CalendarCustomIcons';
import { Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check, Flag, Sparkles, Sun, Heart, Globe, Users } from 'lucide-react';

type CalendarViewMode = 'YEAR' | 'MONTH';

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
      .filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'))
      .reduce((sum, e) => sum + e.amount, 0);

    const daySavSum = dayItems
      .filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'))
      .reduce((sum, e) => sum + e.amount, 0);

    // Net Daily Balance = Savings - Expenses
    const netDailyBalance = daySavSum - dayExpSum;

    days.push({
      dateStr,
      dayNum: d,
      dayExpSum,
      daySavSum,
      netDailyBalance,
      count: dayItems.length,
      dateDetails,
    });
  }

  const selectedDateDetails = getDateDetails(selectedDay);

  const yearMonths = SHORT_MONTH_NAMES.map((name, idx) => {
    const monthPrefix = `${year}-${(idx + 1).toString().padStart(2, '0')}`;
    const mExpenses = expenses.filter(e => e.date.startsWith(monthPrefix));

    const mExpSum = mExpenses
      .filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'))
      .reduce((sum, e) => sum + e.amount, 0);

    const mSavSum = mExpenses
      .filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'))
      .reduce((sum, e) => sum + e.amount, 0);

    const netUSD = mSavSum - mExpSum;

    return { monthIdx: idx, monthName: name, netUSD, count: mExpenses.length };
  });

  const totalYearNetUSD = yearMonths.reduce((sum, m) => sum + m.netUSD, 0);

  const prevYear = () => setViewDate(new Date(year - 1, month, 1));
  const nextYear = () => setViewDate(new Date(year + 1, month, 1));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectedDayItems = expenses.filter(e => e.date === selectedDay);
  const selectedDayExpSum = selectedDayItems
    .filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'))
    .reduce((sum, e) => sum + e.amount, 0);
  const selectedDaySavSum = selectedDayItems
    .filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'))
    .reduce((sum, e) => sum + e.amount, 0);
  const selectedDayNetUSD = selectedDaySavSum - selectedDayExpSum;

  const formatCellAmount = (netUSD: number) => {
    if (hideBalances) return '••';
    if (netUSD === 0) return '';

    const absUSD = Math.abs(netUSD);
    const prefix = netUSD > 0 ? '+' : '-';

    if (currency === 'KHR') {
      const khrVal = absUSD * 4000;
      return prefix + (khrVal >= 1000 ? Math.round(khrVal / 1000) + 'k' : '៛' + Math.round(khrVal));
    }
    return prefix + '$' + (absUSD >= 1000 ? (absUSD / 1000).toFixed(1) + 'k' : (absUSD % 1 === 0 ? absUSD : absUSD.toFixed(1)));
  };

  const getHeaderTitleLabel = () => {
    if (viewMode === 'YEAR') return `Year ${year}`;
    return `${MONTH_NAMES[month]} ${year}`;
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
  const monthHolidays = CAMBODIA_NATIONAL_HOLIDAYS.filter(h => h.dateStr.startsWith(currentMonthPrefix));

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Collapsible Cambodian National Holidays Bar (Filtered by Selected Month) */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 14px',
          marginBottom: '14px',
          borderRadius: '14px',
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CambodiaFlagBadge size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                Holidays • បុណ្យជាតិ
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                {monthHolidays.length > 0
                  ? `${monthHolidays.length} Public Holidays in ${MONTH_NAMES[month]}`
                  : `No Public Holidays in ${MONTH_NAMES[month]}`}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsHolidaysOpen(!isHolidaysOpen)}
            className="glass-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              cursor: 'pointer',
            }}
          >
            {isHolidaysOpen ? 'Hide' : 'Show'}
            {isHolidaysOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Collapsible List of Holidays in Khmer & English for Selected Month */}
        {isHolidaysOpen && (
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '260px',
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
                      backgroundColor: isSelected ? 'var(--pill-hover)' : 'var(--pill-bg)',
                      border: isSelected ? '1px solid var(--accent-danger)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Left Side: Date Card + Holiday Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      {/* Mini Calendar Ticket Badge */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            color: 'var(--accent-danger)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            lineHeight: 1,
                          }}
                        >
                          {dateInfo.monthName}
                        </span>
                        <span
                          className="tabular-nums"
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1.1,
                            marginTop: '2px',
                          }}
                        >
                          {dateInfo.dayNum}
                        </span>
                      </div>

                      {/* Holiday Names in Khmer & English */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        {h.nameKh && (
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.3,
                            }}
                          >
                            {h.nameKh}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            fontWeight: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h.nameEn} • {dateInfo.dayOfWeek}
                        </div>
                      </div>
                    </div>

                    {/* Right Side Tag */}
                    <div style={{ flexShrink: 0, marginLeft: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--accent-danger)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Holiday
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                No national public holidays scheduled for {MONTH_NAMES[month]} {year}
              </div>
            )}
          </div>
        )}
      </div>

      {/* National Public Holiday Banner (Red Day Off Theme) */}
      {selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            marginBottom: '12px',
          }}
        >
          <CambodiaFlagBadge size={22} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedDateDetails.holiday.nameKh || selectedDateDetails.holiday.nameEn}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'var(--accent-danger)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                Public Holiday
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>
              {selectedDateDetails.holiday.nameEn} • National Day Off
            </div>
          </div>
        </div>
      )}

      {/* Cultural Festival Season Banner */}
      {selectedDateDetails.culturalEvent && !selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            color: 'var(--accent-light)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          <BenOfferingIcon size={20} color="var(--accent-light)" />
          <div>
            <div>{selectedDateDetails.culturalEvent}</div>
            <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 400 }}>
              Pchum Ben Season
            </div>
          </div>
        </div>
      )}

      {/* World Appreciation & Celebration Days Banner */}
      {selectedDateDetails.worldDay && !selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            backgroundColor: 'rgba(236, 72, 153, 0.08)',
            color: '#EC4899',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '18px' }}>{selectedDateDetails.worldDay.emoji || '💖'}</span>
          <div>
            <div>{selectedDateDetails.worldDay.nameKh} ({selectedDateDetails.worldDay.nameEn})</div>
            <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 400 }}>
              World Celebration & Appreciation Day
            </div>
          </div>
        </div>
      )}

      {/* Buddhist Holy Day Banner */}
      {selectedDateDetails.isBuddhaDay && !selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: '#F59E0B',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          <BuddhaIcon size={20} color="#F59E0B" />
          <div>
            <div>{selectedDateDetails.buddhaDayName}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>
              Buddhist Holy Day (Uposatha)
            </div>
          </div>
        </div>
      )}

      {/* Top Glass View & Date Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', position: 'relative' }}>
        {/* Dropdown Selector Trigger */}
        <button
          className="glass-pill"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ padding: '6px 12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', gap: '6px' }}
        >
          <Calendar size={15} style={{ color: 'var(--accent)' }} />
          <span>{getHeaderTitleLabel()}</span>
          <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Navigation Arrow Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="glass-pill"
            onClick={viewMode === 'YEAR' ? prevYear : prevMonth}
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="glass-pill"
            onClick={viewMode === 'YEAR' ? nextYear : nextMonth}
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Dropdown Popover Modal */}
        {isDropdownOpen && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '42px',
              left: 0,
              zIndex: 50,
              width: '260px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', padding: '2px 4px', marginBottom: '2px' }}>
              CALENDAR VIEW
            </div>
            {[
              { id: 'YEAR', label: 'Year View', desc: '12-month annual overview' },
              { id: 'MONTH', label: 'Month View', desc: '30-day interactive grid' },
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
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--border-glass)' : '1px solid transparent',
                    backgroundColor: isActive ? 'var(--pill-hover)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  {isActive && <Check size={15} style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* YEAR VIEW MODE */}
      {viewMode === 'YEAR' && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--pill-bg)', marginBottom: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Net Cashflow in {year}</div>
            <div
              className="tabular-nums"
              style={{
                fontSize: '22px',
                fontWeight: 700,
                marginTop: '2px',
                color: totalYearNetUSD >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
              }}
            >
              {hideBalances ? '••••' : (totalYearNetUSD >= 0 ? '+' : '') + formatCurrency(totalYearNetUSD, currency)}
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
                  borderColor: 'var(--border-glass)',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.monthName}</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: m.netUSD > 0 ? 'var(--accent-success)' : m.netUSD < 0 ? 'var(--accent-danger)' : 'var(--text-muted)',
                  }}
                >
                  {m.netUSD !== 0 ? formatCellAmount(m.netUSD) : '-'}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{m.count} entries</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH VIEW GRID MODE */}
      {viewMode === 'MONTH' && (
        <div className="glass-panel" style={{ padding: '12px', marginBottom: '16px' }}>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => {
              const isWeekendHeader = idx === 0 || idx === 6;
              return (
                <div
                  key={d}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isWeekendHeader ? 'var(--accent-danger)' : 'var(--text-muted)',
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {emptyLeadingCells.map((_, i) => (
              <div key={'empty-' + i} style={{ height: '48px' }} />
            ))}

            {days.map(item => {
              const isSel = selectedDay === item.dateStr;
              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              const isHoliday = !!item.dateDetails.holiday;
              const isBuddhaDay = item.dateDetails.isBuddhaDay;
              const isCultural = !!item.dateDetails.culturalEvent;
              const net = item.netDailyBalance;

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDay(item.dateStr)}
                  style={{
                    position: 'relative',
                    height: '48px',
                    borderRadius: '8px',
                    border: isSel
                      ? '1.5px solid var(--accent)'
                      : isHoliday
                      ? '1px solid var(--accent-danger)'
                      : isToday
                      ? '1px solid var(--accent-light)'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: isSel
                      ? 'var(--pill-hover)'
                      : 'var(--pill-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 2px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Day Number & Distinct Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSel || isToday ? 700 : 500,
                        color: isHoliday
                          ? 'var(--accent-danger)'
                          : isSel
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {item.dayNum}
                    </span>
                    {isHoliday && <CambodiaFlagBadge size={10} />}
                    {isBuddhaDay && !isHoliday && <BuddhaIcon size={11} color="#F59E0B" />}
                    {isCultural && !isHoliday && !isBuddhaDay && <BenOfferingIcon size={10} color="#3B82F6" />}
                    {item.dateDetails.worldDay && !isHoliday && !isBuddhaDay && !isCultural && (
                      <span style={{ fontSize: '9px', lineHeight: 1 }}>{item.dateDetails.worldDay.emoji || '💖'}</span>
                    )}
                  </div>

                  {/* Net Cashflow Amount Display */}
                  {net !== 0 && (
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: net > 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                      }}
                    >
                      {formatCellAmount(net)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Details Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
            Transactions on {selectedDay}
          </h4>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>
            {selectedDateDetails.formattedDateEn}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            className="tabular-nums"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: selectedDayNetUSD > 0 ? 'var(--accent-success)' : selectedDayNetUSD < 0 ? 'var(--accent-danger)' : 'var(--text-primary)',
            }}
          >
            {hideBalances
              ? '••••'
              : (selectedDayNetUSD > 0 ? '+' : '') + formatCurrency(selectedDayNetUSD, currency)}
          </span>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Exp: {formatCurrency(selectedDayExpSum, currency)} | Sav: {formatCurrency(selectedDaySavSum, currency)}
          </div>
        </div>
      </div>

      {/* Day Transactions List */}
      <div>
        {selectedDayItems.length > 0 ? (
          selectedDayItems.map(item => (
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
