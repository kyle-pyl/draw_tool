import { describe, it, expect } from 'vitest';
import {
  TopologyLayoutEngine,
  topologyLayoutEngine,
  extractTopologyLayoutNodes,
  extractTopologyLayoutEdges,
  TopologyLayoutCommand,
  createTopologyLayoutCommand,
} from '../../modules/topology/layout';
import type { TopologyLayoutOptions, TopologyLayoutMode } from '../../modules/topology/layout';
import {
  applyLayoutToScene,
} from '../../core/layout';
import type {
  LayoutNode,
  LayoutEdge,
  LayoutOptions,
  LayoutResult,
  LayoutEngine,
} from '../../core/layout';
import { useDocumentStore } from '../../core/store';
import type {
  SceneDocument,
  TopologyNodeElement,
  ConnectorElement,
  ContainerElement,
} from '../../core/types';
import { generateId } from '../../core/utils';

function makeTopoNode(
  id: string,
  deviceType: TopologyNodeElement['deviceType'],
  w: number,
  h: number,
  layerId = 'l1',
): TopologyNodeElement {
  return {
    id,
    type: 'topologyNode',
    layerId,
    deviceType,
    label: deviceType,
    transform: { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#e8f5e9', stroke: '#2e7d32', strokeWidth: 2, opacity: 1 },
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
    source: { elementId: sourceId, anchorId: 'bottom', x: 0, y: 0 },
    target: { elementId: targetId, anchorId: 'top', x: 0, y: 0 },
    route: { type: 'straight', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
    semanticKind: 'network-link',
  };
}

function makeContainer(
  id: string,
  w: number,
  h: number,
  childElementIds: string[],
  layerId = 'l1',
): ContainerElement {
  return {
    id,
    type: 'container',
    layerId,
    name: 'Subnet',
    containerKind: 'subnet',
    childElementIds,
    transform: { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: 'none', stroke: '#888', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
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

// ─── Engine conformance ──────────────────────────────────────────────────────

describe('TopologyLayoutEngine', () => {
  it('implements LayoutEngine interface', () => {
    const engine: LayoutEngine = topologyLayoutEngine;
    expect(engine.name).toBe('topology-layout');
    expect(typeof engine.layout).toBe('function');
  });

  // ─── Empty input ───────────────────────────────────────────────────────────

  it('handles empty nodes', () => {
    const result = topologyLayoutEngine.layout([], []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.totalBBox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('handles nodes with no edges', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 60, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 100, height: 60, metadata: { deviceType: 'switch', rank: 1 } },
    ];
    const result = topologyLayoutEngine.layout(nodes, []);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toEqual([]);
    const ids = result.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['a', 'b']);
  });

  // ─── Hierarchical layout: device tier ranking ──────────────────────────────

  it('arranges devices by tier hierarchy (core → distribution → access)', () => {
    const nodes: LayoutNode[] = [
      { id: 'router', width: 120, height: 60, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'switch1', width: 100, height: 50, metadata: { deviceType: 'switch', rank: 1 } },
      { id: 'switch2', width: 100, height: 50, metadata: { deviceType: 'switch', rank: 1 } },
      { id: 'server1', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
      { id: 'server2', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const edges: LayoutEdge[] = [
      { source: 'router', target: 'switch1' },
      { source: 'router', target: 'switch2' },
      { source: 'switch1', target: 'server1' },
      { source: 'switch2', target: 'server2' },
    ];
    const result = topologyLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.nodes).toHaveLength(5);

    const router = result.nodes.find((n) => n.id === 'router')!;
    const switch1 = result.nodes.find((n) => n.id === 'switch1')!;
    const switch2 = result.nodes.find((n) => n.id === 'switch2')!;
    const server1 = result.nodes.find((n) => n.id === 'server1')!;
    const server2 = result.nodes.find((n) => n.id === 'server2')!;

    // Router (core) should be topmost
    expect(router.y).toBeLessThan(switch1.y);
    expect(router.y).toBeLessThan(switch2.y);
    // Switches (distribution) below router, above servers
    expect(switch1.y).toBeLessThan(server1.y);
    expect(switch2.y).toBeLessThan(server2.y);
    // Switches at same rank
    expect(switch1.y).toBe(switch2.y);
    // Servers at same rank
    expect(server1.y).toBe(server2.y);
  });

  // ─── LR direction ─────────────────────────────────────────────────────────

  it('arranges hierarchical layout LR (left to right)', () => {
    const nodes: LayoutNode[] = [
      { id: 'router', width: 120, height: 60, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'switch', width: 100, height: 50, metadata: { deviceType: 'switch', rank: 1 } },
      { id: 'server', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const edges: LayoutEdge[] = [
      { source: 'router', target: 'switch' },
      { source: 'switch', target: 'server' },
    ];
    const result = topologyLayoutEngine.layout(nodes, edges, { direction: 'LR' });

    const router = result.nodes.find((n) => n.id === 'router')!;
    const sw = result.nodes.find((n) => n.id === 'switch')!;
    const server = result.nodes.find((n) => n.id === 'server')!;

    expect(router.x).toBeLessThan(sw.x);
    expect(sw.x).toBeLessThan(server.x);
  });

  // ─── Isolated nodes (no edges) ────────────────────────────────────────────

  it('positions isolated nodes by device rank', () => {
    const nodes: LayoutNode[] = [
      { id: 'router', width: 120, height: 60, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'server', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const result = topologyLayoutEngine.layout(nodes, [], { direction: 'TB' });

    const router = result.nodes.find((n) => n.id === 'router')!;
    const server = result.nodes.find((n) => n.id === 'server')!;

    expect(router.y).toBeLessThan(server.y);
  });

  // ─── Custom spacing ───────────────────────────────────────────────────────

  it('respects custom hSpacing and vSpacing', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 100, height: 50, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b' }];

    const defaultResult = topologyLayoutEngine.layout(nodes, edges, { direction: 'TB' });
    const customResult = topologyLayoutEngine.layout(nodes, edges, {
      direction: 'TB',
      vSpacing: 300,
    });

    const defaultA = defaultResult.nodes.find((n) => n.id === 'a')!;
    const defaultB = defaultResult.nodes.find((n) => n.id === 'b')!;
    const customA = customResult.nodes.find((n) => n.id === 'a')!;
    const customB = customResult.nodes.find((n) => n.id === 'b')!;

    const defaultGap = defaultB.y - defaultA.y;
    const customGap = customB.y - customA.y;
    expect(customGap).toBeGreaterThan(defaultGap);
  });

  // ─── Edge routes ──────────────────────────────────────────────────────────

  it('generates orthogonal edge routes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 100, height: 50, metadata: { deviceType: 'switch', rank: 1 } },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b', connectorId: 'c1' }];
    const result = topologyLayoutEngine.layout(nodes, edges, { direction: 'TB' });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].connectorId).toBe('c1');
    expect(result.edges[0].source).toBe('a');
    expect(result.edges[0].target).toBe('b');
    expect(result.edges[0].points.length).toBeGreaterThanOrEqual(2);
  });

  it('filters out self-loop edges', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50, metadata: { deviceType: 'router', rank: 0 } },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'a' }];
    const result = topologyLayoutEngine.layout(nodes, edges);
    expect(result.edges).toHaveLength(0);
  });

  it('filters out edges with unknown nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50, metadata: { deviceType: 'router', rank: 0 } },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'unknown' }];
    const result = topologyLayoutEngine.layout(nodes, edges);
    expect(result.edges).toHaveLength(0);
  });

  // ─── Total BBox ───────────────────────────────────────────────────────────

  it('computes totalBBox covering all nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 100, height: 50, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const result = topologyLayoutEngine.layout(nodes, [], { direction: 'TB' });

    expect(result.totalBBox.width).toBeGreaterThanOrEqual(100);
    expect(result.totalBBox.height).toBeGreaterThanOrEqual(50 + 80 + 50);
    expect(result.totalBBox.x).toBeDefined();
    expect(result.totalBBox.y).toBeDefined();
  });

  // ─── Force-directed mode ──────────────────────────────────────────────────

  it('force-directed layout produces non-overlapping positions', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 80, height: 40, metadata: { deviceType: 'switch', rank: 1 } },
      { id: 'c', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
      { id: 'd', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const result = topologyLayoutEngine.layout(nodes, [], {
      direction: 'TB',
      extra: { mode: 'force-directed' as TopologyLayoutMode },
    });

    expect(result.nodes).toHaveLength(4);
    // All nodes should have different positions
    const positions = result.nodes.map((n) => `${n.x.toFixed(0)},${n.y.toFixed(0)}`);
    expect(new Set(positions).size).toBe(4);
  });

  it('force-directed produces edges when given', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 80, height: 40, metadata: { deviceType: 'switch', rank: 1 } },
    ];
    const edges: LayoutEdge[] = [{ source: 'a', target: 'b', connectorId: 'c1' }];
    const result = topologyLayoutEngine.layout(nodes, edges, {
      extra: { mode: 'force-directed' as TopologyLayoutMode },
    });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].connectorId).toBe('c1');
    expect(result.edges[0].points).toHaveLength(2);
  });
});

