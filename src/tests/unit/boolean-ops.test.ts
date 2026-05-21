import { describe, it, expect, beforeEach } from 'vitest';
import { performBooleanOperation, geometryToSvgPath } from '../../core/boolean-ops';
import { getGeometry } from '../../core/geometry';
import { CommandExecutor, BooleanOperationCommand } from '../../core/commands';
import { useDocumentStore } from '../../core/store';
import type { SceneDocument, ShapeElement } from '../../core/types';

function makeScene(): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: {
      units: 'px',
      background: '#fff',
      defaultFont: 'Arial',
      gridSize: 0,
      snapToGrid: false,
    },
    rules: {
      maxLayerCount: 10,
      collisionStrategy: 'bbox',
      hiddenElementsCollide: false,
      lockedElementsCollide: false,
      connectorsExempt: true,
    },
    layers: [
      { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
    ],
    elements: [],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

function makeRect(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  layerId = 'l1',
  rotation = 0,
): ShapeElement {
  return {
    id,
    type: 'shape',
    shapeKind: 'rect',
    layerId,
    name: `rect-${id}`,
    transform: { x, y, width, height, rotation, scaleX: 1, scaleY: 1 },
    style: { fill: '#ccc', stroke: '#333', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeCircle(id: string, cx: number, cy: number, r: number, layerId = 'l1'): ShapeElement {
  const diameter = r * 2;
  return {
    id,
    type: 'shape',
    shapeKind: 'circle',
    layerId,
    name: `circle-${id}`,
    transform: { x: cx - r, y: cy - r, width: diameter, height: diameter, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#ccc', stroke: '#333', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  };
}

// ─── getGeometry tests ─────────────────────────────────────────────────────────

describe('getGeometry', () => {
  it('extracts rectangle as 4-vertex polygon', () => {
    const rect = makeRect('r1', 10, 20, 100, 50);
    const geom = getGeometry(rect);
    expect(geom.paths.length).toBe(1);
    expect(geom.paths[0].length).toBe(4);
    expect(geom.paths[0][0]).toEqual({ x: 10, y: 20 });
    expect(geom.paths[0][1]).toEqual({ x: 110, y: 20 });
    expect(geom.paths[0][2]).toEqual({ x: 110, y: 70 });
    expect(geom.paths[0][3]).toEqual({ x: 10, y: 70 });
  });

  it('extracts rotated rectangle geometry', () => {
    const rect = makeRect('r1', 0, 0, 100, 100, 'l1', 45);
    const geom = getGeometry(rect);
    expect(geom.paths.length).toBe(1);
    expect(geom.paths[0].length).toBe(4);
  });

  it('extracts circle as polygon approximation', () => {
    const circle = makeCircle('c1', 50, 50, 30);
    const geom = getGeometry(circle);
    expect(geom.paths.length).toBe(1);
    expect(geom.paths[0].length).toBe(64);
  });

  it('returns empty paths for non-shape elements', () => {
    const text = { id: 't1', type: 'text', text: 'Hello' } as any;
    const geom = getGeometry(text);
    expect(geom.paths).toEqual([]);
  });
});

// ─── performBooleanOperation tests ─────────────────────────────────────────────

describe('performBooleanOperation', () => {
  const rect1 = {
    paths: [[
      { x: 0, y: 0 }, { x: 100, y: 0 },
      { x: 100, y: 100 }, { x: 0, y: 100 },
    ]],
  };

  const rect2 = {
    paths: [[
      { x: 50, y: 50 }, { x: 150, y: 50 },
      { x: 150, y: 150 }, { x: 50, y: 150 },
    ]],
  };

  it('union of two overlapping squares produces merged shape', () => {
    const result = performBooleanOperation([rect1, rect2], 'union');
    expect(result.paths.length).toBe(1);
  });

  it('intersect of two overlapping squares produces overlapping region', () => {
    const result = performBooleanOperation([rect1, rect2], 'intersect');
    expect(result.paths.length).toBe(1);
    expect(result.paths[0].length).toBeGreaterThanOrEqual(3);
  });

  it('xor of two overlapping squares produces two separate polygons', () => {
    const result = performBooleanOperation([rect1, rect2], 'xor');
    expect(result.paths.length).toBe(2);
  });

  it('subtract of two overlapping squares produces concave shape', () => {
    const result = performBooleanOperation([rect1, rect2], 'subtract');
    expect(result.paths.length).toBe(1);
    expect(result.paths[0].length).toBeGreaterThanOrEqual(3);
  });

  it('single shape returns itself', () => {
    const result = performBooleanOperation([rect1], 'union');
    expect(result.paths.length).toBe(1);
  });

  it('empty shapes returns empty paths', () => {
    const result = performBooleanOperation([], 'union');
    expect(result.paths).toEqual([]);
  });
});

// ─── geometryToSvgPath tests ────────────────────────────────────────────────────

describe('geometryToSvgPath', () => {
  it('converts single polygon to SVG path string', () => {
    const geom = {
      paths: [[
        { x: 0, y: 0 }, { x: 100, y: 0 },
        { x: 100, y: 100 }, { x: 0, y: 100 },
      ]],
    };
    const svg = geometryToSvgPath(geom);
    expect(svg).toBe('M 0 0 L 100 0 L 100 100 L 0 100 Z');
  });

  it('converts multi-polygon to SVG path string', () => {
    const geom = {
      paths: [
        [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
        [{ x: 20, y: 20 }, { x: 30, y: 20 }, { x: 30, y: 30 }, { x: 20, y: 30 }],
      ],
    };
    const svg = geometryToSvgPath(geom);
    expect(svg).toBe('M 0 0 L 10 0 L 10 10 L 0 10 Z M 20 20 L 30 20 L 30 30 L 20 30 Z');
  });

  it('returns empty string for empty paths', () => {
    expect(geometryToSvgPath({ paths: [] })).toBe('');
  });
});

// ─── BooleanOperationCommand tests ─────────────────────────────────────────────

describe('BooleanOperationCommand', () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    const scene = makeScene();
    const r1 = makeRect('r1', 0, 0, 100, 100);
    const r2 = makeRect('r2', 50, 50, 100, 100);
    scene.elements = [r1, r2];
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(scene));
  });

  it('constructor assigns id, label, operation', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    expect(cmd.id).toMatch(/^boolean_/);
    expect(cmd.label).toBe('Union 2 shapes');
  });

  it('constructor accepts custom label', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'intersect', 'My Intersect');
    expect(cmd.label).toBe('My Intersect');
  });

  it('validate fails with less than 2 elements', () => {
    const scene = useDocumentStore.getState().getScene()!;
    const cmd = new BooleanOperationCommand(['r1'], 'union');
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('at least 2');
  });

  it('validate fails for nonexistent element', () => {
    const scene = useDocumentStore.getState().getScene()!;
    const cmd = new BooleanOperationCommand(['r1', 'nonexistent'], 'union');
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
  });

  it('validate fails for locked element', () => {
    const scene = useDocumentStore.getState().getScene()!;
    scene.elements[0].locked = true;
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
  });

  it('validate fails for non-shape elements', () => {
    const scene = useDocumentStore.getState().getScene()!;
    scene.elements.push({
      id: 't1',
      type: 'text',
      text: 'hello',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 50, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
      visible: true,
      locked: false,
    } as any);
    const cmd = new BooleanOperationCommand(['r1', 't1'], 'union');
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('SCHEMA_INVALID_TYPE');
  });

  it('execute union creates new element and layer', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.layers.length).toBe(2);
    expect(scene.elements.length).toBe(1);
    expect(scene.elements[0].type).toBe('shape');
    expect(scene.elements[0].shapeKind).toBe('path');
    expect(scene.elements[0].layerId).toBe(cmd.getNewLayerId());
  });

  it('execute union preserves result element on correct layer', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    executor.execute(cmd);

    const scene = useDocumentStore.getState().getScene()!;
    const resultLayer = scene.layers.find((l) => l.id === cmd.getNewLayerId());
    expect(resultLayer).toBeDefined();
    expect(resultLayer!.order).toBe(2);
  });

  it('undo restores original elements', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    executor.execute(cmd);

    expect(executor.canUndo()).toBe(true);
    const undone = executor.undo();
    expect(undone).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.layers.length).toBe(1);
    expect(scene.elements.length).toBe(2);
    expect(scene.elements.map((e) => e.id).sort()).toEqual(['r1', 'r2']);
  });

  it('redo restores boolean result after undo', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    executor.execute(cmd);
    executor.undo();

    expect(executor.canRedo()).toBe(true);
    const redone = executor.redo();
    expect(redone).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.layers.length).toBe(2);
    expect(scene.elements.length).toBe(1);
  });

  it('execute intersect produces valid result', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'intersect');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements.length).toBe(1);
    expect(scene.elements[0].pathCommands).toBeTruthy();
  });

  it('execute xor produces valid result', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'xor');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);
  });

  it('execute subtract produces concave result', () => {
    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'subtract');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    const pathCommands = scene.elements[0].pathCommands;
    expect(pathCommands).toBeTruthy();
    expect(pathCommands!.length).toBeGreaterThan(10);
  });

  it('validate fails when maxLayerCount reached', () => {
    const scene = useDocumentStore.getState().getScene()!;
    scene.rules.maxLayerCount = 1;
    useDocumentStore.getState().updateScene(() => scene);

    const cmd = new BooleanOperationCommand(['r1', 'r2'], 'union');
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('RULE_MAX_LAYER_EXCEEDED');
  });

  it('operates on circles correctly', () => {
    const scene = makeScene();
    const c1 = makeCircle('c1', 50, 50, 40);
    const c2 = makeCircle('c2', 80, 50, 40);
    scene.elements = [c1, c2];
    useDocumentStore.getState().loadScene(scene);

    const cmd = new BooleanOperationCommand(['c1', 'c2'], 'union');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);
  });

  it('operates on rect and circle', () => {
    const scene = makeScene();
    const r1 = makeRect('r1', 0, 0, 100, 100);
    const c1 = makeCircle('c1', 50, 50, 60);
    scene.elements = [r1, c1];
    useDocumentStore.getState().loadScene(scene);

    const cmd = new BooleanOperationCommand(['r1', 'c1'], 'intersect');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);
  });
});
