import { describe, it, expect } from 'vitest';
import { SnapManager } from '../../canvas/snap';
import type { SceneElement } from '../../core/types';
import { generateId } from '../../core/utils';

function makeShape(
  overrides: Partial<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    locked: boolean;
  }> = {},
): SceneElement {
  return {
    id: overrides.id ?? generateId(),
    type: 'shape',
    layerId: 'layer-1',
    shapeKind: 'rect',
    transform: {
      x: overrides.x ?? 0,
      y: overrides.y ?? 0,
      width: overrides.width ?? 100,
      height: overrides.height ?? 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    style: { fill: '#ccc', stroke: '#333', strokeWidth: 1, opacity: 1 },
    visible: overrides.visible ?? true,
    locked: overrides.locked ?? false,
  };
}

function makeConnector(id?: string): SceneElement {
  return {
    id: id ?? generateId(),
    type: 'connector',
    layerId: 'layer-1',
    source: { elementId: 'a', x: 0, y: 0 },
    target: { elementId: 'b', x: 100, y: 100 },
    route: { type: 'straight', points: [] },
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
  };
}

describe('SnapManager', () => {
  it('returns original position when disabled', () => {
    const sm = new SnapManager({ enabled: false });
    const result = sm.snapPosition(50, 60, 100, 80, 20, [], []);
    expect(result.x).toBe(50);
    expect(result.y).toBe(60);
    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });

  it('snaps to grid when within snap distance', () => {
    const sm = new SnapManager({ gridSnap: true, elementSnap: false });
    const result = sm.snapPosition(19, 41, 100, 80, 20, [], []);
    expect(result.x).toBe(20);
    expect(result.y).toBe(40);
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(true);
  });

  it('does not snap to grid when beyond snap distance', () => {
    const sm = new SnapManager({ gridSnap: true, elementSnap: false, snapDistance: 5 });
    const result = sm.snapPosition(13, 53, 100, 80, 20, [], []);
    expect(result.x).toBe(13);
    expect(result.snappedY).toBe(false);
  });

  it('grid snap with zero grid size returns original', () => {
    const sm = new SnapManager();
    const result = sm.snapPosition(50, 60, 100, 80, 0, [], []);
    expect(result.x).toBe(50);
    expect(result.y).toBe(60);
  });

  it('snaps to left edge of another element', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const other = makeShape({ x: 200, y: 100, width: 100, height: 100 });
    // Move element's left edge near other's left edge
    const result = sm.snapPosition(197, 50, 100, 80, 0, [other], ['moving-1']);
    expect(result.x).toBe(200);
    expect(result.snappedX).toBe(true);
  });

  it('snaps right edge to another right edge', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const other = makeShape({ x: 100, y: 100, width: 100, height: 100 });
    // other's right edge is at 200. Moving element's width=100.
    // So move element's x should snap so that x+100 = 200, meaning x=100
    const result = sm.snapPosition(98, 50, 100, 80, 0, [other], ['moving-1']);
    expect(result.x).toBe(100);
    expect(result.snappedX).toBe(true);
  });

  it('snaps to top edge of another element', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const other = makeShape({ x: 100, y: 200, width: 100, height: 100 });
    const result = sm.snapPosition(50, 198, 100, 80, 0, [other], ['moving-1']);
    expect(result.y).toBe(200);
    expect(result.snappedY).toBe(true);
  });

  it('snaps center to center', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    // other: x=100, w=100 => cx=150
    // moving: w=100 => cx should be 150 => x = 150 - 50 = 100
    const other = makeShape({ x: 100, y: 100, width: 100, height: 100 });
    const result = sm.snapPosition(98, 50, 100, 80, 0, [other], ['moving-1']);
    expect(result.x).toBe(100);
    expect(result.snappedX).toBe(true);
  });

  it('excludes moving elements from snap targets', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const self = makeShape({ id: 'moving-1', x: 0, y: 0, width: 50, height: 50 });
    const result = sm.snapPosition(0, 0, 50, 50, 0, [self], ['moving-1']);
    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });

  it('ignores connector elements', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const conn = makeConnector('conn-1');
    const result = sm.snapPosition(5, 5, 100, 80, 0, [conn], ['moving-1']);
    expect(result.snappedX).toBe(false);
  });

  it('ignores hidden elements', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const hidden = makeShape({ x: 10, y: 10, width: 100, height: 100, visible: false });
    const result = sm.snapPosition(8, 8, 50, 50, 0, [hidden], ['moving-1']);
    expect(result.snappedX).toBe(false);
  });

  it('respects custom snap distance', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false, snapDistance: 4 });
    const other = makeShape({ x: 200, y: 100, width: 100, height: 100 });
    // 6 pixels away from edge, but snapDistance is 4
    const result = sm.snapPosition(194, 50, 100, 80, 0, [other], ['moving-1']);
    expect(result.snappedX).toBe(false);
  });

  it('prefers closer snap target', () => {
    const sm = new SnapManager({ elementSnap: true, gridSnap: false });
    const near = makeShape({ x: 200, y: 100, width: 100, height: 100 });
    const far = makeShape({ x: 500, y: 100, width: 100, height: 100 });
    // Should snap to near element (distance 2) rather than far element (distance 5)
    const result = sm.snapPosition(198, 50, 100, 80, 0, [near, far], ['moving-1']);
    expect(result.x).toBe(200);
    expect(result.snappedX).toBe(true);
  });
});
