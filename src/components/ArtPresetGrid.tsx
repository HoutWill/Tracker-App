import React, { useState } from 'react';
import { QuickPreset, CurrencyCode } from '../types';
import { CategoryIconRenderer } from './CategoryIconRenderer';
import { useTheme, hexToRgba, DEFAULT_PRESET_PALETTE } from '../context/ThemeContext';
import { formatCurrency } from '../services/storageService';
import { Plus, Zap, Check, X, Move } from 'lucide-react';

interface ArtPresetGridProps {
  presetsList: QuickPreset[];
  currency: CurrencyCode;
  pageAccent: string;
  onSelectPreset: (preset: QuickPreset) => void;
  onAddPreset: () => void;
  onDeletePreset?: (presetId: string) => void;
  onReorderPresets?: (newPresets: QuickPreset[]) => void;
  colorOffset?: number;
}

export const ArtPresetGrid: React.FC<ArtPresetGridProps> = ({
  presetsList,
  currency,
  pageAccent,
  onSelectPreset,
  onAddPreset,
  onDeletePreset,
  onReorderPresets,
  colorOffset = 0,
}) => {
  const { presetPalette, activePackId } = useTheme();
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const updated = [...presetsList];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIdx(null);
    setDragOverIdx(null);

    if (onReorderPresets) {
      onReorderPresets(updated);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleMoveItem = (fromIdx: number, direction: 'LEFT' | 'RIGHT') => {
    const toIdx = direction === 'LEFT' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= presetsList.length) return;

    const updated = [...presetsList];
    const [movedItem] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, movedItem);

    if (onReorderPresets) {
      onReorderPresets(updated);
    }
  };

  return (
    <div style={{ marginBottom: '18px' }}>
      {/* Single-Word Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={15} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.1px', color: 'var(--text-primary)' }}>Presets</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="glass-pill"
            onClick={() => setIsReordering(!isReordering)}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              color: isReordering ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: isReordering ? 'var(--accent)' : 'var(--border-glass)',
              backgroundColor: isReordering ? 'rgba(99, 102, 241, 0.12)' : 'var(--pill-bg)',
            }}
          >
            {isReordering ? <Check size={12} /> : <Move size={12} />}
            {isReordering ? 'Done' : 'Move'}
          </button>

          <button
            type="button"
            className="glass-pill"
            onClick={onAddPreset}
            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--text-secondary)', borderColor: 'var(--border-glass)' }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Reorder Mode Banner Tip */}
      {isReordering && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            padding: '6px 10px',
            borderRadius: '10px',
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Drag preset cards to relocate positions</span>
        </div>
      )}

      {/* Dynamic Quick Presets Horizontal Slider (Slide Left to Right) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px',
          paddingTop: '2px',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {presetsList.map((preset, idx) => {
          const rawHex = presetPalette[(idx + colorOffset) % presetPalette.length];
          const isMonochrome = activePackId === 'MINIMAL_WHITE' || (presetPalette && presetPalette.every(c => !c || c === '#FFFFFF'));
          const tileHex = isMonochrome ? 'var(--text-primary)' : (rawHex && rawHex !== '#FFFFFF' ? rawHex : DEFAULT_PRESET_PALETTE[(idx + colorOffset) % DEFAULT_PRESET_PALETTE.length]);

          const isDraggingThis = draggedIdx === idx;
          const isDragOverThis = dragOverIdx === idx;
          const categoryTag = preset.categoryId ? preset.categoryId.replace('cat-', '').replace('saving-', '').split('-')[0].toUpperCase() : (preset.type || 'PRESET');

          return (
            <div
              key={preset.id}
              draggable={isReordering}
              onDragStart={e => isReordering && handleDragStart(e, idx)}
              onDragOver={e => isReordering && handleDragOver(e, idx)}
              onDrop={e => isReordering && handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={isReordering ? 'ios-wiggle' : ''}
              style={{
                position: 'relative',
                flex: '0 0 auto',
                width: 'calc(20% - 6.4px)',
                minWidth: '100px',
                scrollSnapAlign: 'start',
                animationDelay: `${(idx % 4) * 0.07}s`,
                opacity: isDraggingThis ? 0.4 : 1,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isReordering) return;
                  onSelectPreset(preset);
                }}
                className={isDragOverThis ? 'ios-drag-target' : ''}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  height: '76px',
                  padding: '12px 14px',
                  borderRadius: '20px',
                  border: isDragOverThis ? '2px dashed var(--accent)' : '1px solid var(--border-glass)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  cursor: isReordering ? 'grab' : 'pointer',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none',
                }}
                onMouseEnter={e => {
                  if (!isReordering) {
                    e.currentTarget.style.backgroundColor = 'var(--pill-bg)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isReordering) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }
                }}
              >
                {/* Centered Top Vector Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CategoryIconRenderer icon={preset.icon} size={24} color={tileHex} />
                </div>

                {/* Centered Single-Word Clean Title */}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {preset.title.split(' ')[0]}
                </span>
              </button>

              {/* Apple-Style Delete Badge in Edit/Reorder Mode */}
              {isReordering && onDeletePreset && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePreset(preset.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    border: '2px solid var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  <X size={11} strokeWidth={3} />
                </button>
              )}

              {/* Mobile Quick Move Left/Right Controls in Edit Mode */}
              {isReordering && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveItem(idx, 'LEFT')}
                      style={{
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        backgroundColor: 'var(--pill-bg)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      ◀
                    </button>
                  )}
                  {idx < presetsList.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveItem(idx, 'RIGHT')}
                      style={{
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        backgroundColor: 'var(--pill-bg)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      ▶
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

