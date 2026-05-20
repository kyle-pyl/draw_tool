/**
 * Command system framework — command execution, validation, undo and redo.
 * SceneCommand is the base contract for all editing operations.
 * CommandExecutor manages the history stacks and coordinates with the Document Store.
 */

import type { SceneDocument, SceneElement, ElementType, Transform2D, ElementStyle, BBox, ElementGroup } from './types';
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
  arrowStart?: import('./types').ArrowStyle;
  arrowEnd?: import('./types').ArrowStyle;
  labels?: import('./types').ConnectorLabel[];
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
        arrowStart: input.arrowStart,
        arrowEnd: input.arrowEnd,
        labels: input.labels,
      } as SceneElement;
    default:
      return { ...base } as SceneElement;
  }
}

function checkElementCollision(
  newElement: SceneElement,
  existingElements: SceneElement[],
): ValidationError | null {
  if (newElement.type === 'connector') return null;

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

  getElementId(): string {
    return this.generatedId;
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

    return invertCmd;
  }
}

// ─── GroupElements Command ─────────────────────────────────────────────────────

export class GroupElementsCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private groupName: string;
  private generatedGroupId: string;

  constructor(elementIds: string[], groupName: string, label?: string) {
    this.id = generateId('group');
    this.elementIds = elementIds;
    this.groupName = groupName;
    this.generatedGroupId = generateId('group');
    this.label = label || `Group ${elementIds.length} element(s)`;
  }

  getGroupId(): string {
    return this.generatedGroupId;
  }

  validate(scene: SceneDocument): ValidationResult {
    if (this.elementIds.length === 0) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'Cannot create a group with no elements',
        severity: 'error',
        suggestion: 'Select at least one element to group',
      });
    }

    const missingIds: string[] = [];
    for (const id of this.elementIds) {
      if (!scene.elements.some((el) => el.id === id)) {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Elements not found: ${missingIds.join(', ')}`,
        severity: 'error',
        elementIds: missingIds,
        suggestion: 'The elements may have been deleted',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const group: ElementGroup = {
      id: this.generatedGroupId,
      name: this.groupName,
      elementIds: [...this.elementIds],
    };

    return {
      ...scene,
      groups: [...scene.groups, group],
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const groupId = this.generatedGroupId;
    return new UngroupCommand(groupId, `Undo: ${this.label}`);
  }
}

// ─── Ungroup Command ───────────────────────────────────────────────────────────

export class UngroupCommand implements SceneCommand {
  id: string;
  label: string;
  private groupId: string;
  private savedGroup: ElementGroup | null;

  constructor(groupId: string, label?: string) {
    this.id = generateId('ungroup');
    this.groupId = groupId;
    this.label = label || `Ungroup`;
    this.savedGroup = null;
  }

  validate(scene: SceneDocument): ValidationResult {
    const group = scene.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Group "${this.groupId}" not found`,
        severity: 'error',
        elementIds: [this.groupId],
        suggestion: 'The group may have already been dissolved',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const group = scene.groups.find((g) => g.id === this.groupId);
    this.savedGroup = group ? { ...group, elementIds: [...group.elementIds] } : null;

    return {
      ...scene,
      groups: scene.groups.filter((g) => g.id !== this.groupId),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    if (!this.savedGroup) return null;

    return new GroupElementsCommand(
      this.savedGroup.elementIds,
      this.savedGroup.name,
      `Undo: ${this.label}`,
    );
  }
}

// ─── AddToGroup Command ────────────────────────────────────────────────────────

export class AddToGroupCommand implements SceneCommand {
  id: string;
  label: string;
  private groupId: string;
  private elementIds: string[];

  constructor(groupId: string, elementIds: string[], label?: string) {
    this.id = generateId('addtogroup');
    this.groupId = groupId;
    this.elementIds = elementIds;
    this.label = label || `Add ${elementIds.length} element(s) to group`;
  }

  validate(scene: SceneDocument): ValidationResult {
    const group = scene.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Group "${this.groupId}" not found`,
        severity: 'error',
        elementIds: [this.groupId],
        suggestion: 'The group may have been deleted',
      });
    }

    const missingIds: string[] = [];
    for (const id of this.elementIds) {
      if (!scene.elements.some((el) => el.id === id)) {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Elements not found: ${missingIds.join(', ')}`,
        severity: 'error',
        elementIds: missingIds,
        suggestion: 'The elements may have been deleted',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    return {
      ...scene,
      groups: scene.groups.map((g) => {
        if (g.id !== this.groupId) return g;

        const existingSet = new Set(g.elementIds);
        const newIds = this.elementIds.filter((id) => !existingSet.has(id));

        return {
          ...g,
          elementIds: [...g.elementIds, ...newIds],
        };
      }),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    return new RemoveFromGroupCommand(
      this.groupId,
      this.elementIds,
      `Undo: ${this.label}`,
    );
  }
}

// ─── RemoveFromGroup Command ───────────────────────────────────────────────────

export class RemoveFromGroupCommand implements SceneCommand {
  id: string;
  label: string;
  private groupId: string;
  private elementIds: string[];

  constructor(groupId: string, elementIds: string[], label?: string) {
    this.id = generateId('removefromgroup');
    this.groupId = groupId;
    this.elementIds = elementIds;
    this.label = label || `Remove ${elementIds.length} element(s) from group`;
  }

  validate(scene: SceneDocument): ValidationResult {
    const group = scene.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Group "${this.groupId}" not found`,
        severity: 'error',
        elementIds: [this.groupId],
        suggestion: 'The group may have been deleted',
      });
    }

    const notInGroup: string[] = [];
    for (const id of this.elementIds) {
      if (!group.elementIds.includes(id)) {
        notInGroup.push(id);
      }
    }

    if (notInGroup.length > 0) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Elements not in group: ${notInGroup.join(', ')}`,
        severity: 'error',
        elementIds: notInGroup,
        suggestion: 'Only elements already in the group can be removed',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const removeSet = new Set(this.elementIds);

    return {
      ...scene,
      groups: scene.groups.map((g) => {
        if (g.id !== this.groupId) return g;

        return {
          ...g,
          elementIds: g.elementIds.filter((id) => !removeSet.has(id)),
        };
      }),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    return new AddToGroupCommand(
      this.groupId,
      this.elementIds,
      `Undo: ${this.label}`,
    );
  }
}

// ─── MoveElements Command ──────────────────────────────────────────────────────

export class MoveElementsCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private delta: { dx: number; dy: number };

  constructor(elementIds: string[], delta: { dx: number; dy: number }, label?: string) {
    this.id = generateId('move');
    this.elementIds = elementIds;
    this.delta = delta;
    this.label = label || `Move ${elementIds.length} element(s)`;
  }

  validate(scene: SceneDocument): ValidationResult {
    const movedIdSet = new Set(this.elementIds);
    const geometryAdapter = createGeometryAdapter();

    for (const elementId of this.elementIds) {
      const element = scene.elements.find((el) => el.id === elementId);
      if (!element) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${elementId}" not found in scene`,
          severity: 'error',
          elementIds: [elementId],
          suggestion: 'The element may have been deleted',
        });
      }

      if (element.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
          message: `Element "${element.name || element.id}" is locked and cannot be moved`,
          severity: 'error',
          elementIds: [element.id],
          suggestion: 'Unlock the element before moving it',
        });
      }

      if (element.type === 'connector') continue;

      const prospectiveTransform = {
        ...element.transform,
        x: element.transform.x + this.delta.dx,
        y: element.transform.y + this.delta.dy,
      };
      const prospectiveElement = { ...element, transform: prospectiveTransform };
      const prospectiveBBox = geometryAdapter.getBBox(prospectiveElement);

      const layerElements = scene.elements.filter(
        (el) => el.layerId === element.layerId && el.type !== 'connector' && !movedIdSet.has(el.id),
      );

      for (const other of layerElements) {
        const otherBBox = geometryAdapter.getBBox(other);
        if (bboxesOverlap(prospectiveBBox, otherBBox)) {
          const overlapX = Math.max(prospectiveBBox.x, otherBBox.x);
          const overlapY = Math.max(prospectiveBBox.y, otherBBox.y);
          const overlapW = Math.min(prospectiveBBox.x + prospectiveBBox.width, otherBBox.x + otherBBox.width) - overlapX;
          const overlapH = Math.min(prospectiveBBox.y + prospectiveBBox.height, otherBBox.y + otherBBox.height) - overlapY;

          return failureResult({
            code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
            message: `Moving "${element.name || element.id}" would overlap with "${other.name || other.id}" in layer "${element.layerId}"`,
            severity: 'error',
            layerIds: [element.layerId],
            elementIds: [element.id, other.id],
            bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
            suggestion: 'Move to a different position or use another layer',
          });
        }
      }
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const movedIdSet = new Set(this.elementIds);

    const updatedElements = scene.elements.map((el) => {
      if (!movedIdSet.has(el.id)) return el;

      return {
        ...el,
        transform: {
          ...el.transform,
          x: el.transform.x + this.delta.dx,
          y: el.transform.y + this.delta.dy,
        },
      };
    });

    // Update connectors that reference moved elements
    const finalElements = updatedElements.map((el) => {
      if (el.type !== 'connector') return el;

      let updated = { ...el };

      if (el.source?.elementId && movedIdSet.has(el.source.elementId)) {
        updated = {
          ...updated,
          source: {
            ...updated.source,
            x: updated.source.x + this.delta.dx,
            y: updated.source.y + this.delta.dy,
          },
        };
      }

      if (el.target?.elementId && movedIdSet.has(el.target.elementId)) {
        updated = {
          ...updated,
          target: {
            ...updated.target,
            x: updated.target.x + this.delta.dx,
            y: updated.target.y + this.delta.dy,
          },
        };
      }

      return updated;
    });

    return { ...scene, elements: finalElements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    return new MoveElementsCommand(
      this.elementIds,
      { dx: -this.delta.dx, dy: -this.delta.dy },
      `Undo: ${this.label}`,
    );
  }
}

