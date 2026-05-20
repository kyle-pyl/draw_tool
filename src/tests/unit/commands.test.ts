import { describe, it, expect, beforeEach } from 'vitest';
import { CommandExecutor, CreateElementCommand, MoveElementsCommand, UpdateElementCommand, ChangeLayerCommand, TransformElementsCommand, GroupElementsCommand, UngroupCommand, AddToGroupCommand, RemoveFromGroupCommand } from '../../core/commands';
import type { SceneCommand, CommandHistoryEntry, ElementInput, ElementChanges, TransformParams } from '../../core/commands';
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

// ─── T-05-04 UpdateElementCommand Tests ──────────────────────────────────────

describe('UpdateElementCommand', () => {
  let executor: CommandExecutor;

  function createShape(name = 'Rect') {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  function createShapeAt(x: number, y: number, name = 'Rect') {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x, y, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeSceneWithLayers()));
  });

  it('updates element style properties', () => {
    const id = createShape();
    const cmd = new UpdateElementCommand(id, {
      style: { fill: '#ff0000', strokeWidth: 5 },
    });

    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);
    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.style.fill).toBe('#ff0000');
    expect(el.style.strokeWidth).toBe(5);
    expect(el.style.stroke).toBe('#000'); // unchanged
    expect(el.style.opacity).toBe(1);
  });

  it('updates element name', () => {
    const id = createShape();
    const cmd = new UpdateElementCommand(id, { name: 'NewName' });
    executor.execute(cmd);
    expect(useDocumentStore.getState().getScene()!.elements[0].name).toBe('NewName');
  });

  it('updates element visible and locked', () => {
    const id = createShape();
    executor.execute(new UpdateElementCommand(id, { visible: false, locked: true }));
    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.visible).toBe(false);
    expect(el.locked).toBe(true);
  });

  it('updates text content', () => {
    const input: ElementInput = {
      type: 'text', layerId: 'l1', text: 'Hello',
      transform: { x: 100, y: 100, width: 80, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
    };
    executor.execute(new CreateElementCommand(input));
    const id = useDocumentStore.getState().getScene()!.elements.at(-1)!.id;

    executor.execute(new UpdateElementCommand(id, { text: 'World' }));
    const el = useDocumentStore.getState().getScene()!.elements.find((e: any) => e.text === 'World');
    expect(el).toBeDefined();
  });

  it('fails when element does not exist', () => {
    const cmd = new UpdateElementCommand('nonexistent', { style: { fill: '#f00' } });
    const result = executor.execute(cmd);
    expect(result.valid).toBe(false);
  });

  it('fails when editing a locked element', () => {
    const id = createShape();
    useDocumentStore.getState().updateScene((s) => ({
      ...s, elements: s.elements.map((el) => (el.id === id ? { ...el, locked: true } : el)),
    }));

    const result = executor.execute(new UpdateElementCommand(id, { style: { fill: '#f00' } }));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
  });

  it('fails when size change causes overlap', () => {
    const idA = createShapeAt(0, 0, 'A');
    const idB = createShapeAt(60, 0, 'B');

    // Resize A to overlap B
    const cmd = new UpdateElementCommand(idA, { transform: { width: 80 } });
    const result = executor.execute(cmd);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
  });

  it('allows size change that does not overlap', () => {
    const idA = createShapeAt(0, 0, 'A');
    createShapeAt(200, 0, 'B');

    const cmd = new UpdateElementCommand(idA, { transform: { width: 80 } });
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);
    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.transform.width).toBe(80);
  });

  it('undo restores original style', () => {
    const id = createShape();
    executor.execute(new UpdateElementCommand(id, { style: { fill: '#00ff00' } }));
    expect(useDocumentStore.getState().getScene()!.elements[0].style.fill).toBe('#00ff00');

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].style.fill).toBe('#fff');
  });

  it('redo restores updated style', () => {
    const id = createShape();
    executor.execute(new UpdateElementCommand(id, { style: { fill: '#00ff00' } }));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].style.fill).toBe('#fff');

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.elements[0].style.fill).toBe('#00ff00');
  });
});

// ─── T-05-05 ChangeLayerCommand Tests ──────────────────────────────────────

