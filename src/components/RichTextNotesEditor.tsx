import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Type, Palette, List, CheckSquare } from 'lucide-react';

interface RichTextNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  activeVoiceField?: boolean;
}

const COLOR_PALETTE = [
  { label: 'Red', hex: '#ED6C6C' },
  { label: 'Green', hex: '#30D158' },
  { label: 'Blue', hex: '#4A99E9' },
  { label: 'Orange', hex: '#F3A85B' },
  { label: 'Purple', hex: '#A78BFA' },
];

export const RichTextNotesEditor: React.FC<RichTextNotesEditorProps> = ({
  value,
  onChange,
  placeholder = 'Details',
  rows = 3,
  activeVoiceField = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Helper to insert prefix & suffix around selected text or current cursor position
  const applyFormat = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = '';
    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}${suffix}`;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      if (selectedText) {
        el.setSelectionRange(start, start + replacement.length);
      } else {
        const cursorPosition = start + prefix.length;
        el.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };

  const applyColor = (hex: string) => {
    applyFormat(`<span style="color:${hex}">`, `</span>`);
    setShowColorPicker(false);
  };

  const insertBullet = () => {
    applyFormat(`\n• `);
  };

  const insertCheckbox = () => {
    applyFormat(`\n[ ] `);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: activeVoiceField ? '1.5px solid #EC668C' : '1px solid var(--border-glass)',
        backgroundColor: 'var(--pill-bg)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Word-Style Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          borderBottom: '1px solid var(--border-glass)',
          backgroundColor: 'var(--bg-card)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Bold */}
        <button
          type="button"
          onClick={() => applyFormat('<b>', '</b>')}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title="Bold"
        >
          <Bold size={14} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => applyFormat('<i>', '</i>')}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title="Italic"
        >
          <Italic size={14} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => applyFormat('<u>', '</u>')}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title="Underline"
        >
          <Underline size={14} />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => applyFormat('<s>', '</s>')}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-glass)', margin: '0 2px' }} />

        {/* Larger Text / Heading */}
        <button
          type="button"
          onClick={() => applyFormat('<h3 style="margin:4px 0;font-size:16px;font-weight:800;">', '</h3>')}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: 900,
            cursor: 'pointer',
          }}
          title="Header / Big Text"
        >
          <Type size={14} />
        </button>

        {/* Color Palette Toggle Button */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: showColorPicker ? 'var(--pill-hover)' : 'transparent',
              color: '#4A99E9',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
            title="Text Color"
          >
            <Palette size={14} />
          </button>

          {/* Popover Color Swatches */}
          {showColorPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                padding: '6px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex',
                gap: '6px',
                zIndex: 50,
              }}
            >
              {COLOR_PALETTE.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => applyColor(c.hex)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-glass)', margin: '0 2px' }} />

        {/* Bullet List */}
        <button
          type="button"
          onClick={insertBullet}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          title="Bullet List"
        >
          <List size={14} />
        </button>

        {/* Checkbox List */}
        <button
          type="button"
          onClick={insertCheckbox}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          title="Checklist Item"
        >
          <CheckSquare size={14} />
        </button>
      </div>

      {/* Main Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={activeVoiceField ? 'Listening...' : placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '13px',
          lineHeight: 1.5,
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
};

// Helper function to safely render formatted rich text in detail views / list items
export const renderRichFormattedText = (text: string) => {
  if (!text) return null;

  const formattedHtml = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>');

  return (
    <div
      className="rich-notes-view"
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
      style={{
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    />
  );
};