// ─── UpdateElement Command ─────────────────────────────────────────────────────

export type ElementChanges = Partial<{
  style: Partial<ElementStyle>;
  transform: Partial<Transform2D>;
  visible: boolean;
  locked: boolean;
  name: string;
  tags: string[];
  metadata: Record<string, unknown>;
  text: string;
  shapeKind: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path';
  cornerRadius: [number, number, number, number];
  points: { x: number; y: number }[];
  pathCommands: string;
  src: string;
  source: Partial<{ elementId: string; anchorId: string; x: number; y: number }>;
  target: Partial<{ elementId: string; anchorId: string; x: number; y: number }>;
  arrowStart: import('./types').ArrowStyle | null;
  arrowEnd: import('./types').ArrowStyle | null;
  labels: import('./types').ConnectorLabel[];
}>;

export class UpdateElementCommand implements SceneCommand {
  id: string;
  label: string;
  private elementId: string;
  private changes: ElementChanges;
  private previousValues: ElementChanges;

  constructor(elementId: string, changes: ElementChanges, label?: string) {
    this.id = generateId('update');
    this.elementId = elementId;
    this.changes = changes;
    this.label = label || `Update Element`;
    this.previousValues = {};
  }

  validate(scene: SceneDocument): ValidationResult {
    const element = scene.elements.find((el) => el.id === this.elementId);
    if (!element) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Element "${this.elementId}" not found`,
        severity: 'error',
        elementIds: [this.elementId],
        suggestion: 'The element may have been deleted',
      });
    }

    if (element.locked) {
      return failureResult({
        code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
        message: `Element "${element.name || element.id}" is locked and cannot be modified`,
        severity: 'error',
        elementIds: [element.id],
        suggestion: 'Unlock the element before editing',
      });
    }

    // If transform changes affect position or size, check collision
    const hasPositionChange =
      this.changes.transform &&
      (this.changes.transform.x !== undefined ||
        this.changes.transform.y !== undefined ||
        this.changes.transform.width !== undefined ||
        this.changes.transform.height !== undefined);

    if (hasPositionChange && element.type !== 'connector') {
      const mergedTransform = {
        ...element.transform,
        ...this.changes.transform,
      };
      const prospectiveElement = { ...element, transform: mergedTransform };
      const geometryAdapter = createGeometryAdapter();
      const prospectiveBBox = geometryAdapter.getBBox(prospectiveElement);

      const layerElements = scene.elements.filter(
        (el) => el.layerId === element.layerId && el.id !== element.id && el.type !== 'connector',
      );

      for (const other of layerElements) {
        const otherBBox = geometryAdapter.getBBox(other);
        if (bboxesOverlap(prospectiveBBox, otherBBox)) {
          const overlapX = Math.max(prospectiveBBox.x, otherBBox.x);
          const overlapY = Math.max(prospectiveBBox.y, otherBBox.y);
          const overlapW = Math.min(prospectiveBBox.x + prospectiveBBox.width, otherBBox.x + otherBBox.width) - overlapX;
          const overlapH = Math.min(prospectiveBBox.y + prospectiveBBox.height, otherBBox.y + otherBBox.height) - overlapY;

          return failureResult({
            code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
            message: `Updating "${element.name || element.id}" would cause overlap with "${other.name || other.id}" in layer "${element.layerId}"`,
            severity: 'error',
            layerIds: [element.layerId],
            elementIds: [element.id, other.id],
            bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
            suggestion: 'Adjust the size or position to avoid overlap',
          });
        }
      }
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const element = scene.elements.find((el) => el.id === this.elementId)!;

    // Store previous values for potential use in invert
    const prev: ElementChanges = {};
    for (const key of Object.keys(this.changes) as (keyof ElementChanges)[]) {
      if (key in element) {
        (prev as any)[key] = (element as any)[key];
      }
    }
    this.previousValues = prev;

    const updatedElements = scene.elements.map((el) => {
      if (el.id !== this.elementId) return el;

      const updated: any = { ...el };

      if (this.changes.style) {
        updated.style = { ...el.style, ...this.changes.style };
      }
      if (this.changes.transform) {
        updated.transform = { ...el.transform, ...this.changes.transform };
      }
      if (this.changes.visible !== undefined) {
        updated.visible = this.changes.visible;
      }
      if (this.changes.locked !== undefined) {
        updated.locked = this.changes.locked;
      }
      if (this.changes.name !== undefined) {
        updated.name = this.changes.name;
      }
      if (this.changes.tags !== undefined) {
        updated.tags = this.changes.tags;
      }
      if (this.changes.metadata !== undefined) {
        updated.metadata = this.changes.metadata;
      }
      if (this.changes.text !== undefined) {
        updated.text = this.changes.text;
      }
      if (this.changes.shapeKind !== undefined) {
        updated.shapeKind = this.changes.shapeKind;
      }
      if (this.changes.cornerRadius !== undefined) {
        updated.cornerRadius = this.changes.cornerRadius;
      }
      if (this.changes.points !== undefined) {
        updated.points = this.changes.points;
      }
      if (this.changes.pathCommands !== undefined) {
        updated.pathCommands = this.changes.pathCommands;
      }
      if (this.changes.src !== undefined) {
        updated.src = this.changes.src;
      }
      if (this.changes.source) {
        updated.source = { ...el.source, ...this.changes.source };
      }
      if (this.changes.target) {
        updated.target = { ...el.target, ...this.changes.target };
      }
      if (this.changes.arrowStart !== undefined) {
        updated.arrowStart = this.changes.arrowStart;
      }
      if (this.changes.arrowEnd !== undefined) {
        updated.arrowEnd = this.changes.arrowEnd;
      }
      if (this.changes.labels !== undefined) {
        updated.labels = this.changes.labels;
      }

      return updated as SceneElement;
    });

    return { ...scene, elements: updatedElements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    return new UpdateElementCommand(
      this.elementId,
      this.previousValues,
      `Undo: ${this.label}`,
    );
  }
}

// ─── ChangeLayer Command ──────────────────────────────────────────────────────

export class ChangeLayerCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private targetLayerId: string;
  private previousLayerIds: Map<string, string>;

  constructor(elementIds: string[], targetLayerId: string, label?: string) {
    this.id = generateId('changelayer');
    this.elementIds = elementIds;
    this.targetLayerId = targetLayerId;
    this.label = label || `Move ${elementIds.length} element(s) to layer`;
    this.previousLayerIds = new Map();
  }

  validate(scene: SceneDocument): ValidationResult {
    const targetLayer = scene.layers.find((l) => l.id === this.targetLayerId);
    if (!targetLayer) {
      return failureResult({
        code: ErrorCode.REF_LAYER_NOT_FOUND as string,
        message: `Target layer "${this.targetLayerId}" does not exist`,
        severity: 'error',
        layerIds: [this.targetLayerId],
        suggestion: 'Create the layer first or specify an existing layer',
      });
    }

    const geometryAdapter = createGeometryAdapter();
    const existingInTarget = scene.elements.filter(
      (el) => el.layerId === this.targetLayerId && el.type !== 'connector',
    );

    for (const elementId of this.elementIds) {
      const element = scene.elements.find((el) => el.id === elementId);
      if (!element) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${elementId}" not found`,
          severity: 'error',
          elementIds: [elementId],
          suggestion: 'The element may have been deleted',
        });
      }

      if (element.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
          message: `Element "${element.name || element.id}" is locked and cannot be moved to another layer`,
          severity: 'error',
          elementIds: [element.id],
          suggestion: 'Unlock the element first',
        });
      }

      // Connectors don't need collision checks
      if (element.type === 'connector') continue;
      // Skip if already in the target layer
      if (element.layerId === this.targetLayerId) continue;

      const prospectiveBBox = geometryAdapter.getBBox(element);

      for (const other of existingInTarget) {
        // Skip elements that are also being moved (would not be there)
        if (this.elementIds.includes(other.id)) continue;

        const otherBBox = geometryAdapter.getBBox(other);
        if (bboxesOverlap(prospectiveBBox, otherBBox)) {
          const overlapX = Math.max(prospectiveBBox.x, otherBBox.x);
          const overlapY = Math.max(prospectiveBBox.y, otherBBox.y);
          const overlapW = Math.min(prospectiveBBox.x + prospectiveBBox.width, otherBBox.x + otherBBox.width) - overlapX;
          const overlapH = Math.min(prospectiveBBox.y + prospectiveBBox.height, otherBBox.y + otherBBox.height) - overlapY;

          return failureResult({
            code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
            message: `Moving "${element.name || element.id}" to layer "${this.targetLayerId}" would overlap with "${other.name || other.id}"`,
            severity: 'error',
            layerIds: [this.targetLayerId],
            elementIds: [element.id, other.id],
            bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
            suggestion: 'Move the element to a different position or use another target layer',
          });
        }
      }
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const movedIdSet = new Set(this.elementIds);

    const updatedElements = scene.elements.map((el) => {
      if (!movedIdSet.has(el.id)) return el;
      this.previousLayerIds.set(el.id, el.layerId);
      return { ...el, layerId: this.targetLayerId };
    });

    return { ...scene, elements: updatedElements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    // Create reverse commands for each element
    const reverseLayerIds = new Map<string, string>();
    for (const [elementId, originalLayerId] of this.previousLayerIds) {
      reverseLayerIds.set(elementId, originalLayerId);
    }

    const elementIds = this.elementIds.filter((id) => reverseLayerIds.has(id));

    // Move back to original layers in order
    const groupedByLayer = new Map<string, string[]>();
    for (const [elementId, layerId] of reverseLayerIds) {
      if (!groupedByLayer.has(layerId)) groupedByLayer.set(layerId, []);
      groupedByLayer.get(layerId)!.push(elementId);
    }

    // Simple invert: create a ChangeLayer command that moves all elements back
    // We handle this by moving each element back to its original layer
    const invertCmd: SceneCommand = {
      id: generateId('changelayer-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const movedSet = new Set(this.elementIds);
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            if (!movedSet.has(el.id)) return el;
            const origLayerId = reverseLayerIds.get(el.id);
            return origLayerId ? { ...el, layerId: origLayerId } : el;
          }),
        };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}

