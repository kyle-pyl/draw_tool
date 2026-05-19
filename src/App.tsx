import { useMemo, useState, useCallback } from 'react';
import { CanvasView, Viewport } from './canvas';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument } from './core/types';

function App() {
  const scene = useMemo(() => exampleScene as SceneDocument, []);
  const [viewport] = useState(() => new Viewport());
  const [, setTick] = useState(0);
  const handleViewportChange = useCallback(() => setTick((n) => n + 1), []);

  return (
    <div className="app-container">
      <CanvasView scene={scene} viewport={viewport} onViewportChange={handleViewportChange} />
    </div>
  );
}

export default App;
