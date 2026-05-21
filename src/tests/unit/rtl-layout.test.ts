import { describe, it, expect } from 'vitest';
import {
  RtlLayoutEngine,
  rtlLayoutEngine,
  extractRtlLayoutNodes,
  extractRtlLayoutEdges,
  RtlLayoutCommand,
  createRtlLayoutCommand,
} from '../../modules/rtl/layout';
import type { RtlLayoutOptions } from '../../modules/rtl/layout';
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
import { CommandExecutor } from '../../core/commands';
import { useDocumentStore } from '../../core/store';
import type {
  SceneDocument,
  RtlModuleElement,
  ConnectorElement,
  RtlPortElement,
  ShapeElement,
} from '../../core/types';

function makeRtlModule(
  id: string,
  w: number,
  h: number,
  moduleName: string,
  instanceName: string,
  ports: Array<{ direction: 'input' | 'output' | 'inout'; bitWidth: number; portName: string }>,
  collapsed = false,
  layerId = 'l1',
): RtlModuleElement {
  const portElements: RtlPortElement[] = ports.map((p, i) => ({
    id: `${id}-p${i}`,
    type: 'rtlPort' as const,
    layerId,
    direction: p.direction,
    bitWidth: p.bitWidth,
    portName: p.portName,
    transform: { x: 0, y: 0, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#000', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  }));

  return {
    id,
    type: 'rtlModule' as const,
    layerId,
    moduleName,
    instanceName,
    collapsed,
    ports: portElements,
    transform: { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#E3F2FD', stroke: '#1565C0', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeConnector(
  id: string,
  sourceId: string,
  targetId: string,
  sourceAnchor?: string,
  targetAnchor?: string,
  semanticKind?: 'rtl-net' | 'rtl-bus',
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
    source: { elementId: sourceId, anchorId: sourceAnchor ?? 'right', x: 0, y: 0 },
    target: { elementId: targetId, anchorId: targetAnchor ?? 'left', x: 0, y: 0 },
    route: { type: 'straight', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
    semanticKind,
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

describe('RtlLayoutEngine', () => {
  it('implements LayoutEngine interface', () => {
    const engine: LayoutEngine = rtlLayoutEngine;
    expect(engine.name).toBe('rtl-layout');
    expect(typeof engine.layout).toBe('function');
  });

  // ─── Empty input ───────────────────────────────────────────────────────

  it('handles empty nodes', () => {
    const result = rtlLayoutEngine.layout([], []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.totalBBox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('handles nodes with no edges', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const result = rtlLayoutEngine.layout(nodes, []);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toEqual([]);
    const ids = result.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['a', 'b']);
  });

  // ─── Default LR direction ──────────────────────────────────────────────

  it('defaults to LR (left-to-right) direction', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
      { id: 'c', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges);

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    // LR default: a (leftmost) < b < c (rightmost)
    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);

    // LR: all at same y (centered in rank)
    expect(a.y).toBe(b.y);
    expect(a.y).toBe(c.y);
  });

  // ─── Linear graph LR ──────────────────────────────────────────────────

  it('arranges linear graph LR explicitly', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
      { id: 'c', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);
    expect(a.y).toBe(b.y);
    expect(a.y).toBe(c.y);
  });

  // ─── Linear graph TB ──────────────────────────────────────────────────

  it('arranges linear graph TB (top to bottom)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    expect(a.y).toBeLessThan(b.y);
  });

  // ─── RL direction ─────────────────────────────────────────────────────

  it('arranges linear graph RL (right to left)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'RL' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    // RL: 'a' is source (rank 0), should be rightmost
    expect(a.x).toBeGreaterThan(b.x);
  });

  // ─── BT direction ─────────────────────────────────────────────────────

  it('arranges linear graph BT (bottom to top)', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'BT' });

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    expect(a.y).toBeGreaterThan(b.y);
  });

  // ─── Diamond graph ────────────────────────────────────────────────────

  it('handles diamond graph with LR direction', () => {
    const nodes: LayoutNode[] = [
      { id: 'left', width: 100, height: 50 },
      { id: 'midTop', width: 100, height: 50 },
      { id: 'midBot', width: 100, height: 50 },
      { id: 'right', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'left', target: 'midTop' },
      { source: 'left', target: 'midBot' },
      { source: 'midTop', target: 'right' },
      { source: 'midBot', target: 'right' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.nodes).toHaveLength(4);

    const l = result.nodes.find((n) => n.id === 'left')!;
    const t = result.nodes.find((n) => n.id === 'midTop')!;
    const b = result.nodes.find((n) => n.id === 'midBot')!;
    const r = result.nodes.find((n) => n.id === 'right')!;

    expect(l.x).toBeLessThan(t.x);
    expect(l.x).toBeLessThan(b.x);
    expect(t.x).toBeLessThan(r.x);
    expect(b.x).toBeLessThan(r.x);

    // midTop and midBot same rank → same x
    expect(t.x).toBe(b.x);
  });

  // ─── Spacing options ──────────────────────────────────────────────────

  it('respects custom hSpacing in LR mode', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];

    const defaultResult = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    const customResult = rtlLayoutEngine.layout(nodes, edges, {
      direction: 'LR',
      hSpacing: 300,
    });

    const defA = defaultResult.nodes.find((n) => n.id === 'a')!;
    const defB = defaultResult.nodes.find((n) => n.id === 'b')!;
    const cusA = customResult.nodes.find((n) => n.id === 'a')!;
    const cusB = customResult.nodes.find((n) => n.id === 'b')!;

    const defaultGap = defB.x - (defA.x + 100);
    const customGap = cusB.x - (cusA.x + 100);
    expect(customGap).toBeGreaterThan(defaultGap + 100);
  });

  it('respects custom vSpacing in LR mode for same-rank nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'c', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'c' },
      { source: 'b', target: 'c' },
    ];
    const defaultResult = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    const customResult = rtlLayoutEngine.layout(nodes, edges, {
      direction: 'LR',
      vSpacing: 200,
    });

    const defNodes = defaultResult.nodes.filter((n) => n.id === 'a' || n.id === 'b');
    const cusNodes = customResult.nodes.filter((n) => n.id === 'a' || n.id === 'b');
    defNodes.sort((a, b) => a.y - b.y);
    cusNodes.sort((a, b) => a.y - b.y);

    const defGap = defNodes[1].y - (defNodes[0].y + 50);
    const cusGap = cusNodes[1].y - (cusNodes[0].y + 50);
    expect(cusGap).toBeGreaterThan(defGap + 50);
  });

  // ─── Edge routing ─────────────────────────────────────────────────────

  it('generates edge routes for LR connectors', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b', connectorId: 'c1' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.edges).toHaveLength(1);
    const edge = result.edges[0];
    expect(edge.source).toBe('a');
    expect(edge.target).toBe('b');
    expect(edge.connectorId).toBe('c1');
    expect(edge.points.length).toBeGreaterThanOrEqual(2);

    // First point at source right edge center
    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const firstPoint = edge.points[0];
    expect(firstPoint.x).toBeCloseTo(sourceNode.x + 80, -1);
    expect(firstPoint.y).toBeCloseTo(sourceNode.y + 20, -1);

    // Last point at target left edge center
    const targetNode = result.nodes.find((n) => n.id === 'b')!;
    const lastPoint = edge.points[edge.points.length - 1];
    expect(lastPoint.x).toBeCloseTo(targetNode.x, -1);
    expect(lastPoint.y).toBeCloseTo(targetNode.y + 20, -1);
  });

  it('generates edge routes for TB connectors', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60 },
      { id: 'b', width: 100, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b', connectorId: 'c1' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.edges).toHaveLength(1);
    const edge = result.edges[0];

    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const firstPoint = edge.points[0];
    expect(firstPoint.x).toBeCloseTo(sourceNode.x + 50, -1);
    expect(firstPoint.y).toBeCloseTo(sourceNode.y + 60, -1);

    const targetNode = result.nodes.find((n) => n.id === 'b')!;
    const lastPoint = edge.points[edge.points.length - 1];
    expect(lastPoint.x).toBeCloseTo(targetNode.x + 50, -1);
    expect(lastPoint.y).toBeCloseTo(targetNode.y, -1);
  });

  // ─── Self-loop / invalid edges ────────────────────────────────────────

  it('ignores self-loop edges', () => {
    const nodes: LayoutNode[] = [{ id: 'a', width: 100, height: 60 }];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'a' }];
    const result = rtlLayoutEngine.layout(nodes, edges);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });

  it('ignores edges with missing nodes', () => {
    const nodes: LayoutNode[] = [{ id: 'a', width: 100, height: 60 }];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'nonexistent' },
      { source: 'missing', target: 'a' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });

  // ─── Idempotency ──────────────────────────────────────────────────────

  it('produces deterministic results', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50 },
      { id: 'b', width: 100, height: 50 },
      { id: 'c', width: 100, height: 50 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];

    const r1 = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    const r2 = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    for (const n1 of r1.nodes) {
      const n2 = r2.nodes.find((n) => n.id === n1.id)!;
      expect(n2.x).toBe(n1.x);
      expect(n2.y).toBe(n1.y);
    }
  });

  // ─── Varying node sizes ───────────────────────────────────────────────

  it('handles nodes with different sizes in LR', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 200, height: 100 },
      { id: 'b', width: 80, height: 40 },
      { id: 'c', width: 120, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.nodes).toHaveLength(3);
    for (const node of result.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }

    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;
    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);

    expect(result.totalBBox.width).toBeGreaterThanOrEqual(200);
  });

  // ─── Disconnected components ──────────────────────────────────────────

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
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.nodes).toHaveLength(4);
    for (const node of result.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  // ─── Bus signal handling ──────────────────────────────────────────────

  it('offsets bus edge routes in LR mode', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 60 },
      { id: 'b', width: 80, height: 60 },
    ];
    const edges: LayoutEdge[] = [
      {
        source: 'a',
        target: 'b',
        connectorId: 'bus1',
        metadata: { signalType: 'rtl-bus' },
      },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.edges).toHaveLength(1);
    const edge = result.edges[0];
    expect(edge.points.length).toBeGreaterThanOrEqual(2);

    // Bus should have a y-offset from center
    const sourceNode = result.nodes.find((n) => n.id === 'a')!;
    const firstPoint = edge.points[0];
    expect(firstPoint.x).toBeCloseTo(sourceNode.x + 80, -1);
    // Bus offset should shift it away from exact center
    expect(firstPoint.y).toBeGreaterThan(sourceNode.y + 30);
  });

  it('marks bus-routed flag in edge result metadata', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      {
        source: 'a',
        target: 'b',
        connectorId: 'bus1',
        metadata: { signalType: 'rtl-bus' },
      },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    expect(result.edges).toHaveLength(1);
  });

  // ─── Clock/reset signal metadata preserved ────────────────────────────

  it('preserves clock signal metadata in edge results', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      {
        source: 'a',
        target: 'b',
        connectorId: 'clk1',
        metadata: { signalType: 'clock', highlightSignal: 'clock' },
      },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    expect(result.edges).toHaveLength(1);
  });

  it('preserves reset signal metadata in edge results', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [
      {
        source: 'a',
        target: 'b',
        connectorId: 'rst1',
        metadata: { signalType: 'reset', highlightSignal: 'reset' },
      },
    ];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    expect(result.edges).toHaveLength(1);
  });
});