// ─── AlignElements Command ─────────────────────────────────────────────────────

export type AlignType = 'left' | 'right' | 'top' | 'bottom' | 'centerHorizontal' | 'centerVertical' | 'center';

export class AlignElementsCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private alignType: AlignType;
  private previousPositions: Map<string, { x: number; y: number }>;

  constructor(elementIds: string[], alignType: AlignType, label?: string) {
    this.id = generateId('align');
    this.elementIds = elementIds;
    this.alignType = alignType;
    this.label = label || `Align ${alignType}`;
    this.previousPositions = new Map();
  }

  validate(scene: SceneDocument): ValidationResult {
    if (this.elementIds.length < 2) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'At least 2 elements are required for alignment',
        severity: 'error',
        suggestion: 'Select at least 2 elements to align',
      });
    }

    const geometryAdapter = createGeometryAdapter();
    const alignedSet = new Set(this.elementIds);

    for (const elementId of this.elementIds) {
      const element = scene.elements.find((el) => el.id === elementId);
      if (!element) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${elementId}" not found`,
          severity: 'error',
          elementIds: [elementId],
          suggestion: 'The element may have been deleted',
        });
      }

      if (element.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
          message: `Element "${element.name || element.id}" is locked and cannot be aligned`,
          severity: 'error',
          elementIds: [element.id],
          suggestion: 'Unlock the element before aligning',
        });
      }
    }

    const rawElements = this.elementIds
      .map((id) => scene.elements.find((el) => el.id === id)!)
      .filter((el) => el.type !== 'connector');

    if (rawElements.length < 2) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'At least 2 non-connector elements are required for alignment',
        severity: 'error',
        suggestion: 'Connector elements cannot be aligned independently',
      });
    }

    const deltas = this.computeDeltas(rawElements, geometryAdapter);

    for (const element of rawElements) {
      const delta = deltas.get(element.id);
      if (!delta) continue;

      const prospectiveTransform = {
        ...element.transform,
        x: element.transform.x + delta.dx,
        y: element.transform.y + delta.dy,
      };
      const prospectiveElement = { ...element, transform: prospectiveTransform };
      const prospectiveBBox = geometryAdapter.getBBox(prospectiveElement);

      const layerElements = scene.elements.filter(
        (el) =>
          el.layerId === element.layerId &&
          el.type !== 'connector' &&
          !alignedSet.has(el.id),
      );

      for (const other of layerElements) {
        const otherBBox = geometryAdapter.getBBox(other);
        if (bboxesOverlap(prospectiveBBox, otherBBox)) {
          const overlapX = Math.max(prospectiveBBox.x, otherBBox.x);
          const overlapY = Math.max(prospectiveBBox.y, otherBBox.y);
          const overlapW =
            Math.min(prospectiveBBox.x + prospectiveBBox.width, otherBBox.x + otherBBox.width) - overlapX;
          const overlapH =
            Math.min(prospectiveBBox.y + prospectiveBBox.height, otherBBox.y + otherBBox.height) - overlapY;

          return failureResult({
            code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
            message: `Aligning "${element.name || element.id}" would overlap with "${other.name || other.id}" in layer "${element.layerId}"`,
            severity: 'error',
            layerIds: [element.layerId],
            elementIds: [element.id, other.id],
            bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
            suggestion: 'Move non-aligned elements away or use a different layer',
          });
        }
      }
    }

    return successResult();
  }

  private computeDeltas(
    elements: SceneElement[],
    geometryAdapter: GeometryAdapter,
  ): Map<string, { dx: number; dy: number }> {
    const deltas = new Map<string, { dx: number; dy: number }>();

    if (elements.length === 0) return deltas;

    const bboxes = elements.map((el) => ({ el, bbox: geometryAdapter.getBBox(el) }));

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const { bbox } of bboxes) {
      if (bbox.x < minX) minX = bbox.x;
      if (bbox.y < minY) minY = bbox.y;
      if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width;
      if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height;
    }

    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    for (const { el, bbox } of bboxes) {
      const elW = bbox.width;
      const elH = bbox.height;
      const elCenterX = bbox.x + elW / 2;
      const elCenterY = bbox.y + elH / 2;

      let targetX = bbox.x;
      let targetY = bbox.y;

      switch (this.alignType) {
        case 'left':
          targetX = minX;
          break;
        case 'right':
          targetX = maxX - elW;
          break;
        case 'top':
          targetY = minY;
          break;
        case 'bottom':
          targetY = maxY - elH;
          break;
        case 'centerHorizontal':
          targetX = centerX - elW / 2;
          break;
        case 'centerVertical':
          targetY = centerY - elH / 2;
          break;
        case 'center':
          targetX = centerX - elW / 2;
          targetY = centerY - elH / 2;
          break;
      }

      const dx = targetX - bbox.x;
      const dy = targetY - bbox.y;

      if (dx !== 0 || dy !== 0) {
        deltas.set(el.id, { dx, dy });
      }
    }

    return deltas;
  }

  execute(scene: SceneDocument): SceneDocument {
    const alignedSet = new Set(this.elementIds);
    const geometryAdapter = createGeometryAdapter();
    const rawElements = this.elementIds
      .map((id) => scene.elements.find((el) => el.id === id)!)
      .filter((el): el is SceneElement => !!el && el.type !== 'connector');

    const deltas = this.computeDeltas(rawElements, geometryAdapter);

    const updatedElements = scene.elements.map((el) => {
      const delta = deltas.get(el.id);
      if (!delta) return el;

      this.previousPositions.set(el.id, { x: el.transform.x, y: el.transform.y });

      return {
        ...el,
        transform: {
          ...el.transform,
          x: el.transform.x + delta.dx,
          y: el.transform.y + delta.dy,
        },
      };
    });

    const finalElements = updatedElements.map((el) => {
      if (el.type !== 'connector') return el;

      let updated = { ...el };

      if (el.source?.elementId && alignedSet.has(el.source.elementId)) {
        const delta = deltas.get(el.source.elementId);
        if (delta) {
          updated = {
            ...updated,
            source: { ...updated.source, x: updated.source.x + delta.dx, y: updated.source.y + delta.dy },
          };
        }
      }

      if (el.target?.elementId && alignedSet.has(el.target.elementId)) {
        const delta = deltas.get(el.target.elementId);
        if (delta) {
          updated = {
            ...updated,
            target: { ...updated.target, x: updated.target.x + delta.dx, y: updated.target.y + delta.dy },
          };
        }
      }

      return updated;
    });

    return { ...scene, elements: finalElements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const elementIds = this.elementIds.filter((id) => this.previousPositions.has(id));

    if (elementIds.length === 0) return null;

    const invertCmd: SceneCommand = {
      id: generateId('align-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const movedSet = new Set(elementIds);
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            if (!movedSet.has(el.id)) return el;
            const prevPos = this.previousPositions.get(el.id);
            return prevPos ? { ...el, transform: { ...el.transform, x: prevPos.x, y: prevPos.y } } : el;
          }),
        };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}

