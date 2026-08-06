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
          <Zap size={16} color={pageAccent} />
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Presets</h3>
        </div>
        <button
          type="button"
          className="glass-pill"
          onClick={onAddPreset}
          style={{ fontSize: '11px', padding: '4px 10px', color: pageAccent, borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Dynamic 9-Bar Quick Presets Grid (Strictly 3x3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {presetsList.slice(0, 9).map((preset, idx) => {
          const customHex = presetPalette[idx % presetPalette.length] || DEFAULT_PRESET_PALETTE[idx % DEFAULT_PRESET_PALETTE.length];
          const tileHex = customHex;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 8px 10px 8px',
                borderRadius: '18px',
                border: `1.5px solid ${hexToRgba(tileHex, 0.4)}`,
                backgroundColor: hexToRgba(tileHex, 0.15),
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${hexToRgba(tileHex, 0.2)}`,
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                minHeight: '110px',
              }}
            >
              {/* Icon Badge */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: hexToRgba(tileHex, 0.25),
                  border: `1px solid ${hexToRgba(tileHex, 0.45)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  marginBottom: '6px',
                  boxShadow: `0 2px 8px ${hexToRgba(tileHex, 0.25)}`,
                }}
              >
                <CategoryIconRenderer icon={preset.icon} size={22} color={tileHex} />
              </div>

              {/* Title & Price Pill */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    lineHeight: '1.2',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {preset.title}
                </div>

                {/* High Contrast Price Pill */}
                <div
                  className="tabular-nums"
                  style={{
                    display: 'block',
                    padding: '3px 6px',
                    borderRadius: '8px',
                    backgroundColor: hexToRgba(tileHex, 0.2),
                    border: `1px solid ${hexToRgba(tileHex, 0.4)}`,
                    fontSize: '11px',
                    fontWeight: 900,
                    color: tileHex,
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
