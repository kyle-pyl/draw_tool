import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { CanvasView } from '../../canvas/CanvasView';
import { Viewport } from '../../canvas/viewport';
import { SelectionManager } from '../../canvas/selection';
import { ConflictHighlighter } from '../../canvas/conflict';
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

    it('should render hidden layers with visibility:hidden to preserve space', () => {
      scene = createScene({
        layers: [
          { id: 'l1', name: 'Visible', order: 1, visible: true, locked: false },
          { id: 'l2', name: 'Hidden', order: 2, visible: false, locked: false },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rootG = container.querySelector('svg > g')!;
      const layerGroups = Array.from(rootG.children);
      expect(layerGroups.length).toBe(2);
      expect(layerGroups[0].getAttribute('data-layer-name')).toBe('Visible');
      expect(layerGroups[1].getAttribute('data-layer-name')).toBe('Hidden');
      expect((layerGroups[1] as HTMLElement).style.visibility).toBe('hidden');
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
      const line = container.querySelector('line');
      expect(line).toBeInTheDocument();
      expect(line).toHaveAttribute('x1', '10');
      expect(line).toHaveAttribute('y1', '10');
      expect(line).toHaveAttribute('x2', '100');
      expect(line).toHaveAttribute('y2', '200');
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

    it('should render a connector with straight route as line element', () => {
      scene = createScene({
        elements: [
          {
            id: 'c3', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.8 },
            visible: true, locked: false,
            source: { x: 50, y: 80 },
            target: { x: 300, y: 150 },
            route: { type: 'straight', points: [] },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const line = container.querySelector('line');
      expect(line).toBeInTheDocument();
      expect(line).toHaveAttribute('x1', '50');
      expect(line).toHaveAttribute('y1', '80');
      expect(line).toHaveAttribute('x2', '300');
      expect(line).toHaveAttribute('y2', '150');
      expect(line).toHaveAttribute('stroke', '#333');
      expect(line).toHaveAttribute('stroke-width', '2');
      expect(line).toHaveAttribute('stroke-dasharray', '5,5');
      expect(line).toHaveAttribute('opacity', '0.8');
    });

    it('should render connector with empty route points as straight line', () => {
      scene = createScene({
        elements: [
          {
            id: 'c4', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false,
            source: { x: 5, y: 5 },
            target: { x: 95, y: 95 },
            route: { type: 'straight', points: [] },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const line = container.querySelector('line');
      expect(line).toHaveAttribute('x1', '5');
      expect(line).toHaveAttribute('y1', '5');
      expect(line).toHaveAttribute('x2', '95');
      expect(line).toHaveAttribute('y2', '95');
    });
  });

  describe('connector arrows', () => {
    it('should render arrow marker definitions in defs', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca1', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            arrowEnd: { type: 'triangle', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();
      const marker = defs!.querySelector('marker');
      expect(marker).toBeInTheDocument();
      expect(marker).toHaveAttribute('id', expect.stringContaining('triangle'));
    });

    it('should apply marker-end when arrowEnd is set', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca2', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            arrowEnd: { type: 'triangle', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const line = container.querySelector('line');
      expect(line).toHaveAttribute('marker-end', expect.stringContaining('url(#end-triangle'));
    });

    it('should apply marker-start when arrowStart is set', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca3', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            arrowStart: { type: 'diamond', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const line = container.querySelector('line');
      expect(line).toHaveAttribute('marker-start', expect.stringContaining('url(#start-diamond'));
    });

    it('should not apply markers when arrow type is none', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca4', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            arrowStart: { type: 'none', size: 1 },
            arrowEnd: { type: 'none', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const line = container.querySelector('line');
      expect(line).not.toHaveAttribute('marker-start');
      expect(line).not.toHaveAttribute('marker-end');
    });

    it('should render open triangle arrow marker', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca5', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            arrowEnd: { type: 'openTriangle', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const defs = container.querySelector('defs');
      const marker = defs!.querySelector('marker');
      expect(marker).toHaveAttribute('id', expect.stringContaining('openTriangle'));
    });

    it('should render circle arrow marker', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca6', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            arrowEnd: { type: 'circle', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const defs = container.querySelector('defs');
      const marker = defs!.querySelector('marker');
      expect(marker).toHaveAttribute('id', expect.stringContaining('circle'));
    });

    it('should apply markers on polyline connectors', () => {
      scene = createScene({
        elements: [
          {
            id: 'ca7', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'polyline', points: [{ x: 50, y: 50 }] },
            arrowEnd: { type: 'triangle', size: 1 },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const polyline = container.querySelector('polyline');
      expect(polyline).toHaveAttribute('marker-end', expect.stringContaining('url(#end-triangle'));
    });
  });

  describe('connector labels', () => {
    it('should render labels on connector at midpoint', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl1', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            labels: [{ text: 'Hello', position: 0.5, offset: { dx: 0, dy: -10 } }],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const textEls = container.querySelectorAll('text');
      const labelText = Array.from(textEls).find(
        (t) => t.textContent === 'Hello',
      );
      expect(labelText).toBeInTheDocument();
    });

    it('should render multiple labels', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl2', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            labels: [
              { text: 'Start', position: 0.1, offset: { dx: 0, dy: 0 } },
              { text: 'End', position: 0.9, offset: { dx: 0, dy: 0 } },
            ],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const textEls = container.querySelectorAll('text');
      const labels = Array.from(textEls).map((t) => t.textContent);
      expect(labels).toContain('Start');
      expect(labels).toContain('End');
    });

    it('should place label at correct position on straight line', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl3', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 200, y: 200 },
            route: { type: 'straight', points: [] },
            labels: [{ text: 'Mid', position: 0.5, offset: { dx: 0, dy: 0 } }],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const textEls = container.querySelectorAll('text');
      const labelText = Array.from(textEls).find((t) => t.textContent === 'Mid');
      expect(labelText).toBeInTheDocument();
      // At midpoint (0.5), x should be 100, y should be 100 (midpoint of 0,0 -> 200,200)
      expect(labelText).toHaveAttribute('x', '100');
      expect(labelText).toHaveAttribute('y', '100');
    });

    it('should apply label offset', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl4', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 0 },
            route: { type: 'straight', points: [] },
            labels: [{ text: 'Above', position: 0.5, offset: { dx: 5, dy: -15 } }],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const textEls = container.querySelectorAll('text');
      const labelText = Array.from(textEls).find((t) => t.textContent === 'Above');
      expect(labelText).toBeInTheDocument();
      // Source: 0,0 -> Target: 100,0. Midpoint: 50,0. Offset: dx=5, dy=-15 => 55,-15
      expect(labelText).toHaveAttribute('x', '55');
      expect(labelText).toHaveAttribute('y', '-15');
    });

    it('should position labels on polyline connectors', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl5', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'polyline', points: [{ x: 100, y: 0 }] },
            labels: [{ text: 'OnPath', position: 0.5, offset: { dx: 0, dy: 0 } }],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const textEls = container.querySelectorAll('text');
      const labelText = Array.from(textEls).find((t) => t.textContent === 'OnPath');
      expect(labelText).toBeInTheDocument();
      // Path: source(0,0) -> waypoint(100,0) -> target(100,100)
      // Segment 1 length: 100; Segment 2 length: 100; Total: 200
      // t=0.5 => 100 distance => end of segment 1 => (100,0)
      expect(labelText).toHaveAttribute('x', '100');
      expect(labelText).toHaveAttribute('y', '0');
    });

    it('should not crash when connector has no labels', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl6', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const line = container.querySelector('line');
      expect(line).toBeInTheDocument();
    });

    it('should use default font from connector style', () => {
      scene = createScene({
        elements: [
          {
            id: 'cl7', type: 'connector', layerId: 'l1',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1, fontSize: 14, fontFamily: 'Courier', fontWeight: 'bold' },
            visible: true, locked: false,
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            route: { type: 'straight', points: [] },
            labels: [{ text: 'Styled', position: 0.5, offset: { dx: 0, dy: 0 } }],
          },
        ],
      });

      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const textEls = container.querySelectorAll('text');
      const labelText = Array.from(textEls).find((t) => t.textContent === 'Styled');
      expect(labelText).toBeInTheDocument();
      expect(labelText).toHaveAttribute('font-size', '14');
      expect(labelText).toHaveAttribute('font-family', 'Courier');
      expect(labelText).toHaveAttribute('font-weight', 'bold');
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

  describe('interaction: zoom', () => {
    it('should zoom in on wheel up (deltaY < 0)', () => {
      const vp = new Viewport({ initialZoom: 1 });
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={vp} onViewportChange={onChange} />
      );
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      fireEvent.wheel(svg, { deltaY: -100, clientX: 400, clientY: 300 });
      expect(vp.zoom).toBeGreaterThan(1);
      expect(onChange).toHaveBeenCalled();
    });

    it('should zoom out on wheel down (deltaY > 0)', () => {
      const vp = new Viewport({ initialZoom: 1 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      fireEvent.wheel(svg, { deltaY: 100, clientX: 400, clientY: 300 });
      expect(vp.zoom).toBeLessThan(1);
    });

    it('should zoom centered on mouse position', () => {
      const vp = new Viewport({ initialZoom: 1, initialOffsetX: 0, initialOffsetY: 0 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      fireEvent.wheel(svg, { deltaY: -100, clientX: 400, clientY: 300 });
      const canvasCoords = vp.screenToCanvas(400, 300);
      expect(canvasCoords.x).toBeCloseTo(400, 0);
      expect(canvasCoords.y).toBeCloseTo(300, 0);
    });

    it('should not zoom beyond minZoom', () => {
      const vp = new Viewport({ initialZoom: 0.1, minZoom: 0.1 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      fireEvent.wheel(svg, { deltaY: 100, clientX: 400, clientY: 300 });
      expect(vp.zoom).toBe(0.1);
    });

    it('should not zoom beyond maxZoom', () => {
      const vp = new Viewport({ initialZoom: 10, maxZoom: 10 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      fireEvent.wheel(svg, { deltaY: -100, clientX: 400, clientY: 300 });
      expect(vp.zoom).toBe(10);
    });
  });

  describe('interaction: pan', () => {
    it('should pan on middle mouse button drag', () => {
      const vp = new Viewport({ initialZoom: 1, initialOffsetX: 0, initialOffsetY: 0 });
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={vp} onViewportChange={onChange} />
      );
      const svg = container.querySelector('svg')!;

      fireEvent.mouseDown(svg, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 130 });
      fireEvent.mouseUp(svg, { button: 1, clientX: 150, clientY: 130 });

      expect(vp.offsetX).toBe(50);
      expect(vp.offsetY).toBe(30);
      expect(onChange).toHaveBeenCalled();
    });

    it('should not pan on left click without space', () => {
      const vp = new Viewport({ initialZoom: 1, initialOffsetX: 0, initialOffsetY: 0 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 130 });
      fireEvent.mouseUp(svg, { button: 0, clientX: 150, clientY: 130 });

      expect(vp.offsetX).toBe(0);
      expect(vp.offsetY).toBe(0);
    });

    it('should pan on left click with space pressed', () => {
      const vp = new Viewport({ initialZoom: 1, initialOffsetX: 0, initialOffsetY: 0 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      fireEvent.keyDown(window, { code: 'Space' });
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 200, clientY: 250 });
      fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 250 });

      expect(vp.offsetX).toBe(100);
      expect(vp.offsetY).toBe(150);
    });

    it('should stop panning on mouse leave', () => {
      const vp = new Viewport({ initialZoom: 1, initialOffsetX: 0, initialOffsetY: 0 });
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      fireEvent.mouseDown(svg, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 130 });
      fireEvent.mouseLeave(svg);
      fireEvent.mouseMove(svg, { clientX: 200, clientY: 200 });

      expect(vp.offsetX).toBe(50);
      expect(vp.offsetY).toBe(30);
    });
  });

  describe('interaction: cursor styles', () => {
    it('should have default cursor by default', () => {
      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const svg = container.querySelector('svg')!;
      expect(svg.style.cursor).toBe('default');
    });

    it('should show grab cursor when space is pressed', () => {
      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const svg = container.querySelector('svg')!;

      fireEvent.keyDown(window, { code: 'Space' });
      expect(svg.style.cursor).toBe('grab');
    });

    it('should show grabbing cursor when panning', () => {
      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const svg = container.querySelector('svg')!;

      fireEvent.mouseDown(svg, { button: 1, clientX: 100, clientY: 100 });
      expect(svg.style.cursor).toBe('grabbing');
    });
  });

  describe('interaction: element selection', () => {
    let selectionManager: SelectionManager;

    beforeEach(() => {
      selectionManager = new SelectionManager();
    });

    function sceneWithRect() {
      return createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1', name: 'rect1',
            transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#ff0000', stroke: '#000', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
    }

    function sceneWithTwoRects() {
      return createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1', name: 'rect1',
            transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#ff0000', stroke: '#000', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l1', name: 'rect2',
            transform: { x: 150, y: 20, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#00ff00', stroke: '#000', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
    }

    it('should select an element on click', () => {
      const scene = sceneWithRect();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const rectG = container.querySelector('[data-element-id="e1"]')!;
      fireEvent.click(rectG);
      expect(selectionManager.isSelected('e1')).toBe(true);
    });

    it('should clear previous selection when clicking a different element', () => {
      const scene = sceneWithTwoRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      expect(selectionManager.isSelected('e1')).toBe(true);
      fireEvent.click(container.querySelector('[data-element-id="e2"]')!);
      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should toggle selection on shift+click', () => {
      const scene = sceneWithTwoRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      fireEvent.click(container.querySelector('[data-element-id="e2"]')!, { shiftKey: true });
      expect(selectionManager.isSelected('e1')).toBe(true);
      expect(selectionManager.isSelected('e2')).toBe(true);
      expect(selectionManager.count).toBe(2);
    });

    it('should remove from selection on shift+click already selected element', () => {
      const scene = sceneWithTwoRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      fireEvent.click(container.querySelector('[data-element-id="e2"]')!, { shiftKey: true });
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!, { shiftKey: true });
      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(true);
      expect(selectionManager.count).toBe(1);
    });

    it('should clear selection on SVG background click', () => {
      const scene = sceneWithRect();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      expect(selectionManager.isSelected('e1')).toBe(true);
      const svg = container.querySelector('svg')!;
      fireEvent.click(svg);
      expect(selectionManager.count).toBe(0);
    });

    it('should render selection bounding box for selected element', () => {
      selectionManager.select('e1');
      const scene = sceneWithRect();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const overlay = container.querySelector('.selection-overlay');
      expect(overlay).toBeInTheDocument();
      const bboxRect = overlay!.querySelector('rect');
      expect(bboxRect).toBeInTheDocument();
      expect(bboxRect).toHaveAttribute('stroke', '#2196F3');
    });

    it('should not render selection overlay when nothing selected', () => {
      const scene = sceneWithRect();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      expect(container.querySelector('.selection-overlay')).toBeNull();
    });

    it('should call onSelectionChange on element click', () => {
      const scene = sceneWithRect();
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} onSelectionChange={onChange} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectionChange on background click', () => {
      const scene = sceneWithRect();
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} onSelectionChange={onChange} />
      );
      const svg = container.querySelector('svg')!;
      fireEvent.click(svg);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should not select elements in locked layers', () => {
      const scene = createScene({
        layers: [
          { id: 'l1', name: 'Locked Layer', order: 1, visible: true, locked: true },
          { id: 'l2', name: 'Unlocked Layer', order: 2, visible: true, locked: false },
        ],
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l2',
            transform: { x: 0, y: 60, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      fireEvent.click(container.querySelector('[data-element-id="e2"]')!);
      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should not select locked elements', () => {
      const scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: true, shapeKind: 'rect',
          },
        ],
      });
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      fireEvent.click(container.querySelector('[data-element-id="e1"]')!);
      expect(selectionManager.isSelected('e1')).toBe(false);
    });

    it('should render 8 handles for selected element', () => {
      selectionManager.select('e1');
      const scene = sceneWithRect();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const overlay = container.querySelector('.selection-overlay')!;
      const handleRects = overlay.querySelectorAll('rect');
      expect(handleRects.length).toBe(9);
    });

    it('should not throw when selectionManager is not provided', () => {
      const scene = sceneWithRect();
      const { container } = render(<CanvasView scene={scene} viewport={viewport} />);
      const rectG = container.querySelector('[data-element-id="e1"]')!;
      expect(() => fireEvent.click(rectG)).not.toThrow();
    });
  });

  describe('interaction: marquee selection', () => {
    let selectionManager: SelectionManager;

    beforeEach(() => {
      selectionManager = new SelectionManager();
    });

    function sceneWithRects() {
      return createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1', name: 'rect1',
            transform: { x: 10, y: 10, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l1', name: 'rect2',
            transform: { x: 200, y: 10, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
    }

    function mockSVGBounds(svg: Element) {
      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });
    }

    it('should select elements fully inside marquee', () => {
      const scene = sceneWithRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 150, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 150, clientY: 100 });
      });

      expect(selectionManager.isSelected('e1')).toBe(true);
      expect(selectionManager.isSelected('e2')).toBe(false);
    });

    it('should select multiple elements inside marquee', () => {
      const scene = sceneWithRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 300, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 300, clientY: 100 });
      });

      expect(selectionManager.isSelected('e1')).toBe(true);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should add to selection on shift+marquee', () => {
      const scene = sceneWithRects();
      selectionManager.select('e1');
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0, shiftKey: true });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 300, clientY: 100, shiftKey: true });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 300, clientY: 100, shiftKey: true });
      });

      expect(selectionManager.count).toBe(2);
      expect(selectionManager.isSelected('e1')).toBe(true);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should not select partially outside elements', () => {
      const scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 80, clientY: 80 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 120, clientY: 120 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 120, clientY: 120 });
      });

      expect(selectionManager.count).toBe(0);
    });

    it('should render marquee rectangle during drag', () => {
      const scene = sceneWithRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 10, clientY: 20 });
      });

      // After mousedown, marquee should be rendered (0-area at start)
      const marqueeRect = svg.querySelector('rect[stroke="#2196F3"]');
      // The marquee rect has stroke #2196F3; bounding box rects also have #2196F3 but are inside .selection-overlay
      // We need to find the marquee not inside .selection-overlay
      const marqueeEl = Array.from(svg.querySelectorAll('rect[stroke="#2196F3"]')).find(
        (r) => !r.closest('.selection-overlay')
      );
      expect(marqueeEl).toBeInTheDocument();
      expect(marqueeEl).toHaveAttribute('fill', 'rgba(33, 150, 243, 0.1)');
      expect(marqueeEl).toHaveAttribute('stroke-dasharray', '4 2');
    });

    it('should not start marquee on element click', () => {
      const scene = sceneWithRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      const elementWrapper = container.querySelector('[data-element-id="e1"]')!;

      act(() => {
        fireEvent.mouseDown(elementWrapper, { button: 0, clientX: 50, clientY: 30 });
      });
      // mouseMove on element wrapper should not create marquee
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 100 });
      });

      // Selection should come from element click, not marquee
      // The marquee should not have been created, so no marquee-based selection
      // The selectionmanager should have only 'e1' from the click or no selection if click didn't fire
      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(false);
    });

    it('should not start marquee during panning', () => {
      const scene = sceneWithRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      fireEvent.keyDown(window, { code: 'Space' });

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 10, clientY: 10 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 100 });
      });

      expect(selectionManager.count).toBe(0);
    });

    it('should not select locked elements', () => {
      const scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 10, y: 10, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: true, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l1',
            transform: { x: 200, y: 10, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 300, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 300, clientY: 100 });
      });

      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should not select elements in locked layers via marquee', () => {
      const scene = createScene({
        layers: [
          { id: 'l1', name: 'Locked', order: 1, visible: true, locked: true },
          { id: 'l2', name: 'Unlocked', order: 2, visible: true, locked: false },
        ],
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 10, y: 10, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l2',
            transform: { x: 200, y: 10, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 300, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 300, clientY: 100 });
      });

      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should not select hidden elements', () => {
      const scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 10, y: 10, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: false, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l1',
            transform: { x: 200, y: 10, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 300, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 300, clientY: 100 });
      });

      expect(selectionManager.isSelected('e1')).toBe(false);
      expect(selectionManager.isSelected('e2')).toBe(true);
    });

    it('should work correctly with zoomed viewport', () => {
      const vp = new Viewport({ initialZoom: 2, initialOffsetX: 0, initialOffsetY: 0 });
      const scene = sceneWithRects();
      const { container } = render(
        <CanvasView scene={scene} viewport={vp} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      // With zoom=2: screen(20,20) → canvas(10,10)
      // e1 bbox (10,10)-(110,60) would be screen (20,20)-(220,120)
      // Marquee from screen(0,0) to screen(150,100) → canvas(0,0) to (75,50)
      // e1: y=10≥0 ✓, right=110>75 ✗ → NOT CONTAINED
      // To select e1 at zoom 2: need marquee that covers screen(canvas * 2)
      // e1 canvas: (10,10)-(110,60). Screen: (20,20)-(220,120).
      // Marquee screen(0,0) to screen(250,130) → canvas(0,0) to (125,65)
      // e1: right=110≤125 ✓ → CONTAINED
      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 250, clientY: 130 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 250, clientY: 130 });
      });

      expect(selectionManager.isSelected('e1')).toBe(true);
      expect(selectionManager.isSelected('e2')).toBe(false);
    });

    it('should call onSelectionChange after marquee', () => {
      const scene = sceneWithRects();
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} onSelectionChange={onChange} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 0, clientY: 0 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 300, clientY: 100 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 300, clientY: 100 });
      });

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should clear selection on small drag (treated as click)', () => {
      const scene = sceneWithRects();
      selectionManager.select('e1');
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} selectionManager={selectionManager} />
      );
      const svg = container.querySelector('svg')!;
      mockSVGBounds(svg);

      act(() => {
        fireEvent.mouseDown(svg, { button: 0, clientX: 500, clientY: 400 });
      });
      act(() => {
        fireEvent.mouseMove(svg, { clientX: 502, clientY: 401 });
      });
      act(() => {
        fireEvent.mouseUp(svg, { button: 0, clientX: 502, clientY: 401 });
      });
      fireEvent.click(svg);

      expect(selectionManager.count).toBe(0);
    });
  });

  describe('interaction: onViewportChange', () => {
    it('should call onViewportChange on zoom', () => {
      const vp = new Viewport();
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={vp} onViewportChange={onChange} />
      );
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      fireEvent.wheel(svg, { deltaY: -100, clientX: 400, clientY: 300 });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onViewportChange on pan', () => {
      const vp = new Viewport();
      const onChange = vi.fn();
      const { container } = render(
        <CanvasView scene={scene} viewport={vp} onViewportChange={onChange} />
      );
      const svg = container.querySelector('svg')!;

      fireEvent.mouseDown(svg, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 130 });
      expect(onChange).toHaveBeenCalled();
    });

    it('should not throw when onViewportChange is not provided', () => {
      const vp = new Viewport();
      const { container } = render(<CanvasView scene={scene} viewport={vp} />);
      const svg = container.querySelector('svg')!;

      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
        configurable: true,
      });

      expect(() => fireEvent.wheel(svg, { deltaY: -100, clientX: 400, clientY: 300 })).not.toThrow();
    });
  });

  describe('conflict overlay rendering', () => {
    let conflictHighlighter: ConflictHighlighter;

    beforeEach(() => {
      conflictHighlighter = new ConflictHighlighter();
    });

    function sceneWithOverlappingElements(): SceneDocument {
      return createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1', name: 'Element A',
            transform: { x: 10, y: 10, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l1', name: 'Element B',
            transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
    }

    it('renders no conflict overlay when no conflicts', () => {
      const scene = sceneWithOverlappingElements();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      expect(container.querySelector('.conflict-overlay')).toBeNull();
    });

    it('renders conflict overlay with red dashed bounding boxes', () => {
      const scene = sceneWithOverlappingElements();
      conflictHighlighter.setCollisions(
        [{ elementA: 'e1', elementB: 'e2', overlapBBox: { x: 50, y: 50, width: 50, height: 50 } }],
        scene.elements,
        scene.layers
      );

      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      const overlay = container.querySelector('.conflict-overlay');
      expect(overlay).toBeInTheDocument();

      const dashedRects = overlay!.querySelectorAll('rect[stroke="#F44336"]');
      expect(dashedRects.length).toBe(2);
    });

    it('renders overlap area with red fill', () => {
      const scene = sceneWithOverlappingElements();
      conflictHighlighter.setCollisions(
        [{ elementA: 'e1', elementB: 'e2', overlapBBox: { x: 50, y: 50, width: 50, height: 50 } }],
        scene.elements,
        scene.layers
      );

      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      const overlay = container.querySelector('.conflict-overlay')!;
      const overlapRect = overlay.querySelector('rect[stroke="none"]');
      expect(overlapRect).toBeInTheDocument();
      expect(overlapRect).toHaveAttribute('fill', 'rgba(244, 67, 54, 0.15)');
    });

    it('conflict overlay has pointerEvents none', () => {
      const scene = sceneWithOverlappingElements();
      conflictHighlighter.setCollisions(
        [{ elementA: 'e1', elementB: 'e2', overlapBBox: { x: 50, y: 50, width: 50, height: 50 } }],
        scene.elements,
        scene.layers
      );

      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      const overlay = container.querySelector('.conflict-overlay')!;
      expect(overlay).toHaveAttribute('pointer-events', 'none');
    });

    it('renders conflict bboxes at correct screen positions', () => {
      const vp = new Viewport({ initialZoom: 2, initialOffsetX: 0, initialOffsetY: 0 });
      const scene = sceneWithOverlappingElements();
      conflictHighlighter.setCollisions(
        [{ elementA: 'e1', elementB: 'e2', overlapBBox: { x: 50, y: 50, width: 50, height: 50 } }],
        scene.elements,
        scene.layers
      );

      const { container } = render(
        <CanvasView scene={scene} viewport={vp} conflictHighlighter={conflictHighlighter} />
      );
      const overlay = container.querySelector('.conflict-overlay')!;
      const overlapRect = overlay.querySelectorAll('rect')[2];
      expect(Number(overlapRect.getAttribute('x'))).toBeCloseTo(100, 0);
      expect(Number(overlapRect.getAttribute('y'))).toBeCloseTo(100, 0);
      expect(Number(overlapRect.getAttribute('width'))).toBeCloseTo(100, 0);
      expect(Number(overlapRect.getAttribute('height'))).toBeCloseTo(100, 0);
    });

    it('conflict overlay updates when conflicts are cleared', () => {
      const scene = sceneWithOverlappingElements();
      conflictHighlighter.setCollisions(
        [{ elementA: 'e1', elementB: 'e2', overlapBBox: { x: 50, y: 50, width: 50, height: 50 } }],
        scene.elements,
        scene.layers
      );

      const { container, rerender } = render(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      expect(container.querySelector('.conflict-overlay')).toBeInTheDocument();

      conflictHighlighter.clearCollisions();
      rerender(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      expect(container.querySelector('.conflict-overlay')).toBeNull();
    });

    it('does not render conflict overlay when conflictHighlighter not provided', () => {
      const scene = sceneWithOverlappingElements();
      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} />
      );
      expect(container.querySelector('.conflict-overlay')).toBeNull();
    });

    it('renders multiple conflict pairs correctly', () => {
      const scene = createScene({
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1', name: 'A',
            transform: { x: 0, y: 0, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'shape', layerId: 'l1', name: 'B',
            transform: { x: 30, y: 30, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e3', type: 'shape', layerId: 'l2', name: 'C',
            transform: { x: 0, y: 100, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#00f', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e4', type: 'shape', layerId: 'l2', name: 'D',
            transform: { x: 30, y: 130, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#ff0', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
        ],
      });
      conflictHighlighter.setCollisions(
        [
          { elementA: 'e1', elementB: 'e2', overlapBBox: { x: 30, y: 30, width: 30, height: 30 } },
          { elementA: 'e3', elementB: 'e4', overlapBBox: { x: 30, y: 130, width: 30, height: 30 } },
        ],
        scene.elements,
        scene.layers
      );

      const { container } = render(
        <CanvasView scene={scene} viewport={viewport} conflictHighlighter={conflictHighlighter} />
      );
      const overlay = container.querySelector('.conflict-overlay')!;
      const dashedRects = overlay.querySelectorAll('rect[stroke="#F44336"]');
      expect(dashedRects.length).toBe(4);
      const overlapRects = overlay.querySelectorAll('rect[stroke="none"]');
      expect(overlapRects.length).toBe(2);
    });
  });
});