// ─── DistributeElements Command ─────────────────────────────────────────────────

export type DistributeType = 'horizontal' | 'vertical' | 'circular';

export interface CircularDistributeOptions {
  centerX: number;
  centerY: number;
  radius: number;
}

export class DistributeElementsCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private distributeType: DistributeType;
  private options: CircularDistributeOptions | null;
  private previousPositions: Map<string, { x: number; y: number }>;

  constructor(
    elementIds: string[],
    distributeType: DistributeType,
    options?: CircularDistributeOptions,
    label?: string,
  ) {
    this.id = generateId('distribute');
    this.elementIds = elementIds;
    this.distributeType = distributeType;
    this.options = options ?? null;
    this.label = label || `Distribute ${distributeType}`;
    this.previousPositions = new Map();
  }

  validate(scene: SceneDocument): ValidationResult {
    if (this.elementIds.length < 3) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'At least 3 elements are required for distribution',
        severity: 'error',
        suggestion: 'Select at least 3 elements to distribute',
      });
    }

    if (this.distributeType === 'circular') {
      if (!this.options || typeof this.options.centerX !== 'number' || typeof this.options.centerY !== 'number' || typeof this.options.radius !== 'number') {
        return failureResult({
          code: 'SCHEMA_FIELD_TYPE_ERROR',
          message: 'Circular distribution requires centerX, centerY, and radius options',
          severity: 'error',
          suggestion: 'Provide a valid center point and radius',
        });
      }
      if (this.options.radius <= 0) {
        return failureResult({
          code: 'SCHEMA_FIELD_TYPE_ERROR',
          message: 'Circular distribution radius must be positive',
          severity: 'error',
          suggestion: 'Provide a radius greater than 0',
        });
      }
    }

    const distributedSet = new Set(this.elementIds);

    for (const elementId of this.elementIds) {
      const element = scene.elements.find((el) => el.id === elementId);
      if (!element) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${elementId}" not found`,
          severity: 'error',
          elementIds: [elementId],
          suggestion: 'The element may have been deleted',
        });
      }

      if (element.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
          message: `Element "${element.name || element.id}" is locked and cannot be distributed`,
          severity: 'error',
          elementIds: [element.id],
          suggestion: 'Unlock the element before distributing',
        });
      }
    }

    const rawElements = this.elementIds
      .map((id) => scene.elements.find((el) => el.id === id)!)
      .filter((el) => el.type !== 'connector');

    if (rawElements.length < 3) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'At least 3 non-connector elements are required for distribution',
        severity: 'error',
        suggestion: 'Connector elements cannot be distributed independently',
      });
    }

    const geometryAdapter = createGeometryAdapter();
    const deltas = this.computeDeltas(rawElements, geometryAdapter);

    for (const element of rawElements) {
      const delta = deltas.get(element.id);
      if (!delta) continue;

      const prospectiveTransform = {
        ...element.transform,
        x: element.transform.x + delta.dx,
        y: element.transform.y + delta.dy,
      };
      const prospectiveElement = { ...element, transform: prospectiveTransform };
      const prospectiveBBox = geometryAdapter.getBBox(prospectiveElement);

      const layerElements = scene.elements.filter(
        (el) =>
          el.layerId === element.layerId &&
          el.type !== 'connector' &&
          !distributedSet.has(el.id),
      );

      for (const other of layerElements) {
        const otherBBox = geometryAdapter.getBBox(other);
        if (bboxesOverlap(prospectiveBBox, otherBBox)) {
          const overlapX = Math.max(prospectiveBBox.x, otherBBox.x);
          const overlapY = Math.max(prospectiveBBox.y, otherBBox.y);
          const overlapW =
            Math.min(prospectiveBBox.x + prospectiveBBox.width, otherBBox.x + otherBBox.width) - overlapX;
          const overlapH =
            Math.min(prospectiveBBox.y + prospectiveBBox.height, otherBBox.y + otherBBox.height) - overlapY;

          return failureResult({
            code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
            message: `Distributing "${element.name || element.id}" would overlap with "${other.name || other.id}" in layer "${element.layerId}"`,
            severity: 'error',
            layerIds: [element.layerId],
            elementIds: [element.id, other.id],
            bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
            suggestion: 'Move non-distributed elements away or use a different layer',
          });
        }
      }
    }

    return successResult();
  }

  private computeDeltas(
    elements: SceneElement[],
    geometryAdapter: GeometryAdapter,
  ): Map<string, { dx: number; dy: number }> {
    const deltas = new Map<string, { dx: number; dy: number }>();
    if (elements.length < 2) return deltas;

    switch (this.distributeType) {
      case 'horizontal':
        this.computeHorizontalDeltas(elements, geometryAdapter, deltas);
        break;
      case 'vertical':
        this.computeVerticalDeltas(elements, geometryAdapter, deltas);
        break;
      case 'circular':
        this.computeCircularDeltas(elements, geometryAdapter, deltas);
        break;
    }

    return deltas;
  }

  private computeHorizontalDeltas(
    elements: SceneElement[],
    geometryAdapter: GeometryAdapter,
    deltas: Map<string, { dx: number; dy: number }>,
  ): void {
    const bboxes = elements.map((el) => ({ el, bbox: geometryAdapter.getBBox(el) }));
    bboxes.sort((a, b) => (a.bbox.x + a.bbox.width / 2) - (b.bbox.x + b.bbox.width / 2));

    const n = bboxes.length;
    const leftmostCenter = bboxes[0].bbox.x + bboxes[0].bbox.width / 2;
    const rightmostCenter = bboxes[n - 1].bbox.x + bboxes[n - 1].bbox.width / 2;

    const totalSpan = rightmostCenter - leftmostCenter;
    const step = totalSpan / (n - 1);

    for (let i = 1; i < n - 1; i++) {
      const targetCenterX = leftmostCenter + step * i;
      const currentCenterX = bboxes[i].bbox.x + bboxes[i].bbox.width / 2;
      const dx = targetCenterX - currentCenterX;
      if (Math.abs(dx) > 1e-6) {
        deltas.set(bboxes[i].el.id, { dx, dy: 0 });
      }
    }
  }

  private computeVerticalDeltas(
    elements: SceneElement[],
    geometryAdapter: GeometryAdapter,
    deltas: Map<string, { dx: number; dy: number }>,
  ): void {
    const bboxes = elements.map((el) => ({ el, bbox: geometryAdapter.getBBox(el) }));
    bboxes.sort((a, b) => (a.bbox.y + a.bbox.height / 2) - (b.bbox.y + b.bbox.height / 2));

    const n = bboxes.length;
    const topmostCenter = bboxes[0].bbox.y + bboxes[0].bbox.height / 2;
    const bottommostCenter = bboxes[n - 1].bbox.y + bboxes[n - 1].bbox.height / 2;

    const totalSpan = bottommostCenter - topmostCenter;
    const step = totalSpan / (n - 1);

    for (let i = 1; i < n - 1; i++) {
      const targetCenterY = topmostCenter + step * i;
      const currentCenterY = bboxes[i].bbox.y + bboxes[i].bbox.height / 2;
      const dy = targetCenterY - currentCenterY;
      if (Math.abs(dy) > 1e-6) {
        deltas.set(bboxes[i].el.id, { dx: 0, dy });
      }
    }
  }

  private computeCircularDeltas(
    elements: SceneElement[],
    geometryAdapter: GeometryAdapter,
    deltas: Map<string, { dx: number; dy: number }>,
  ): void {
    const { centerX, centerY, radius } = this.options!;
    const n = elements.length;
    const angleStep = (2 * Math.PI) / n;

    for (let i = 0; i < n; i++) {
      const el = elements[i];
      const bbox = geometryAdapter.getBBox(el);
      const elCenterX = bbox.x + bbox.width / 2;
      const elCenterY = bbox.y + bbox.height / 2;

      const angle = angleStep * i - Math.PI / 2; // start from top (-PI/2)
      const targetCenterX = centerX + radius * Math.cos(angle);
      const targetCenterY = centerY + radius * Math.sin(angle);

      const dx = targetCenterX - elCenterX;
      const dy = targetCenterY - elCenterY;

      if (Math.abs(dx) > 1e-6 || Math.abs(dy) > 1e-6) {
        deltas.set(el.id, { dx, dy });
      }
    }
  }

  execute(scene: SceneDocument): SceneDocument {
    const distributedSet = new Set(this.elementIds);
    const geometryAdapter = createGeometryAdapter();
    const rawElements = this.elementIds
      .map((id) => scene.elements.find((el) => el.id === id)!)
      .filter((el): el is SceneElement => !!el && el.type !== 'connector');

    const deltas = this.computeDeltas(rawElements, geometryAdapter);

    const updatedElements = scene.elements.map((el) => {
      const delta = deltas.get(el.id);
      if (!delta) return el;

      this.previousPositions.set(el.id, { x: el.transform.x, y: el.transform.y });

      return {
        ...el,
        transform: {
          ...el.transform,
          x: el.transform.x + delta.dx,
          y: el.transform.y + delta.dy,
        },
      };
    });

    const finalElements = updatedElements.map((el) => {
      if (el.type !== 'connector') return el;

      let updated = { ...el };

      if (el.source?.elementId && distributedSet.has(el.source.elementId)) {
        const delta = deltas.get(el.source.elementId);
        if (delta) {
          updated = {
            ...updated,
            source: { ...updated.source, x: updated.source.x + delta.dx, y: updated.source.y + delta.dy },
          };
        }
      }

      if (el.target?.elementId && distributedSet.has(el.target.elementId)) {
        const delta = deltas.get(el.target.elementId);
        if (delta) {
          updated = {
            ...updated,
            target: { ...updated.target, x: updated.target.x + delta.dx, y: updated.target.y + delta.dy },
          };
        }
      }

      return updated;
    });

    return { ...scene, elements: finalElements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const elementIds = this.elementIds.filter((id) => this.previousPositions.has(id));

    if (elementIds.length === 0) return null;

    const invertCmd: SceneCommand = {
      id: generateId('distribute-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const movedSet = new Set(elementIds);
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            if (!movedSet.has(el.id)) return el;
            const prevPos = this.previousPositions.get(el.id);
            return prevPos ? { ...el, transform: { ...el.transform, x: prevPos.x, y: prevPos.y } } : el;
          }),
        };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}

