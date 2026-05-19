import { describe, it, expect, beforeEach } from 'vitest';
import { CommandExecutor, CreateElementCommand, MoveElementsCommand } from '../../core/commands';
import type { SceneCommand, CommandHistoryEntry, ElementInput } from '../../core/commands';
import type { SceneDocument } from '../../core/types';
import { successResult, failureResult } from '../../core/errors';
import { useDocumentStore } from '../../core/store';
import type { Transform2D, ElementStyle } from '../../core/types';

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

describe('SceneCommand interface', () => {
  it('a command has id, label, validate, execute, invert', () => {
    const cmd: SceneCommand = {
      id: 'test',
      label: 'Test Command',
      validate: () => successResult(),
      execute: (s) => s,
      invert: () => null,
    };
    expect(cmd.id).toBe('test');
    expect(cmd.label).toBe('Test Command');
    expect(cmd.validate).toBeInstanceOf(Function);
    expect(cmd.execute).toBeInstanceOf(Function);
    expect(cmd.invert).toBeInstanceOf(Function);
  });
});

describe('CommandExecutor', () => {
  let executor: CommandExecutor;
  const scene = makeScene();

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(scene));
  });

  it('initializes with empty history and redo stacks', () => {
    expect(executor.canUndo()).toBe(false);
    expect(executor.canRedo()).toBe(false);
    expect(executor.getHistory()).toEqual([]);
  });

  it('execute runs a command and pushes to history', () => {
    const cmd: SceneCommand = {
      id: 'cmd1',
      label: 'Set Name',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'Executed' } }),
      invert: () => null,
    };

    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('Executed');
    expect(executor.canUndo()).toBe(true);
    expect(executor.canRedo()).toBe(false);
    expect(executor.getHistory()).toHaveLength(1);
    expect(executor.getHistory()[0].command.id).toBe('cmd1');
  });

  it('execute fails validation without modifying state', () => {
    const cmd: SceneCommand = {
      id: 'bad',
      label: 'Bad Command',
      validate: () => failureResult({ code: 'ERR', message: 'Validation failed', severity: 'error' }),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'Should Not Update' } }),
      invert: () => null,
    };

    const result = executor.execute(cmd);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('ERR');
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('Test');
    expect(executor.canUndo()).toBe(false);
    expect(executor.getHistory()).toHaveLength(0);
  });

  it('execute fails when no scene is loaded', () => {
    useDocumentStore.getState().loadScene(null as unknown as SceneDocument);
    // Simulate no scene by resetting the store
    useDocumentStore.setState({ scene: null });

    const cmd: SceneCommand = {
      id: 'cmd1',
      label: 'Test',
      validate: () => successResult(),
      execute: (s) => s,
      invert: () => null,
    };

    const result = executor.execute(cmd);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('COMMAND_NO_SCENE');
  });

  it('undo restores the pre-execution snapshot', () => {
    const cmd: SceneCommand = {
      id: 'cmd1',
      label: 'Set Name',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'Changed' } }),
      invert: () => null,
    };

    executor.execute(cmd);
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('Changed');

    const undone = executor.undo();
    expect(undone).toBe(true);
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('Test');
    expect(executor.canUndo()).toBe(false);
    expect(executor.canRedo()).toBe(true);
  });

  it('undo returns false when history is empty', () => {
    expect(executor.undo()).toBe(false);
  });

  it('redo re-executes the undone command', () => {
    const cmd: SceneCommand = {
      id: 'cmd1',
      label: 'Set Name',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'Changed' } }),
      invert: () => null,
    };

    executor.execute(cmd);
    executor.undo();
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('Test');

    const redone = executor.redo();
    expect(redone).toBe(true);
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('Changed');
    expect(executor.canUndo()).toBe(true);
    expect(executor.canRedo()).toBe(false);
  });

  it('redo returns false when redo stack is empty', () => {
    expect(executor.redo()).toBe(false);

    const cmd: SceneCommand = {
      id: 'cmd1',
      label: 'Set Name',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'X' } }),
      invert: () => null,
    };
    executor.execute(cmd);
    expect(executor.redo()).toBe(false);
  });

  it('redo clears after new execute', () => {
    const cmd: SceneCommand = {
      id: 'cmd1',
      label: 'Set Name A',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'A' } }),
      invert: () => null,
    };

    executor.execute(cmd);
    executor.undo();
    expect(executor.canRedo()).toBe(true);

    const cmd2: SceneCommand = {
      id: 'cmd2',
      label: 'Set Name B',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'B' } }),
      invert: () => null,
    };
    executor.execute(cmd2);
    expect(executor.canRedo()).toBe(false);
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('B');
  });

  it('supports multiple undo/redo cycles', () => {
    const makeCmd = (id: string, name: string): SceneCommand => ({
      id,
      label: `Set to ${name}`,
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name } }),
      invert: () => null,
    });

    executor.execute(makeCmd('a', 'A'));
    executor.execute(makeCmd('b', 'B'));
    executor.execute(makeCmd('c', 'C'));
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('C');

    executor.undo();
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('B');

    executor.undo();
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('A');

    executor.redo();
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('B');

    executor.redo();
    expect(useDocumentStore.getState().getScene()?.project.name).toBe('C');
  });

  it('history respects maxHistory limit', () => {
    const smallExecutor = new CommandExecutor(3);

    const makeCmd = (id: string): SceneCommand => ({
      id,
      label: `Command ${id}`,
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, description: id } }),
      invert: () => null,
    });

    // Need scene loaded for the small executor too
    useDocumentStore.getState().loadScene(structuredClone(scene));

    smallExecutor.execute(makeCmd('c1'));
    smallExecutor.execute(makeCmd('c2'));
    smallExecutor.execute(makeCmd('c3'));
    smallExecutor.execute(makeCmd('c4'));
    smallExecutor.execute(makeCmd('c5'));

    expect(smallExecutor.getHistory()).toHaveLength(3);
    expect(smallExecutor.getHistory()[0].command.id).toBe('c3');
    expect(smallExecutor.getHistory()[2].command.id).toBe('c5');

    // Undo should only go back through the 3 kept commands
    expect(smallExecutor.undo()).toBe(true);
    expect(smallExecutor.undo()).toBe(true);
    expect(smallExecutor.undo()).toBe(true);
    expect(smallExecutor.undo()).toBe(false);
  });

  it('getHistory returns a read-only view', () => {
    const cmd: SceneCommand = {
      id: 'test',
      label: 'Test',
      validate: () => successResult(),
      execute: (s) => s,
      invert: () => null,
    };
    executor.execute(cmd);
    const history = executor.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].command.id).toBe('test');
    expect(history[0].snapshot).toBeDefined();
  });

  it('snapshot in history is the scene state before execution', () => {
    const initialName = 'Initial';
    useDocumentStore.getState().loadScene({
      ...structuredClone(scene),
      project: { name: initialName },
    });

    const cmd: SceneCommand = {
      id: 'test',
      label: 'Change Name',
      validate: () => successResult(),
      execute: (s) => ({ ...s, project: { ...s.project, name: 'Changed' } }),
      invert: () => null,
    };

    executor.execute(cmd);
    const entry = executor.getHistory()[0];
    expect(entry.snapshot.project.name).toBe(initialName);
  });

  it('canUndo and canRedo reflect correct state', () => {
    const cmd: SceneCommand = {
      id: 'test',
      label: 'Test',
      validate: () => successResult(),
      execute: (s) => s,
      invert: () => null,
    };

    expect(executor.canUndo()).toBe(false);
    expect(executor.canRedo()).toBe(false);

    executor.execute(cmd);
    expect(executor.canUndo()).toBe(true);
    expect(executor.canRedo()).toBe(false);

    executor.undo();
    expect(executor.canUndo()).toBe(false);
    expect(executor.canRedo()).toBe(true);

    executor.redo();
    expect(executor.canUndo()).toBe(true);
    expect(executor.canRedo()).toBe(false);
  });
});

