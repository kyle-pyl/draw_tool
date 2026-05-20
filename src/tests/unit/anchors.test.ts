import { describe, it, expect } from 'vitest';
import { getAnchors, resolveAnchor } from '../../core/anchors';
import type {
  ShapeElement,
  TextElement,
  ImageElement,
  ConnectorElement,
  AnchorPoint,
} from '../../core/types';

function el(overrides?: Record<string, unknown>) {
  return {
    id: 'e1',
    type: 'shape' as const,
    layerId: 'l1',
    name: 'test',
    transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    ...overrides,
  };
}

// ─── getAnchors ─────────────────────────────────────────────────────────────────

describe('getAnchors', () => {
  it('returns default 9 anchors for a shape element', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape' }),
      shapeKind: 'rect',
    };
    const anchors = getAnchors(shape);
    expect(anchors).toHaveLength(9);
    const ids = anchors.map((a) => a.id);
    expect(ids).toContain('top');
    expect(ids).toContain('bottom');
    expect(ids).toContain('left');
    expect(ids).toContain('right');
    expect(ids).toContain('center');
    expect(ids).toContain('top-left');
    expect(ids).toContain('top-right');
    expect(ids).toContain('bottom-left');
    expect(ids).toContain('bottom-right');
  });

  it('returns default 9 anchors for a text element', () => {
    const text: TextElement = {
      ...el({ type: 'text' }),
      text: 'Hello',
    };
    const anchors = getAnchors(text);
    expect(anchors).toHaveLength(9);
  });

  it('returns default 9 anchors for an image element', () => {
    const img: ImageElement = {
      ...el({ type: 'image' }),
      src: 'blob:test',
      originalWidth: 200,
      originalHeight: 150,
    };
    const anchors = getAnchors(img);
    expect(anchors).toHaveLength(9);
  });

  it('returns default 9 anchors for a connector element', () => {
    const conn: ConnectorElement = {
      ...el({ type: 'connector' }),
      source: { x: 0, y: 0 },
      target: { x: 100, y: 100 },
      route: { type: 'straight', points: [] },
    };
    const anchors = getAnchors(conn);
    expect(anchors).toHaveLength(9);
  });

  it('returns custom anchors from shape element metadata', () => {
    const customAnchors: AnchorPoint[] = [
      { id: 'input', position: { x: 0, y: 0.3 }, direction: Math.PI },
      { id: 'output', position: { x: 1, y: 0.7 }, direction: 0 },
    ];
    const shape: ShapeElement = {
      ...el({ type: 'shape', metadata: { anchors: customAnchors } }),
      shapeKind: 'rect',
    };
    const anchors = getAnchors(shape);
    expect(anchors).toHaveLength(2);
    expect(anchors[0].id).toBe('input');
    expect(anchors[1].id).toBe('output');
  });

  it('ignores empty metadata anchors array and returns defaults', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', metadata: { anchors: [] } }),
      shapeKind: 'rect',
    };
    const anchors = getAnchors(shape);
    expect(anchors).toHaveLength(9);
  });

  it('ignores metadata anchors on non-shape elements', () => {
    const customAnchors: AnchorPoint[] = [
      { id: 'custom-a', position: { x: 0.2, y: 0.5 }, direction: Math.PI },
    ];
    const text: TextElement = {
      ...el({ type: 'text', metadata: { anchors: customAnchors } }),
      text: 'Hello',
    };
    const anchors = getAnchors(text);
    expect(anchors).toHaveLength(9);
  });

  it('each default anchor has valid position in 0-1 range', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape' }),
      shapeKind: 'rect',
    };
    const anchors = getAnchors(shape);
    for (const a of anchors) {
      expect(a.position.x).toBeGreaterThanOrEqual(0);
      expect(a.position.x).toBeLessThanOrEqual(1);
      expect(a.position.y).toBeGreaterThanOrEqual(0);
      expect(a.position.y).toBeLessThanOrEqual(1);
    }
  });
});

// ─── resolveAnchor ──────────────────────────────────────────────────────────────