// ─── BatchLayerEdit Command ───────────────────────────────────────────────────

export type BatchLayerOperation =
  | 'setFill'
  | 'setStroke'
  | 'setOpacity'
  | 'showAll'
  | 'hideAll'
  | 'deleteAll'
  | 'copyAll'
  | 'moveAll';

export class BatchLayerEditCommand implements SceneCommand {
  id: string;
  label: string;
  private layerId: string;
  private operation: BatchLayerOperation;
  /** Value for setFill, setStroke (string/color), setOpacity (number), showAll/hideAll (unused) */
  private value: string | number | undefined;
  private targetLayerId?: string;
  private previousElementData: Map<string, {
    style?: Partial<ElementStyle>;
    visible?: boolean;
    locked?: boolean;
    layerId?: string;
    /** full element snapshot for deleteAll undo */
    snapshot?: SceneElement;
  }>;
  private copiedElementIds: string[];
  private operationLabel: string;

  constructor(
    layerId: string,
    operation: BatchLayerOperation,
    value?: string | number,
    targetLayerId?: string,
    label?: string,
  ) {
    this.id = generateId('batchlayer');
    this.layerId = layerId;
    this.operation = operation;
    this.value = value;
    this.targetLayerId = targetLayerId;
    this.previousElementData = new Map();
    this.copiedElementIds = [];

    const opLabels: Record<BatchLayerOperation, string> = {
      setFill: `Set fill on layer`,
      setStroke: `Set stroke on layer`,
      setOpacity: `Set opacity on layer`,
      showAll: `Show all in layer`,
      hideAll: `Hide all in layer`,
      deleteAll: `Delete all in layer`,
      copyAll: `Copy layer to another`,
      moveAll: `Move layer to another`,
    };
    this.operationLabel = opLabels[operation];
    this.label = label || this.operationLabel;
  }

