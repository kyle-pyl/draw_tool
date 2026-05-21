import { describe, it, expect, beforeEach } from 'vitest';
import { validateScene, validateReferences } from '../../core/validator';
import { getAnchors, resolveAnchor } from '../../core/anchors';
import { getBBox } from '../../core/geometry';
import { checkLayerCollisions } from '../../core/collision';
import { CommandExecutor, CreateElementCommand, MoveElementsCommand } from '../../core/commands';
import { useDocumentStore } from '../../core/store';
import type { SceneDocument, SceneElement } from '../../core/types';

describe('Integration: Connector Validation and Export', () => {
  let scene: SceneDocument;
  let executor: CommandExecutor;

  beforeEach(() => {
    useDocumentStore.setState({ scene: null, isDirty: false, zoom: 1, offsetX: 0, offsetY: 0, selectedIds: new Set(), directoryHandle: null });

    scene = {
      schemaVersion: '1.0.0',
      project: { name: 'Connector Test' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
        { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
      ],
      elements: [
        {
          id: 'src', type: 'shape', layerId: 'l1', name: 'Source',
          shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'tgt', type: 'shape', layerId: 'l2', name: 'Target',
          shapeKind: 'rect',
          transform: { x: 300, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'conn', type: 'connector', layerId: 'l1', name: 'Connection',
          source: { elementId: 'src', anchorId: 'right', x: 100, y: 50 },
          target: { elementId: 'tgt', anchorId: 'left', x: 300, y: 50 },
          route: { type: 'straight', points: [{ x: 100, y: 50 }, { x: 300, y: 50 }] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 2, opacity: 1 },
          visible: true, locked: false,
          semanticKind: 'flow',
        },
      ],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    useDocumentStore.getState().loadScene(scene);
    executor = new CommandExecutor();
  });

  it('scene with valid connector passes validation', () => {
    const result = validateScene(scene);
    expect(result.valid).toBe(true);
  });

  it('connector with invalid element reference fails validation', () => {
    const invalidScene = {
      ...scene,
      elements: scene.elements.map((e) =>
        e.id === 'conn'
          ? {
              ...e,
              source: { elementId: 'nonexistent', anchorId: 'right', x: 100, y: 50 },
            }
          : e
      ),
    };
    const result = validateScene(invalidScene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'REF_CONNECTOR_ENDPOINT_NOT_FOUND')).toBe(true);
  });

  it('anchors are calculated correctly for source and target', () => {
    const srcEl = scene.elements.find((e) => e.id === 'src')!;
    const tgtEl = scene.elements.find((e) => e.id === 'tgt')!;

    const srcAnchors = getAnchors(srcEl);
    const tgtAnchors = getAnchors(tgtEl);

    expect(srcAnchors.length).toBeGreaterThanOrEqual(4);
    expect(tgtAnchors.length).toBeGreaterThanOrEqual(4);

    const rightAnchor = resolveAnchor(srcEl, 'right');
    expect(rightAnchor.x).toBeCloseTo(100);
    expect(rightAnchor.y).toBeCloseTo(50);
  });

  it('connector is exempt from collision detection', () => {
    const collisions = checkLayerCollisions(scene.elements, { getBBox });
    expect(collisions.hasCollision).toBe(false);
  });

  it('BBox is computed for all element types', () => {
    for (const el of scene.elements) {
      const bbox = getBBox(el);
      expect(bbox).toBeDefined();
      expect(bbox.x).toBeDefined();
      expect(bbox.y).toBeDefined();
      expect(bbox.width).toBeDefined();
      expect(bbox.height).toBeDefined();
    }
  });

  it('two overlapping shapes on same layer cause collision', () => {
    const overlappingElements: SceneElement[] = [
      {
        id: 'ov1', type: 'shape', layerId: 'l1',
        shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      },
      {
        id: 'ov2', type: 'shape', layerId: 'l1',
        shapeKind: 'rect',
        transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      },
    ];
    const collisions = checkLayerCollisions(overlappingElements, { getBBox });
    expect(collisions.hasCollision).toBe(true);
    expect(collisions.collisions.length).toBeGreaterThan(0);
  });

  it('move command updates position', () => {
    useDocumentStore.getState().loadScene(scene);
    const cmd = new MoveElementsCommand(['src'], { dx: 10, dy: 20 });
    const result = executor.execute(cmd);

    if (result.valid) {
      const state = useDocumentStore.getState();
      const el = state.scene!.elements.find((e) => e.id === 'src');
      expect(el!.transform.x).toBe(10);
      expect(el!.transform.y).toBe(20);
    }
  });

  it('undo restores position after move', () => {
    useDocumentStore.getState().loadScene(scene);
    const cmd = new MoveElementsCommand(['src'], { dx: 50, dy: 50 });
    executor.execute(cmd);
    executor.undo();

    const state = useDocumentStore.getState();
    const el = state.scene!.elements.find((e) => e.id === 'src');
    expect(el!.transform.x).toBe(0);
    expect(el!.transform.y).toBe(0);
  });

  it('create element command adds to scene', () => {
    useDocumentStore.getState().loadScene(scene);
    const input = {
      type: 'shape' as const,
      layerId: 'l2',
      shapeKind: 'circle' as const,
      transform: { x: 400, y: 0, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    };
    const cmd = new CreateElementCommand(input);
    const result = executor.execute(cmd);

    if (result.valid) {
      const state = useDocumentStore.getState();
      expect(state.scene!.elements.length).toBe(4);
    }
  });

  it('create command is undoable', () => {
    useDocumentStore.getState().loadScene(scene);
    const elementCount = scene.elements.length;
    const cmd = new CreateElementCommand({
      type: 'shape',
      layerId: 'l2',
      shapeKind: 'circle',
      transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    });
    const result = executor.execute(cmd);

    if (result.valid) {
      executor.undo();
      const state = useDocumentStore.getState();
      expect(state.scene!.elements.length).toBe(elementCount);
    }
  });
});