// ─── RTL-specific extraction ────────────────────────────────────────────

describe('extractRtlLayoutNodes', () => {
  it('extracts rtlModule nodes with correct dimensions', () => {
    const mod = makeRtlModule('m1', 100, 60, 'register', 'u_reg', [
      { direction: 'input', bitWidth: 1, portName: 'clk' },
      { direction: 'input', bitWidth: 32, portName: 'd' },
      { direction: 'output', bitWidth: 32, portName: 'q' },
    ]);

    const nodes = extractRtlLayoutNodes([mod], new Set(['m1']));
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('m1');
    expect(nodes[0].width).toBe(100);
    expect(nodes[0].height).toBe(60);
  });

  it('includes port metadata on extracted nodes', () => {
    const mod = makeRtlModule('m1', 100, 60, 'register', 'u_reg', [
      { direction: 'input', bitWidth: 1, portName: 'clk' },
      { direction: 'input', bitWidth: 32, portName: 'd' },
      { direction: 'output', bitWidth: 32, portName: 'q' },
    ]);

    const nodes = extractRtlLayoutNodes([mod], new Set(['m1']));
    expect(nodes[0].metadata).toBeDefined();
    const meta = nodes[0].metadata as Record<string, unknown>;
    expect(meta.moduleName).toBe('register');
    expect(meta.instanceName).toBe('u_reg');
    expect(meta.collapsed).toBe(false);
    expect(meta.portCount).toBe(3);
    expect(meta.inputPortCount).toBe(2);
    expect(meta.outputPortCount).toBe(1);
  });

  it('detects clock port', () => {
    const mod = makeRtlModule('m1', 100, 60, 'reg', 'u_reg', [
      { direction: 'input', bitWidth: 1, portName: 'clk' },
      { direction: 'input', bitWidth: 32, portName: 'd' },
    ]);

    const nodes = extractRtlLayoutNodes([mod], new Set(['m1']));
    const meta = nodes[0].metadata as Record<string, unknown>;
    expect(meta.hasClock).toBe(true);
    expect(meta.hasReset).toBe(false);
  });

  it('detects reset port', () => {
    const mod = makeRtlModule('m1', 100, 60, 'fsm', 'u_fsm', [
      { direction: 'input', bitWidth: 1, portName: 'rst' },
    ]);

    const nodes = extractRtlLayoutNodes([mod], new Set(['m1']));
    const meta = nodes[0].metadata as Record<string, unknown>;
    expect(meta.hasReset).toBe(true);
  });

  it('reduces height for collapsed modules', () => {
    const mod = makeRtlModule('m1', 100, 120, 'big_mod', 'u_big', [
      { direction: 'input', bitWidth: 1, portName: 'clk' },
    ], true);

    const nodes = extractRtlLayoutNodes([mod], new Set(['m1']));
    expect(nodes[0].height).toBe(40); // COLLAPSED_HEIGHT
    expect(nodes[0].width).toBe(100); // width unchanged
    const meta = nodes[0].metadata as Record<string, unknown>;
    expect(meta.collapsed).toBe(true);
  });

  it('excludes rtlPort elements', () => {
    const mod = makeRtlModule('m1', 100, 60, 'reg', 'u_reg', [
      { direction: 'input', bitWidth: 1, portName: 'clk' },
    ]);
    const portEl = mod.ports![0];
    const ids = new Set(['m1', portEl.id]);

    const nodes = extractRtlLayoutNodes([mod, portEl], ids);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('m1');
  });

  it('excludes connector elements', () => {
    const mod = makeRtlModule('m1', 100, 60, 'reg', 'u_reg', []);
    const conn = makeConnector('c1', 'm1', 'm2');
    const ids = new Set(['m1', 'c1']);

    const nodes = extractRtlLayoutNodes([mod, conn as any], ids);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('m1');
  });

  it('handles modules without ports', () => {
    const mod = makeRtlModule('m1', 80, 40, 'simple', 'u_s', []);
    const nodes = extractRtlLayoutNodes([mod], new Set(['m1']));
    expect(nodes).toHaveLength(1);
    const meta = nodes[0].metadata as Record<string, unknown>;
    expect(meta.portCount).toBe(0);
    expect(meta.inputPortCount).toBe(0);
    expect(meta.outputPortCount).toBe(0);
  });
});