  validate(scene: SceneDocument): ValidationResult {
    const layer = scene.layers.find((l) => l.id === this.layerId);
    if (!layer) {
      return failureResult({
        code: ErrorCode.REF_LAYER_NOT_FOUND as string,
        message: `Layer "${this.layerId}" does not exist`,
        severity: 'error',
        layerIds: [this.layerId],
        suggestion: 'Specify an existing layer',
      });
    }

    const layerElements = scene.elements.filter((el) => el.layerId === this.layerId);

    switch (this.operation) {
      case 'setFill':
      case 'setStroke':
      case 'setOpacity':
      case 'showAll':
      case 'hideAll': {
        // Check no locked elements are being modified
        for (const el of layerElements) {
          if (el.locked) {
            return failureResult({
              code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
              message: `Element "${el.name || el.id}" is locked and cannot be modified`,
              severity: 'error',
              elementIds: [el.id],
              suggestion: 'Unlock the element first or exclude locked elements',
            });
          }
        }
        if (this.operation === 'setOpacity' && (typeof this.value !== 'number' || this.value < 0 || this.value > 1)) {
          return failureResult({
            code: 'SCHEMA_FIELD_TYPE_ERROR',
            message: 'Opacity value must be a number between 0 and 1',
            severity: 'error',
            suggestion: 'Provide a valid opacity value (0-1)',
          });
        }
        return successResult();
      }

      case 'deleteAll': {
        if (layerElements.length === 0) {
          return successResult();
        }
        for (const el of layerElements) {
          if (el.locked) {
            return failureResult({
              code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
              message: `Element "${el.name || el.id}" is locked and cannot be deleted`,
              severity: 'error',
              elementIds: [el.id],
              suggestion: 'Unlock the element first or exclude locked elements',
            });
          }
        }
        return successResult();
      }

      case 'copyAll':
      case 'moveAll': {
        if (!this.targetLayerId) {
          return failureResult({
            code: 'SCHEMA_FIELD_TYPE_ERROR',
            message: 'Target layer ID is required for copy/move operations',
            severity: 'error',
            suggestion: 'Provide a target layer ID',
          });
        }

        const targetLayer = scene.layers.find((l) => l.id === this.targetLayerId);
        if (!targetLayer) {
          return failureResult({
            code: ErrorCode.REF_LAYER_NOT_FOUND as string,
            message: `Target layer "${this.targetLayerId}" does not exist`,
            severity: 'error',
            layerIds: [this.targetLayerId],
            suggestion: 'Specify an existing target layer',
          });
        }

        if (this.targetLayerId === this.layerId) {
          return failureResult({
            code: 'SCHEMA_FIELD_TYPE_ERROR',
            message: 'Source and target layers must be different for copy/move',
            severity: 'error',
            layerIds: [this.layerId],
            suggestion: 'Choose a different target layer',
          });
        }

        // For moveAll: check no elements are locked
        if (this.operation === 'moveAll') {
          for (const el of layerElements) {
            if (el.locked) {
              return failureResult({
                code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
                message: `Element "${el.name || el.id}" is locked and cannot be moved`,
                severity: 'error',
                elementIds: [el.id],
                suggestion: 'Unlock the element first',
              });
            }
          }
        }

        // Check collisions in target layer
        const geometryAdapter = createGeometryAdapter();
        const targetExisting = scene.elements.filter(
          (el) => el.layerId === this.targetLayerId && el.type !== 'connector',
        );

        for (const el of layerElements) {
          if (el.type === 'connector') continue;
          const elBBox = geometryAdapter.getBBox(el);
          for (const other of targetExisting) {
            const otherBBox = geometryAdapter.getBBox(other);
            if (bboxesOverlap(elBBox, otherBBox)) {
              const overlapX = Math.max(elBBox.x, otherBBox.x);
              const overlapY = Math.max(elBBox.y, otherBBox.y);
              const overlapW = Math.min(elBBox.x + elBBox.width, otherBBox.x + otherBBox.width) - overlapX;
              const overlapH = Math.min(elBBox.y + elBBox.height, otherBBox.y + otherBBox.height) - overlapY;
              const opName = this.operation === 'copyAll' ? 'copy' : 'move';
              return failureResult({
                code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
                message: `Cannot ${opName} "${el.name || el.id}" to layer "${this.targetLayerId}": would overlap with "${other.name || other.id}"`,
                severity: 'error',
                layerIds: [this.targetLayerId],
                elementIds: [el.id, other.id],
                bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
                suggestion: `Move conflicting elements in the target layer or choose a different target layer`,
              });
            }
          }
        }

        return successResult();
      }

      default:
        return failureResult({
          code: 'SCHEMA_INVALID_TYPE',
          message: `Unknown batch operation: "${this.operation}"`,
          severity: 'error',
          suggestion: 'Use one of: setFill, setStroke, setOpacity, showAll, hideAll, deleteAll, copyAll, moveAll',
        });
    }
  }