describe('ChangeLayerCommand', () => {
  let executor: CommandExecutor;

  function createShapeOnLayer(layerId: string, name: string, x = 0, y = 0) {
    const input: ElementInput = {
      type: 'shape', layerId, shapeKind: 'rect', name,
      transform: { x, y, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    executor.execute(new CreateElementCommand(input));
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeSceneWithLayers()));
  });

  it('moves an element to another layer', () => {
    const id = createShapeOnLayer('l1', 'RectA');
    expect(useDocumentStore.getState().getScene()!.elements[0].layerId).toBe('l1');

    const cmd = new ChangeLayerCommand([id], 'l2');
    const result = executor.execute(cmd);

    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().getScene()!.elements[0].layerId).toBe('l2');
  });

  it('moves multiple elements to the same layer', () => {
    const idA = createShapeOnLayer('l1', 'A');
    const idB = createShapeOnLayer('l1', 'B', 100);

    executor.execute(new ChangeLayerCommand([idA, idB], 'l2'));

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements[0].layerId).toBe('l2');
    expect(scene.elements[1].layerId).toBe('l2');
  });

  it('fails when target layer does not exist', () => {
    const id = createShapeOnLayer('l1', 'RectA');
    const result = executor.execute(new ChangeLayerCommand([id], 'nonexistent'));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('REF_LAYER_NOT_FOUND');
  });

  it('fails when element does not exist', () => {
    const result = executor.execute(new ChangeLayerCommand(['nonexistent'], 'l2'));
    expect(result.valid).toBe(false);
  });

  it('fails when moving into overlapping position in target layer', () => {
    const idA = createShapeOnLayer('l1', 'A');
    createShapeOnLayer('l2', 'B', 25, 25); // overlaps A's position

    const result = executor.execute(new ChangeLayerCommand([idA], 'l2'));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
  });

  it('allows connector to change layer without collision check', () => {
    createShapeOnLayer('l1', 'Shape', 50, 50);
    const connCmd = new CreateElementCommand({
      type: 'connector', layerId: 'l1', name: 'Conn',
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000', stroke: '#000', strokeWidth: 1, opacity: 1 },
      source: { x: 50, y: 75 },
      target: { x: 150, y: 75 },
    });
    executor.execute(connCmd);
    const connId = useDocumentStore.getState().getScene()!.elements[1].id;

    const result = executor.execute(new ChangeLayerCommand([connId], 'l2'));
    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().getScene()!.elements[1].layerId).toBe('l2');
  });

  it('fails when element is locked', () => {
    const id = createShapeOnLayer('l1', 'RectA');
    useDocumentStore.getState().updateScene((s) => ({
      ...s, elements: s.elements.map((el) => (el.id === id ? { ...el, locked: true } : el)),
    }));

    const result = executor.execute(new ChangeLayerCommand([id], 'l2'));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
  });

  it('undo returns elements to original layers', () => {
    const id = createShapeOnLayer('l1', 'RectA');
    executor.execute(new ChangeLayerCommand([id], 'l2'));
    expect(useDocumentStore.getState().getScene()!.elements[0].layerId).toBe('l2');

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].layerId).toBe('l1');
  });

  it('redo reapplies the layer change', () => {
    const id = createShapeOnLayer('l1', 'RectA');
    executor.execute(new ChangeLayerCommand([id], 'l2'));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].layerId).toBe('l1');

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.elements[0].layerId).toBe('l2');
  });
});

// ─── T-05-06 TransformElementsCommand Tests ─────────────────────────────────

