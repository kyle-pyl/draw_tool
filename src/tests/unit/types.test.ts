import { describe, it, expect } from 'vitest';
import type {
  SceneDocument,
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
  BaseElement,
  Transform2D,
  ElementStyle,
  BBox,
  Layer,
  ElementGroup,
  ProjectMeta,
  CanvasConfig,
  ViewportState,
  SceneRules,
  DataSource,
  ChartDefinition,
  TemplateInstance,
  ExportPreset,
  ConnectorEndpoint,
  ConnectorRoute,
  ConnectorLabel,
  ArrowStyle,
  GeometryAdapter,
  GeometryShape,
  AnchorPoint,
} from '../../core/types';

// ─── Helper to build base element properties ─────────────────────────────────

function makeBase(
  id: string,
  layerId: string,
  overrides?: Partial<BaseElement>
): Omit<BaseElement, 'type'> {
  return {
    id,
    layerId,
    name: `element-${id}`,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#ffffff', stroke: '#000000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    tags: ['test'],
    metadata: {},
    ...overrides,
  };
}

// ─── BaseElement ─────────────────────────────────────────────────────────────

describe('BaseElement', () => {
  it('should allow constructing a valid base element payload', () => {
    const base: BaseElement = {
      id: 'e1',
      type: 'shape',
      layerId: 'layer-1',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ff0000', stroke: '#000', strokeWidth: 2, opacity: 0.8 },
      visible: true,
      locked: false,
    };
    expect(base.id).toBe('e1');
    expect(base.type).toBe('shape');
    expect(base.layerId).toBe('layer-1');
    expect(base.transform.x).toBe(10);
    expect(base.style.fill).toBe('#ff0000');
    expect(base.visible).toBe(true);
    expect(base.locked).toBe(false);
  });

  it('should allow optional fields as undefined', () => {
    const base: BaseElement = {
      id: 'e-min',
      type: 'text',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
      visible: true,
      locked: false,
    };
    expect(base.name).toBeUndefined();
    expect(base.tags).toBeUndefined();
    expect(base.metadata).toBeUndefined();
  });
});

// ─── Transform2D and ElementStyle ────────────────────────────────────────────

describe('Transform2D', () => {
  it('should support all required fields', () => {
    const t: Transform2D = { x: 5, y: 10, width: 200, height: 100, rotation: 45, scaleX: 1.5, scaleY: 1.5 };
    expect(t.x).toBe(5);
    expect(t.y).toBe(10);
    expect(t.width).toBe(200);
    expect(t.height).toBe(100);
    expect(t.rotation).toBe(45);
    expect(t.scaleX).toBe(1.5);
    expect(t.scaleY).toBe(1.5);
  });
});

describe('ElementStyle', () => {
  it('should support optional style fields', () => {
    const s: ElementStyle = {
      fill: '#ccc',
      stroke: '#333',
      strokeWidth: 3,
      strokeDasharray: '5,5',
      opacity: 0.9,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'italic',
      textAlign: 'center',
      textDecoration: 'underline',
    };
    expect(s.strokeDasharray).toBe('5,5');
    expect(s.fontSize).toBe(16);
    expect(s.textAlign).toBe('center');
  });
});

describe('BBox', () => {
  it('should represent axis-aligned bounding box', () => {
    const bbox: BBox = { x: 10, y: 20, width: 100, height: 50 };
    expect(bbox.x).toBe(10);
    expect(bbox.y).toBe(20);
    expect(bbox.width).toBe(100);
    expect(bbox.height).toBe(50);
  });
});

// ─── ShapeElement ────────────────────────────────────────────────────────────

