/**
 * Layout engine interface — unified contract for automatic graph layout.
 * Different diagram types (flowchart, RTL, mindmap, topology) can plug in
 * different layout algorithms (dagre, ELK.js, or custom) through this interface.
 */

import type { SceneDocument, SceneElement, ConnectorElement, BBox } from './types';

/**
 * Layout direction for graph-based diagrams.
 * LR = left-to-right, RL = right-to-left, TB = top-to-bottom, BT = bottom-to-top.
 */
export type LayoutDirection = 'LR' | 'RL' | 'TB' | 'BT';

/**
 * Horizontal alignment for nodes within a rank or row.
 */
export type LayoutHAlign = 'start' | 'center' | 'end' | 'stretch';

/**
 * Vertical alignment for nodes within a rank or column.
 */
export type LayoutVAlign = 'start' | 'center' | 'end' | 'stretch';

/**
 * Configuration options for the layout engine.
 */
export interface LayoutOptions {
  /** Layout direction (default 'TB') */
  direction?: LayoutDirection;
  /** Horizontal spacing between nodes in canvas units (default 80) */
  hSpacing?: number;
  /** Vertical spacing between nodes in canvas units (default 60) */
  vSpacing?: number;
  /** Horizontal alignment within a rank (default 'center') */
  hAlign?: LayoutHAlign;
  /** Vertical alignment within a rank (default 'center') */
  vAlign?: LayoutVAlign;
  /** Additional algorithm-specific options */
  extra?: Record<string, unknown>;
}

/**
 * Input node for the layout engine.
 * Represents a node to be positioned, identified by its scene element id.
 */
export interface LayoutNode {
  /** Scene element id of the node */
  id: string;
  /** Width of the node in canvas units */
  width: number;
  /** Height of the node in canvas units */
  height: number;
  /** Optional metadata for algorithm-specific hints */
  metadata?: Record<string, unknown>;
}

/**
 * Input edge for the layout engine.
 * Represents a directed connection between two nodes.
 */
export interface LayoutEdge {
  /** Source node id (matches a LayoutNode.id) */
  source: string;
  /** Target node id (matches a LayoutNode.id) */
  target: string;
  /** Optional connector element id in the scene */
  connectorId?: string;
  /** Optional metadata for algorithm-specific hints */
  metadata?: Record<string, unknown>;
}

/**
 * Result for a single positioned node after layout calculation.
 */
export interface LayoutNodeResult {
  /** Scene element id of the node */
  id: string;
  /** Computed x position (top-left corner) in canvas coordinates */
  x: number;
  /** Computed y position (top-left corner) in canvas coordinates */
  y: number;
}

/**
 * Result for a single routed edge after layout calculation.
 */
export interface LayoutEdgeResult {
  /** Source node id */
  source: string;
  /** Target node id */
  target: string;
  /** Optional connector element id */
  connectorId?: string;
  /** Computed route waypoints in canvas coordinates */
  points: { x: number; y: number }[];
}

/**
 * Complete result of a layout computation.
 */
export interface LayoutResult {
  /** Positioned node results */
  nodes: LayoutNodeResult[];
  /** Routed edge results */
  edges: LayoutEdgeResult[];
  /** Axis-aligned bounding box covering all positioned nodes */
  totalBBox: BBox;
}

/**
 * Unified interface for layout engines.
 *
 * Different implementations (dagre, ELK.js, custom) conform to this contract.
 * The layout method takes graph nodes, edges, and options, and returns
 * calculated positions and edge routes.
 */
export interface LayoutEngine {
  /** Human-readable name of the engine (e.g. "dagre", "ELK.js") */
  readonly name: string;

  /**
   * Compute layout for a set of nodes and edges.
   *
   * @param nodes - Nodes to be positioned
   * @param edges - Edges connecting the nodes
   * @param options - Layout configuration
   * @returns LayoutResult with computed node positions and edge routes
   */
  layout(nodes: LayoutNode[], edges: LayoutEdge[], options?: LayoutOptions): LayoutResult;
}

/**
 * Apply computed layout results to a SceneDocument.
 *
 * Updates the transform.x and transform.y of matching elements, and
 * adjusts connector routes for routed edges. Elements that are not
 * in the layout result remain untouched.
 *
 * Returns a new SceneDocument (does not mutate the input).
 *
 * @param scene - The scene document to apply layout to
 * @param result - The computed layout result
 * @returns A new SceneDocument with applied positions and routes
 */
export function applyLayoutToScene(scene: SceneDocument, result: LayoutResult): SceneDocument {
  const nodeMap = new Map(result.nodes.map((n) => [n.id, n]));
  const edgeMap = new Map(result.edges.map((e) => [e.connectorId ?? '', e]));

  const newElements = scene.elements.map((el) => {
    const nodeResult = nodeMap.get(el.id);
    if (nodeResult) {
      return {
        ...el,
        transform: {
          ...el.transform,
          x: nodeResult.x,
          y: nodeResult.y,
        },
      };
    }
    return el;
  });

  const updatedConnectors = newElements.map((el) => {
    if (el.type !== 'connector') return el;
    const conn = el as ConnectorElement;

    const edgeResult = edgeMap.get(conn.id);
    if (!edgeResult || edgeResult.points.length === 0) return conn;

    return {
      ...conn,
      route: {
        ...conn.route,
        points: edgeResult.points,
      },
      source: {
        ...conn.source,
        x: edgeResult.points[0].x,
        y: edgeResult.points[0].y,
      },
      target: {
        ...conn.target,
        x: edgeResult.points[edgeResult.points.length - 1].x,
        y: edgeResult.points[edgeResult.points.length - 1].y,
      },
    };
  });

  return { ...scene, elements: updatedConnectors };
}

/**
 * Extract LayoutNode inputs from scene elements.
 *
 * Reads element id, width, height, and optional metadata for layout computation.
 * Only extracts elements whose ids are present in the provided set.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of elements to include as layout nodes
 * @returns Array of LayoutNode inputs
 */
export function extractLayoutNodes(
  elements: SceneElement[],
  elementIds: Set<string>,
): LayoutNode[] {
  return elements
    .filter((el) => elementIds.has(el.id))
    .map((el) => ({
      id: el.id,
      width: el.transform.width,
      height: el.transform.height,
      metadata: el.metadata,
    }));
}

/**
 * Extract LayoutEdge inputs from scene connector elements.
 *
 * Only includes connectors whose source and target both reference elements
 * in the provided elementId set.
 *
 * @param elements - All scene elements
 * @param elementIds - IDs of layout nodes (only edges between these are extracted)
 * @returns Array of LayoutEdge inputs
 */
export function extractLayoutEdges(
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
      metadata: el.metadata,
    }));
}
