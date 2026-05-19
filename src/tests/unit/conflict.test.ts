import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictHighlighter } from '../../canvas/conflict';
import type { CollisionEntry } from '../../core/collision';
import type { SceneElement, Layer } from '../../core/types';

function makeElement(id: string, layerId: string, name?: string): SceneElement {
  return {
    id,
    type: 'shape',
    shapeKind: 'rect',
    layerId,
    name: name ?? `el-${id}`,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeLayer(id: string, name: string, order: number): Layer {
  return { id, name, order, visible: true, locked: false };
}

function makeCollisionEntry(
  elementA: string,
  elementB: string,
  overrides?: Partial<CollisionEntry>
): CollisionEntry {
  return {
    elementA,
    elementB,
    overlapBBox: { x: 50, y: 50, width: 50, height: 50 },
    ...overrides,
  };
}

describe('ConflictHighlighter', () => {
  let highlighter: ConflictHighlighter;
  let elements: SceneElement[];
  let layers: Layer[];

  beforeEach(() => {
    highlighter = new ConflictHighlighter();
    elements = [
      makeElement('e1', 'l1', 'Element A'),
      makeElement('e2', 'l1', 'Element B'),
    ];
    layers = [
      makeLayer('l1', 'Layer 1', 1),
      makeLayer('l2', 'Layer 2', 2),
    ];
  });

  it('initial state has no conflicts', () => {
    expect(highlighter.hasConflicts).toBe(false);
    expect(highlighter.getConflicts()).toHaveLength(0);
    expect(highlighter.conflictingLayerIds.size).toBe(0);
    expect(highlighter.conflictingElementIds.size).toBe(0);
  });

  it('setCollisions stores conflict info', () => {
    const collisions: CollisionEntry[] = [
      makeCollisionEntry('e1', 'e2'),
    ];
    highlighter.setCollisions(collisions, elements, layers);

    expect(highlighter.hasConflicts).toBe(true);
    expect(highlighter.getConflicts()).toHaveLength(1);
    expect(highlighter.conflictingLayerIds.has('l1')).toBe(true);
    expect(highlighter.conflictingElementIds.has('e1')).toBe(true);
    expect(highlighter.conflictingElementIds.has('e2')).toBe(true);
  });

  it('getConflicts returns conflict details', () => {
    const collisions: CollisionEntry[] = [
      makeCollisionEntry('e1', 'e2'),
    ];
    highlighter.setCollisions(collisions, elements, layers);

    const conflicts = highlighter.getConflicts();
    const c = conflicts[0];
    expect(c.id).toBe('e1-e2');
    expect(c.layerId).toBe('l1');
    expect(c.layerName).toBe('Layer 1');
    expect(c.elementAId).toBe('e1');
    expect(c.elementAName).toBe('Element A');
    expect(c.elementBId).toBe('e2');
    expect(c.elementBName).toBe('Element B');
    expect(c.overlapBBox).toEqual({ x: 50, y: 50, width: 50, height: 50 });
    expect(c.suggestion).toContain('Layer 1');
  });

  it('uses element id as fallback name when name is missing', () => {
    const elementsNoNames: SceneElement[] = [
      { ...elements[0], name: undefined },
      { ...elements[1], name: undefined },
    ];
    const collisions: CollisionEntry[] = [
      makeCollisionEntry('e1', 'e2'),
    ];
    highlighter.setCollisions(collisions, elementsNoNames, layers);

    const conflicts = highlighter.getConflicts();
    expect(conflicts[0].elementAName).toBe('e1');
    expect(conflicts[0].elementBName).toBe('e2');
  });

  it('uses layer id as fallback when layer not found', () => {
    const elementsInMissingLayer: SceneElement[] = [
      { ...elements[0], layerId: 'unknown' },
      { ...elements[1], layerId: 'unknown' },
    ];
    const collisions: CollisionEntry[] = [
      makeCollisionEntry('e1', 'e2'),
    ];
    highlighter.setCollisions(collisions, elementsInMissingLayer, layers);

    const conflicts = highlighter.getConflicts();
    expect(conflicts[0].layerName).toBe('Layer(unknown)');
  });

  it('setCollisions with empty array clears conflicts', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    expect(highlighter.hasConflicts).toBe(true);

    highlighter.setCollisions([], [], []);
    expect(highlighter.hasConflicts).toBe(false);
    expect(highlighter.getConflicts()).toHaveLength(0);
    expect(highlighter.conflictingElementIds.size).toBe(0);
  });

  it('clearCollisions clears all state', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    expect(highlighter.hasConflicts).toBe(true);

    highlighter.clearCollisions();
    expect(highlighter.hasConflicts).toBe(false);
    expect(highlighter.getConflicts()).toHaveLength(0);
    expect(highlighter.conflictingLayerIds.size).toBe(0);
    expect(highlighter.conflictingElementIds.size).toBe(0);
  });

  it('handles multiple collisions across different layers', () => {
    const e3 = makeElement('e3', 'l2', 'Element C');
    const e4 = makeElement('e4', 'l2', 'Element D');
    const allElements = [...elements, e3, e4];

    const collisions: CollisionEntry[] = [
      makeCollisionEntry('e1', 'e2'),
      makeCollisionEntry('e3', 'e4', { overlapBBox: { x: 10, y: 10, width: 30, height: 30 } }),
    ];
    highlighter.setCollisions(collisions, allElements, layers);

    expect(highlighter.getConflicts()).toHaveLength(2);
    expect(highlighter.conflictingLayerIds.has('l1')).toBe(true);
    expect(highlighter.conflictingLayerIds.has('l2')).toBe(true);
    expect(highlighter.conflictingElementIds.size).toBe(4);
  });

  it('skips collisions for non-existent elements', () => {
    const collisions: CollisionEntry[] = [
      makeCollisionEntry('nonexistent1', 'nonexistent2'),
      makeCollisionEntry('e1', 'e2'),
    ];
    highlighter.setCollisions(collisions, elements, layers);

    expect(highlighter.getConflicts()).toHaveLength(1);
    expect(highlighter.getConflicts()[0].elementAId).toBe('e1');
  });

  it('subscribe notifies on setCollisions', () => {
    const listener = vi.fn();
    highlighter.subscribe(listener);

    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    expect(listener).toHaveBeenCalledTimes(1);

    highlighter.setCollisions([], [], []);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('subscribe notifies on clearCollisions', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);

    const listener = vi.fn();
    highlighter.subscribe(listener);
    highlighter.clearCollisions();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('subscribe notifies only when state actually changes', () => {
    const listener = vi.fn();
    highlighter.subscribe(listener);

    highlighter.clearCollisions();
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe removes listener', () => {
    const listener = vi.fn();
    const unsub = highlighter.subscribe(listener);
    unsub();

    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    expect(listener).not.toHaveBeenCalled();
  });
});
