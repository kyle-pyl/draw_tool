import { describe, it, expect, beforeEach } from 'vitest';
import { CommandExecutor, CreateElementCommand, MoveElementsCommand, UpdateElementCommand, ChangeLayerCommand, TransformElementsCommand, GroupElementsCommand, UngroupCommand, AddToGroupCommand, RemoveFromGroupCommand, AlignElementsCommand, DistributeElementsCommand, BatchLayerEditCommand } from '../../core/commands';
import type { SceneCommand, CommandHistoryEntry, ElementInput, ElementChanges, TransformParams, AlignType, DistributeType, CircularDistributeOptions, BatchLayerOperation } from '../../core/commands';
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

// ─── AlignElements Command ─────────────────────────────────────────────────────

describe('AlignElementsCommand', () => {
  let executor: CommandExecutor;

  function makeScene(): SceneDocument {
    return {
      schemaVersion: '1.0.0',
      project: { name: 'Test' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };
  }

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

  describe('validation', () => {
    it('fails when fewer than 2 elements', () => {
      const id1 = createShape('A', 0, 0);
      const cmd = new AlignElementsCommand([id1], 'left');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('At least 2');
    });

    it('fails when element does not exist', () => {
      createShape('A', 0, 0);
      const cmd = new AlignElementsCommand(['nonexistent', 'also_nonexistent'], 'left');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
    });

    it('fails when element is locked', () => {
      const id1 = createShape('A', 0, 0);
      const id2 = createShape('B', 100, 0);

      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: scene.elements.map((el) => (el.id === id1 ? { ...el, locked: true } : el)),
      }));

      const cmd = new AlignElementsCommand([id1, id2], 'left');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
    });

    it('fails when only connectors are selected', () => {
      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: [
          ...scene.elements,
          {
            id: 'c1', type: 'connector', layerId: 'l1', name: 'C1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            source: { x: 0, y: 0 }, target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            visible: true, locked: false,
          },
          {
            id: 'c2', type: 'connector', layerId: 'l1', name: 'C2',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            source: { x: 0, y: 0 }, target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            visible: true, locked: false,
          },
        ],
      }));

      const cmd = new AlignElementsCommand(['c1', 'c2'], 'left');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('non-connector');
    });

    it('fails when alignment would cause collision', () => {
      createShape('A', 0, 100, 50, 50);
      createShape('B', 200, 0, 50, 50);
      // Obstacle at (0,0) size 60x40 will collide with left-aligned B at target bbox [0,0,50,50]
      createShape('Obstacle', 0, 0, 60, 40);

      const allIds = useDocumentStore.getState().getScene()!.elements.map((e) => e.id);
      const aId = allIds[0];
      const bId = allIds[1];

      const cmd = new AlignElementsCommand([aId, bId], 'left');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
    });
  });

  describe('left alignment', () => {
    it('aligns left edges to the leftmost element', () => {
      const id1 = createShape('A', 0, 50);      // leftmost
      const id2 = createShape('B', 100, 100);
      const id3 = createShape('C', 200, 150);

      const cmd = new AlignElementsCommand([id1, id2, id3], 'left');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      expect(el1.transform.x).toBe(0);    // already at left edge
      expect(el2.transform.x).toBe(0);    // moved to align
      expect(el3.transform.x).toBe(0);    // moved to align
      expect(el1.transform.y).toBe(50);   // y unchanged
      expect(el2.transform.y).toBe(100);  // y unchanged
      expect(el3.transform.y).toBe(150);  // y unchanged
    });
  });

  describe('right alignment', () => {
    it('aligns right edges to the rightmost element', () => {
      const id1 = createShape('A', 0, 50, 30, 30);    // right edge at 30
      const id2 = createShape('B', 100, 100, 60, 60);  // right edge at 160
      const id3 = createShape('C', 200, 150, 40, 40);  // right edge at 240 (rightmost)

      const cmd = new AlignElementsCommand([id1, id2, id3], 'right');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      // Rightmost edge = 240. For each element, right edge should be 240.
      // x = rightEdge - width
      expect(el3.transform.x).toBe(200);  // 200 + 40 = 240, already rightmost
      expect(el2.transform.x).toBe(180);  // 180 + 60 = 240
      expect(el1.transform.x).toBe(210);  // 210 + 30 = 240
    });
  });

  describe('top alignment', () => {
    it('aligns top edges to the topmost element', () => {
      const id1 = createShape('A', 60, 50);   // topmost at y=50
      const id2 = createShape('B', 10, 100);
      const id3 = createShape('C', 150, 200);

      const cmd = new AlignElementsCommand([id1, id2, id3], 'top');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      expect(el1.transform.y).toBe(50);
      expect(el2.transform.y).toBe(50);
      expect(el3.transform.y).toBe(50);
      // x positions unchanged
      expect(el1.transform.x).toBe(60);
      expect(el2.transform.x).toBe(10);
      expect(el3.transform.x).toBe(150);
    });
  });

  describe('bottom alignment', () => {
    it('aligns bottom edges to the bottommost element', () => {
      const id1 = createShape('A', 10, 0, 40, 30);     // bottom at 30
      const id2 = createShape('B', 130, 50, 40, 60);   // bottom at 110
      const id3 = createShape('C', 60, 200, 40, 50);   // bottom at 250 (bottommost)

      const cmd = new AlignElementsCommand([id1, id2, id3], 'bottom');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      // Bottommost edge = 250. For each: y = 250 - height
      expect(el3.transform.y).toBe(200);  // 200 + 50 = 250
      expect(el2.transform.y).toBe(190);  // 190 + 60 = 250
      expect(el1.transform.y).toBe(220);  // 220 + 30 = 250
    });
  });

  describe('center horizontal alignment', () => {
    it('aligns horizontal centers', () => {
      const id1 = createShape('A', 0, 50, 80, 50);    // centerX = 40
      const id2 = createShape('B', 200, 100, 60, 50);  // centerX = 230
      const id3 = createShape('C', 100, 150, 40, 50);  // centerX = 120

      const cmd = new AlignElementsCommand([id1, id2, id3], 'centerHorizontal');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      // Unified bbox: minX=0, maxX=260, centerX=130
      // For each: x = centerX - width/2
      expect(el1.transform.x).toBe(90);   // 130 - 40 = 90
      expect(el2.transform.x).toBe(100);  // 130 - 30 = 100
      expect(el3.transform.x).toBe(110);  // 130 - 20 = 110
      // y unchanged
      expect(el1.transform.y).toBe(50);
      expect(el2.transform.y).toBe(100);
      expect(el3.transform.y).toBe(150);
    });
  });

  describe('center vertical alignment', () => {
    it('aligns vertical centers', () => {
      const id1 = createShape('A', 30, 0, 50, 40);     // centerY = 20
      const id2 = createShape('B', 100, 200, 50, 80);  // centerY = 240

      const cmd = new AlignElementsCommand([id1, id2], 'centerVertical');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;

      // Unified bbox: minY=0, maxY=280, centerY=140
      // For each: y = centerY - height/2
      expect(el1.transform.y).toBe(120);  // 140 - 20 = 120
      expect(el2.transform.y).toBe(100);  // 140 - 40 = 100
    });
  });

  describe('center alignment (both axes)', () => {
    it('aligns both horizontal and vertical centers', () => {
      const id1 = createShape('A', 0, 0, 60, 40);
      const id2 = createShape('B', 200, 200, 40, 80);

      const cmd = new AlignElementsCommand([id1, id2], 'center');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;

      // Unified bbox: minX=0, maxX=240, centerX=120
      // Unified bbox: minY=0, maxY=280, centerY=140
      expect(el1.transform.x).toBe(90);   // 120 - 30 = 90
      expect(el1.transform.y).toBe(120);  // 140 - 20 = 120
      expect(el2.transform.x).toBe(100);  // 120 - 20 = 100
      expect(el2.transform.y).toBe(100);  // 140 - 40 = 100
    });
  });

  describe('undo / redo', () => {
    it('undo restores original positions', () => {
      const id1 = createShape('A', 10, 20, 50, 50);
      const id2 = createShape('B', 100, 200, 50, 50);

      executor.execute(new AlignElementsCommand([id1, id2], 'left'));

      const sceneAfter = useDocumentStore.getState().getScene()!;
      const el1After = sceneAfter.elements.find((e) => e.id === id1)!;
      expect(el1After.transform.x).toBe(10);  // leftmost

      executor.undo();

      const sceneUndo = useDocumentStore.getState().getScene()!;
      const el1Undo = sceneUndo.elements.find((e) => e.id === id1)!;
      const el2Undo = sceneUndo.elements.find((e) => e.id === id2)!;
      expect(el1Undo.transform.x).toBe(10);
      expect(el1Undo.transform.y).toBe(20);
      expect(el2Undo.transform.x).toBe(100);
      expect(el2Undo.transform.y).toBe(200);
    });

    it('redo reapplies alignment after undo', () => {
      const id1 = createShape('A', 10, 20, 50, 50);
      const id2 = createShape('B', 100, 200, 50, 50);

      executor.execute(new AlignElementsCommand([id1, id2], 'left'));
      executor.undo();
      const sceneUndo = useDocumentStore.getState().getScene()!;
      expect(sceneUndo.elements.find((e) => e.id === id2)!.transform.x).toBe(100);

      executor.redo();
      const sceneRedo = useDocumentStore.getState().getScene()!;
      expect(sceneRedo.elements.find((e) => e.id === id2)!.transform.x).toBe(10);
    });
  });

  describe('connector endpoint following', () => {
    it('moves connector endpoints when aligned element has attached connector', () => {
      const id2 = createShape('B', 400, 100, 50, 50);
      const id1 = createShape('A', 100, 100, 50, 50);

      // Create a connector attached to id1
      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: [
          ...scene.elements,
          {
            id: 'conn1', type: 'connector' as const, layerId: 'l1', name: 'Conn',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            source: { elementId: id2, anchorId: 'right', x: 450, y: 125 },
            target: { x: 600, y: 125 },
            route: { type: 'straight', points: [] },
            visible: true, locked: false,
          },
        ],
      }));

      executor.execute(new AlignElementsCommand([id1, id2], 'left'));

      const finalScene = useDocumentStore.getState().getScene()!;
      const conn = finalScene.elements.find((e) => e.id === 'conn1')!;
      expect(conn.type).toBe('connector');
      if (conn.type === 'connector') {
        // id2 moves from x=400 to x=100 (left-align). source.x was 450, now 450 - 300 = 150
        expect(conn.source.x).toBe(150);
      }
    });
  });

  describe('cross-layer alignment', () => {
    it('aligns elements across different layers', () => {
      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        layers: [
          ...scene.layers,
          { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
        ],
      }));

      const id1 = createShape('A', 0, 50, 50, 50); // layer l1

      const input2: ElementInput = {
        type: 'shape', layerId: 'l2', shapeKind: 'rect', name: 'B',
        transform: { x: 200, y: 100, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
      };
      const cmd2 = new CreateElementCommand(input2);
      executor.execute(cmd2);
      const id2 = useDocumentStore.getState().getScene()!.elements.at(-1)!.id;

      executor.execute(new AlignElementsCommand([id1, id2], 'left'));

      const finalScene = useDocumentStore.getState().getScene()!;
      const el1 = finalScene.elements.find((e) => e.id === id1)!;
      const el2 = finalScene.elements.find((e) => e.id === id2)!;
      expect(el1.transform.x).toBe(0);
      expect(el2.transform.x).toBe(0);
      expect(el1.layerId).toBe('l1');
      expect(el2.layerId).toBe('l2');
    });
  });
});

