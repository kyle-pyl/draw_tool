import { useState, useMemo, useCallback } from 'react';
import { getAllTemplates } from '../core/templates';
import type { TemplateDefinition, TemplateElementDef } from '../core/templates';

export interface TemplatePanelProps {
  onTemplateInsert: (templateId: string) => void;
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  left: 52,
  width: 280,
  maxHeight: 'calc(100vh - 32px)',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  zIndex: 800,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 12,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderBottom: '1px solid #eee',
  fontWeight: 600,
  fontSize: 13,
  flexShrink: 0,
};

const searchStyle: React.CSSProperties = {
  margin: '6px 12px',
  padding: '5px 8px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 12,
  outline: 'none',
  flexShrink: 0,
};

const scrollStyle: React.CSSProperties = {
  overflowY: 'auto',
  flex: 1,
  padding: '0 8px 8px',
};

const categoryHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 4px',
  cursor: 'pointer',
  userSelect: 'none',
  fontWeight: 600,
  fontSize: 11,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #eee',
  marginTop: 4,
  marginBottom: 4,
  position: 'sticky',
  top: 0,
  background: '#fff',
  zIndex: 1,
};

const templateGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 6,
  padding: '2px 0',
};

const templateItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: 6,
  border: '1px solid #eee',
  borderRadius: 6,
  cursor: 'pointer',
  background: '#fafafa',
  transition: 'background 0.15s, border-color 0.15s',
};

const templateItemHoverStyle: React.CSSProperties = {
  borderColor: '#90CAF9',
  background: '#E3F2FD',
};

const thumbnailStyle: React.CSSProperties = {
  width: '100%',
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  borderRadius: 3,
  border: '1px solid #eee',
  overflow: 'hidden',
};

const templateNameStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#333',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
};

function TemplateThumbnail({ template }: { template: TemplateDefinition }) {
  const elements = template.elements;

  const viewBox = useMemo(() => {
    if (elements.length === 0) return '0 0 80 60';
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of elements) {
      const { x, y, width, height } = el.transform;
      if (width === 0 && height === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + (width || 0));
      maxY = Math.max(maxY, y + (height || 0));
    }
    if (!isFinite(minX)) return '0 0 80 60';
    const pad = 4;
    const vw = maxX - minX + pad * 2;
    const vh = maxY - minY + pad * 2;
    return `${minX - pad} ${minY - pad} ${Math.max(vw, 1)} ${Math.max(vh, 1)}`;
  }, [elements]);

  return (
    <div style={thumbnailStyle}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {elements.map((el, i) => (
          <ThumbnailElement key={i} element={el} />
        ))}
      </svg>
    </div>
  );
}

