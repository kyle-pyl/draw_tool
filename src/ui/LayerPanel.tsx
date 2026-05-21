import { useState, useCallback, useMemo } from 'react';
import type { SceneDocument, Layer } from '../core/types';
import type { SelectionManager } from '../canvas/selection';
import type { ConflictHighlighter } from '../canvas/conflict';
import {
  CommandExecutor,
  MoveLayersCommand,
  BatchLayerEditCommand,
} from '../core/commands';
import type { BatchLayerOperation } from '../core/commands';
import { useDocumentStore } from '../core/store';

export interface LayerPanelProps {
  scene: SceneDocument;
  selectionManager: SelectionManager;
  conflictHighlighter: ConflictHighlighter;
  executor: CommandExecutor;
  forceUpdate: () => void;
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  left: 16,
  width: 240,
  maxHeight: 'calc(100vh - 32px)',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  zIndex: 900,
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
  padding: '0',
};

const layerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderBottom: '1px solid #f0f0f0',
  gap: 6,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background 0.1s',
};

const layerRowConflictStyle: React.CSSProperties = {
  ...layerRowStyle,
  background: '#FFF0F0',
  borderLeft: '3px solid #F44336',
};

const dragHandleStyle: React.CSSProperties = {
  cursor: 'grab',
  color: '#aaa',
  fontSize: 14,
  lineHeight: 1,
  padding: '0 2px',
  flexShrink: 0,
};

const layerNameStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 12,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
};

const layerNameInputStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 12,
  border: '1px solid #1976D2',
  borderRadius: 3,
  padding: '2px 4px',
  outline: 'none',
  minWidth: 0,
};

const countBadgeStyle: React.CSSProperties = {
  background: '#e0e0e0',
  color: '#555',
  padding: '1px 6px',
  borderRadius: 8,
  fontSize: 10,
  fontWeight: 600,
  flexShrink: 0,
  minWidth: 20,
  textAlign: 'center',
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: '2px 3px',
  borderRadius: 3,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const menuBtnStyle: React.CSSProperties = {
  ...iconBtnStyle,
  fontSize: 16,
  fontWeight: 700,
  color: '#888',
};

const batchMenuStyle: React.CSSProperties = {
  position: 'absolute',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: 6,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 1100,
  padding: '4px 0',
  minWidth: 180,
  fontSize: 12,
};

const batchMenuItemStyle: React.CSSProperties = {
  padding: '6px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: '#333',
};

const batchMenuDangerStyle: React.CSSProperties = {
  ...batchMenuItemStyle,
  color: '#F44336',
};

const batchMenuSeparatorStyle: React.CSSProperties = {
  height: 1,
  background: '#eee',
  margin: '4px 0',
};

const footerStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderTop: '1px solid #eee',
  fontSize: 11,
  color: '#999',
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const addBtnStyle: React.CSSProperties = {
  background: '#1976D2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '3px 10px',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 500,
};

const inlineInputStyle: React.CSSProperties = {
  width: 60,
  padding: '2px 4px',
  border: '1px solid #ccc',
  borderRadius: 3,
  fontSize: 11,
  margin: '2px 12px',
};

const colorSwatchStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 3,
  border: '1px solid #ccc',
  cursor: 'pointer',
  flexShrink: 0,
};

const SELECT_ALL = 'Select All Elements';
const SET_FILL = 'Set Fill Color';
const SET_STROKE = 'Set Stroke Color';
const SET_OPACITY = 'Set Opacity';
const TOGGLE_VISIBILITY = 'Toggle Visibility';
const COPY_TO = 'Copy to Layer';
const MOVE_TO = 'Move to Layer';
const DELETE_ALL = 'Delete All';

const batchOpLabels: Record<string, string> = {
  [SELECT_ALL]: 'Select All Elements',
  [SET_FILL]: 'Set Fill Color...',
  [SET_STROKE]: 'Set Stroke Color...',
  [SET_OPACITY]: 'Set Opacity...',
  [TOGGLE_VISIBILITY]: 'Toggle Visibility',
  [COPY_TO]: 'Copy to Layer...',
  [MOVE_TO]: 'Move to Layer...',
  [DELETE_ALL]: 'Delete All Elements',
};

