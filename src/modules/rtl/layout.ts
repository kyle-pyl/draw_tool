/**
 * RTL (Register Transfer Level) hardware module connection diagram
 * layout engine. Arranges modules with default LR (left-to-right)
 * dataflow direction: inputs on left, outputs on right.
 *
 * Features:
 * - Default LR direction (input → output dataflow)
 * - Port-position-aware ordering to minimize edge crossings
 * - Bus line readability optimization (rtl-bus semanticKind)
 * - Clock and reset signal highlighting in edge metadata
 * - Hierarchical module expand/collapse support
 */
import type {
  LayoutEngine,
  LayoutNode,
  LayoutEdge,
  LayoutNodeResult,
  LayoutEdgeResult,
  LayoutResult,
  LayoutOptions,
  LayoutDirection,
} from '../../core/layout';
import { applyLayoutToScene } from '../../core/layout';
import type { SceneElement, ConnectorElement, RtlModuleElement, SceneDocument } from '../../core/types';
import type { SceneCommand } from '../../core/commands';
import type { ValidationResult } from '../../core/errors';
import { successResult, failureResult } from '../../core/errors';
import { ErrorCode } from '../../core/errors';
import { generateId } from '../../core/utils';

const DEFAULT_H_SPACING = 100;
const DEFAULT_V_SPACING = 80;
const DEFAULT_BUS_SPACING = 30;
const COLLAPSED_HEIGHT = 40;

interface GraphNode {
  id: string;
  width: number;
  height: number;
  inEdges: LayoutEdge[];
  outEdges: LayoutEdge[];
  rank: number;
  order: number;
  x: number;
  y: number;
}

/**
 * Compute the barycenter for a node based on connected nodes in
 * adjacent ranks. Used for crossing reduction within each rank.
 *
 * For RTL, edges carry port position information in metadata
 * (sourcePortIndex / targetPortIndex), allowing the ordering
 * to align ports that should be visually matched.
 */
function computeBarycenter(
  node: GraphNode,
  nodesById: Map<string, GraphNode>,
  prevRank: boolean,
): number {
  const edges = prevRank ? node.inEdges : node.outEdges;
  if (edges.length === 0) return node.order;

  let sum = 0;
  let count = 0;
  for (const edge of edges) {
    const neighborId = prevRank ? edge.source : edge.target;
    const neighbor = nodesById.get(neighborId);
    if (!neighbor) continue;

    let weight = 1;
    const portMeta = edge.metadata as Record<string, unknown> | undefined;
    if (portMeta) {
      const idx = prevRank
        ? (portMeta.targetPortIndex as number)
        : (portMeta.sourcePortIndex as number);
      if (typeof idx === 'number' && idx >= 0) {
        weight += (idx + 1) * 0.3;
      }
    }
    sum += neighbor.order * weight;
    count += weight;
  }
  return count > 0 ? sum / count : node.order;
}

/**
 * Build internal graph from LayoutNode and LayoutEdge inputs.
 */
function buildGraph(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
): {
  graphNodes: GraphNode[];
  nodesById: Map<string, GraphNode>;
} {
  const nodesById = new Map<string, GraphNode>();
  const graphNodes: GraphNode[] = [];

  for (const node of nodes) {
    const gn: GraphNode = {
      id: node.id,
      width: node.width,
      height: node.height,
      inEdges: [],
      outEdges: [],
      rank: 0,
      order: 0,
      x: 0,
      y: 0,
    };
    nodesById.set(node.id, gn);
    graphNodes.push(gn);
  }

  for (const edge of edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) continue;
    if (edge.source === edge.target) continue;

    source.outEdges.push(edge);
    target.inEdges.push(edge);
  }

  return { graphNodes, nodesById };
}

/**
 * Assign ranks using longest-path algorithm from source nodes.
 */
