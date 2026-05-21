/**
 * Flowchart layout engine — implements graph-based automatic layout for
 * flowchart diagrams using a simplified dagre-like algorithm.
 *
 * Features:
 * - Rank assignment via longest-path from source nodes
 * - Crossing reduction via barycenter heuristic
 * - Orthogonal edge routing that avoids crossing through nodes
 * - Supports TB (top-to-bottom) and LR (left-to-right) directions
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

/** Default spacing values used when LayoutOptions does not specify them. */
const DEFAULT_H_SPACING = 80;
const DEFAULT_V_SPACING = 60;

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
 * Compute the barycenter for a node based on connected nodes in adjacent ranks.
 * Used for crossing reduction within each rank.
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
 * Build internal graph from LayoutNode and LayoutEdge inputs.
 */
function buildGraph(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
): { graphNodes: GraphNode[]; nodesById: Map<string, GraphNode>; sources: GraphNode[] } {
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

  const inDegree = new Map<string, number>();
  for (const node of nodes) {
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) continue;
    if (edge.source === edge.target) continue;

    source.outEdges.push(edge);
    target.inEdges.push(edge);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const sources = graphNodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);

  return { graphNodes, nodesById, sources };
}

/**
 * Assign ranks to nodes using longest-path algorithm from source nodes.
 * Nodes without any incoming path receive rank 0.
 */
function assignRanks(graphNodes: GraphNode[], nodesById: Map<string, GraphNode>): void {
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

  const sources = graphNodes.filter(
    (n) => n.inEdges.length === 0,
  );

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
 * Order nodes within each rank to minimize edge crossings using
 * the barycenter heuristic. Runs a fixed number of iterations
 * alternating between forward and backward sweeps.
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
 * Supports TB and LR directions.
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
 * Compute orthogonal edge route waypoints from source node boundary
 * to target node boundary. Routes avoid crossing through nodes by
 * exiting/entering at the appropriate edges based on layout direction.
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
 * FlowchartLayoutEngine implements the LayoutEngine interface using a
 * simplified dagre-like algorithm suitable for flowchart diagrams.
 *
 * Supports TB (top-to-bottom) and LR (left-to-right) layout directions.
 */
export class FlowchartLayoutEngine implements LayoutEngine {
  readonly name = 'flowchart-dagre-lite';

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

    const direction: LayoutDirection = options?.direction ?? 'TB';
    const hSpacing = options?.hSpacing ?? DEFAULT_H_SPACING;
    const vSpacing = options?.vSpacing ?? DEFAULT_V_SPACING;

    const { graphNodes, nodesById } = buildGraph(nodes, edges);

    assignRanks(graphNodes, nodesById);

    orderNodes(graphNodes, nodesById);

    assignPositions(graphNodes, direction, hSpacing, vSpacing);

    const filteredEdges = edges.filter((e) => e.source !== e.target && nodesById.has(e.source) && nodesById.has(e.target));

    const nodeResults: LayoutNodeResult[] = graphNodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
    }));

    const edgeResults = computeEdgeRoutes(nodesById, filteredEdges, direction);

    const totalBBox = computeTotalBBox(graphNodes);

    return {
      nodes: nodeResults,
      edges: edgeResults,
      totalBBox,
    };
  }
}

/** Singleton instance of the flowchart layout engine. */
export const flowchartLayoutEngine = new FlowchartLayoutEngine();