  execute(scene: SceneDocument): SceneDocument {
    const layerElements = scene.elements.filter((el) => el.layerId === this.layerId);

    // Store previous state for all affected elements (for undo)
    for (const el of layerElements) {
      const prev: { style?: Partial<ElementStyle>; visible?: boolean; layerId?: string; snapshot?: SceneElement } = {};
      if (this.operation === 'setFill' || this.operation === 'setStroke' || this.operation === 'setOpacity') {
        prev.style = { ...el.style };
      }
      if (this.operation === 'showAll' || this.operation === 'hideAll') {
        prev.visible = el.visible;
      }
      if (this.operation === 'moveAll') {
        prev.layerId = el.layerId;
      }
      if (this.operation === 'deleteAll') {
        prev.snapshot = JSON.parse(JSON.stringify(el)) as SceneElement;
      }
      this.previousElementData.set(el.id, prev);
    }

    switch (this.operation) {
      case 'setFill': {
        const fill = String(this.value ?? '#000000');
        return {
          ...scene,
          elements: scene.elements.map((el) =>
            el.layerId === this.layerId
              ? { ...el, style: { ...el.style, fill } }
              : el,
          ),
        };
      }

      case 'setStroke': {
        const stroke = String(this.value ?? '#000000');
        return {
          ...scene,
          elements: scene.elements.map((el) =>
            el.layerId === this.layerId
              ? { ...el, style: { ...el.style, stroke } }
              : el,
          ),
        };
      }

      case 'setOpacity': {
        const opacity = typeof this.value === 'number' ? this.value : 1;
        return {
          ...scene,
          elements: scene.elements.map((el) =>
            el.layerId === this.layerId
              ? { ...el, style: { ...el.style, opacity } }
              : el,
          ),
        };
      }

      case 'showAll': {
        return {
          ...scene,
          elements: scene.elements.map((el) =>
            el.layerId === this.layerId ? { ...el, visible: true } : el,
          ),
        };
      }

      case 'hideAll': {
        return {
          ...scene,
          elements: scene.elements.map((el) =>
            el.layerId === this.layerId ? { ...el, visible: false } : el,
          ),
        };
      }

      case 'deleteAll': {
        const deletedIds = new Set(layerElements.map((el) => el.id));
        // Unbind connectors that reference deleted elements
        return {
          ...scene,
          elements: scene.elements
            .filter((el) => !deletedIds.has(el.id))
            .map((el) => {
              if (el.type !== 'connector') return el;
              let updated = { ...el };
              if (el.source?.elementId && deletedIds.has(el.source.elementId)) {
                updated = { ...updated, source: { ...updated.source, elementId: undefined, anchorId: undefined } };
              }
              if (el.target?.elementId && deletedIds.has(el.target.elementId)) {
                updated = { ...updated, target: { ...updated.target, elementId: undefined, anchorId: undefined } };
              }
              return updated;
            }),
        };
      }

      case 'copyAll': {
        const newElements: SceneElement[] = [];
        for (const el of layerElements) {
          const newId = generateId(el.type);
          this.copiedElementIds.push(newId);
          const clone = JSON.parse(JSON.stringify(el)) as SceneElement;
          clone.id = newId;
          clone.layerId = this.targetLayerId!;
          newElements.push(clone);
        }
        return {
          ...scene,
          elements: [...scene.elements, ...newElements],
        };
      }

      case 'moveAll': {
        const movedIdSet = new Set(layerElements.map((el) => el.id));
        return {
          ...scene,
          elements: scene.elements.map((el) =>
            movedIdSet.has(el.id) ? { ...el, layerId: this.targetLayerId! } : el,
          ),
        };
      }

      default:
        return scene;
    }
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const invertCmd: SceneCommand = {
      id: generateId('batchlayer-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => this.invertExecute(scene),
      invert: () => null,
    };
    return invertCmd;
  }

  private invertExecute(scene: SceneDocument): SceneDocument {
    switch (this.operation) {
      case 'setFill':
      case 'setStroke':
      case 'setOpacity': {
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            const prev = this.previousElementData.get(el.id);
            if (!prev || !prev.style) return el;
            const restoredStyle = { ...el.style, ...prev.style };
            return { ...el, style: restoredStyle };
          }),
        };
      }

      case 'showAll':
      case 'hideAll': {
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            const prev = this.previousElementData.get(el.id);
            if (prev && prev.visible !== undefined) {
              return { ...el, visible: prev.visible };
            }
            return el;
          }),
        };
      }

      case 'deleteAll': {
        const restoredElements: SceneElement[] = [];
        for (const [, prev] of this.previousElementData) {
          if (prev.snapshot) {
            restoredElements.push(prev.snapshot);
          }
        }
        // Rebind connectors that were unbound by the delete
        const deletedIds = new Set(restoredElements.map((el) => el.id));
        return {
          ...scene,
          elements: [
            ...scene.elements.map((el) => {
              if (el.type !== 'connector') return el;
              // We can't fully restore original bindings without stored info,
              // but the elements are back so references become valid again
              return el;
            }),
            ...restoredElements,
          ],
        };
      }

      case 'copyAll': {
        const deleteIds = new Set(this.copiedElementIds);
        return {
          ...scene,
          elements: scene.elements.filter((el) => !deleteIds.has(el.id)),
        };
      }

      case 'moveAll': {
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            const prev = this.previousElementData.get(el.id);
            if (prev && prev.layerId) {
              return { ...el, layerId: prev.layerId };
            }
            return el;
          }),
        };
      }

      default:
        return scene;
    }
  }
}

// ─── MoveLayers Command ───────────────────────────────────────────────────────

export type LayerMoveDirection = 'up' | 'down';

export class MoveLayersCommand implements SceneCommand {
  id: string;
  label: string;
  private layerIds: string[];
  private direction: LayerMoveDirection;
  private steps: number;
  private previousOrders: Map<string, number>;

  constructor(layerIds: string[], direction: LayerMoveDirection, steps = 1, label?: string) {
    this.id = generateId('movelayers');
    this.layerIds = layerIds;
    this.direction = direction;
    this.steps = Math.max(1, Math.floor(steps));
    this.label = label || `Move ${layerIds.length} layer(s) ${direction}`;
    this.previousOrders = new Map();
  }

  private computeNewOrders(scene: SceneDocument): Map<string, number> | null {
    const selectedIdSet = new Set(this.layerIds);
    const sortedLayers = [...scene.layers].sort((a, b) => a.order - b.order);
    const otherLayers = sortedLayers.filter((l) => !selectedIdSet.has(l.id));
    const selectedLayers = sortedLayers.filter((l) => selectedIdSet.has(l.id));

    if (selectedLayers.length === 0 || otherLayers.length === 0) return null;

    const insertPositions = new Map<string, number>();

    for (const sl of selectedLayers) {
      const origIdx = sortedLayers.indexOf(sl);
      const belowCount = sortedLayers
        .slice(0, origIdx)
        .filter((l) => !selectedIdSet.has(l.id)).length;

      if (this.direction === 'up') {
        const aboveCount = sortedLayers
          .slice(origIdx + 1)
          .filter((l) => !selectedIdSet.has(l.id)).length;
        const moveBy = Math.min(this.steps, aboveCount);
        if (moveBy === 0) return null;
        insertPositions.set(sl.id, belowCount + moveBy);
      } else {
        const moveBy = Math.min(this.steps, belowCount);
        if (moveBy === 0) return null;
        insertPositions.set(sl.id, belowCount - moveBy);
      }
    }

    const sortedByPos = [...insertPositions.entries()]
      .sort((a, b) => a[1] - b[1] || selectedLayers.findIndex((l) => l.id === a[0]) - selectedLayers.findIndex((l) => l.id === b[0]));

    const result = otherLayers.map((l) => l.id);

    for (let i = sortedByPos.length - 1; i >= 0; i--) {
      const [layerId, pos] = sortedByPos[i];
      const clampedPos = Math.min(pos, result.length);
      result.splice(clampedPos, 0, layerId);
    }

    const newOrders = new Map<string, number>();
    result.forEach((id, idx) => { newOrders.set(id, idx + 1); });

    return newOrders;
  }