// ─── extractTopologyLayoutNodes ──────────────────────────────────────────────

describe('extractTopologyLayoutNodes', () => {
  it('extracts topologyNode elements', () => {
    const elements = [
      makeTopoNode('router1', 'router', 120, 60),
      makeTopoNode('switch1', 'switch', 100, 50),
    ];
    const nodes = extractTopologyLayoutNodes(elements, new Set(['router1', 'switch1']));
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe('router1');
    expect(nodes[1].id).toBe('switch1');
  });

  it('populates deviceType in metadata', () => {
    const elements = [makeTopoNode('r1', 'router', 120, 60)];
    const nodes = extractTopologyLayoutNodes(elements, new Set(['r1']));
    expect(nodes[0].metadata?.deviceType).toBe('router');
    expect(nodes[0].metadata?.label).toBe('router');
  });

  it('assigns correct rank from deviceType', () => {
    const elements = [makeTopoNode('r1', 'router', 120, 60)];
    const nodes = extractTopologyLayoutNodes(elements, new Set(['r1']));
    expect(nodes[0].metadata?.rank).toBe(0);

    const elements2 = [makeTopoNode('s1', 'switch', 100, 50)];
    const nodes2 = extractTopologyLayoutNodes(elements2, new Set(['s1']));
    expect(nodes2[0].metadata?.rank).toBe(1);

    const elements3 = [makeTopoNode('srv', 'server', 80, 40)];
    const nodes3 = extractTopologyLayoutNodes(elements3, new Set(['srv']));
    expect(nodes3[0].metadata?.rank).toBe(3);
  });

  it('excludes non-topologyNode and non-container elements', () => {
    const topo = makeTopoNode('t1', 'router', 100, 60);
    const shape = {
      id: 'shape1',
      type: 'shape' as const,
      layerId: 'l1',
      shapeKind: 'rect' as const,
      transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    };
    const nodes = extractTopologyLayoutNodes([topo, shape], new Set(['t1', 'shape1']));
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('t1');
  });

  it('extracts container elements with subnet info', () => {
    const cont = makeContainer('sub1', 300, 200, ['srv1', 'srv2']);
    const nodes = extractTopologyLayoutNodes([cont], new Set(['sub1']));
    expect(nodes).toHaveLength(1);
    expect(nodes[0].metadata?.isContainer).toBe(true);
    expect(nodes[0].metadata?.containerName).toBe('Subnet');
    expect(nodes[0].metadata?.childElementIds).toEqual(['srv1', 'srv2']);
  });

  it('returns empty array for empty id set', () => {
    const elements = [makeTopoNode('r1', 'router', 120, 60)];
    const nodes = extractTopologyLayoutNodes(elements, new Set());
    expect(nodes).toHaveLength(0);
  });

  it('extracts width and height from transform', () => {
    const elements = [makeTopoNode('r1', 'router', 150, 75)];
    const nodes = extractTopologyLayoutNodes(elements, new Set(['r1']));
    expect(nodes[0].width).toBe(150);
    expect(nodes[0].height).toBe(75);
  });
});