describe('resolveAnchor', () => {
  it('resolves top anchor to absolute canvas coordinate', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'top');
    expect(abs).toEqual({ x: 200, y: 50 }); // center-x at x+width*0.5, y unchanged
  });

  it('resolves bottom anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'bottom');
    expect(abs).toEqual({ x: 200, y: 150 });
  });

  it('resolves left anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'left');
    expect(abs).toEqual({ x: 100, y: 100 });
  });

  it('resolves right anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'right');
    expect(abs).toEqual({ x: 300, y: 100 });
  });

  it('resolves center anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'center');
    expect(abs).toEqual({ x: 200, y: 100 });
  });

  it('resolves top-left anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'top-left');
    expect(abs).toEqual({ x: 100, y: 50 });
  });

  it('resolves top-right anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'top-right');
    expect(abs).toEqual({ x: 300, y: 50 });
  });

  it('resolves bottom-left anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'bottom-left');
    expect(abs).toEqual({ x: 100, y: 150 });
  });

  it('resolves bottom-right anchor', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape', transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'bottom-right');
    expect(abs).toEqual({ x: 300, y: 150 });
  });

  it('resolves custom anchor on shape element', () => {
    const shape: ShapeElement = {
      ...el({
        type: 'shape',
        metadata: {
          anchors: [
            { id: 'input', position: { x: 0, y: 0.3 }, direction: Math.PI },
          ],
        },
        transform: { x: 100, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'input');
    expect(abs).toEqual({ x: 100, y: 80 }); // y = 50 + 0.3 * 100
  });

  it('returns null for unknown anchor id', () => {
    const shape: ShapeElement = {
      ...el({ type: 'shape' }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'nonexistent');
    expect(abs).toBeNull();
  });

  it('anchor position follows element position change', () => {
    const shape: ShapeElement = {
      ...el({
        type: 'shape',
        transform: { x: 10, y: 20, width: 300, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
      }),
      shapeKind: 'rect',
    };
    const abs1 = resolveAnchor(shape, 'right');
    const moved: ShapeElement = {
      ...shape,
      transform: { ...shape.transform, x: 100, y: 200 },
    };
    const abs2 = resolveAnchor(moved, 'right');
    expect(abs1!.x).toBe(310); // 10 + 1.0 * 300
    expect(abs2!.x).toBe(400); // 100 + 1.0 * 300
  });

  it('resolves anchors on text element', () => {
    const text: TextElement = {
      ...el({ type: 'text', transform: { x: 0, y: 0, width: 80, height: 30, rotation: 0, scaleX: 1, scaleY: 1 } }),
      text: 'Label',
    };
    const abs = resolveAnchor(text, 'center');
    expect(abs).toEqual({ x: 40, y: 15 });
  });

  it('resolves anchors on image element', () => {
    const img: ImageElement = {
      ...el({ type: 'image', transform: { x: 10, y: 10, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } }),
      src: 'blob:test',
      originalWidth: 200,
      originalHeight: 100,
    };
    const abs = resolveAnchor(img, 'bottom-right');
    expect(abs).toEqual({ x: 210, y: 110 });
  });

  // ─── Rotation tests ──────────────────────────────────────────────────────────

  it('rotation 90 degrees — right anchor becomes bottom-like position', () => {
    const shape: ShapeElement = {
      ...el({
        type: 'shape',
        transform: { x: 0, y: 0, width: 100, height: 60, rotation: 90, scaleX: 1, scaleY: 1 },
      }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'right');
    if (!abs) throw new Error('anchor not found');
    // Right anchor local: (100, 30), center at (50, 30)
    // Rotating 90° around (50, 30):
    // dx=50, dy=0 → rotated (0, 50) → (50, 80)
    expect(abs.x).toBeCloseTo(50);
    expect(abs.y).toBeCloseTo(80);
  });

  it('rotation 180 degrees — top anchor goes to bottom', () => {
    const shape: ShapeElement = {
      ...el({
        type: 'shape',
        transform: { x: 0, y: 0, width: 100, height: 60, rotation: 180, scaleX: 1, scaleY: 1 },
      }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'top');
    if (!abs) throw new Error('anchor not found');
    // Top anchor local: (50, 0), center (50, 30), dy=-30
    // Rotating 180°: dx=0, dy=-30 → (0, 30) → (50, 60)
    expect(abs.x).toBeCloseTo(50);
    expect(abs.y).toBeCloseTo(60);
  });

  it('rotation 45 degrees', () => {
    const shape: ShapeElement = {
      ...el({
        type: 'shape',
        transform: { x: 100, y: 100, width: 100, height: 100, rotation: 45, scaleX: 1, scaleY: 1 },
      }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'top');
    if (!abs) throw new Error('anchor not found');
    // Top anchor local: (150, 100), center (150, 150), dy=-50
    // Rotate 45°: cos=√2/2≈0.707, sin≈0.707
    // dx=0, dy=-50 → rotated (-(-50)*sin, -50*cos) = (35.355, -35.355) → (185.355, 114.645)
    expect(abs.x).toBeCloseTo(185.355, 1);
    expect(abs.y).toBeCloseTo(114.645, 1);
  });

  it('zero rotation anchor equals non-rotated computation', () => {
    const shape: ShapeElement = {
      ...el({
        type: 'shape',
        transform: { x: 50, y: 30, width: 200, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      }),
      shapeKind: 'rect',
    };
    const abs = resolveAnchor(shape, 'top-left');
    expect(abs).toEqual({ x: 50, y: 30 });
  });
});