// ─── RTL-specific edge extraction ───────────────────────────────────────

describe('extractRtlLayoutEdges', () => {
  it('extracts edges with port anchor metadata', () => {
    const mod1 = makeRtlModule('m1', 100, 60, 'reg', 'u1', [
      { direction: 'output', bitWidth: 32, portName: 'q' },
    ]);
    const mod2 = makeRtlModule('m2', 100, 60, 'alu', 'u2', [
      { direction: 'input', bitWidth: 32, portName: 'a' },
    ]);
    const conn = makeConnector('c1', 'm1', 'm2', 'q', 'a', 'rtl-net');
    const ids = new Set(['m1', 'm2']);

    const edges = extractRtlLayoutEdges([mod1, mod2, conn as any], ids);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('m1');
    expect(edges[0].target).toBe('m2');
    expect(edges[0].connectorId).toBe('c1');

    const meta = edges[0].metadata as Record<string, unknown>;
    expect(meta.signalType).toBe('rtl-net');
    expect(meta.sourcePort).toBe('q');
    expect(meta.targetPort).toBe('a');
  });

  it('detects rtl-bus semantic kind', () => {
    const mod1 = makeRtlModule('m1', 100, 60, 'cpu', 'u1', [
      { direction: 'output', bitWidth: 64, portName: 'data_out' },
    ]);
    const mod2 = makeRtlModule('m2', 100, 60, 'mem', 'u2', [
      { direction: 'input', bitWidth: 64, portName: 'data_in' },
    ]);
    const conn = makeConnector('bus1', 'm1', 'm2', 'data_out', 'data_in', 'rtl-bus');
    const ids = new Set(['m1', 'm2']);

    const edges = extractRtlLayoutEdges([mod1, mod2, conn as any], ids);
    const meta = edges[0].metadata as Record<string, unknown>;
    expect(meta.signalType).toBe('rtl-bus');
  });

  it('detects clock signal from port names', () => {
    const mod1 = makeRtlModule('clk_src', 60, 40, 'clk_gen', 'u_clk', [
      { direction: 'output', bitWidth: 1, portName: 'clk' },
    ]);
    const mod2 = makeRtlModule('reg', 80, 50, 'register', 'u_reg', [
      { direction: 'input', bitWidth: 1, portName: 'clk' },
      { direction: 'input', bitWidth: 32, portName: 'd' },
    ]);
    const conn = makeConnector('clk_conn', 'clk_src', 'reg', 'clk', 'clk');
    const ids = new Set(['clk_src', 'reg']);

    const edges = extractRtlLayoutEdges([mod1, mod2, conn as any], ids);
    const meta = edges[0].metadata as Record<string, unknown>;
    expect(meta.highlightSignal).toBe('clock');
    expect(meta.signalType).toBe('clock');
  });

  it('detects reset signal from port names', () => {
    const mod1 = makeRtlModule('src', 60, 40, 'rst_ctrl', 'u_rst', [
      { direction: 'output', bitWidth: 1, portName: 'rst' },
    ]);
    const mod2 = makeRtlModule('fsm', 80, 50, 'fsm', 'u_fsm', [
      { direction: 'input', bitWidth: 1, portName: 'rst' },
    ]);
    const conn = makeConnector('rst_conn', 'src', 'fsm', 'rst', 'rst');
    const ids = new Set(['src', 'fsm']);

    const edges = extractRtlLayoutEdges([mod1, mod2, conn as any], ids);
    const meta = edges[0].metadata as Record<string, unknown>;
    expect(meta.highlightSignal).toBe('reset');
    expect(meta.signalType).toBe('reset');
  });

  it('filters edges with endpoints not in the element set', () => {
    const mod1 = makeRtlModule('m1', 100, 60, 'reg', 'u1', []);
    const mod2 = makeRtlModule('m2', 100, 60, 'alu', 'u2', []);
    const conn = makeConnector('c1', 'm1', 'm2');
    const ids = new Set(['m1']); // only m1

    const edges = extractRtlLayoutEdges([mod1, mod2, conn as any], ids);
    expect(edges).toHaveLength(0);
  });

  it('filters edges where source has no elementId', () => {
    const mod2 = makeRtlModule('m2', 100, 60, 'alu', 'u2', []);
    const conn: ConnectorElement = {
      id: 'c1',
      type: 'connector',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
      source: { x: 0, y: 0 },  // no elementId
      target: { elementId: 'm2', x: 0, y: 0 },
      route: { type: 'straight', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
    };
    const ids = new Set(['m2']);

    const edges = extractRtlLayoutEdges([mod2, conn as any], ids);
    expect(edges).toHaveLength(0);
  });
});

// ─── Scene integration ──────────────────────────────────────────────────

describe('RTL layout scene integration', () => {
  it('applyLayoutToScene with RTL engine positions nodes LR', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const modC = makeRtlModule('c', 100, 60, 'dst2', 'u_c', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const conn1 = makeConnector('c1', 'a', 'b', 'out1', 'in1', 'rtl-net');
    const conn2 = makeConnector('c2', 'b', 'c', /* no specific ports of b->c, but it's b to c */);

    const scene = makeScene([modA, modB, modC, conn1 as any, conn2 as any]);

    const nodeIds = new Set(['a', 'b', 'c']);
    const nodes = extractRtlLayoutNodes(scene.elements, nodeIds);
    const edges = extractRtlLayoutEdges(scene.elements, nodeIds);
    const result = rtlLayoutEngine.layout(nodes, edges);

    const updated = applyLayoutToScene(scene, result);

    const a = updated.elements.find((e) => e.id === 'a')!;
    const b = updated.elements.find((e) => e.id === 'b')!;
    const c = updated.elements.find((e) => e.id === 'c')!;

    expect(a.transform.x).toBeLessThan(b.transform.x);
    expect(b.transform.x).toBeLessThan(c.transform.x);

    // Connector routes updated
    const connResult = updated.elements.find((e) => e.id === 'c1') as ConnectorElement;
    expect(connResult.route.points.length).toBeGreaterThanOrEqual(2);
    expect(connResult.source.x).toBeDefined();
    expect(connResult.target.x).toBeDefined();
  });

  it('preserves scene structure after RTL layout', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const scene = makeScene([modA, modB]);

    const nodes = extractRtlLayoutNodes(scene.elements, new Set(['a', 'b']));
    const edges = extractRtlLayoutEdges(scene.elements, new Set(['a', 'b']));
    const result = rtlLayoutEngine.layout(nodes, edges);
    const updated = applyLayoutToScene(scene, result);

    expect(updated.schemaVersion).toBe('1.0.0');
    expect(updated.project.name).toBe('test');
    expect(updated.layers).toHaveLength(1);
    expect(updated.groups).toEqual([]);

    const a = updated.elements.find((e) => e.id === 'a')!;
    expect(a.visible).toBe(true);
    expect(a.locked).toBe(false);
  });
});

