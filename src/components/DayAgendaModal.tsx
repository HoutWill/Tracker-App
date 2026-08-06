import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useReminders } from '../context/ReminderContext';
import { formatCurrency } from '../services/storageService';
import { getDateDetails } from '../services/khmerCalendarService';
import { X, Bell, CheckSquare, Square, Calendar, CreditCard, PiggyBank } from 'lucide-react';

interface DayAgendaModalProps {
  selectedDay: string | null;
  onClose: () => void;
}

export const DayAgendaModal: React.FC<DayAgendaModalProps> = ({ selectedDay, onClose }) => {
  const { expenses, currency, hideBalances, setSelectedExpenseForEdit } = useExpenses();
  const { reminders, toggleReminder } = useReminders();

  if (!selectedDay) return null;

  const d = new Date(selectedDay + 'T00:00:00');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const isToday = selectedDay === new Date().toISOString().split('T')[0];
  const dateHeader = `${weekdays[d.getDay()]} – ${d.getDate()} ${months[d.getMonth()]}`;

  const dayReminders = reminders.filter(r => r.dueDate === selectedDay);
  const dayItems = expenses.filter(e => e.date === selectedDay);
  const dayExpenses = dayItems.filter(e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income'));
  const daySavings = dayItems.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const totalExp = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSav = daySavings.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(14px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '85vh',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          borderColor: isToday ? 'rgba(255, 82, 82, 0.5)' : 'var(--border-glass)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: isToday ? '#FF5252' : 'var(--text-primary)' }}>
              {dateHeader}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Exp: {formatCurrency(totalExp, currency)} | Sav: {formatCurrency(totalSav, currency)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Agenda Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          {/* Section 1: Tasks & Reminders */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Bell size={14} color="#FF4081" />
              <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Tasks ({dayReminders.length})</h4>
            </div>

            {dayReminders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dayReminders.map(r => (
                  <div
                    key={r.id}
                    className="glass-panel"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      borderLeft: r.level === 'URGENT' ? '4px solid #FF4081' : '4px solid #AB47BC',
                      opacity: r.completed ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => toggleReminder(r.id)}
                        style={{ background: 'none', border: 'none', color: r.completed ? 'var(--accent-success)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        {r.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, textDecoration: r.completed ? 'line-through' : 'none' }}>
                            {r.title}
                          </span>
                          {r.level === 'URGENT' && (
                            <span style={{ fontSize: '8px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(255, 64, 129, 0.2)', color: '#FF4081' }}>
                              Urgent
                            </span>
                          )}
                        </div>
                        {r.notes && <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.notes}</div>}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{r.dueTime || 'Task'}</div>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: '#AB47BC', marginTop: '1px' }}>{r.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                No tasks due on this date.
              </div>
            )}
          </div>

          {/* Section 2: Expenses */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CreditCard size={14} color="#2EAADC" />
              <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Expenses ({dayExpenses.length})</h4>
            </div>

            {dayExpenses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dayExpenses.map(item => (
                  <div
                    key={item.id}
                    className="glass-panel"
                    onClick={() => {
                      setSelectedExpenseForEdit(item);
                      onClose();
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      borderLeft: '4px solid #2EAADC',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{item.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.categoryName}</div>
                    </div>

                    <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {hideBalances ? '••••' : '-' + formatCurrency(item.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                No expenses on this date.
              </div>
            )}
          </div>

          {/* Section 3: Savings */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <PiggyBank size={14} color="#00E676" />
              <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Savings ({daySavings.length})</h4>
            </div>

            {daySavings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {daySavings.map(item => (
                  <div
                    key={item.id}
                    className="glass-panel"
                    onClick={() => {
                      setSelectedExpenseForEdit(item);
                      onClose();
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      borderLeft: '4px solid #00E676',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{item.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.categoryName}</div>
                    </div>

                    <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-success)' }}>
                      {hideBalances ? '••••' : '+' + formatCurrency(item.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                No savings on this date.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
