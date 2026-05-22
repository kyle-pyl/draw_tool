import type { SceneDocument, SceneElement, ConnectorElement, ChartElement, Layer, ElementGroup, GeometryShape } from '../types';
import { generateId } from '../utils';
import { useDocumentStore } from '../store';
import { ErrorCode } from '../errors';
import { successResult, failureResult } from '../errors';
import type { SceneCommand } from './base';
import { getGeometry, createGeometryAdapter } from '../geometry';
import { performBooleanOperation, geometryToSvgPath, type BooleanOperationType } from '../boolean-ops';
import { convertChartSvgToElements } from '../../modules/chart/convert';

// ─── Chart To Vector Command ───────────────────────────────────────────────────

export class ChartToVectorCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private newLayerId: string;
  private newElementIds: string[] = [];
  private newGroupId: string;
  private savedChart: ChartElement | null = null;

  constructor(elementIds: string[], label?: string) {
    this.id = generateId('chart2vec');
    this.elementIds = elementIds;
    this.newLayerId = generateId('chvec');
    this.newGroupId = generateId('chvecgrp');
    this.label = label || `Convert ${elementIds.length} chart(s) to vectors`;
  }

  getNewLayerId(): string {
    return this.newLayerId;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    if (this.elementIds.length === 0) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'No chart elements selected for conversion',
        severity: 'error',
        suggestion: 'Select at least one chart element to convert',
      });
    }

    for (const id of this.elementIds) {
      const el = scene.elements.find((e) => e.id === id);
      if (!el) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${id}" not found`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'The element may have been deleted',
        });
      }
      if (el.type !== 'chart') {
        return failureResult({
          code: 'SCHEMA_INVALID_TYPE',
          message: `Element "${id}" is not a chart element (type: ${el.type})`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'Only chart elements can be converted to vector groups',
        });
      }
      const chartEl = el as ChartElement;
      if (!chartEl.svgContent) {
        return failureResult({
          code: 'SCHEMA_FIELD_TYPE_ERROR',
          message: `Chart element "${id}" has no rendered SVG content`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'Generate the chart first before converting to vectors',
        });
      }
    }

    if (scene.layers.length >= scene.rules.maxLayerCount) {
      return failureResult({
        code: ErrorCode.RULE_MAX_LAYER_EXCEEDED,
        message: 'Cannot create new layer for vector group: maximum layer count reached',
        severity: 'error',
        suggestion: 'Remove an empty layer or increase maxLayerCount',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const newLayer: Layer = {
      id: this.newLayerId,
      name: `Chart Vectors ${this.elementIds.map((id) => `#${id.slice(-4)}`).join(', ')}`,
      order: Math.max(...scene.layers.map((l) => l.order), 0) + 1,
      visible: true,
      locked: false,
    };

    let updatedElements = [...scene.elements];
    const newElements: SceneElement[] = [];
    this.newElementIds = [];

    for (const id of this.elementIds) {
      const idx = updatedElements.findIndex((e) => e.id === id);
      if (idx === -1) continue;
      const chartEl = updatedElements[idx] as ChartElement;
      if (!chartEl.svgContent) continue;

      this.savedChart = { ...chartEl };

      const { elements: convertedEls } = convertChartSvgToElements(chartEl, this.newLayerId);
      for (const convertedEl of convertedEls) {
        newElements.push(convertedEl);
        this.newElementIds.push(convertedEl.id);
      }

      updatedElements.splice(idx, 1);
    }

    for (const el of newElements) {
      updatedElements.push(el);
    }

    const group: ElementGroup = {
      id: this.newGroupId,
      name: `Chart Vector Group`,
      elementIds: [...this.newElementIds],
    };

    return {
      ...scene,
      layers: [...scene.layers, newLayer],
      elements: updatedElements,
      groups: [...scene.groups, group],
    };
  }

  invert(scene: SceneDocument): SceneCommand | null {
    if (!this.savedChart || this.newElementIds.length === 0) return null;

    const savedChart = this.savedChart;
    const newElementIds = this.newElementIds;
    const newLayerId = this.newLayerId;
    const newGroupId = this.newGroupId;

    const invertCmd: SceneCommand = {
      id: generateId('inv-chart2vec'),
      label: `Undo: ${this.label}`,
      validate: () => {
        const store = useDocumentStore.getState();
        if (!store.scene) {
          return failureResult({
            code: 'SCHEMA_MISSING_ID',
            message: 'No scene loaded',
            severity: 'error',
          });
        }
        return successResult();
      },
      execute: (scene: SceneDocument) => {
        const elements = scene.elements.filter(
          (el) => !newElementIds.includes(el.id),
        );
        elements.push(savedChart);
        return {
          ...scene,
          layers: scene.layers.filter((l) => l.id !== newLayerId),
          elements,
          groups: scene.groups.filter((g) => g.id !== newGroupId),
        };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}

// ─── Boolean Operation Command ──────────────────────────────────────────────────

export class BooleanOperationCommand implements SceneCommand {
  id: string;
  label: string;

  private elementIds: string[];
  private operation: BooleanOperationType;
  private newLayerId: string;
  private newElementId: string;
  private savedElements: Map<string, SceneElement>;

  constructor(elementIds: string[], operation: BooleanOperationType, label?: string) {
    this.id = generateId('boolean');
    this.elementIds = elementIds;
    this.operation = operation;
    this.newLayerId = generateId('boolayer');
    this.newElementId = generateId('boolres');
    this.savedElements = new Map();

    const opLabels: Record<BooleanOperationType, string> = {
      union: 'Union',
      intersect: 'Intersect',
      xor: 'XOR',
      subtract: 'Subtract',
    };
    this.label = label || `${opLabels[operation]} ${elementIds.length} shapes`;
  }

  getNewLayerId(): string {
    return this.newLayerId;
  }

  getNewElementId(): string {
    return this.newElementId;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    if (this.elementIds.length < 2) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'Boolean operations require at least 2 elements',
        severity: 'error',
        suggestion: 'Select at least two closed shape elements',
      });
    }

    const shapes: SceneElement[] = [];

    for (const id of this.elementIds) {
      const el = scene.elements.find((e) => e.id === id);
      if (!el) {
        return failureResult({
          code: ErrorCode.REF_GROUP_NOT_FOUND as string,
          message: `Element "${id}" not found`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'The element may have been deleted',
        });
      }
      if (el.locked) {
        return failureResult({
          code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED,
          message: `Element "${id}" is locked and cannot be used in a boolean operation`,
          severity: 'error',
          elementIds: [id],
        });
      }
      if (el.type !== 'shape') {
        return failureResult({
          code: 'SCHEMA_INVALID_TYPE',
          message: `Element "${id}" is not a shape element (type: ${el.type})`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'Boolean operations only support shape elements (polygon, path, rect, circle, ellipse)',
        });
      }
      const geom = getGeometry(el);
      if (geom.paths.length === 0) {
        return failureResult({
          code: 'SCHEMA_FIELD_TYPE_ERROR',
          message: `Element "${id}" has no extractable geometry (shape kind: ${el.shapeKind})`,
          severity: 'error',
          elementIds: [id],
          suggestion: 'Ensure the shape has defined vertices. Path elements may not be supported yet.',
        });
      }
      shapes.push(el);
    }

    if (scene.layers.length >= scene.rules.maxLayerCount) {
      return failureResult({
        code: ErrorCode.RULE_MAX_LAYER_EXCEEDED,
        message: 'Cannot create new layer for boolean result: maximum layer count reached',
        severity: 'error',
        suggestion: 'Remove an empty layer or increase maxLayerCount',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    this.savedElements.clear();

    const geometries = this.elementIds.map((id) => {
      const el = scene.elements.find((e) => e.id === id)!;
      this.savedElements.set(id, { ...el } as SceneElement);
      return getGeometry(el);
    });

    const resultGeom = performBooleanOperation(geometries, this.operation);

    if (resultGeom.paths.length === 0) {
      return scene;
    }

    const pathCommands = geometryToSvgPath(resultGeom);

    const bbox = resultGeom.paths.reduce(
      (acc, path) => {
        for (const p of path) {
          acc.minX = Math.min(acc.minX, p.x);
          acc.minY = Math.min(acc.minY, p.y);
          acc.maxX = Math.max(acc.maxX, p.x);
          acc.maxY = Math.max(acc.maxY, p.y);
        }
        return acc;
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );

    const resultElement: SceneElement = {
      id: this.newElementId,
      type: 'shape',
      shapeKind: 'path',
      layerId: this.newLayerId,
      name: `Boolean ${this.operation} result`,
      transform: {
        x: bbox.minX,
        y: bbox.minY,
        width: bbox.maxX - bbox.minX,
        height: bbox.maxY - bbox.minY,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      style: {
        fill: '#cccccc',
        stroke: '#333333',
        strokeWidth: 2,
        opacity: 1,
      },
      visible: true,
      locked: false,
      pathCommands,
    };

    const newLayer: Layer = {
      id: this.newLayerId,
      name: `Boolean ${this.operation}`,
      order: Math.max(...scene.layers.map((l) => l.order), 0) + 1,
      visible: true,
      locked: false,
    };

    const remainingElements = scene.elements.filter(
      (el) => !this.elementIds.includes(el.id),
    );

    return {
      ...scene,
      layers: [...scene.layers, newLayer],
      elements: [...remainingElements, resultElement],
    };
  }

  invert(scene: SceneDocument): SceneCommand | null {
    if (this.savedElements.size === 0) return null;

    const savedElements = this.savedElements;
    const newLayerId = this.newLayerId;
    const newElementId = this.newElementId;
    const elementIds = this.elementIds;
    const operation = this.operation;

    const invertCmd: SceneCommand = {
      id: generateId('inv-boolean'),
      label: `Undo: ${this.label}`,
      validate: () => {
        const store = useDocumentStore.getState();
        if (!store.scene) {
          return failureResult({
            code: 'SCHEMA_MISSING_ID',
            message: 'No scene loaded',
            severity: 'error',
          });
        }
        return successResult();
      },
      execute: (scene: SceneDocument) => {
        const elements = scene.elements.filter((el) => el.id !== newElementId);
        for (const id of elementIds) {
          const saved = savedElements.get(id);
          if (saved) {
            elements.push({ ...saved } as SceneElement);
          }
        }
        return {
          ...scene,
          layers: scene.layers.filter((l) => l.id !== newLayerId),
          elements,
        };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}

// ─── Clip Element Command ─────────────────────────────────────────────────────

/**
 * Strategy for clipping an element:
 * - shape targets use boolean intersection to produce new geometry
 * - image targets store clip path data in metadata for the renderer to apply
 */
export type ClipStrategy = 'shape' | 'image';

function geometryToRelativeSvgPath(geom: import('../types').GeometryShape): string {
  if (geom.paths.length === 0) return '';

  const bbox = geom.paths.reduce(
    (acc, path) => {
      for (const p of path) {
        acc.minX = Math.min(acc.minX, p.x);
        acc.minY = Math.min(acc.minY, p.y);
        acc.maxX = Math.max(acc.maxX, p.x);
        acc.maxY = Math.max(acc.maxY, p.y);
      }
      return acc;
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

  return geom.paths
    .map((path) => {
      if (path.length === 0) return '';
      const parts = path.map((p, i) => {
        const rx = p.x - bbox.minX;
        const ry = p.y - bbox.minY;
        if (i === 0) return `M ${rx} ${ry}`;
        return `L ${rx} ${ry}`;
      });
      parts.push('Z');
      return parts.join(' ');
    })
    .join(' ');
}

export class ClipElementCommand implements SceneCommand {
  id: string;
  label: string;

  private targetElementId: string;
  private clipShapeId: string;
  private removeClipShape: boolean;
  private savedTarget: SceneElement | null;
  private savedClip: SceneElement | null;
  private savedPrevImageClipPath: string | undefined;

  constructor(
    targetElementId: string,
    clipShapeId: string,
    removeClipShape = true,
    label?: string,
  ) {
    this.id = generateId('clip');
    this.targetElementId = targetElementId;
    this.clipShapeId = clipShapeId;
    this.removeClipShape = removeClipShape;
    this.savedTarget = null;
    this.savedClip = null;
    this.savedPrevImageClipPath = undefined;
    this.label = label || 'Clip element';
  }

  getTargetElementId(): string {
    return this.targetElementId;
  }

  getClipShapeId(): string {
    return this.clipShapeId;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    const target = scene.elements.find((e) => e.id === this.targetElementId);
    if (!target) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Target element "${this.targetElementId}" not found`,
        severity: 'error',
        elementIds: [this.targetElementId],
        suggestion: 'The target element may have been deleted',
      });
    }

    const clip = scene.elements.find((e) => e.id === this.clipShapeId);
    if (!clip) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Clip shape "${this.clipShapeId}" not found`,
        severity: 'error',
        elementIds: [this.clipShapeId],
        suggestion: 'The clip shape element may have been deleted',
      });
    }

    if (target.locked) {
      return failureResult({
        code: ErrorCode.RULE_LOCKED_ELEMENT_EDITED as string,
        message: `Target element "${target.name || target.id}" is locked and cannot be clipped`,
        severity: 'error',
        elementIds: [target.id],
        suggestion: 'Unlock the target element before clipping',
      });
    }

    if (target.type !== 'shape' && target.type !== 'image') {
      return failureResult({
        code: 'SCHEMA_INVALID_TYPE',
        message: `Target element "${target.name || target.id}" has type "${target.type}" — only shape and image elements can be clipped`,
        severity: 'error',
        elementIds: [target.id],
        suggestion: 'Select a shape or image element as the clipping target',
      });
    }

    if (clip.type !== 'shape') {
      return failureResult({
        code: 'SCHEMA_INVALID_TYPE',
        message: `Clip shape "${clip.name || clip.id}" has type "${clip.type}" — only shape elements can be used as clip regions`,
        severity: 'error',
        elementIds: [clip.id],
        suggestion: 'Select a shape element (rect, circle, polygon, path) as the clipping region',
      });
    }

    if (target.type === 'shape') {
      const targetGeom = getGeometry(target);
      if (targetGeom.paths.length === 0) {
        return failureResult({
          code: 'SCHEMA_FIELD_TYPE_ERROR',
          message: `Target element "${target.name || target.id}" has no extractable geometry`,
          severity: 'error',
          elementIds: [target.id],
          suggestion: 'The target shape may not have supported geometry (e.g. path elements may not be supported yet)',
        });
      }
    }

    const clipGeom = getGeometry(clip);
    if (clipGeom.paths.length === 0) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: `Clip shape "${clip.name || clip.id}" has no extractable geometry`,
        severity: 'error',
        elementIds: [clip.id],
        suggestion: 'The clip shape must be a supported shape with extractable geometry',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const target = scene.elements.find((e) => e.id === this.targetElementId)!;
    const clip = scene.elements.find((e) => e.id === this.clipShapeId)!;

    this.savedTarget = JSON.parse(JSON.stringify(target)) as SceneElement;
    this.savedClip = JSON.parse(JSON.stringify(clip)) as SceneElement;

    if (target.type === 'image') {
      this.savedPrevImageClipPath = (target.metadata?.clipSvgPath as string | undefined);

      const clipGeom = getGeometry(clip);
      const clipSvgPath = geometryToSvgPath(clipGeom);

      const updatedTarget = {
        ...target,
        metadata: {
          ...target.metadata,
          clipShapeId: this.clipShapeId,
          clipSvgPath,
        },
      };

      let elements: SceneElement[];
      if (this.removeClipShape) {
        elements = scene.elements
          .filter((e) => e.id !== this.clipShapeId)
          .map((e) => (e.id === this.targetElementId ? updatedTarget : e));
      } else {
        elements = scene.elements.map((e) =>
          e.id === this.targetElementId ? updatedTarget : e,
        );
      }

      return { ...scene, elements };
    }

    const targetGeom = getGeometry(target);
    const clipGeom = getGeometry(clip);
    const resultGeom = performBooleanOperation([targetGeom, clipGeom], 'intersect');

    if (resultGeom.paths.length === 0) {
      const updatedTarget = {
        ...target,
        shapeKind: 'path' as const,
        pathCommands: '',
        visible: false,
      };

      let elements: SceneElement[];
      if (this.removeClipShape) {
        elements = scene.elements
          .filter((e) => e.id !== this.clipShapeId)
          .map((e) => (e.id === this.targetElementId ? updatedTarget : e));
      } else {
        elements = scene.elements.map((e) =>
          e.id === this.targetElementId ? updatedTarget : e,
        );
      }

      return { ...scene, elements };
    }

    const bbox = resultGeom.paths.reduce(
      (acc, path) => {
        for (const p of path) {
          acc.minX = Math.min(acc.minX, p.x);
          acc.minY = Math.min(acc.minY, p.y);
          acc.maxX = Math.max(acc.maxX, p.x);
          acc.maxY = Math.max(acc.maxY, p.y);
        }
        return acc;
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );

    const relativePath = geometryToRelativeSvgPath(resultGeom);

    const updatedTarget: SceneElement = {
      ...target,
      shapeKind: 'path',
      transform: {
        ...target.transform,
        x: bbox.minX,
        y: bbox.minY,
        width: bbox.maxX - bbox.minX,
        height: bbox.maxY - bbox.minY,
      },
      pathCommands: relativePath,
    };

    let elements: SceneElement[];
    if (this.removeClipShape) {
      elements = scene.elements
        .filter((e) => e.id !== this.clipShapeId)
        .map((e) => (e.id === this.targetElementId ? updatedTarget : e));
    } else {
      elements = scene.elements.map((e) =>
        e.id === this.targetElementId ? updatedTarget : e,
      );
    }

    return { ...scene, elements };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    if (!this.savedTarget || !this.savedClip) return null;

    const savedTarget = this.savedTarget;
    const savedClip = this.savedClip;
    const targetElementId = this.targetElementId;
    const clipShapeId = this.clipShapeId;
    const removeClipShape = this.removeClipShape;
    const savedPrevImageClipPath = this.savedPrevImageClipPath;

    const invertCmd: SceneCommand = {
      id: generateId('inv-clip'),
      label: `Undo: ${this.label}`,
      validate: () => {
        const store = useDocumentStore.getState();
        if (!store.scene) {
          return failureResult({
            code: 'SCHEMA_MISSING_ID',
            message: 'No scene loaded',
            severity: 'error',
          });
        }
        return successResult();
      },
      execute: (scene: SceneDocument) => {
        let elements = scene.elements.map((e) => {
          if (e.id === targetElementId) {
            if (savedTarget.type === 'image' && savedPrevImageClipPath !== undefined) {
              return {
                ...savedTarget,
                metadata: {
                  ...savedTarget.metadata,
                  clipSvgPath: savedPrevImageClipPath || undefined,
                  clipShapeId: savedPrevImageClipPath ? clipShapeId : undefined,
                },
              };
            }
            return JSON.parse(JSON.stringify(savedTarget)) as SceneElement;
          }
          return e;
        });

        if (removeClipShape) {
          const clipExists = elements.some((e) => e.id === clipShapeId);
          if (!clipExists) {
            elements.push(JSON.parse(JSON.stringify(savedClip)) as SceneElement);
          }
        }

        return { ...scene, elements };
      },
      invert: () => null,
    };

    return invertCmd;
  }
}
