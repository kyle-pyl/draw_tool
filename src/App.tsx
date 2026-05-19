import { useMemo, useState, useCallback } from 'react';
import { CanvasView, Viewport, SelectionManager } from './canvas';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument } from './core/types';

function App() {
  const scene = useMemo(() => exampleScene as SceneDocument, []);
  const [viewport] = useState(() => new Viewport());
  const [selectionManager] = useState(() => new SelectionManager());
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((n) => n + 1), []);

  return (
    <div className="app-container">
      <CanvasView
        scene={scene}
        viewport={viewport}
        selectionManager={selectionManager}
        onViewportChange={forceUpdate}
        onSelectionChange={forceUpdate}
      />
    </div>
  );
}

export default App;
