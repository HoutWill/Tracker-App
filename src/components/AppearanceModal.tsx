import React, { useState } from 'react';
import { useTheme, APP_THEMES, COLOR_PACKS, COLOR_PALETTE_OPTIONS, PageColors } from '../context/ThemeContext';
import { X, Palette, Check, RotateCcw, Sun, Moon, Sparkles, Sliders } from 'lucide-react';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({ isOpen, onClose }) => {
  const {
    isDark,
    toggleTheme,
    activeThemeId,
    setTheme,
    activePackId,
    setColorPack,
    pageColors,
    setPageColor,
    presetPalette,
    setPresetColorItem,
    randomizePresetPalette,
    resetPresetPaletteToDefault,
    resetDefaultColors,
  } = useTheme();

  const [activeSection, setActiveSection] = useState<'THEMES' | 'COLORS' | 'PRESETS'>('THEMES');

  if (!isOpen) return null;

  const pageNames: { key: keyof PageColors; label: string }[] = [
    { key: 'EXPENSES', label: 'Expenses' },
    { key: 'SAVING', label: 'Savings' },
  ];

  return (
    <div className="modal-sheet-overlay" onClick={onClose}>
      <div
        className="modal-sheet-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-glass)',
          borderRadius: '24px 24px 0 0',
        }}
      >
        {/* iOS Drag Handle */}
        <div className="modal-sheet-handle" />

        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
                Appearance
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Customizer
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '10px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isDark ? <Moon size={13} style={{ color: '#F3A85B' }} /> : <Sun size={13} style={{ color: '#4A99E9' }} />}
              <span>{isDark ? 'Dark' : 'Light'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Segmented Navigation Bar (Single-Word Tabs) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--pill-bg)',
            borderRadius: '12px',
            padding: '3px',
            border: '1px solid var(--border-glass)',
            marginBottom: '16px',
            flexShrink: 0,
          }}
        >
          {(['THEMES', 'COLORS', 'PRESETS'] as const).map(tab => {
            const isActive = activeSection === tab;
            const labelMap = {
              THEMES: 'Themes',
              COLORS: 'Colors',
              PRESETS: 'Presets',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSection(tab)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: isActive ? '#4A99E9' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SECTION 1: THEMES SELECTION (iOS 18 Bento Theme Cards) */}
          {activeSection === 'THEMES' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {APP_THEMES.map(theme => {
                  const isSelected = activeThemeId === theme.id;
                  const bgPreview = isDark ? theme.bgMain : theme.bgMainLight;
                  const cardPreview = isDark ? theme.bgCard : theme.bgCardLight;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setTheme(theme.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '18px',
                        border: isSelected ? '1.5px solid #4A99E9' : '1px solid var(--border-glass)',
                        backgroundColor: 'var(--pill-bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {/* Theme Visual Swatch Preview */}
                      <div
                        style={{
                          height: '56px',
                          borderRadius: '12px',
                          backgroundColor: bgPreview,
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        <div
                          style={{
                            height: '24px',
                            borderRadius: '8px',
                            backgroundColor: cardPreview,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 8px',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: theme.accent,
                            }}
                          />
                          <div
                            style={{
                              width: '24px',
                              height: '4px',
                              borderRadius: '2px',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div style={{ width: '12px', height: '4px', borderRadius: '2px', backgroundColor: theme.accent }} />
                          <div style={{ width: '8px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
                        </div>
                      </div>

                      {/* Theme Name & Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {theme.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {theme.description}
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#4A99E9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: COLORS (Curated Pastel Accents & Page Overrides) */}
          {activeSection === 'COLORS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Curated Color Packs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '16px',
                        border: isSelected ? '1.5px solid #4A99E9' : '1px solid var(--border-glass)',
                        backgroundColor: isSelected ? 'var(--pill-hover)' : 'var(--pill-bg)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>{pack.name}</span>
                        {isSelected && <Check size={14} style={{ color: '#4A99E9' }} />}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: pack.expensesColor,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                        />
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: pack.savingColor,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Individual Page Custom Accents */}
              <div
                className="glass-panel"
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--pill-bg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Accents
                </div>

                {pageNames.map(({ key, label }) => {
                  const currentColor = pageColors[key] || '#4A99E9';

                  return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: currentColor,
                              border: '1px solid var(--border-glass)',
                            }}
                          />
                          <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {currentColor.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {COLOR_PALETTE_OPTIONS.map(opt => {
                          const isMatch = currentColor.toLowerCase() === opt.hex.toLowerCase();
                          return (
                            <button
                              key={opt.hex}
                              type="button"
                              onClick={() => setPageColor(key, opt.hex)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: opt.hex,
                                border: isMatch ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.15)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isMatch ? '0 0 0 2px #4A99E9' : 'none',
                                transition: 'transform 0.1s ease',
                              }}
                              title={opt.name}
                            >
                              {isMatch && <Check size={12} color={opt.hex === '#FFFFFF' ? '#000' : '#FFF'} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: PRESETS (9 Custom Slots) */}
          {activeSection === 'PRESETS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                }}
              >
                {presetPalette.map((colorHex, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 6px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--pill-bg)',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <input
                      type="color"
                      value={colorHex}
                      onChange={e => setPresetColorItem(idx, e.target.value)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.2)',
                        padding: 0,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                    />
                    <span className="tabular-nums" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {colorHex.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons: Random & Reset */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={randomizePresetPalette}
                  className="glass-pill"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--pill-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} color="#4A99E9" />
                  <span>Random</span>
                </button>

                <button
                  type="button"
                  onClick={resetPresetPaletteToDefault}
                  className="glass-pill"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--pill-bg)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Reset Button at Bottom */}
        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
          <button
            type="button"
            onClick={resetDefaultColors}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '14px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