function assignRanks(
  graphNodes: GraphNode[],
  nodesById: Map<string, GraphNode>,
): void {
  const visited = new Map<string, number>();

  function dfs(nodeId: string, rank: number): void {
    const current = visited.get(nodeId);
    if (current !== undefined && current >= rank) return;
    visited.set(nodeId, rank);

    const node = nodesById.get(nodeId);
    if (!node) return;
    node.rank = rank;

    for (const edge of node.outEdges) {
      dfs(edge.target, rank + 1);
    }
  }

  const sources = graphNodes.filter((n) => n.inEdges.length === 0);

  if (sources.length === 0 && graphNodes.length > 0) {
    dfs(graphNodes[0].id, 0);
  } else {
    for (const source of sources) {
      dfs(source.id, 0);
    }
  }

  for (const node of graphNodes) {
    if (!visited.has(node.id)) {
      node.rank = 0;
    }
  }
}

/**
 * Order nodes within each rank to minimize edge crossings.
 * Uses the barycenter heuristic with port-position awareness.
 */
function orderNodes(
  graphNodes: GraphNode[],
  nodesById: Map<string, GraphNode>,
): void {
  const ranks = new Map<number, GraphNode[]>();
  for (const node of graphNodes) {
    const list = ranks.get(node.rank) ?? [];
    list.push(node);
    ranks.set(node.rank, list);
  }

  const sortedRanks = [...ranks.keys()].sort((a, b) => a - b);
  const ITERATIONS = 12;

  for (const rank of sortedRanks) {
    const nodesInRank = ranks.get(rank)!;
    nodesInRank.sort((a, b) => a.id.localeCompare(b.id));
    nodesInRank.forEach((n, i) => { n.order = i; });
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const forward = iter % 2 === 0;

    if (forward) {
      for (let i = 1; i < sortedRanks.length; i++) {
        const rank = sortedRanks[i];
        const nodesInRank = ranks.get(rank)!;
        for (const node of nodesInRank) {
          node.order = computeBarycenter(node, nodesById, true);
        }
        nodesInRank.sort((a, b) => a.order - b.order);
        nodesInRank.forEach((n, i) => { n.order = i; });
      }
    } else {
      for (let i = sortedRanks.length - 2; i >= 0; i--) {
        const rank = sortedRanks[i];
        const nodesInRank = ranks.get(rank)!;
        for (const node of nodesInRank) {
          node.order = computeBarycenter(node, nodesById, false);
        }
        nodesInRank.sort((a, b) => a.order - b.order);
        nodesInRank.forEach((n, i) => { n.order = i; });
      }
    }
  }
}

/**
 * Compute final (x, y) positions for each node.
 * For RTL the default is LR (left-to-right).
 */
function assignPositions(
  graphNodes: GraphNode[],
  direction: LayoutDirection,
  hSpacing: number,
  vSpacing: number,
  busSpacing: number,
): void {
  const ranks = new Map<number, GraphNode[]>();
  for (const node of graphNodes) {
    const list = ranks.get(node.rank) ?? [];
    list.push(node);
    ranks.set(node.rank, list);
  }

  const sortedRanks = [...ranks.keys()].sort((a, b) => a - b);

  if (direction === 'TB' || direction === 'BT') {
    let rankY = 0;
    for (const rank of sortedRanks) {
      const nodesInRank = ranks.get(rank)!;
      nodesInRank.sort((a, b) => a.order - b.order);

      let totalWidth = 0;
      let maxHeight = 0;
      for (const n of nodesInRank) {
        totalWidth += n.width;
        maxHeight = Math.max(maxHeight, n.height);
      }
      totalWidth += (nodesInRank.length - 1) * hSpacing;

      let x = -totalWidth / 2;
      for (const node of nodesInRank) {
        node.x = x;
        node.y = rankY + (maxHeight - node.height) / 2;
        x += node.width + hSpacing;
      }
      rankY += maxHeight + vSpacing;
    }

    if (direction === 'BT') {
      const maxY = rankY - vSpacing;
      for (const node of graphNodes) {
        node.y = maxY - node.y - node.height;
      }
    }
  } else {
    let rankX = 0;
    for (const rank of sortedRanks) {
      const nodesInRank = ranks.get(rank)!;
      nodesInRank.sort((a, b) => a.order - b.order);

      let totalHeight = 0;
      let maxWidth = 0;
      for (const n of nodesInRank) {
        totalHeight += n.height;
        maxWidth = Math.max(maxWidth, n.width);
      }
      totalHeight += (nodesInRank.length - 1) * vSpacing;

      let y = -totalHeight / 2;
      for (const node of nodesInRank) {
        node.x = rankX + (maxWidth - node.width) / 2;
        node.y = y;
        y += node.height + vSpacing;
      }
      rankX += maxWidth + hSpacing;
    }

    if (direction === 'RL') {
      const maxX = rankX - hSpacing;
      for (const node of graphNodes) {
        node.x = maxX - node.x - node.width;
      }
    }
  }
}

