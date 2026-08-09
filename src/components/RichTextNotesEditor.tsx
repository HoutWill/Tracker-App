import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, Type, List, CheckSquare, RotateCcw } from 'lucide-react';

interface RichTextNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  activeVoiceField?: boolean;
}

const COLOR_PALETTE = [
  { label: 'Default', hex: 'inherit', bg: 'var(--text-primary)' },
  { label: 'Red', hex: '#ED6C6C', bg: '#ED6C6C' },
  { label: 'Green', hex: '#30D158', bg: '#30D158' },
  { label: 'Blue', hex: '#4A99E9', bg: '#4A99E9' },
  { label: 'Orange', hex: '#F3A85B', bg: '#F3A85B' },
  { label: 'Purple', hex: '#A78BFA', bg: '#A78BFA' },
];

export const RichTextNotesEditor: React.FC<RichTextNotesEditorProps> = ({
  value,
  onChange,
  placeholder = 'Details',
  rows = 3,
  activeVoiceField = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isInternalChange = useRef<boolean>(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
  });

  const checkActiveFormats = () => {
    try {
      if (typeof document !== 'undefined') {
        setActiveFormats({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          strikeThrough: document.queryCommandState('strikeThrough'),
          unorderedList: document.queryCommandState('insertUnorderedList'),
        });
      }
    } catch (e) {}
  };

  // Save selection before clicking toolbar items
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
    checkActiveFormats();
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

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
      checkActiveFormats();
    }
  };

  const execCmd = (command: string, valueArg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      document.execCommand(command, false, valueArg);
      saveSelection();
      handleInput();
      checkActiveFormats();
    }
  };

  const applyColor = (hex: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      if (hex === 'inherit') {
        document.execCommand('removeFormat', false);
      } else {
        document.execCommand('foreColor', false, hex);
      }
      saveSelection();
      handleInput();
      checkActiveFormats();
    }
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
      {/* 100% Solid & Reliable Formatting Toolbar with Active Indicators */}
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
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('bold'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: activeFormats.bold ? '1px solid rgba(74, 153, 233, 0.4)' : '1px solid transparent',
            backgroundColor: activeFormats.bold ? 'rgba(74, 153, 233, 0.22)' : 'transparent',
            color: activeFormats.bold ? '#4A99E9' : 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Bold"
        >
          <Bold size={14} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('italic'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: activeFormats.italic ? '1px solid rgba(74, 153, 233, 0.4)' : '1px solid transparent',
            backgroundColor: activeFormats.italic ? 'rgba(74, 153, 233, 0.22)' : 'transparent',
            color: activeFormats.italic ? '#4A99E9' : 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Italic"
        >
          <Italic size={14} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('underline'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: activeFormats.underline ? '1px solid rgba(74, 153, 233, 0.4)' : '1px solid transparent',
            backgroundColor: activeFormats.underline ? 'rgba(74, 153, 233, 0.22)' : 'transparent',
            color: activeFormats.underline ? '#4A99E9' : 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Underline"
        >
          <Underline size={14} />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('strikeThrough'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: activeFormats.strikeThrough ? '1px solid rgba(74, 153, 233, 0.4)' : '1px solid transparent',
            backgroundColor: activeFormats.strikeThrough ? 'rgba(74, 153, 233, 0.22)' : 'transparent',
            color: activeFormats.strikeThrough ? '#4A99E9' : 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-glass)', margin: '0 2px' }} />

        {/* Heading */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('formatBlock', '<h3>'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: '1px solid transparent',
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

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-glass)', margin: '0 2px' }} />

        {/* Direct 1-Tap Inline Color Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {COLOR_PALETTE.map(c => (
            <button
              key={c.label}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                saveSelection();
                applyColor(c.hex);
              }}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: c.bg,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.1s ease',
              }}
              title={`Color: ${c.label}`}
            />
          ))}
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-glass)', margin: '0 2px' }} />

        {/* Bullet List */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('insertUnorderedList'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: activeFormats.unorderedList ? '1px solid rgba(74, 153, 233, 0.4)' : '1px solid transparent',
            backgroundColor: activeFormats.unorderedList ? 'rgba(74, 153, 233, 0.22)' : 'transparent',
            color: activeFormats.unorderedList ? '#4A99E9' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Bullet List"
        >
          <List size={14} />
        </button>

        {/* Checkbox Box */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('insertHTML', '☑ '); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          title="Checklist Box"
        >
          <CheckSquare size={14} />
        </button>

        {/* Clear Format */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('removeFormat'); }}
          style={{
            padding: '5px 7px',
            borderRadius: '6px',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          title="Clear Formatting"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Visual ContentEditable Area */}
      <div style={{ position: 'relative', width: '100%', minHeight: `${Math.max(rows * 24, 130)}px` }}>
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
          onBlur={() => { saveSelection(); handleInput(); }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          style={{
            width: '100%',
            minHeight: `${Math.max(rows * 24, 130)}px`,
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
