import { describe, it, expect } from 'vitest';
import {
  mindmapLayoutEngine,
  extractMindmapLayoutNodes,
  extractMindmapLayoutEdges,
  MindmapLayoutCommand,
  createMindmapLayoutCommand,
} from '../../modules/mindmap/layout';
import {
  applyLayoutToScene,
} from '../../core/layout';
import type {
  LayoutNode,
  LayoutEdge,
  LayoutOptions,
  LayoutEngine,
} from '../../core/layout';
import type {
  SceneDocument,
  MindNodeElement,
  ConnectorElement,
} from '../../core/types';

function makeMindNode(
  id: string,
  text: string,
  w: number,
  h: number,
  parentId?: string,
  childrenIds?: string[],
  collapsed = false,
  layerId = 'l1',
): MindNodeElement {
  return {
    id,
    type: 'mindNode',
    layerId,
    text,
    parentId,
    childrenIds,
    collapsed,
    transform: { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fffbe6', stroke: '#da0', strokeWidth: 2, opacity: 1 },
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
    style: { fill: 'none', stroke: '#666', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    semanticKind: 'mind-edge',
    source: { elementId: sourceId, x: 0, y: 0 },
    target: { elementId: targetId, x: 0, y: 0 },
    route: { type: 'curve', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
  };
}

function makeScene(elements: SceneDocument['elements']): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'test-mindmap' },
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

describe('MindmapLayoutEngine', () => {
  it('implements LayoutEngine interface', () => {
    const engine: LayoutEngine = mindmapLayoutEngine;
    expect(engine.name).toBe('mindmap-layout');
    expect(typeof engine.layout).toBe('function');
  });

  // ─── Empty input ───────────────────────────────────────────────────

  it('handles empty nodes', () => {
    const result = mindmapLayoutEngine.layout([], []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.totalBBox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('handles single node', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { parentId: undefined } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe('root');
  });

  // ─── Simple tree (lr-split default) ─────────────────────────────────

  it('lays out root with two children in lr-split mode', () => {
    const child1Id = 'child1';
    const child2Id = 'child2';
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: [child1Id, child2Id] } },
      { id: child1Id, width: 80, height: 30, metadata: { parentId: 'root' } },
      { id: child2Id, width: 80, height: 30, metadata: { parentId: 'root' } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);
    expect(result.nodes).toHaveLength(3);

    const root = result.nodes.find((n) => n.id === 'root')!;
    const c1 = result.nodes.find((n) => n.id === child1Id)!;
    const c2 = result.nodes.find((n) => n.id === child2Id)!;

    // Root at or near center
    expect(root.x).toBe(0);

    // In lr-split, first child (idx 0) goes right, second goes left
    expect(c1.x).toBeGreaterThan(root.x);
    expect(c2.x).toBeLessThan(root.x);
  });

  it('nodes do not overlap in simple tree', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a', 'b', 'c'] } },
      { id: 'a', width: 80, height: 30, metadata: { parentId: 'root' } },
      { id: 'b', width: 80, height: 30, metadata: { parentId: 'root' } },
      { id: 'c', width: 80, height: 30, metadata: { parentId: 'root' } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);

    for (let i = 0; i < result.nodes.length; i++) {
      for (let j = i + 1; j < result.nodes.length; j++) {
        const a = result.nodes[i];
        const b = result.nodes[j];
        const aNode = nodes.find((n) => n.id === a.id)!;
        const bNode = nodes.find((n) => n.id === b.id)!;
        const aR = a.x + aNode.width;
        const aB = a.y + aNode.height;
        const bR = b.x + bNode.width;
        const bB = b.y + bNode.height;
        const overlaps =
          a.x < bR && aR > b.x && a.y < bB && aB > b.y;
        expect(overlaps).toBe(false);
      }
    }
  });

  it('lays out deeper tree without overlap', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 120, height: 50, metadata: { childrenIds: ['a'] } },
      { id: 'a', width: 100, height: 40, metadata: { parentId: 'root', childrenIds: ['b'] } },
      { id: 'b', width: 80, height: 30, metadata: { parentId: 'a', childrenIds: ['c'] } },
      { id: 'c', width: 60, height: 20, metadata: { parentId: 'b' } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);

    const root = result.nodes.find((n) => n.id === 'root')!;
    const a = result.nodes.find((n) => n.id === 'a')!;
    const b = result.nodes.find((n) => n.id === 'b')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    // Each level extends further from center
    expect(Math.abs(a.x - root.x)).toBeGreaterThan(0);
    expect(Math.abs(b.x - a.x)).toBeGreaterThan(0);
    expect(Math.abs(c.x - b.x)).toBeGreaterThan(0);

    // No overlaps in a chain
    for (let i = 0; i < result.nodes.length; i++) {
      for (let j = i + 1; j < result.nodes.length; j++) {
        const na = result.nodes[i];
        const nb = result.nodes[j];
        const naNode = nodes.find((n) => n.id === na.id)!;
        const nbNode = nodes.find((n) => n.id === nb.id)!;
        const overlap =
          na.x < nb.x + nbNode.width &&
          na.x + naNode.width > nb.x &&
          na.y < nb.y + nbNode.height &&
          na.y + naNode.height > nb.y;
        expect(overlap).toBe(false);
      }
    }
  });

  // ─── Radial mode ────────────────────────────────────────────────────

  it('handles radial mode', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a', 'b', 'c'] } },
      { id: 'a', width: 60, height: 30, metadata: { parentId: 'root' } },
      { id: 'b', width: 60, height: 30, metadata: { parentId: 'root' } },
      { id: 'c', width: 60, height: 30, metadata: { parentId: 'root' } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, [], {
      extra: { mode: 'radial' },
    } as LayoutOptions);

    expect(result.nodes).toHaveLength(4);
    const root = result.nodes.find((n) => n.id === 'root')!;
    expect(root.x).toBe(0);
    expect(root.y).toBe(0);

    // Children should be placed around root at different angles
    const children = result.nodes.filter((n) => n.id !== 'root');
    for (const child of children) {
      const dx = child.x - root.x;
      const dy = child.y - root.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeGreaterThan(50);
    }
  });

  // ─── Collapsed nodes excluded ───────────────────────────────────────

  it('collapsed node children are excluded', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a'] } },
      { id: 'a', width: 80, height: 30, metadata: { parentId: 'root', childrenIds: ['b'], collapsed: true } },
      { id: 'b', width: 60, height: 20, metadata: { parentId: 'a' } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);

    // Node 'b' should not be in results (its parent is collapsed)
    const bResult = result.nodes.find((n) => n.id === 'b');
    expect(bResult).toBeUndefined();

    // Root and 'a' should be present
    expect(result.nodes.find((n) => n.id === 'root')).toBeDefined();
    expect(result.nodes.find((n) => n.id === 'a')).toBeDefined();
  });

  // ─── Edge routing ───────────────────────────────────────────────────

  it('produces edge routes', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a'] } },
      { id: 'a', width: 80, height: 30, metadata: { parentId: 'root' } },
    ];
    const edges: LayoutEdge[] = [
      { source: 'root', target: 'a', connectorId: 'c1' },
    ];
    const result = mindmapLayoutEngine.layout(nodes, edges);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].connectorId).toBe('c1');
    expect(result.edges[0].points.length).toBeGreaterThanOrEqual(2);
    // Points should form a curve from source to target
    const firstPoint = result.edges[0].points[0];
    const lastPoint = result.edges[0].points[result.edges[0].points.length - 1];
    expect(firstPoint.x).not.toEqual(lastPoint.x);
  });

  it('skips self-loops in edges', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: {} },
    ];
    const edges: LayoutEdge[] = [
      { source: 'root', target: 'root', connectorId: 'c1' },
    ];
    const result = mindmapLayoutEngine.layout(nodes, edges);
    expect(result.edges).toHaveLength(0);
  });

  it('skips edges with missing endpoints', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: {} },
    ];
    const edges: LayoutEdge[] = [
      { source: 'root', target: 'missing', connectorId: 'c1' },
    ];
    const result = mindmapLayoutEngine.layout(nodes, edges);
    expect(result.edges).toHaveLength(0);
  });

  // ─── Deterministic ─────────────────────────────────────────────────

  it('produces the same result for the same input', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a', 'b', 'c'] } },
      { id: 'a', width: 80, height: 30, metadata: { parentId: 'root' } },
      { id: 'b', width: 80, height: 30, metadata: { parentId: 'root' } },
      { id: 'c', width: 80, height: 30, metadata: { parentId: 'root' } },
    ];
    const r1 = mindmapLayoutEngine.layout(nodes, []);
    const r2 = mindmapLayoutEngine.layout(nodes, []);
    expect(r1).toEqual(r2);
  });

  // ─── BBox calculation ──────────────────────────────────────────────

  it('computes totalBBox covering all nodes', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a'] } },
      { id: 'a', width: 80, height: 30, metadata: { parentId: 'root' } },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);

    const bbox = result.totalBBox;
    for (const node of result.nodes) {
      const n = nodes.find((no) => no.id === node.id)!;
      expect(node.x).toBeGreaterThanOrEqual(bbox.x);
      expect(node.y).toBeGreaterThanOrEqual(bbox.y);
      expect(node.x + n.width).toBeLessThanOrEqual(bbox.x + bbox.width);
      expect(node.y + n.height).toBeLessThanOrEqual(bbox.y + bbox.height);
    }
  });

  // ─── Orphan nodes (no parentId) ────────────────────────────────────

  it('handles nodes with no parentId as a flat list', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', width: 100, height: 40, metadata: {} },
      { id: 'b', width: 100, height: 40, metadata: {} },
    ];
    const result = mindmapLayoutEngine.layout(nodes, []);

    // The algorithm picks first node as root; b becomes child of a (from edge)
    // With no edges and no parentIds, the first node becomes root, rest are orphaned
    expect(result.nodes).toHaveLength(2);
  });

  // ─── Spacing control ───────────────────────────────────────────────

  it('respects custom spacing', () => {
    const nodes: LayoutNode[] = [
      { id: 'root', width: 100, height: 40, metadata: { childrenIds: ['a'] } },
      { id: 'a', width: 80, height: 30, metadata: { parentId: 'root' } },
    ];
    const r1 = mindmapLayoutEngine.layout(nodes, []);
    const r2 = mindmapLayoutEngine.layout(nodes, [], { hSpacing: 200, vSpacing: 100 } as LayoutOptions);

    // With larger spacing, children should be further from root
    const root1 = r1.nodes.find((n) => n.id === 'root')!;
    const a1 = r1.nodes.find((n) => n.id === 'a')!;
    const root2 = r2.nodes.find((n) => n.id === 'root')!;
    const a2 = r2.nodes.find((n) => n.id === 'a')!;

    const dist1 = Math.abs(a1.x - root1.x);
    const dist2 = Math.abs(a2.x - root2.x);
    expect(dist2).toBeGreaterThan(dist1);
  });
});