describe('ShapeElement', () => {
  it('should create a rectangle shape', () => {
    const shape: ShapeElement = {
      ...makeBase('shape-1', 'layer-1'),
      type: 'shape',
      shapeKind: 'rect',
      cornerRadius: [5, 5, 5, 5],
    };
    expect(shape.type).toBe('shape');
    expect(shape.shapeKind).toBe('rect');
    expect(shape.cornerRadius).toEqual([5, 5, 5, 5]);
  });

  it('should create a polygon shape with points', () => {
    const shape: ShapeElement = {
      ...makeBase('poly-1', 'layer-1'),
      type: 'shape',
      shapeKind: 'polygon',
      points: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }],
    };
    expect(shape.shapeKind).toBe('polygon');
    expect(shape.points).toHaveLength(3);
  });

  it('should create a path shape', () => {
    const shape: ShapeElement = {
      ...makeBase('path-1', 'layer-1'),
      type: 'shape',
      shapeKind: 'path',
      pathCommands: 'M 0 0 L 100 0 L 100 100 Z',
    };
    expect(shape.shapeKind).toBe('path');
    expect(shape.pathCommands).toBe('M 0 0 L 100 0 L 100 100 Z');
  });
});

// ─── TextElement ─────────────────────────────────────────────────────────────

describe('TextElement', () => {
  it('should create a text element with content', () => {
    const text: TextElement = {
      ...makeBase('text-1', 'layer-1'),
      type: 'text',
      text: 'Hello World',
    };
    expect(text.type).toBe('text');
    expect(text.text).toBe('Hello World');
  });
});

// ─── ImageElement ────────────────────────────────────────────────────────────

describe('ImageElement', () => {
  it('should create an image element', () => {
    const img: ImageElement = {
      ...makeBase('img-1', 'layer-1'),
      type: 'image',
      src: 'blob:...',
      originalWidth: 800,
      originalHeight: 600,
      objectFit: 'contain',
    };
    expect(img.type).toBe('image');
    expect(img.src).toBe('blob:...');
    expect(img.originalWidth).toBe(800);
    expect(img.originalHeight).toBe(600);
    expect(img.objectFit).toBe('contain');
  });
});

// ─── ConnectorElement ────────────────────────────────────────────────────────

describe('ConnectorElement', () => {
  it('should create a connector with source, target, route, labels and arrows', () => {
    const source: ConnectorEndpoint = { elementId: 'shape-1', anchorId: 'right', x: 100, y: 50 };
    const target: ConnectorEndpoint = { elementId: 'shape-2', anchorId: 'left', x: 200, y: 50 };
    const route: ConnectorRoute = { type: 'straight', points: [{ x: 100, y: 50 }, { x: 200, y: 50 }] };
    const label: ConnectorLabel = { text: 'flow', position: 0.5, offset: { dx: 0, dy: -10 } };
    const arrowEnd: ArrowStyle = { type: 'triangle', size: 1.2 };

    const conn: ConnectorElement = {
      ...makeBase('conn-1', 'layer-3'),
      type: 'connector',
      source,
      target,
      route,
      labels: [label],
      arrowStart: { type: 'none' },
      arrowEnd,
      semanticKind: 'flow',
    };

    expect(conn.type).toBe('connector');
    expect(conn.source.elementId).toBe('shape-1');
    expect(conn.target.elementId).toBe('shape-2');
    expect(conn.route.type).toBe('straight');
    expect(conn.labels).toHaveLength(1);
    expect(conn.labels![0].text).toBe('flow');
    expect(conn.arrowEnd!.type).toBe('triangle');
    expect(conn.semanticKind).toBe('flow');
  });

  it('should support free-floating endpoints', () => {
    const conn: ConnectorElement = {
      ...makeBase('conn-2', 'layer-1'),
      type: 'connector',
      source: { x: 50, y: 50 },
      target: { elementId: 'shape-1', anchorId: 'top', x: 100, y: 0 },
      route: { type: 'polyline', points: [{ x: 50, y: 50 }, { x: 100, y: 0 }] },
    };
    expect(conn.source.elementId).toBeUndefined();
    expect(conn.target.elementId).toBe('shape-1');
  });
});

// ─── ChartElement ────────────────────────────────────────────────────────────

