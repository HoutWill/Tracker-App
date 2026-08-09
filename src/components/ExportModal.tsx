import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Download, FileSpreadsheet, Calendar, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { exportCSVData } = useExpenses();

  const [exportPeriod, setExportPeriod] = useState<'ALL' | 'MONTH' | 'RANGE'>('ALL');
  const [exportType, setExportType] = useState<'ALL' | 'EXPENSE' | 'SAVING'>('ALL');
  const [exportStartDate, setExportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    let start: string | undefined = undefined;
    let end: string | undefined = undefined;

    if (exportPeriod === 'MONTH') {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (exportPeriod === 'RANGE') {
      start = exportStartDate;
      end = exportEndDate;
    }

    const csvContent = exportCSVData(exportType, start, end);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${exportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
  };

  return (
    <div className="modal-sheet-overlay" onClick={onClose}>
      <div
        className="modal-sheet-content"
        onClick={e => e.stopPropagation()}
        style={{ borderColor: 'rgba(46, 170, 220, 0.4)' }}
      >
        {/* iOS Drag Handle */}
        <div className="modal-sheet-handle" />
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(46, 170, 220, 0.15)',
                border: '1px solid rgba(46, 170, 220, 0.35)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Export</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CSV Spreadsheet Report Generator</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Timeframe Segmented Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
            Timeframe
          </label>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid var(--border-glass)',
            }}
          >
            {[
              { id: 'ALL', label: 'All' },
              { id: 'MONTH', label: 'Month' },
              { id: 'RANGE', label: 'Range' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setExportPeriod(p.id as any)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: exportPeriod === p.id ? 'var(--accent)' : 'transparent',
                  color: exportPeriod === p.id ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: exportPeriod === p.id ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Inputs */}
        {exportPeriod === 'RANGE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={exportStartDate}
                onChange={e => setExportStartDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  outline: 'none',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                End Date
              </label>
              <input
                type="date"
                value={exportEndDate}
                onChange={e => setExportEndDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  outline: 'none',
                  marginTop: '4px',
                }}
              />
            </div>
          </div>
        )}

        {/* Data Filter Segmented Selector */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
            Category Data
          </label>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid var(--border-glass)',
            }}
          >
            {[
              { id: 'ALL', label: 'All' },
              { id: 'EXPENSE', label: 'Expenses' },
              { id: 'SAVING', label: 'Saving' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setExportType(t.id as any)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: exportType === t.id ? 'var(--accent)' : 'transparent',
                  color: exportType === t.id ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: exportType === t.id ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Export Button */}
        <button
          onClick={handleExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '4px',
            boxShadow: 'none',
          }}
        >
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
  );
};
