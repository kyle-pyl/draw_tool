import { useMemo } from 'react';
import { CanvasView, Viewport } from './canvas';
import exampleScene from '../examples/basic/scene.json';
import type { SceneDocument } from './core/types';

function App() {
  const scene = useMemo(() => exampleScene as SceneDocument, []);
  const viewport = useMemo(() => new Viewport(), []);

  return (
    <div className="app-container">
      <CanvasView scene={scene} viewport={viewport} />
    </div>
  );
}

export default App;