describe('ChartElement', () => {
  it('should create a data-bound chart element', () => {
    const chart: ChartElement = {
      ...makeBase('chart-1', 'layer-1'),
      type: 'chart',
      dataSourceId: 'ds-1',
      chartType: 'bar',
      columnMappings: { x: 'category', y: 'value', group: 'series' },
      options: { title: 'Sales' },
    };
    expect(chart.type).toBe('chart');
    expect(chart.dataSourceId).toBe('ds-1');
    expect(chart.chartType).toBe('bar');
    expect(chart.columnMappings.x).toBe('category');
  });
});

// ─── ContainerElement ────────────────────────────────────────────────────────

describe('ContainerElement', () => {
  it('should create a container element', () => {
    const container: ContainerElement = {
      ...makeBase('container-1', 'layer-1'),
      type: 'container',
      containerLabel: 'Cloud Region',
    };
    expect(container.type).toBe('container');
    expect(container.containerLabel).toBe('Cloud Region');
  });
});

// ─── RTL Elements ────────────────────────────────────────────────────────────

describe('RtlPortElement', () => {
  it('should create an input port', () => {
    const port: RtlPortElement = {
      ...makeBase('port-1', 'layer-2'),
      type: 'rtlPort',
      direction: 'input',
      bitWidth: 32,
      portName: 'data_in',
    };
    expect(port.type).toBe('rtlPort');
    expect(port.direction).toBe('input');
    expect(port.bitWidth).toBe(32);
    expect(port.portName).toBe('data_in');
  });
});

describe('RtlModuleElement', () => {
  it('should create an RTL module with ports', () => {
    const port: RtlPortElement = {
      ...makeBase('port-out', 'layer-2'),
      type: 'rtlPort',
      direction: 'output',
      bitWidth: 32,
      portName: 'data_out',
    };
    const mod: RtlModuleElement = {
      ...makeBase('rtl-1', 'layer-1'),
      type: 'rtlModule',
      moduleName: 'register',
      instanceName: 'reg_a',
      parameters: { WIDTH: 32 },
      ports: [port],
      collapsed: false,
    };
    expect(mod.type).toBe('rtlModule');
    expect(mod.moduleName).toBe('register');
    expect(mod.instanceName).toBe('reg_a');
    expect(mod.ports).toHaveLength(1);
    expect(mod.ports![0].portName).toBe('data_out');
  });
});

// ─── MindNodeElement ─────────────────────────────────────────────────────────

describe('MindNodeElement', () => {
  it('should create a mind map node', () => {
    const node: MindNodeElement = {
      ...makeBase('mind-1', 'layer-1'),
      type: 'mindNode',
      text: 'Central Topic',
      parentId: undefined,
      childrenIds: ['mind-2', 'mind-3'],
      collapsed: false,
    };
    expect(node.type).toBe('mindNode');
    expect(node.text).toBe('Central Topic');
    expect(node.childrenIds).toEqual(['mind-2', 'mind-3']);
    expect(node.collapsed).toBe(false);
  });
});

// ─── TopologyNodeElement ─────────────────────────────────────────────────────

describe('TopologyNodeElement', () => {
  it('should create a network topology node', () => {
    const node: TopologyNodeElement = {
      ...makeBase('topo-1', 'layer-1'),
      type: 'topologyNode',
      deviceType: 'router',
      label: 'Core Router',
      properties: { ip: '10.0.0.1', vendor: 'Cisco' },
    };
    expect(node.type).toBe('topologyNode');
    expect(node.deviceType).toBe('router');
    expect(node.label).toBe('Core Router');
    expect(node.properties).toEqual({ ip: '10.0.0.1', vendor: 'Cisco' });
  });
});

// ─── SceneElement Union (Discriminated Union) ────────────────────────────────