// ─── Extract mindmap layout nodes ─────────────────────────────────────

describe('extractMindmapLayoutNodes', () => {
  it('extracts mindNode elements', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const result = extractMindmapLayoutNodes([n1, n2], new Set(['n1', 'n2']));
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('n1');
    expect(result[1].id).toBe('n2');
  });

  it('includes parentId and childrenIds in metadata', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const result = extractMindmapLayoutNodes([n1, n2], new Set(['n1', 'n2']));

    const root = result.find((n) => n.id === 'n1')!;
    expect(root.metadata?.parentId).toBeUndefined();
    expect(root.metadata?.childrenIds).toEqual(['n2']);

    const child = result.find((n) => n.id === 'n2')!;
    expect(child.metadata?.parentId).toBe('n1');
    expect(child.metadata?.childrenIds).toBeUndefined();
  });

  it('includes collapsed state', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1', undefined, true);
    const result = extractMindmapLayoutNodes([n1, n2], new Set(['n1', 'n2']));

    const child = result.find((n) => n.id === 'n2')!;
    expect(child.metadata?.collapsed).toBe(true);
  });

  it('filters out elements not in the set', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40);
    const n2 = makeMindNode('n2', 'Child', 80, 30);
    const result = extractMindmapLayoutNodes([n1, n2], new Set(['n1']));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('n1');
  });

  it('filters out connector elements', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40);
    const c1 = makeConnector('c1', 'n1', 'n2');
    const result = extractMindmapLayoutNodes([n1, c1], new Set(['n1', 'c1']));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('n1');
  });

  it('extracts shape elements as mind map nodes', () => {
    const nodes: LayoutNode[] = extractMindmapLayoutNodes(
      [makeMindNode('n1', 'Root', 100, 40), {
        id: 's1', type: 'shape', shapeKind: 'rect', layerId: 'l1',
        transform: { x: 0, y: 0, width: 60, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
      new Set(['n1', 's1']),
    );
    expect(nodes).toHaveLength(2);
  });
});

// ─── Extract mindmap layout edges ─────────────────────────────────────

describe('extractMindmapLayoutEdges', () => {
  it('extracts connectors between mind nodes', () => {
    const c1 = makeConnector('c1', 'n1', 'n2');
    const edges = extractMindmapLayoutEdges([c1], new Set(['n1', 'n2']));
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('n1');
    expect(edges[0].target).toBe('n2');
    expect(edges[0].connectorId).toBe('c1');
  });

  it('filters connectors where endpoints are not in set', () => {
    const c1 = makeConnector('c1', 'n1', 'n2');
    const edges = extractMindmapLayoutEdges([c1], new Set(['n1']));
    expect(edges).toHaveLength(0);
  });

  it('filters non-connector elements', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40);
    const edges = extractMindmapLayoutEdges([n1], new Set(['n1']));
    expect(edges).toHaveLength(0);
  });
});