// ─── RtlLayoutCommand ──────────────────────────────────────────────────

describe('RtlLayoutCommand', () => {
  it('creates via helper function', () => {
    const cmd = createRtlLayoutCommand(['a', 'b']);
    expect(cmd).toBeInstanceOf(RtlLayoutCommand);
    expect(cmd.label).toContain('rtl-layout');
  });

  it('validates with valid element IDs', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', []);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', []);
    const scene = makeScene([modA, modB]);
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['a', 'b']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(true);
  });

  it('fails validation with empty element IDs', () => {
    const scene = makeScene([]);
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, []);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('fails validation with missing element ID', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', []);
    const scene = makeScene([modA]);
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['a', 'missing']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('executes layout and positions RTL modules', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const modC = makeRtlModule('c', 100, 60, 'dst2', 'u_c', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const conn1 = makeConnector('c1', 'a', 'b', 'out1', 'in1', 'rtl-net');
    const conn2 = makeConnector('c2', 'a', 'c', 'out1', 'in1', 'rtl-net');

    const scene = makeScene([modA, modB, modC, conn1 as any, conn2 as any]);
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['a', 'b', 'c', 'c1', 'c2']);

    expect(cmd.validate(scene).valid).toBe(true);
    const newScene = cmd.execute(scene);

    const a = newScene.elements.find((e) => e.id === 'a')!;
    const b = newScene.elements.find((e) => e.id === 'b')!;
    const c = newScene.elements.find((e) => e.id === 'c')!;

    // LR: a should be leftmost
    expect(a.transform.x).toBeLessThan(b.transform.x);
    expect(a.transform.x).toBeLessThan(c.transform.x);
    // b and c same rank → same x
    expect(b.transform.x).toBe(c.transform.x);
  });

  it('invert restores original positions', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    modA.transform.x = 500;
    modA.transform.y = 300;
    modB.transform.x = 700;
    modB.transform.y = 400;

    const scene = makeScene([modA, modB]);
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['a', 'b']);

    const newScene = cmd.execute(scene);
    const newA = newScene.elements.find((e) => e.id === 'a')!;
    expect(newA.transform.x).not.toBe(500);

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
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const conn = makeConnector('c1', 'a', 'b', 'out1', 'in1', 'rtl-net');
    conn.route.points = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ];

    const scene = makeScene([modA, modB, conn as any]);
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['a', 'b', 'c1']);
    const newScene = cmd.execute(scene);

    const newConn = newScene.elements.find(
      (e) => e.type === 'connector',
    ) as ConnectorElement;
    expect(newConn.route.points.length).toBeGreaterThanOrEqual(2);

    const inverse = cmd.invert(newScene)!;
    const restored = inverse.execute(newScene);
    const restoredConn = restored.elements.find(
      (e) => e.type === 'connector',
    ) as ConnectorElement;

    expect(restoredConn.route.points[0]).toEqual({ x: 10, y: 20 });
    expect(restoredConn.route.points[1]).toEqual({ x: 30, y: 40 });
  });

  it('works with CommandExecutor for undo/redo', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 60, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ]);
    const scene = makeScene([modA, modB]);

    useDocumentStore.getState().loadScene(scene);

    const executor = new CommandExecutor();
    const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['a', 'b']);

    const validationResult = executor.execute(cmd);
    expect(validationResult.valid).toBe(true);

    const state = useDocumentStore.getState();
    const a = state.scene!.elements.find((e) => e.id === 'a')!;
    const b = state.scene!.elements.find((e) => e.id === 'b')!;
    // No edges → single rank, nodes centered horizontally
    expect(a.transform.x).toBe(b.transform.x);

    // Undo
    const undone = executor.undo();
    expect(undone).toBe(true);

    const stateAfterUndo = useDocumentStore.getState();
    const aRestored = stateAfterUndo.scene!.elements.find((e) => e.id === 'a')!;
    expect(aRestored.transform.x).toBe(0);
    expect(aRestored.transform.y).toBe(0);

    // Redo
    const redone = executor.redo();
    expect(redone).toBe(true);

    const stateAfterRedo = useDocumentStore.getState();
    const aRedone = stateAfterRedo.scene!.elements.find((e) => e.id === 'a')!;
    expect(aRedone.transform.x).toBe(a.transform.x);
  });

  it('can use RTL extraction with generic LayoutEngine compatibility', () => {
    // The RTL engine works with standard LayoutNodes too
    const nodes: LayoutNode[] = [
      { id: 'x', width: 80, height: 40 },
      { id: 'y', width: 80, height: 40 },
    ];
    const edges: LayoutEdge[] = [{ source: 'x', target: 'y' }];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].x).toBeLessThan(result.nodes[1].x);
  });
});