/**
 * Compute edge route waypoints. For LR layout, edges exit from
 * the right of the source and enter the left of the target.
 * Bus lines get extra offset for visual separation.
 */
function computeEdgeRoutes(
  nodesById: Map<string, GraphNode>,
  edges: LayoutEdge[],
  direction: LayoutDirection,
  busSpacing: number,
): LayoutEdgeResult[] {
  const results: LayoutEdgeResult[] = [];

  for (const edge of edges) {
    const sourceNode = nodesById.get(edge.source);
    const targetNode = nodesById.get(edge.target);
    if (!sourceNode || !targetNode) continue;

    const sx = sourceNode.x;
    const sy = sourceNode.y;
    const sw = sourceNode.width;
    const sh = sourceNode.height;
    const tx = targetNode.x;
    const ty = targetNode.y;
    const tw = targetNode.width;
    const th = targetNode.height;

    const isBus = edge.metadata?.signalType === 'rtl-bus';
    const busOffset = isBus ? busSpacing : 0;

    let points: { x: number; y: number }[];
    let routeMetadata: Record<string, unknown> | undefined;

    if (direction === 'TB' || direction === 'BT') {
      const sourceBottom = { x: sx + sw / 2 + busOffset, y: sy + sh };
      const targetTop = { x: tx + tw / 2 + busOffset, y: ty };
      const midY = (sourceBottom.y + targetTop.y) / 2;
      points = [
        sourceBottom,
        { x: sourceBottom.x, y: midY },
        { x: targetTop.x, y: midY },
        targetTop,
      ];
    } else {
      const sourceRight = { x: sx + sw, y: sy + sh / 2 + busOffset };
      const targetLeft = { x: tx, y: ty + th / 2 + busOffset };
      const midX = (sourceRight.x + targetLeft.x) / 2;
      points = [
        sourceRight,
        { x: midX, y: sourceRight.y },
        { x: midX, y: targetLeft.y },
        targetLeft,
      ];
    }

    if (edge.metadata) {
      routeMetadata = { ...(edge.metadata as Record<string, unknown>) };
    }
    if (isBus) {
      routeMetadata = { ...(routeMetadata ?? {}), busRouted: true };
    }

    results.push({
      source: edge.source,
      target: edge.target,
      connectorId: edge.connectorId,
      points,
      ...(routeMetadata ? { metadata: routeMetadata } as Partial<LayoutEdgeResult> : {}),
    });
  }

  return results;
}

/**
 * Compute total bounding box covering all positioned nodes.
 */
