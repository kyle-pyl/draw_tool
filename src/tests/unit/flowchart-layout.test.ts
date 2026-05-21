import { describe, it, expect } from 'vitest';
import { FlowchartLayoutEngine, flowchartLayoutEngine } from '../../modules/flowchart/layout';
import {
  applyLayoutToScene,
  extractLayoutNodes,
  extractLayoutEdges,
} from '../../core/layout';
import type {
  LayoutNode,
  LayoutEdge,
  LayoutOptions,
  LayoutResult,
  LayoutEngine,
} from '../../core/layout';
import { LayoutCommand, CommandExecutor, createLayoutCommand } from '../../core/commands';
import { useDocumentStore } from '../../core/store';
import type {
  SceneDocument,
  ShapeElement,
  ConnectorElement,
} from '../../core/types';

function makeShape(
  id: string,
  w: number,
  h: number,
  layerId = 'l1',
): ShapeElement {
  return {
    id,
    type: 'shape',
    layerId,
    shapeKind: 'rect',
    transform: { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeConnector(
  id: string,
  sourceId: string,
  targetId: string,
  layerId = 'l1',
): ConnectorElement {
  return {
    id,
    type: 'connector',
    layerId,
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    source: { elementId: sourceId, anchorId: 'right', x: 0, y: 0 },
    target: { elementId: targetId, anchorId: 'left', x: 0, y: 0 },
    route: { type: 'straight', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
  };
}

function makeScene(elements: SceneDocument['elements']): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'test' },
    canvas: {
      units: 'px',
      background: '#fff',
      defaultFont: 'Arial',
      gridSize: 0,
      snapToGrid: false,
    },
    rules: {
      maxLayerCount: 10,
      collisionStrategy: 'bbox',
      hiddenElementsCollide: true,
      lockedElementsCollide: true,
      connectorsExempt: true,
    },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements,
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

// ─── Engine conformance ──────────────────────────────────────────────────

describe('FlowchartLayoutEngine', () => {
  it('implements LayoutEngine interface', () => {
    const engine: LayoutEngine = flowchartLayoutEngine;
    expect(engine.name).toBe('flowchart-dagre-lite');
    expect(typeof engine.layout).toBe('function');
  });

  // ─── Empty input ───────────────────────────────────────────────────────

  it('handles empty nodes', () => {
    const result = flowchartLayoutEngine.layout([], []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.totalBBox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('handles nodes with no edges', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const result = flowchartLayoutEngine.layout(nodes, []);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toEqual([]);
    const ids = result.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['a', 'b']);
  });

  // ─── Linear graph ──────────────────────────────────────────────────────

  it('arranges linear graph TB (top to bottom)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'c', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.nodes).toHaveLength(3);

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    // TB: a should be above b, b above c
    expect(a.y).toBeLessThan(b.y);
    expect(b.y).toBeLessThan(c.y);

    // TB: all nodes should be centered horizontally (same x since same width)
    expect(a.x).toBe(b.x);
    expect(a.x).toBe(c.x);

    // bbox must contain all nodes
    expect(result.totalBBox.x).toBeLessThanOrEqual(a.x);
    expect(result.totalBBox.y).toBeLessThanOrEqual(a.y);
    expect(result.totalBBox.width).toBeGreaterThanOrEqual(100);
    expect(result.totalBBox.height).toBeGreaterThanOrEqual(50 * 3 + 60 * 2);
  });

  it('arranges linear graph LR (left to right)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
      { id: 'c', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    // LR: a left, b middle, c right
    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);

    // LR: all nodes should be at same y (centered)
    expect(a.y).toBe(b.y);
    expect(a.y).toBe(c.y);
  });

  // ─── Diamond graph (branching and merging) ─────────────────────────────

  it('handles diamond graph correctly', () => {
    const nodes: LayoutNode[] = [
      { id: 'top', width: 100, height: 50 },
      { id: 'left', width: 100, height: 50 },
      { id: 'right', width: 100, height: 50 },
      { id: 'bottom', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'top', target: 'left' },
      { source: 'top', target: 'right' },
      { source: 'left', target: 'bottom' },
      { source: 'right', target: 'bottom' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.nodes).toHaveLength(4);

    const top = result.nodes.find((n) => n.id === 'top')!;
    const left = result.nodes.find((n) => n.id === 'left')!;
    const right = result.nodes.find((n) => n.id === 'right')!;
    const bottom = result.nodes.find((n) => n.id === 'bottom')!;

    // TB: top should be at rank 0 (topmost)
    expect(top.y).toBeLessThan(left.y);
    expect(top.y).toBeLessThan(right.y);
    expect(left.y).toBeLessThan(bottom.y);
    expect(right.y).toBeLessThan(bottom.y);

    // left and right should be at same rank (same y)
    expect(left.y).toBe(right.y);
  });

  // ─── Spacing options ───────────────────────────────────────────────────

  it('respects custom hSpacing and vSpacing', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];

    const defaultResult = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });
    const customResult = flowchartLayoutEngine.layout(nodes, edges, {
      direction: 'TB',
      vSpacing: 200,
    });

    const defaultA = defaultResult.nodes.find((n) => n.id === 'a')!;
    const defaultB = defaultResult.nodes.find((n) => n.id === 'b')!;
    const customA = customResult.nodes.find((n) => n.id === 'a')!;
    const customB = customResult.nodes.find((n) => n.id === 'b')!;

    const defaultGap = defaultB.y - (defaultA.y + 50);
    const customGap = customB.y - (customA.y + 50);
    expect(customGap).toBeGreaterThan(defaultGap + 100);
  });

  it('respects hSpacing for side-by-side nodes in TB', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'c', width: 100, height: 50 },
    ];
    // a and b both feed into c, so a and b share same rank
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'c' },
      { source: 'b', target: 'c' },
    ];
    const defaultResult = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });
    const customResult = flowchartLayoutEngine.layout(nodes, edges, {
      direction: 'TB',
      hSpacing: 200,
    });

    const defaultNodes = defaultResult.nodes.filter(
      (n) => n.id === 'a' || n.id === 'b',
    );
    const customNodes = customResult.nodes.filter(
      (n) => n.id === 'a' || n.id === 'b',
    );
    defaultNodes.sort((a, b) => a.x - b.x);
    customNodes.sort((a, b) => a.x - b.x);

    const defaultGap = defaultNodes[1].x - (defaultNodes[0].x + 100);
    const customGap = customNodes[1].x - (customNodes[0].x + 100);
    expect(customGap).toBeGreaterThan(defaultGap + 50);
  });

  // ─── Edge routing ──────────────────────────────────────────────────────

  it('generates edge routes for connectors (TB)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b', connectorId: 'c1' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.edges).toHaveLength(1);
    const edge = result.edges[0];
    expect(edge.source).toBe('a');
    expect(edge.target).toBe('b');
    expect(edge.connectorId).toBe('c1');
    expect(edge.points.length).toBeGreaterThanOrEqual(2);

    // First point should be near source bottom
    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const firstPoint = edge.points[0];
    expect(firstPoint.x).toBeCloseTo(sourceNode.x + 50, -1);
    expect(firstPoint.y).toBeCloseTo(sourceNode.y + 60, -1);

    // Last point should be near target top
    const targetNode = result.nodes.find((n) => n.id === 'b')!;
    const lastPoint = edge.points[edge.points.length - 1];
    expect(lastPoint.x).toBeCloseTo(targetNode.x + 50, -1);
    expect(lastPoint.y).toBeCloseTo(targetNode.y, -1);
  });

  it('generates edge routes for connectors (LR)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b', connectorId: 'c1' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.edges).toHaveLength(1);
    const edge = result.edges[0];
    expect(edge.points.length).toBeGreaterThanOrEqual(2);

    // First point should be near source right edge
    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const firstPoint = edge.points[0];
    expect(firstPoint.x).toBeCloseTo(sourceNode.x + 80, -1);
    expect(firstPoint.y).toBeCloseTo(sourceNode.y + 20, -1);

    // Last point should be near target left edge
    const targetNode = result.nodes.find((n) => n.id === 'b')!;
    const lastPoint = edge.points[edge.points.length - 1];
    expect(lastPoint.x).toBeCloseTo(targetNode.x, -1);
    expect(lastPoint.y).toBeCloseTo(targetNode.y + 20, -1);
  });

  // ─── BT direction ──────────────────────────────────────────────────────

  it('arranges linear graph BT (bottom to top)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'c', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'BT' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    // BT: rank 0 (source 'a') is at bottom, rank increases upward
    // So y values decrease with rank: a.y > b.y > c.y
    expect(a.y).toBeGreaterThan(b.y);
    expect(b.y).toBeGreaterThan(c.y);
    expect(a.y).toBeGreaterThan(c.y);
  });

  // ─── RL direction ──────────────────────────────────────────────────────

  it('arranges linear graph RL (right to left)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
      { id: 'c', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'RL' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    // RL: a (rank 0, source) should be at rightmost (highest x)
    expect(a.x).toBeGreaterThan(c.x);
  });

  // ─── Default direction ─────────────────────────────────────────────────

  it('defaults to TB direction', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = flowchartLayoutEngine.layout(nodes, edges);

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    expect(a.y).toBeLessThan(b.y);
  });

  // ─── Varying node sizes ────────────────────────────────────────────────

  it('handles nodes with different sizes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 200, height: 100 },
      { id: 'b', width: 80, height: 40 },
      { id: 'c', width: 120, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.nodes).toHaveLength(3);

    // All nodes should be assigned valid positions
    for (const node of result.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }

    // Ranks should be assigned correctly
    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;
    expect(a.y).toBeLessThan(b.y);
    expect(b.y).toBeLessThan(c.y);

    // totalBBox should cover all nodes
    expect(result.totalBBox.width).toBeGreaterThanOrEqual(200);
    expect(result.totalBBox.height).toBeGreaterThanOrEqual(100 + 40 + 60 + 2 * 60);
  });

  // ─── Disconnected components ───────────────────────────────────────────

  it('handles disconnected components', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'x', width: 80, height: 40 },
      { id: 'y', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'x', target: 'y' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.nodes).toHaveLength(4);

    // Both chains should have valid positions
    for (const node of result.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  // ─── Single node, single edge ──────────────────────────────────────────

  it('handles single node', () => {
    const result = flowchartLayoutEngine.layout(
      [{ id: 'a', width: 100, height: 60 }],
      [],
    );
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe('a');
    expect(result.totalBBox.width).toBe(100);
    expect(result.totalBBox.height).toBe(60);
  });

  it('handles single edge between two nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b', connectorId: 'c1' }];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].points.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Idempotency ───────────────────────────────────────────────────────

  it('produces deterministic results for same input', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'c', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];

    const r1 = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });
    const r2 = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    for (const n1 of r1.nodes) {
      const n2 = r2.nodes.find((n) => n.id === n1.id)!;
      expect(n2.x).toBe(n1.x);
      expect(n2.y).toBe(n1.y);
    }
  });

  // ─── Edge with same source/target (self-loop) ──────────────────────────

  it('ignores self-loop edges', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'a' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0); // self-loop ignored
  });

  // ─── Edges referencing nonexistent nodes ───────────────────────────────

  it('ignores edges with missing source/target nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'nonexistent' },
      { source: 'missing', target: 'a' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });
});

