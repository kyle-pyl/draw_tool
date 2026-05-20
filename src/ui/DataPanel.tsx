import { useState, useCallback, useMemo } from 'react';
import type { DataSource, ChartType } from '../core/types';
import type { ParsedData, ColumnInfo } from '../io/csv-parser';

export interface ChartConfig {
  dataSourceId: string;
  chartType: ChartType;
  columnMappings: {
    x?: string;
    y?: string;
    group?: string;
    color?: string;
  };
}

export interface DataPanelProps {
  dataSources: DataSource[];
  parsedData: ParsedData | null;
  loading: boolean;
  parseError: string | null;
  onSelectDataSource: (dataSourceId: string) => void;
  onGenerateChart: (config: ChartConfig) => void;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'boxplot', label: 'Boxplot' },
  { value: 'histogram', label: 'Histogram' },
  { value: 'heatmap', label: 'Heatmap' },
];

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  left: 52,
  width: 300,
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

const scrollStyle: React.CSSProperties = {
  overflowY: 'auto',
  flex: 1,
  padding: '8px 12px',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 0',
  cursor: 'pointer',
  userSelect: 'none',
  fontWeight: 600,
  fontSize: 11,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #eee',
  marginBottom: 4,
  marginTop: 4,
};

const sourceItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 8px',
  cursor: 'pointer',
  borderRadius: 4,
  border: '1px solid transparent',
  fontSize: 11,
};

const sourceItemActiveStyle: React.CSSProperties = {
  background: '#E3F2FD',
  borderColor: '#90CAF9',
};

const sourceItemHoverStyle: React.CSSProperties = {
  background: '#f5f5f5',
};

const colTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 11,
  marginBottom: 8,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '3px 6px',
  borderBottom: '1px solid #ddd',
  color: '#666',
  fontWeight: 600,
  fontSize: 10,
};

const tdStyle: React.CSSProperties = {
  padding: '3px 6px',
  borderBottom: '1px solid #f0f0f0',
};

const typeBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 3,
  fontSize: 9,
  fontWeight: 600,
  textTransform: 'uppercase',
};

const TYPE_COLORS: Record<string, string> = {
  number: '#1565C0',
  string: '#2E7D32',
  date: '#E65100',
  boolean: '#6A1B9A',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 11,
  background: '#fff',
  marginBottom: 4,
};

const rowStyle: React.CSSProperties = {
  marginBottom: 6,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#666',
  fontSize: 10,
  marginBottom: 2,
};

const generateBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 12px',
  background: '#1976D2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  marginTop: 4,
};

const generateBtnDisabledStyle: React.CSSProperties = {
  ...generateBtnStyle,
  background: '#BDBDBD',
  cursor: 'not-allowed',
};

const sampleCountStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#888',
  marginBottom: 4,
};

type Section = 'datasources' | 'columns' | 'chart';

