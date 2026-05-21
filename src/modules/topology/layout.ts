/**
 * Network topology layout engine — implements automatic hierarchical layout
 * for network topology diagrams. Supports two layout modes:
 *
 * - **hierarchical** (default): Arranges devices by network tier
 *   (core → distribution/aggregation → access → edge), grouped top-to-bottom.
 *   Subnet containers (dashed border) encompass internal devices.
 * - **force-directed**: Simple force-directed placement for non-hierarchical scenarios.
 *
 * Features:
 * - Device-type-aware rank assignment (router=core, switch=distribution, server=access, etc.)
 * - Subnet/container elements expand to bound their child devices
 * - Link labels displayed near edge midpoints
 * - Network-specific edge metadata (bandwidth, latency, link type)
 * - Supports undo/redo via TopologyLayoutCommand
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
import type {
  SceneElement,
  ConnectorElement,
  TopologyNodeElement,
  ContainerElement,
  SceneDocument,
  BBox,
} from '../../core/types';
import type { SceneCommand } from '../../core/commands';
import type { ValidationResult } from '../../core/errors';
import { successResult, failureResult } from '../../core/errors';
import { ErrorCode } from '../../core/errors';
import { generateId } from '../../core/utils';

/** Layout mode for topology — hierarchical or force-directed. */
export type TopologyLayoutMode = 'hierarchical' | 'force-directed';

/** Default spacing values. */
const DEFAULT_H_SPACING = 100;
const DEFAULT_V_SPACING = 80;

/** Device type → rank mapping for hierarchical layout. */
const DEVICE_RANK: Record<string, number> = {
  router: 0,       // core layer
  switch: 1,       // distribution layer
  firewall: 2,     // security / aggregation layer
  loadBalancer: 2,
  gateway: 2,
  server: 3,       // access / edge layer
  cloud: 2,        // cloud (variable, placed mid)
  custom: 2,       // default mid layer
};

/** Spacing context for layout functions. */
interface SpacingContext {
  hSpacing: number;
  vSpacing: number;
}

/** Internal graph node for hierarchical layout. */
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