// ─── Scene integration ───────────────────────────────────────────────────

describe('Flowchart layout scene integration', () => {
  it('applyLayoutToScene positions flowchart nodes correctly (TB)', () => {
    const elements = [
      makeShape('a', 100, 60),
      makeShape('b', 100, 60),
      makeShape('c', 100, 60),
      makeConnector('c1', 'a', 'b'),
      makeConnector('c2', 'b', 'c'),
    ];
    const scene = makeScene(elements);

    const nodeIds = new Set(['a', 'b', 'c']);
    const nodes = extractLayoutNodes(scene.elements, nodeIds);
    const edges = extractLayoutEdges(scene.elements, nodeIds);
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    const updated = applyLayoutToScene(scene, result);

    const a = updated.elements.find((e) => e.id === 'a')!;
    const b = updated.elements.find((e) => e.id === 'b')!;
    const c = updated.elements.find((e) => e.id === 'c')!;

    // TB: a above b above c
    expect(a.transform.y).toBeLessThan(b.transform.y);
    expect(b.transform.y).toBeLessThan(c.transform.y);

    // Connectors should have updated routes
    const conn1 = updated.elements.find((e) => e.id === 'c1') as ConnectorElement;
    const conn2 = updated.elements.find((e) => e.id === 'c2') as ConnectorElement;
    expect(conn1.route.points.length).toBeGreaterThanOrEqual(2);
    expect(conn2.route.points.length).toBeGreaterThanOrEqual(2);
  });

  it('applyLayoutToScene positions flowchart nodes correctly (LR)', () => {
    const elements = [
      makeShape('a', 80, 40),
      makeShape('b', 80, 40),
      makeShape('c', 80, 40),
      makeConnector('c1', 'a', 'b'),
      makeConnector('c2', 'b', 'c'),
    ];
    const scene = makeScene(elements);

    const nodeIds = new Set(['a', 'b', 'c']);
    const nodes = extractLayoutNodes(scene.elements, nodeIds);
    const edges = extractLayoutEdges(scene.elements, nodeIds);
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    const updated = applyLayoutToScene(scene, result);

    const a = updated.elements.find((e) => e.id === 'a')!;
    const b = updated.elements.find((e) => e.id === 'b')!;
    const c = updated.elements.find((e) => e.id === 'c')!;

    // LR: a left, b middle, c right
    expect(a.transform.x).toBeLessThan(b.transform.x);
    expect(b.transform.x).toBeLessThan(c.transform.x);
  });

  it('flowchart layout preserves original scene structure', () => {
    const elements = [
      makeShape('a', 100, 60),
      makeShape('b', 100, 60),
      makeConnector('c1', 'a', 'b'),
    ];
    const scene = makeScene(elements);

    const result = flowchartLayoutEngine.layout(
      [{ id: 'a', width: 100, height: 60 }, { id: 'b', width: 100, height: 60 }],
      [{ source: 'a', target: 'b', connectorId: 'c1' }],
      { direction: 'TB' },
    );

    const updated = applyLayoutToScene(scene, result);

    // Preserves metadata
    expect(updated.schemaVersion).toBe('1.0.0');
    expect(updated.project.name).toBe('test');
    expect(updated.layers).toHaveLength(1);
    expect(updated.groups).toEqual([]);

    // Preserves element properties
    const a = updated.elements.find((e) => e.id === 'a')!;
    expect(a.visible).toBe(true);
    expect(a.locked).toBe(false);
    if (a.type === 'shape') {
      expect(a.shapeKind).toBe('rect');
    }
  });
});