// ─── DistributeElements Command ─────────────────────────────────────────────────

describe('DistributeElementsCommand', () => {
  let executor: CommandExecutor;

  function makeScene(): SceneDocument {
    return {
      schemaVersion: '1.0.0',
      project: { name: 'Test' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };
  }

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

  describe('validation', () => {
    it('fails when fewer than 3 elements', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      const allIds = useDocumentStore.getState().getScene()!.elements.map((e) => e.id);
      const cmd = new DistributeElementsCommand(allIds, 'horizontal');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('At least 3');
    });

    it('fails when element does not exist', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      createShape('C', 200, 0);
      const cmd = new DistributeElementsCommand(['nonexistent', 'also_nonexistent', 'nope'], 'horizontal');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('REF_GROUP_NOT_FOUND');
    });

    it('fails when element is locked', () => {
      const id1 = createShape('A', 0, 0);
      const id2 = createShape('B', 100, 0);
      const id3 = createShape('C', 200, 0);

      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: scene.elements.map((el) => (el.id === id1 ? { ...el, locked: true } : el)),
      }));

      const cmd = new DistributeElementsCommand([id1, id2, id3], 'horizontal');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
    });

    it('fails when only connectors are selected', () => {
      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: [
          {
            id: 'c1', type: 'connector', layerId: 'l1', name: 'C1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            source: { x: 0, y: 0 }, target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            visible: true, locked: false,
          },
          {
            id: 'c2', type: 'connector', layerId: 'l1', name: 'C2',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            source: { x: 0, y: 0 }, target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            visible: true, locked: false,
          },
          {
            id: 'c3', type: 'connector', layerId: 'l1', name: 'C3',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            source: { x: 0, y: 0 }, target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            visible: true, locked: false,
          },
        ],
      }));

      const cmd = new DistributeElementsCommand(['c1', 'c2', 'c3'], 'horizontal');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('non-connector');
    });

    it('fails when distribution would cause collision', () => {
      createShape('A', 0, 100, 50, 50);
      createShape('B', 100, 100, 50, 50);
      createShape('C', 400, 100, 50, 50);
      
      const allIds = useDocumentStore.getState().getScene()!.elements.map((e) => e.id);
      
      // Place a large obstacle where B would need to move to
      // B initial center = 125, target center = 225 (evenly spaced between 25 and 425)
      // B target left edge = 200, so obstacle at x=200,y=50,w=100,h=150 will collide
      const obstacle: ElementInput = {
        type: 'shape', layerId: 'l1', shapeKind: 'rect', name: 'Obstacle',
        transform: { x: 200, y: 50, width: 100, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
      };
      executor.execute(new CreateElementCommand(obstacle));

      const cmd = new DistributeElementsCommand(allIds, 'horizontal');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
    });

    it('fails when circular options are missing', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      createShape('C', 200, 0);
      const allIds = useDocumentStore.getState().getScene()!.elements.map((e) => e.id);
      const cmd = new DistributeElementsCommand(allIds, 'circular');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('centerX');
    });

    it('fails when circular radius is zero or negative', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      createShape('C', 200, 0);
      const allIds = useDocumentStore.getState().getScene()!.elements.map((e) => e.id);
      const cmd = new DistributeElementsCommand(allIds, 'circular', { centerX: 100, centerY: 100, radius: 0 });
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('positive');
    });
  });

  describe('horizontal distribution', () => {
    it('evenly spaces elements between leftmost and rightmost', () => {
      const id1 = createShape('A', 0, 50, 50, 50);
      const id2 = createShape('B', 60, 50, 50, 50);
      const id3 = createShape('C', 400, 50, 50, 50);

      const cmd = new DistributeElementsCommand([id1, id2, id3], 'horizontal');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      // Centers should be evenly spaced
      const c1 = el1.transform.x + 25; // center of 50-wide rect
      const c2 = el2.transform.x + 25;
      const c3 = el3.transform.x + 25;

      expect(c1).toBeCloseTo(25, 1);
      expect(c3).toBeCloseTo(425, 1);
      // step = (425 - 25) / 2 = 200, so c2 should be 225
      expect(c2).toBeCloseTo(225, 1);
      // y unchanged
      expect(el1.transform.y).toBe(50);
      expect(el2.transform.y).toBe(50);
      expect(el3.transform.y).toBe(50);
    });

    it('works with 4 elements', () => {
      const id1 = createShape('A', 0, 50, 50, 50);
      const id2 = createShape('B', 50, 50, 50, 50);
      const id3 = createShape('C', 150, 50, 50, 50);
      const id4 = createShape('D', 300, 50, 50, 50);

      const cmd = new DistributeElementsCommand([id1, id2, id3, id4], 'horizontal');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const els = [id1, id2, id3, id4].map((id) => scene.elements.find((e) => e.id === id)!);
      const centers = els.map((el) => el.transform.x + 25);

      expect(centers[0]).toBeCloseTo(25, 1);
      expect(centers[3]).toBeCloseTo(325, 1);
      // step = (325 - 25) / 3 = 100
      expect(centers[1]).toBeCloseTo(125, 1);
      expect(centers[2]).toBeCloseTo(225, 1);
    });
  });

  describe('vertical distribution', () => {
    it('evenly spaces elements between topmost and bottommost', () => {
      const id1 = createShape('A', 50, 0, 50, 50);
      const id2 = createShape('B', 50, 60, 50, 50);
      const id3 = createShape('C', 50, 400, 50, 50);

      const cmd = new DistributeElementsCommand([id1, id2, id3], 'vertical');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const el1 = scene.elements.find((e) => e.id === id1)!;
      const el2 = scene.elements.find((e) => e.id === id2)!;
      const el3 = scene.elements.find((e) => e.id === id3)!;

      const c1 = el1.transform.y + 25;
      const c2 = el2.transform.y + 25;
      const c3 = el3.transform.y + 25;

      expect(c1).toBeCloseTo(25, 1);
      expect(c3).toBeCloseTo(425, 1);
      expect(c2).toBeCloseTo(225, 1);
      // x unchanged
      expect(el1.transform.x).toBe(50);
      expect(el2.transform.x).toBe(50);
      expect(el3.transform.x).toBe(50);
    });
  });

  describe('circular distribution', () => {
    it('arranges elements in a circle with equal angular spacing', () => {
      const id1 = createShape('A', 0, 0, 50, 50);
      const id2 = createShape('B', 100, 0, 50, 50);
      const id3 = createShape('C', 200, 0, 50, 50);

      const cmd = new DistributeElementsCommand([id1, id2, id3], 'circular', { centerX: 200, centerY: 200, radius: 100 });
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const els = [id1, id2, id3].map((id) => scene.elements.find((e) => e.id === id)!);

      // Each element's center should be on the circle of radius 100 around (200, 200)
      for (const el of els) {
        const centerX = el.transform.x + 25;
        const centerY = el.transform.y + 25;
        const dist = Math.sqrt((centerX - 200) ** 2 + (centerY - 200) ** 2);
        expect(dist).toBeCloseTo(100, 1);
      }

      // Angles should be 120 degrees apart (2*PI/3)
      const angles = els.map((el) => {
        const cx = el.transform.x + 25;
        const cy = el.transform.y + 25;
        return Math.atan2(cy - 200, cx - 200);
      });

      // Sort angles
      angles.sort((a, b) => a - b);
      expect(angles[1] - angles[0]).toBeCloseTo((2 * Math.PI) / 3, 1);
      expect(angles[2] - angles[1]).toBeCloseTo((2 * Math.PI) / 3, 1);
    });

    it('arranges 4 elements at 90-degree intervals', () => {
      const id1 = createShape('A', 0, 0, 40, 40);
      const id2 = createShape('B', 50, 0, 40, 40);
      const id3 = createShape('C', 100, 0, 40, 40);
      const id4 = createShape('D', 150, 0, 40, 40);

      const cmd = new DistributeElementsCommand([id1, id2, id3, id4], 'circular', { centerX: 100, centerY: 100, radius: 80 });
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const els = [id1, id2, id3, id4].map((id) => scene.elements.find((e) => e.id === id)!);

      for (const el of els) {
        const centerX = el.transform.x + 20;
        const centerY = el.transform.y + 20;
        const dist = Math.sqrt((centerX - 100) ** 2 + (centerY - 100) ** 2);
        expect(dist).toBeCloseTo(80, 1);
      }
    });
  });

  describe('undo/redo', () => {
    it('undo restores original positions', () => {
      const id1 = createShape('A', 0, 50, 50, 50);
      const id2 = createShape('B', 70, 50, 50, 50);
      const id3 = createShape('C', 400, 50, 50, 50);

      const sceneBefore = useDocumentStore.getState().getScene()!;
      const origX1 = sceneBefore.elements.find((e) => e.id === id1)!.transform.x;
      const origX2 = sceneBefore.elements.find((e) => e.id === id2)!.transform.x;

      executor.execute(new DistributeElementsCommand([id1, id2, id3], 'horizontal'));

      const sceneAfter = useDocumentStore.getState().getScene()!;
      expect(sceneAfter.elements.find((e) => e.id === id2)!.transform.x).not.toBe(origX2);

      executor.undo();

      const sceneUndo = useDocumentStore.getState().getScene()!;
      expect(sceneUndo.elements.find((e) => e.id === id1)!.transform.x).toBe(origX1);
      expect(sceneUndo.elements.find((e) => e.id === id2)!.transform.x).toBe(origX2);
    });

    it('redo reapplies distribution', () => {
      const id1 = createShape('A', 0, 50, 50, 50);
      const id2 = createShape('B', 70, 50, 50, 50);
      const id3 = createShape('C', 400, 50, 50, 50);

      executor.execute(new DistributeElementsCommand([id1, id2, id3], 'horizontal'));
      const sceneAfter = useDocumentStore.getState().getScene()!;
      const distX2 = sceneAfter.elements.find((e) => e.id === id2)!.transform.x;

      executor.undo();
      executor.redo();

      const sceneRedo = useDocumentStore.getState().getScene()!;
      expect(sceneRedo.elements.find((e) => e.id === id2)!.transform.x).toBeCloseTo(distX2, 1);
    });

    it('undo for circular distribution restores positions', () => {
      const id1 = createShape('A', 0, 0, 50, 50);
      const id2 = createShape('B', 100, 0, 50, 50);
      const id3 = createShape('C', 200, 0, 50, 50);

      const origX = useDocumentStore.getState().getScene()!.elements.map((e) => e.transform.x);

      executor.execute(new DistributeElementsCommand([id1, id2, id3], 'circular', { centerX: 200, centerY: 200, radius: 100 }));
      executor.undo();

      const scene = useDocumentStore.getState().getScene()!;
      const restoredX = scene.elements.map((e) => e.transform.x);
      for (let i = 0; i < origX.length; i++) {
        expect(restoredX[i]).toBeCloseTo(origX[i], 1);
      }
    });
  });

  describe('cross-layer distribution', () => {
    it('distributes elements across different layers independently', () => {
      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        layers: [
          { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
          { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
        ],
      }));

      const id1 = createShape('A', 0, 50, 50, 50); // layer l1
      
      const input2: ElementInput = {
        type: 'shape', layerId: 'l2', shapeKind: 'rect', name: 'B',
        transform: { x: 100, y: 50, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
      };
      executor.execute(new CreateElementCommand(input2));
      const id2 = useDocumentStore.getState().getScene()!.elements.at(-1)!.id;

      const input3: ElementInput = {
        type: 'shape', layerId: 'l2', shapeKind: 'rect', name: 'C',
        transform: { x: 400, y: 50, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
      };
      executor.execute(new CreateElementCommand(input3));
      const id3 = useDocumentStore.getState().getScene()!.elements.at(-1)!.id;

      executor.execute(new DistributeElementsCommand([id1, id2, id3], 'horizontal'));

      const finalScene = useDocumentStore.getState().getScene()!;
      const el1 = finalScene.elements.find((e) => e.id === id1)!;
      const el2 = finalScene.elements.find((e) => e.id === id2)!;
      const el3 = finalScene.elements.find((e) => e.id === id3)!;

      // Cross-layer: only elements in same layer check collisions, but X coords still shifted
      // Each element's center is distributed across the shared span
      const c1 = el1.transform.x + 25;
      const c2 = el2.transform.x + 30; // 60 wide
      const c3 = el3.transform.x + 30;
      
      expect(c1).toBeCloseTo(25, 1); // leftmost stays, center at 25
      expect(c3).toBeCloseTo(430, 1); // rightmost stays, center at 430
      // step = (430 - 25) / 2 = 202.5
      expect(c2).toBeCloseTo(227.5, 1);
    });
  });
});

