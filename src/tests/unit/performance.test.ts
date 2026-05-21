import { describe, it, expect } from 'vitest';
import { checkLayerCollisions, createGeometryAdapter } from '../../core';
import type { SceneElement, ShapeElement } from '../../core/types';
import { generateId } from '../../core/utils';

function makeRectElement(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  layerId = 'layer-1',
): ShapeElement {
  return {
    id,
    type: 'shape',
    layerId,
    shapeKind: 'rect',
    transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#ccc', stroke: '#333', strokeWidth: 1 },
    visible: true,
    locked: false,
  };
}

function createManyElements(count: number, spread: number, overlapFactor = 0.9): SceneElement[] {
  const elements: SceneElement[] = [];
  const cols = Math.ceil(Math.sqrt(count));
  const spacing = spread / cols;
  const elemSize = spacing * overlapFactor;
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * spacing;
    const y = row * spacing;
    elements.push(makeRectElement(generateId('el'), x, y, elemSize, elemSize));
  }
  return elements;
}

describe('Performance benchmarks', () => {
  const adapter = createGeometryAdapter();

  it('should handle 1000 non-overlapping elements collision check in reasonable time', () => {
    const elements = createManyElements(1000, 5000);
    const start = performance.now();
    const result = checkLayerCollisions(elements, adapter);
    const elapsed = performance.now() - start;

    expect(result.hasCollision).toBe(false);
    expect(elapsed).toBeLessThan(200);
  }, 10000);

  it('should handle 500 overlapping elements collision check quickly', () => {
    const elements = createManyElements(500, 40, 1.2);
    const start = performance.now();
    const result = checkLayerCollisions(elements, adapter);
    const elapsed = performance.now() - start;

    expect(result.hasCollision).toBe(true);
    expect(elapsed).toBeLessThan(500);
  }, 10000);

  it('should be faster than quadratic baseline for large sets', () => {
    const smallSet = createManyElements(30, 5000);
    const largeSet = createManyElements(300, 5000);

    const t1 = performance.now();
    checkLayerCollisions(smallSet, adapter);
    const smallTime = performance.now() - t1;

    const t2 = performance.now();
    checkLayerCollisions(largeSet, adapter);
    const largeTime = performance.now() - t2;

    // With spatial index (threshold=50), 300 elements should NOT be
    // 100x slower than 30 elements (which would indicate O(n²) scaling).
    // Instead it should be closer to O(n log n) which is roughly
    // (300*log(300)) / (30*log(30)) ≈ 15x, not 100x.
    // We use a generous ratio to account for measurement noise.
    const ratio = largeTime / Math.max(smallTime, 1);
    expect(ratio).toBeLessThan(60);
  }, 10000);

  it('should produce same results as nested loop for small sets', () => {
    const elements = [];
    elements.push(makeRectElement('a', 10, 10, 50, 50));
    elements.push(makeRectElement('b', 30, 30, 50, 50));
    elements.push(makeRectElement('c', 200, 200, 50, 50));

    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
    expect(result.collisions).toHaveLength(1);
    expect(result.collisions[0].elementA).toBe('a');
    expect(result.collisions[0].elementB).toBe('b');
  });

  it('should skip connectors in collision detection', () => {
    const elements: SceneElement[] = [
      makeRectElement('a', 10, 10, 50, 50),
      makeRectElement('b', 30, 30, 50, 50),
      {
        id: 'conn1',
        type: 'connector',
        layerId: 'layer-1',
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#333', strokeWidth: 2 },
        source: { x: 10, y: 10 },
        target: { x: 200, y: 200 },
        route: { type: 'straight', points: [] },
        visible: true,
        locked: false,
      },
    ];

    const result = checkLayerCollisions(elements, adapter);
    expect(result.collisions).toHaveLength(1);
    expect(result.collisions[0].elementA).not.toBe('conn1');
  });
});
