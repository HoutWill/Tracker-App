import React from 'react';
import { QuickPreset, CurrencyCode } from '../types';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { getPresetColor, hexToRgba } from '../context/ThemeContext';
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
          style={{ fontSize: '11px', padding: '4px 10px', color: pageAccent, borderColor: hexToRgba(pageAccent, 0.4) }}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {/* 3D Neo-Glass Art Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {presetsList.map((preset, idx) => {
          const tileColor = getPresetColor(idx + colorOffset);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 10px 10px 10px',
                borderRadius: '16px',
                border: `1px solid ${hexToRgba(tileColor, 0.35)}`,
                backgroundColor: hexToRgba(tileColor, 0.09),
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                textAlign: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: `0 6px 20px ${hexToRgba(tileColor, 0.18)}`,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                minHeight: '110px',
              }}
            >
              {/* Futuristic Glowing Top Light Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: tileColor,
                  boxShadow: `0 0 10px ${tileColor}`,
                }}
              />

              {/* Holographic Subtle Glass Gloss Reflection */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Glowing Icon Sphere */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: `1px solid ${hexToRgba(tileColor, 0.5)}`,
                  backgroundColor: hexToRgba(tileColor, 0.22),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tileColor,
                  boxShadow: `0 0 16px ${hexToRgba(tileColor, 0.3)}`,
                  marginBottom: '6px',
                }}
              >
                <CategoryIconRenderer icon={preset.icon} size={20} color={tileColor} />
              </div>

              {/* Title & Floating Price Pill */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    lineHeight: '1.2',
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {preset.title}
                </div>

                {/* Price Pill Tag */}
                <div
                  className="tabular-nums"
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    backgroundColor: hexToRgba(tileColor, 0.2),
                    border: `1px solid ${hexToRgba(tileColor, 0.4)}`,
                    fontSize: '11px',
                    fontWeight: 900,
                    color: tileColor,
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
