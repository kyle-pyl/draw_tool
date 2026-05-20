import { useCallback } from 'react';
import type { DrawingToolType } from '../canvas';

export type { DrawingToolType } from '../canvas';

export interface ShapeToolbarProps {
  activeTool: DrawingToolType;
  onToolChange: (tool: DrawingToolType) => void;
}

const TOOL_ITEMS: { type: DrawingToolType; label: string }[] = [
  { type: 'select', label: 'Select' },
  { type: 'rect', label: 'Rectangle' },
  { type: 'circle', label: 'Circle' },
  { type: 'ellipse', label: 'Ellipse' },
  { type: 'line', label: 'Line' },
  { type: 'polygon', label: 'Polygon' },
  { type: 'text', label: 'Text' },
  { type: 'connector', label: 'Connector' },
];

function ToolIcon({ type }: { type: DrawingToolType }) {
  const size = 20;
  const pad = 4;

  switch (type) {
    case 'select':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d="M4 2 L2 18 L7 12 L11 16 L13 14 L9 10 L16 8 Z" fill="currentColor" />
        </svg>
      );
    case 'rect':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} fill="none" stroke="currentColor" strokeWidth={1.5} />
        </svg>
      );
    case 'circle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={(size - pad * 2) / 2} fill="none" stroke="currentColor" strokeWidth={1.5} />
        </svg>
      );
    case 'ellipse':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <ellipse cx={size / 2} cy={size / 2} rx={size / 2 - pad} ry={size / 2 - pad - 2} fill="none" stroke="currentColor" strokeWidth={1.5} />
        </svg>
      );
    case 'line':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line x1={pad} y1={size - pad} x2={size - pad} y2={pad} stroke="currentColor" strokeWidth={1.5} />
        </svg>
      );
    case 'polygon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${size / 2},${pad} ${size - pad},${size - pad - 2} ${pad},${size - pad - 2}`} fill="none" stroke="currentColor" strokeWidth={1.5} />
        </svg>
      );
    case 'text':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill="currentColor">T</text>
        </svg>
      );
    case 'connector':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={pad + 2} cy={size - pad - 2} r={3} fill="currentColor" />
          <circle cx={size - pad - 2} cy={pad + 2} r={3} fill="currentColor" />
          <line x1={pad + 2} y1={size - pad - 2} x2={size - pad - 2} y2={pad + 2} stroke="currentColor" strokeWidth={1.5} />
        </svg>
      );
  }
}

export function ShapeToolbar({ activeTool, onToolChange }: ShapeToolbarProps) {
  const handleClick = useCallback(
    (tool: DrawingToolType) => {
      onToolChange(tool);
    },
    [onToolChange],
  );

  return (
    <div
      className="shape-toolbar"
      style={{
        position: 'fixed',
        left: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        background: '#fff',
        borderRadius: 6,
        padding: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {TOOL_ITEMS.map((item) => {
        const isActive = activeTool === item.type;
        return (
          <button
            key={item.type}
            title={item.label}
            onClick={() => handleClick(item.type)}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 4,
              background: isActive ? '#e3f2fd' : 'transparent',
              color: isActive ? '#1565c0' : '#555',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }
            }}
          >
            <ToolIcon type={item.type} />
          </button>
        );
      })}
    </div>
  );
}