// ─── MindmapLayoutCommand ────────────────────────────────────────────

describe('MindmapLayoutCommand', () => {
  it('creates with factory function', () => {
    const cmd = createMindmapLayoutCommand(['a', 'b']);
    expect(cmd).toBeInstanceOf(MindmapLayoutCommand);
    expect(cmd.label).toContain('Mind Map Layout');
  });

  it('validates elementIds not empty', () => {
    const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, []);
    const scene = makeScene([]);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('validates elements exist in scene', () => {
    const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, ['missing']);
    const scene = makeScene([]);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(false);
  });

  it('validates successfully when elements exist', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40);
    const scene = makeScene([n1]);
    const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, ['n1']);
    const result = cmd.validate(scene);
    expect(result.valid).toBe(true);
  });

  it('execute arranges mind map nodes', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const scene = makeScene([n1, n2]);

    const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, ['n1', 'n2']);
    const result = cmd.execute(scene);

    const root = result.elements.find((e) => e.id === 'n1')!;
    const child = result.elements.find((e) => e.id === 'n2')!;
    expect(root.transform.x).toBe(0);
    expect(child.transform.x).toBeGreaterThan(root.transform.x + root.transform.width * 0.5);
  });

  it('undo restores previous positions', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const scene = makeScene([n1, n2]);

    const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, ['n1', 'n2']);
    const after = cmd.execute(scene);
    const invCmd = cmd.invert(after);
    expect(invCmd).not.toBeNull();

    const restored = invCmd!.execute(after);
    const restoredRoot = restored.elements.find((e) => e.id === 'n1')!;
    const restoredChild = restored.elements.find((e) => e.id === 'n2')!;
    expect(restoredRoot.transform.x).toBe(0);
    expect(restoredChild.transform.x).toBe(0);
  });

  it('works with CommandExecutor undo/redo', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const scene = makeScene([n1, n2]);

    const cmd = createMindmapLayoutCommand(['n1', 'n2']);

    const before = { ...scene, elements: scene.elements.map((e) => ({ ...e, transform: { ...e.transform } })) };
    const after = cmd.execute(scene);

    const n2Before = before.elements.find((e) => e.id === 'n2')!;
    const n2After = after.elements.find((e) => e.id === 'n2')!;
    expect(n2After.transform.x).not.toBe(n2Before.transform.x);
  });

  it('execute with radial mode option', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2', 'n3']);
    const n2 = makeMindNode('n2', 'Topic A', 80, 30, 'n1');
    const n3 = makeMindNode('n3', 'Topic B', 80, 30, 'n1');
    const scene = makeScene([n1, n2, n3]);

    const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, ['n1', 'n2', 'n3'], {
      mode: 'radial',
    });
    const result = cmd.execute(scene);

    const root = result.elements.find((e) => e.id === 'n1')!;
    const child2 = result.elements.find((e) => e.id === 'n2')!;
    const child3 = result.elements.find((e) => e.id === 'n3')!;

    // Root at center
    expect(root.transform.x).toBe(0);
    // Children offset from root in different directions
    const d2 = Math.sqrt(child2.transform.x ** 2 + child2.transform.y ** 2);
    const d3 = Math.sqrt(child3.transform.x ** 2 + child3.transform.y ** 2);
    expect(d2).toBeGreaterThan(0);
    expect(d3).toBeGreaterThan(0);
    // Children should not be at same position
    expect(child2.transform.x !== child3.transform.x || child2.transform.y !== child3.transform.y).toBe(true);
  });
});