// ─── extractTopologyLayoutEdges ──────────────────────────────────────────────

describe('extractTopologyLayoutEdges', () => {
  it('extracts connector edges between topology nodes', () => {
    const elements = [
      makeTopoNode('router1', 'router', 120, 60),
      makeTopoNode('switch1', 'switch', 100, 50),
      makeConnector('c1', 'router1', 'switch1'),
    ];
    const edges = extractTopologyLayoutEdges(elements, new Set(['router1', 'switch1']));
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('router1');
    expect(edges[0].target).toBe('switch1');
    expect(edges[0].connectorId).toBe('c1');
  });

  it('enriches edges with semanticKind', () => {
    const elements = [
      makeTopoNode('r1', 'router', 120, 60),
      makeTopoNode('s1', 'switch', 100, 50),
      makeConnector('c1', 'r1', 's1'),
    ];
    const edges = extractTopologyLayoutEdges(elements, new Set(['r1', 's1']));
    expect(edges[0].metadata?.semanticKind).toBe('network-link');
  });

  it('excludes connectors with source outside id set', () => {
    const elements = [
      makeTopoNode('r1', 'router', 120, 60),
      makeTopoNode('s1', 'switch', 100, 50),
      makeConnector('c1', 'unknown', 's1'),
    ];
    const edges = extractTopologyLayoutEdges(elements, new Set(['r1', 's1']));
    expect(edges).toHaveLength(0);
  });

  it('excludes connectors with target outside id set', () => {
    const elements = [
      makeTopoNode('r1', 'router', 120, 60),
      makeTopoNode('s1', 'switch', 100, 50),
      makeConnector('c1', 'r1', 'unknown'),
    ];
    const edges = extractTopologyLayoutEdges(elements, new Set(['r1', 's1']));
    expect(edges).toHaveLength(0);
  });

  it('carries link labels in metadata', () => {
    const connector: ConnectorElement = {
      ...makeConnector('c1', 'r1', 's1'),
      labels: [
        { text: '10 Gbps', position: 0.5, offset: { x: 0, y: -10 } },
      ],
    };
    const elements = [
      makeTopoNode('r1', 'router', 120, 60),
      makeTopoNode('s1', 'switch', 100, 50),
      connector,
    ];
    const edges = extractTopologyLayoutEdges(elements, new Set(['r1', 's1']));
    expect(edges).toHaveLength(1);
    const linkLabels = edges[0].metadata?.linkLabels as Array<{ text: string }> | undefined;
    expect(linkLabels).toBeDefined();
    expect(linkLabels![0].text).toBe('10 Gbps');
  });

  it('returns empty array for non-connector elements', () => {
    const elements = [
      makeTopoNode('r1', 'router', 120, 60),
      makeTopoNode('s1', 'switch', 100, 50),
    ];
    const edges = extractTopologyLayoutEdges(elements, new Set(['r1', 's1']));
    expect(edges).toHaveLength(0);
  });
});

