/**
 * Mind map layout engine — implements automatic tree layout for mind map
 * diagrams. Supports two layout modes:
 *
 * - **lr-split**: Root node centered, children alternate between left and
 *   right sides, each branch extends outward as a directional tree.
 * - **radial**: Root node centered, children distributed radially in sectors.
 *
 * Features:
 * - Collapsed nodes (MindNodeElement.collapsed === true) excluded from layout
 * - Branch connections use cubic bezier curves (arc-style routing)
 * - Supports undo/redo via MindmapLayoutCommand
 */

import type {
  LayoutEngine,
  LayoutNode,
  LayoutEdge,
  LayoutNodeResult,
  LayoutEdgeResult,
  LayoutResult,
  LayoutOptions,
} from '../../core/layout';
import {
  applyLayoutToScene,
} from '../../core/layout';
import type {
  SceneElement,
  ConnectorElement,
  MindNodeElement,
  SceneDocument,
  BBox,
} from '../../core/types';
import type { SceneCommand } from '../../core/commands';
import type { ValidationResult } from '../../core/errors';
import { successResult, failureResult } from '../../core/errors';
import { ErrorCode } from '../../core/errors';
import { generateId } from '../../core/utils';

/** Layout mode for mind map — either radial or left-right split. */
export type MindmapLayoutMode = 'radial' | 'lr-split';

/** Default spacing values. */
const DEFAULT_H_SPACING = 60;
const DEFAULT_V_SPACING = 30;
const DEFAULT_RADIAL_RADIUS_INCR = 120;

/** Spacing context passed through recursive layout functions. */
interface SpacingContext {
  hSpacing: number;
  vSpacing: number;
}

/** Internal tree node for recursive layout. */
interface MindTree {
  id: string;
  width: number;
  height: number;
  parentId?: string;
  parent?: MindTree;
  children: MindTree[];
  collapsed: boolean;
  x: number;
  y: number;
  subtreeW: number;
  subtreeH: number;
  depth: number;
}

/**
 * Extended options for mind map layout.
 */
export interface MindmapLayoutOptions extends LayoutOptions {
  /** Layout mode: 'radial' or 'lr-split' (default) */
  mode?: MindmapLayoutMode;
}

/**
 * Extract LayoutNode inputs from scene elements with mind-map-specific
 * handling. Reads parentId, childrenIds, and collapsed state from
 * MindNodeElement metadata.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of elements to include as layout nodes
 * @returns Array of LayoutNode inputs with mind map metadata
 */
export function extractMindmapLayoutNodes(
  elements: SceneElement[],
  elementIds: Set<string>,
): LayoutNode[] {
  return elements
    .filter(
      (el) => elementIds.has(el.id) && (el.type === 'mindNode' || el.type === 'shape'),
    )
    .map((el) => {
      const meta: Record<string, unknown> = { ...(el.metadata as Record<string, unknown> ?? {}) };

      if (el.type === 'mindNode') {
        const mindNode = el as MindNodeElement;
        meta.parentId = mindNode.parentId;
        meta.childrenIds = mindNode.childrenIds;
        meta.collapsed = mindNode.collapsed ?? false;
        meta.text = mindNode.text;
      }

      return {
        id: el.id,
        width: el.transform.width,
        height: el.transform.height,
        metadata: meta,
      };
    });
}

/**
 * Extract LayoutEdge inputs from scene elements for mind map edges.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of layout nodes
 * @returns Array of LayoutEdge inputs
 */
export function extractMindmapLayoutEdges(
  elements: SceneElement[],
  elementIds: Set<string>,
): LayoutEdge[] {
  return elements
    .filter(
      (el): el is ConnectorElement =>
        el.type === 'connector' &&
        !!el.source.elementId &&
        elementIds.has(el.source.elementId) &&
        !!el.target.elementId &&
        elementIds.has(el.target.elementId),
    )
    .map((el) => ({
      source: el.source.elementId!,
      target: el.target.elementId!,
      connectorId: el.id,
      metadata: el.metadata as Record<string, unknown> | undefined,
    }));
}

