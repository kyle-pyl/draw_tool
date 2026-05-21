import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { CanvasView, Viewport, SelectionManager, ConflictHighlighter } from './canvas';
import type { DrawingToolType, CanvasContextMenuEvent } from './canvas';
import { ShapeToolbar, ConflictPanel, TextEditor, ImageImportButton, PropertyPanel, LayerPanel, PwaPrompt, useKeyboardShortcuts, ContextMenu } from './ui';
import type { MenuItem, ContextMenuState } from './ui';
import { createGeometryAdapter } from './core/geometry';
import { checkLayerCollisions } from './core/collision';
import { useDocumentStore } from './core/store';
import {
  CommandExecutor,
  CreateElementCommand,
  UpdateElementCommand,
  ChangeLayerCommand,
  DeleteElementCommand,
  GroupElementsCommand,
  AlignElementsCommand,
  DistributeElementsCommand,
} from './core/commands';
import type { ElementInput, ElementChanges } from './core/commands';
import type { ElementStyle } from './core/types';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument, TextElement } from './core/types';
import { isSupportedImageFile, importImageFromFile } from './io/image-utils';
import {
  getClipboard,
  setClipboard,
  hasClipboard,
  elementToClipboardInput,
  computePastePosition,
} from './core/clipboard';

function findActiveLayerId(scene: SceneDocument): string {
  const visibleUnlocked = [...scene.layers]
    .filter((l) => l.visible && !l.locked)
    .sort((a, b) => b.order - a.order);
  return visibleUnlocked[0]?.id ?? scene.layers[0]?.id ?? '';
}