describe('SceneElement union', () => {
  it('should narrow correctly for ShapeElement', () => {
    const el: SceneElement = {
      ...makeBase('s1', 'l1'),
      type: 'shape',
      shapeKind: 'rect',
    };
    if (el.type === 'shape') {
      expect(el.shapeKind).toBe('rect');
    }
  });

  it('should narrow correctly for ConnectorElement', () => {
    const el: SceneElement = {
      ...makeBase('c1', 'l1'),
      type: 'connector',
      source: { x: 0, y: 0 },
      target: { x: 100, y: 100 },
      route: { type: 'straight', points: [] },
    };
    if (el.type === 'connector') {
      expect(el.source.x).toBe(0);
      expect(el.target.x).toBe(100);
    }
  });

  it('should narrow correctly for ChartElement', () => {
    const el: SceneElement = {
      ...makeBase('ch1', 'l1'),
      type: 'chart',
      dataSourceId: 'ds1',
      chartType: 'line',
      columnMappings: {},
    };
    if (el.type === 'chart') {
      expect(el.chartType).toBe('line');
    }
  });

  it('should narrow correctly for each element type', () => {
    const elements: SceneElement[] = [
      { ...makeBase('e1', 'l1'), type: 'shape', shapeKind: 'rect' },
      { ...makeBase('e2', 'l1'), type: 'text', text: 'A' },
      { ...makeBase('e3', 'l1'), type: 'image', src: 'x', originalWidth: 100, originalHeight: 100 },
      { ...makeBase('e4', 'l1'), type: 'connector', source: { x: 0, y: 0 }, target: { x: 1, y: 1 }, route: { type: 'straight', points: [] } },
      { ...makeBase('e5', 'l1'), type: 'chart', dataSourceId: 'd', chartType: 'bar', columnMappings: {} },
      { ...makeBase('e6', 'l1'), type: 'container' },
      { ...makeBase('e7', 'l1'), type: 'rtlModule', moduleName: 'm', instanceName: 'i' },
      { ...makeBase('e8', 'l1'), type: 'rtlPort', direction: 'input', bitWidth: 1, portName: 'p' },
      { ...makeBase('e9', 'l1'), type: 'mindNode', text: 'n' },
      { ...makeBase('e10', 'l1'), type: 'topologyNode', deviceType: 'server' },
    ];
    expect(elements).toHaveLength(10);
    const types = elements.map(e => e.type);
    expect(types).toEqual(['shape', 'text', 'image', 'connector', 'chart', 'container', 'rtlModule', 'rtlPort', 'mindNode', 'topologyNode']);
  });
});

// ─── Layer ───────────────────────────────────────────────────────────────────

describe('Layer', () => {
  it('should create a valid layer', () => {
    const layer: Layer = {
      id: 'layer-1',
      name: 'Background',
      order: 1,
      visible: true,
      locked: false,
      defaultStyle: { fill: '#fff' },
    };
    expect(layer.id).toBe('layer-1');
    expect(layer.name).toBe('Background');
    expect(layer.order).toBe(1);
    expect(layer.visible).toBe(true);
    expect(layer.locked).toBe(false);
    expect(layer.defaultStyle?.fill).toBe('#fff');
  });
});

// ─── ElementGroup ────────────────────────────────────────────────────────────

describe('ElementGroup', () => {
  it('should create a group with element references', () => {
    const group: ElementGroup = {
      id: 'g1',
      name: 'My Group',
      elementIds: ['e1', 'e2', 'e3'],
    };
    expect(group.id).toBe('g1');
    expect(group.name).toBe('My Group');
    expect(group.elementIds).toEqual(['e1', 'e2', 'e3']);
  });
});

// ─── ProjectMeta ─────────────────────────────────────────────────────────────

describe('ProjectMeta', () => {
  it('should support all metadata fields', () => {
    const meta: ProjectMeta = {
      name: 'Test Project',
      author: 'Test Author',
      createdAt: '2026-05-18T00:00:00Z',
      updatedAt: '2026-05-18T12:00:00Z',
      description: 'A test project',
    };
    expect(meta.name).toBe('Test Project');
    expect(meta.author).toBe('Test Author');
    expect(meta.createdAt).toBe('2026-05-18T00:00:00Z');
  });
});

// ─── CanvasConfig ────────────────────────────────────────────────────────────

