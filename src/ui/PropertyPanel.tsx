import { useState, useCallback, useEffect } from 'react';
import type { SceneDocument, SceneElement, TextElement, ConnectorElement, ConnectorLabel } from '../core/types';
import type { SelectionManager } from '../canvas/selection';

export interface PropertyPanelProps {
  scene: SceneDocument;
  selectionManager: SelectionManager;
  onPropertyChange: (elementIds: string[], changes: Record<string, unknown>) => void;
  onLayerChange: (elementIds: string[], targetLayerId: string) => void;
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
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
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '3px 0',
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  color: '#666',
  fontSize: 11,
  minWidth: 60,
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  width: 60,
  padding: '3px 5px',
  border: '1px solid #ccc',
  borderRadius: 3,
  fontSize: 11,
  fontFamily: 'monospace',
};

const colorInputStyle: React.CSSProperties = {
  width: 28,
  height: 24,
  padding: 0,
  border: '1px solid #ccc',
  borderRadius: 3,
  cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: '3px 4px',
  border: '1px solid #ccc',
  borderRadius: 3,
  fontSize: 11,
  fontFamily: 'monospace',
  background: '#fff',
};

const mixedStyle: React.CSSProperties = {
  color: '#999',
  fontStyle: 'italic',
  fontSize: 10,
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '3px 0',
};

const checkboxLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#555',
};

function isMixed<T>(values: T[]): boolean {
  if (values.length <= 1) return false;
  const first = JSON.stringify(values[0]);
  return values.some((v) => JSON.stringify(v) !== first);
}

function getElementName(el: SceneElement): string {
  return el.name || el.id;
}

type Section = 'position' | 'style' | 'text' | 'connector' | 'layer';