/** Container grouping info for subnet regions. */
interface ContainerInfo {
  id: string;
  childIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extended options for topology layout.
 */
export interface TopologyLayoutOptions extends LayoutOptions {
  /** Layout mode: 'hierarchical' (default) or 'force-directed' */
  mode?: TopologyLayoutMode;
  /** Container padding in canvas units (default 30) */
  containerPadding?: number;
}

/**
 * Extract LayoutNode inputs from scene elements for topology layout.
 *
 * Reads deviceType, label, and properties from TopologyNodeElement.
 * Container elements (subnet regions) are also included with child references.
 * Non-topologyNode and non-container elements are excluded.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of elements to include as layout nodes
 * @returns Array of LayoutNode inputs with topology metadata
 */
export function extractTopologyLayoutNodes(
  elements: SceneElement[],
  elementIds: Set<string>,
): LayoutNode[] {
  return elements
    .filter(
      (el) =>
        elementIds.has(el.id) &&
        (el.type === 'topologyNode' || el.type === 'container'),
    )
    .map((el) => {
      const meta: Record<string, unknown> = {
        ...(el.metadata as Record<string, unknown> ?? {}),
      };

      if (el.type === 'topologyNode') {
        const topo = el as TopologyNodeElement;
        meta.deviceType = topo.deviceType;
        meta.label = topo.label;
        meta.properties = topo.properties;
        meta.rank = DEVICE_RANK[topo.deviceType] ?? 2;
      }

      if (el.type === 'container') {
        const cont = el as ContainerElement;
        meta.containerName = cont.name;
        meta.isContainer = true;
        meta.containerKind = cont.containerKind;
        if (cont.childElementIds) {
          meta.childElementIds = cont.childElementIds;
        }
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
 * Extract LayoutEdge inputs from scene elements for topology edges.
 * Enriches edges with network-specific metadata (link type, labels).
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of layout nodes
 * @returns Array of LayoutEdge inputs
 */
export function extractTopologyLayoutEdges(
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
      const meta: Record<string, unknown> = {
        ...(el.metadata as Record<string, unknown> ?? {}),
      };

      meta.semanticKind = el.semanticKind ?? 'network-link';

      if (el.labels && el.labels.length > 0) {
        meta.linkLabels = el.labels.map((l) => ({
          text: l.text,
          position: l.position,
        }));
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
    const meta = node.metadata as Record<string, unknown> | undefined;
    const gn: GraphNode = {
      id: node.id,
      width: node.width,
      height: node.height,
      inEdges: [],
      outEdges: [],
      rank: (meta?.rank as number) ?? 2,
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
 * Pre-assign ranks based on device type. Then refine using longest-path
 * algorithm from source nodes to ensure proper rank progression.
 */
function assignRanks(graphNodes: GraphNode[], nodesById: Map<string, GraphNode>): void {
  // First pass: already assigned from device type in buildGraph
  // Second pass: ensure topological ordering — a node's rank >= all predecessors' rank + 1
  const visited = new Map<string, number>();

  function propagateDown(nodeId: string, rank: number): void {
    const current = visited.get(nodeId);
    if (current !== undefined && current >= rank) return;

    const node = nodesById.get(nodeId);
    if (!node) return;

    const effectiveRank = Math.max(node.rank, rank);
    visited.set(nodeId, effectiveRank);
    node.rank = effectiveRank;

    for (const edge of node.outEdges) {
      propagateDown(edge.target, effectiveRank + 1);
    }
  }

  // Find source nodes (no incoming edges or lowest rank)
  const sourceNodes = graphNodes.filter((n) => n.inEdges.length === 0);

  if (sourceNodes.length === 0 && graphNodes.length > 0) {
    propagateDown(graphNodes[0].id, graphNodes[0].rank);
  } else {
    for (const source of sourceNodes) {
      propagateDown(source.id, source.rank);
    }
  }

  for (const node of graphNodes) {
    if (!visited.has(node.id)) {
      propagateDown(node.id, node.rank);
    }
  }

  // Normalize ranks to start at 0
  let minRank = Infinity;
  for (const node of graphNodes) {
    minRank = Math.min(minRank, node.rank);
  }
  if (minRank > 0) {
    for (const node of graphNodes) {
      node.rank -= minRank;
    }
  }
}

/**
 * Compute the barycenter for a node based on connected nodes in adjacent ranks.
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
    if (neighbor) {
      sum += neighbor.order;
      count++;
    }
  }
  return count > 0 ? sum / count : node.order;
}

/**
 * Order nodes within each rank to minimize edge crossings.
 */
function orderNodes(graphNodes: GraphNode[], nodesById: Map<string, GraphNode>): void {
  const ranks = new Map<number, GraphNode[]>();
  for (const node of graphNodes) {
    const list = ranks.get(node.rank) ?? [];
    list.push(node);
    ranks.set(node.rank, list);
  }

  const sortedRanks = [...ranks.keys()].sort((a, b) => a - b);
  const ITERATIONS = 8;

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
 * Compute final (x, y) positions for each node based on rank, order, and spacing.
 */
function assignPositions(
  graphNodes: GraphNode[],
  direction: LayoutDirection,
  hSpacing: number,
  vSpacing: number,
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
 * Compute orthogonal edge route waypoints.
 * Edges exit from bottom of source and enter top of target (for TB direction),
 * or exit right of source and enter left of target (for LR direction).
 */
function computeEdgeRoutes(
  nodesById: Map<string, GraphNode>,
  edges: LayoutEdge[],
  direction: LayoutDirection,
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

    let points: { x: number; y: number }[];

    if (direction === 'TB' || direction === 'BT') {
      const sourceBottom = { x: sx + sw / 2, y: sy + sh };
      const targetTop = { x: tx + tw / 2, y: ty };
      const midY = (sourceBottom.y + targetTop.y) / 2;
      points = [
        sourceBottom,
        { x: sourceBottom.x, y: midY },
        { x: targetTop.x, y: midY },
        targetTop,
      ];
    } else {
      const sourceRight = { x: sx + sw, y: sy + sh / 2 };
      const targetLeft = { x: tx, y: ty + th / 2 };
      const midX = (sourceRight.x + targetLeft.x) / 2;
      points = [
        sourceRight,
        { x: midX, y: sourceRight.y },
        { x: midX, y: targetLeft.y },
        targetLeft,
      ];
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
 * Compute total bounding box covering all positioned nodes.
 */
function computeTotalBBox(graphNodes: GraphNode[]): BBox {
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
 * Resize container elements to encompass their child topology nodes
 * plus padding. Returns updated container node results.
 */
function layoutContainers(
  nodes: LayoutNode[],
  nodeResults: LayoutNodeResult[],
  containerPadding: number,
): { nodeResults: LayoutNodeResult[]; containerInfos: ContainerInfo[] } {
  const nodeById = new Map(nodeResults.map((r) => [r.id, r]));
  const layoutNodeById = new Map(nodes.map((n) => [n.id, n]));
  const containerInfos: ContainerInfo[] = [];

  for (const node of nodes) {
    const meta = node.metadata as Record<string, unknown> | undefined;
    if (!meta?.isContainer) continue;

    const childIds = (meta.childElementIds as string[]) ?? [];
    if (childIds.length === 0) {
      // Container with no children — keep original position
      const existing = nodeById.get(node.id);
      if (!existing) {
        nodeById.set(node.id, { id: node.id, x: 0, y: 0 });
      }
      continue;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const childId of childIds) {
      const child = nodeById.get(childId);
      const childLayout = layoutNodeById.get(childId);
      if (!child || !childLayout) continue;

      minX = Math.min(minX, child.x);
      minY = Math.min(minY, child.y);
      maxX = Math.max(maxX, child.x + childLayout.width);
      maxY = Math.max(maxY, child.y + childLayout.height);
    }

    if (minX === Infinity) continue;

    const pad = containerPadding;
    const contX = minX - pad;
    const contY = minY - pad;
    const contW = maxX - minX + 2 * pad;
    const contH = maxY - minY + 2 * pad;

    nodeById.set(node.id, { id: node.id, x: contX, y: contY });
    containerInfos.push({
      id: node.id,
      childIds,
      x: contX,
      y: contY,
      width: contW,
      height: contH,
    });
  }

  return {
    nodeResults: [...nodeById.values()],
    containerInfos,
  };
}

/**
 * Simple force-directed layout fallback.
 * Uses iterative repulsion-attraction to spread nodes apart while
 * keeping connected nodes close. Stops after maxIterations.
 */
function forceDirectedLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  hSpacing: number,
  vSpacing: number,
): LayoutResult {
  if (nodes.length === 0) {
    return {
      nodes: [],
      edges: [],
      totalBBox: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  const pos = new Map<string, { x: number; y: number }>();
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // Initialize positions in a circular layout
  const centerX = 0;
  const centerY = 0;
  const initRadius = Math.max(nodes.length * 30, 200);

  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    pos.set(n.id, {
      x: centerX + Math.cos(angle) * initRadius,
      y: centerY + Math.sin(angle) * initRadius,
    });
  });

  // Build adjacency for faster lookup
  const adjacency = new Map<string, Set<string>>();
  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }
  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  // Force simulation parameters
  const ITERATIONS = 100;
  const repulsionStrength = 5000;
  const attractionStrength = 0.01;
  let damping = 0.9;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    for (const node of nodes) {
      forces.set(node.id, { fx: 0, fy: 0 });
    }

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const pa = pos.get(a.id)!;
        const pb = pos.get(b.id)!;

        let dx = pb.x - pa.x;
        let dy = pb.y - pa.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionStrength / (dist * dist);

        const fa = forces.get(a.id)!;
        const fb = forces.get(b.id)!;
        fa.fx -= (dx / dist) * force;
        fa.fy -= (dy / dist) * force;
        fb.fx += (dx / dist) * force;
        fb.fy += (dy / dist) * force;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const pa = pos.get(edge.source);
      const pb = pos.get(edge.target);
      if (!pa || !pb) continue;

      let dx = pb.x - pa.x;
      let dy = pb.y - pa.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const idealDist = (hSpacing + vSpacing) / 2;
      const force = (dist - idealDist) * attractionStrength;

      const fa = forces.get(edge.source)!;
      const fb = forces.get(edge.target)!;
      fa.fx += (dx / (dist || 1)) * force;
      fa.fy += (dy / (dist || 1)) * force;
      fb.fx -= (dx / (dist || 1)) * force;
      fb.fy -= (dy / (dist || 1)) * force;
    }

    // Apply forces with damping
    for (const node of nodes) {
      const f = forces.get(node.id)!;
      const p = pos.get(node.id)!;
      p.x += f.fx * damping;
      p.y += f.fy * damping;
    }

    damping *= 0.97;
  }

  // Normalize to origin
  let minX = Infinity;
  let minY = Infinity;
  for (const p of pos.values()) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  }
  for (const p of pos.values()) {
    p.x -= minX;
    p.y -= minY;
  }

  const nodeResults: LayoutNodeResult[] = [];
  for (const [id, p] of pos) {
    nodeResults.push({ id, x: p.x, y: p.y });
  }

  // Edge routes: straight lines
  const edgeResults: LayoutEdgeResult[] = edges
    .filter((e) => e.source !== e.target && pos.has(e.source) && pos.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      connectorId: e.connectorId,
      points: [pos.get(e.source)!, pos.get(e.target)!],
    }));

  // Total BBox
  let tbMinX = Infinity, tbMinY = Infinity, tbMaxX = -Infinity, tbMaxY = -Infinity;
  for (const n of nodes) {
    const p = pos.get(n.id)!;
    tbMinX = Math.min(tbMinX, p.x);
    tbMinY = Math.min(tbMinY, p.y);
    tbMaxX = Math.max(tbMaxX, p.x + n.width);
    tbMaxY = Math.max(tbMaxY, p.y + n.height);
  }

  return {
    nodes: nodeResults,
    edges: edgeResults,
    totalBBox: {
      x: tbMinX === Infinity ? 0 : tbMinX,
      y: tbMinY === Infinity ? 0 : tbMinY,
      width: tbMinX === Infinity ? 0 : tbMaxX - tbMinX,
      height: tbMinY === Infinity ? 0 : tbMaxY - tbMinY,
    },
  };
}

/**
 * TopologyLayoutEngine implements the LayoutEngine interface for network
 * topology diagrams. Supports two modes:
 *
 * - **hierarchical** (default): Arranges devices by network tier using a
 *   dagre-like algorithm. Router at core (top), switches in distribution
 *   (middle), servers at access/edge (bottom).
 * - **force-directed**: Iterative force simulation for non-hierarchical
 *   network graphs.
 *
 * Subnet container elements are expanded to encompass their child devices.
 * Link labels (edge metadata) carry semanticKind and label text for rendering.
 */
export class TopologyLayoutEngine implements LayoutEngine {
  readonly name = 'topology-layout';

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
    const mode: TopologyLayoutMode =
      (extra?.mode as TopologyLayoutMode) ?? 'hierarchical';
    const direction: LayoutDirection = options?.direction ?? 'TB';
    const hSpacing = options?.hSpacing ?? DEFAULT_H_SPACING;
    const vSpacing = options?.vSpacing ?? DEFAULT_V_SPACING;
    const containerPadding =
      (typeof extra?.containerPadding === 'number' ? extra.containerPadding : 30);

    if (mode === 'force-directed') {
      return forceDirectedLayout(nodes, edges, hSpacing, vSpacing);
    }

    // Hierarchical mode
    const { graphNodes, nodesById } = buildGraph(nodes, edges);

    assignRanks(graphNodes, nodesById);

    orderNodes(graphNodes, nodesById);

    assignPositions(graphNodes, direction, hSpacing, vSpacing);

    let nodeResults: LayoutNodeResult[] = graphNodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
    }));

    // Handle containers: resize to encompass children
    const { nodeResults: adjustedResults } = layoutContainers(
      nodes,
      nodeResults,
      containerPadding,
    );
    nodeResults = adjustedResults;

    const filteredEdges = edges.filter(
      (e) =>
        e.source !== e.target &&
        nodesById.has(e.source) &&
        nodesById.has(e.target),
    );

    const edgeResults = computeEdgeRoutes(nodesById, filteredEdges, direction);

    const totalBBox = computeTotalBBox(graphNodes);

    return {
      nodes: nodeResults,
      edges: edgeResults,
      totalBBox,
    };
  }
}

/** Singleton instance of the topology layout engine. */
export const topologyLayoutEngine = new TopologyLayoutEngine();

/**
 * Command that runs topology layout on selected elements using
 * topology-specific node/edge extraction (deviceType, containers, link labels).
 * Conforms to the SceneCommand interface and supports undo/redo.
 */
export class TopologyLayoutCommand implements SceneCommand {
  id: string;
  label: string;

  private engine: TopologyLayoutEngine;
  private elementIds: Set<string>;
  private options: TopologyLayoutOptions;
  private previousPositions: Map<string, { x: number; y: number }>;
  private previousRoutes: Map<string, { x: number; y: number }[]>;
  private previousSizes: Map<string, { width: number; height: number }>;

  constructor(
    engine: TopologyLayoutEngine,
    elementIds: string[],
    options?: TopologyLayoutOptions,
  ) {
    this.id = generateId('cmd-topology-layout');
    this.label = `Topology Layout (${engine.name})`;
    this.engine = engine;
    this.elementIds = new Set(elementIds);
    this.options = options ?? {};
    this.previousPositions = new Map();
    this.previousRoutes = new Map();
    this.previousSizes = new Map();
  }

  validate(scene: SceneDocument): ValidationResult {
    if (this.elementIds.size === 0) {
      return failureResult({
        code: 'LAYOUT_NO_ELEMENTS',
        message: 'No elements selected for topology layout',
        severity: 'error',
        suggestion: 'Select topology nodes, containers, and connectors to arrange',
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
    this.previousSizes.clear();

    for (const id of this.elementIds) {
      const el = scene.elements.find((e) => e.id === id);
      if (!el) continue;
      this.previousPositions.set(id, {
        x: el.transform.x,
        y: el.transform.y,
      });
      this.previousSizes.set(id, {
        width: el.transform.width,
        height: el.transform.height,
      });
      if (el.type === 'connector') {
        this.previousRoutes.set(id, [
          ...(el as ConnectorElement).route.points.map((p) => ({ x: p.x, y: p.y })),
        ]);
      }
    }

    const nodes = extractTopologyLayoutNodes(scene.elements, this.elementIds);
    const edges = extractTopologyLayoutEdges(scene.elements, this.elementIds);
    const result = this.engine.layout(nodes, edges, this.options);

    return applyLayoutToScene(scene, result);
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const prevPositions = new Map(this.previousPositions);
    const prevRoutes = new Map(this.previousRoutes);
    const prevSizes = new Map(this.previousSizes);

    return {
      id: generateId('inv-topology-layout'),
      label: `Undo: ${this.label}`,
      validate: () => successResult(),
      execute: (scene: SceneDocument) => {
        const elements = scene.elements.map((el) => {
          const pos = prevPositions.get(el.id);
          const size = prevSizes.get(el.id);
          if (!pos) return el;

          const updated = {
            ...el,
            transform: {
              ...el.transform,
              x: pos.x,
              y: pos.y,
              ...(size ? { width: size.width, height: size.height } : {}),
            },
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
 * Create a topology layout command with the default engine.
 *
 * @param elementIds - IDs of elements to lay out (topology nodes + containers + connectors)
 * @param options - Topology-specific layout options
 */
export function createTopologyLayoutCommand(
  elementIds: string[],
  options?: TopologyLayoutOptions,
): TopologyLayoutCommand {
  return new TopologyLayoutCommand(topologyLayoutEngine, elementIds, options);
}