describe('TransformElementsCommand', () => {
  let executor: CommandExecutor;

  function createShape(name: string, x: number, y: number, w = 50, h = 50) {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    executor.execute(new CreateElementCommand(input));
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeSceneWithLayers()));
  });

  it('scales an element', () => {
    const id = createShape('A', 0, 0);
    const cmd = new TransformElementsCommand([id], { scaleX: 2, scaleY: 2 });
    const result = executor.execute(cmd);

    expect(result.valid).toBe(true);
    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.transform.scaleX).toBe(2);
    expect(el.transform.scaleY).toBe(2);
  });

  it('rotates an element', () => {
    const id = createShape('A', 0, 0);
    executor.execute(new TransformElementsCommand([id], { rotation: 45 }));

    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.transform.rotation).toBe(45);
  });

  it('changes element dimensions', () => {
    const id = createShape('A', 0, 0);
    executor.execute(new TransformElementsCommand([id], { width: 100, height: 80 }));

    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.transform.width).toBe(100);
    expect(el.transform.height).toBe(80);
  });

  it('transforms multiple elements at once', () => {
    const idA = createShape('A', 0, 0);
    const idB = createShape('B', 100, 0);

    executor.execute(new TransformElementsCommand([idA, idB], { scaleX: 1.5 }));

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.elements[0].transform.scaleX).toBe(1.5);
    expect(scene.elements[1].transform.scaleX).toBe(1.5);
  });

  it('fails when element does not exist', () => {
    const result = executor.execute(new TransformElementsCommand(['nonexistent'], { scaleX: 2 }));
    expect(result.valid).toBe(false);
  });

  it('fails when element is locked', () => {
    const id = createShape('A', 0, 0);
    useDocumentStore.getState().updateScene((s) => ({
      ...s, elements: s.elements.map((el) => (el.id === id ? { ...el, locked: true } : el)),
    }));

    const result = executor.execute(new TransformElementsCommand([id], { scaleX: 2 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
  });

  it('fails when transform causes overlap', () => {
    const idA = createShape('A', 0, 0, 50, 50);
    createShape('B', 60, 60, 50, 50);

    // Scale A so it would overlap B
    const result = executor.execute(new TransformElementsCommand([idA], { width: 120, height: 120 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
  });

  it('undo restores original transform', () => {
    const id = createShape('A', 0, 0);
    executor.execute(new TransformElementsCommand([id], { scaleX: 3, rotation: 30 }));
    const el = useDocumentStore.getState().getScene()!.elements[0];
    expect(el.transform.scaleX).toBe(3);
    expect(el.transform.rotation).toBe(30);

    executor.undo();
    const restored = useDocumentStore.getState().getScene()!.elements[0];
    expect(restored.transform.scaleX).toBe(1);
    expect(restored.transform.rotation).toBe(0);
  });

  it('redo restores the transformed state', () => {
    const id = createShape('A', 0, 0);
    executor.execute(new TransformElementsCommand([id], { scaleX: 3 }));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.scaleX).toBe(1);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.elements[0].transform.scaleX).toBe(3);
  });
});

// ─── GroupElements Command ─────────────────────────────────────────────────────

describe('GroupElementsCommand', () => {
  let executor: CommandExecutor;

  function createShape(name: string, x: number, y: number, w = 50, h = 50) {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeScene()));
  });

  it('creates a group with given elements', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);

    const cmd = new GroupElementsCommand([id1, id2], 'Group 1');
    const result = executor.execute(cmd);
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups.length).toBe(1);
    expect(scene.groups[0].name).toBe('Group 1');
    expect(scene.groups[0].elementIds).toContain(id1);
    expect(scene.groups[0].elementIds).toContain(id2);
  });

  it('groups can span multiple layers', () => {
    useDocumentStore.getState().updateScene((s) => ({
      ...s,
      layers: [...s.layers, { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false }],
    }));

    const id1 = createShape('A', 0, 0);
    const cmd2 = new CreateElementCommand({
      type: 'shape', layerId: 'l2', shapeKind: 'rect', name: 'B',
      transform: { x: 100, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    });
    executor.execute(cmd2);
    const id2 = useDocumentStore.getState().getScene()!.elements.at(-1)!.id;

    const result = executor.execute(new GroupElementsCommand([id1, id2], 'CrossLayer'));
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups[0].elementIds).toHaveLength(2);
  });

  it('getGroupId returns the generated group id', () => {
    const id1 = createShape('A', 0, 0);
    const cmd = new GroupElementsCommand([id1], 'Test');
    expect(cmd.getGroupId()).toBeTruthy();
    expect(typeof cmd.getGroupId()).toBe('string');
  });

  it('fails validation with empty elementIds', () => {
    const cmd = new GroupElementsCommand([], 'Empty');
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('no elements');
  });

  it('fails validation with non-existent elements', () => {
    const cmd = new GroupElementsCommand(['nonexistent'], 'Bad');
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
  });

  it('undo removes the created group', () => {
    const id1 = createShape('A', 0, 0);
    executor.execute(new GroupElementsCommand([id1], 'G'));
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(1);

    const undone = executor.undo();
    expect(undone).toBe(true);
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(0);
  });

  it('redo restores the group after undo', () => {
    const id1 = createShape('A', 0, 0);
    executor.execute(new GroupElementsCommand([id1], 'G'));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(0);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(1);
  });
});

// ─── Ungroup Command ───────────────────────────────────────────────────────────

describe('UngroupCommand', () => {
  let executor: CommandExecutor;

  function createShape(name: string, x: number, y: number) {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x, y, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeScene()));
  });

  it('dissolves a group', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);

    const groupCmd = new GroupElementsCommand([id1, id2], 'G');
    executor.execute(groupCmd);
    const groupId = groupCmd.getGroupId();

    const ungroupCmd = new UngroupCommand(groupId);
    const result = executor.execute(ungroupCmd);
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups.length).toBe(0);
    // Elements should remain in the scene
    expect(scene.elements.length).toBe(2);
  });

  it('fails when group does not exist', () => {
    const cmd = new UngroupCommand('nonexistent');
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
  });

  it('undo restores the dissolved group', () => {
    const id1 = createShape('A', 0, 0);
    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);
    const groupId = groupCmd.getGroupId();

    executor.execute(new UngroupCommand(groupId));
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(0);

    executor.undo();
    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups.length).toBe(1);
    expect(scene.groups[0].name).toBe('G');
  });

  it('redo dissolves the group again', () => {
    const id1 = createShape('A', 0, 0);
    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);
    executor.execute(new UngroupCommand(groupCmd.getGroupId()));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(1);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.groups.length).toBe(0);
  });
});

