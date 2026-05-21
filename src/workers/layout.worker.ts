/**
 * Web Worker for layout computation.
 * Offloads expensive layout algorithms (dagre, ELK.js, custom) off the main thread
 * to keep the UI responsive during auto-layout of large graphs.
 */

import type { LayoutNode, LayoutEdge, LayoutOptions, LayoutNodeResult, LayoutEdgeResult } from '../core/layout';

interface LayoutRequest {
  id: string;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  options: LayoutOptions;
}

interface LayoutResponse {
  id: string;
  nodes: LayoutNodeResult[];
  edges: LayoutEdgeResult[];
  totalBBox: { x: number; y: number; width: number; height: number };
  error?: string;
}

function simpleLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions,
): LayoutResponse['nodes'] {
  const direction = options.direction || 'TB';
  const hSpacing = options.hSpacing ?? 80;
  const vSpacing = options.vSpacing ?? 60;
  const isHorizontal = direction === 'LR' || direction === 'RL';

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      adjacency.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const ranks: string[][] = [];
  const visited = new Set<string>();
  while (true) {
    const currentQueue = [...queue];
    queue.length = 0;
    if (currentQueue.length === 0) break;
    const rank: string[] = [];
    for (const id of currentQueue) {
      if (visited.has(id)) continue;
      visited.add(id);
      rank.push(id);
      for (const neighbor of adjacency.get(id) || []) {
        const deg = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, deg);
        if (deg === 0 && !visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
    if (rank.length > 0) ranks.push(rank);
  }

  for (const [id] of inDegree) {
    if (!visited.has(id)) ranks.push([id]);
  }

  const results: LayoutNodeResult[] = [];
  const primarySpacing = isHorizontal ? hSpacing : vSpacing;
  const secondarySpacing = isHorizontal ? vSpacing : hSpacing;

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    const rank = ranks[rankIdx];
    let totalSize = 0;
    const sizes: number[] = [];
    for (const id of rank) {
      const node = nodeMap.get(id);
      const size = node ? (isHorizontal ? node.height : node.width) : 100;
      sizes.push(size);
      totalSize += size;
    }
    totalSize += (rank.length - 1) * secondarySpacing;

    let offset = -totalSize / 2;
    for (let i = 0; i < rank.length; i++) {
      const id = rank[i];
      const node = nodeMap.get(id);
      const size = sizes[i];
      const primPos = rankIdx * primarySpacing;

      if (isHorizontal) {
        results.push({
          id,
          x: direction === 'LR' ? primPos : -primPos,
          y: offset,
        });
      } else {
        results.push({
          id,
          x: offset,
          y: direction === 'TB' ? primPos : -primPos,
        });
      }
      offset += size + secondarySpacing;
    }
  }

  return results;
}

function simpleEdgeRoutes(
  nodeResults: LayoutNodeResult[],
  edges: LayoutEdge[],
  nodes: LayoutNode[],
): LayoutEdgeResult[] {
  const nodePos = new Map(nodeResults.map((r) => [r.id, r]));
  const nodeSize = new Map(nodes.map((n) => [n.id, { w: n.width, h: n.height }]));

  return edges.map((edge) => {
    const src = nodePos.get(edge.source);
    const tgt = nodePos.get(edge.target);
    const srcSize = nodeSize.get(edge.source);
    const tgtSize = nodeSize.get(edge.target);

    if (!src || !tgt) {
      return { source: edge.source, target: edge.target, connectorId: edge.connectorId, points: [] };
    }

    const srcCenterX = src.x + (srcSize?.w ?? 0) / 2;
    const srcCenterY = src.y + (srcSize?.h ?? 0) / 2;
    const tgtCenterX = tgt.x + (tgtSize?.w ?? 0) / 2;
    const tgtCenterY = tgt.y + (tgtSize?.h ?? 0) / 2;

    const midX = (srcCenterX + tgtCenterX) / 2;

    return {
      source: edge.source,
      target: edge.target,
      connectorId: edge.connectorId,
      points: [
        { x: srcCenterX, y: srcCenterY },
        { x: midX, y: srcCenterY },
        { x: midX, y: tgtCenterY },
        { x: tgtCenterX, y: tgtCenterY },
      ],
    };
  });
}

self.onmessage = (e: MessageEvent<LayoutRequest>) => {
  const { id, nodes, edges, options } = e.data;

  try {
    const nodeResults = simpleLayout(nodes, edges, options);
    const edgeResults = nodeResults.length > 0 ? simpleEdgeRoutes(nodeResults, edges, nodes) : [];

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const nodeSizeMap = new Map(nodes.map((n) => [n.id, n]));
    for (const r of nodeResults) {
      const size = nodeSizeMap.get(r.id);
      const w = size?.width ?? 0;
      const h = size?.height ?? 0;
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + w);
      maxY = Math.max(maxY, r.y + h);
    }

    const totalBBox = nodeResults.length > 0
      ? { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
      : { x: 0, y: 0, width: 0, height: 0 };

    const response: LayoutResponse = { id, nodes: nodeResults, edges: edgeResults, totalBBox };
    self.postMessage(response);
  } catch (err) {
    const response: LayoutResponse = {
      id,
      nodes: [],
      edges: [],
      totalBBox: { x: 0, y: 0, width: 0, height: 0 },
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
