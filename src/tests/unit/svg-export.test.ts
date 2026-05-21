import { describe, it, expect } from 'vitest';
import { exportToSVG, downloadSvg } from '../../io/exporters';
import type { SceneDocument } from '../../core/types';

function makeBaseScene(): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test SVG Export' },
    canvas: {
      units: 'px',
      background: '#ffffff',
      defaultFont: 'Arial',
      gridSize: 0,
      snapToGrid: false,
    },
    rules: {
      maxLayerCount: 10,
      collisionStrategy: 'bbox',
      hiddenElementsCollide: false,
      lockedElementsCollide: false,
      connectorsExempt: true,
    },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements: [],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

function makeSceneWithRect(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'shape',
      shapeKind: 'rect',
      layerId: 'l1',
      transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 1 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithText(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'text',
      layerId: 'l1',
      text: 'Hello World',
      transform: { x: 10, y: 20, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#333', fontSize: 16, fontFamily: 'Arial', fontWeight: 'bold', fontStyle: 'normal', opacity: 1, stroke: 'none', strokeWidth: 0 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithCircle(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'shape',
      shapeKind: 'circle',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#00ff00', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithEllipse(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'shape',
      shapeKind: 'ellipse',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#0000ff', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithPolygon(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'shape',
      shapeKind: 'polygon',
      layerId: 'l1',
      points: [
        { x: 0, y: 50 },
        { x: 50, y: 0 },
        { x: 100, y: 50 },
      ],
      transform: { x: 10, y: 10, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ffff00', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithPath(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'shape',
      shapeKind: 'path',
      layerId: 'l1',
      pathCommands: 'M 0 0 L 100 50 L 50 100 Z',
      transform: { x: 10, y: 10, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ff00ff', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithConnector(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'connector',
      layerId: 'l1',
      source: { x: 0, y: 0 },
      target: { x: 100, y: 50 },
      route: { type: 'straight', points: [] },
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
      visible: true,
      locked: false,
      arrowEnd: { type: 'triangle', size: 1 },
    },
  ];
  return scene;
}

function makeSceneWithConnectorLabels(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'connector',
      layerId: 'l1',
      source: { x: 0, y: 0 },
      target: { x: 200, y: 0 },
      route: { type: 'straight', points: [] },
      transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
      visible: true,
      locked: false,
      labels: [
        { text: 'mid label', position: 0.5, offset: { dx: 0, dy: -12 } },
        { text: 'start label', position: 0.1, offset: { dx: 0, dy: 10 } },
      ],
    },
  ];
  return scene;
}

