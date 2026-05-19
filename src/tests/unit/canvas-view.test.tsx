import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { CanvasView } from '../../canvas/CanvasView';
import { Viewport } from '../../canvas/viewport';
import type { SceneDocument } from '../../core/types';

function createScene(overrides: Partial<SceneDocument> = {}): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
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
      hiddenElementsCollide: true,
      lockedElementsCollide: true,
      connectorsExempt: true,
    },
    layers: [
      { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
      { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
    ],
    elements: [],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
    ...overrides,
  };
}

function createViewport() {
  return new Viewport();
}

describe('CanvasView', () => {
  let scene: SceneDocument;
  let viewport: Viewport;

  beforeEach(() => {
    scene = createScene();
    viewport = createViewport();
  });

  describe('SVG container', () => {
    it('should render an SVG element', () => {
      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply canvas background color', () => {
      const bgScene = createScene({ canvas: { ...scene.canvas, background: '#ff0000' } });
      const { container } = render(<CanvasView scene={bgScene} viewport={viewport} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ background: '#ff0000' });
    });

    it('should render with specified width and height', () => {
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} width={800} height={600} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '800');
      expect(svg).toHaveAttribute('height', '600');
    });

    it('should default to 100% width and height', () => {
      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '100%');
      expect(svg).toHaveAttribute('height', '100%');
    });
  });

  describe('viewport transform', () => {
    it('should apply viewport transform matrix to the root group', () => {
      const vp = new Viewport({ initialZoom: 2, initialOffsetX: 10, initialOffsetY: 20 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const rootG = container.querySelector('svg > g');
      expect(rootG).toHaveAttribute('transform', 'matrix(2, 0, 0, 2, 10, 20)');
    });

    it('should update transform when viewport changes', () => {
      const vp = new Viewport();
      const { container, rerender } = render(<CanvasView scene={scene} viewport={vp} />);

      vp.zoomTo(0.5);
      vp.pan(100, 200);
      rerender(<CanvasView scene={scene} viewport={vp} />);

      const rootG = container.querySelector('svg > g');
      expect(rootG).toHaveAttribute('transform', 'matrix(0.5, 0, 0, 0.5, 100, 200)');
    });
  });

  describe('layer rendering', () => {
    it('should render layers as SVG groups sorted by order', () => {
      scene = createScene({
        layers: [
          { id: 'l1', name: 'Bottom', order: 1, visible: true, locked: false },
          { id: 'l2', name: 'Middle', order: 3, visible: true, locked: false },
          { id: 'l3', name: 'Top', order: 2, visible: true, locked: false },
        ],
        elements: [
          {
            id: 'e1', type: 'text', layerId: 'l1', name: 'e1',
            transform: { x: 0, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 12 },
            visible: true, locked: false, text: 'A',
          },
          {
            id: 'e2', type: 'text', layerId: 'l2', name: 'e2',
            transform: { x: 0, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 12 },
            visible: true, locked: false, text: 'B',
          },
          {
            id: 'e3', type: 'text', layerId: 'l3', name: 'e3',
            transform: { x: 0, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 12 },
            visible: true, locked: false, text: 'C',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rootG = container.querySelector('svg > g')!;
      const layerGroups = rootG.children;

      expect(layerGroups.length).toBe(3);
      expect(layerGroups[0].getAttribute('data-layer-name')).toBe('Bottom');
      expect(layerGroups[1].getAttribute('data-layer-name')).toBe('Top');
      expect(layerGroups[2].getAttribute('data-layer-name')).toBe('Middle');
    });

    it('should not render hidden layers', () => {
      scene = createScene({
        layers: [
          { id: 'l1', name: 'Visible', order: 1, visible: true, locked: false },
          { id: 'l2', name: 'Hidden', order: 2, visible: false, locked: false },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rootG = container.querySelector('svg > g')!;
      const layerGroups = rootG.children;
      expect(layerGroups.length).toBe(1);
      expect(layerGroups[0].getAttribute('data-layer-name')).toBe('Visible');
    });
  });

  describe('shape rendering', () => {
    it('should render a rect shape', () => {
      scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1', name: 'rect1',
            transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#ff0000', stroke: '#000', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rect = container.querySelector('rect');
      expect(rect).toBeInTheDocument();
      expect(rect).toHaveAttribute('x', '10');
      expect(rect).toHaveAttribute('y', '20');
      expect(rect).toHaveAttribute('width', '100');
      expect(rect).toHaveAttribute('height', '50');
      expect(rect).toHaveAttribute('fill', '#ff0000');
    });

    it('should render a rect with corner radius', () => {
      scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect', cornerRadius: [8, 8, 8, 8],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('rx', '8');
    });

    it('should render a circle shape', () => {
      scene = createScene({
        elements: [
          {
            id: 'e2', type: 'shape', layerId: 'l1',
            transform: { x: 50, y: 50, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#00ff00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'circle',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('cx', '90');
      expect(circle).toHaveAttribute('cy', '90');
      expect(circle).toHaveAttribute('r', '40');
    });

    it('should render an ellipse shape', () => {
      scene = createScene({
        elements: [
          {
            id: 'e3', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#00f', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'ellipse',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const ellipse = container.querySelector('ellipse');
      expect(ellipse).toBeInTheDocument();
      expect(ellipse).toHaveAttribute('cx', '100');
      expect(ellipse).toHaveAttribute('cy', '50');
      expect(ellipse).toHaveAttribute('rx', '100');
      expect(ellipse).toHaveAttribute('ry', '50');
    });

    it('should render a polygon shape', () => {
      scene = createScene({
        elements: [
          {
            id: 'e4', type: 'shape', layerId: 'l1',
            transform: { x: 10, y: 20, width: 100, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#ff0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'polygon',
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 80 },
              { x: 0, y: 80 },
            ],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const polygon = container.querySelector('polygon');
      expect(polygon).toBeInTheDocument();
      expect(polygon).toHaveAttribute('points', '0,0 100,0 100,80 0,80');
      expect(polygon).toHaveAttribute('transform', expect.stringContaining('translate(10, 20)'));
    });

    it('should render a path shape', () => {
      scene = createScene({
        elements: [
          {
            id: 'e5', type: 'shape', layerId: 'l1',
            transform: { x: 5, y: 10, width: 50, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f0f', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'path',
            pathCommands: 'M 0 0 L 50 0 L 50 30 L 0 30 Z',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', 'M 0 0 L 50 0 L 50 30 L 0 30 Z');
      expect(path).toHaveAttribute('transform', expect.stringContaining('translate(5, 10)'));
    });
  });

  describe('text rendering', () => {
    it('should render a text element', () => {
      scene = createScene({
        elements: [
          {
            id: 't1', type: 'text', layerId: 'l1',
            transform: { x: 10, y: 20, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#333', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 16, fontFamily: 'Arial', fontWeight: 'bold' },
            visible: true, locked: false, text: 'Hello World',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const text = container.querySelector('text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveAttribute('fill', '#333');
      expect(text).toHaveAttribute('font-size', '16');
      expect(text).toHaveAttribute('font-family', 'Arial');
      expect(text).toHaveAttribute('font-weight', 'bold');
      expect(text).toHaveTextContent('Hello World');
    });

    it('should apply text alignment (center)', () => {
      scene = createScene({
        elements: [
          {
            id: 't2', type: 'text', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 14, textAlign: 'center' },
            visible: true, locked: false, text: 'Centered',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const text = container.querySelector('text');
      expect(text).toHaveAttribute('text-anchor', 'middle');
      expect(text).toHaveAttribute('x', '50');
    });

    it('should apply text alignment (right)', () => {
      scene = createScene({
        elements: [
          {
            id: 't3', type: 'text', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 14, textAlign: 'right' },
            visible: true, locked: false, text: 'Right',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const text = container.querySelector('text');
      expect(text).toHaveAttribute('text-anchor', 'end');
      expect(text).toHaveAttribute('x', '100');
    });
  });

  describe('image rendering', () => {
    it('should render an image element', () => {
      scene = createScene({
        elements: [
          {
            id: 'img1', type: 'image', layerId: 'l1',
            transform: { x: 0, y: 0, width: 200, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: 'none', strokeWidth: 0, opacity: 1 },
            visible: true, locked: false, src: 'blob:test', originalWidth: 800, originalHeight: 600,
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const image = container.querySelector('image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('href', 'blob:test');
      expect(image).toHaveAttribute('width', '200');
      expect(image).toHaveAttribute('height', '150');
    });
  });

  describe('connector rendering', () => {
    it('should render a connector as a polyline', () => {
      scene = createScene({
        elements: [
          {
            id: 'c1', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#999', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 10, y: 10 },
            target: { x: 100, y: 200 },
            route: { type: 'straight', points: [] },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const polyline = container.querySelector('polyline');
      expect(polyline).toBeInTheDocument();
      expect(polyline).toHaveAttribute('points', '10,10 100,200');
      expect(polyline).toHaveAttribute('fill', 'none');
    });

    it('should render a connector with route points', () => {
      scene = createScene({
        elements: [
          {
            id: 'c2', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: {
              type: 'polyline',
              points: [
                { x: 50, y: 0 },
                { x: 100, y: 50 },
              ],
            },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const polyline = container.querySelector('polyline');
      expect(polyline).toHaveAttribute('points', '0,0 50,0 100,50 100,100');
    });
  });

  describe('visibility', () => {
    it('should not render hidden elements', () => {
      scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: false, locked: false, shapeKind: 'rect',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rect = container.querySelector('rect');
      expect(rect).toBeNull();
    });
  });

  describe('rotation', () => {
    it('should apply rotation transform to shape elements', () => {
      scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 50, rotation: 45, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('transform', expect.stringContaining('rotate(45, 50, 25)'));
    });

    it('should not add transform when rotation is 0 and scale is 1', () => {
      scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rect = container.querySelector('rect');
      expect(rect).not.toHaveAttribute('transform');
    });
  });

  describe('className prop', () => {
    it('should apply className to the SVG element', () => {
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} className="my-canvas" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('my-canvas');
    });
  });

  describe('element grouping by layer', () => {
    it('should assign elements to the correct layer group', () => {
      scene = createScene({
        layers: [
          { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
          { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
        ],
        elements: [
          {
            id: 'e1', type: 'text', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 12 },
            visible: true, locked: false, text: 'Layer1Text',
          },
          {
            id: 'e2', type: 'text', layerId: 'l2',
            transform: { x: 0, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 12 },
            visible: true, locked: false, text: 'Layer2Text',
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rootG = container.querySelector('svg > g')!;
      const l1Group = rootG.querySelector('[data-layer-name="Layer 1"]')!;
      const l2Group = rootG.querySelector('[data-layer-name="Layer 2"]')!;
      expect(l1Group.querySelector('text')).toHaveTextContent('Layer1Text');
      expect(l2Group.querySelector('text')).toHaveTextContent('Layer2Text');
    });
  });
});