export function LayerPanel({
  scene,
  selectionManager,
  conflictHighlighter,
  executor,
  forceUpdate,
}: LayerPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragLayerId, setDragLayerId] = useState<string | null>(null);
  const [menuState, setMenuState] = useState<{
    layerId: string;
    x: number;
    y: number;
  } | null>(null);
  const [subAction, setSubAction] = useState<{
    layerId: string;
    action: string;
  } | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const sortedLayers = useMemo(() => {
    return [...scene.layers].sort((a, b) => b.order - a.order);
  }, [scene.layers]);

  const conflictingLayerIds = conflictHighlighter.conflictingLayerIds;

  const getElementCount = useCallback(
    (layerId: string) => {
      return scene.elements.filter((el) => el.layerId === layerId).length;
    },
    [scene.elements],
  );

  const handleSelectLayer = useCallback(
    (layerId: string) => {
      const ids = scene.elements
        .filter((el) => el.layerId === layerId && el.visible && !el.locked)
        .map((el) => el.id);
      selectionManager.selectByIds(ids);
      forceUpdate();
    },
    [scene, selectionManager, forceUpdate],
  );

  const handleToggleVisibility = useCallback(
    (layer: Layer) => {
      useDocumentStore.getState().updateScene((s) => ({
        ...s,
        layers: s.layers.map((l) =>
          l.id === layer.id ? { ...l, visible: !l.visible } : l,
        ),
      }));
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleToggleLock = useCallback(
    (layer: Layer) => {
      useDocumentStore.getState().updateScene((s) => ({
        ...s,
        layers: s.layers.map((l) =>
          l.id === layer.id ? { ...l, locked: !l.locked } : l,
        ),
      }));
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleDragStart = useCallback((e: React.DragEvent, layerId: string) => {
    setDragLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layerId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetLayerId: string) => {
      e.preventDefault();
      if (!dragLayerId || dragLayerId === targetLayerId) {
        setDragLayerId(null);
        return;
      }

      const sorted = [...scene.layers].sort((a, b) => a.order - b.order);
      const srcIdx = sorted.findIndex((l) => l.id === dragLayerId);
      const tgtIdx = sorted.findIndex((l) => l.id === targetLayerId);

      if (srcIdx === -1 || tgtIdx === -1) {
        setDragLayerId(null);
        return;
      }

      const direction = tgtIdx > srcIdx ? 'up' : 'down';
      const steps = Math.abs(tgtIdx - srcIdx);

      const cmd = new MoveLayersCommand([dragLayerId], direction, steps);
      const result = executor.execute(cmd);
      if (!result.valid) {
        console.warn('Layer move failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
      setDragLayerId(null);
    },
    [dragLayerId, scene.layers, executor, forceUpdate],
  );

  const handleDragEnd = useCallback(() => {
    setDragLayerId(null);
  }, []);

  const handleMenuOpen = useCallback(
    (e: React.MouseEvent, layerId: string) => {
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuState({ layerId, x: rect.left - 180, y: rect.bottom });
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setMenuState(null);
    setSubAction(null);
  }, []);

  const handleBatchAction = useCallback(
    (layerId: string, action: string) => {
      if (action === SELECT_ALL) {
        handleSelectLayer(layerId);
        setMenuState(null);
        return;
      }

      if (action === SET_FILL || action === SET_STROKE || action === SET_OPACITY) {
        setSubAction({ layerId, action });
        return;
      }

      if (action === TOGGLE_VISIBILITY) {
        const allVisible = scene.elements
          .filter((el) => el.layerId === layerId)
          .every((el) => el.visible);
        const op: BatchLayerOperation = allVisible ? 'hideAll' : 'showAll';
        const cmd = new BatchLayerEditCommand(layerId, op);
        executor.execute(cmd);
        forceUpdate();
        setMenuState(null);
        return;
      }

      if (action === DELETE_ALL) {
        const cmd = new BatchLayerEditCommand(layerId, 'deleteAll');
        executor.execute(cmd);
        forceUpdate();
        setMenuState(null);
        return;
      }

      if (action === COPY_TO || action === MOVE_TO) {
        setSubAction({ layerId, action });
        return;
      }

      setMenuState(null);
    },
    [scene, selectionManager, executor, forceUpdate, handleSelectLayer],
  );

  const handleSubAction = useCallback(
    (layerId: string, action: string, targetLayerId?: string, value?: string | number) => {
      if (action === SET_FILL) {
        const cmd = new BatchLayerEditCommand(layerId, 'setFill', String(value ?? '#000000'));
        executor.execute(cmd);
      } else if (action === SET_STROKE) {
        const cmd = new BatchLayerEditCommand(layerId, 'setStroke', String(value ?? '#000000'));
        executor.execute(cmd);
      } else if (action === SET_OPACITY) {
        const cmd = new BatchLayerEditCommand(layerId, 'setOpacity', Number(value ?? 1));
        executor.execute(cmd);
      } else if ((action === COPY_TO || action === MOVE_TO) && targetLayerId) {
        const op: BatchLayerOperation = action === COPY_TO ? 'copyAll' : 'moveAll';
        const cmd = new BatchLayerEditCommand(layerId, op, undefined, targetLayerId);
        const result = executor.execute(cmd);
        if (!result.valid) {
          console.warn('Batch operation failed:', result.errors.map((e) => e.message).join('\n'));
        }
      }
      forceUpdate();
      setSubAction(null);
      setMenuState(null);
    },
    [executor, forceUpdate],
  );

  const handleAddLayer = useCallback(() => {
    const maxOrder = scene.layers.reduce((max, l) => Math.max(max, l.order), 0);
    const newOrder = maxOrder + 1;
    const count = scene.layers.filter((l) => l.name?.startsWith('Layer ')).length;
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${count + 1}`,
      order: newOrder,
      visible: true,
      locked: false,
    };
    useDocumentStore.getState().updateScene((s) => ({
      ...s,
      layers: [...s.layers, newLayer],
    }));
    forceUpdate();
  }, [scene.layers, forceUpdate]);

  const handleStartRename = useCallback((layerId: string, name: string) => {
    setEditingName(layerId);
    setEditValue(name);
  }, []);

  const handleCommitRename = useCallback(
    (layerId: string) => {
      const trimmed = editValue.trim();
      if (trimmed) {
        useDocumentStore.getState().updateScene((s) => ({
          ...s,
          layers: s.layers.map((l) =>
            l.id === layerId ? { ...l, name: trimmed } : l,
          ),
        }));
        forceUpdate();
      }
      setEditingName(null);
    },
    [editValue, forceUpdate],
  );

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent, layerId: string) => {
      if (e.key === 'Enter') {
        handleCommitRename(layerId);
      } else if (e.key === 'Escape') {
        setEditingName(null);
      }
    },
    [handleCommitRename],
  );

  if (collapsed) {
    return (
      <div style={{ ...panelStyle, width: 'auto', height: 'auto' }}>
        <button
          onClick={() => setCollapsed(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976D2',
            cursor: 'pointer',
            fontSize: 12,
            padding: '8px 12px',
          }}
        >
          Layers ({scene.layers.length})
        </button>
      </div>
    );
  }

  const finalMenuStyle = menuState
    ? { ...batchMenuStyle, left: menuState.x, top: menuState.y }
    : batchMenuStyle;

  return (
    <div style={panelStyle} className="layer-panel">
      <div style={headerStyle}>
        <span>Layers</span>
        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '0 2px',
          }}
          aria-label="Collapse layer panel"
        >
          -
        </button>
      </div>

      <div style={scrollStyle}>
        {sortedLayers.map((layer) => {
          const isConflict = conflictingLayerIds.has(layer.id);
          const count = getElementCount(layer.id);
          const isDragging = dragLayerId === layer.id;
          const allHidden = count > 0 && scene.elements
            .filter((el) => el.layerId === layer.id)
            .every((el) => !el.visible);

          return (
            <div
              key={layer.id}
              style={{
                ...(isConflict ? layerRowConflictStyle : layerRowStyle),
                opacity: isDragging ? 0.4 : 1,
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, layer.id)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') {
                  return;
                }
                handleSelectLayer(layer.id);
              }}
            >
              <span
                style={dragHandleStyle}
                title="Drag to reorder"
              >
                &#x2630;
              </span>

              {editingName === layer.id ? (
                <input
                  style={layerNameInputStyle}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleCommitRename(layer.id)}
                  onKeyDown={(e) => handleRenameKeyDown(e, layer.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  style={layerNameStyle}
                  onDoubleClick={() => handleStartRename(layer.id, layer.name || layer.id)}
                  title="Double-click to rename"
                >
                  {layer.name || layer.id}
                </span>
              )}

              <span style={countBadgeStyle}>{count}</span>

              <button
                style={{
                  ...iconBtnStyle,
                  color: layer.visible ? (allHidden ? '#FFB300' : '#4CAF50') : '#ccc',
                }}
                onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer); }}
                title={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                {layer.visible ? '\u{1F441}' : '\u{1F441}\u{200D}\u{1F5E8}'}
              </button>

              <button
                style={{
                  ...iconBtnStyle,
                  color: layer.locked ? '#F44336' : '#bbb',
                }}
                onClick={(e) => { e.stopPropagation(); handleToggleLock(layer); }}
                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
              >
                {layer.locked ? '\u{1F512}' : '\u{1F513}'}
              </button>

              <button
                style={menuBtnStyle}
                onClick={(e) => handleMenuOpen(e, layer.id)}
                title="Batch operations"
              >
                &#x22EF;
              </button>

              {menuState && menuState.layerId === layer.id && !subAction && (
                <div style={finalMenuStyle}>
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, SELECT_ALL)}
                  >
                    Select All Elements
                  </div>
                  <div style={batchMenuSeparatorStyle} />
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, SET_FILL)}
                  >
                    Set Fill Color...
                  </div>
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, SET_STROKE)}
                  >
                    Set Stroke Color...
                  </div>
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, SET_OPACITY)}
                  >
                    Set Opacity...
                  </div>
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, TOGGLE_VISIBILITY)}
                  >
                    {allHidden ? 'Show All' : 'Hide All'}
                  </div>
                  <div style={batchMenuSeparatorStyle} />
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, COPY_TO)}
                  >
                    Copy to Layer...
                  </div>
                  <div
                    style={batchMenuItemStyle}
                    onClick={() => handleBatchAction(layer.id, MOVE_TO)}
                  >
                    Move to Layer...
                  </div>
                  <div style={batchMenuSeparatorStyle} />
                  <div
                    style={batchMenuDangerStyle}
                    onClick={() => handleBatchAction(layer.id, DELETE_ALL)}
                  >
                    Delete All Elements
                  </div>
                </div>
              )}

              {menuState && menuState.layerId === layer.id && subAction && subAction.layerId === layer.id && (
                <div style={finalMenuStyle}>
                  {subAction.action === SET_FILL && (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Set Fill Color</div>
                      <input
                        type="color"
                        style={{ width: '100%', height: 30, cursor: 'pointer' }}
                        defaultValue="#4CAF50"
                        onBlur={(e) => handleSubAction(layer.id, SET_FILL, undefined, e.target.value)}
                      />
                    </div>
                  )}
                  {subAction.action === SET_STROKE && (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Set Stroke Color</div>
                      <input
                        type="color"
                        style={{ width: '100%', height: 30, cursor: 'pointer' }}
                        defaultValue="#333333"
                        onBlur={(e) => handleSubAction(layer.id, SET_STROKE, undefined, e.target.value)}
                      />
                    </div>
                  )}
                  {subAction.action === SET_OPACITY && (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Set Opacity</div>
                      <input
                        type="range"
                        style={{ width: '100%' }}
                        min={0}
                        max={1}
                        step={0.05}
                        defaultValue={1}
                        onMouseUp={(e) =>
                          handleSubAction(layer.id, SET_OPACITY, undefined, parseFloat((e.target as HTMLInputElement).value))
                        }
                      />
                      <span style={{ fontSize: 10, color: '#888' }}>Drag then release to apply</span>
                    </div>
                  )}
                  {subAction.action === COPY_TO && (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Copy to Layer</div>
                      {scene.layers
                        .filter((l) => l.id !== layer.id)
                        .map((l) => (
                          <div
                            key={l.id}
                            style={batchMenuItemStyle}
                            onClick={() => handleSubAction(layer.id, COPY_TO, l.id)}
                          >
                            {l.name || l.id}
                          </div>
                        ))}
                    </div>
                  )}
                  {subAction.action === MOVE_TO && (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Move to Layer</div>
                      {scene.layers
                        .filter((l) => l.id !== layer.id)
                        .map((l) => (
                          <div
                            key={l.id}
                            style={batchMenuItemStyle}
                            onClick={() => handleSubAction(layer.id, MOVE_TO, l.id)}
                          >
                            {l.name || l.id}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={footerStyle}>
        <span>{scene.layers.length} layer{scene.layers.length !== 1 ? 's' : ''}</span>
        <button style={addBtnStyle} onClick={handleAddLayer}>
          + Add Layer
        </button>
      </div>

      {menuState && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1099,
          }}
          onClick={handleMenuClose}
        />
      )}
    </div>
  );
}