// ─── LayoutCommand ───────────────────────────────────────────────────────

describe('LayoutCommand', () => {
  it('validates successfully with valid element IDs', () => {
    const elements = [makeShape('a', 100, 60), makeShape('b', 100, 60)];
    const scene = makeScene(elements);
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(true);
  });

  it('fails validation with empty element IDs', () => {
    const scene = makeScene([]);
    const cmd = new LayoutCommand(flowchartLayoutEngine, []);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('fails validation with missing element ID', () => {
    const elements = [makeShape('a', 100, 60)];
    const scene = makeScene(elements);
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'missing']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('executes layout and updates positions', () => {
    const elements = [
      makeShape('a', 100, 60),
      makeShape('b', 100, 60),
      makeShape('c', 100, 60),
      makeConnector('c1', 'a', 'b'),
      makeConnector('c2', 'b', 'c'),
    ];
    const scene = makeScene(elements);
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b', 'c', 'c1', 'c2']);

    const result = cmd.validate(scene);
    expect(result.valid).toBe(true);

    const newScene = cmd.execute(scene);

    const a = newScene.elements.find((e) => e.id === 'a')!;
    const b = newScene.elements.find((e) => e.id === 'b')!;
    const c = newScene.elements.find((e) => e.id === 'c')!;

    // Should be arranged top-to-bottom
    expect(a.transform.y).toBeLessThan(b.transform.y);
    expect(b.transform.y).toBeLessThan(c.transform.y);

    // Connector positions should be updated
    expect(a.transform.x).toBeDefined();
    expect(b.transform.x).toBeDefined();
    expect(c.transform.x).toBeDefined();
  });

  it('executes layout with LR direction via options', () => {
    const elements = [
      makeShape('a', 80, 40),
      makeShape('b', 80, 40),
      makeConnector('c1', 'a', 'b'),
    ];
    const scene = makeScene(elements);
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b', 'c1'], { direction: 'LR' });

    expect(cmd.validate(scene).valid).toBe(true);
    const newScene = cmd.execute(scene);

    const a = newScene.elements.find((e) => e.id === 'a')!;
    const b = newScene.elements.find((e) => e.id === 'b')!;

    expect(a.transform.x).toBeLessThan(b.transform.x);
    // LR: both should be at same y (centered)
    expect(a.transform.y).toBe(b.transform.y);
  });

  it('invert restores original positions', () => {
    const elements = [
      makeShape('a', 100, 60),
      makeShape('b', 100, 60),
    ];
    // Set explicit initial positions
    elements[0].transform.x = 500;
    elements[0].transform.y = 300;
    elements[1].transform.x = 700;
    elements[1].transform.y = 400;

    const scene = makeScene(elements);
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b']);

    const newScene = cmd.execute(scene);

    // Positions should have changed
    const newA = newScene.elements.find((e) => e.id === 'a')!;
    expect(newA.transform.x).not.toBe(500);

    // Invert
    const inverse = cmd.invert(newScene)!;
    expect(inverse).not.toBeNull();

    const restored = inverse.execute(newScene);
    const restoredA = restored.elements.find((e) => e.id === 'a')!;
    const restoredB = restored.elements.find((e) => e.id === 'b')!;

    expect(restoredA.transform.x).toBe(500);
    expect(restoredA.transform.y).toBe(300);
    expect(restoredB.transform.x).toBe(700);
    expect(restoredB.transform.y).toBe(400);
  });

  it('invert restores connector routes', () => {
    const elements = [
      makeShape('a', 100, 60),
      makeShape('b', 100, 60),
    ];
    const connector = makeConnector('c1', 'a', 'b');
    connector.route.points = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ];
    elements.push(connector);

    const scene = makeScene(elements);
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b', 'c1']);
    const newScene = cmd.execute(scene);

    // Connector routes should be updated by layout
    const newConn = newScene.elements.find(
      (e) => e.type === 'connector',
    ) as ConnectorElement;
    expect(newConn.route.points.length).toBeGreaterThanOrEqual(2);

    // Invert should restore original routes
    const inverse = cmd.invert(newScene)!;
    const restored = inverse.execute(newScene);
    const restoredConn = restored.elements.find(
      (e) => e.type === 'connector',
    ) as ConnectorElement;

    expect(restoredConn.route.points[0]).toEqual({ x: 10, y: 20 });
    expect(restoredConn.route.points[1]).toEqual({ x: 30, y: 40 });
    expect(restoredConn.route.points[2]).toEqual({ x: 50, y: 60 });
  });

  it('works with CommandExecutor for undo/redo', () => {
    const elements = [
      makeShape('a', 100, 60),
      makeShape('b', 100, 60),
    ];
    const scene = makeScene(elements);

    useDocumentStore.getState().loadScene(scene);

    const executor = new CommandExecutor();
    const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b']);

    const validationResult = executor.execute(cmd);
    expect(validationResult.valid).toBe(true);

    // Check positions changed
    const state = useDocumentStore.getState();
    const a = state.scene!.elements.find((e) => e.id === 'a')!;
    // Two same-sized nodes with no edges: same rank, centered horizontally
    // totalWidth = 100 + 100 + 80 = 280, x = -140 for first node
    expect(a.transform.y).toBe(0);
    expect(a.transform.x).not.toBe(0);

    // Undo
    const undone = executor.undo();
    expect(undone).toBe(true);

    // Check positions restored to original (0,0)
    const stateAfterUndo = useDocumentStore.getState();
    const aRestored = stateAfterUndo.scene!.elements.find((e) => e.id === 'a')!;
    expect(aRestored.transform.x).toBe(0);
    expect(aRestored.transform.y).toBe(0);
  });

  it('createLayoutCommand helper works', () => {
    const cmd = createLayoutCommand(flowchartLayoutEngine, ['a', 'b'], { direction: 'LR' });
    expect(cmd).toBeInstanceOf(LayoutCommand);
    expect(cmd.label).toContain('flowchart-dagre-lite');
  });
});

// ─── Directional edge routing ────────────────────────────────────────────

describe('FlowchartLayoutEngine edge routing for all directions', () => {
  it('routes TB edges from bottom of source to top of target', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    const edge = result.edges[0];
    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const targetNode = result.nodes.find((n) => n.id === 'b')!;

    // First point at source bottom center
    expect(edge.points[0].x).toBeCloseTo(sourceNode.x + 50, -1);
    expect(edge.points[0].y).toBeCloseTo(sourceNode.y + 60, -1);

    // Last point at target top center
    const last = edge.points[edge.points.length - 1];
    expect(last.x).toBeCloseTo(targetNode.x + 50, -1);
    expect(last.y).toBeCloseTo(targetNode.y, -1);
  });

  it('routes LR edges from right of source to left of target', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    const edge = result.edges[0];
    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const targetNode = result.nodes.find((n) => n.id === 'b')!;

    // First point at source right center
    expect(edge.points[0].x).toBeCloseTo(sourceNode.x + 80, -1);
    expect(edge.points[0].y).toBeCloseTo(sourceNode.y + 20, -1);

    // Last point at target left center
    const last = edge.points[edge.points.length - 1];
    expect(last.x).toBeCloseTo(targetNode.x, -1);
    expect(last.y).toBeCloseTo(targetNode.y + 20, -1);
  });

  it('does not generate edges for connectors across non-included nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'external' }];
    const result = flowchartLayoutEngine.layout(nodes, edges);
    expect(result.edges).toHaveLength(0);
  });

  it('edge route points form valid paths (TB)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
      { id: 'c', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    for (const edge of result.edges) {
      // Each edge should have at least start and end points
      expect(edge.points.length).toBeGreaterThanOrEqual(2);

      // All points should have valid coordinates
      for (const p of edge.points) {
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
      }
    }
  });
});