describe('CanvasConfig', () => {
  it('should create canvas configuration', () => {
    const config: CanvasConfig = {
      units: 'px',
      background: '#ffffff',
      defaultFont: 'Arial',
      gridSize: 10,
      snapToGrid: true,
      artboard: { width: 1920, height: 1080 },
    };
    expect(config.units).toBe('px');
    expect(config.gridSize).toBe(10);
    expect(config.snapToGrid).toBe(true);
    expect(config.artboard?.width).toBe(1920);
  });
});

// ─── ViewportState ───────────────────────────────────────────────────────────

describe('ViewportState', () => {
  it('should create viewport state', () => {
    const vp: ViewportState = {
      zoom: 1.5,
      offsetX: 100,
      offsetY: 200,
      selectedElementId: 'e1',
    };
    expect(vp.zoom).toBe(1.5);
    expect(vp.offsetX).toBe(100);
    expect(vp.offsetY).toBe(200);
    expect(vp.selectedElementId).toBe('e1');
  });
});

// ─── SceneRules ──────────────────────────────────────────────────────────────

describe('SceneRules', () => {
  it('should create scene rules', () => {
    const rules: SceneRules = {
      maxLayerCount: 10,
      collisionStrategy: 'bbox',
      hiddenElementsCollide: true,
      lockedElementsCollide: true,
      connectorsExempt: true,
    };
    expect(rules.maxLayerCount).toBe(10);
    expect(rules.collisionStrategy).toBe('bbox');
    expect(rules.connectorsExempt).toBe(true);
  });
});

// ─── DataSource ──────────────────────────────────────────────────────────────

describe('DataSource', () => {
  it('should create a CSV data source reference', () => {
    const ds: DataSource = {
      id: 'ds-1',
      path: 'data/table_001.csv',
      type: 'csv',
      parseConfig: { header: true, delimiter: ',' },
    };
    expect(ds.id).toBe('ds-1');
    expect(ds.path).toBe('data/table_001.csv');
    expect(ds.type).toBe('csv');
  });

  it('should support Excel data sources', () => {
    const ds: DataSource = {
      id: 'ds-2',
      path: 'data/workbook.xlsx',
      type: 'xlsx',
      parseConfig: { sheetName: 'Sheet1' },
    };
    expect(ds.type).toBe('xlsx');
  });
});

// ─── ChartDefinition ─────────────────────────────────────────────────────────

describe('ChartDefinition', () => {
  it('should create a chart definition', () => {
    const def: ChartDefinition = {
      id: 'chart-def-1',
      dataSourceId: 'ds-1',
      chartType: 'scatter',
      columnMappings: { x: 'x_col', y: 'y_col' },
    };
    expect(def.id).toBe('chart-def-1');
    expect(def.chartType).toBe('scatter');
  });
});

// ─── TemplateInstance ────────────────────────────────────────────────────────

describe('TemplateInstance', () => {
  it('should create a template instance record', () => {
    const inst: TemplateInstance = {
      templateId: 'tpl-rect',
      position: { x: 100, y: 200 },
      layerId: 'layer-1',
      params: { width: 200 },
      elementIds: ['e1', 'e2'],
    };
    expect(inst.templateId).toBe('tpl-rect');
    expect(inst.position.x).toBe(100);
    expect(inst.elementIds).toEqual(['e1', 'e2']);
  });
});

// ─── ExportPreset ────────────────────────────────────────────────────────────

describe('ExportPreset', () => {
  it('should create an SVG export preset', () => {
    const preset: ExportPreset = {
      id: 'exp-1',
      name: 'Full SVG',
      region: 'full',
      format: 'svg',
    };
    expect(preset.id).toBe('exp-1');
    expect(preset.region).toBe('full');
    expect(preset.format).toBe('svg');
  });

  it('should create a PNG export preset with options', () => {
    const preset: ExportPreset = {
      id: 'exp-2',
      name: '2x PNG',
      region: 'viewport',
      format: 'png',
      options: { scale: 2, transparent: true },
    };
    expect(preset.format).toBe('png');
    expect(preset.options).toEqual({ scale: 2, transparent: true });
  });
});