// ─── Collapsed module handling ──────────────────────────────────────────

describe('RTL layout with collapsed modules', () => {
  it('collapsed module has reduced height', () => {
    const modA = makeRtlModule('a', 100, 60, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ]);
    const modB = makeRtlModule('b', 100, 120, 'big', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ], true); // collapsed
    const scene = makeScene([modA, modB]);

    const nodes = extractRtlLayoutNodes(scene.elements, new Set(['a', 'b']));
    const nodeB = nodes.find((n) => n.id === 'b')!;
    expect(nodeB.height).toBe(40);
    const nodeA = nodes.find((n) => n.id === 'a')!;
    expect(nodeA.height).toBe(60);

    // Layout should work correctly with mixed heights
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    expect(result.nodes).toHaveLength(2);
    expect(Number.isFinite(result.nodes[0].x)).toBe(true);
    expect(Number.isFinite(result.nodes[1].x)).toBe(true);
  });

  it('all nodes collapsed layout still works', () => {
    const modA = makeRtlModule('a', 100, 80, 'src', 'u_a', [
      { direction: 'output', bitWidth: 32, portName: 'out1' },
    ], true);
    const modB = makeRtlModule('b', 100, 80, 'dst', 'u_b', [
      { direction: 'input', bitWidth: 32, portName: 'in1' },
    ], true);
    const scene = makeScene([modA, modB]);

    const nodes = extractRtlLayoutNodes(scene.elements, new Set(['a', 'b']));
    for (const n of nodes) {
      expect(n.height).toBe(40);
    }

    const edges = extractRtlLayoutEdges(scene.elements, new Set(['a', 'b']));
    // No edges since no connectors in scene
    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });
    expect(result.nodes).toHaveLength(2);
    expect(Number.isFinite(result.nodes[0].x)).toBe(true);
    expect(Number.isFinite(result.nodes[1].x)).toBe(true);
  });
});

