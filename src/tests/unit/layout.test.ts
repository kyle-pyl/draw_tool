import { describe, it, expect } from 'vitest';
import {
  applyLayoutToScene,
  extractLayoutNodes,
  extractLayoutEdges,
} from '../../core/layout';
import type {
  LayoutDirection,
  LayoutHAlign,
  LayoutVAlign,
  LayoutOptions,
  LayoutNode,
  LayoutEdge,
  LayoutNodeResult,
  LayoutEdgeResult,
  LayoutResult,
  LayoutEngine,
} from '../../core/layout';
import type { SceneDocument, ShapeElement, ConnectorElement } from '../../core/types';

function makeShape(id: string, x: number, y: number, w: number, h: number, layerId = 'l1'): ShapeElement {
  return {
    id,
    type: 'shape',
    layerId,
    shapeKind: 'rect',
    transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeConnector(id: string, sourceId: string, targetId: string, layerId = 'l1'): ConnectorElement {
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
    canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
    rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements,
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

// ─── Type exports ──────────────────────────────────────────────────────────

describe('Layout types (compile-time check)', () => {
  it('LayoutDirection accepts valid values', () => {
    const d1: LayoutDirection = 'LR';
    const d2: LayoutDirection = 'RL';
    const d3: LayoutDirection = 'TB';
    const d4: LayoutDirection = 'BT';
    expect(d1).toBe('LR');
    expect(d2).toBe('RL');
    expect(d3).toBe('TB');
    expect(d4).toBe('BT');
  });

  it('LayoutHAlign accepts valid values', () => {
    const a1: LayoutHAlign = 'start';
    const a2: LayoutHAlign = 'center';
    const a3: LayoutHAlign = 'end';
    const a4: LayoutHAlign = 'stretch';
    expect(a1).toBe('start');
    expect(a2).toBe('center');
    expect(a3).toBe('end');
    expect(a4).toBe('stretch');
  });

  it('LayoutVAlign accepts valid values', () => {
    const a1: LayoutVAlign = 'start';
    const a2: LayoutVAlign = 'center';
    const a3: LayoutVAlign = 'end';
    const a4: LayoutVAlign = 'stretch';
    expect(a1).toBe('start');
    expect(a2).toBe('center');
    expect(a3).toBe('end');
    expect(a4).toBe('stretch');
  });

  it('LayoutOptions has correct defaults structure', () => {
    const opts: LayoutOptions = {};
    expect(opts.direction).toBeUndefined();
    expect(opts.hSpacing).toBeUndefined();
    expect(opts.vSpacing).toBeUndefined();
  });

  it('LayoutOptions accepts full config', () => {
    const opts: LayoutOptions = {
      direction: 'TB',
      hSpacing: 100,
      vSpacing: 80,
      hAlign: 'center',
      vAlign: 'start',
      extra: { rankSep: 50 },
    };
    expect(opts.direction).toBe('TB');
    expect(opts.hSpacing).toBe(100);
  });

  it('LayoutNode has required fields', () => {
    const node: LayoutNode = {
      id: 'n1',
      width: 100,
      height: 60,
    };
    expect(node.id).toBe('n1');
    expect(node.width).toBe(100);
    expect(node.height).toBe(60);
  });

  it('LayoutNode supports optional metadata', () => {
    const node: LayoutNode = {
      id: 'n1',
      width: 100,
      height: 60,
      metadata: { rank: 0, type: 'decision' },
    };
    expect(node.metadata).toEqual({ rank: 0, type: 'decision' });
  });

  it('LayoutEdge has required fields', () => {
    const edge: LayoutEdge = {
      source: 'n1',
      target: 'n2',
    };
    expect(edge.source).toBe('n1');
    expect(edge.target).toBe('n2');
  });

  it('LayoutEdge supports optional connectorId and metadata', () => {
    const edge: LayoutEdge = {
      source: 'n1',
      target: 'n2',
      connectorId: 'c1',
      metadata: { weight: 2 },
    };
    expect(edge.connectorId).toBe('c1');
    expect(edge.metadata).toEqual({ weight: 2 });
  });

  it('LayoutNodeResult has required fields', () => {
    const r: LayoutNodeResult = { id: 'n1', x: 100, y: 200 };
    expect(r.id).toBe('n1');
    expect(r.x).toBe(100);
    expect(r.y).toBe(200);
  });

  it('LayoutEdgeResult has required fields', () => {
    const r: LayoutEdgeResult = {
      source: 'n1',
      target: 'n2',
      points: [{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 100, y: 0 }],
    };
    expect(r.points).toHaveLength(3);
    expect(r.source).toBe('n1');
    expect(r.target).toBe('n2');
  });

  it('LayoutResult has all fields', () => {
    const result: LayoutResult = {
      nodes: [{ id: 'n1', x: 0, y: 0 }],
      edges: [],
      totalBBox: { x: 0, y: 0, width: 100, height: 60 },
    };
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
    expect(result.totalBBox.width).toBe(100);
  });

  it('LayoutEngine interface shape is correct', () => {
    const engine: LayoutEngine = {
      name: 'test-engine',
      layout: () => ({
        nodes: [],
        edges: [],
        totalBBox: { x: 0, y: 0, width: 0, height: 0 },
      }),
    };
    expect(engine.name).toBe('test-engine');
    const result = engine.layout([], []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});

// ─── extractLayoutNodes ────────────────────────────────────────────────────

describe('extractLayoutNodes', () => {
  it('extracts nodes for specified element ids', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 200, 0, 120, 80),
      makeShape('c', 400, 0, 80, 40),
    ];
    const nodes = extractLayoutNodes(elements, new Set(['a', 'c']));
    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.id)).toEqual(['a', 'c']);
  });

  it('returns empty array when no ids match', () => {
    const elements = [makeShape('a', 0, 0, 100, 60)];
    const nodes = extractLayoutNodes(elements, new Set(['x', 'y']));
    expect(nodes).toHaveLength(0);
  });

  it('returns empty array for empty element list', () => {
    const nodes = extractLayoutNodes([], new Set(['a']));
    expect(nodes).toHaveLength(0);
  });

  it('extracts width and height from transform', () => {
    const elements = [makeShape('a', 10, 20, 150, 75)];
    const nodes = extractLayoutNodes(elements, new Set(['a']));
    expect(nodes[0].width).toBe(150);
    expect(nodes[0].height).toBe(75);
  });

  it('carries metadata when present', () => {
    const el = {
      ...makeShape('a', 0, 0, 100, 60),
      metadata: { rank: 1 },
    };
    const nodes = extractLayoutNodes([el], new Set(['a']));
    expect(nodes[0].metadata).toEqual({ rank: 1 });
  });

  it('handles empty elementId set gracefully', () => {
    const elements = [makeShape('a', 0, 0, 100, 60)];
    const nodes = extractLayoutNodes(elements, new Set());
    expect(nodes).toHaveLength(0);
  });
});

// ─── extractLayoutEdges ────────────────────────────────────────────────────

describe('extractLayoutEdges', () => {
  it('extracts connector edges between nodes in the id set', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 200, 0, 100, 60),
      makeConnector('c1', 'a', 'b'),
    ];
    const edges = extractLayoutEdges(elements, new Set(['a', 'b']));
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('a');
    expect(edges[0].target).toBe('b');
    expect(edges[0].connectorId).toBe('c1');
  });

  it('excludes connectors whose source is not in the id set', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 200, 0, 100, 60),
      makeConnector('c1', 'x', 'b'),
    ];
    const edges = extractLayoutEdges(elements, new Set(['a', 'b']));
    expect(edges).toHaveLength(0);
  });

  it('excludes connectors whose target is not in the id set', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 200, 0, 100, 60),
      makeConnector('c1', 'a', 'x'),
    ];
    const edges = extractLayoutEdges(elements, new Set(['a', 'b']));
    expect(edges).toHaveLength(0);
  });

  it('excludes non-connector elements', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 200, 0, 100, 60),
    ];
    const edges = extractLayoutEdges(elements, new Set(['a', 'b']));
    expect(edges).toHaveLength(0);
  });

  it('returns empty array for no connectors', () => {
    const edges = extractLayoutEdges([], new Set(['a']));
    expect(edges).toHaveLength(0);
  });

  it('handles connector with null elementId gracefully', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 200, 0, 100, 60),
      {
        ...makeConnector('c1', 'a', 'b'),
        source: { x: 10, y: 10 },
        target: { elementId: 'b', anchorId: 'left', x: 0, y: 0 },
      } as ConnectorElement,
    ];
    const edges = extractLayoutEdges(elements, new Set(['a', 'b']));
    expect(edges).toHaveLength(0);
  });
});