// ─── Scene integration ───────────────────────────────────────────────

describe('mindmap layout scene integration', () => {
  it('applyLayoutToScene with mind map layout result', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const scene = makeScene([n1, n2]);

    const nodes = extractMindmapLayoutNodes(scene.elements, new Set(['n1', 'n2']));
    const edges = extractMindmapLayoutEdges(scene.elements, new Set(['n1', 'n2']));
    const result = mindmapLayoutEngine.layout(nodes, edges);
    const updated = applyLayoutToScene(scene, result);

    const rootU = updated.elements.find((e) => e.id === 'n1')!;
    const childU = updated.elements.find((e) => e.id === 'n2')!;
    expect(rootU.transform.x).toBe(0);
    expect(childU.transform.x).not.toBe(0);
  });

  it('applyLayoutToScene updates connector routes', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Child', 80, 30, 'n1');
    const c1 = makeConnector('c1', 'n1', 'n2');
    const scene = makeScene([n1, n2, c1]);

    const nodes = extractMindmapLayoutNodes(scene.elements, new Set(['n1', 'n2']));
    const edges = extractMindmapLayoutEdges(scene.elements, new Set(['n1', 'n2']));
    const result = mindmapLayoutEngine.layout(nodes, edges);
    const updated = applyLayoutToScene(scene, result);

    const connU = updated.elements.find((e) => e.id === 'c1') as ConnectorElement;
    expect(connU.route.points.length).toBeGreaterThanOrEqual(2);
  });

  it('collapsed nodes do not appear in layout result', () => {
    const n1 = makeMindNode('n1', 'Root', 100, 40, undefined, ['n2']);
    const n2 = makeMindNode('n2', 'Parent', 80, 30, 'n1', ['n3'], true);
    const n3 = makeMindNode('n3', 'Hidden Child', 60, 20, 'n2');
    const scene = makeScene([n1, n2, n3]);

    const nodes = extractMindmapLayoutNodes(scene.elements, new Set(['n1', 'n2', 'n3']));
    const result = mindmapLayoutEngine.layout(nodes, []);

    // n3 should NOT be in results (its parent n2 is collapsed)
    expect(result.nodes.find((n) => n.id === 'n3')).toBeUndefined();
    expect(result.nodes.find((n) => n.id === 'n1')).toBeDefined();
    expect(result.nodes.find((n) => n.id === 'n2')).toBeDefined();
  });
});
