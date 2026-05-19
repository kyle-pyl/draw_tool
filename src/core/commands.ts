/**
 * Command system framework — command execution, validation, undo and redo.
 * SceneCommand is the base contract for all editing operations.
 * CommandExecutor manages the history stacks and coordinates with the Document Store.
 */

import type { SceneDocument } from './types';
import type { ValidationResult } from './errors';
import { successResult, failureResult } from './errors';
import { useDocumentStore } from './store';
import type { DocumentStore } from './store';

export interface SceneCommand {
  /** Unique command identifier */
  id: string;
  /** Human-readable label for history display */
  label: string;
  /** Pre-execution validation. Returns non-valid result to block execution. */
  validate: (scene: SceneDocument) => ValidationResult;
  /** Apply the command to a scene, returning the new scene. Must be pure. */
  execute: (scene: SceneDocument) => SceneDocument;
  /** Produce the inverse command for redo support, or null if irreversible. */
  invert: (scene: SceneDocument) => SceneCommand | null;
}

export interface CommandHistoryEntry {
  command: SceneCommand;
  /** Full scene snapshot taken before command execution (for undo rollback) */
  snapshot: SceneDocument;
}

export class CommandExecutor {
  private history: CommandHistoryEntry[] = [];
  private redoStack: CommandHistoryEntry[] = [];
  private maxHistory: number;

  constructor(maxHistory = 100) {
    this.maxHistory = maxHistory;
  }

  /**
   * Execute a command. Validates first; on failure returns the validation result
   * without modifying state. On success, takes a pre-execution snapshot, applies
   * the command through the store, and pushes onto the history stack.
   */
  execute(command: SceneCommand): ValidationResult {
    const scene = useDocumentStore.getState().getScene();
    if (!scene) {
      return failureResult({
        code: 'COMMAND_NO_SCENE',
        message: 'No scene document is loaded',
        severity: 'error',
      });
    }

    const validationResult = command.validate(scene);
    if (!validationResult.valid) {
      return validationResult;
    }

    const snapshot = JSON.parse(JSON.stringify(scene)) as SceneDocument;
    const newScene = command.execute(scene);

    useDocumentStore.getState().updateScene(() => newScene);

    this.history.push({ command, snapshot });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.redoStack = [];

    return successResult();
  }

  /**
   * Undo the most recent command by restoring its pre-execution snapshot.
   */
  undo(): boolean {
    if (this.history.length === 0) return false;

    const entry = this.history.pop()!;
    const currentScene = useDocumentStore.getState().getScene();
    if (!currentScene) return false;

    const currentSnapshot = JSON.parse(JSON.stringify(currentScene)) as SceneDocument;

    useDocumentStore.getState().updateScene(() => entry.snapshot);

    this.redoStack.push({ command: entry.command, snapshot: currentSnapshot });

    return true;
  }

  /**
   * Redo the most recently undone command.
   */
  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const entry = this.redoStack.pop()!;
    const scene = useDocumentStore.getState().getScene();
    if (!scene) return false;

    const snapshot = JSON.parse(JSON.stringify(scene)) as SceneDocument;
    const newScene = entry.command.execute(scene);

    useDocumentStore.getState().updateScene(() => newScene);

    this.history.push({ command: entry.command, snapshot });

    return true;
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getHistory(): readonly CommandHistoryEntry[] {
    return this.history;
  }
}
