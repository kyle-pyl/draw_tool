import { describe, it, expect, beforeEach } from 'vitest';
import { validateScene } from '../../core/validator';
import { useDocumentStore } from '../../core/store';
import { exportProjectToZip } from '../../io/exporters';
import type { SceneDocument } from '../../core/types';

const sampleScene: SceneDocument = {
  schemaVersion: '1.0.0',
  project: { name: 'Integration Test', author: 'test', updatedAt: new Date().toISOString() },
  canvas: { units: 'px', background: '#ffffff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
  rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
  layers: [
    { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
    { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
  ],
  elements: [
    {
      id: 'e1', type: 'shape', layerId: 'l1', name: 'Rect',
      shapeKind: 'rect',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 1 },
      visible: true, locked: false,
    },
    {
      id: 'e2', type: 'text', layerId: 'l2', name: 'Text',
      text: 'Hello World',
      transform: { x: 200, y: 100, width: 200, height: 40, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 16 },
      visible: true, locked: false,
    },
  ],
  groups: [],
  dataSources: [],
  charts: [],
  templates: [],
  exportPresets: [],
};

describe('Integration: Open and Save Project', () => {
  beforeEach(() => {
    useDocumentStore.setState({ scene: null, isDirty: false, zoom: 1, offsetX: 0, offsetY: 0, selectedIds: new Set(), directoryHandle: null });
  });

  it('validates a valid sample scene', () => {
    const result = validateScene(sampleScene);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('loads scene without marking as dirty', () => {
    useDocumentStore.getState().loadScene(sampleScene);
    const state = useDocumentStore.getState();
    expect(state.scene).not.toBeNull();
    expect(state.scene!.project.name).toBe('Integration Test');
    expect(state.scene!.elements.length).toBe(2);
    expect(state.isDirty).toBe(false);
  });

  it('loads JSON via parse + loadScene flow', () => {
    const json = JSON.stringify(sampleScene);
    const parsed = JSON.parse(json);
    const result = validateScene(parsed);
    expect(result.valid).toBe(true);

    useDocumentStore.getState().loadScene(parsed as SceneDocument);
    const state = useDocumentStore.getState();
    expect(state.scene!.layers.length).toBe(2);
  });

  it('updateScene marks as dirty, markClean resets', () => {
    useDocumentStore.getState().loadScene(sampleScene);
    useDocumentStore.getState().updateScene((s) => ({ ...s, project: { ...s.project, name: 'Changed' } }));
    expect(useDocumentStore.getState().isDirty).toBe(true);
    useDocumentStore.getState().markClean();
    expect(useDocumentStore.getState().isDirty).toBe(false);
  });

  it('exportProjectToZip produces a valid ZIP', async () => {
    useDocumentStore.getState().loadScene(sampleScene);
    const blob = await exportProjectToZip();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/zip');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('round-trip: JSON serialize then validate', () => {
    useDocumentStore.getState().loadScene(sampleScene);
    const scene = useDocumentStore.getState().scene!;
    const json = JSON.stringify(scene);
    const parsed = JSON.parse(json);
    const result = validateScene(parsed);
    expect(result.valid).toBe(true);
  });

  it('invalid JSON object fails validation', () => {
    const result = validateScene({ notA: 'scene' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('incomplete scene fails validation', () => {
    const result = validateScene({ schemaVersion: '1.0.0' });
    expect(result.valid).toBe(false);
  });

  it('updateScene triggers re-render state', () => {
    useDocumentStore.getState().loadScene(sampleScene);
    useDocumentStore.getState().updateScene((s) => ({
      ...s,
      project: { ...s.project, name: 'Updated' },
    }));
    expect(useDocumentStore.getState().scene!.project.name).toBe('Updated');
    expect(useDocumentStore.getState().isDirty).toBe(true);
  });

  it('supports multiple elements across layers', () => {
    useDocumentStore.getState().loadScene(sampleScene);
    const el1 = useDocumentStore.getState().scene!.elements.find((e) => e.id === 'e1');
    const el2 = useDocumentStore.getState().scene!.elements.find((e) => e.id === 'e2');
    expect(el1!.layerId).toBe('l1');
    expect(el2!.layerId).toBe('l2');
  });
});