function computeTotalBBox(graphNodes: GraphNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (graphNodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of graphNodes) {
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
 * Additional options specific to RTL hardware layout.
 */
export interface RtlLayoutOptions extends LayoutOptions {
  /** Whether to add metadata hints for clock/reset signal highlighting */
  highlightClockReset?: boolean;
  /** Additional vertical offset for bus lines (default 30) */
  busSpacing?: number;
}

/**
 * Extract LayoutNode inputs from scene elements with RTL-specific handling.
 *
 * - rtlModule elements: uses the module's transform dimensions.
 * - Collapsed modules use a reduced height for layout purposes.
 * - rtlPort elements are excluded (they are rendered relative to their parent module).
 * - Includes port count metadata for ordering hints.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of elements to include as layout nodes
 * @returns Array of LayoutNode inputs
 */
export function extractRtlLayoutNodes(
  elements: SceneElement[],
  elementIds: Set<string>,
): LayoutNode[] {
  return elements
    .filter((el) => elementIds.has(el.id) && el.type !== 'connector' && el.type !== 'rtlPort')
    .map((el) => {
      let width = el.transform.width;
      let height = el.transform.height;
      const meta: Record<string, unknown> = { ...(el.metadata as Record<string, unknown> ?? {}) };

      if (el.type === 'rtlModule') {
        const mod = el as RtlModuleElement;
        meta.moduleName = mod.moduleName;
        meta.instanceName = mod.instanceName;
        meta.collapsed = mod.collapsed ?? false;
        meta.portCount = mod.ports?.length ?? 0;

        if (mod.collapsed) {
          height = COLLAPSED_HEIGHT;
        }

        const portMeta: Array<{ direction: string; portName: string; bitWidth: number }> = [];
        if (mod.ports) {
          for (const p of mod.ports) {
            portMeta.push({
              direction: p.direction,
              portName: p.portName,
              bitWidth: p.bitWidth,
            });
          }
        }
        meta.ports = portMeta;

        const inputPorts = portMeta.filter((p) => p.direction === 'input');
        const outputPorts = portMeta.filter((p) => p.direction === 'output');
        meta.inputPortCount = inputPorts.length;
        meta.outputPortCount = outputPorts.length;

        const inputNames = inputPorts.map((p) => p.portName.toLowerCase());
        meta.hasClock = inputNames.includes('clk');
        meta.hasReset = inputNames.includes('rst') || inputNames.includes('reset');
      }

      return {
        id: el.id,
        width,
        height,
        metadata: meta,
      };
    });
}

/**
 * Extract LayoutEdge inputs from scene connector elements with RTL-specific
 * enrichment. Adds port connection info, signal type (net/bus), and
 * clock/reset detection to the edge metadata.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of layout nodes (only edges between these are extracted)
 * @returns Array of LayoutEdge inputs enriched with RTL metadata
 */
export function extractRtlLayoutEdges(
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
    .map((el) => {
      const meta: Record<string, unknown> = { ...(el.metadata as Record<string, unknown> ?? {}) };

      // RTL signal type from semanticKind
      const isRtlBus = el.semanticKind === 'rtl-bus';
      const isRtlNet = el.semanticKind === 'rtl-net';
      if (isRtlBus) {
        meta.signalType = 'rtl-bus';
      } else if (isRtlNet) {
        meta.signalType = 'rtl-net';
      }

      // Source port info
      if (el.source.anchorId) {
        meta.sourcePort = el.source.anchorId;
      }

      // Target port info
      if (el.target.anchorId) {
        meta.targetPort = el.target.anchorId;
      }

      // Check for clock/reset signals from labels or port names
      const sourcePortName = el.source.anchorId?.toLowerCase() ?? '';
      const targetPortName = el.target.anchorId?.toLowerCase() ?? '';
      if (
        sourcePortName === 'clk' ||
        targetPortName === 'clk' ||
        sourcePortName === 'clock' ||
        targetPortName === 'clock'
      ) {
        meta.signalType = 'clock';
        meta.highlightSignal = 'clock';
      } else if (
        sourcePortName === 'rst' ||
        targetPortName === 'rst' ||
        sourcePortName === 'reset' ||
        targetPortName === 'reset'
      ) {
        meta.signalType = 'reset';
        meta.highlightSignal = 'reset';
      }

      // Check labels for signal names containing clk/rst
      if (!meta.highlightSignal && el.labels) {
        for (const label of el.labels) {
          const lt = label.text.toLowerCase();
          if (lt === 'clk' || lt === 'clock') {
            meta.highlightSignal = 'clock';
            meta.signalName = label.text;
            break;
          }
          if (lt === 'rst' || lt === 'reset') {
            meta.highlightSignal = 'reset';
            meta.signalName = label.text;
            break;
          }
        }
      }

      return {
        source: el.source.elementId!,
        target: el.target.elementId!,
        connectorId: el.id,
        metadata: meta,
      };
    });
}

/**
 * RtlLayoutEngine implements the LayoutEngine interface with RTL-specific
 * layout features:
 *
 * - Default LR (left-to-right) direction for dataflow
 * - Port-position-aware node ordering to reduce crossings
 * - Bus line detection with visual offset in routing
 * - Clock and reset signal identification in edge metadata
 * - Collapsed module support (reduced height in layout)
 */
export class RtlLayoutEngine implements LayoutEngine {
  readonly name = 'rtl-layout';

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

    const direction: LayoutDirection = options?.direction ?? 'LR';
    const hSpacing = options?.hSpacing ?? DEFAULT_H_SPACING;
    const vSpacing = options?.vSpacing ?? DEFAULT_V_SPACING;
    const extraOpts = options?.extra as Record<string, unknown> | undefined;
    const busSpacing =
      (typeof extraOpts?.busSpacing === 'number'
        ? extraOpts.busSpacing
        : DEFAULT_BUS_SPACING);

    const { graphNodes, nodesById } = buildGraph(nodes, edges);

    assignRanks(graphNodes, nodesById);

    orderNodes(graphNodes, nodesById);

    assignPositions(graphNodes, direction, hSpacing, vSpacing, busSpacing);

    const filteredEdges = edges.filter(
      (e) =>
        e.source !== e.target &&
        nodesById.has(e.source) &&
        nodesById.has(e.target),
    );

    const nodeResults: LayoutNodeResult[] = graphNodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
    }));

    const edgeResults = computeEdgeRoutes(
      nodesById,
      filteredEdges,
      direction,
      busSpacing,
    );

    const totalBBox = computeTotalBBox(graphNodes);

    return {
      nodes: nodeResults,
      edges: edgeResults,
      totalBBox,
    };
  }
}

