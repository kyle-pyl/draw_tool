import { describe, it, expect, beforeEach } from 'vitest';
import { CommandExecutor, ClipElementCommand } from '../../core/commands';
import { useDocumentStore } from '../../core/store';
import type { SceneDocument, ShapeElement, ImageElement } from '../../core/types';

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

function makeImage(id: string, x: number, y: number, w: number, h: number, layerId = 'l1'): ImageElement {
  return {
    id,
    type: 'image',
    layerId,
    name: `img-${id}`,
    transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: 'none', stroke: 'none', strokeWidth: 0, opacity: 1 },
    src: 'data:image/png;base64,test',
    originalWidth: w,
    originalHeight: h,
    visible: true,
    locked: false,
  };
}

describe('ClipElementCommand', () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    executor = new CommandExecutor();
  });

  // ── Shape clipping tests ──

  describe('shape clipping', () => {
    beforeEach(() => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      const clip = makeRect('clip', 50, 50, 100, 100);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(structuredClone(scene));
    });

    it('constructor assigns id and label', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      expect(cmd.id).toMatch(/^clip_/);
      expect(cmd.label).toBe('Clip element');
    });

    it('constructor accepts custom label', () => {
      const cmd = new ClipElementCommand('target', 'clip', true, 'Custom Clip');
      expect(cmd.label).toBe('Custom Clip');
    });

    it('clip shape is removed by default after clipping', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(1);
      expect(scene.elements[0].id).toBe('target');
      expect(scene.elements[0].shapeKind).toBe('path');
    });

    it('clip shape is kept when removeClipShape is false', () => {
      const cmd = new ClipElementCommand('target', 'clip', false);
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(2);
    });

    it('clipped shape has path geometry', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      executor.execute(cmd);

      const scene = useDocumentStore.getState().getScene()!;
      const resultEl = scene.elements[0];
      expect(resultEl.type).toBe('shape');
      expect(resultEl.shapeKind).toBe('path');
      expect(resultEl.pathCommands).toBeTruthy();
      expect((resultEl.pathCommands || '').length).toBeGreaterThan(10);
    });

    it('undo restores original elements', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      executor.execute(cmd);

      expect(executor.canUndo()).toBe(true);
      const undone = executor.undo();
      expect(undone).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(2);
      const target = scene.elements.find((e) => e.id === 'target');
      expect(target).toBeDefined();
      expect(target!.shapeKind).toBe('rect');
      const clipEl = scene.elements.find((e) => e.id === 'clip');
      expect(clipEl).toBeDefined();
    });

    it('redo re-applies clip after undo', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      executor.execute(cmd);
      executor.undo();

      expect(executor.canRedo()).toBe(true);
      const redone = executor.redo();
      expect(redone).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(1);
      expect(scene.elements[0].shapeKind).toBe('path');
    });

    it('circle clips rectangle', () => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      const clip = makeCircle('clip', 50, 50, 40);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 'clip');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const s = useDocumentStore.getState().getScene()!;
      expect(s.elements[0].shapeKind).toBe('path');
      expect(s.elements[0].pathCommands).toBeTruthy();
    });

    it('non-overlapping clip produces hidden empty element', () => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      const clip = makeRect('clip', 200, 200, 100, 100);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 'clip');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const s = useDocumentStore.getState().getScene()!;
      expect(s.elements.length).toBe(1);
      expect(s.elements[0].id).toBe('target');
      expect(s.elements[0].visible).toBe(false);
      expect(s.elements[0].pathCommands).toBe('');
    });

    it('undo restores after non-overlapping clip', () => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      const clip = makeRect('clip', 200, 200, 100, 100);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 'clip');
      executor.execute(cmd);
      executor.undo();

      const s = useDocumentStore.getState().getScene()!;
      expect(s.elements.length).toBe(2);
      const restored = s.elements.find((e) => e.id === 'target');
      expect(restored!.visible).toBe(true);
      expect(restored!.shapeKind).toBe('rect');
    });

    it('fully enclosed target keeps shape clip', () => {
      const scene = makeScene();
      const target = makeRect('target', 20, 20, 60, 60);
      const clip = makeRect('clip', 0, 0, 100, 100);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 'clip');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const s = useDocumentStore.getState().getScene()!;
      expect(s.elements.length).toBe(1);
      expect(s.elements[0].shapeKind).toBe('path');
      expect((s.elements[0].pathCommands || '').length).toBeGreaterThan(0);
    });
  });

  // ── Image clipping tests ──

  describe('image clipping', () => {
    beforeEach(() => {
      const scene = makeScene();
      const img = makeImage('img1', 0, 0, 200, 150);
      const clip = makeRect('clip1', 25, 25, 100, 100);
      scene.elements = [img, clip];
      useDocumentStore.getState().loadScene(structuredClone(scene));
    });

    it('image clipping stores clipSvgPath in metadata', () => {
      const cmd = new ClipElementCommand('img1', 'clip1');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const img = scene.elements.find((e) => e.id === 'img1') as ImageElement;
      expect(img.metadata).toBeDefined();
      expect(img.metadata!.clipShapeId).toBe('clip1');
      expect(typeof img.metadata!.clipSvgPath).toBe('string');
      expect((img.metadata!.clipSvgPath as string).startsWith('M ')).toBe(true);
    });

    it('image clipping removes clip shape by default', () => {
      const cmd = new ClipElementCommand('img1', 'clip1');
      executor.execute(cmd);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(1);
      expect(scene.elements[0].id).toBe('img1');
    });

    it('image clipping keeps clip shape when removeClipShape is false', () => {
      const cmd = new ClipElementCommand('img1', 'clip1', false);
      executor.execute(cmd);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(2);
    });

    it('image clipping undo restores original state', () => {
      const cmd = new ClipElementCommand('img1', 'clip1');
      executor.execute(cmd);

      expect(executor.canUndo()).toBe(true);
      executor.undo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(2);
      const img = scene.elements.find((e) => e.id === 'img1') as ImageElement;
      expect(img.metadata?.clipSvgPath).toBeUndefined();
    });

    it('image clipping redo reapplies clip', () => {
      const cmd = new ClipElementCommand('img1', 'clip1');
      executor.execute(cmd);
      executor.undo();

      expect(executor.canRedo()).toBe(true);
      executor.redo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.length).toBe(1);
      const img = scene.elements.find((e) => e.id === 'img1') as ImageElement;
      expect(img.metadata?.clipSvgPath).toBeDefined();
    });
  });

  // ── Validation failure tests ──

  describe('validation failures', () => {
    it('fails when target element not found', () => {
      const scene = makeScene();
      const clip = makeRect('clip', 0, 0, 100, 100);
      scene.elements = [clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('nonexistent', 'clip');
      const result = cmd.validate(scene);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
    });

    it('fails when clip shape not found', () => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      scene.elements = [target];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 'nonexistent');
      const result = cmd.validate(scene);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
    });

    it('fails when target is locked', () => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      target.locked = true;
      const clip = makeRect('clip', 50, 50, 100, 100);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 'clip');
      const result = cmd.validate(scene);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
    });

    it('fails when target is not shape or image', () => {
      const scene = makeScene();
      const target = {
        id: 't1',
        type: 'text',
        text: 'hello',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
        visible: true,
        locked: false,
      } as any;
      const clip = makeRect('clip', 50, 50, 100, 100);
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('t1', 'clip');
      const result = cmd.validate(scene);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('SCHEMA_INVALID_TYPE');
    });

    it('fails when clip shape is not a shape', () => {
      const scene = makeScene();
      const target = makeRect('target', 0, 0, 100, 100);
      const clip = {
        id: 't1',
        type: 'text',
        text: 'hello',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
        visible: true,
        locked: false,
      } as any;
      scene.elements = [target, clip];
      useDocumentStore.getState().loadScene(scene);

      const cmd = new ClipElementCommand('target', 't1');
      const result = cmd.validate(scene);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('SCHEMA_INVALID_TYPE');
    });
  });

  // ── Getters tests ──

  describe('getters', () => {
    it('getTargetElementId returns target id', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      expect(cmd.getTargetElementId()).toBe('target');
    });

    it('getClipShapeId returns clip shape id', () => {
      const cmd = new ClipElementCommand('target', 'clip');
      expect(cmd.getClipShapeId()).toBe('clip');
    });
  });
});
