import type { SceneDocument, SceneElement, ConnectorElement, Transform2D, ElementStyle } from '../types';
import { generateId } from '../utils';
import { useDocumentStore } from '../store';
import { ErrorCode } from '../errors';
import { successResult, failureResult } from '../errors';
import { checkElementCollision, buildElementFromInput, bboxesOverlap, type SceneCommand, type ElementInput, type ElementChanges } from './base';
import { createGeometryAdapter } from '../geometry';
import type { GeometryAdapter } from '../types';
import { recalculateRoutesForElements } from '../routing';

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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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
    const collisionError = checkElementCollision(prospectiveElement, layerElements, scene.rules.collisionStrategy);
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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

    const sceneAfterMove = { ...scene, elements: finalElements };
    return recalculateRoutesForElements(sceneAfterMove, movedIdSet);
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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
      if (this.changes.dataSourceId !== undefined) {
        updated.dataSourceId = this.changes.dataSourceId;
      }
      if (this.changes.chartType !== undefined) {
        updated.chartType = this.changes.chartType;
      }
      if (this.changes.columnMappings !== undefined) {
        updated.columnMappings = this.changes.columnMappings;
      }
      if (this.changes.options !== undefined) {
        updated.options = this.changes.options;
      }
      if (this.changes.svgContent !== undefined) {
        updated.svgContent = this.changes.svgContent;
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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

    const sceneAfterTransform = { ...scene, elements: updatedElements };
    return recalculateRoutesForElements(sceneAfterTransform, movedIdSet);
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const reverseParams: TransformParams = {};
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

// ─── DeleteElementStrategy ──────────────────────────────────────────────────────

/**
 * Strategy for handling connectors that reference elements being deleted.
 *
 * - `unbind`: Remove the element binding (elementId + anchorId), keeping the endpoint
 *   at its current absolute coordinates as a free-floating point. This is the default.
 * - `cascade`: Also delete any connectors that reference the deleted elements.
 * - `block`: Refuse the deletion if any connector references the elements.
 */
export type DeleteElementStrategy = 'unbind' | 'cascade' | 'block';

function findConnectorsReferencingElements(
  elementIds: Set<string>,
  elements: SceneElement[],
): ConnectorElement[] {
  return elements.filter(
    (el): el is ConnectorElement => {
      if (el.type !== 'connector') return false;
      const conn = el as ConnectorElement;
      const srcRef = conn.source?.elementId && elementIds.has(conn.source.elementId);
      const tgtRef = conn.target?.elementId && elementIds.has(conn.target.elementId);
      return !!(srcRef || tgtRef);
    },
  );
}

// ─── DeleteElement Command ──────────────────────────────────────────────────────

export class DeleteElementCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private strategy: DeleteElementStrategy;
  private deletedElements: SceneElement[];
  private unbindingInfo: Map<string, {
    source: { elementId?: string; anchorId?: string };
    target: { elementId?: string; anchorId?: string };
  }>;

  constructor(elementIds: string[], strategy: DeleteElementStrategy = 'unbind', label?: string) {
    this.id = generateId('delete');
    this.elementIds = elementIds;
    this.strategy = strategy;
    this.deletedElements = [];
    this.unbindingInfo = new Map();
    this.label = label || `Delete ${elementIds.length} element(s)`;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    if (this.elementIds.length === 0) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'No elements specified for deletion',
        severity: 'error',
        suggestion: 'Select at least one element to delete',
      });
    }

    const deleteSet = new Set(this.elementIds);

    for (const elementId of this.elementIds) {
      const element = scene.elements.find((el) => el.id === elementId);
      if (!element) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${elementId}" not found`,
          severity: 'error',
          elementIds: [elementId],
          suggestion: 'The element may have already been deleted',
        });
      }

      if (element.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
          message: `Element "${element.name || element.id}" is locked and cannot be deleted`,
          severity: 'error',
          elementIds: [element.id],
          suggestion: 'Unlock the element before deleting',
        });
      }
    }

    if (this.strategy === 'block') {
      const referencingConnectors = findConnectorsReferencingElements(deleteSet, scene.elements);
      if (referencingConnectors.length > 0) {
        const connNames = referencingConnectors.map((c) => `"${c.name || c.id}"`).join(', ');
        return failureResult({
          code: ErrorCode.REF_CONNECTOR_ENDPOINT_NOT_FOUND as string,
          message: `Cannot delete: ${referencingConnectors.length} connector(s) reference the elements being deleted (${connNames})`,
          severity: 'error',
          elementIds: this.elementIds,
          suggestion: 'Unbind the connectors first, use cascade delete, or change the deletion strategy',
        });
      }
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const deleteSet = new Set(this.elementIds);

    this.deletedElements = scene.elements.filter((el) => deleteSet.has(el.id));

    let currentElements = scene.elements;

    if (this.strategy === 'cascade') {
      const referencingConnectors = findConnectorsReferencingElements(deleteSet, scene.elements);
      const cascadeIds = new Set(referencingConnectors.map((c) => c.id));
      this.deletedElements.push(...referencingConnectors);
      const allDeleteIds = new Set([...deleteSet, ...cascadeIds]);
      currentElements = currentElements.filter((el) => !allDeleteIds.has(el.id));
    } else if (this.strategy === 'unbind') {
      currentElements = currentElements.map((el) => {
        if (el.type !== 'connector') return el;
        const conn = el as ConnectorElement;
        let updated = { ...conn } as ConnectorElement;
        let changed = false;

        if (conn.source?.elementId && deleteSet.has(conn.source.elementId)) {
          this.unbindingInfo.set(conn.id, {
            ...(this.unbindingInfo.get(conn.id) || { source: {}, target: {} }),
            source: { elementId: conn.source.elementId, anchorId: conn.source.anchorId },
          });
          updated = {
            ...updated,
            source: {
              ...updated.source,
              elementId: undefined,
              anchorId: undefined,
            },
          };
          changed = true;
        }

        if (conn.target?.elementId && deleteSet.has(conn.target.elementId)) {
          this.unbindingInfo.set(conn.id, {
            ...(this.unbindingInfo.get(conn.id) || { source: {}, target: {} }),
            target: { elementId: conn.target.elementId, anchorId: conn.target.anchorId },
          });
          updated = {
            ...updated,
            target: {
              ...updated.target,
              elementId: undefined,
              anchorId: undefined,
            },
          };
          changed = true;
        }

        return changed ? updated : el;
      });
    }

    const remainingElements = currentElements.filter((el) => !deleteSet.has(el.id));

    return {
      ...scene,
      elements: remainingElements,
      groups: scene.groups.map((g) => ({
        ...g,
        elementIds: g.elementIds.filter((id) => !deleteSet.has(id)),
      })),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const deletedElements = this.deletedElements.map((e) =>
      JSON.parse(JSON.stringify(e)),
    ) as SceneElement[];
    const unbindingInfo = new Map(this.unbindingInfo);

    const invertCmd: SceneCommand = {
      id: generateId('delete-undo'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        let elements = [...scene.elements, ...deletedElements] as SceneElement[];

        if (unbindingInfo.size > 0) {
          elements = elements.map((el) => {
            if (el.type !== 'connector') return el;
            const info = unbindingInfo.get(el.id);
            if (!info) return el;
            let updated = { ...el } as ConnectorElement;
            if (info.source.elementId) {
              updated = {
                ...updated,
                source: {
                  ...updated.source,
                  elementId: info.source.elementId,
                  anchorId: info.source.anchorId,
                },
              };
            }
            if (info.target.elementId) {
              updated = {
                ...updated,
                target: {
                  ...updated.target,
                  elementId: info.target.elementId,
                  anchorId: info.target.anchorId,
                },
              };
            }
            return updated;
          });
        }

        return { ...scene, elements };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}
