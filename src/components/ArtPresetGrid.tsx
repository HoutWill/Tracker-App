import React from 'react';
import { QuickPreset, CurrencyCode } from '../types';
import { CategoryIconRenderer } from './CategoryIconRenderer';
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

// Bright, High-Contrast Vibrant Pastel Palette (Ultra-Readable)
const BRIGHT_PASTEL_PALETTE = [
  { bg: 'rgba(230, 255, 250, 0.95)', text: '#064E3B', icon: '#059669', badgeBg: '#D1FAE5', border: '#A7F3D0' }, // Mint
  { bg: 'rgba(255, 251, 235, 0.95)', text: '#78350F', icon: '#D97706', badgeBg: '#FEF3C7', border: '#FDE68A' }, // Amber
  { bg: 'rgba(255, 241, 242, 0.95)', text: '#881337', icon: '#E11D48', badgeBg: '#FFE4E6', border: '#FECDD3' }, // Rose
  { bg: 'rgba(243, 232, 255, 0.95)', text: '#581C87', icon: '#7C3AED', badgeBg: '#E9D5FF', border: '#DDD6FE' }, // Purple
  { bg: 'rgba(224, 242, 254, 0.95)', text: '#0C4A6E', icon: '#0284C7', badgeBg: '#BAE6FD', border: '#7DD3FC' }, // Sky
  { bg: 'rgba(254, 249, 195, 0.95)', text: '#713F12', icon: '#CA8A04', badgeBg: '#FEF08A', border: '#FDE047' }, // Sun
];

export const ArtPresetGrid: React.FC<ArtPresetGridProps> = ({
  presetsList,
  currency,
  pageAccent,
  onSelectPreset,
  onAddPreset,
  colorOffset = 0,
}) => {
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

      {/* Bright, Ultra-Readable Tactile Pastel Preset Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {presetsList.map((preset, idx) => {
          const theme = BRIGHT_PASTEL_PALETTE[(idx + colorOffset) % BRIGHT_PASTEL_PALETTE.length];
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
                borderRadius: '16px',
                border: `2px solid ${theme.border}`,
                backgroundColor: theme.bg,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
                transition: 'all 0.15s ease-in-out',
                minHeight: '110px',
              }}
            >
              {/* Vibrant Icon Badge */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: theme.badgeBg,
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.icon,
                  marginBottom: '6px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CategoryIconRenderer icon={preset.icon} size={22} color={theme.icon} />
              </div>

              {/* Title & Price Pill */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    lineHeight: '1.2',
                    color: theme.text,
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
                    backgroundColor: theme.badgeBg,
                    border: `1px solid ${theme.border}`,
                    fontSize: '11px',
                    fontWeight: 900,
                    color: theme.text,
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
