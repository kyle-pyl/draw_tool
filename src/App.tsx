import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { CanvasView, Viewport, SelectionManager, ConflictHighlighter } from './canvas';
import type { DrawingToolType } from './canvas';
import { ShapeToolbar, ConflictPanel } from './ui';
import { createGeometryAdapter } from './core/geometry';
import { checkLayerCollisions } from './core/collision';
import { useDocumentStore } from './core/store';
import { CommandExecutor, CreateElementCommand } from './core/commands';
import type { ElementInput } from './core/commands';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument } from './core/types';

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

  useEffect(() => {
    useDocumentStore.getState().loadScene(scene);
  }, [scene]);

  const storeScene = useDocumentStore((s) => s.scene);
  const currentScene = storeScene ?? scene;

  const drawingLayerId = useMemo(
    () => findActiveLayerId(currentScene),
    [currentScene],
  );

  const handleDrawComplete = useCallback(
    (input: ElementInput) => {
      const cmd = new CreateElementCommand(input);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        const errs = result.errors.map((e) => e.message).join('\n');
        console.warn('Draw failed:', errs);
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleToolChange = useCallback((tool: DrawingToolType) => {
    setActiveTool(tool);
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
    <div className="app-container">
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
      />
      <ShapeToolbar activeTool={activeTool} onToolChange={handleToolChange} />
      <ConflictPanel conflictHighlighter={conflictHighlighter} />
    </div>
  );
}

export default App;