/**
 * Build the mind map tree from layout nodes using parentId/childrenIds
 * metadata. Collapsed subtrees are excluded from the tree (children of
 * collapsed nodes are not added).
 *
 * Orphan nodes (without a valid parentId) are attached as children of
 * the root so they still participate in layout.
 */
function buildTree(nodes: LayoutNode[]): MindTree | null {
  const nodeMap = new Map<string, MindTree>();

  for (const node of nodes) {
    const meta = node.metadata as Record<string, unknown> | undefined;
    const tree: MindTree = {
      id: node.id,
      width: node.width,
      height: node.height,
      parentId: meta?.parentId as string | undefined,
      children: [],
      collapsed: (meta?.collapsed as boolean) ?? false,
      x: 0,
      y: 0,
      subtreeW: node.width,
      subtreeH: node.height,
      depth: 0,
    };
    nodeMap.set(node.id, tree);
  }

  let root: MindTree | null = null;
  const orphans: MindTree[] = [];

  for (const node of nodeMap.values()) {
    if (!node.parentId || !nodeMap.has(node.parentId)) {
      if (!root) {
        root = node;
      } else {
        orphans.push(node);
      }
      continue;
    }
    const parent = nodeMap.get(node.parentId)!;
    if (parent.collapsed) continue;
    node.parent = parent;
    parent.children.push(node);
  }

  // If no explicit root found, use the first node
  if (!root && nodeMap.size > 0) {
    root = nodeMap.values().next().value!;
  }

  // Attach orphan nodes to root
  if (root && orphans.length > 0) {
    for (const orphan of orphans) {
      if (orphan.id !== root.id) {
        orphan.parent = root;
        root.children.push(orphan);
      }
    }
  }

  return root;
}

/**
 * Compute subtree dimensions for each node recursively.
 */
function computeSubtreeSizes(node: MindTree, mode: MindmapLayoutMode, sp: SpacingContext): void {
  if (node.children.length === 0) {
    node.subtreeW = node.width;
    node.subtreeH = node.height;
    return;
  }

  for (const child of node.children) {
    computeSubtreeSizes(child, mode, sp);
  }

  if (mode === 'radial') {
    let w = 0;
    let h = 0;
    for (const child of node.children) {
      w += child.subtreeW;
      h = Math.max(h, child.subtreeH);
    }
    node.subtreeW = Math.max(node.width, w);
    node.subtreeH = node.height + sp.vSpacing + h;
  } else {
    // lr-split: horizontal layout per branch
    let maxChildW = 0;
    let totalChildH = 0;
    for (const child of node.children) {
      maxChildW = Math.max(maxChildW, child.subtreeW);
      totalChildH += child.subtreeH + (node.children.length > 1 ? sp.vSpacing : 0);
    }
    node.subtreeW = node.width + sp.hSpacing + maxChildW;
    node.subtreeH = Math.max(node.height, totalChildH - sp.vSpacing);
  }
}

/**
 * Arrange a subtree in lr-split mode.
 * Children are arranged horizontally (side by side in a row),
 * with alternating left/right for the first level from root.
 */
function layoutLrSplit(
  node: MindTree,
  x: number,
  y: number,
  isRightSide: boolean,
  depth: number,
  sp: SpacingContext,
): void {
  node.x = x;
  node.y = y;
  node.depth = depth;

  if (node.children.length === 0) return;

  let childY = y;

  for (const child of node.children) {
    if (depth === 0) {
      // Root's children: alternate left/right
      const idx = node.children.indexOf(child);
      if (idx % 2 === 0) {
        // Right side
        const childX = x + node.width + sp.hSpacing;
        layoutLrSplit(child, childX, childY, true, depth + 1, sp);
      } else {
        // Left side
        const childX = x - child.subtreeW - sp.hSpacing;
        layoutLrSplit(child, childX, childY, false, depth + 1, sp);
      }
      childY += child.subtreeH + sp.vSpacing;
    } else {
      // Non-root: extend in the same direction
      if (isRightSide) {
        const childX = x + node.width + sp.hSpacing;
        layoutLrSplit(child, childX, childY, isRightSide, depth + 1, sp);
      } else {
        const childX = x - child.subtreeW;
        layoutLrSplit(child, childX, childY, isRightSide, depth + 1, sp);
      }
      childY += child.subtreeH + sp.vSpacing;
    }
  }
}