  validate(scene: SceneDocument): ValidationResult {
    const selectedIdSet = new Set(this.layerIds);

    for (const layerId of this.layerIds) {
      if (!scene.layers.some((l) => l.id === layerId)) {
        return failureResult({
          code: ErrorCode.REF_LAYER_NOT_FOUND as string,
          message: `Layer "${layerId}" does not exist`,
          severity: 'error',
          layerIds: [layerId],
          suggestion: 'The layer may have been deleted',
        });
      }
    }

    if (scene.layers.length <= 1) return successResult();

    const newOrders = this.computeNewOrders(scene);
    if (newOrders === null) {
      const dirLabel = this.direction === 'up' ? 'top' : 'bottom';
      return failureResult({
        code: 'RULE_MAX_LAYER_EXCEEDED',
        message: `Cannot move layers ${this.direction}: selected layers are already at the ${dirLabel}`,
        severity: 'error',
        layerIds: this.layerIds,
        suggestion: `The selected layers have no layers to move past`,
      });
    }

    const newScene = {
      ...scene,
      layers: scene.layers.map((l) => {
        const newOrder = newOrders.get(l.id);
        return newOrder !== undefined ? { ...l, order: newOrder } : l;
      }),
    };

    const geometryAdapter = createGeometryAdapter();
    const collisionErrors: ValidationError[] = [];

    for (const layer of newScene.layers) {
      const layerElements = newScene.elements.filter(
        (el) => el.layerId === layer.id && el.type !== 'connector',
      );
      if (layerElements.length < 2) continue;

      const options: CollisionCheckOptions = {};
      if (newScene.rules.hiddenElementsCollide === false) options.skipHidden = true;
      if (newScene.rules.lockedElementsCollide === false) options.skipLocked = true;

      const collisionResult = checkLayerCollisions(layerElements, geometryAdapter, options);

      if (collisionResult.hasCollision) {
        for (const collision of collisionResult.collisions) {
          collisionErrors.push({
            code: ErrorCode.GEO_SAME_LAYER_OVERLAP as string,
            message: `Layer "${layer.name || layer.id}" has overlapping elements: "${collision.elementA}" and "${collision.elementB}"`,
            severity: 'error',
            layerIds: [layer.id],
            elementIds: [collision.elementA, collision.elementB],
            bboxes: [collision.overlapBBox],
            suggestion: 'Move one of the elements to a different position or layer to resolve the overlap before reordering layers',
          });
        }
      }
    }

    if (collisionErrors.length > 0) {
      return failureResult(...collisionErrors);
    }

    if (newScene.layers.length > newScene.rules.maxLayerCount) {
      return failureResult({
        code: ErrorCode.RULE_MAX_LAYER_EXCEEDED as string,
        message: `Layer count (${newScene.layers.length}) exceeds maximum (${newScene.rules.maxLayerCount})`,
        severity: 'error',
        layerIds: newScene.layers.map((l) => l.id),
        suggestion: 'Reduce the number of layers or increase rules.maxLayerCount',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    for (const layer of scene.layers) {
      this.previousOrders.set(layer.id, layer.order);
    }

    const newOrders = this.computeNewOrders(scene);
    if (newOrders === null) return scene;

    return {
      ...scene,
      layers: scene.layers.map((l) => {
        const newOrder = newOrders.get(l.id);
        return newOrder !== undefined ? { ...l, order: newOrder } : l;
      }),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const invertCmd: SceneCommand = {
      id: generateId('movelayers-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        return {
          ...scene,
          layers: scene.layers.map((l) => {
            const prevOrder = this.previousOrders.get(l.id);
            return prevOrder !== undefined ? { ...l, order: prevOrder } : l;
          }),
        };
      },
      invert: () => null,
    };
    return invertCmd;
  }
}

// ─── TransformElements Command ─────────────────────────────────────────────────

export type TransformParams = {
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

export class TransformElementsCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private transformParams: TransformParams;
  private previousTransforms: Map<string, Transform2D>;

  constructor(elementIds: string[], params: TransformParams, label?: string) {
    this.id = generateId('transform');
    this.elementIds = elementIds;
    this.transformParams = params;
    this.label = label || `Transform ${elementIds.length} element(s)`;
    this.previousTransforms = new Map();
  }

  validate(scene: SceneDocument): ValidationResult {
    const movedIdSet = new Set(this.elementIds);
    const geometryAdapter = createGeometryAdapter();

    for (const elementId of this.elementIds) {
      const element = scene.elements.find((el) => el.id === elementId);
      if (!element) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${elementId}" not found`,
          severity: 'error',
          elementIds: [elementId],
          suggestion: 'The element may have been deleted',
        });
      }

      if (element.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
          message: `Element "${element.name || element.id}" is locked and cannot be transformed`,
          severity: 'error',
          elementIds: [element.id],
          suggestion: 'Unlock the element first',
        });
      }

      if (element.type === 'connector') continue;

      const prospectiveTransform = {
        ...element.transform,
        ...this.transformParams,
      };
      const prospectiveElement = { ...element, transform: prospectiveTransform };
      const prospectiveBBox = geometryAdapter.getBBox(prospectiveElement);

      const layerElements = scene.elements.filter(
        (el) => el.layerId === element.layerId && el.type !== 'connector' && !movedIdSet.has(el.id),
      );

      for (const other of layerElements) {
        const otherBBox = geometryAdapter.getBBox(other);
        if (bboxesOverlap(prospectiveBBox, otherBBox)) {
          const overlapX = Math.max(prospectiveBBox.x, otherBBox.x);
          const overlapY = Math.max(prospectiveBBox.y, otherBBox.y);
          const overlapW = Math.min(prospectiveBBox.x + prospectiveBBox.width, otherBBox.x + otherBBox.width) - overlapX;
          const overlapH = Math.min(prospectiveBBox.y + prospectiveBBox.height, otherBBox.y + otherBBox.height) - overlapY;

          return failureResult({
            code: ErrorCode.GEO_MOVE_TARGET_CONFLICT as string,
            message: `Transforming "${element.name || element.id}" would cause overlap with "${other.name || other.id}" in layer "${element.layerId}"`,
            severity: 'error',
            layerIds: [element.layerId],
            elementIds: [element.id, other.id],
            bboxes: [{ x: overlapX, y: overlapY, width: overlapW, height: overlapH }],
            suggestion: 'Adjust the transform parameters to avoid overlap',
          });
        }
      }
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const movedIdSet = new Set(this.elementIds);

    const updatedElements = scene.elements.map((el) => {
      if (!movedIdSet.has(el.id)) return el;

      this.previousTransforms.set(el.id, { ...el.transform });

      return {
        ...el,
        transform: {
          ...el.transform,
          ...this.transformParams,
        },
      };
    });

    return { ...scene, elements: updatedElements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const reverseParams: TransformParams = {};
    // Build reverse transform from the first element's original transform
    // We create individual UpdateElement-like commands for each element
    const elementIds = this.elementIds.filter((id) => this.previousTransforms.has(id));

    if (elementIds.length === 0) return null;

    const invertCmd: SceneCommand = {
      id: generateId('transform-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const movedSet = new Set(elementIds);
        return {
          ...scene,
          elements: scene.elements.map((el) => {
            if (!movedSet.has(el.id)) return el;
            const prevTransform = this.previousTransforms.get(el.id);
            return prevTransform ? { ...el, transform: prevTransform } : el;
          }),
        };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}