function App() {
  const scene = useMemo(() => exampleScene as SceneDocument, []);
  const [viewport] = useState(() => new Viewport());
  const [selectionManager] = useState(() => new SelectionManager());
  const [conflictHighlighter] = useState(() => new ConflictHighlighter());
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((n) => n + 1), []);
  const executorRef = useRef(new CommandExecutor());

  const [activeTool, setActiveTool] = useState<DrawingToolType>('select');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  useEffect(() => {
    useDocumentStore.getState().loadScene(scene);
  }, [scene]);

  const storeScene = useDocumentStore((s) => s.scene);
  const currentScene = storeScene ?? scene;

  const drawingLayerId = useMemo(
    () => findActiveLayerId(currentScene),
    [currentScene],
  );

  const editingElement = useMemo(() => {
    if (!editingTextId) return null;
    const el = currentScene.elements.find((e) => e.id === editingTextId);
    if (el && el.type === 'text') return el as TextElement;
    return null;
  }, [editingTextId, currentScene]);

  const handleDrawComplete = useCallback(
    (input: ElementInput) => {
      const cmd = new CreateElementCommand(input);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        const errs = result.errors.map((e) => e.message).join('\n');
        console.warn('Draw failed:', errs);
        forceUpdate();
        return;
      }
      forceUpdate();

      if (input.type === 'text') {
        setEditingTextId(cmd.getElementId());
      }
    },
    [forceUpdate],
  );

  const handleTextEditRequest = useCallback((elementId: string) => {
    setActiveTool('select');
    selectionManager.select(elementId);
    setEditingTextId(elementId);
    forceUpdate();
  }, [selectionManager, forceUpdate]);

  const handleTextCommit = useCallback(
    (elementId: string, changes: {
      text: string;
      style?: Partial<ElementStyle>;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }) => {
      const cmd = new UpdateElementCommand(elementId, changes);
      executorRef.current.execute(cmd);
      setEditingTextId(null);
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleTextCancel = useCallback(() => {
    setEditingTextId(null);
    forceUpdate();
  }, [forceUpdate]);

  const handleConnectorRouteChange = useCallback(
    (connectorId: string, routePoints: { x: number; y: number }[]) => {
      const scene = useDocumentStore.getState().getScene();
      if (!scene) return;

      const conn = scene.elements.find((e) => e.type === 'connector' && e.id === connectorId);
      if (conn && conn.type === 'connector') {
        const updated = {
          ...conn,
          route: { ...conn.route, points: routePoints },
        };
        const replaceCmd = {
          id: `bend-${Date.now()}`,
          label: 'Move bend point',
          validate: () => ({ valid: true, errors: [] }),
          execute: (s: SceneDocument) => ({
            ...s,
            elements: s.elements.map((e) => (e.id === connectorId ? updated : e)),
          }),
          invert: () => null,
        };
        executorRef.current.execute(replaceCmd);
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageImport = useCallback(
    (input: ElementInput) => {
      const cmd = new CreateElementCommand(input);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        const errs = result.errors.map((e) => e.message).join('\n');
        console.warn('Image import failed:', errs);
        forceUpdate();
        return;
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX <= rect.left || clientX >= rect.right || clientY <= rect.top || clientY >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!isSupportedImageFile(file)) continue;
        try {
          const input = await importImageFromFile(file, drawingLayerId);
          const cmd = new CreateElementCommand(input);
          executorRef.current.execute(cmd);
        } catch (err) {
          console.warn('Drag-drop image import failed:', err);
        }
      }
      forceUpdate();
    },
    [drawingLayerId, forceUpdate],
  );

  const handleToolChange = useCallback((tool: DrawingToolType) => {
    setActiveTool(tool);
    setEditingTextId(null);
    selectionManager.clearSelection();
    forceUpdate();
  }, [selectionManager, forceUpdate]);

  const handlePropertyChange = useCallback(
    (elementIds: string[], changes: Record<string, unknown>) => {
      for (const elementId of elementIds) {
        const cmd = new UpdateElementCommand(elementId, changes as ElementChanges);
        const result = executorRef.current.execute(cmd);
        if (!result.valid) {
          console.warn('Property change failed:', result.errors.map((e) => e.message).join('\n'));
        }
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleLayerChange = useCallback(
    (elementIds: string[], targetLayerId: string) => {
      const cmd = new ChangeLayerCommand(elementIds, targetLayerId);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Layer change failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const checkConflicts = useCallback(() => {
    const adapter = createGeometryAdapter();
    const conflictsByLayer = new Map<string, typeof currentScene.elements>();
    for (const el of currentScene.elements) {
      const list = conflictsByLayer.get(el.layerId);
      if (list) {
        list.push(el);
      } else {
        conflictsByLayer.set(el.layerId, [el]);
      }
    }
    const allCollisions = [];
    for (const [, elements] of conflictsByLayer) {
      const result = checkLayerCollisions(elements, adapter, {
        skipHidden: !currentScene.rules.hiddenElementsCollide,
      });
      allCollisions.push(...result.collisions);
    }
    conflictHighlighter.setCollisions(allCollisions, currentScene.elements, currentScene.layers);
  }, [currentScene, conflictHighlighter]);

  useEffect(() => {
    checkConflicts();
  }, [checkConflicts]);

  useKeyboardShortcuts({
    executorRef,
    selectionManager,
    forceUpdate,
    activeLayerId: drawingLayerId,
  });

  const [contextMenuState, setContextMenuState] = useState<ContextMenuState | null>(null);

  const handleCanvasContextMenu = useCallback(
    (event: CanvasContextMenuEvent) => {
      const scene = useDocumentStore.getState().getScene();
      if (!scene) return;

      const selectedIds = selectionManager.selectedIds;
      const clickedElement = event.elementId;
      const selectedCount = selectedIds.size;

      const items: MenuItem[] = [];

      if (!clickedElement) {
        // Canvas context menu
        items.push(
          { label: 'Select All', action: () => { selectionManager.selectAll(scene); forceUpdate(); } },
          {
            label: 'Paste',
            action: () => handlePaste(),
            disabled: !hasClipboard(),
            shortcut: 'Ctrl+V',
          },
          { separator: true },
          {
            label: 'Fit to Canvas',
            action: () => handleFitToCanvas(),
          },
          { separator: true },
          { label: 'Zoom In', action: () => { viewport.zoomIn(); forceUpdate(); }, shortcut: 'Ctrl+=' },
          { label: 'Zoom Out', action: () => { viewport.zoomOut(); forceUpdate(); }, shortcut: 'Ctrl+-' },
          { label: 'Reset Zoom', action: () => { viewport.reset(); forceUpdate(); }, shortcut: 'Ctrl+0' },
        );
      } else {
        const effectiveSelectedIds = selectedIds.size > 0
          ? [...selectedIds]
          : [clickedElement];

        const isSingle = effectiveSelectedIds.length === 1;
        const isMulti = effectiveSelectedIds.length > 1;

        items.push(
          {
            label: 'Copy',
            action: () => handleCopy(effectiveSelectedIds),
            shortcut: 'Ctrl+C',
          },
          {
            label: 'Cut',
            action: () => handleCut(effectiveSelectedIds),
            shortcut: 'Ctrl+X',
          },
          {
            label: 'Delete',
            action: () => handleDelete(effectiveSelectedIds),
            shortcut: 'Del',
          },
          { separator: true },
        );

        // Change Layer submenu
        const visibleLayers = scene.layers
          .filter((l) => l.visible && !l.locked)
          .sort((a, b) => b.order - a.order);

        if (visibleLayers.length > 1) {
          const layerItems: MenuItem[] = visibleLayers.map((l) => ({
            label: l.name || l.id,
            action: () => handleChangeLayer(effectiveSelectedIds, l.id),
          }));
          items.push({
            label: 'Change Layer',
            children: layerItems,
          });
        }

        // Group
        if (isMulti) {
          items.push({
            label: 'Group',
            action: () => handleGroup(effectiveSelectedIds),
            shortcut: 'Ctrl+G',
          });
        }

        // Align submenu
        if (isMulti) {
          const alignItems: MenuItem[] = (
            ['left', 'centerHorizontal', 'right', 'top', 'centerVertical', 'bottom', 'center'] as const
          ).map((a) => ({
            label: a.charAt(0).toUpperCase() + a.slice(1).replace(/([A-Z])/g, ' $1'),
            action: () => handleAlign(effectiveSelectedIds, a),
          }));
          items.push({
            label: 'Align',
            children: alignItems,
          });
        }

        // Distribute submenu
        if (effectiveSelectedIds.length >= 3) {
          const distItems: MenuItem[] = [
            { label: 'Horizontal', action: () => handleDistribute(effectiveSelectedIds, 'horizontal') },
            { label: 'Vertical', action: () => handleDistribute(effectiveSelectedIds, 'vertical') },
          ];
          items.push({
            label: 'Distribute',
            children: distItems,
          });
        }
      }

      setContextMenuState({
        x: event.x,
        y: event.y,
        items,
      });
    },
    [selectionManager, forceUpdate, viewport],
  );

  const handleCopy = useCallback(
    (elementIds: string[]) => {
      const scene = useDocumentStore.getState().getScene();
      if (!scene) return;
      const items = elementIds
        .map((id) => scene.elements.find((el) => el.id === id))
        .filter((el): el is NonNullable<typeof el> => !!el)
        .map((el) => elementToClipboardInput(el));
      setClipboard(items);
    },
    [],
  );

  const handleCut = useCallback(
    (elementIds: string[]) => {
      const scene = useDocumentStore.getState().getScene();
      if (!scene) return;
      const items = elementIds
        .map((id) => scene.elements.find((el) => el.id === id))
        .filter((el): el is NonNullable<typeof el> => !!el)
        .map((el) => elementToClipboardInput(el));
      setClipboard(items);
      const cmd = new DeleteElementCommand(elementIds, 'unbind');
      executorRef.current.execute(cmd);
      selectionManager.clearSelection();
      forceUpdate();
    },
    [selectionManager, forceUpdate],
  );

  const handlePaste = useCallback(() => {
    const cb = getClipboard();
    if (cb.length === 0) return;
    const scene = useDocumentStore.getState().getScene();
    if (!scene) return;

    const selectedIds = selectionManager.selectedIds;
    let centerX = 400;
    let centerY = 300;

    if (selectedIds.size > 0) {
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      for (const el of scene.elements) {
        if (selectedIds.has(el.id)) {
          sumX += el.transform.x + el.transform.width / 2;
          sumY += el.transform.y + el.transform.height / 2;
          count++;
        }
      }
      if (count > 0) {
        centerX = sumX / count;
        centerY = sumY / count;
      }
    }

    const base = computePastePosition({ x: centerX, y: centerY });

    if (cb.length === 1) {
      const input: ElementInput = {
        ...cb[0],
        layerId: drawingLayerId,
        transform: { ...cb[0].transform, x: base.x, y: base.y },
      };
      executorRef.current.execute(new CreateElementCommand(input, 'Paste'));
    } else {
      const cElements = cb.map((c) => ({ transform: c.transform }));
      let clipCX = 0;
      let clipCY = 0;
      let clipCount = 0;
      for (const c of cElements) {
        clipCX += c.transform.x + c.transform.width / 2;
        clipCY += c.transform.y + c.transform.height / 2;
        clipCount++;
      }
      clipCX /= clipCount;
      clipCY /= clipCount;

      for (const item of cb) {
        const dx = item.transform.x + item.transform.width / 2 - clipCX;
        const dy = item.transform.y + item.transform.height / 2 - clipCY;
        const input: ElementInput = {
          ...item,
          layerId: drawingLayerId,
          transform: { ...item.transform, x: base.x + dx, y: base.y + dy },
        };
        executorRef.current.execute(new CreateElementCommand(input, 'Paste'));
      }
    }
    forceUpdate();
  }, [drawingLayerId, selectionManager, forceUpdate]);

  const handleDelete = useCallback(
    (elementIds: string[]) => {
      if (elementIds.length === 0) return;
      const cmd = new DeleteElementCommand(elementIds, 'unbind');
      executorRef.current.execute(cmd);
      selectionManager.clearSelection();
      forceUpdate();
    },
    [selectionManager, forceUpdate],
  );

  const handleChangeLayer = useCallback(
    (elementIds: string[], targetLayerId: string) => {
      const cmd = new ChangeLayerCommand(elementIds, targetLayerId);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Layer change failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleGroup = useCallback(
    (elementIds: string[]) => {
      if (elementIds.length < 2) return;
      const cmd = new GroupElementsCommand(elementIds, `Group ${Date.now()}`);
      executorRef.current.execute(cmd);
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleAlign = useCallback(
    (elementIds: string[], alignType: 'left' | 'right' | 'top' | 'bottom' | 'centerHorizontal' | 'centerVertical' | 'center') => {
      const cmd = new AlignElementsCommand(elementIds, alignType);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Align failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleDistribute = useCallback(
    (elementIds: string[], distType: 'horizontal' | 'vertical' | 'circular') => {
      const cmd = new DistributeElementsCommand(elementIds, distType);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Distribute failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleFitToCanvas = useCallback(() => {
    if (currentScene.elements.length === 0) return;
    const geometryAdapter = createGeometryAdapter();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of currentScene.elements) {
      const bbox = geometryAdapter.getBBox(el);
      if (bbox.x < minX) minX = bbox.x;
      if (bbox.y < minY) minY = bbox.y;
      if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width;
      if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height;
    }

    if (minX === Infinity) return;

    const sGroup = document.querySelector('svg');
    if (!sGroup) return;

    const containerW = sGroup.clientWidth || window.innerWidth;
    const containerH = sGroup.clientHeight || window.innerHeight;

    viewport.fitToRect(
      { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      containerW,
      containerH,
    );
    forceUpdate();
  }, [currentScene, viewport, forceUpdate]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuState(null);
  }, []);

  return (
    <div className="app-container" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragOver && (
        <div className="drop-overlay">
          <div className="drop-message">Drop images here to import</div>
        </div>
      )}
      <CanvasView
        scene={currentScene}
        viewport={viewport}
        selectionManager={selectionManager}
        conflictHighlighter={conflictHighlighter}
        onViewportChange={forceUpdate}
        onSelectionChange={forceUpdate}
        activeTool={activeTool}
        drawingLayerId={drawingLayerId}
        onDrawComplete={handleDrawComplete}
        onTextEditRequest={handleTextEditRequest}
        onConnectorRouteChange={handleConnectorRouteChange}
        onContextMenu={handleCanvasContextMenu}
      />
      <ShapeToolbar activeTool={activeTool} onToolChange={handleToolChange} />
      <ImageImportButton layerId={drawingLayerId} onImport={handleImageImport} />
      <LayerPanel
        scene={currentScene}
        selectionManager={selectionManager}
        conflictHighlighter={conflictHighlighter}
        executor={executorRef.current}
        forceUpdate={forceUpdate}
      />
      <ConflictPanel conflictHighlighter={conflictHighlighter} />
      <PropertyPanel
        scene={currentScene}
        selectionManager={selectionManager}
        onPropertyChange={handlePropertyChange}
        onLayerChange={handleLayerChange}
        parsedDataMap={undefined}
      />
      {editingElement && (
        <TextEditor
          element={editingElement}
          viewport={viewport}
          onCommit={handleTextCommit}
          onCancel={handleTextCancel}
        />
      )}
      <PwaPrompt />
      <ContextMenu state={contextMenuState} onClose={handleCloseContextMenu} />
    </div>
  );
}

export default App;