/**
 * Arrange a subtree in radial mode.
 * Root at center, children distributed around root at level-based radius.
 */
function layoutRadial(
  node: MindTree,
  x: number,
  y: number,
  startAngle: number,
  endAngle: number,
  level: number,
  mode: MindmapLayoutMode,
): void {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const radius = DEFAULT_RADIAL_RADIUS_INCR * level;
  const angleRange = endAngle - startAngle;
  const childCount = node.children.length;

  for (let i = 0; i < childCount; i++) {
    const child = node.children[i];
    const angle = childCount > 1
      ? startAngle + (angleRange * i) / (childCount - 1)
      : startAngle + angleRange / 2;
    const rad = (angle * Math.PI) / 180;

    const cx = x + Math.cos(rad) * radius;
    const cy = y + Math.sin(rad) * radius;

    const sectorHalf = childCount > 1
      ? (angleRange / childCount) / 2
      : angleRange / 2;
    const childStart = angle - sectorHalf * 0.6;
    const childEnd = angle + sectorHalf * 0.6;

    layoutRadial(child, cx, cy, childStart, childEnd, level + 1, mode);
  }
}

/**
 * Normalize positions so that the bounding box starts at (0, 0),
 * and center the root if requested.
 */
function normalizePositions(nodeMap: Map<string, MindTree>): BBox {
  if (nodeMap.size === 0) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodeMap.values()) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Compute cubic bezier edge routes from parent to child.
 * Uses control points to create smooth arcs.
 */
function computeCurvedEdgeRoutes(
  nodeMap: Map<string, MindTree>,
  edges: LayoutEdge[],
): LayoutEdgeResult[] {
  const results: LayoutEdgeResult[] = [];

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) continue;

    const sx = sourceNode.x + sourceNode.width / 2;
    const sy = sourceNode.y + sourceNode.height / 2;
    const tx = targetNode.x + targetNode.width / 2;
    const ty = targetNode.y + targetNode.height / 2;

    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const cp1x = sx + dx * 0.4;
    const cp1y = sy + dy * 0.1;
    const cp2x = sx + dx * 0.6;
    const cp2y = sy + dy * 0.9;

    const steps = Math.max(8, Math.floor(dist / 10));
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x =
        (1 - t) ** 3 * sx +
        3 * (1 - t) ** 2 * t * cp1x +
        3 * (1 - t) * t ** 2 * cp2x +
        t ** 3 * tx;
      const y =
        (1 - t) ** 3 * sy +
        3 * (1 - t) ** 2 * t * cp1y +
        3 * (1 - t) * t ** 2 * cp2y +
        t ** 3 * ty;
      points.push({ x, y });
    }

    results.push({
      source: edge.source,
      target: edge.target,
      connectorId: edge.connectorId,
      points,
    });
  }

  return results;
}

/**
 * Compute the total bounding box covering all positioned nodes.
 */
function computeTotalBBox(nodeMap: Map<string, MindTree>): BBox {
  return normalizePositions(nodeMap);
}

/**
 * MindmapLayoutEngine implements the LayoutEngine interface for mind map
 * diagrams. Supports two layout modes:
 *
 * - **lr-split** (default): Root centered, children alternate left/right.
 *   Each branch extends outward horizontally.
 * - **radial**: Root centered, children distributed radially around the root
 *   with increasing level-based radius.
 */
export class MindmapLayoutEngine implements LayoutEngine {
  readonly name = 'mindmap-layout';

