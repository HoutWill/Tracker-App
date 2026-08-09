import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, Type, Palette, List, CheckSquare } from 'lucide-react';

interface RichTextNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  activeVoiceField?: boolean;
}

const COLOR_PALETTE = [
  { label: 'Default', hex: 'inherit' },
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const isInternalChange = useRef<boolean>(false);

  // Sync value from props into contentEditable innerHTML when props change externally
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
    }
  };

  const execCmd = (command: string, valueArg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, valueArg);
      handleInput();
    }
  };

  const applyColor = (hex: string) => {
    execCmd('foreColor', hex);
    setShowColorPicker(false);
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
      {/* Visual Word-Style Toolbar */}
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
          onMouseDown={e => { e.preventDefault(); execCmd('bold'); }}
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
          onMouseDown={e => { e.preventDefault(); execCmd('italic'); }}
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
          onMouseDown={e => { e.preventDefault(); execCmd('underline'); }}
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
          onMouseDown={e => { e.preventDefault(); execCmd('strikeThrough'); }}
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
          onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', '<h3>'); }}
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
                  onMouseDown={e => { e.preventDefault(); applyColor(c.hex); }}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c.hex === 'inherit' ? 'var(--text-primary)' : c.hex,
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
          onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }}
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
          onMouseDown={e => { e.preventDefault(); execCmd('insertHTML', '☑ '); }}
          style={{
            padding: '4px 6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          title="Checklist Box"
        >
          <CheckSquare size={14} />
        </button>
      </div>

      {/* Visual WYSIWYG ContentEditable Area */}
      <div style={{ position: 'relative', width: '100%', minHeight: `${rows * 24}px` }}>
        {(!value || value === '<br>' || value.trim() === '') && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '14px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {activeVoiceField ? 'Listening...' : placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable={true}
          onInput={handleInput}
          onBlur={handleInput}
          style={{
            width: '100%',
            minHeight: `${rows * 24}px`,
            padding: '10px 14px',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: 1.5,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        />
      </div>
    </div>
  );
};

// Helper function to safely render formatted rich text in detail views / list items
export const renderRichFormattedText = (text: string) => {
  if (!text) return null;

  return (
    <div
      className="rich-notes-view"
      dangerouslySetInnerHTML={{ __html: text }}
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
