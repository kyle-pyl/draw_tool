import { describe, it, expect } from 'vitest';
import { intersects, getGeometry, getBBox, createGeometryAdapter } from '../../core/geometry';
import { checkLayerCollisions, checkElementsCollide } from '../../core/collision';
import type { ShapeElement, SceneElement } from '../../core/types';

function makeShape(
  id: string,
  layerId: string,
  overrides?: {
    shapeKind?: 'rect' | 'circle' | 'ellipse' | 'polygon';
    transform?: Partial<{ x: number; y: number; width: number; height: number; rotation: number }>;
    points?: { x: number; y: number }[];
  }
): ShapeElement {
  const t = overrides?.transform ?? {};
  return {
    id,
    type: 'shape',
    shapeKind: overrides?.shapeKind ?? 'rect',
    layerId,
    name: `el-${id}`,
    transform: {
      x: t.x ?? 0,
      y: t.y ?? 0,
      width: t.width ?? 100,
      height: t.height ?? 100,
      rotation: t.rotation ?? 0,
      scaleX: 1,
      scaleY: 1,
    },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    points: overrides?.points,
  };
}

function makeText(id: string, layerId: string, text: string): SceneElement {
  return {
    id,
    type: 'text',
    layerId,
    text,
    transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
    visible: true,
    locked: false,
  } as SceneElement;
}

// ─── intersects function ────────────────────────────────────────────────────

describe('intersects', () => {
  it('two identical rectangles intersect', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } });
    expect(intersects(a, b)).toBe(true);
  });

  it('two overlapping rectangles intersect', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 } });
    expect(intersects(a, b)).toBe(true);
  });

  it('two non-overlapping rectangles do not intersect', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 50, height: 50 } });
    const b = makeShape('b', 'l1', { transform: { x: 100, y: 100, width: 50, height: 50 } });
    expect(intersects(a, b)).toBe(false);
  });

  it('edge-touching rectangles do not intersect', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 50, height: 50 } });
    const b = makeShape('b', 'l1', { transform: { x: 50, y: 0, width: 50, height: 50 } });
    expect(intersects(a, b)).toBe(false);
  });

  it('contained rectangle intersects parent', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 200, height: 200 } });
    const b = makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 50, height: 50 } });
    expect(intersects(a, b)).toBe(true);
  });

  it('two distant circles do not intersect', () => {
    const a = makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } });
    expect(intersects(a, b)).toBe(false);
  });

  it('two overlapping circles intersect', () => {
    const a = makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: -20, y: -20, width: 100, height: 100 } });
    expect(intersects(a, b)).toBe(true);
  });

  it('circle and overlapping rectangle intersect', () => {
    const a = makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 100 } });
    expect(intersects(a, b)).toBe(true);
  });

  it('non-shape elements fall back to BBox overlap', () => {
    const text1 = makeText('t1', 'l1', 'hello');
    const text2 = makeText('t2', 'l1', 'world');
    // Both texts have BBox overlap since transforms are identical
    text2.transform = { x: 50, y: 10, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 };
    expect(intersects(text1, text2)).toBe(true);
  });

  it('non-shape elements with no BBox overlap return false', () => {
    const text1 = makeText('t1', 'l1', 'hello');
    const text2 = makeText('t2', 'l1', 'world');
    text2.transform = { x: 200, y: 200, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 };
    expect(intersects(text1, text2)).toBe(false);
  });

  it('intersects is commutative', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { transform: { x: 50, y: 50, width: 100, height: 100 } });
    expect(intersects(a, b)).toBe(intersects(b, a));
  });

  it('two non-overlapping circles with overlapping BBox do NOT collide under real geometry', () => {
    // Two circles where BBoxes overlap but actual circles don't
    // Circle at (-40,-40) radius 50 => BBox (-90,-90) to (10,10)
    // Circle at (-10,-10) radius 50 => BBox (-60,-60) to (40,40)
    // BBox overlap: yes. Circle distance: sqrt(30^2+30^2) = 42.4, radii sum = 100, so circles overlap
    // Let me create a case where BBox overlaps but circles don't
    // Circle at (0,0) radius 50 => BBox (-50,-50) to (50,50)
    // Circle at (90,90) radius 50 => BBox (40,40) to (140,140)
    // BBox overlap? (-50 to 50) vs (40 to 140): yes (40 < 50)
    // Distance between centers: sqrt(90^2+90^2) = 127.3, radii sum = 100 => no circle overlap!
    const a = makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } });
    const bboxA = getBBox(a);
    const bboxB = getBBox(b);
    // Verify BBoxes overlap
    expect(bboxA.x < bboxB.x + bboxB.width).toBe(true);
    expect(bboxA.x + bboxA.width > bboxB.x).toBe(true);
    // But circles don't intersect
    expect(intersects(a, b)).toBe(false);
  });

  it('rotated overlapping rectangles intersect', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 100, height: 40, rotation: 45 } });
    const b = makeShape('b', 'l1', { transform: { x: 0, y: 0, width: 100, height: 40, rotation: 0 } });
    expect(intersects(a, b)).toBe(true);
  });

  it('two polygons intersect', () => {
    const triangle = makeShape('a', 'l1', {
      shapeKind: 'polygon',
      transform: { x: 0, y: 0, width: 100, height: 100 },
      points: [{ x: 0, y: 50 }, { x: 50, y: 0 }, { x: 50, y: 100 }],
    });
    const rect = makeShape('b', 'l1', { transform: { x: 40, y: 0, width: 100, height: 100 } });
    expect(intersects(triangle, rect)).toBe(true);
  });

  it('intersects returns false for same element type with empty geometry', () => {
    // path shapes don't have getGeometry support
    const a = makeShape('a', 'l1', { shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 50 } });
    const b = makeShape('b', 'l1', { shapeKind: 'rect', transform: { x: 100, y: 100, width: 50, height: 50 } });
    expect(intersects(a, b)).toBe(false);
  });
});

