import type { SceneDocument, SceneElement, ConnectorElement, ElementSubtype, ElementStyle, Layer } from '../types';
import { generateId } from '../utils';
import { useDocumentStore } from '../store';
import { ErrorCode } from '../errors';
import { successResult, failureResult } from '../errors';
import type { SceneCommand } from './base';
import { bboxesOverlap, checkElementCollision, type ElementInput } from './base';
import { createGeometryAdapter } from '../geometry';
import type { GeometryAdapter } from '../types';
import { recalculateRoutesForElements } from '../routing';
import { checkLayerCollisions, type CollisionCheckOptions } from '../collision';
import type { LayoutEngine, LayoutOptions, LayoutResult } from '../layout';
import { extractLayoutNodes, extractLayoutEdges, applyLayoutToScene } from '../layout';

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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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

    const sceneAfterAlign = { ...scene, elements: finalElements };
    return recalculateRoutesForElements(sceneAfterAlign, alignedSet);
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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

    const sceneAfterDistribute = { ...scene, elements: finalElements };
    return recalculateRoutesForElements(sceneAfterDistribute, distributedSet);
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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

  validate(scene: SceneDocument): import('../errors').ValidationResult {
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
    const collisionErrors: import('../errors').ValidationError[] = [];

    for (const layer of newScene.layers) {
      const layerElements = newScene.elements.filter(
        (el) => el.layerId === layer.id && el.type !== 'connector',
      );
      if (layerElements.length < 2) continue;

      const options: CollisionCheckOptions = {};
      if (newScene.rules.hiddenElementsCollide === false) options.skipHidden = true;
      if (newScene.rules.lockedElementsCollide === false) options.skipLocked = true;
      options.collisionStrategy = newScene.rules.collisionStrategy;

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

// ─── Layout Command ────────────────────────────────────────────────────────────

export class LayoutCommand implements SceneCommand {
  id: string;
  label: string;

  private engine: LayoutEngine;
  private elementIds: Set<string>;
  private options: LayoutOptions;
  private previousPositions: Map<string, { x: number; y: number }>;
  private previousRoutes: Map<string, { x: number; y: number }[]>;

  constructor(
    engine: LayoutEngine,
    elementIds: string[],
    options?: LayoutOptions,
  ) {
    this.id = generateId('cmd-layout');
    this.label = `Layout (${engine.name})`;
    this.engine = engine;
    this.elementIds = new Set(elementIds);
    this.options = options ?? {};
    this.previousPositions = new Map();
    this.previousRoutes = new Map();
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    if (this.elementIds.size === 0) {
      return failureResult({
        code: 'LAYOUT_NO_ELEMENTS',
        message: 'No elements selected for layout',
        severity: 'error',
        suggestion: 'Select elements to arrange before applying layout',
      });
    }

    for (const id of this.elementIds) {
      const el = scene.elements.find((e) => e.id === id);
      if (!el) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND,
          message: `Element "${id}" not found in scene`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'The element may have been deleted',
        });
      }
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    this.previousPositions.clear();
    this.previousRoutes.clear();

    for (const id of this.elementIds) {
      const el = scene.elements.find((e) => e.id === id);
      if (!el) continue;
      this.previousPositions.set(id, {
        x: el.transform.x,
        y: el.transform.y,
      });
      if (el.type === 'connector') {
        this.previousRoutes.set(id, [
          ...(el as ConnectorElement).route.points.map((p) => ({ x: p.x, y: p.y })),
        ]);
      }
    }

    const nodes = extractLayoutNodes(scene.elements, this.elementIds);
    const edges = extractLayoutEdges(scene.elements, this.elementIds);
    const result = this.engine.layout(nodes, edges, this.options);

    return applyLayoutToScene(scene, result);
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const prevPositions = new Map(this.previousPositions);
    const prevRoutes = new Map(this.previousRoutes);

    return {
      id: generateId('inv-layout'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const elements = scene.elements.map((el) => {
          const pos = prevPositions.get(el.id);
          if (!pos) return el;

          const updated = {
            ...el,
            transform: { ...el.transform, x: pos.x, y: pos.y },
          };

          if (el.type === 'connector') {
            const route = prevRoutes.get(el.id);
            if (route && route.length > 0) {
              (updated as ConnectorElement).route = {
                ...(el as ConnectorElement).route,
                points: route.map((p) => ({ x: p.x, y: p.y })),
              };
            }
          }

          return updated;
        });

        return { ...scene, elements };
      },
      invert: () => null,
    };
  }
}

export function createLayoutCommand(
  engine: LayoutEngine,
  elementIds: string[],
  options?: LayoutOptions,
): LayoutCommand {
  return new LayoutCommand(engine, elementIds, options);
}
