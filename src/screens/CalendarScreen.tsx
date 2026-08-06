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

  const currentMonthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  const monthHolidays = CAMBODIA_NATIONAL_HOLIDAYS.filter(h => h.dateStr.startsWith(currentMonthPrefix));

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Collapsible Cambodian National Holidays Bar (Filtered by Selected Month) */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          marginBottom: '14px',
          borderRadius: '16px',
          borderColor: 'rgba(255, 123, 114, 0.35)',
          backgroundColor: 'rgba(255, 123, 114, 0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 123, 114, 0.18)',
                color: 'var(--accent-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flag size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Holidays • បុណ្យជាតិ</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
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
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--accent-danger)',
              borderColor: 'rgba(255, 123, 114, 0.3)',
              backgroundColor: 'rgba(255, 123, 114, 0.12)',
              cursor: 'pointer',
            }}
          >
            {isHolidaysOpen ? 'Close' : 'Open'}
            {isHolidaysOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Collapsible List of Holidays in Khmer & English for Selected Month */}
        {isHolidaysOpen && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
            {monthHolidays.length > 0 ? (
              monthHolidays.map(h => (
                <div
                  key={h.dateStr + h.nameEn}
                  onClick={() => {
                    setSelectedDay(h.dateStr);
                    setViewDate(new Date(h.dateStr + 'T00:00:00'));
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: selectedDay === h.dateStr ? 'rgba(255, 123, 114, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedDay === h.dateStr ? '1px solid var(--accent-danger)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={14} color="var(--accent-danger)" />
                    <div>
                      {h.nameKh && (
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{h.nameKh}</div>
                      )}
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{h.nameEn}</div>
                    </div>
                  </div>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--accent-danger)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 123, 114, 0.15)',
                    }}
                  >
                    {h.dateStr}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
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
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 82, 82, 0.6)',
            backgroundColor: 'rgba(255, 82, 82, 0.18)',
            color: 'var(--accent-danger)',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '14px',
            boxShadow: '0 8px 24px rgba(255, 82, 82, 0.25)',
          }}
        >
          <CambodiaFlagBadge size={22} />
          <div>
            <div>{selectedDateDetails.holiday.nameKh || selectedDateDetails.holiday.nameEn}</div>
            <div style={{ fontSize: '10px', opacity: 0.9, fontWeight: 700 }}>
              {selectedDateDetails.holiday.nameEn} • National Public Holiday
            </div>
          </div>
        </div>
      )}

      {/* Pchum Ben / Cultural Festival Season Banner (Kan Ben 1-15) - Blue Theme */}
      {selectedDateDetails.culturalEvent && !selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(41, 128, 185, 0.5)',
            backgroundColor: 'rgba(41, 128, 185, 0.16)',
            color: '#2980B9',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '14px',
          }}
        >
          <BenOfferingIcon size={22} color="#2980B9" />
          <div>
            <div>{selectedDateDetails.culturalEvent}</div>
            <div style={{ fontSize: '10px', opacity: 0.9, fontWeight: 700 }}>
              Pchum Ben Season (Bay Ben Merit Offering Period)
            </div>
          </div>
        </div>
      )}

      {/* World Appreciation & Celebration Days Banner (Mother's Day, Father's Day, Girlfriend/Boyfriend Day, Halloween, Chinese New Year, Easter, etc.) */}
      {selectedDateDetails.worldDay && !selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 107, 129, 0.5)',
            backgroundColor: 'rgba(255, 107, 129, 0.16)',
            color: '#FF6B81',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '14px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{selectedDateDetails.worldDay.emoji || '💖'}</span>
          <div>
            <div>{selectedDateDetails.worldDay.nameKh} ({selectedDateDetails.worldDay.nameEn})</div>
            <div style={{ fontSize: '10px', opacity: 0.9, fontWeight: 700 }}>
              World Celebration & Appreciation Day
            </div>
          </div>
        </div>
      )}

      {/* Buddhist Holy Day Banner (Dedicated Buddha Silhouette Icon) */}
      {selectedDateDetails.isBuddhaDay && !selectedDateDetails.holiday && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(243, 156, 18, 0.5)',
            backgroundColor: 'rgba(243, 156, 18, 0.15)',
            color: '#F39C12',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '14px',
          }}
        >
          <BuddhaIcon size={22} color="#F39C12" />
          <div>
            <div>{selectedDateDetails.buddhaDayName}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Buddhist Holy Day (4 Days / Month • Uposatha)
            </div>
          </div>
        </div>
      )}

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
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Net Cashflow in {year}</div>
            <div
              className="tabular-nums"
              style={{
                fontSize: '24px',
                fontWeight: 800,
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
                  borderColor: m.netUSD !== 0 ? (m.netUSD > 0 ? 'rgba(0, 184, 148, 0.35)' : 'rgba(255, 82, 82, 0.35)') : 'var(--border-glass)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800 }}>{m.monthName}</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
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
        <div className="glass-panel" style={{ padding: '14px', marginBottom: '16px' }}>
          {/* Day Headers (Highlighting Sun & Sat weekends) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => {
              const isWeekendHeader = idx === 0 || idx === 6;
              return (
                <div
                  key={d}
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
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
              <div key={'empty-' + i} style={{ height: '52px' }} />
            ))}

            {days.map(item => {
              const isSel = selectedDay === item.dateStr;
              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              const isHoliday = !!item.dateDetails.holiday;
              const isBuddhaDay = item.dateDetails.isBuddhaDay;
              const isCultural = !!item.dateDetails.culturalEvent;
              const isWeekend = item.dateDetails.isWeekend;
              const net = item.netDailyBalance;

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDay(item.dateStr)}
                  style={{
                    position: 'relative',
                    height: '52px',
                    borderRadius: '10px',
                    border: isSel
                      ? '2px solid var(--accent)'
                      : isHoliday
                      ? '1.5px solid var(--accent-danger)'
                      : isToday
                      ? '1.5px solid var(--accent)'
                      : '1px solid var(--border-glass)',
                    backgroundColor: isSel
                      ? 'rgba(46, 170, 220, 0.25)'
                      : isHoliday
                      ? 'rgba(255, 82, 82, 0.18)'
                      : net > 0
                      ? 'rgba(0, 184, 148, 0.14)'
                      : net < 0
                      ? 'rgba(255, 82, 82, 0.14)'
                      : isWeekend
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(255, 255, 255, 0.03)',
                    boxShadow: isHoliday
                      ? '0 0 10px rgba(255, 82, 82, 0.35)'
                      : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 2px',
                    cursor: 'pointer',
                  }}
                >
                  {/* Top Day Number & Distinct Holiday/Buddha/KanBen Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isHoliday
                          ? 'var(--accent-danger)'
                          : isWeekend
                          ? 'var(--accent-danger)'
                          : isSel
                          ? 'var(--accent)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {item.dayNum}
                    </span>
                    {isHoliday && <CambodiaFlagBadge size={11} />}
                    {isBuddhaDay && !isHoliday && <BuddhaIcon size={12} color="#F39C12" />}
                    {isCultural && !isHoliday && !isBuddhaDay && <BenOfferingIcon size={11} color="#2980B9" />}
                    {item.dateDetails.worldDay && !isHoliday && !isBuddhaDay && !isCultural && (
                      <span style={{ fontSize: '9px', lineHeight: 1 }}>{item.dateDetails.worldDay.emoji || '💖'}</span>
                    )}
                  </div>

                  {/* Net Cashflow Amount Display (> 0 Green, < 0 Red) */}
                  {net !== 0 && (
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Transactions on {selectedDay}</h4>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
            {selectedDateDetails.formattedDateEn}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            className="tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 800,
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