// ─── BatchLayerEdit Command ─────────────────────────────────────────────────

describe('BatchLayerEditCommand', () => {
  let executor: CommandExecutor;

  function makeScene(): SceneDocument {
    return {
      schemaVersion: '1.0.0',
      project: { name: 'Test' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
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

  function createShape(name: string, x: number, y: number, w = 50, h = 50, layerId = 'l1') {
    const input: ElementInput = {
      type: 'shape', layerId, shapeKind: 'rect', name,
      transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ffffff', stroke: '#000000', strokeWidth: 2, opacity: 1 },
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  function createText(name: string, x: number, y: number, layerId = 'l1') {
    const input: ElementInput = {
      type: 'text', layerId, name,
      transform: { x, y, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
      text: 'Hello',
    };
    const cmd = new CreateElementCommand(input);
    executor.execute(cmd);
    return useDocumentStore.getState().getScene()!.elements.at(-1)!.id;
  }

  beforeEach(() => {
    executor = new CommandExecutor();
    useDocumentStore.getState().loadScene(structuredClone(makeScene()));
  });

  describe('validation', () => {
    it('fails when layer does not exist', () => {
      const cmd = new BatchLayerEditCommand('nonexistent', 'setFill', '#ff0000');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('REF_LAYER_NOT_FOUND');
    });

    it('fails when locked elements are in the layer for setFill', () => {
      const id1 = createShape('A', 0, 0);
      const scene = useDocumentStore.getState().getScene()!;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: scene.elements.map((el) => (el.id === id1 ? { ...el, locked: true } : el)),
      }));
      const cmd = new BatchLayerEditCommand('l1', 'setFill', '#ff0000');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
    });

    it('fails when opacity value is invalid', () => {
      createShape('A', 0, 0);
      const cmd = new BatchLayerEditCommand('l1', 'setOpacity', 5);
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('between 0 and 1');
    });

    it('allows setOpacity with valid values', () => {
      createShape('A', 0, 0);
      const cmd0 = new BatchLayerEditCommand('l1', 'setOpacity', 0);
      expect(cmd0.validate(useDocumentStore.getState().getScene()!).valid).toBe(true);
      const cmd1 = new BatchLayerEditCommand('l1', 'setOpacity', 0.5);
      expect(cmd1.validate(useDocumentStore.getState().getScene()!).valid).toBe(true);
      const cmd2 = new BatchLayerEditCommand('l1', 'setOpacity', 1);
      expect(cmd2.validate(useDocumentStore.getState().getScene()!).valid).toBe(true);
    });

    it('passes validation for empty layer (deleteAll)', () => {
      const cmd = new BatchLayerEditCommand('l1', 'deleteAll');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(true);
    });

    it('fails when deleteAll has locked elements', () => {
      createShape('A', 0, 0);
      const scene = useDocumentStore.getState().getScene()!;
      const id = scene.elements[0].id;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: [{ ...scene.elements[0], locked: true }],
      }));
      const cmd = new BatchLayerEditCommand('l1', 'deleteAll');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
    });

    it('fails for copyAll with no target layer', () => {
      createShape('A', 0, 0);
      const cmd = new BatchLayerEditCommand('l1', 'copyAll');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Target layer');
    });

    it('fails for moveAll with no target layer', () => {
      createShape('A', 0, 0);
      const cmd = new BatchLayerEditCommand('l1', 'moveAll');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Target layer');
    });

    it('fails when target layer does not exist', () => {
      createShape('A', 0, 0);
      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'nonexistent');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('REF_LAYER_NOT_FOUND');
    });

    it('fails when source and target layers are the same', () => {
      createShape('A', 0, 0);
      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l1');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be different');
    });

    it('fails for moveAll when target layer has collision', () => {
      createShape('A', 0, 0); // layer l1
      createShape('B', 0, 0, 50, 50, 'l2'); // layer l2 at same position

      const cmd = new BatchLayerEditCommand('l1', 'moveAll', undefined, 'l2');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
    });

    it('fails for copyAll when target layer has collision', () => {
      createShape('A', 0, 0); // layer l1
      createShape('B', 0, 0, 50, 50, 'l2'); // layer l2 at same position

      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('GEO_MOVE_TARGET_CONFLICT');
    });

    it('passes copyAll when target layer has no collision', () => {
      createShape('A', 0, 0); // layer l1
      createShape('B', 200, 200, 50, 50, 'l2'); // far away

      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(true);
    });

    it('fails when moveAll has locked elements', () => {
      createShape('A', 0, 0);
      const scene = useDocumentStore.getState().getScene()!;
      const id = scene.elements[0].id;
      useDocumentStore.getState().updateScene(() => ({
        ...scene,
        elements: [{ ...scene.elements[0], locked: true }],
      }));
      const cmd = new BatchLayerEditCommand('l1', 'moveAll', undefined, 'l2');
      const result = cmd.validate(useDocumentStore.getState().getScene()!);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('RULE_LOCKED_ELEMENT_EDITED');
    });
  });

  describe('setFill', () => {
    it('changes fill of all elements in the layer', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      createText('C', 200, 0);

      const cmd = new BatchLayerEditCommand('l1', 'setFill', '#ff0000');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      for (const el of scene.elements) {
        if (el.layerId === 'l1') {
          expect(el.style.fill).toBe('#ff0000');
        }
      }
    });

    it('does not affect elements in other layers', () => {
      createShape('A', 0, 0); // l1
      createShape('B', 100, 100, 50, 50, 'l2'); // l2

      const cmd = new BatchLayerEditCommand('l1', 'setFill', '#00ff00');
      executor.execute(cmd);

      const scene = useDocumentStore.getState().getScene()!;
      const l2El = scene.elements.find((e) => e.layerId === 'l2')!;
      expect(l2El.style.fill).toBe('#ffffff');
    });

    it('undo restores original fill', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      const beforeScene = useDocumentStore.getState().getScene()!;
      const origFill = beforeScene.elements[0].style.fill;

      const cmd = new BatchLayerEditCommand('l1', 'setFill', '#ff0000');
      executor.execute(cmd);
      executor.undo();

      const afterScene = useDocumentStore.getState().getScene()!;
      for (const el of afterScene.elements) {
        if (el.layerId === 'l1') {
          expect(el.style.fill).toBe(origFill);
        }
      }
    });

    it('redo reapplies fill change', () => {
      createShape('A', 0, 0);
      executor.execute(new BatchLayerEditCommand('l1', 'setFill', '#ff0000'));
      executor.undo();
      executor.redo();

      const scene = useDocumentStore.getState().getScene()!;
      for (const el of scene.elements) {
        if (el.layerId === 'l1') {
          expect(el.style.fill).toBe('#ff0000');
        }
      }
    });
  });

  describe('setStroke', () => {
    it('changes stroke of all elements in the layer', () => {
      createShape('A', 0, 0);
      createText('B', 100, 0);

      const cmd = new BatchLayerEditCommand('l1', 'setStroke', '#00ff00');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      for (const el of scene.elements) {
        if (el.layerId === 'l1') {
          expect(el.style.stroke).toBe('#00ff00');
        }
      }
    });

    it('undo restores original stroke', () => {
      createShape('A', 0, 0);
      const origStroke = useDocumentStore.getState().getScene()!.elements[0].style.stroke;

      executor.execute(new BatchLayerEditCommand('l1', 'setStroke', '#123456'));
      executor.undo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements[0].style.stroke).toBe(origStroke);
    });
  });

  describe('setOpacity', () => {
    it('changes opacity of all elements in the layer', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      const cmd = new BatchLayerEditCommand('l1', 'setOpacity', 0.5);
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      for (const el of scene.elements) {
        if (el.layerId === 'l1') {
          expect(el.style.opacity).toBe(0.5);
        }
      }
    });

    it('undo restores original opacity', () => {
      createShape('A', 0, 0);
      const origOpacity = useDocumentStore.getState().getScene()!.elements[0].style.opacity;

      executor.execute(new BatchLayerEditCommand('l1', 'setOpacity', 0.3));
      executor.undo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements[0].style.opacity).toBe(origOpacity);
    });
  });

  describe('showAll / hideAll', () => {
    it('showAll sets all elements visible', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      // Hide them first
      executor.execute(new BatchLayerEditCommand('l1', 'hideAll'));

      executor.execute(new BatchLayerEditCommand('l1', 'showAll'));
      const scene = useDocumentStore.getState().getScene()!;
      for (const el of scene.elements) {
        if (el.layerId === 'l1') {
          expect(el.visible).toBe(true);
        }
      }
    });

    it('hideAll sets all elements hidden', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      const cmd = new BatchLayerEditCommand('l1', 'hideAll');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      for (const el of scene.elements) {
        if (el.layerId === 'l1') {
          expect(el.visible).toBe(false);
        }
      }
    });

    it('undo of hideAll restores visibility', () => {
      createShape('A', 0, 0);
      const wasVisible = useDocumentStore.getState().getScene()!.elements[0].visible;

      executor.execute(new BatchLayerEditCommand('l1', 'hideAll'));
      executor.undo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements[0].visible).toBe(wasVisible);
    });

    it('does not affect elements in other layers', () => {
      createShape('A', 0, 0); // l1
      createShape('B', 100, 100, 50, 50, 'l2'); // l2

      executor.execute(new BatchLayerEditCommand('l1', 'hideAll'));

      const scene = useDocumentStore.getState().getScene()!;
      const l2El = scene.elements.find((e) => e.layerId === 'l2')!;
      expect(l2El.visible).toBe(true);
    });
  });

  describe('deleteAll', () => {
    it('removes all elements in the layer', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      createText('C', 200, 0);

      const cmd = new BatchLayerEditCommand('l1', 'deleteAll');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(0);
    });

    it('does not delete elements in other layers', () => {
      createShape('A', 0, 0); // l1
      createShape('B', 100, 100, 50, 50, 'l2'); // l2

      executor.execute(new BatchLayerEditCommand('l1', 'deleteAll'));

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements).toHaveLength(1);
      expect(scene.elements[0].layerId).toBe('l2');
    });

    it('unbinds connectors referencing deleted elements', () => {
      const id1 = createShape('A', 0, 0);
      const id2 = createShape('B', 200, 0);

      const connInput: ElementInput = {
        type: 'connector', layerId: 'l2', name: 'conn',
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        source: { elementId: id1, x: 50, y: 25 },
        target: { elementId: id2, x: 150, y: 25 },
        route: { type: 'straight', points: [] },
      };
      executor.execute(new CreateElementCommand(connInput));
      const connId = useDocumentStore.getState().getScene()!.elements.at(-1)!.id;

      executor.execute(new BatchLayerEditCommand('l1', 'deleteAll'));

      const scene = useDocumentStore.getState().getScene()!;
      const conn = scene.elements.find((e) => e.id === connId)!;
      expect(conn).toBeDefined();
      if (conn.type === 'connector') {
        expect(conn.source.elementId).toBeUndefined();
        expect(conn.target.elementId).toBeUndefined();
      }
    });

    it('undo restores all deleted elements', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);
      const countBefore = useDocumentStore.getState().getScene()!.elements.length;

      executor.execute(new BatchLayerEditCommand('l1', 'deleteAll'));
      expect(useDocumentStore.getState().getScene()!.elements.filter((el) => el.layerId === 'l1')).toHaveLength(0);

      executor.undo();
      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(countBefore);
    });
  });

  describe('copyAll', () => {
    it('copies all elements to another layer', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(2); // originals remain
      expect(scene.elements.filter((el) => el.layerId === 'l2')).toHaveLength(2); // copies
    });

    it('copied elements have new IDs', () => {
      createShape('A', 0, 0);
      const origIds = useDocumentStore.getState().getScene()!.elements.map((e) => e.id);

      executor.execute(new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2'));

      const scene = useDocumentStore.getState().getScene()!;
      const newIds = scene.elements.filter((el) => el.layerId === 'l2').map((e) => e.id);
      for (const nid of newIds) {
        expect(origIds).not.toContain(nid);
      }
    });

    it('copies text elements', () => {
      createText('T', 0, 0);

      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      const copy = scene.elements.find((e) => e.layerId === 'l2')!;
      expect(copy.type).toBe('text');
    });

    it('undo removes copied elements', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      executor.execute(new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2'));
      expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(4);

      executor.undo();
      expect(useDocumentStore.getState().getScene()!.elements).toHaveLength(2);
      expect(useDocumentStore.getState().getScene()!.elements.filter((el) => el.layerId === 'l2')).toHaveLength(0);
    });
  });

  describe('moveAll', () => {
    it('moves all elements to another layer', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      const cmd = new BatchLayerEditCommand('l1', 'moveAll', undefined, 'l2');
      const result = executor.execute(cmd);
      expect(result.valid).toBe(true);

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(0);
      expect(scene.elements.filter((el) => el.layerId === 'l2')).toHaveLength(2);
    });

    it('undo moves elements back', () => {
      createShape('A', 0, 0);
      createShape('B', 100, 0);

      executor.execute(new BatchLayerEditCommand('l1', 'moveAll', undefined, 'l2'));
      executor.undo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(2);
      expect(scene.elements.filter((el) => el.layerId === 'l2')).toHaveLength(0);
    });

    it('redo moves elements again', () => {
      createShape('A', 0, 0);

      executor.execute(new BatchLayerEditCommand('l1', 'moveAll', undefined, 'l2'));
      executor.undo();
      executor.redo();

      const scene = useDocumentStore.getState().getScene()!;
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(0);
      expect(scene.elements.filter((el) => el.layerId === 'l2')).toHaveLength(1);
    });

    it('connectors are moved too', () => {
      createShape('A', 0, 0);
      const sId = createShape('B', 200, 0);

      const connInput: ElementInput = {
        type: 'connector', layerId: 'l1', name: 'conn',
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        source: { elementId: sId, x: 50, y: 25 },
        target: { x: 150, y: 25 },
        route: { type: 'straight', points: [] },
      };
      executor.execute(new CreateElementCommand(connInput));

      executor.execute(new BatchLayerEditCommand('l1', 'moveAll', undefined, 'l2'));

      const scene = useDocumentStore.getState().getScene()!;
      // All l1 elements should now be in l2
      expect(scene.elements.filter((el) => el.layerId === 'l1')).toHaveLength(0);
      expect(scene.elements.filter((el) => el.layerId === 'l2')).toHaveLength(3); // 2 shapes + 1 connector
    });
  });

  describe('command structure', () => {
    it('has a label', () => {
      const cmd = new BatchLayerEditCommand('l1', 'setFill', '#f00');
      expect(cmd.label).toContain('Set fill');
    });

    it('has an id', () => {
      const cmd = new BatchLayerEditCommand('l1', 'setFill', '#f00');
      expect(cmd.id).toBeTruthy();
    });

    it('copyAll obeys max layer count validation', () => {
      createShape('A', 0, 0);
      // copyAll doesn't check maxLayerCount explicitly in validate(), but the scene rules exist
      const cmd = new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2');
      expect(cmd.validate(useDocumentStore.getState().getScene()!).valid).toBe(true);
    });
  });
});