export function PropertyPanel({ scene, selectionManager, onPropertyChange, onLayerChange }: PropertyPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<Section>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  const selectedIds = [...selectionManager.selectedIds];
  const selectedElements = selectedIds
    .map((id) => scene.elements.find((el) => el.id === id))
    .filter(Boolean) as SceneElement[];

  const selectedIdKey = selectedIds.join(',');

  // Reset dismissed when selection changes
  useEffect(() => {
    setDismissed(false);
  }, [selectedIdKey]);

  const toggleSection = useCallback((section: Section) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleNumberChange = useCallback(
    (field: string, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      onPropertyChange(selectedIds, { transform: { [field]: num } });
    },
    [selectedIdKey, onPropertyChange],
  );

  const handleStyleChange = useCallback(
    (field: string, value: string | number) => {
      onPropertyChange(selectedIds, { style: { [field]: value } });
    },
    [selectedIdKey, onPropertyChange],
  );

  const formatNum = useCallback((v: number) => {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }, []);

  if (selectedElements.length === 0) {
    return null;
  }

  if (dismissed) {
    return (
      <div style={{ ...panelStyle, width: 'auto', padding: '8px 12px', cursor: 'default' }}>
        <button
          onClick={() => setDismissed(false)}
          style={{ background: 'none', border: 'none', color: '#1976D2', cursor: 'pointer', fontSize: 12 }}
        >
          Show Properties
        </button>
      </div>
    );
  }

  const single = selectedElements.length === 1;
  const els = selectedElements;

  // Position & Size
  const xValues = els.map((el) => el.transform.x);
  const yValues = els.map((el) => el.transform.y);
  const wValues = els.map((el) => el.transform.width);
  const hValues = els.map((el) => el.transform.height);
  const rotValues = els.map((el) => el.transform.rotation);

  // Style
  const fillValues = els.map((el) => el.style.fill);
  const strokeValues = els.map((el) => el.style.stroke);
  const strokeWidthValues = els.map((el) => el.style.strokeWidth);
  const opacityValues = els.map((el) => el.style.opacity);

  // Text-specific
  const allText = els.every((el) => el.type === 'text');
  const fontSizeValues = els.map((el) => el.style.fontSize ?? 16);
  const fontFamilyValues = els.map((el) => el.style.fontFamily ?? 'Arial');
  const fontWeightValues = els.map((el) => el.style.fontWeight ?? 'normal');
  const bgColorValues = allText ? els.map((el) => (el as TextElement).backgroundColor) : [];
  const borderColorValues = allText ? els.map((el) => (el as TextElement).borderColor) : [];
  const borderWidthValues = allText ? els.map((el) => (el as TextElement).borderWidth) : [];

  // Visible / Locked
  const visValues = els.map((el) => el.visible);
  const lockValues = els.map((el) => el.locked);

  const allSameLayer = !isMixed(els.map((el) => el.layerId));

  return (
    <div style={panelStyle} className="property-panel">
      <div style={headerStyle}>
        <span>
          {single ? getElementName(els[0]) : `${els.length} elements selected`}
        </span>
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
          aria-label="Close property panel"
        >
          ×
        </button>
      </div>

      <div style={scrollStyle}>
        {/* Position & Size */}
        <div>
          <div style={sectionHeaderStyle} onClick={() => toggleSection('position')}>
            <span>Position &amp; Size</span>
            <span style={{ fontSize: 10 }}>{collapsed.has('position') ? '+' : '-'}</span>
          </div>
          {!collapsed.has('position') && (
            <div>
              <div style={rowStyle}>
                <span style={labelStyle}>X</span>
                {isMixed(xValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="number"
                    style={inputStyle}
                    value={formatNum(xValues[0])}
                    onChange={(e) => handleNumberChange('x', e.target.value)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Y</span>
                {isMixed(yValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="number"
                    style={inputStyle}
                    value={formatNum(yValues[0])}
                    onChange={(e) => handleNumberChange('y', e.target.value)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Width</span>
                {isMixed(wValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="number"
                    style={inputStyle}
                    value={formatNum(wValues[0])}
                    min={1}
                    onChange={(e) => handleNumberChange('width', e.target.value)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Height</span>
                {isMixed(hValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="number"
                    style={inputStyle}
                    value={formatNum(hValues[0])}
                    min={1}
                    onChange={(e) => handleNumberChange('height', e.target.value)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Rotation</span>
                {isMixed(rotValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="number"
                    style={inputStyle}
                    value={formatNum(rotValues[0])}
                    min={-360}
                    max={360}
                    onChange={(e) => handleNumberChange('rotation', e.target.value)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fill & Stroke */}
        <div>
          <div style={sectionHeaderStyle} onClick={() => toggleSection('style')}>
            <span>Fill &amp; Stroke</span>
            <span style={{ fontSize: 10 }}>{collapsed.has('style') ? '+' : '-'}</span>
          </div>
          {!collapsed.has('style') && (
            <div>
              <div style={rowStyle}>
                <span style={labelStyle}>Fill</span>
                {isMixed(fillValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="color"
                    style={colorInputStyle}
                    value={fillValues[0]}
                    onChange={(e) => handleStyleChange('fill', e.target.value)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Stroke</span>
                {isMixed(strokeValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="color"
                    style={colorInputStyle}
                    value={strokeValues[0]}
                    onChange={(e) => handleStyleChange('stroke', e.target.value)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>S-Width</span>
                {isMixed(strokeWidthValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="number"
                    style={inputStyle}
                    value={formatNum(strokeWidthValues[0])}
                    min={0}
                    step={0.5}
                    onChange={(e) => handleStyleChange('strokeWidth', parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Opacity</span>
                {isMixed(opacityValues) ? (
                  <span style={mixedStyle}>mixed</span>
                ) : (
                  <input
                    type="range"
                    style={{ flex: 1 }}
                    min={0}
                    max={1}
                    step={0.05}
                    value={opacityValues[0]}
                    onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Text Style (only for text elements) */}
        {allText && (
          <div>
            <div style={sectionHeaderStyle} onClick={() => toggleSection('text')}>
              <span>Text Style</span>
              <span style={{ fontSize: 10 }}>{collapsed.has('text') ? '+' : '-'}</span>
            </div>
            {!collapsed.has('text') && (
              <div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Font Size</span>
                  {isMixed(fontSizeValues) ? (
                    <span style={mixedStyle}>mixed</span>
                  ) : (
                    <input
                      type="number"
                      style={inputStyle}
                      value={formatNum(fontSizeValues[0])}
                      min={8}
                      max={200}
                      onChange={(e) => handleStyleChange('fontSize', parseFloat(e.target.value) || 16)}
                    />
                  )}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Font</span>
                  {isMixed(fontFamilyValues) ? (
                    <span style={mixedStyle}>mixed</span>
                  ) : (
                    <select
                      style={selectStyle}
                      value={fontFamilyValues[0]}
                      onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  )}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Weight</span>
                  {isMixed(fontWeightValues) ? (
                    <span style={mixedStyle}>mixed</span>
                  ) : (
                    <select
                      style={selectStyle}
                      value={fontWeightValues[0]}
                      onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  )}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>BG Color</span>
                  {isMixed(bgColorValues) ? (
                    <span style={mixedStyle}>mixed</span>
                  ) : (
                    <input
                      type="color"
                      style={colorInputStyle}
                      value={bgColorValues[0] || '#ffffff'}
                      onChange={(e) =>
                        onPropertyChange(selectedIds, { backgroundColor: e.target.value })
                      }
                    />
                  )}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Border</span>
                  {isMixed(borderColorValues) ? (
                    <span style={mixedStyle}>mixed</span>
                  ) : (
                    <input
                      type="color"
                      style={colorInputStyle}
                      value={borderColorValues[0] || '#000000'}
                      onChange={(e) =>
                        onPropertyChange(selectedIds, { borderColor: e.target.value })
                      }
                    />
                  )}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>B-Width</span>
                  {isMixed(borderWidthValues) ? (
                    <span style={mixedStyle}>mixed</span>
                  ) : (
                    <input
                      type="number"
                      style={inputStyle}
                      value={borderWidthValues[0] !== undefined ? formatNum(borderWidthValues[0]!) : '0'}
                      min={0}
                      step={0.5}
                      onChange={(e) =>
                        onPropertyChange(selectedIds, { borderWidth: parseFloat(e.target.value) || 0 })
                      }
                    />
                  )}
                </div>
              </div>
        )}
        </div>
        )}

        {/* Connector (only for single connector element) */}
        {single && els[0].type === 'connector' && (() => {
          const conn = els[0] as ConnectorElement;
          const arrowTypes: { value: string; label: string }[] = [
            { value: 'none', label: 'None' },
            { value: 'triangle', label: 'Triangle' },
            { value: 'openTriangle', label: 'Open Triangle' },
            { value: 'diamond', label: 'Diamond' },
            { value: 'circle', label: 'Circle' },
          ];

          const handleArrowChange = (endpoint: 'arrowStart' | 'arrowEnd', type: string) => {
            if (type === 'none') {
              onPropertyChange(selectedIds, { [endpoint]: null });
            } else {
              onPropertyChange(selectedIds, { [endpoint]: { type, size: (conn[endpoint] as any)?.size ?? 1 } });
            }
          };

          const handleArrowSizeChange = (endpoint: 'arrowStart' | 'arrowEnd', size: number) => {
            const current = conn[endpoint];
            if (current) {
              onPropertyChange(selectedIds, { [endpoint]: { ...current, size } });
            }
          };

          return (
            <div>
              <div style={sectionHeaderStyle} onClick={() => toggleSection('connector')}>
                <span>Connector</span>
                <span style={{ fontSize: 10 }}>{collapsed.has('connector') ? '+' : '-'}</span>
              </div>
              {!collapsed.has('connector') && (
                <div>
                  <div style={rowStyle}>
                    <span style={labelStyle}>Start Arrow</span>
                    <select
                      style={selectStyle}
                      value={conn.arrowStart?.type ?? 'none'}
                      onChange={(e) => handleArrowChange('arrowStart', e.target.value)}
                    >
                      {arrowTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {conn.arrowStart && conn.arrowStart.type !== 'none' && (
                    <div style={rowStyle}>
                      <span style={labelStyle}>S-Arr Size</span>
                      <input
                        type="number"
                        style={inputStyle}
                        value={formatNum(conn.arrowStart.size ?? 1)}
                        min={0.5}
                        max={5}
                        step={0.5}
                        onChange={(e) => handleArrowSizeChange('arrowStart', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                  )}
                  <div style={rowStyle}>
                    <span style={labelStyle}>End Arrow</span>
                    <select
                      style={selectStyle}
                      value={conn.arrowEnd?.type ?? 'none'}
                      onChange={(e) => handleArrowChange('arrowEnd', e.target.value)}
                    >
                      {arrowTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {conn.arrowEnd && conn.arrowEnd.type !== 'none' && (
                    <div style={rowStyle}>
                      <span style={labelStyle}>E-Arr Size</span>
                      <input
                        type="number"
                        style={inputStyle}
                        value={formatNum(conn.arrowEnd.size ?? 1)}
                        min={0.5}
                        max={5}
                        step={0.5}
                        onChange={(e) => handleArrowSizeChange('arrowEnd', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                  )}
                  <div style={{ ...rowStyle, borderTop: '1px solid #eee', paddingTop: 6, marginTop: 4 }}>
                    <span style={labelStyle}>Labels</span>
                  </div>
                  {(conn.labels ?? []).map((label: ConnectorLabel, i: number) => (
                    <div key={i} style={{ ...rowStyle, marginLeft: 8 }}>
                      <input
                        type="text"
                        style={{ ...inputStyle, flex: 2 }}
                        value={label.text}
                        placeholder="Label text"
                        onChange={(e) => {
                          const newLabels = [...(conn.labels ?? [])];
                          newLabels[i] = { ...newLabels[i], text: e.target.value };
                          onPropertyChange(selectedIds, { labels: newLabels });
                        }}
                      />
                      <input
                        type="number"
                        style={{ ...inputStyle, width: 50, marginLeft: 4 }}
                        value={formatNum(label.position)}
                        min={0}
                        max={1}
                        step={0.1}
                        title="Position (0-1)"
                        onChange={(e) => {
                          const newLabels = [...(conn.labels ?? [])];
                          newLabels[i] = { ...newLabels[i], position: parseFloat(e.target.value) || 0.5 };
                          onPropertyChange(selectedIds, { labels: newLabels });
                        }}
                      />
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#F44336',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '0 4px',
                          marginLeft: 2,
                        }}
                        title="Remove label"
                        onClick={() => {
                          const newLabels = (conn.labels ?? []).filter((_, j) => j !== i);
                          onPropertyChange(selectedIds, { labels: newLabels });
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{ ...rowStyle, marginLeft: 8 }}>
                    <button
                      type="button"
                      style={{
                        background: '#1976D2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                      onClick={() => {
                        const newLabels = [...(conn.labels ?? []), { text: '', position: 0.5, offset: { dx: 0, dy: -10 } }];
                        onPropertyChange(selectedIds, { labels: newLabels });
                      }}
                    >
                      + Add Label
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Layer */}
        <div>
          <div style={sectionHeaderStyle} onClick={() => toggleSection('layer')}>
            <span>Layer</span>
            <span style={{ fontSize: 10 }}>{collapsed.has('layer') ? '+' : '-'}</span>
          </div>
          {!collapsed.has('layer') && (
            <div>
              <div style={rowStyle}>
                <span style={labelStyle}>Current</span>
                {allSameLayer ? (
                  <span style={{ ...labelStyle, fontWeight: 500 }}>
                    {scene.layers.find((l) => l.id === els[0].layerId)?.name || els[0].layerId}
                  </span>
                ) : (
                  <span style={mixedStyle}>different layers</span>
                )}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Move to</span>
                <select
                  style={selectStyle}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value && allSameLayer && e.target.value !== els[0].layerId) {
                      onLayerChange(selectedIds, e.target.value);
                    }
                  }}
                >
                  <option value="" disabled>
                    Select layer...
                  </option>
                  {scene.layers
                    .filter((l) => !allSameLayer || l.id !== els[0].layerId)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Visibility & Lock */}
        <div>
          <div style={sectionHeaderStyle}>
            <span>Visibility &amp; Lock</span>
          </div>
          <div style={toggleRowStyle}>
            <input
              type="checkbox"
              id="prop-visible"
              checked={isMixed(visValues) ? false : visValues[0]}
              onChange={(e) =>
                onPropertyChange(selectedIds, { visible: e.target.checked })
              }
              ref={(el) => {
                if (el && isMixed(visValues)) {
                  el.indeterminate = true;
                }
              }}
            />
            <label htmlFor="prop-visible" style={checkboxLabelStyle}>
              Visible
            </label>
          </div>
          <div style={toggleRowStyle}>
            <input
              type="checkbox"
              id="prop-locked"
              checked={isMixed(lockValues) ? false : lockValues[0]}
              onChange={(e) =>
                onPropertyChange(selectedIds, { locked: e.target.checked })
              }
              ref={(el) => {
                if (el && isMixed(lockValues)) {
                  el.indeterminate = true;
                }
              }}
            />
            <label htmlFor="prop-locked" style={checkboxLabelStyle}>
              Locked
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
