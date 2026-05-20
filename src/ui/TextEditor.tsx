import { useState, useCallback, useEffect, useRef } from 'react';
import type { TextElement, ElementStyle } from '../core/types';
import type { Viewport } from '../canvas/viewport';

export interface TextEditorProps {
  element: TextElement;
  viewport: Viewport;
  onCommit: (elementId: string, changes: {
    text: string;
    style?: Partial<ElementStyle>;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }) => void;
  onCancel: () => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Impact',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export function TextEditor({ element, viewport, onCommit, onCancel }: TextEditorProps) {
  const [text, setText] = useState(element.text);
  const [fontFamily, setFontFamily] = useState(element.style.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(element.style.fontSize || 16);
  const [fontWeight, setFontWeight] = useState(element.style.fontWeight === 'bold');
  const [fontStyle, setFontStyle] = useState(element.style.fontStyle === 'italic');
  const [textColor, setTextColor] = useState(element.style.fill || '#000000');
  const [bgColor, setBgColor] = useState(element.backgroundColor || 'transparent');
  const [borderColor, setBorderColor] = useState(element.borderColor || 'transparent');
  const [borderWidth, setBorderWidth] = useState(element.borderWidth || 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const screenToCanvas = useCallback(
    (sx: number, sy: number) => viewport.screenToCanvas(sx, sy),
    [viewport],
  );
  const canvasToScreen = useCallback(
    (cx: number, cy: number) => viewport.canvasToScreen(cx, cy),
    [viewport],
  );

  const { x, y, width, height } = element.transform;
  const screenPos = canvasToScreen(x, y);
  const screenW = viewport.zoom * width;
  const screenH = viewport.zoom * Math.max(height || fontSize * 1.4, fontSize * 1.4);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleCommit = useCallback(() => {
    const changes: {
      text: string;
      style?: Partial<ElementStyle>;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    } = { text };

    const hasStyleChanges =
      fontFamily !== (element.style.fontFamily || 'Arial') ||
      fontSize !== (element.style.fontSize || 16) ||
      (fontWeight ? 'bold' : 'normal') !== (element.style.fontWeight || 'normal') ||
      (fontStyle ? 'italic' : 'normal') !== (element.style.fontStyle || 'normal') ||
      textColor !== (element.style.fill || '#000000');

    if (hasStyleChanges) {
      changes.style = {
        fontFamily,
        fontSize,
        fontWeight: fontWeight ? 'bold' : 'normal',
        fontStyle: fontStyle ? 'italic' : 'normal',
        fill: textColor,
      };
    }

    if (bgColor !== (element.backgroundColor || 'transparent')) {
      changes.backgroundColor = bgColor;
    }
    if (borderColor !== (element.borderColor || 'transparent')) {
      changes.borderColor = borderColor;
    }
    if (borderWidth !== (element.borderWidth || 0)) {
      changes.borderWidth = borderWidth;
    }

    onCommit(element.id, changes);
  }, [element, text, fontFamily, fontSize, fontWeight, fontStyle, textColor, bgColor, borderColor, borderWidth, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleCommit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [handleCommit, onCancel],
  );

  const toggleBold = useCallback(() => setFontWeight((w) => !w), []);
  const toggleItalic = useCallback(() => setFontStyle((i) => !i), []);

  return (
    <div
      className="text-editor-overlay"
      style={{
        position: 'fixed',
        left: screenPos.x,
        top: screenPos.y - 36,
        zIndex: 200,
        background: '#fff',
        borderRadius: 4,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: Math.max(screenW, 200),
      }}
    >
      <div
        className="text-editor-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          padding: '4px 6px',
          borderBottom: '1px solid #e0e0e0',
          background: '#fafafa',
          borderRadius: '4px 4px 0 0',
          alignItems: 'center',
        }}
      >
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={{
            fontSize: 12,
            padding: '2px 4px',
            border: '1px solid #ccc',
            borderRadius: 3,
            maxWidth: 110,
          }}
          title="Font Family"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={{
            fontSize: 12,
            padding: '2px 4px',
            border: '1px solid #ccc',
            borderRadius: 3,
            width: 52,
          }}
          title="Font Size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div style={{ width: 1, height: 20, background: '#ccc', margin: '0 2px' }} />
        <button
          onClick={toggleBold}
          title="Bold"
          style={{
            fontWeight: 'bold',
            width: 26,
            height: 24,
            border: 'none',
            borderRadius: 3,
            background: fontWeight ? '#d0e4ff' : 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            color: fontWeight ? '#1565c0' : '#555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          title="Italic"
          style={{
            fontStyle: 'italic',
            width: 26,
            height: 24,
            border: 'none',
            borderRadius: 3,
            background: fontStyle ? '#d0e4ff' : 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            color: fontStyle ? '#1565c0' : '#555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          I
        </button>
        <div style={{ width: 1, height: 20, background: '#ccc', margin: '0 2px' }} />
        <label title="Text Color" style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              background: textColor,
              border: '1px solid #ccc',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            A
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
              }}
            />
          </div>
        </label>
        <label title="Background Color" style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              background: bgColor === 'transparent' ? '#fff' : bgColor,
              border: '1px solid #ccc',
              cursor: 'pointer',
              position: 'relative',
              backgroundImage: bgColor === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
              backgroundSize: '6px 6px',
              backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0',
            }}
          >
            <input
              type="color"
              value={bgColor === 'transparent' ? '#ffffff' : bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
              }}
            />
          </div>
        </label>
        <label title="Border Color" style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              border: '2px solid ' + (borderColor === 'transparent' ? '#ccc' : borderColor),
              background: 'transparent',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <input
              type="color"
              value={borderColor === 'transparent' ? '#000000' : borderColor}
              onChange={(e) => {
                setBorderColor(e.target.value);
                if (borderWidth === 0) setBorderWidth(1);
              }}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
              }}
            />
          </div>
        </label>
        <select
          value={borderWidth}
          onChange={(e) => {
            const v = Number(e.target.value);
            setBorderWidth(v);
            if (v > 0 && borderColor === 'transparent') setBorderColor('#000000');
          }}
          style={{
            fontSize: 12,
            padding: '2px 4px',
            border: '1px solid #ccc',
            borderRadius: 3,
            width: 42,
          }}
          title="Border Width"
        >
          <option value={0}>0</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleCommit}
        style={{
          width: '100%',
          minWidth: Math.max(screenW, 200),
          minHeight: Math.max(screenH, 44),
          padding: '4px 6px',
          border: 'none',
          outline: 'none',
          resize: 'both',
          fontSize: fontSize,
          fontFamily: fontFamily,
          fontWeight: fontWeight ? 'bold' : 'normal',
          fontStyle: fontStyle ? 'italic' : 'normal',
          color: textColor,
          backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
          borderRadius: '0 0 4px 4px',
          lineHeight: 1.4,
          boxSizing: 'border-box',
        }}
        placeholder="Type text here..."
      />
    </div>
  );
}
