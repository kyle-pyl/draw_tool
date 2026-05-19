import { useState, useEffect, useCallback } from 'react';
import type { ConflictHighlighter } from '../canvas/conflict';

export interface ConflictPanelProps {
  conflictHighlighter: ConflictHighlighter;
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  width: 360,
  maxHeight: '50vh',
  background: '#fff',
  border: '1px solid #F44336',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 13,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  background: '#F44336',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  flexShrink: 0,
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: 1,
  padding: '0 4px',
  opacity: 0.9,
};

const listStyle: React.CSSProperties = {
  overflowY: 'auto',
  padding: '8px 0',
  flex: 1,
};

const itemStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #eee',
};

const itemHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 4,
};

const layerBadgeStyle: React.CSSProperties = {
  background: '#F44336',
  color: '#fff',
  padding: '1px 8px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
};

const elementStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 12,
  background: '#f5f5f5',
  padding: '1px 6px',
  borderRadius: 3,
};

const suggestionStyle: React.CSSProperties = {
  color: '#666',
  fontSize: 11,
  marginTop: 4,
  fontStyle: 'italic',
};

const footerStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderTop: '1px solid #eee',
  background: '#fffaf0',
  fontSize: 11,
  color: '#888',
  textAlign: 'center',
  flexShrink: 0,
};

export function ConflictPanel({ conflictHighlighter }: ConflictPanelProps) {
  const [conflicts, setConflicts] = useState(conflictHighlighter.getConflicts());
  const [dismissed, setDismissed] = useState(false);

  const update = useCallback(() => {
    setConflicts([...conflictHighlighter.getConflicts()]);
    if (conflictHighlighter.hasConflicts) {
      setDismissed(false);
    }
  }, [conflictHighlighter]);

  useEffect(() => {
    const unsubscribe = conflictHighlighter.subscribe(update);
    return unsubscribe;
  }, [conflictHighlighter, update]);

  if (!conflictHighlighter.hasConflicts || dismissed) {
    return null;
  }

  return (
    <div style={panelStyle} className="conflict-panel">
      <div style={headerStyle}>
        <span>Layer Conflict ({conflicts.length})</span>
        <button
          style={closeBtnStyle}
          onClick={() => setDismissed(true)}
          aria-label="Close conflict panel"
        >
          ×
        </button>
      </div>
      <div style={listStyle}>
        {conflicts.map((conflict) => (
          <div key={conflict.id} style={itemStyle}>
            <div style={itemHeaderStyle}>
              <span style={layerBadgeStyle}>{conflict.layerName}</span>
              <span style={elementStyle}>{conflict.elementAName}</span>
              <span style={{ color: '#F44336', fontWeight: 600 }}>&#x2194;</span>
              <span style={elementStyle}>{conflict.elementBName}</span>
            </div>
            <div style={suggestionStyle}>{conflict.suggestion}</div>
          </div>
        ))}
      </div>
      <div style={footerStyle}>
        Move elements to different layers or positions to resolve conflicts. Highlights auto-dismiss when resolved.
      </div>
    </div>
  );
}
