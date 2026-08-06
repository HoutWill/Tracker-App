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

// Warm Organic Palette (Espresso, Terracotta, Sage Green, Ochre Gold, Royal Indigo, Warm Rose)
const ORGANIC_PALETTE = [
  { bg: '#2C221E', accent: '#E8A87C', border: '#4A3B35' }, // Warm Espresso
  { bg: '#261F24', accent: '#E27D60', border: '#42333D' }, // Terracotta
  { bg: '#1C2621', accent: '#85DCB', border: '#2D3D35' }, // Sage Mint
  { bg: '#2B261D', accent: '#C38D9E', border: '#453C2D' }, // Ochre Gold
  { bg: '#1E222A', accent: '#41B3A3', border: '#303744' }, // Slate Blue
  { bg: '#2A1E24', accent: '#FF6F59', border: '#45303B' }, // Coral Berry
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
          style={{ fontSize: '11px', padding: '4px 10px', color: pageAccent, borderColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Warm Tactile Clay & Paper Cards Grid (No Glass, No Robotic Look) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {presetsList.map((preset, idx) => {
          const theme = ORGANIC_PALETTE[(idx + colorOffset) % ORGANIC_PALETTE.length];
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
                padding: '14px 8px 10px 8px',
                borderRadius: '16px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                transition: 'all 0.15s ease-in-out',
                minHeight: '110px',
              }}
            >
              {/* Tactile Icon Badge */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.accent,
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
                  marginBottom: '6px',
                }}
              >
                <CategoryIconRenderer icon={preset.icon} size={20} color={theme.accent} />
              </div>

              {/* Title & Solid Price Tag */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    lineHeight: '1.2',
                    color: '#F0EAD6',
                    marginBottom: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {preset.title}
                </div>

                {/* Solid Price Pill */}
                <div
                  className="tabular-nums"
                  style={{
                    display: 'block',
                    padding: '3px 6px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${theme.border}`,
                    fontSize: '11px',
                    fontWeight: 800,
                    color: theme.accent,
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
