import { describe, it, expect } from 'vitest';
import { getBBox, createGeometryAdapter } from '../../core/geometry';
import type {
  ShapeElement,
  TextElement,
  ImageElement,
  ConnectorElement,
  ChartElement,
  ContainerElement,
  RtlModuleElement,
  RtlPortElement,
  MindNodeElement,
  TopologyNodeElement,
  SceneElement,
  BBox,
} from '../../core/types';

function base(id: string, layerId: string, overrides?: Record<string, unknown>) {
  return {
    id,
    layerId,
    name: `el-${id}`,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    ...overrides,
  };
}

// ─── Shape BBox ─────────────────────────────────────────────────────────────────

describe('getBBox - shape elements', () => {
  it('rectangle bbox equals transform geometry', () => {
    const rect: ShapeElement = {
      ...base('r1', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    expect(bbox).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('circle bbox is its bounding square', () => {
    const circle: ShapeElement = {
      ...base('c1', 'l1'),
      type: 'shape',
      shapeKind: 'circle',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(circle);
    expect(bbox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('circle bbox with rectangular transform uses min dimension as diameter', () => {
    const circle: ShapeElement = {
      ...base('c2', 'l1'),
      type: 'shape',
      shapeKind: 'circle',
      transform: { x: 50, y: 50, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(circle);
    // radius = min(200,100)/2 = 50, diameter = 100
    // center at (50+100, 50+50) = (150, 100)
    // bbox: (100, 50, 100, 100)
    expect(bbox).toEqual({ x: 100, y: 50, width: 100, height: 100 });
  });

  it('ellipse bbox equals transform bounds', () => {
    const ellipse: ShapeElement = {
      ...base('e1', 'l1'),
      type: 'shape',
      shapeKind: 'ellipse',
      transform: { x: 0, y: 0, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(ellipse);
    expect(bbox).toEqual({ x: 0, y: 0, width: 200, height: 100 });
  });

  it('polygon bbox calculated from points', () => {
    const poly: ShapeElement = {
      ...base('p1', 'l1'),
      type: 'shape',
      shapeKind: 'polygon',
      transform: { x: 10, y: 10, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 75, y: 60 },
        { x: 25, y: 80 },
        { x: -10, y: 40 },
      ],
    };
    const bbox = getBBox(poly);
    // Points relative to (10,10): min x=-10+10=0, max x=75+10=85, min y=0+10=10, max y=80+10=90
    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(10);
    expect(bbox.width).toBe(85);
    expect(bbox.height).toBe(80);
  });

  it('polygon without points falls back to transform bounds', () => {
    const poly: ShapeElement = {
      ...base('p2', 'l1'),
      type: 'shape',
      shapeKind: 'polygon',
      transform: { x: 20, y: 30, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(poly);
    expect(bbox).toEqual({ x: 20, y: 30, width: 80, height: 60 });
  });

  it('polygon with empty points array falls back to transform bounds', () => {
    const poly: ShapeElement = {
      ...base('p3', 'l1'),
      type: 'shape',
      shapeKind: 'polygon',
      transform: { x: 5, y: 5, width: 90, height: 70, rotation: 0, scaleX: 1, scaleY: 1 },
      points: [],
    };
    const bbox = getBBox(poly);
    expect(bbox.x).toBe(5);
    expect(bbox.y).toBe(5);
    expect(bbox.width).toBe(90);
    expect(bbox.height).toBe(70);
  });

  it('path bbox uses transform bounds', () => {
    const path: ShapeElement = {
      ...base('path1', 'l1'),
      type: 'shape',
      shapeKind: 'path',
      transform: { x: 0, y: 0, width: 300, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
      pathCommands: 'M 0 0 L 100 0 L 100 100 Z',
    };
    const bbox = getBBox(path);
    expect(bbox).toEqual({ x: 0, y: 0, width: 300, height: 200 });
  });
});

// ─── Rotation BBox ──────────────────────────────────────────────────────────────

describe('getBBox - rotation handling', () => {
  it('zero rotation returns exact transform bounds', () => {
    const rect: ShapeElement = {
      ...base('r0', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 100, y: 200, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    expect(bbox).toEqual({ x: 100, y: 200, width: 80, height: 60 });
  });

  it('90-degree rotation swaps width and height', () => {
    const rect: ShapeElement = {
      ...base('r90', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 100, y: 100, width: 200, height: 100, rotation: 90, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    expect(bbox.width).toBeCloseTo(100, 5);
    expect(bbox.height).toBeCloseTo(200, 5);
    // Center at (200, 150), 90deg rotated: width=100, height=200
    expect(bbox.x).toBeCloseTo(150, 5);
    expect(bbox.y).toBeCloseTo(50, 5);
  });

  it('45-degree rotation expands bbox correctly', () => {
    const rect: ShapeElement = {
      ...base('r45', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 45, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    // For a 100x100 square at origin rotated 45 degrees:
    // diagonal = 100 * sqrt(2) ≈ 141.42
    // center at (50, 50)
    // min x = 50 - 70.71 ≈ -20.71, width ≈ 141.42
    expect(bbox.width).toBeCloseTo(141.42, 1);
    expect(bbox.height).toBeCloseTo(141.42, 1);
    expect(bbox.x).toBeCloseTo(-20.71, 1);
    expect(bbox.y).toBeCloseTo(-20.71, 1);
  });

  it('180-degree rotation returns same bbox as no rotation', () => {
    const rect: ShapeElement = {
      ...base('r180', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 50, y: 50, width: 200, height: 100, rotation: 180, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    expect(bbox.x).toBeCloseTo(50, 5);
    expect(bbox.y).toBeCloseTo(50, 5);
    expect(bbox.width).toBeCloseTo(200, 5);
    expect(bbox.height).toBeCloseTo(100, 5);
  });

  it('rotation on non-center origin element expands bbox', () => {
    const rect: ShapeElement = {
      ...base('r30', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 0, y: 0, width: 200, height: 50, rotation: 30, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    // rotation around center (100, 25): width=200*cos30+50*sin30≈198.2, height=200*sin30+50*cos30≈143.3
    expect(bbox.width).toBeCloseTo(198.2, 0);
    expect(bbox.height).toBeCloseTo(143.3, 0);
  });

  it('rotated circle returns correct bbox', () => {
    const circle: ShapeElement = {
      ...base('cr45', 'l1'),
      type: 'shape',
      shapeKind: 'circle',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 45, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(circle);
    // Circle bbox is same regardless of rotation
    expect(bbox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('rotated ellipse returns correct bbox', () => {
    const ellipse: ShapeElement = {
      ...base('er45', 'l1'),
      type: 'shape',
      shapeKind: 'ellipse',
      transform: { x: 0, y: 0, width: 200, height: 100, rotation: 45, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(ellipse);
    // AABB of 200x100 rect rotated 45deg: width = 200*cos45 + 100*sin45 ≈ 212.13
    expect(bbox.width).toBeCloseTo(212.13, 1);
    expect(bbox.height).toBeCloseTo(212.13, 1);
  });
});

// ─── Text BBox ──────────────────────────────────────────────────────────────────

describe('getBBox - text elements', () => {
  it('text bbox with no transform dimensions uses estimate', () => {
    const text: TextElement = {
      ...base('t1', 'l1'),
      type: 'text',
      text: 'Hello World',
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(text);
    // 11 chars * 16 * 0.6 = 105.6, height = 16 * 1.4 = 22.4
    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(0);
    expect(bbox.width).toBeCloseTo(105.6, 0);
    expect(bbox.height).toBeCloseTo(22.4, 0);
  });

  it('text with custom fontSize uses estimate based on fontSize', () => {
    const text: TextElement = {
      ...base('t2', 'l1'),
      type: 'text',
      text: 'ABC',
      style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 24 },
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(text);
    expect(bbox.width).toBeCloseTo(3 * 24 * 0.6, 0);
    expect(bbox.height).toBeCloseTo(24 * 1.4, 0);
  });

  it('text with large transform dimensions uses those instead of estimate', () => {
    const text: TextElement = {
      ...base('t3', 'l1'),
      type: 'text',
      text: 'Hi',
      transform: { x: 10, y: 20, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(text);
    expect(bbox.x).toBe(10);
    expect(bbox.y).toBe(20);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(100);
  });

  it('empty text string still returns bbox', () => {
    const text: TextElement = {
      ...base('t4', 'l1'),
      type: 'text',
      text: '',
      transform: { x: 5, y: 5, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(text);
    expect(bbox).toEqual({ x: 5, y: 5, width: 100, height: 50 });
  });

  it('rotated text returns expanded bbox', () => {
    const text: TextElement = {
      ...base('t5', 'l1'),
      type: 'text',
      text: 'Rotated',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 45, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(text);
    expect(bbox.width).toBeGreaterThan(100);
  });
});

// ─── Image BBox ─────────────────────────────────────────────────────────────────

describe('getBBox - image elements', () => {
  it('image bbox uses transform dimensions', () => {
    const img: ImageElement = {
      ...base('i1', 'l1'),
      type: 'image',
      src: 'blob:test',
      originalWidth: 800,
      originalHeight: 600,
      transform: { x: 100, y: 200, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(img);
    expect(bbox).toEqual({ x: 100, y: 200, width: 400, height: 300 });
  });

  it('image with zero width/height falls back to original dimensions', () => {
    const img: ImageElement = {
      ...base('i2', 'l1'),
      type: 'image',
      src: 'blob:test',
      originalWidth: 640,
      originalHeight: 480,
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(img);
    expect(bbox.width).toBe(640);
    expect(bbox.height).toBe(480);
  });

  it('image with negative original dimensions uses minimum', () => {
    const img: ImageElement = {
      ...base('i3', 'l1'),
      type: 'image',
      src: 'blob:test',
      originalWidth: -1,
      originalHeight: -1,
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(img);
    expect(bbox.width).toBe(100);
    expect(bbox.height).toBe(100);
  });

  it('rotated image returns expanded bbox', () => {
    const img: ImageElement = {
      ...base('i4', 'l1'),
      type: 'image',
      src: 'blob:test',
      originalWidth: 100,
      originalHeight: 100,
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 45, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(img);
    expect(bbox.width).toBeCloseTo(141.42, 1);
    expect(bbox.height).toBeCloseTo(141.42, 1);
  });
});

// ─── Connector BBox ─────────────────────────────────────────────────────────────

describe('getBBox - connector elements', () => {
  it('connector bbox covers source, target and route points', () => {
    const conn: ConnectorElement = {
      ...base('c1', 'l1'),
      type: 'connector',
      source: { x: 0, y: 100 },
      target: { x: 200, y: 0 },
      route: { type: 'straight', points: [{ x: 100, y: 50 }] },
    };
    const bbox = getBBox(conn);
    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(0);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(100);
  });

  it('connector with only source and target (no route points) covers endpoints', () => {
    const conn: ConnectorElement = {
      ...base('c2', 'l1'),
      type: 'connector',
      source: { x: 50, y: 80 },
      target: { x: 150, y: 20 },
      route: { type: 'straight', points: [] },
    };
    const bbox = getBBox(conn);
    expect(bbox.x).toBe(50);
    expect(bbox.y).toBe(20);
    expect(bbox.width).toBe(100);
    expect(bbox.height).toBe(60);
  });

  it('connector with free endpoints returns correct bbox', () => {
    const conn: ConnectorElement = {
      ...base('c3', 'l1'),
      type: 'connector',
      source: { x: -50, y: -50 },
      target: { x: 0, y: 0 },
      route: { type: 'polyline', points: [{ x: -50, y: 0 }, { x: 0, y: -50 }] },
    };
    const bbox = getBBox(conn);
    // Points: (-50,-50), (0,0), (-50,0), (0,-50) → min (-50,-50) max (0,0)
    expect(bbox.x).toBe(-50);
    expect(bbox.y).toBe(-50);
    expect(bbox.width).toBe(50);
    expect(bbox.height).toBe(50);
  });

  it('connector with empty route and zero-coordinate endpoints returns zero bbox', () => {
    const conn: ConnectorElement = {
      ...base('c4', 'l1'),
      type: 'connector',
      source: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      route: { type: 'straight', points: [] },
    };
    const bbox = getBBox(conn);
    expect(bbox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('multi-point orthogonal connector bbox covers all waypoints', () => {
    const conn: ConnectorElement = {
      ...base('c5', 'l1'),
      type: 'connector',
      source: { x: 100, y: 100 },
      target: { x: 200, y: 200 },
      route: {
        type: 'orthogonal',
        points: [
          { x: 100, y: 100 },
          { x: 100, y: 150 },
          { x: 200, y: 150 },
          { x: 200, y: 200 },
        ],
      },
    };
    const bbox = getBBox(conn);
    // All points: (100,100), (200,200), (100,100), (100,150), (200,150), (200,200)
    // min (100,100) max (200,200)
    expect(bbox.x).toBe(100);
    expect(bbox.y).toBe(100);
    expect(bbox.width).toBe(100);
    expect(bbox.height).toBe(100);
  });
});

// ─── Other Element Types ────────────────────────────────────────────────────────

describe('getBBox - other element types', () => {
  it('chart element uses transform bounds', () => {
    const chart: ChartElement = {
      ...base('ch1', 'l1'),
      type: 'chart',
      dataSourceId: 'ds1',
      chartType: 'bar',
      columnMappings: {},
      transform: { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(chart);
    expect(bbox).toEqual({ x: 0, y: 0, width: 400, height: 300 });
  });

  it('container element uses transform bounds', () => {
    const container: ContainerElement = {
      ...base('ct1', 'l1'),
      type: 'container',
      containerLabel: 'Area',
      transform: { x: 50, y: 50, width: 500, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(container);
    expect(bbox).toEqual({ x: 50, y: 50, width: 500, height: 400 });
  });

  it('rtlModule element uses transform bounds', () => {
    const mod: RtlModuleElement = {
      ...base('rtl1', 'l1'),
      type: 'rtlModule',
      moduleName: 'register',
      instanceName: 'r1',
      transform: { x: 100, y: 100, width: 200, height: 120, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(mod);
    expect(bbox).toEqual({ x: 100, y: 100, width: 200, height: 120 });
  });

  it('rtlPort element uses transform bounds', () => {
    const port: RtlPortElement = {
      ...base('rp1', 'l1'),
      type: 'rtlPort',
      direction: 'input',
      bitWidth: 32,
      portName: 'data_in',
      transform: { x: 0, y: 0, width: 40, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(port);
    expect(bbox).toEqual({ x: 0, y: 0, width: 40, height: 20 });
  });

  it('mindNode element uses transform bounds', () => {
    const node: MindNodeElement = {
      ...base('mn1', 'l1'),
      type: 'mindNode',
      text: 'Topic',
      transform: { x: 200, y: 100, width: 120, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(node);
    expect(bbox).toEqual({ x: 200, y: 100, width: 120, height: 60 });
  });

  it('topologyNode element uses transform bounds', () => {
    const node: TopologyNodeElement = {
      ...base('tn1', 'l1'),
      type: 'topologyNode',
      deviceType: 'router',
      transform: { x: 10, y: 20, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(node);
    expect(bbox).toEqual({ x: 10, y: 20, width: 80, height: 80 });
  });
});

// ─── BBox Math Properties ───────────────────────────────────────────────────────

describe('getBBox - mathematical properties', () => {
  it('bbox width and height are always non-negative', () => {
    const rect: ShapeElement = {
      ...base('r1', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: -100, y: -50, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = getBBox(rect);
    expect(bbox.width).toBeGreaterThanOrEqual(0);
    expect(bbox.height).toBeGreaterThanOrEqual(0);
  });

  it('identically positioned elements have the same bbox', () => {
    const a: ShapeElement = {
      ...base('a', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const b: ShapeElement = {
      ...base('b', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    expect(getBBox(a)).toEqual(getBBox(b));
  });
});

// ─── GeometryAdapter ────────────────────────────────────────────────────────────

describe('createGeometryAdapter', () => {
  it('returns a GeometryAdapter with getBBox implemented', () => {
    const adapter = createGeometryAdapter();
    expect(adapter.getBBox).toBeDefined();
    expect(typeof adapter.getBBox).toBe('function');
  });

  it('adapter getBBox works on scene elements', () => {
    const adapter = createGeometryAdapter();
    const rect: ShapeElement = {
      ...base('r1', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    };
    const bbox = adapter.getBBox(rect);
    expect(bbox).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('getGeometry and intersects are provided', () => {
    const adapter = createGeometryAdapter();
    expect(adapter.getGeometry).toBeDefined();
    expect(adapter.getGeometry).toBeInstanceOf(Function);
    expect(adapter.intersects).toBeDefined();
    expect(adapter.intersects).toBeInstanceOf(Function);
  });
});

// ─── SceneElement Union Type BBox ────────────────────────────────────────────────

describe('getBBox - SceneElement union discrimination', () => {
  it('correctly computes bbox via discriminated union', () => {
    const elements: SceneElement[] = [
      { ...base('e1', 'l1'), type: 'shape', shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 30, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e2', 'l1'), type: 'text', text: 'A', transform: { x: 100, y: 100, width: 20, height: 30, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e3', 'l1'), type: 'image', src: 'x', originalWidth: 100, originalHeight: 100, transform: { x: 200, y: 200, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e4', 'l1'), type: 'connector', source: { x: 300, y: 300 }, target: { x: 400, y: 400 }, route: { type: 'straight', points: [] } },
      { ...base('e5', 'l1'), type: 'chart', dataSourceId: 'd', chartType: 'bar', columnMappings: {}, transform: { x: 500, y: 500, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e6', 'l1'), type: 'container', transform: { x: 600, y: 600, width: 200, height: 150, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e7', 'l1'), type: 'rtlModule', moduleName: 'm', instanceName: 'i', transform: { x: 700, y: 700, width: 200, height: 120, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e8', 'l1'), type: 'rtlPort', direction: 'input', bitWidth: 1, portName: 'p', transform: { x: 800, y: 800, width: 40, height: 20, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e9', 'l1'), type: 'mindNode', text: 'n', transform: { x: 900, y: 900, width: 120, height: 60, rotation: 0, scaleX: 1, scaleY: 1 } },
      { ...base('e10', 'l1'), type: 'topologyNode', deviceType: 'server', transform: { x: 1000, y: 1000, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 } },
    ];

    const bboxes = elements.map((el) => getBBox(el));

    expect(bboxes).toHaveLength(10);
    expect(bboxes[0]).toEqual({ x: 0, y: 0, width: 50, height: 30 });
    expect(bboxes[1]).toEqual({ x: 100, y: 100, width: 20, height: 30 });
    expect(bboxes[2]).toEqual({ x: 200, y: 200, width: 100, height: 100 });
    expect(bboxes[3].x).toBe(300);
    expect(bboxes[4]).toEqual({ x: 500, y: 500, width: 400, height: 300 });
  });
});