// ─── TopologyLayoutCommand ──────────────────────────────────────────────────

describe('TopologyLayoutCommand', () => {
  it('creates command via factory', () => {
    const cmd = createTopologyLayoutCommand(['a', 'b']);
    expect(cmd).toBeInstanceOf(TopologyLayoutCommand);
    expect(cmd.label).toContain('topology-layout');
  });

  it('validates that elements exist', () => {
    const scene = makeScene([
      makeTopoNode('r1', 'router', 120, 60),
    ]);
    const cmd = createTopologyLayoutCommand(['r1']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(true);
  });

  it('fails validation if element not found', () => {
    const scene = makeScene([
      makeTopoNode('r1', 'router', 120, 60),
    ]);
    const cmd = createTopologyLayoutCommand(['nonexistent']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('fails validation with empty element list', () => {
    const scene = makeScene([]);
    const cmd = createTopologyLayoutCommand([]);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('executes layout on topology nodes', () => {
    const scene = makeScene([
      makeTopoNode('router1', 'router', 120, 60),
      makeTopoNode('switch1', 'switch', 100, 50),
      makeTopoNode('server1', 'server', 80, 40),
      makeConnector('c1', 'router1', 'switch1'),
      makeConnector('c2', 'switch1', 'server1'),
    ]);
    const cmd = createTopologyLayoutCommand(['router1', 'switch1', 'server1', 'c1', 'c2'], {
      direction: 'TB',
    });

    const result = cmd.execute(scene);

    const router = result.elements.find((e) => e.id === 'router1')!;
    const sw = result.elements.find((e) => e.id === 'switch1')!;
    const server = result.elements.find((e) => e.id === 'server1')!;

    // Router top, switch middle, server bottom
    expect(router.transform.y).toBeLessThan(sw.transform.y);
    expect(sw.transform.y).toBeLessThan(server.transform.y);

    // Connector routes updated
    const c1 = result.elements.find((e) => e.id === 'c1') as ConnectorElement;
    expect(c1.route.points.length).toBeGreaterThanOrEqual(2);
  });

  it('supports undo/redo via invert', () => {
    const scene = makeScene([
      makeTopoNode('router1', 'router', 120, 60),
      makeTopoNode('switch1', 'switch', 100, 50),
    ]);

    const cmd = createTopologyLayoutCommand(['router1', 'switch1']);
    const executed = cmd.execute(scene);

    const routerAfter = executed.elements.find((e) => e.id === 'router1')!;
    const swAfter = executed.elements.find((e) => e.id === 'switch1')!;

    // Undo command
    const undo = cmd.invert(executed);
    expect(undo).not.toBeNull();

    // Execute undo (which saves pre-layout state)
    const restoredScene = undo!.execute(scene);
    const routerRestored = restoredScene.elements.find((e) => e.id === 'router1')!;
    const swRestored = restoredScene.elements.find((e) => e.id === 'switch1')!;

    expect(routerRestored.transform.x).toBe(0);
    expect(routerRestored.transform.y).toBe(0);
    expect(swRestored.transform.x).toBe(0);
    expect(swRestored.transform.y).toBe(0);
  });

  it('applies layoutToScene to update element positions', () => {
    const elements = [
      makeTopoNode('r1', 'router', 120, 60),
      makeTopoNode('s1', 'switch', 100, 50),
    ];
    const scene = makeScene(elements);

    const result: LayoutResult = {
      nodes: [
        { id: 'r1', x: 50, y: 30 },
        { id: 's1', x: 50, y: 190 },
      ],
      edges: [],
      totalBBox: { x: 50, y: 30, width: 120, height: 210 },
    };

    const updated = applyLayoutToScene(scene, result);
    const r1 = updated.elements.find((e) => e.id === 'r1')!;
    const s1 = updated.elements.find((e) => e.id === 's1')!;
    expect(r1.transform.x).toBe(50);
    expect(r1.transform.y).toBe(30);
    expect(s1.transform.x).toBe(50);
    expect(s1.transform.y).toBe(190);
  });

  // ─── All device types ─────────────────────────────────────────────────────

  it('handles all TopologyDeviceType values', () => {
    const deviceTypes: TopologyNodeElement['deviceType'][] = [
      'router', 'switch', 'firewall', 'loadBalancer', 'gateway', 'server', 'cloud', 'custom',
    ];
    const nodes: LayoutNode[] = deviceTypes.map((dt, i) => ({
      id: `dev-${i}`,
      width: 100,
      height: 50,
      metadata: {
        deviceType: dt,
        rank: { router: 0, switch: 1, firewall: 2, loadBalancer: 2, gateway: 2, server: 3, cloud: 2, custom: 2 }[dt] ?? 2,
      },
    }));
    const result = topologyLayoutEngine.layout(nodes, [], { direction: 'TB' });
    expect(result.nodes).toHaveLength(8);
  });

  // ─── Container layout ─────────────────────────────────────────────────────

  it('positions containers around child nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'srv1', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
      { id: 'srv2', width: 80, height: 40, metadata: { deviceType: 'server', rank: 3 } },
      {
        id: 'subnet1',
        width: 300,
        height: 200,
        metadata: {
          isContainer: true,
          containerName: 'Subnet A',
          childElementIds: ['srv1', 'srv2'],
        },
      },
    ];
    const result = topologyLayoutEngine.layout(nodes, [], { direction: 'TB' });

    // Container should be positioned
    const subnet = result.nodes.find((n) => n.id === 'subnet1');
    expect(subnet).toBeDefined();
  });
});

// ─── TopologyLayoutOptions ──────────────────────────────────────────────────

describe('TopologyLayoutOptions', () => {
  it('accepts mode and containerPadding', () => {
    const opts: TopologyLayoutOptions = {
      mode: 'hierarchical',
      containerPadding: 40,
      direction: 'TB',
      hSpacing: 120,
    };
    expect(opts.mode).toBe('hierarchical');
    expect(opts.containerPadding).toBe(40);
    expect(opts.direction).toBe('TB');
  });

  it('default mode is hierarchical via engine', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 50, metadata: { deviceType: 'router', rank: 0 } },
      { id: 'b', width: 100, height: 50, metadata: { deviceType: 'server', rank: 3 } },
    ];
    const result = topologyLayoutEngine.layout(nodes, []);

    // With TB default, router should be above server
    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    expect(a.y).toBeLessThan(b.y);
  });
});
