import React, { useState } from 'react';
import { PlannerPreset, ReminderCategory } from '../types';
import { hexToRgba } from '../context/ThemeContext';
import { triggerHaptic } from '../services/soundService';
import {
  Zap,
  Plus,
  Check,
  X,
  Move,
  Trash2,
  Dumbbell,
  Receipt,
  Users,
  BookOpen,
  Heart,
  ShoppingBag,
  Briefcase,
  Droplets,
  ShoppingCart,
  Bell,
  Sparkles,
  ShieldCheck,
  Clock,
  Flag,
} from 'lucide-react';

interface PlannerPresetGridProps {
  presetsList: PlannerPreset[];
  onSelectPreset: (preset: PlannerPreset) => void;
  onAddPreset: () => void;
  onDeletePreset: (presetId: string) => void;
  onReorderPresets: (newPresets: PlannerPreset[]) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  dumbbell: Dumbbell,
  receipt: Receipt,
  users: Users,
  'book-open': BookOpen,
  heart: Heart,
  'shopping-bag': ShoppingBag,
  briefcase: Briefcase,
  droplets: Droplets,
  'shopping-cart': ShoppingCart,
  bell: Bell,
  sparkles: Sparkles,
  shield: ShieldCheck,
  clock: Clock,
  flag: Flag,
};

const renderIcon = (iconName: string, size = 15, color = 'var(--text-primary)') => {
  const IconComponent = ICON_MAP[iconName.toLowerCase()] || Bell;
  return <IconComponent size={size} color={color} />;
};

const LEVEL_COLORS: Record<string, string> = {
  URGENT: '#EC668C',
  FLAGGED: '#F3A85B',
  SIMPLE: '#4A99E9',
};

export const PlannerPresetGrid: React.FC<PlannerPresetGridProps> = ({
  presetsList,
  onSelectPreset,
  onAddPreset,
  onDeletePreset,
  onReorderPresets,
}) => {
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    triggerHaptic(10);
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
    triggerHaptic(12);
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
    onReorderPresets(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleMoveItem = (fromIdx: number, direction: 'LEFT' | 'RIGHT') => {
    triggerHaptic(10);
    const toIdx = direction === 'LEFT' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= presetsList.length) return;

    const updated = [...presetsList];
    const [movedItem] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, movedItem);
    onReorderPresets(updated);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Single-Word Clean Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={15} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.1px', color: 'var(--text-primary)' }}>Presets</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="glass-pill"
            onClick={() => {
              triggerHaptic(12);
              setIsReordering(!isReordering);
            }}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              color: isReordering ? '#EF4444' : 'var(--text-secondary)',
              borderColor: isReordering ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-glass)',
              backgroundColor: isReordering ? 'rgba(239, 68, 68, 0.15)' : 'var(--pill-bg)',
            }}
          >
            {isReordering ? <X size={12} /> : <Trash2 size={12} />}
            <span>{isReordering ? 'Done' : 'Delete'}</span>
          </button>

          <button
            type="button"
            className="glass-pill"
            onClick={() => {
              triggerHaptic(12);
              setIsReordering(!isReordering);
            }}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              color: isReordering ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: isReordering ? 'var(--accent)' : 'var(--border-glass)',
              backgroundColor: isReordering ? 'rgba(99, 102, 241, 0.12)' : 'var(--pill-bg)',
            }}
          >
            <Move size={12} />
            <span>Move</span>
          </button>

          <button
            type="button"
            className="glass-pill"
            onClick={() => {
              triggerHaptic(12);
              onAddPreset();
            }}
            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--text-secondary)', borderColor: 'var(--border-glass)' }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Reorder Mode Banner */}
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
          }}
        >
          Drag preset cards to relocate positions
        </div>
      )}

      {/* Dynamic Planner Presets Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {presetsList.map((preset, idx) => {
          const badgeColor = preset.color || LEVEL_COLORS[preset.level] || '#4A99E9';
          const isDraggingThis = draggedIdx === idx;
          const isDragOverThis = dragOverIdx === idx;

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
                animationDelay: `${(idx % 4) * 0.07}s`,
                opacity: isDraggingThis ? 0.4 : 1,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isReordering) return;
                  triggerHaptic(12);
                  onSelectPreset(preset);
                }}
                className={isDragOverThis ? 'ios-drag-target' : ''}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '20px',
                  border: isDragOverThis ? '2px dashed var(--accent)' : '1px solid var(--border-glass)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: isReordering ? 'grab' : 'pointer',
                  minHeight: '66px',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={e => {
                  if (!isReordering) e.currentTarget.style.backgroundColor = 'var(--pill-hover)';
                }}
                onMouseLeave={e => {
                  if (!isReordering) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '10px',
                      backgroundColor: hexToRgba(badgeColor, 0.15),
                      border: `1px solid ${hexToRgba(badgeColor, 0.25)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: badgeColor,
                    }}
                  >
                    {renderIcon(preset.icon, 15, badgeColor)}
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '5px',
                      backgroundColor: hexToRgba(badgeColor, 0.15),
                      color: badgeColor,
                    }}
                  >
                    {preset.level}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    marginTop: '6px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {preset.title.split(' ')[0]}
                </span>
              </button>

              {/* Apple-Style Delete Badge */}
              {isReordering && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    triggerHaptic(15);
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

              {/* Mobile Quick Move Left/Right Controls */}
              {isReordering && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
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
