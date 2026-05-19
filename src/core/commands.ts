/**
 * Command system framework — command execution, validation, undo and redo.
 * SceneCommand is the base contract for all editing operations.
 * CommandExecutor manages the history stacks and coordinates with the Document Store.
 */

import type { SceneDocument, SceneElement, ElementType, Transform2D, ElementStyle, BBox } from './types';
import type { ValidationResult, ValidationError } from './errors';
import { successResult, failureResult } from './errors';
import { useDocumentStore } from './store';
import type { DocumentStore } from './store';
import { generateId } from './utils';
import { checkLayerCollisions, type CollisionCheckOptions } from './collision';
import { createGeometryAdapter } from './geometry';
import type { GeometryAdapter } from './types';
import { ErrorCode } from './errors';

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

// ─── Element Input Type ───────────────────────────────────────────────────────

export interface ElementInput {
  type: ElementType;
  layerId: string;
  name?: string;
  transform: Transform2D;
  style: ElementStyle;
  visible?: boolean;
  locked?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
  shapeKind?: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path';
  cornerRadius?: [number, number, number, number];
  points?: { x: number; y: number }[];
  pathCommands?: string;
  text?: string;
  src?: string;
  originalWidth?: number;
  originalHeight?: number;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none';
  source?: { elementId?: string; anchorId?: string; x: number; y: number };
  target?: { elementId?: string; anchorId?: string; x: number; y: number };
  route?: { type: 'straight' | 'polyline' | 'orthogonal' | 'curve'; points: { x: number; y: number }[] };
}

// ─── Collision Helpers ────────────────────────────────────────────────────────

function bboxesOverlap(a: BBox, b: BBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function buildElementFromInput(input: ElementInput, id: string): SceneElement {
  const base = {
    id,
    type: input.type,
    layerId: input.layerId,
    name: input.name,
    transform: input.transform,
    style: input.style,
    visible: input.visible !== undefined ? input.visible : true,
    locked: input.locked !== undefined ? input.locked : false,
    tags: input.tags,
    metadata: input.metadata,
  };

  switch (input.type) {
    case 'shape':
      return {
        ...base,
        type: 'shape',
        shapeKind: input.shapeKind || 'rect',
        cornerRadius: input.cornerRadius,
        points: input.points,
        pathCommands: input.pathCommands,
      } as SceneElement;
    case 'text':
      return { ...base, type: 'text', text: input.text || '' } as SceneElement;
    case 'image':
      return {
        ...base,
        type: 'image',
        src: input.src || '',
        originalWidth: input.originalWidth || input.transform.width,
        originalHeight: input.originalHeight || input.transform.height,
        objectFit: input.objectFit,
      } as SceneElement;
    case 'connector':
      return {
        ...base,
        type: 'connector',
        source: input.source || { x: 0, y: 0 },
        target: input.target || { x: 0, y: 0 },
        route: input.route || { type: 'straight', points: [] },
      } as SceneElement;
    default:
      return { ...base } as SceneElement;
  }
}

function checkElementCollision(
  newElement: SceneElement,
  existingElements: SceneElement[],
): ValidationError | null {
  const geometryAdapter = createGeometryAdapter();
  const newBBox = geometryAdapter.getBBox(newElement);

  for (const existing of existingElements) {
    if (existing.type === 'connector') continue;
    const existingBBox = geometryAdapter.getBBox(existing);
    if (bboxesOverlap(newBBox, existingBBox)) {
      const overlapX = Math.max(newBBox.x, existingBBox.x);
      const overlapY = Math.max(newBBox.y, existingBBox.y);
      const overlapW = Math.min(newBBox.x + newBBox.width, existingBBox.x + existingBBox.width) - overlapX;
      const overlapH = Math.min(newBBox.y + newBBox.height, existingBBox.y + existingBBox.height) - overlapY;

      return {
        code: ErrorCode.GEO_SAME_LAYER_OVERLAP as string,
        message: `Can't add element: would overlap with "${existing.name || existing.id}" in layer "${newElement.layerId}"`,
        severity: 'error',
        layerIds: [newElement.layerId],
        elementIds: [newElement.id, existing.id],
        bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
        suggestion: 'Move the new element to a different position or layer to avoid overlap',
      };
    }
  }

  return null;
}

// ─── CreateElement Command ────────────────────────────────────────────────────

export class CreateElementCommand implements SceneCommand {
  id: string;
  label: string;
  private input: ElementInput;
  private generatedId: string;

  constructor(input: ElementInput, label?: string) {
    this.id = generateId('create');
    this.input = input;
    this.generatedId = generateId(input.type);
    this.label = label || `Create ${input.type}`;
  }

  validate(scene: SceneDocument): ValidationResult {
    const layerExists = scene.layers.some((l) => l.id === this.input.layerId);
    if (!layerExists) {
      return failureResult({
        code: ErrorCode.REF_LAYER_NOT_FOUND as string,
        message: `Target layer "${this.input.layerId}" does not exist`,
        severity: 'error',
        layerIds: [this.input.layerId],
        suggestion: 'Create the layer first or specify an existing layer',
      });
    }

    const prospectiveElement = buildElementFromInput(this.input, this.generatedId);
    const layerElements = scene.elements.filter((el) => el.layerId === this.input.layerId);
    const collisionError = checkElementCollision(prospectiveElement, layerElements);
    if (collisionError) {
      return failureResult(collisionError);
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const element = buildElementFromInput(this.input, this.generatedId);
    return {
      ...scene,
      elements: [...scene.elements, element],
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const elementId = this.generatedId;
    return {
      id: generateId('delete'),
      label: `Delete Element`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => ({
        ...scene,
        elements: scene.elements.filter((el) => el.id !== elementId),
      }),
      invert: () => null,
    };
  }
}