  layout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    options?: LayoutOptions,
  ): LayoutResult {
    if (nodes.length === 0) {
      return {
        nodes: [],
        edges: [],
        totalBBox: { x: 0, y: 0, width: 0, height: 0 },
      };
    }

    const extra = options?.extra as Record<string, unknown> | undefined;
    const mode: MindmapLayoutMode =
      (extra?.mode as MindmapLayoutMode) ?? 'lr-split';

    const sp: SpacingContext = {
      hSpacing: options?.hSpacing ?? DEFAULT_H_SPACING,
      vSpacing: options?.vSpacing ?? DEFAULT_V_SPACING,
    };

    const tree = buildTree(nodes);
    if (!tree) {
      return {
        nodes: [],
        edges: [],
        totalBBox: { x: 0, y: 0, width: 0, height: 0 },
      };
    }

    const nodeMap = new Map<string, MindTree>();
    function collectTree(node: MindTree): void {
      nodeMap.set(node.id, node);
      for (const child of node.children) {
        collectTree(child);
      }
    }
    collectTree(tree);

    computeSubtreeSizes(tree, mode, sp);

    if (mode === 'radial') {
      layoutRadial(tree, 0, 0, 0, 360, 1, mode);
    } else {
      layoutLrSplit(tree, 0, -tree.subtreeH / 2, true, 0, sp);
    }

    const filteredEdges = edges.filter(
      (e) =>
        e.source !== e.target &&
        nodeMap.has(e.source) &&
        nodeMap.has(e.target),
    );

    const nodeResults: LayoutNodeResult[] = [];
    for (const [id, node] of nodeMap) {
      nodeResults.push({ id, x: node.x, y: node.y });
    }

    const edgeResults = computeCurvedEdgeRoutes(nodeMap, filteredEdges);
    const totalBBox = computeTotalBBox(nodeMap);

    return {
      nodes: nodeResults,
      edges: edgeResults,
      totalBBox,
    };
  }
}

/** Singleton instance of the mind map layout engine. */
export const mindmapLayoutEngine = new MindmapLayoutEngine();

/**
 * Command that runs mind map layout on selected elements using
 * mind-map-specific node/edge extraction (tree structure, collapsed state).
 * Conforms to the SceneCommand interface and supports undo/redo.
 */
export class MindmapLayoutCommand implements SceneCommand {
  id: string;
  label: string;

  private engine: MindmapLayoutEngine;
  private elementIds: Set<string>;
  private options: MindmapLayoutOptions;
  private previousPositions: Map<string, { x: number; y: number }>;
  private previousRoutes: Map<string, { x: number; y: number }[]>;

  constructor(
    engine: MindmapLayoutEngine,
    elementIds: string[],
    options?: MindmapLayoutOptions,
  ) {
    this.id = generateId('cmd-mindmap-layout');
    this.label = `Mind Map Layout (${engine.name})`;
    this.engine = engine;
    this.elementIds = new Set(elementIds);
    this.options = options ?? {};
    this.previousPositions = new Map();
    this.previousRoutes = new Map();
  }

  validate(scene: SceneDocument): ValidationResult {
    if (this.elementIds.size === 0) {
      return failureResult({
        code: 'LAYOUT_NO_ELEMENTS',
        message: 'No elements selected for mind map layout',
        severity: 'error',
        suggestion: 'Select mind map nodes and connectors to arrange',
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

    const nodes = extractMindmapLayoutNodes(scene.elements, this.elementIds);
    const edges = extractMindmapLayoutEdges(scene.elements, this.elementIds);
    const result = this.engine.layout(nodes, edges, this.options);

    return applyLayoutToScene(scene, result);
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const prevPositions = new Map(this.previousPositions);
    const prevRoutes = new Map(this.previousRoutes);

    return {
      id: generateId('inv-mindmap-layout'),
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

/**
 * Create a mind map layout command with the default engine.
 *
 * @param elementIds - IDs of elements to lay out (nodes + connectors)
 * @param options - Mind-map-specific layout options
 */
export function createMindmapLayoutCommand(
  elementIds: string[],
  options?: MindmapLayoutOptions,
): MindmapLayoutCommand {
  return new MindmapLayoutCommand(mindmapLayoutEngine, elementIds, options);
}