// ─── Port-position-aware ordering ───────────────────────────────────────

describe('RTL layout port-position-aware ordering', () => {
  it('orders same-rank nodes using port index hints', () => {
    const nodes: LayoutNode[] = [
      {
        id: 'src',
        width: 100,
        height: 80,
        metadata: {
          type: 'rtlModule',
          ports: [
            { direction: 'output', portName: 'out_high', bitWidth: 32 },
            { direction: 'output', portName: 'out_low', bitWidth: 32 },
          ],
          outputPortCount: 2,
        },
      },
      {
        id: 'dstA',
        width: 100,
        height: 60,
        metadata: { type: 'rtlModule' },
      },
      {
        id: 'dstB',
        width: 100,
        height: 60,
        metadata: { type: 'rtlModule' },
      },
    ];

    const edges: LayoutEdge[] = [
      {
        source: 'src',
        target: 'dstA',
        metadata: { sourcePortIndex: 0, targetPortIndex: 0 },
      },
      {
        source: 'src',
        target: 'dstB',
        metadata: { sourcePortIndex: 1, targetPortIndex: 0 },
      },
    ];

    const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    const dstA = result.nodes.find((n) => n.id === 'dstA')!;
    const dstB = result.nodes.find((n) => n.id === 'dstB')!;

    // Both dstA and dstB should be at same rank (same x)
    expect(dstA.x).toBe(dstB.x);

    // dstA (connected to port 0, upper) should be above dstB (port 1, lower)
    // with port-index-weighted ordering
    expect(dstA.y).toBeLessThan(dstB.y);
  });
});
