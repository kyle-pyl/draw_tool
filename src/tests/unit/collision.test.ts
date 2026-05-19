import { describe, it, expect } from 'vitest';
import { checkLayerCollisions } from '../../core/collision';
import { createGeometryAdapter } from '../../core/geometry';
import type { CollisionResult } from '../../core/collision';
import type {
  ShapeElement,
  ConnectorElement,
  SceneElement,
} from '../../core/types';

function makeShape(
  id: string,
  layerId: string,
  overrides?: { transform?: Partial<{ x: number; y: number; width: number; height: number; rotation: number }>; visible?: boolean; locked?: boolean }
): ShapeElement {
  return {
    id,
    type: 'shape',
    shapeKind: 'rect',
    layerId,
    name: `el-${id}`,
    transform: {
      x: overrides?.transform?.x ?? 0,
      y: overrides?.transform?.y ?? 0,
      width: overrides?.transform?.width ?? 100,
      height: overrides?.transform?.height ?? 100,
      rotation: overrides?.transform?.rotation ?? 0,
      scaleX: 1,
      scaleY: 1,
    },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: overrides?.visible ?? true,
    locked: overrides?.locked ?? false,
  };
}

function makeConnector(
  id: string,
  layerId: string
): ConnectorElement {
  return {
    id,
    type: 'connector',
    layerId,
    name: `el-${id}`,
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    source: { x: 10, y: 10 },
    target: { x: 90, y: 90 },
    route: { type: 'straight', points: [] },
  };
}

const adapter = createGeometryAdapter();

describe('checkLayerCollisions', () => {
  it('returns no collision for empty array', () => {
    const result = checkLayerCollisions([], adapter);
    expect(result.hasCollision).toBe(false);
    expect(result.collisions).toHaveLength(0);
  });

  it('returns no collision for single element', () => {
    const elements: SceneElement[] = [makeShape('a', 'l1')];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(false);
  });

  it('detects two overlapping rectangles', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
    expect(result.collisions).toHaveLength(1);
    expect(result.collisions[0].elementA).toBe('a');
    expect(result.collisions[0].elementB).toBe('b');
    expect(result.collisions[0].overlapBBox.x).toBe(50);
    expect(result.collisions[0].overlapBBox.y).toBe(50);
    expect(result.collisions[0].overlapBBox.width).toBe(50);
    expect(result.collisions[0].overlapBBox.height).toBe(50);
  });

  it('returns no collision for non-overlapping elements', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 50, height: 50 } }),
      makeShape('b', 'l1', { transform: { x: 100, y: 100, width: 50, height: 50 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(false);
  });

  it('excludes connector elements from collision detection', () => {
    const elements: SceneElement[] = [
      makeConnector('c1', 'l1'),
      makeConnector('c2', 'l1'),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(false);
  });

  it('connector overlapping a shape does not trigger collision', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeConnector('c1', 'l1'),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(false);
  });

  it('detects multiple overlaps among three elements', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { transform: { x: 60, y: 0, width: 100, height: 100 } }),
      makeShape('c', 'l1', { transform: { x: 200, y: 0, width: 50, height: 50 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
    expect(result.collisions).toHaveLength(1);
    expect(result.collisions[0].elementA).toBe('a');
    expect(result.collisions[0].elementB).toBe('b');
  });

  it('detects collision when one element fully contains another', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 200, height: 200 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 50, height: 50 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
  });

  it('edge-touching elements do not collide', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 50, height: 50 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 0, width: 50, height: 50 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(false);
  });

  it('hidden elements participate by default', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 }, visible: false }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
  });

  it('can skip hidden elements via options', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 }, visible: false }),
    ];
    const result = checkLayerCollisions(elements, adapter, { skipHidden: true });
    expect(result.hasCollision).toBe(false);
  });

  it('locked elements participate by default', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 }, locked: true }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
  });

  it('can skip locked elements via options', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 }, locked: true }),
    ];
    const result = checkLayerCollisions(elements, adapter, { skipLocked: true });
    expect(result.hasCollision).toBe(false);
  });

  it('detects collision with rotated elements via BBox', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 40, rotation: 45 } }),
      makeShape('b', 'l1', { transform: { x: 40, y: 40, width: 100, height: 40, rotation: 0 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
  });

  it('collision result includes overlapBBox with correct intersection', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { transform: { x: 10, y: 10, width: 80, height: 80 } }),
      makeShape('b', 'l1', { transform: { x: 50, y: 30, width: 100, height: 60 } }),
    ];
    const result = checkLayerCollisions(elements, adapter);
    expect(result.hasCollision).toBe(true);
    expect(result.collisions[0].overlapBBox).toEqual({
      x: 50, y: 30, width: 40, height: 60,
    });
  });
});
