import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { CanvasView, Viewport, SelectionManager, ConflictHighlighter } from './canvas';
import type { DrawingToolType } from './canvas';
import { ShapeToolbar, ConflictPanel, TextEditor, ImageImportButton } from './ui';
import { createGeometryAdapter } from './core/geometry';
import { checkLayerCollisions } from './core/collision';
import { useDocumentStore } from './core/store';
import { CommandExecutor, CreateElementCommand, UpdateElementCommand } from './core/commands';
import type { ElementInput } from './core/commands';
import type { ElementStyle } from './core/types';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument, TextElement } from './core/types';
import { isSupportedImageFile, importImageFromFile } from './io/image-utils';

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
      />
      <ShapeToolbar activeTool={activeTool} onToolChange={handleToolChange} />
      <ImageImportButton layerId={drawingLayerId} onImport={handleImageImport} />
      <ConflictPanel conflictHighlighter={conflictHighlighter} />
      {editingElement && (
        <TextEditor
          element={editingElement}
          viewport={viewport}
          onCommit={handleTextCommit}
          onCancel={handleTextCancel}
        />
      )}
    </div>
  );
}

export default App;
