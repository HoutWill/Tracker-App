import React, { useState } from 'react';
import { useTheme, HOLIDAY_THEMES, COLOR_PACKS, COLOR_PALETTE_OPTIONS, PageColors } from '../context/ThemeContext';
import { X, Sparkles, Palette, Check, RotateCcw, Sun, Moon } from 'lucide-react';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({ isOpen, onClose }) => {
  const {
    isDark,
    toggleTheme,
    activeThemeId,
    setHolidayTheme,
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

  const [activeSection, setActiveSection] = useState<'COLOR' | 'PRESET'>('COLOR');

  if (!isOpen) return null;

  const pageNames: { key: keyof PageColors; label: string }[] = [
    { key: 'EXPENSES', label: 'Expenses Page' },
    { key: 'SAVING', label: 'Saving Page' },
  ];

  const handleSetAllPresetsToWhite = () => {
    for (let i = 0; i < 9; i++) {
      setPresetColorItem(i, '#FFFFFF');
    }
  };

  const handleApplyMonochrome = () => {
    setColorPack('MINIMAL_WHITE');
    setPageColor('EXPENSES', '#FFFFFF');
    setPageColor('SAVING', '#FFFFFF');
    handleSetAllPresetsToWhite();
  };

  return (
    <div className="modal-sheet-overlay" onClick={onClose}>
      <div className="modal-sheet-content" onClick={e => e.stopPropagation()}>
        {/* iOS Drag Handle */}
        <div className="modal-sheet-handle" />
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Appearance & Theme
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Colors & Preset Customizer</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mode Switcher Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '8px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Moon size={13} style={{ color: '#FCD34D' }} /> : <Sun size={13} style={{ color: '#F59E0B' }} />}
              <span>{isDark ? 'Dark' : 'Light'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Segmented Nav Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--pill-bg)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-glass)',
          }}
        >
          {[
            { id: 'COLOR', label: 'Accents & Colors' },
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
                border: activeSection === tab.id ? '1px solid var(--border-glass)' : 'none',
                backgroundColor: activeSection === tab.id ? 'var(--pill-hover)' : 'transparent',
                color: activeSection === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: activeSection === tab.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section 2: Color Packs & Custom Page Color Overrides */}
        {activeSection === 'COLOR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick 1-Tap Black & White Preset Button */}
            <button
              type="button"
              onClick={handleApplyMonochrome}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: activePackId === 'MINIMAL_WHITE' ? '1.5px solid var(--text-primary)' : '1px solid var(--border-glass)',
                backgroundColor: 'var(--pill-bg)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #64748B',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>Black & White (Monochrome)</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pure minimal dark/light theme for all accents & presets</div>
                </div>
              </div>
              {activePackId === 'MINIMAL_WHITE' && <Check size={16} style={{ color: 'var(--text-primary)' }} />}
            </button>
            {/* Presets / Color Packs */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Curated Color Packs
              </div>
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
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-glass)',
                        backgroundColor: isSelected ? 'var(--pill-hover)' : 'var(--pill-bg)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{pack.name}</span>
                        {isSelected && <Check size={14} style={{ color: 'var(--text-primary)' }} />}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: pack.expensesColor,
                            border: pack.expensesColor === '#FFFFFF' ? '1px solid #CBD5E1' : 'none',
                          }}
                          title="Expenses Color"
                        />
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: pack.savingColor,
                            border: pack.savingColor === '#FFFFFF' ? '1px solid #CBD5E1' : 'none',
                          }}
                          title="Saving Color"
                        />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>
                          {pack.description.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Page Custom Accents */}
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Individual Page Accent Customizer
              </div>

              {pageNames.map(({ key, label }) => {
                const currentColor = pageColors[key] || '#11B5C6';

                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
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
                        <span className="tabular-nums" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
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
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: opt.hex,
                              border: isMatch ? '2px solid var(--text-primary)' : '1px solid rgba(150, 150, 150, 0.2)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.1s ease',
                              transform: isMatch ? 'scale(1.15)' : 'scale(1)',
                            }}
                            title={`${opt.name} (${opt.hex})`}
                          >
                            {isMatch && (
                              <Check
                                size={12}
                                style={{ color: opt.hex === '#FFFFFF' || opt.hex === '#E2E8F0' ? '#000' : '#FFF' }}
                              />
                            )}
                          </button>
                        );
                      })}

                      {/* Native Color Input */}
                      <label
                        style={{
                          position: 'relative',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: currentColor,
                          border: '1px dashed var(--border-glass)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Pick Custom Color"
                      >
                        <input
                          type="color"
                          value={currentColor}
                          onChange={e => setPageColor(key, e.target.value)}
                          style={{
                            opacity: 0,
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ fontSize: '10px', color: currentColor === '#FFFFFF' ? '#000' : '#FFF' }}>+</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Full Range Custom Preset Color Customizer */}
        {activeSection === 'PRESET' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--pill-bg)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Preset Tile Spectrum (9 Tiles)
                  </h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Customize quick transaction color tags</p>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {/* Clean Monochrome B&W Button */}
                  <button
                    type="button"
                    onClick={handleApplyMonochrome}
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--pill-bg)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    title="Set All Accents & Presets to Black & White"
                  >
                    Black & White
                  </button>

                  {/* Reset Palette Button */}
                  <button
                    type="button"
                    onClick={resetPresetPaletteToDefault}
                    style={{
                      fontSize: '10px',
                      fontWeight: 500,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                    title="Reset to Rainbow Palette"
                  >
                    Default
                  </button>

                  {/* Randomize Palette Button */}
                  <button
                    type="button"
                    onClick={randomizePresetPalette}
                    style={{
                      fontSize: '10px',
                      fontWeight: 500,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      cursor: 'pointer',
                    }}
                    title="Generate Random Color Spectrum"
                  >
                    <Sparkles size={11} />
                    <span>Random</span>
                  </button>
                </div>
              </div>

              {/* Preset Slot Swatches Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {presetPalette.slice(0, 9).map((hexColor, idx) => (
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
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: hexColor,
                        border: '1px solid var(--border-glass)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s ease',
                      }}
                      title={`Preset Tile #${idx + 1} (${hexColor}) - Click to change`}
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
                    <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>Tile #{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={resetDefaultColors}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--pill-bg)',
              color: 'var(--accent-danger)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '9px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-main)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
