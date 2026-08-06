import React, { useState } from 'react';
import { useTheme, HOLIDAY_THEMES, COLOR_PACKS, COLOR_PALETTE_OPTIONS, PageColors } from '../context/ThemeContext';
import { X, Sparkles, Palette, Check, RotateCcw } from 'lucide-react';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({ isOpen, onClose }) => {
  const {
    activeThemeId,
    setHolidayTheme,
    activePackId,
    setColorPack,
    pageColors,
    setPageColor,
    presetPalette,
    setPresetColorItem,
    randomizePresetPalette,
    resetDefaultColors,
  } = useTheme();

  const [activeSection, setActiveSection] = useState<'THEME' | 'COLOR' | 'PRESET'>('THEME');

  if (!isOpen) return null;

  const pageNames: { key: keyof PageColors; label: string }[] = [
    { key: 'EXPENSES', label: 'Expenses' },
    { key: 'SAVING', label: 'Saving' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
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
          maxWidth: '440px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderColor: 'rgba(46, 170, 220, 0.4)',
        }}
      >
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
              <Palette size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Appearance</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Themes, Colors & Preset Customizer</span>
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

        {/* Unified Segmented Nav Switcher (Themes • Colors • Presets) */}
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
            { id: 'THEME', label: 'Themes' },
            { id: 'COLOR', label: 'Colors' },
            { id: 'PRESET', label: 'Presets' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeSection === tab.id ? 'var(--accent)' : 'transparent',
                color: activeSection === tab.id ? '#FFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: activeSection === tab.id ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section 1: Atmospheric Holiday Themes */}
        {activeSection === 'THEME' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {HOLIDAY_THEMES.map(theme => {
              const isSelected = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setHolidayTheme(theme.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                    backgroundColor: isSelected ? 'rgba(46, 170, 220, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{theme.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>{theme.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{theme.description}</div>
                  </div>
                  {isSelected && <Check size={16} color="var(--accent)" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Section 2: Curated Color Packs */}
        {activeSection === 'COLOR' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {COLOR_PACKS.map(pack => {
              const isSelected = activePackId === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setColorPack(pack.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                    backgroundColor: isSelected ? 'rgba(46, 170, 220, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>{pack.name}</span>
                    {isSelected && <Check size={16} color="var(--accent)" />}
                  </div>

                  <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: pack.expensesColor }} title="Expenses Accent" />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: pack.savingColor }} title="Saving Accent" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Section 3: Full Range Custom Preset Color Customizer */}
        {activeSection === 'PRESET' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Presets Color Spectrum & Randomizer Card */}
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Preset Tiles Spectrum</h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Full color range & randomizer</p>
                </div>

                {/* Randomize Palette Button */}
                <button
                  type="button"
                  className="glass-pill"
                  onClick={randomizePresetPalette}
                  style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--accent)', borderColor: 'rgba(46, 170, 220, 0.4)' }}
                  title="Generate Random Colors Across Spectrum"
                >
                  <Sparkles size={12} /> Random
                </button>
              </div>

              {/* Preset Slot Color Dots with Native Full Color Picker */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {presetPalette.map((hexColor, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        position: 'relative',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: hexColor,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `0 2px 10px ${hexColor}66`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={`Preset ${idx + 1} Color - Click to change`}
                    >
                      <input
                        type="color"
                        value={hexColor}
                        onChange={e => setPresetColorItem(idx, e.target.value)}
                        style={{
                          opacity: 0,
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                        }}
                      />
                    </label>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-secondary)' }}>#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            className="glass-pill"
            onClick={resetDefaultColors}
            style={{ flex: 1, justifyContent: 'center', color: 'var(--accent-danger)', borderColor: 'rgba(255, 82, 82, 0.3)' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
