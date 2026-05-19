import { describe, it, expect, beforeEach } from 'vitest';
import { CommandExecutor } from '../../core/commands';
import type { SceneCommand, CommandHistoryEntry } from '../../core/commands';
import type { SceneDocument } from '../../core/types';
import { successResult, failureResult } from '../../core/errors';
import { useDocumentStore } from '../../core/store';

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
