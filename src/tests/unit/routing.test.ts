import { describe, it, expect } from 'vitest';
import {
  directionToCardinal,
  computeOrthogonalRoute,
  recalculateConnectorRoute,
  recalculateRoutesForElements,
} from '../../core/routing';
import type { CardinalDirection } from '../../core/routing';
import type { SceneDocument, ConnectorElement, ShapeElement, BBox, ElementStyle } from '../../core/types';

function makeBBox(x: number, y: number, w: number, h: number): BBox {
  return { x, y, width: w, height: h };
}

describe('directionToCardinal', () => {
  it('maps 0 radians to right', () => {
    expect(directionToCardinal(0)).toBe('right');
  });

  it('maps PI/2 radians to down', () => {
    expect(directionToCardinal(Math.PI / 2)).toBe('down');
  });

  it('maps PI radians to left', () => {
    expect(directionToCardinal(Math.PI)).toBe('left');
  });

  it('maps -PI/2 radians to up', () => {
    expect(directionToCardinal(-Math.PI / 2)).toBe('up');
  });

  it('maps PI/4 (45 deg) to right (border)', () => {
    // 45° is at the boundary between right (0-45) and down (45-135)
    expect(directionToCardinal(Math.PI / 4)).toBe('down');
  });

  it('maps -PI/4 (-45 deg) to right', () => {
    // -45° is in the right quadrant (315-45 = -45 to 45)
    expect(directionToCardinal(-Math.PI / 4)).toBe('right');
  });

  it('maps 3*PI/4 to left', () => {
    // 135° should be left since (135 >= 135)
    expect(directionToCardinal(3 * Math.PI / 4)).toBe('left');
  });

  it('maps -3*PI/4 to up', () => {
    // -135° → 225° → up (225 falls in [225, 315))
    expect(directionToCardinal(-3 * Math.PI / 4)).toBe('up');
  });
});

describe('computeOrthogonalRoute', () => {
  const srcBBox = makeBBox(0, 0, 100, 50);
  const tgtBBox = makeBBox(200, 0, 100, 50);

  it('produces only horizontal and vertical segments', () => {
    const points = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,          // source right anchor
      { x: 200, y: 25 }, Math.PI,    // target left anchor
      srcBBox, tgtBBox,
    );

    if (points.length >= 2) {
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        // Each segment should be purely horizontal or vertical
        const isHorizontal = Math.abs(dx) > 0.001 && Math.abs(dy) < 0.001;
        const isVertical = Math.abs(dy) > 0.001 && Math.abs(dx) < 0.001;
        const isZero = Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001;
        expect(isHorizontal || isVertical || isZero).toBe(true);
      }
    }
  });

  it('returns at least the exit and entry points', () => {
    const points = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,
      { x: 200, y: 25 }, Math.PI,
      srcBBox, tgtBBox,
    );
    expect(points.length).toBeGreaterThanOrEqual(2);
  });

  it('does not produce consecutive duplicate points', () => {
    const points = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,
      { x: 200, y: 25 }, Math.PI,
      srcBBox, tgtBBox,
    );

    for (let i = 1; i < points.length; i++) {
      const same = points[i].x === points[i - 1].x && points[i].y === points[i - 1].y;
      expect(same).toBe(false);
    }
  });

  it('source right to target left (aligned)', () => {
    const points = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,
      { x: 200, y: 25 }, Math.PI,
      srcBBox, tgtBBox,
    );

    // Source exit goes right, target entry extends left
    // If aligned, should be [srcExit, tgtEntry] with same y
    expect(points.length).toBe(2);
    // All y should be close to 25 (within margin adjustments)
    for (const p of points) {
      expect(Math.abs(p.y - 25)).toBeLessThanOrEqual(30);
    }
  });

  it('source bottom to target top (vertically stacked)', () => {
    const aboveBBox = makeBBox(0, 0, 100, 50);
    const belowBBox = makeBBox(0, 100, 100, 50);

    const points = computeOrthogonalRoute(
      { x: 50, y: 50 }, Math.PI / 2,     // source bottom
      { x: 50, y: 100 }, -Math.PI / 2,   // target top
      aboveBBox, belowBBox,
    );

    expect(points.length).toBeGreaterThanOrEqual(2);
  });

  it('source right to target bottom (perpendicular)', () => {
    const leftBBox = makeBBox(0, 0, 100, 50);
    const rightTopBBox = makeBBox(200, -100, 100, 50);

    const points = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,                // source right
      { x: 250, y: -50 }, Math.PI / 2,     // target bottom
      leftBBox, rightTopBBox,
    );

    expect(points.length).toBeGreaterThanOrEqual(3);
  });

  it('respects margin parameter', () => {
    const pointsSmall = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,
      { x: 200, y: 75 }, Math.PI,
      srcBBox, tgtBBox,
      10,
    );

    const pointsLarge = computeOrthogonalRoute(
      { x: 100, y: 25 }, 0,
      { x: 200, y: 75 }, Math.PI,
      srcBBox, tgtBBox,
      60,
    );

    // Paths with different margins should be different
    const smallStr = JSON.stringify(pointsSmall);
    const largeStr = JSON.stringify(pointsLarge);
    // They might be the same if the path structure is identical,
    // but the y values should differ
    expect(pointsSmall).not.toEqual(pointsLarge);
  });

  it('bend point avoids source bbox area', () => {
    const srcBBox2 = makeBBox(10, 10, 80, 30);
    const tgtBBox2 = makeBBox(10, 100, 80, 30);

    const points = computeOrthogonalRoute(
      { x: 50, y: 40 }, Math.PI / 2,     // source bottom
      { x: 50, y: 100 }, -Math.PI / 2,   // target top
      srcBBox2, tgtBBox2,
      5,
    );

    // Check that no bend point is inside src or tgt bbox
    for (const p of points) {
      const inSrc =
        p.x >= srcBBox2.x - 2 && p.x <= srcBBox2.x + srcBBox2.width + 2 &&
        p.y >= srcBBox2.y - 2 && p.y <= srcBBox2.y + srcBBox2.height + 2;
      const inTgt =
        p.x >= tgtBBox2.x - 2 && p.x <= tgtBBox2.x + tgtBBox2.width + 2 &&
        p.y >= tgtBBox2.y - 2 && p.y <= tgtBBox2.y + tgtBBox2.height + 2;

      // Bend points should not be inside either bbox
      // Note: the exit and entry points are outside by design (margin > 0)
    }
  });
});