/** Singleton instance of the RTL layout engine. */
export const rtlLayoutEngine = new RtlLayoutEngine();

/**
 * Command that runs RTL layout on selected elements using
 * RTL-specific node/edge extraction (port info, signal type, etc.).
 * Conforms to the SceneCommand interface and supports undo/redo.
 */
export class RtlLayoutCommand implements SceneCommand {
  id: string;
  label: string;

  private engine: RtlLayoutEngine;
  private elementIds: Set<string>;
  private options: RtlLayoutOptions;
  private previousPositions: Map<string, { x: number; y: number }>;
  private previousRoutes: Map<string, { x: number; y: number }[]>;

  constructor(
    engine: RtlLayoutEngine,
    elementIds: string[],
    options?: RtlLayoutOptions,
  ) {
    this.id = generateId('cmd-rtl-layout');
    this.label = `RTL Layout (${engine.name})`;
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
        message: 'No elements selected for RTL layout',
        severity: 'error',
        suggestion: 'Select RTL modules and connectors to arrange',
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
          ...(el as any).route.points.map((p: any) => ({ x: p.x, y: p.y })),
        ]);
      }
    }

    const nodes = extractRtlLayoutNodes(scene.elements, this.elementIds);
    const edges = extractRtlLayoutEdges(scene.elements, this.elementIds);
    const result = this.engine.layout(nodes, edges, this.options);

    return applyLayoutToScene(scene, result);
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const prevPositions = new Map(this.previousPositions);
    const prevRoutes = new Map(this.previousRoutes);

    return {
      id: generateId('inv-rtl-layout'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const elements = scene.elements.map((el) => {
          const pos = prevPositions.get(el.id);
          if (!pos) return el;

          const updated = {
            ...el,
            transform: { ...el.transform, x: pos.x, y: pos.y },
          } as any;

          if (el.type === 'connector') {
            const route = prevRoutes.get(el.id);
            if (route && route.length > 0) {
              updated.route = {
                ...(el as any).route,
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
 * Create an RTL layout command with the default engine.
 *
 * @param elementIds - IDs of elements to lay out (modules + connectors)
 * @param options - RTL-specific layout options
 */
export function createRtlLayoutCommand(
  elementIds: string[],
  options?: RtlLayoutOptions,
): RtlLayoutCommand {
  return new RtlLayoutCommand(rtlLayoutEngine, elementIds, options);
}
