import React from 'react';
import { QuickPreset, CurrencyCode } from '../types';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { useTheme, hexToRgba, DEFAULT_PRESET_PALETTE } from '../context/ThemeContext';
import { formatCurrency } from '../services/storageService';
import { Plus, Zap } from 'lucide-react';

interface ArtPresetGridProps {
  presetsList: QuickPreset[];
  currency: CurrencyCode;
  pageAccent: string;
  onSelectPreset: (preset: QuickPreset) => void;
  onAddPreset: () => void;
  colorOffset?: number;
}

export const ArtPresetGrid: React.FC<ArtPresetGridProps> = ({
  presetsList,
  currency,
  pageAccent,
  onSelectPreset,
  onAddPreset,
  colorOffset = 0,
}) => {
  const { presetPalette } = useTheme();

  return (
    <div style={{ marginBottom: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={15} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.1px', color: 'var(--text-primary)' }}>Quick Presets</h3>
        </div>
        <button
          type="button"
          className="glass-pill"
          onClick={onAddPreset}
          style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--text-secondary)', borderColor: 'var(--border-glass)' }}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Dynamic 9-Bar Quick Presets Grid (3x3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {presetsList.slice(0, 9).map((preset, idx) => {
          const rawHex = presetPalette[idx % presetPalette.length];
          const tileHex = (!rawHex || rawHex === '#FFFFFF') ? DEFAULT_PRESET_PALETTE[idx % DEFAULT_PRESET_PALETTE.length] : rawHex;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                minHeight: '100px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--pill-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
            >
              {/* Soft Muted Colored Icon Badge Circle */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: hexToRgba(tileHex, 0.12),
                  border: `1px solid ${hexToRgba(tileHex, 0.22)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tileHex,
                  marginBottom: '8px',
                }}
              >
                <CategoryIconRenderer icon={preset.icon} size={18} color={tileHex} />
              </div>

              {/* Title & Price */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '1.2',
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {preset.title}
                </div>

                {/* Price Text */}
                <div
                  className="tabular-nums"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    width: '100%',
                  }}
                >
                  {formatCurrency(preset.amount, currency)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
