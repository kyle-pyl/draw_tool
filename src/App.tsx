import { useMemo, useState, useCallback } from 'react';
import { CanvasView, Viewport, SelectionManager, ConflictHighlighter } from './canvas';
import { ConflictPanel } from './ui';
import { createGeometryAdapter } from './core/geometry';
import { checkLayerCollisions } from './core/collision';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument } from './core/types';

function App() {
  const scene = useMemo(() => exampleScene as SceneDocument, []);
  const [viewport] = useState(() => new Viewport());
  const [selectionManager] = useState(() => new SelectionManager());
  const [conflictHighlighter] = useState(() => new ConflictHighlighter());
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((n) => n + 1), []);

  const checkConflicts = useCallback(() => {
    const adapter = createGeometryAdapter();
    const conflictsByLayer = new Map<string, typeof scene.elements>();
    for (const el of scene.elements) {
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
        skipHidden: !scene.rules.hiddenElementsCollide,
      });
      allCollisions.push(...result.collisions);
    }
    conflictHighlighter.setCollisions(allCollisions, scene.elements, scene.layers);
  }, [scene, conflictHighlighter]);

  useMemo(() => {
    checkConflicts();
  }, [checkConflicts]);

  return (
    <div className="app-container">
      <CanvasView
        scene={scene}
        viewport={viewport}
        selectionManager={selectionManager}
        conflictHighlighter={conflictHighlighter}
        onViewportChange={forceUpdate}
        onSelectionChange={forceUpdate}
      />
      <ConflictPanel conflictHighlighter={conflictHighlighter} />
    </div>
  );
}

export default App;