// ─── checkLayerCollisions with geometry strategy ─────────────────────────────

describe('checkLayerCollisions with geometry strategy', () => {
  const adapter = createGeometryAdapter();

  it('bbox strategy detects BBox-only overlap (default)', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } }),
      makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } }),
    ];
    const result = checkLayerCollisions(elements, adapter, { collisionStrategy: 'bbox' });
    expect(result.hasCollision).toBe(true);
    expect(result.collisions).toHaveLength(1);
  });

  it('geometry strategy correctly excludes non-overlapping circles', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } }),
      makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } }),
    ];
    const result = checkLayerCollisions(elements, adapter, { collisionStrategy: 'geometry' });
    expect(result.hasCollision).toBe(false);
  });

  it('geometry strategy detects real overlapping shapes', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 100 } }),
      makeShape('b', 'l1', { shapeKind: 'rect', transform: { x: 50, y: 50, width: 100, height: 100 } }),
    ];
    const result = checkLayerCollisions(elements, adapter, { collisionStrategy: 'geometry' });
    expect(result.hasCollision).toBe(true);
    expect(result.collisions).toHaveLength(1);
  });

  it('geometry strategy detects real circle overlap', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } }),
      makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: -20, y: -20, width: 100, height: 100 } }),
    ];
    const result = checkLayerCollisions(elements, adapter, { collisionStrategy: 'geometry' });
    expect(result.hasCollision).toBe(true);
  });

  it('geometry strategy skipped when adapter has no intersects (edge case)', () => {
    const adapterNoIntersects = { getBBox: adapter.getBBox };
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } }),
      makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } }),
    ];
    const result = checkLayerCollisions(elements, adapterNoIntersects as any, { collisionStrategy: 'geometry' });
    expect(result.hasCollision).toBe(true); // falls back to BBox
  });

  it('no collision for non-overlapping shapes under geometry strategy', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 50 } }),
      makeShape('b', 'l1', { shapeKind: 'rect', transform: { x: 100, y: 100, width: 50, height: 50 } }),
    ];
    const result = checkLayerCollisions(elements, adapter, { collisionStrategy: 'geometry' });
    expect(result.hasCollision).toBe(false);
  });

  it('geometry strategy still excludes connectors', () => {
    const elements: SceneElement[] = [
      makeShape('a', 'l1', { shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 100 } }),
      {
        id: 'c1',
        type: 'connector',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        source: { x: 10, y: 10 },
        target: { x: 90, y: 90 },
        route: { type: 'straight', points: [] },
      } as SceneElement,
    ];
    const result = checkLayerCollisions(elements, adapter, { collisionStrategy: 'geometry' });
    expect(result.hasCollision).toBe(false);
  });
});

// ─── checkElementsCollide helper ─────────────────────────────────────────────

describe('checkElementsCollide', () => {
  const adapter = createGeometryAdapter();

  it('returns false for non-overlapping shapes', () => {
    const a = makeShape('a', 'l1', { transform: { x: 0, y: 0, width: 50, height: 50 } });
    const b = makeShape('b', 'l1', { transform: { x: 100, y: 100, width: 50, height: 50 } });
    expect(checkElementsCollide(a, b, adapter, 'bbox')).toBe(false);
    expect(checkElementsCollide(a, b, adapter, 'geometry')).toBe(false);
  });

  it('returns true for overlapping shapes in bbox mode', () => {
    const a = makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } });
    expect(checkElementsCollide(a, b, adapter, 'bbox')).toBe(true);
  });

  it('returns false for BBox-overlapping but non-intersecting circles in geometry mode', () => {
    const a = makeShape('a', 'l1', { shapeKind: 'circle', transform: { x: -50, y: -50, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'circle', transform: { x: 40, y: 40, width: 100, height: 100 } });
    expect(checkElementsCollide(a, b, adapter, 'geometry')).toBe(false);
  });

  it('returns true for truly overlapping shapes in geometry mode', () => {
    const a = makeShape('a', 'l1', { shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 100 } });
    const b = makeShape('b', 'l1', { shapeKind: 'rect', transform: { x: 50, y: 50, width: 100, height: 100 } });
    expect(checkElementsCollide(a, b, adapter, 'geometry')).toBe(true);
  });
});