// ─── SceneDocument (Full) ───────────────────────────────────────────────────

describe('SceneDocument', () => {
  it('should create a complete scene document', () => {
    const layers: Layer[] = [
      { id: 'layer-1', name: 'Layer 1', order: 1, visible: true, locked: false },
      { id: 'layer-2', name: 'Layer 2', order: 2, visible: true, locked: false },
    ];

    const elements: SceneElement[] = [
      {
        ...makeBase('rect-1', 'layer-1'),
        type: 'shape',
        shapeKind: 'rect',
      },
    ];

    const scene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'Test Scene' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: {
        maxLayerCount: 5,
        collisionStrategy: 'bbox',
        hiddenElementsCollide: true,
        lockedElementsCollide: true,
        connectorsExempt: true,
      },
      layers,
      elements,
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    expect(scene.schemaVersion).toBe('1.0.0');
    expect(scene.project.name).toBe('Test Scene');
    expect(scene.layers).toHaveLength(2);
    expect(scene.elements).toHaveLength(1);
  });

  it('should support optional viewport state', () => {
    const scene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'VP' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: { maxLayerCount: 5, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [],
      elements: [],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
      viewport: { zoom: 2.0, offsetX: 50, offsetY: 100 },
    };
    expect(scene.viewport?.zoom).toBe(2.0);
  });
});

// ─── GeometryAdapter ─────────────────────────────────────────────────────────

describe('GeometryAdapter', () => {
  it('should allow implementation of geometry adapter', () => {
    const adapter: GeometryAdapter = {
      getBBox(el: SceneElement): BBox {
        return {
          x: el.transform.x,
          y: el.transform.y,
          width: el.transform.width,
          height: el.transform.height,
        };
      },
      getGeometry(el: SceneElement): GeometryShape {
        return { paths: [[{ x: el.transform.x, y: el.transform.y }]] };
      },
      intersects(a: SceneElement, b: SceneElement): boolean {
        // Simple bounding box intersection test
        const ax = a.transform.x, ay = a.transform.y;
        const aw = a.transform.width, ah = a.transform.height;
        const bx = b.transform.x, by = b.transform.y;
        const bw = b.transform.width, bh = b.transform.height;
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
      },
    };

    const el1 = { ...makeBase('a1', 'l1'), type: 'shape' as const, shapeKind: 'rect' as const };
    const el2 = { ...makeBase('a2', 'l1'), type: 'shape' as const, shapeKind: 'rect' as const };

    const bbox = adapter.getBBox(el1);
    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(0);

    // No overlap - elements at same position should be considered as intersecting
    const intersects = adapter.intersects!(el1, el2);
    expect(intersects).toBe(true);
  });
});

// ─── GeometryShape ───────────────────────────────────────────────────────────

describe('GeometryShape', () => {
  it('should represent a set of paths', () => {
    const shape: GeometryShape = {
      paths: [
        [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
        [{ x: 20, y: 20 }, { x: 80, y: 80 }],
      ],
    };
    expect(shape.paths).toHaveLength(2);
    expect(shape.paths[0]).toHaveLength(4);
  });
});

// ─── AnchorPoint ─────────────────────────────────────────────────────────────

describe('AnchorPoint', () => {
  it('should create an anchor point with position and direction', () => {
    const anchor: AnchorPoint = {
      id: 'top-center',
      position: { x: 0.5, y: 0 },
      direction: -Math.PI / 2,
    };
    expect(anchor.id).toBe('top-center');
    expect(anchor.position.x).toBe(0.5);
    expect(anchor.position.y).toBe(0);
    expect(anchor.direction).toBe(-Math.PI / 2);
  });
});

// ─── Import verification ─────────────────────────────────────────────────────

describe('type import verification', () => {
  it('should be able to import types from core module', () => {
    // This test verifies that the barrel export in index.ts works.
    // If these lines compile, the imports are correct.
    const el: SceneElement = {
      id: 'e1',
      type: 'shape',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
      shapeKind: 'rect',
    };
    expect(el.type).toBe('shape');
  });
});