function ThumbnailElement({ element }: { element: TemplateElementDef }) {
  const { transform: t, style } = element;

  switch (element.type) {
    case 'shape': {
      const sk = element.shapeKind || 'rect';
      const cr = element.cornerRadius;
      const rx = cr ? cr[0] : 0;
      const ry = cr ? cr[1] : rx;

      switch (sk) {
        case 'rect':
          return (
            <rect
              x={t.x}
              y={t.y}
              width={t.width}
              height={t.height}
              rx={rx}
              ry={ry}
              fill={style.fill || 'none'}
              stroke={style.stroke || '#333'}
              strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
            />
          );
        case 'circle':
          return (
            <circle
              cx={t.x + t.width / 2}
              cy={t.y + t.height / 2}
              r={Math.min(t.width, t.height) / 2}
              fill={style.fill || 'none'}
              stroke={style.stroke || '#333'}
              strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
            />
          );
        case 'ellipse':
          return (
            <ellipse
              cx={t.x + t.width / 2}
              cy={t.y + t.height / 2}
              rx={t.width / 2}
              ry={t.height / 2}
              fill={style.fill || 'none'}
              stroke={style.stroke || '#333'}
              strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
            />
          );
        case 'polygon':
          return (
            <polygon
              points={(element.points || []).map((p) => `${t.x + p.x},${t.y + p.y}`).join(' ')}
              fill={style.fill || 'none'}
              stroke={style.stroke || '#333'}
              strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
            />
          );
        case 'path':
          return (
            <path
              d={element.pathCommands || ''}
              transform={`translate(${t.x},${t.y})`}
              fill={style.fill || 'none'}
              stroke={style.stroke || '#333'}
              strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
            />
          );
      }
      break;
    }
    case 'text':
      return (
        <text
          x={t.x + t.width / 2}
          y={t.y + t.height / 2 + 4}
          textAnchor="middle"
          fontSize={Math.min(t.height * 0.4, 10)}
          fill={style.stroke || '#333'}
          fontFamily={style.fontFamily || 'Arial'}
          fontWeight={style.fontWeight as 'normal' | 'bold' | undefined}
        >
          {element.text || 'T'}
        </text>
      );
    case 'container':
      return (
        <rect
          x={t.x}
          y={t.y}
          width={t.width}
          height={t.height}
          fill={style.fill || 'none'}
          stroke={style.stroke || '#333'}
          strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
          strokeDasharray="6 3"
        />
      );
    case 'rtlModule':
      return (
        <rect
          x={t.x}
          y={t.y}
          width={t.width}
          height={t.height}
          fill={style.fill || '#E3F2FD'}
          stroke={style.stroke || '#1565C0'}
          strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
        />
      );
    case 'image':
      return (
        <rect
          x={t.x}
          y={t.y}
          width={t.width}
          height={t.height}
          fill="#f0f0f0"
          stroke={style.stroke || '#333'}
          strokeWidth={Math.max(style.strokeWidth || 1, 1)}
        >
        </rect>
      );
    case 'mindNode':
      return (
        <ellipse
          cx={t.x + t.width / 2}
          cy={t.y + t.height / 2}
          rx={t.width / 2}
          ry={t.height / 2}
          fill={style.fill || '#FFE082'}
          stroke={style.stroke || '#F57F17'}
          strokeWidth={Math.max(style.strokeWidth || 1, 1.5)}
        />
      );
    default:
      return null;
  }
}

export function TemplatePanel({ onTemplateInsert }: TemplatePanelProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const allTemplates = useMemo(() => getAllTemplates(), []);

  const filteredCategories = useMemo(() => {
    const grouped = new Map<string, TemplateDefinition[]>();
    const query = search.trim().toLowerCase();

    for (const t of allTemplates) {
      if (query && !t.name.toLowerCase().includes(query)) continue;
      const list = grouped.get(t.category) || [];
      list.push({ ...t, name: t.name });
      grouped.set(t.category, list);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allTemplates, search]);

  const toggleCategory = useCallback((category: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  if (dismissed) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 52,
          zIndex: 800,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'default',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: 12,
        }}
      >
        <button
          onClick={() => setDismissed(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976D2',
            cursor: 'pointer',
            fontSize: 12,
            padding: 0,
          }}
        >
          Show Templates
        </button>
      </div>
    );
  }

  return (
    <div style={panelStyle} className="template-panel">
      <div style={headerStyle}>
        <span>Templates</span>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '0 2px',
          }}
          aria-label="Close template panel"
        >
          ×
        </button>
      </div>

      <input
        type="text"
        style={searchStyle}
        placeholder="Search templates..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={scrollStyle}>
        {filteredCategories.length === 0 && (
          <div style={{ padding: 12, color: '#888', textAlign: 'center', fontSize: 11 }}>
            No templates found
          </div>
        )}
        {filteredCategories.map(([category, templates]) => (
          <div key={category}>
            <div
              style={categoryHeaderStyle}
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              <span style={{ fontSize: 10 }}>
                {collapsed.has(category) ? '+' : '-'}
              </span>
            </div>
            {!collapsed.has(category) && (
              <div style={templateGridStyle}>
                {templates.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      ...templateItemStyle,
                      ...(hovered === t.id ? templateItemHoverStyle : {}),
                    }}
                    title={t.name}
                    onClick={() => onTemplateInsert(t.id)}
                    onMouseEnter={() => setHovered(t.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <TemplateThumbnail template={t} />
                    <span style={templateNameStyle}>{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
