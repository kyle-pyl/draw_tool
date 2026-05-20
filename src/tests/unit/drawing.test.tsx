import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { CanvasView } from '../../canvas/CanvasView';
import { Viewport } from '../../canvas/viewport';
import type { SceneDocument } from '../../core/types';
import type { ElementInput } from '../../core/commands';

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

describe('CanvasView drawing', () => {
  let scene: SceneDocument;
  let viewport: Viewport;

  beforeEach(() => {
    scene = createScene();
    viewport = new Viewport();
  });

  it('shows crosshair cursor when rect tool is active', () => {
    const { container } = render(
      <CanvasView scene={scene} viewport={viewport} activeTool="rect" />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.style.cursor).toBe('crosshair');
  });

  it('shows crosshair cursor when circle tool is active', () => {
    const { container } = render(
      <CanvasView scene={scene} viewport={viewport} activeTool="circle" />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.style.cursor).toBe('crosshair');
  });

  it('shows crosshair cursor when polygon tool is active', () => {
    const { container } = render(
      <CanvasView scene={scene} viewport={viewport} activeTool="polygon" />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.style.cursor).toBe('crosshair');
  });

  it('shows default cursor when select tool is active', () => {
    const { container } = render(
      <CanvasView scene={scene} viewport={viewport} activeTool="select" />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.style.cursor).toBe('default');
  });

  it('renders rect preview during drag', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Mouse down to start drawing
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 200, clientY: 200 });
    });
    // Mouse move to update preview
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 300, clientY: 250 });
    });

    // Should contain a preview rectangle
    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    expect(previewGroup).not.toBeNull();
    const previewRect = previewGroup?.querySelector('rect');
    expect(previewRect).not.toBeNull();
    expect(previewRect?.getAttribute('stroke-dasharray')).toBe('5 3');
  });

  it('renders circle preview during drag', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="circle"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 200, clientY: 200 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 300, clientY: 300 });
    });

    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    const previewCircle = previewGroup?.querySelector('circle');
    expect(previewCircle).not.toBeNull();
  });

  it('renders ellipse preview during drag', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="ellipse"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 200, clientY: 200 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 300, clientY: 250 });
    });

    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    const previewEllipse = previewGroup?.querySelector('ellipse');
    expect(previewEllipse).not.toBeNull();
  });

  it('renders line preview during drag', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="line"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 300, clientY: 200 });
    });

    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    const previewLine = previewGroup?.querySelector('line');
    expect(previewLine).not.toBeNull();
  });

  it('calls onDrawComplete with rect shape on mouse up', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 200, clientY: 180 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 180 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    expect(input.type).toBe('shape');
    expect(input.shapeKind).toBe('rect');
    expect(input.layerId).toBe('l1');
    expect(input.transform.width).toBeGreaterThan(0);
    expect(input.transform.height).toBeGreaterThan(0);
  });

  it('calls onDrawComplete with circle shape on mouse up', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="circle"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 180, clientY: 180 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 180, clientY: 180 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    expect(input.type).toBe('shape');
    expect(input.shapeKind).toBe('circle');
    // Circle should have equal width and height
    expect(input.transform.width).toBe(input.transform.height);
  });

  it('calls onDrawComplete with ellipse shape on mouse up', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="ellipse"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 200, clientY: 160 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 160 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    expect(input.type).toBe('shape');
    expect(input.shapeKind).toBe('ellipse');
  });

  it('calls onDrawComplete with line shape on mouse up', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="line"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 50, clientY: 50 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 250, clientY: 150 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 250, clientY: 150 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    expect(input.type).toBe('shape');
    expect(input.shapeKind).toBe('path');
    expect(input.pathCommands).toBeDefined();
    expect(input.style?.fill).toBe('none');
  });

  it('stops preview after mouse up', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 180, clientY: 180 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 180, clientY: 180 });
    });

    // Preview should be gone after mouse up
    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    expect(previewGroup).toBeNull();
  });

  it('does not start drawing on element when rect tool active', async () => {
    const sceneWithEl = createScene({
      elements: [
        {
          id: 'e1',
          type: 'shape',
          shapeKind: 'rect',
          layerId: 'l1',
          transform: { x: 50, y: 50, width: 60, height: 40, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true,
          locked: false,
        },
      ],
    });

    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={sceneWithEl}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Click on the element's wrapper g[data-element-id] should not start drawing
    const elementGroup = svg.querySelector('[data-element-id="e1"]')!;
    await act(async () => {
      fireEvent.mouseDown(elementGroup, { button: 0, clientX: 80, clientY: 70 });
    });
    await act(async () => {
      fireEvent.mouseMove(elementGroup, { button: 0, clientX: 200, clientY: 200 });
    });
    await act(async () => {
      fireEvent.mouseUp(elementGroup, { button: 0, clientX: 200, clientY: 200 });
    });

    // Should not have completed a drawing since mousedown was on an element
    expect(onDrawComplete).not.toHaveBeenCalled();
  });

  it('starts drawing on background when rect tool active', async () => {
    const sceneWithEl = createScene({
      elements: [
        {
          id: 'e1',
          type: 'shape',
          shapeKind: 'rect',
          layerId: 'l1',
          transform: { x: 50, y: 50, width: 20, height: 20, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true,
          locked: false,
        },
      ],
    });

    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={sceneWithEl}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Click on background area (not on element) should start drawing
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 400, clientY: 400 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 500, clientY: 500 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 500, clientY: 500 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
  });

  it('adds polygon vertices on click', async () => {
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="polygon"
      />,
    );
    const svg = container.querySelector('svg')!;

    // First click adds first vertex
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 100, clientY: 100 });
    });

    // Move shows preview line from vertex to cursor
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 200, clientY: 150 });
    });

    // Should show a polyline preview with 1 vertex point
    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    expect(previewGroup).not.toBeNull();
    // Should have 1 circle (the vertex) and at least a line to cursor
    const circles = previewGroup?.querySelectorAll('circle');
    expect(circles?.length).toBe(1);
  });

  it('completes polygon on double click with 2+ vertices', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="polygon"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Add first vertex
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 100, clientY: 100 });
    });

    // Add second vertex
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 200, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 100 });
    });

    // Add third vertex
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 150, clientY: 200 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 150, clientY: 200 });
    });

    // Double click to complete
    await act(async () => {
      fireEvent.doubleClick(svg);
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    expect(input.type).toBe('shape');
    expect(input.shapeKind).toBe('polygon');
    expect(input.points).toBeDefined();
    expect(input.points!.length).toBe(3);
  });

  it('does not complete polygon with < 2 vertices on double click', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="polygon"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Add just 1 vertex
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 100, clientY: 100 });
    });

    // Double click should NOT complete
    await act(async () => {
      fireEvent.doubleClick(svg);
    });

    // 1 vertex is not enough - polygon needs at least 2 (line) but preferably 3
    expect(onDrawComplete).not.toHaveBeenCalled();
  });

  it('does not start marquee when drawing tool is active', async () => {
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 200, clientY: 200 });
    });

    // Should NOT have a marquee rectangle (blue dashed rect in screen space)
    const marqueeRects = svg.querySelectorAll('g ~ rect[stroke-dasharray="4 2"]');
    // The marquee has specific strokeDasharray, the drawing preview has "5 3"
    const marqueeStyle = Array.from(svg.querySelectorAll('rect')).find(
      (r) => r.getAttribute('stroke-dasharray') === '4 2',
    );
    expect(marqueeStyle).toBeUndefined();
  });

  it('does not call onDrawComplete when onDrawComplete prop is not provided', async () => {
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 200, clientY: 180 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 180 });
    });

    // Should not crash - just not call anything
  });

  it('only starts drawing on left button', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Right click should not start drawing
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 2, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 2, clientX: 200, clientY: 200 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 2, clientX: 200, clientY: 200 });
    });

    expect(onDrawComplete).not.toHaveBeenCalled();
  });

  it('polygon vertex click does not trigger on element', async () => {
    const sceneWithEl = createScene({
      elements: [
        {
          id: 'e1',
          type: 'shape',
          shapeKind: 'rect',
          layerId: 'l1',
          transform: { x: 50, y: 50, width: 60, height: 40, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true,
          locked: false,
        },
      ],
    });

    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={sceneWithEl}
        viewport={viewport}
        activeTool="polygon"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Click on the element's wrapper should NOT add a polygon vertex
    const elementGroup = svg.querySelector('[data-element-id="e1"]')!;
    await act(async () => {
      fireEvent.mouseDown(elementGroup, { button: 0, clientX: 80, clientY: 70 });
    });
    await act(async () => {
      fireEvent.mouseUp(elementGroup, { button: 0, clientX: 80, clientY: 70 });
    });

    // No polygon vertex should have been added, no onDrawComplete
    expect(onDrawComplete).not.toHaveBeenCalled();
    // Since polygon click only works on background, no vertex circle should be visible
    const circles = svg.querySelectorAll('g[pointer-events="none"] circle');
    expect(circles.length).toBe(0);
  });

  it('handles negative drag direction correctly', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="rect"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Drag from bottom-right to top-left
    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 300, clientY: 300 });
    });
    await act(async () => {
      fireEvent.mouseMove(svg, { button: 0, clientX: 100, clientY: 100 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 100, clientY: 100 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    // x should be the smaller coordinate
    expect(input.transform.x).toBeLessThan(300);
    expect(input.transform.y).toBeLessThan(300);
  });
});