// ─── AddToGroup Command ────────────────────────────────────────────────────────

describe('AddToGroupCommand', () => {
  let executor: CommandExecutor;

  function createShape(name: string, x: number, y: number) {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x, y, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeScene()));
  });

  it('adds elements to an existing group', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);
    const id3 = createShape('C', 200, 0);

    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);
    const groupId = groupCmd.getGroupId();

    const result = executor.execute(new AddToGroupCommand(groupId, [id2, id3]));
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups[0].elementIds).toHaveLength(3);
    expect(scene.groups[0].elementIds).toContain(id2);
    expect(scene.groups[0].elementIds).toContain(id3);
  });

  it('deduplicates already existing members', () => {
    const id1 = createShape('A', 0, 0);

    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);
    const groupId = groupCmd.getGroupId();

    executor.execute(new AddToGroupCommand(groupId, [id1]));
    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups[0].elementIds).toHaveLength(1);
  });

  it('fails when group does not exist', () => {
    const cmd = new AddToGroupCommand('nonexistent', ['e1']);
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
  });

  it('fails when element does not exist', () => {
    const id1 = createShape('A', 0, 0);
    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);

    const cmd = new AddToGroupCommand(groupCmd.getGroupId(), ['nonexistent']);
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('not found');
  });

  it('undo removes the added elements from the group', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);

    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);

    executor.execute(new AddToGroupCommand(groupCmd.getGroupId(), [id2]));
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(2);

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(1);
  });

  it('redo re-adds the elements after undo', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);

    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);
    executor.execute(new AddToGroupCommand(groupCmd.getGroupId(), [id2]));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(1);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(2);
  });
});

// ─── RemoveFromGroup Command ───────────────────────────────────────────────────

describe('RemoveFromGroupCommand', () => {
  let executor: CommandExecutor;

  function createShape(name: string, x: number, y: number) {
    const input: ElementInput = {
      type: 'shape', layerId: 'l1', shapeKind: 'rect', name,
      transform: { x, y, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeScene()));
  });

  it('removes elements from a group', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);
    const id3 = createShape('C', 200, 0);

    const groupCmd = new GroupElementsCommand([id1, id2, id3], 'G');
    executor.execute(groupCmd);

    const result = executor.execute(new RemoveFromGroupCommand(groupCmd.getGroupId(), [id1]));
    expect(result.valid).toBe(true);

    const scene = useDocumentStore.getState().getScene()!;
    expect(scene.groups[0].elementIds).toHaveLength(2);
    expect(scene.groups[0].elementIds).not.toContain(id1);
    expect(scene.groups[0].elementIds).toContain(id2);
    expect(scene.groups[0].elementIds).toContain(id3);
  });

  it('fails when group does not exist', () => {
    const cmd = new RemoveFromGroupCommand('nonexistent', ['e1']);
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
  });

  it('fails when element is not in the group', () => {
    const id1 = createShape('A', 0, 0);
    const groupCmd = new GroupElementsCommand([id1], 'G');
    executor.execute(groupCmd);

    const cmd = new RemoveFromGroupCommand(groupCmd.getGroupId(), ['nonexistent']);
    const result = cmd.validate(useDocumentStore.getState().getScene()!);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('not in group');
  });

  it('undo restores removed elements to the group', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);

    const groupCmd = new GroupElementsCommand([id1, id2], 'G');
    executor.execute(groupCmd);
    executor.execute(new RemoveFromGroupCommand(groupCmd.getGroupId(), [id1]));
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(1);

    executor.undo();
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(2);
  });

  it('redo removes the elements again', () => {
    const id1 = createShape('A', 0, 0);
    const id2 = createShape('B', 100, 0);

    const groupCmd = new GroupElementsCommand([id1, id2], 'G');
    executor.execute(groupCmd);
    executor.execute(new RemoveFromGroupCommand(groupCmd.getGroupId(), [id1]));
    executor.undo();
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(2);

    executor.redo();
    expect(useDocumentStore.getState().getScene()!.groups[0].elementIds).toHaveLength(1);
  });
});