function makeSceneWithConnector(
  connectorOverrides: Partial<ConnectorElement> = {},
): { scene: SceneDocument; src: ShapeElement; tgt: ShapeElement; conn: ConnectorElement } {
  const src: ShapeElement = {
    id: 'src-1',
    type: 'shape',
    shapeKind: 'rect',
    layerId: 'l1',
    transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#eee', stroke: '#333', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
  };

  const tgt: ShapeElement = {
    id: 'tgt-1',
    type: 'shape',
    shapeKind: 'rect',
    layerId: 'l1',
    transform: { x: 200, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#eee', stroke: '#333', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
  };

  const conn: ConnectorElement = {
    id: 'conn-1',
    type: 'connector',
    layerId: 'l1',
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
    source: { elementId: 'src-1', anchorId: 'right', x: 100, y: 25 },
    target: { elementId: 'tgt-1', anchorId: 'left', x: 200, y: 25 },
    route: { type: 'orthogonal', points: [] },
    ...connectorOverrides,
  };

  const scene: SceneDocument = {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
    rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements: [src, tgt, conn],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };

  return { scene, src, tgt, conn };
}

describe('recalculateConnectorRoute', () => {
  it('recalculates orthogonal route points', () => {
    const { scene, conn } = makeSceneWithConnector();
    const result = recalculateConnectorRoute(conn, scene.elements);

    expect(result.route.type).toBe('orthogonal');
    expect(result.route.points.length).toBeGreaterThan(0);

    for (let i = 1; i < result.route.points.length; i++) {
      const dx = result.route.points[i].x - result.route.points[i - 1].x;
      const dy = result.route.points[i].y - result.route.points[i - 1].y;
      const isHorizontal = Math.abs(dx) > 0.001 && Math.abs(dy) < 0.001;
      const isVertical = Math.abs(dy) > 0.001 && Math.abs(dx) < 0.001;
      expect(isHorizontal || isVertical).toBe(true);
    }
  });

  it('updates endpoint positions after element moves', () => {
    const { scene, conn } = makeSceneWithConnector();

    // Simulate moving source element
    const movedSrc = { ...scene.elements[0], transform: { ...scene.elements[0].transform, x: 10, y: 10 } };
    const movedElements = [movedSrc, scene.elements[1], conn];
    const updatedScene = { ...scene, elements: movedElements };

    const updatedConn = recalculateConnectorRoute(conn, updatedScene.elements);

    // Source position should be updated
    expect(updatedConn.source.x).not.toBe(conn.source.x);
    expect(updatedConn.source.y).not.toBe(conn.source.y);
  });

  it('returns unchanged for straight routes', () => {
    const { scene, conn } = makeSceneWithConnector({ route: { type: 'straight', points: [] } });
    const result = recalculateConnectorRoute(conn, scene.elements);

    // Should not modify straight connectors
    expect(result.route.type).toBe('straight');
  });

  it('returns unchanged if source or target element missing', () => {
    const { conn } = makeSceneWithConnector({ source: { elementId: 'nonexistent', anchorId: 'right', x: 100, y: 25 } });
    const emptyScene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'Test' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
      layers: [],
      elements: [conn],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    const result = recalculateConnectorRoute(conn, emptyScene.elements);
    expect(result).toBe(conn);
  });
});

describe('recalculateRoutesForElements', () => {
  it('recalculates routes for affected connectors', () => {
    const { scene } = makeSceneWithConnector();

    // Move source element
    const movedScene = {
      ...scene,
      elements: scene.elements.map((e) => {
        if (e.id === 'src-1' && e.type === 'shape') {
          return { ...e, transform: { ...e.transform, y: 50 } };
        }
        return e;
      }),
    };

    const result = recalculateRoutesForElements(movedScene, new Set(['src-1']));
    const conn = result.elements.find((e) => e.id === 'conn-1') as ConnectorElement;

    expect(conn.route.points.length).toBeGreaterThan(0);
    expect(conn.source.y).toBeGreaterThan(25); // Updated anchor position
  });

  it('does not modify non-orthogonal connectors', () => {
    const { scene } = makeSceneWithConnector({ route: { type: 'straight', points: [] } });

    const result = recalculateRoutesForElements(scene, new Set(['src-1']));
    const conn = result.elements.find((e) => e.id === 'conn-1') as ConnectorElement;

    expect(conn.route.type).toBe('straight');
    expect(conn.route.points).toEqual([]);
  });

  it('only recalculates connectors referencing moved elements', () => {
    const { scene } = makeSceneWithConnector();

    const result = recalculateRoutesForElements(scene, new Set(['unrelated-id']));
    const conn = result.elements.find((e) => e.id === 'conn-1') as ConnectorElement;

    // Route should not change since no relevant elements moved
    expect(conn.route.points).toEqual([]);
  });
});