function makeSceneWithImage(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [
    {
      id: 'e1',
      type: 'image',
      layerId: 'l1',
      src: 'data:image/png;base64,abc123',
      originalWidth: 200,
      originalHeight: 150,
      transform: { x: 10, y: 10, width: 200, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { opacity: 1, stroke: 'none', strokeWidth: 0 },
      visible: true,
      locked: false,
    },
  ];
  return scene;
}

function makeSceneWithLayers(): SceneDocument {
  const scene = makeBaseScene();
  scene.layers = [
    { id: 'l1', name: 'Bottom Layer', order: 1, visible: true, locked: false },
    { id: 'l2', name: 'Top Layer', order: 2, visible: true, locked: false },
  ];
  scene.elements = [
    {
      id: 'e1', type: 'shape', shapeKind: 'rect', layerId: 'l1',
      transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ff0000', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false,
    },
    {
      id: 'e2', type: 'shape', shapeKind: 'rect', layerId: 'l2',
      transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#0000ff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false,
    },
  ];
  return scene;
}

function makeSceneWithHiddenElements(): SceneDocument {
  const scene = makeBaseScene();
  scene.layers = [
    { id: 'l1', name: 'Visible Layer', order: 1, visible: true, locked: false },
    { id: 'l2', name: 'Hidden Layer', order: 2, visible: false, locked: false },
  ];
  scene.elements = [
    {
      id: 'e1', type: 'shape', shapeKind: 'rect', layerId: 'l1',
      transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ff0000', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false,
    },
    {
      id: 'e2', type: 'shape', shapeKind: 'rect', layerId: 'l2',
      transform: { x: 100, y: 100, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#00ff00', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false,
    },
    {
      id: 'e3', type: 'shape', shapeKind: 'rect', layerId: 'l1',
      transform: { x: 200, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#0000ff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: false, locked: false,
    },
  ];
  return scene;
}

describe('exportToSVG', () => {
  // ── Basic output structure ────────────────────────────────────────────────
  it('should return a valid SVG string', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('</svg>');
  });

  it('should include viewBox attribute', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene);
    expect(svg).toMatch(/viewBox="[^"]+"/);
  });

  // ── Empty scene ───────────────────────────────────────────────────────────
  it('should export empty scene with default dimensions', () => {
    const scene = makeBaseScene();
    const svg = exportToSVG(scene);
    expect(svg).toContain('viewBox="0 0 800 600"');
  });

  // ── Shape element rendering ───────────────────────────────────────────────
  it('should export a rect shape', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<rect');
    expect(svg).toContain('x="10"');
    expect(svg).toContain('y="20"');
    expect(svg).toContain('width="100"');
    expect(svg).toContain('height="50"');
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('stroke="#000000"');
    expect(svg).toContain('stroke-width="2"');
  });

  it('should export a circle shape', () => {
    const scene = makeSceneWithCircle();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<circle');
    expect(svg).toContain('cx="30"');
    expect(svg).toContain('cy="30"');
    expect(svg).toContain('r="30"');
  });

  it('should export an ellipse shape', () => {
    const scene = makeSceneWithEllipse();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<ellipse');
    expect(svg).toContain('cx="50"');
    expect(svg).toContain('cy="30"');
    expect(svg).toContain('rx="50"');
    expect(svg).toContain('ry="30"');
  });

  it('should export a polygon shape', () => {
    const scene = makeSceneWithPolygon();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<polygon');
    expect(svg).toContain('transform="translate(10, 10)"');
  });

  it('should export a path shape', () => {
    const scene = makeSceneWithPath();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<path');
    expect(svg).toContain('M 0 0 L 100 50 L 50 100 Z');
  });

  // ── Text element rendering ────────────────────────────────────────────────
  it('should export text elements as <text>', () => {
    const scene = makeSceneWithText();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<text');
    expect(svg).toContain('Hello World');
    expect(svg).toContain('font-weight="bold"');
    expect(svg).toContain('font-size="16"');
  });

  it('should export text with background and border', () => {
    const scene = makeSceneWithText();
    const el = scene.elements[0] as { backgroundColor?: string; borderColor?: string; borderWidth?: number };
    el.backgroundColor = '#ffff00';
    el.borderColor = '#000000';
    el.borderWidth = 1;
    const svg = exportToSVG(scene);
    expect(svg).toContain('<rect');
    expect(svg).toContain('fill="#ffff00"');
    expect(svg).toContain('stroke="#000000"');
  });

  it('should escape XML entities in text', () => {
    const scene = makeSceneWithText();
    const el = scene.elements[0] as { text: string };
    el.text = 'Hello & <World>';
    const svg = exportToSVG(scene);
    expect(svg).toContain('Hello &amp; &lt;World&gt;');
  });

  // ── Image element rendering ───────────────────────────────────────────────
  it('should export image elements with href', () => {
    const scene = makeSceneWithImage();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<image');
    expect(svg).toContain('href="data:image/png;base64,abc123"');
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="150"');
  });

  // ── Connector rendering ───────────────────────────────────────────────────
  it('should export a connector with straight line', () => {
    const scene = makeSceneWithConnector();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<line');
  });

  it('should export connector with arrow marker definitions', () => {
    const scene = makeSceneWithConnector();
    const svg = exportToSVG(scene);
    expect(svg).toContain('<defs>');
    expect(svg).toContain('<marker');
    expect(svg).toContain('orient="auto"');
  });

  it('should export connector labels', () => {
    const scene = makeSceneWithConnectorLabels();
    const svg = exportToSVG(scene);
    expect(svg).toContain('mid label');
    expect(svg).toContain('start label');
  });

  it('should export connector with start and end arrows', () => {
    const scene = makeSceneWithConnector();
    const conn = scene.elements[0] as {
      arrowStart?: { type: string; size: number; color?: string };
      arrowEnd?: { type: string; size: number; color?: string };
    };
    conn.arrowStart = { type: 'triangle', size: 1.5 };
    conn.arrowEnd = { type: 'circle', size: 1 };
    const svg = exportToSVG(scene);
    expect(svg).toContain('<marker');
    expect(svg).toContain('<circle');
    expect(svg).toContain('<path');
    expect(svg).toContain('marker-start');
    expect(svg).toContain('marker-end');
  });

  // ── Layer ordering ────────────────────────────────────────────────────────
  it('should export elements in layer order', () => {
    const scene = makeSceneWithLayers();
    const svg = exportToSVG(scene);
    const l1Index = svg.indexOf('layer-l1');
    const l2Index = svg.indexOf('layer-l2');
    expect(l1Index).toBeLessThan(l2Index);
  });

  // ── Hidden elements filtering ─────────────────────────────────────────────
  it('should exclude elements in hidden layers', () => {
    const scene = makeSceneWithHiddenElements();
    const svg = exportToSVG(scene);
    expect(svg).toContain('data-element-id="e1"');
    expect(svg).not.toContain('data-element-id="e2"');
  });

  it('should exclude elements with visible: false', () => {
    const scene = makeSceneWithHiddenElements();
    const svg = exportToSVG(scene);
    expect(svg).not.toContain('data-element-id="e3"');
  });

  // ── Export region: full ───────────────────────────────────────────────────
  it('should include all visible elements in full export', () => {
    const scene = makeSceneWithLayers();
    const svg = exportToSVG(scene, { region: 'full' });
    expect(svg).toContain('data-element-id="e1"');
    expect(svg).toContain('data-element-id="e2"');
  });

  // ── Export region: selection ──────────────────────────────────────────────
  it('should export only selected elements', () => {
    const scene = makeSceneWithLayers();
    const svg = exportToSVG(scene, { region: 'selection', selectedElementIds: ['e1'] });
    expect(svg).toContain('data-element-id="e1"');
    expect(svg).not.toContain('data-element-id="e2"');
  });

  it('should handle empty selection', () => {
    const scene = makeSceneWithLayers();
    const svg = exportToSVG(scene, { region: 'selection', selectedElementIds: [] });
    expect(svg).toContain('viewBox="0 0 100 100"');
  });

  // ── Export region: viewport ───────────────────────────────────────────────
  it('should use viewportBBox for viewport export', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene, {
      region: 'viewport',
      viewportBBox: { x: 0, y: 0, width: 200, height: 200 },
    });
    expect(svg).toMatch(/viewBox="-10 -10 220 220"/);
  });

  // ── Background color ──────────────────────────────────────────────────────
  it('should use custom background color', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene, { backgroundColor: '#000000' });
    expect(svg).toContain('fill="#000000"');
  });

  it('should use scene canvas background by default', () => {
    const scene = makeSceneWithRect();
    scene.canvas.background = '#abcdef';
    const svg = exportToSVG(scene);
    expect(svg).toContain('fill="#abcdef"');
  });

  // ── Margin ────────────────────────────────────────────────────────────────
  it('should apply margin around content', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene, { margin: 20 });
    expect(svg).toMatch(/viewBox="-10 [\d\-]+ 140 90"/);
  });

  // ── Opacity handling ──────────────────────────────────────────────────────
  it('should not include opacity attribute when opacity is 1', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene);
    expect(svg).not.toMatch(/opacity="1"/);
  });

  it('should include opacity attribute when opacity is less than 1', () => {
    const scene = makeSceneWithRect();
    scene.elements[0].style.opacity = 0.5;
    const svg = exportToSVG(scene);
    expect(svg).toContain('opacity="0.5"');
  });

  // ── Rotation ──────────────────────────────────────────────────────────────
  it('should include transform for rotated elements', () => {
    const scene = makeSceneWithRect();
    scene.elements[0].transform.rotation = 45;
    const svg = exportToSVG(scene);
    expect(svg).toContain('rotate(45');
  });

  // ── Arrow marker types ────────────────────────────────────────────────────
  it('should create triangle marker', () => {
    const scene = makeSceneWithConnector();
    const conn = scene.elements[0] as { arrowEnd?: { type: string; size: number } };
    conn.arrowEnd = { type: 'triangle', size: 1 };
    const svg = exportToSVG(scene);
    expect(svg).toContain('fill="#333"');
  });

  it('should create openTriangle marker', () => {
    const scene = makeSceneWithConnector();
    const conn = scene.elements[0] as { arrowEnd?: { type: string; size: number } };
    conn.arrowEnd = { type: 'openTriangle', size: 1 };
    const svg = exportToSVG(scene);
    expect(svg).toContain('fill="none"');
    expect(svg).toContain('stroke="#333"');
  });

  it('should create diamond marker', () => {
    const scene = makeSceneWithConnector();
    const conn = scene.elements[0] as { arrowEnd?: { type: string; size: number } };
    conn.arrowEnd = { type: 'diamond', size: 1 };
    const svg = exportToSVG(scene);
    expect(svg).toContain('<polygon');
  });

  it('should create circle marker', () => {
    const scene = makeSceneWithConnector();
    const conn = scene.elements[0] as { arrowEnd?: { type: string; size: number } };
    conn.arrowEnd = { type: 'circle', size: 1 };
    const svg = exportToSVG(scene);
    expect(svg).toContain('<circle');
  });

  // ── Transform (scale) ─────────────────────────────────────────────────────
  it('should include scale transform for scaled elements', () => {
    const scene = makeSceneWithRect();
    scene.elements[0].transform.scaleX = 2;
    scene.elements[0].transform.scaleY = 1.5;
    const svg = exportToSVG(scene);
    expect(svg).toContain('scale(2, 1.5)');
  });

  // ── Custom CSS ────────────────────────────────────────────────────────────
  it('should embed custom CSS when provided', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene, { embedCss: '.shape { cursor: pointer; }' });
    expect(svg).toContain('<style>');
    expect(svg).toContain('.shape { cursor: pointer; }');
  });

  // ── ViewBox correctness ───────────────────────────────────────────────────
  it('should compute correct viewBox from element bounds', () => {
    const scene = makeSceneWithRect();
    const svg = exportToSVG(scene, { margin: 10 });
    expect(svg).toMatch(/viewBox="0 10 120 70"/);
  });
});

describe('downloadSvg', () => {
  it('should trigger a download without throwing', () => {
    const scene = makeSceneWithRect();
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    let blobUrlCalled = false;
    try {
      URL.createObjectURL = function (this: typeof URL, _blob: Blob) {
        blobUrlCalled = true;
        return 'blob:test';
      };
      URL.revokeObjectURL = function () {};
      downloadSvg(scene, 'my-export');
      expect(blobUrlCalled).toBe(true);
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });

  it('should use default filename when none provided', () => {
    const scene = makeSceneWithRect();
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    try {
      URL.createObjectURL = function () { return 'blob:test'; };
      URL.revokeObjectURL = function () {};
      expect(() => downloadSvg(scene)).not.toThrow();
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });
});