// ─── T-05-02 CreateElementCommand Tests ─────────────────────────────────────

const defaultTransform: Transform2D = { x: 100, y: 100, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 };
const defaultStyle: ElementStyle = { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 };

function makeSceneWithLayers(): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
    rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
    layers: [
      { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
      { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
    ],
    elements: [],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

describe('CreateElementCommand', () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeSceneWithLayers()));
  });

  it('creates a shape element on the target layer', () => {
    const input: ElementInput = {
      type: 'shape',
      layerId: 'l1',
      shapeKind: 'rect',
      name: 'MyRect',
      transform: { ...defaultTransform },
      style: { ...defaultStyle },
    };

    const cmd = new CreateElementCommand(input, 'Create Rectangle');
    const result = executor.execute(cmd);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0].type).toBe('shape');
    expect((scene.elements[0] as any).shapeKind).toBe('rect');
    expect(scene.elements[0].name).toBe('MyRect');
    expect(scene.elements[0].layerId).toBe('l1');
  });

  it('creates a text element', () => {
    const input: ElementInput = {
      type: 'text',
      layerId: 'l1',
      text: 'Hello World',
      transform: { ...defaultTransform },
      style: { ...defaultStyle, fontSize: 16 },
    };

    executor.execute(new CreateElementCommand(input));
    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0].type).toBe('text');
    expect((scene.elements[0] as any).text).toBe('Hello World');
  });

  it('creates an image element', () => {
    const input: ElementInput = {
      type: 'image',
      layerId: 'l1',
      src: 'blob:test',
      transform: { x: 0, y: 0, width: 200, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    };

    executor.execute(new CreateElementCommand(input));
    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0].type).toBe('image');
    expect((scene.elements[0] as any).src).toBe('blob:test');
  });

  it('fails when target layer does not exist', () => {
    const input: ElementInput = {
      type: 'shape',
      layerId: 'nonexistent',
      shapeKind: 'rect',
      transform: { ...defaultTransform },
      style: { ...defaultStyle },
    };

    const cmd = new CreateElementCommand(input);
    const result = executor.execute(cmd);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('REF_LAYER_NOT_FOUND');
    expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(0);
  });

  it('fails when new element overlaps existing element in same layer', () => {
    // First create an element
    const input1: ElementInput = {
      type: 'shape',
      layerId: 'l1',
      shapeKind: 'rect',
      transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    };
    executor.execute(new CreateElementCommand(input1));

    // Try to create overlapping element
    const input2: ElementInput = {
      type: 'shape',
      layerId: 'l1',
      shapeKind: 'circle',
      transform: { x: 75, y: 75, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    };
    const cmd2 = new CreateElementCommand(input2);
    const result = executor.execute(cmd2);

    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('GEO_SAME_LAYER_OVERLAP');
    expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(1);
  });

  it('allows creation on different layers even with overlap', () => {
    const input1: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { ...defaultTransform }, style: { ...defaultStyle },
    };
    executor.execute(new CreateElementCommand(input1));

    const input2: ElementInput = {
      type: 'shape', layerId: 'l2', shapeKind: 'circle',
      transform: { ...defaultTransform }, style: { ...defaultStyle },
    };
    const result = executor.execute(new CreateElementCommand(input2));

    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(2);
  });

  it('undo removes the created element', () => {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { ...defaultTransform }, style: { ...defaultStyle },
    };

    executor.execute(new CreateElementCommand(input));
    expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(1);

    const undone = executor.undo();
    expect(undone).toBe(true);
    expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(0);
  });

  it('redo recreates the undone element', () => {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { ...defaultTransform }, style: { ...defaultStyle },
    };

    executor.execute(new CreateElementCommand(input));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(0);

    const redone = executor.redo();
    expect(redone).toBe(true);
    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0].type).toBe('shape');
  });

  it('generates unique IDs for each created element', () => {
    executor.execute(new CreateElementCommand({
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    }));
    executor.execute(new CreateElementCommand({
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { x: 100, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    }));
    executor.execute(new CreateElementCommand({
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { x: 200, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    }));

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements).toHaveLength(3);
    const ids = scene.elements.map((e) => e.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('creates with default visible and locked values', () => {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect',
      transform: { ...defaultTransform }, style: { ...defaultStyle },
    };

    executor.execute(new CreateElementCommand(input));
    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.visible).toBe(true);
    expect(el.locked).toBe(false);
  });
});