export function DataPanel({
  dataSources,
  parsedData,
  loading,
  parseError,
  onSelectDataSource,
  onGenerateChart,
}: DataPanelProps) {
  const [selectedDsId, setSelectedDsId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<Section>>(new Set(['chart']));
  const [dismissed, setDismissed] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [colMapX, setColMapX] = useState('');
  const [colMapY, setColMapY] = useState('');
  const [colMapGroup, setColMapGroup] = useState('');
  const [colMapColor, setColMapColor] = useState('');

  const toggleSection = useCallback((section: Section) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleSelectDs = useCallback(
    (id: string) => {
      setSelectedDsId(id);
      onSelectDataSource(id);
      setColMapX('');
      setColMapY('');
      setColMapGroup('');
      setColMapColor('');
      // Expand columns section
      setCollapsed((prev) => {
        const next = new Set(prev);
        next.delete('columns');
        next.delete('chart');
        return next;
      });
    },
    [onSelectDataSource],
  );

  const columns = useMemo<ColumnInfo[]>(() => parsedData?.columns ?? [], [parsedData]);
  const sampleRows = useMemo(() => parsedData?.rows.slice(0, 5) ?? [], [parsedData]);

  const canGenerate = selectedDsId && chartType && colMapY;

  const handleGenerate = useCallback(() => {
    if (!canGenerate || !selectedDsId) return;
    onGenerateChart({
      dataSourceId: selectedDsId,
      chartType,
      columnMappings: {
        x: colMapX || undefined,
        y: colMapY || undefined,
        group: colMapGroup || undefined,
        color: colMapColor || undefined,
      },
    });
  }, [canGenerate, selectedDsId, chartType, colMapX, colMapY, colMapGroup, colMapColor, onGenerateChart]);

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
          Show Data
        </button>
      </div>
    );
  }

  return (
    <div style={panelStyle} className="data-panel">
      <div style={headerStyle}>
        <span>Data Panel</span>
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
          aria-label="Close data panel"
        >
          ×
        </button>
      </div>

      <div style={scrollStyle}>
        {/* Data Sources */}
        <div>
          <div style={sectionHeaderStyle} onClick={() => toggleSection('datasources')}>
            <span>Data Sources</span>
            <span style={{ fontSize: 10 }}>
              {dataSources.length > 0 && `(${dataSources.length})`}{' '}
              {collapsed.has('datasources') ? '+' : '-'}
            </span>
          </div>
          {!collapsed.has('datasources') && (
            <div>
              {dataSources.length === 0 && (
                <div style={{ padding: 8, color: '#888', fontSize: 11, textAlign: 'center' }}>
                  No data sources available
                </div>
              )}
              {dataSources.map((ds) => (
                <div
                  key={ds.id}
                  style={{
                    ...sourceItemStyle,
                    ...(selectedDsId === ds.id ? sourceItemActiveStyle : {}),
                  }}
                  onClick={() => handleSelectDs(ds.id)}
                  onMouseEnter={(e) => {
                    if (selectedDsId !== ds.id) {
                      (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDsId !== ds.id) {
                      (e.currentTarget as HTMLElement).style.background = '';
                    }
                  }}
                >
                  <span style={{ fontSize: 14 }}>&#128196;</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ds.path}
                    </div>
                    <div style={{ fontSize: 9, color: '#888' }}>
                      {ds.type.toUpperCase()} · {ds.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column Info */}
        {selectedDsId && (
          <div>
            <div style={sectionHeaderStyle} onClick={() => toggleSection('columns')}>
              <span>Column Info</span>
              <span style={{ fontSize: 10 }}>
                {loading ? 'Loading...' : collapsed.has('columns') ? '+' : '-'}
              </span>
            </div>
            {!collapsed.has('columns') && (
              <div>
                {loading && (
                  <div style={{ padding: 8, color: '#888', fontSize: 11, textAlign: 'center' }}>
                    Loading data...
                  </div>
                )}
                {parseError && (
                  <div style={{ padding: 8, color: '#d32f2f', fontSize: 11, background: '#ffebee', borderRadius: 4 }}>
                    {parseError}
                  </div>
                )}
                {!loading && !parseError && columns.length > 0 && (
                  <>
                    <table style={colTableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Column</th>
                          <th style={thStyle}>Type</th>
                          <th style={thStyle}>Missing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columns.map((col) => (
                          <tr key={col.name}>
                            <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{col.name}</td>
                            <td style={tdStyle}>
                              <span
                                style={{
                                  ...typeBadgeStyle,
                                  color: '#fff',
                                  background: TYPE_COLORS[col.inferredType] || '#888',
                                }}
                              >
                                {col.inferredType}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              {col.missingRate > 0 ? (
                                <span style={{ color: col.missingRate > 0.3 ? '#d32f2f' : '#888' }}>
                                  {(col.missingRate * 100).toFixed(0)}%
                                </span>
                              ) : (
                                <span style={{ color: '#4caf50' }}>0%</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Sample values */}
                    {sampleRows.length > 0 && (
                      <div>
                        <div style={sampleCountStyle}>
                          Showing {sampleRows.length} of {parsedData?.rowCount ?? 0} rows
                        </div>
                        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                          <table style={{ ...colTableStyle, fontSize: 10 }}>
                            <thead>
                              <tr>
                                {columns.map((col) => (
                                  <th key={col.name} style={{ ...thStyle, whiteSpace: 'nowrap' }}>
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sampleRows.map((row, i) => (
                                <tr key={i}>
                                  {columns.map((col) => (
                                    <td
                                      key={col.name}
                                      style={{ ...tdStyle, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                      {row[col.name] === null ? (
                                        <span style={{ color: '#ccc' }}>—</span>
                                      ) : (
                                        String(row[col.name])
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {!loading && !parseError && columns.length === 0 && (
                  <div style={{ padding: 8, color: '#888', fontSize: 11, textAlign: 'center' }}>
                    No columns parsed
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chart Configuration */}
        {selectedDsId && parsedData && columns.length > 0 && (
          <div>
            <div style={sectionHeaderStyle} onClick={() => toggleSection('chart')}>
              <span>Chart Config</span>
              <span style={{ fontSize: 10 }}>{collapsed.has('chart') ? '+' : '-'}</span>
            </div>
            {!collapsed.has('chart') && (
              <div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Chart Type</span>
                  <select
                    style={selectStyle}
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                  >
                    {CHART_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={rowStyle}>
                  <span style={labelStyle}>X Axis (Category)</span>
                  <select
                    style={selectStyle}
                    value={colMapX}
                    onChange={(e) => setColMapX(e.target.value)}
                  >
                    <option value="">— Auto —</option>
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.inferredType})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={rowStyle}>
                  <span style={labelStyle}>Y Axis (Value)</span>
                  <select
                    style={selectStyle}
                    value={colMapY}
                    onChange={(e) => setColMapY(e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.inferredType})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={rowStyle}>
                  <span style={labelStyle}>Group / Series</span>
                  <select
                    style={selectStyle}
                    value={colMapGroup}
                    onChange={(e) => setColMapGroup(e.target.value)}
                  >
                    <option value="">— None —</option>
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.inferredType})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={rowStyle}>
                  <span style={labelStyle}>Color</span>
                  <select
                    style={selectStyle}
                    value={colMapColor}
                    onChange={(e) => setColMapColor(e.target.value)}
                  >
                    <option value="">— None —</option>
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.inferredType})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  style={canGenerate ? generateBtnStyle : generateBtnDisabledStyle}
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                >
                  Generate Chart
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