// ─── applyLayoutToScene ────────────────────────────────────────────────────

describe('applyLayoutToScene', () => {
  it('updates node positions from layout result', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 0, 0, 120, 80),
    ];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [
        { id: 'a', x: 50, y: 30 },
        { id: 'b', x: 200, y: 30 },
      ],
      edges: [],
      totalBBox: { x: 50, y: 30, width: 270, height: 80 },
    };

    const updated = applyLayoutToScene(scene, result);
    const elA = updated.elements.find((e) => e.id === 'a')!;
    const elB = updated.elements.find((e) => e.id === 'b')!;
    expect(elA.transform.x).toBe(50);
    expect(elA.transform.y).toBe(30);
    expect(elB.transform.x).toBe(200);
    expect(elB.transform.y).toBe(30);
  });

  it('preserves original transform properties besides x and y', () => {
    const elements = [
      { ...makeShape('a', 0, 0, 100, 60), transform: { x: 0, y: 0, width: 100, height: 60, rotation: 45, scaleX: 1.5, scaleY: 1 } },
    ];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [{ id: 'a', x: 300, y: 400 }],
      edges: [],
      totalBBox: { x: 300, y: 400, width: 100, height: 60 },
    };

    const updated = applyLayoutToScene(scene, result);
    const el = updated.elements[0];
    expect(el.transform.x).toBe(300);
    expect(el.transform.y).toBe(400);
    expect(el.transform.width).toBe(100);
    expect(el.transform.height).toBe(60);
    expect(el.transform.rotation).toBe(45);
    expect(el.transform.scaleX).toBe(1.5);
  });

  it('does not mutate elements not in the layout result', () => {
    const elements = [
      makeShape('a', 50, 50, 100, 60),
      makeShape('b', 200, 200, 100, 60),
    ];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [{ id: 'a', x: 100, y: 100 }],
      edges: [],
      totalBBox: { x: 100, y: 100, width: 100, height: 60 },
    };

    const updated = applyLayoutToScene(scene, result);
    const elB = updated.elements.find((e) => e.id === 'b')!;
    expect(elB.transform.x).toBe(200);
    expect(elB.transform.y).toBe(200);
  });

  it('updates connector route points from edge results', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 0, 0, 100, 60),
      makeConnector('c1', 'a', 'b'),
    ];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [],
      edges: [
        {
          source: 'a',
          target: 'b',
          connectorId: 'c1',
          points: [{ x: 100, y: 30 }, { x: 150, y: 30 }, { x: 200, y: 30 }],
        },
      ],
      totalBBox: { x: 0, y: 0, width: 200, height: 60 },
    };

    const updated = applyLayoutToScene(scene, result);
    const conn = updated.elements.find((e) => e.type === 'connector')! as ConnectorElement;
    expect(conn.route.points).toEqual([
      { x: 100, y: 30 },
      { x: 150, y: 30 },
      { x: 200, y: 30 },
    ]);
    expect(conn.source.x).toBe(100);
    expect(conn.source.y).toBe(30);
    expect(conn.target.x).toBe(200);
    expect(conn.target.y).toBe(30);
  });

  it('does not mutate connector when edge result has no points', () => {
    const elements = [
      makeShape('a', 0, 0, 100, 60),
      makeShape('b', 0, 0, 100, 60),
      makeConnector('c1', 'a', 'b'),
    ];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [],
      edges: [
        { source: 'a', target: 'b', connectorId: 'c1', points: [] },
      ],
      totalBBox: { x: 0, y: 0, width: 0, height: 0 },
    };

    const updated = applyLayoutToScene(scene, result);
    const conn = updated.elements.find((e) => e.type === 'connector')! as ConnectorElement;
    expect(conn.route.points).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
  });

  it('does not mutate original scene (immutable)', () => {
    const elements = [makeShape('a', 10, 10, 100, 60)];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [{ id: 'a', x: 500, y: 500 }],
      edges: [],
      totalBBox: { x: 500, y: 500, width: 100, height: 60 },
    };

    applyLayoutToScene(scene, result);
    expect(scene.elements[0].transform.x).toBe(10);
    expect(scene.elements[0].transform.y).toBe(10);
  });

  it('preserves non-layout-fields of scene', () => {
    const elements = [makeShape('a', 0, 0, 100, 60)];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [],
      edges: [],
      totalBBox: { x: 0, y: 0, width: 0, height: 0 },
    };

    const updated = applyLayoutToScene(scene, result);
    expect(updated.schemaVersion).toBe('1.0.0');
    expect(updated.project.name).toBe('test');
    expect(updated.layers).toHaveLength(1);
    expect(updated.groups).toEqual([]);
    expect(updated.dataSources).toEqual([]);
  });

  it('handles empty layout result', () => {
    const elements = [makeShape('a', 10, 20, 100, 60)];
    const scene = makeScene(elements);
    const result: LayoutResult = {
      nodes: [],
      edges: [],
      totalBBox: { x: 0, y: 0, width: 0, height: 0 },
    };

    const updated = applyLayoutToScene(scene, result);
    expect(updated.elements[0].transform.x).toBe(10);
    expect(updated.elements[0].transform.y).toBe(20);
  });
});