// ─── T-05-03 MoveElementsCommand Tests ──────────────────────────────────────

describe('MoveElementsCommand', () => {
  let executor: CommandExecutor;

  function populateScene() {
    const scene = makeSceneWithLayers();
    useDocumentStore.getState().loadScene(structuredClone(scene));

    // Add three non-overlapping elements
    const inputs: ElementInput[] = [
      { type: 'shape', layerId: 'l1', shapeKind: 'rect', name: 'A',
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...defaultStyle } },
      { type: 'shape', layerId: 'l1', shapeKind: 'circle', name: 'B',
        transform: { x: 100, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...defaultStyle } },
      { type: 'text', layerId: 'l1', text: 'Label', name: 'C',
        transform: { x: 0, y: 100, width: 80, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...defaultStyle } },
    ];

    const elIds: string[] = [];
    for (const input of inputs) {
      const cmd = new CreateElementCommand(input);
      executor.execute(cmd);
      const el = useDocumentStore.getState().getScene()!.elements.at(-1)!;
      elIds.push(el.id);
    }

    return elIds;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
  });

  it('moves a single element by delta', () => {
    const [idA] = populateScene();
    const el = useDocumentStore.getState().getScene()!.elements[0];
    const origX = el.transform.x;
    const origY = el.transform.y;

    const cmd = new MoveElementsCommand([idA], { dx: 50, dy: 30 });
    const result = executor.execute(cmd);

    expect(result.valid).toBe(true);
    const moved = useDocumentStore.getState().getScene()!.elements[0];
    expect(moved.transform.x).toBe(origX + 50);
    expect(moved.transform.y).toBe(origY + 30);
  });

  it('moves multiple elements by the same delta', () => {
    const [idA, idB, idC] = populateScene();

    const cmd = new MoveElementsCommand([idA, idB, idC], { dx: 10, dy: 20 });
    executor.execute(cmd);

    const scene = useDocumentStore.getState().getScene()!;
    for (const el of scene.elements.slice(0, 3)) {
      if (el.name === 'A') { expect(el.transform.x).toBe(10); expect(el.transform.y).toBe(20); }
      if (el.name === 'B') { expect(el.transform.x).toBe(110); expect(el.transform.y).toBe(20); }
      if (el.name === 'C') { expect(el.transform.x).toBe(10); expect(el.transform.y).toBe(120); }
    }
  });

  it('fails when moving into overlapping position', () => {
    const [idA, idB] = populateScene();
    // Move A to exactly overlap B
    const cmd = new MoveElementsCommand([idA], { dx: 100, dy: 0 });
    const result = executor.execute(cmd);

    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
  });

  it('fails when element is locked', () => {
    const [idA] = populateScene();
    // Lock element A
    useDocumentStore.getState().updateScene((s) => ({
      ...s,
      elements: s.elements.map((el) => el.id === idA ? { ...el, locked: true } : el),
    }));

    const cmd = new MoveElementsCommand([idA], { dx: 10, dy: 10 });
    const result = executor.execute(cmd);

    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
  });

  it('fails when element does not exist', () => {
    populateScene();
    const cmd = new MoveElementsCommand(['nonexistent'], { dx: 10, dy: 10 });
    const result = executor.execute(cmd);

    expect(result.valid).toBe(false);
  });

  it('undo restores original position', () => {
    const [idA] = populateScene();
    const origX = useDocumentStore.getState().getScene()!.elements[0].transform.x;

    executor.execute(new MoveElementsCommand([idA], { dx: 50, dy: 30 }));
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX + 50);

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX);
  });

  it('redo re-applies the move', () => {
    const [idA] = populateScene();
    const origX = useDocumentStore.getState().getScene()!.elements[0].transform.x;

    executor.execute(new MoveElementsCommand([idA], { dx: 50, dy: 30 }));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX + 50);
  });

  it('undo then redo multiple moves', () => {
    const [idA] = populateScene();
    const origX = useDocumentStore.getState().getScene()!.elements[0].transform.x;

    executor.execute(new MoveElementsCommand([idA], { dx: 10, dy: 0 }));
    executor.execute(new MoveElementsCommand([idA], { dx: 20, dy: 0 }));
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX + 30);

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX + 10);

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX + 10);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.x).toBe(origX + 30);
  });

  it('moves connector endpoints that reference moved elements', () => {
    const scene = makeSceneWithLayers();
    useDocumentStore.getState().loadScene(structuredClone(scene));

    const shapeCmd = new CreateElementCommand({
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name: 'Shape',
      transform: { x: 100, y: 100, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
    });
    executor.execute(shapeCmd);
    const sceneAfterShape = useDocumentStore.getState().getScene()!;
    const shapeId = sceneAfterShape.elements[0].id;

    const connCmd = new CreateElementCommand({
      type: 'connector', layerId: 'l1', name: 'Conn',
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { ...defaultStyle },
      source: { elementId: shapeId, x: 100, y: 125 },
      target: { x: 200, y: 125 },
    });
    executor.execute(connCmd);

    const sceneBeforeMove = useDocumentStore.getState().getScene()!;
    const connBefore = sceneBeforeMove.elements.find((el) => el.type === 'connector');
    expect(connBefore).toBeDefined();

    const moveCmd = new MoveElementsCommand([shapeId], { dx: 50, dy: 30 });
    executor.execute(moveCmd);

    const sceneAfterMove = useDocumentStore.getState().getScene()!;
    const connAfter = sceneAfterMove.elements.find((el) => el.type === 'connector')! as any;
    expect(connAfter.source.x).toBe(150);
    expect(connAfter.source.y).toBe(155);
  });
});