// ─── LayoutEngine implementation example ───────────────────────────────────

describe('LayoutEngine conformance', () => {
  it('a minimal LayoutEngine returns LayoutResult', () => {
    const engine: LayoutEngine = {
      name: 'mock',
      layout(nodes, _unusedEdges, _unusedOptions) {
        return {
          nodes: nodes.map((n, i) => ({ id: n.id, x: i * 100, y: 0 })),
          edges: [],
          totalBBox: {
            x: 0,
            y: 0,
            width: nodes.length * 100,
            height: Math.max(...nodes.map((n) => n.height)),
          },
        };
      },
    };

    const nodes: LayoutNode[] = [
      { id: 'a', width: 80, height: 40 },
      { id: 'b', width: 80, height: 40 },
    ];
    const result = engine.layout(nodes, []);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].x).toBe(0);
    expect(result.nodes[1].x).toBe(100);
    expect(result.totalBBox.width).toBe(200);
  });

  it('LayoutEngine receives options', () => {
    const engine: LayoutEngine = {
      name: 'directional',
      layout(nodes, _edges, options) {
        const hSpacing = options?.hSpacing ?? 80;
        return {
          nodes: nodes.map((n, i) => ({ id: n.id, x: i * (n.width + hSpacing), y: 0 })),
          edges: [],
          totalBBox: { x: 0, y: 0, width: nodes.length * 100, height: 50 },
        };
      },
    };

    const nodes: LayoutNode[] = [
      { id: 'a', width: 50, height: 30 },
      { id: 'b', width: 50, height: 30 },
    ];
    const result = engine.layout(nodes, [], { hSpacing: 200 });
    expect(result.nodes[1].x).toBe(250);
  });
});
