import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { CanvasView, type DrawingToolType } from '../../canvas/CanvasView';
import { Viewport } from '../../canvas/viewport';
import { SelectionManager } from '../../canvas/selection';
import type { SceneDocument, TextElement } from '../../core/types';
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

function createTextEl(id: string, text: string, x = 100, y = 100): TextElement {
  return {
    id,
    type: 'text',
    layerId: 'l1',
    text,
    transform: { x, y, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
    style: {
      fill: '#000000',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      opacity: 1,
    },
    visible: true,
    locked: false,
  };
}

describe('CanvasView text tool', () => {
  let scene: SceneDocument;
  let viewport: Viewport;

  beforeEach(() => {
    scene = createScene();
    viewport = new Viewport();
  });

  it('shows crosshair cursor when text tool is active', () => {
    const { container } = render(
      <CanvasView scene={scene} viewport={viewport} activeTool="text" />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.style.cursor).toBe('crosshair');
  });

  it('calls onDrawComplete on click with text tool', async () => {
    const onDrawComplete = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="text"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 200, clientY: 200 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 200, clientY: 200 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
    const input: ElementInput = onDrawComplete.mock.calls[0][0];
    expect(input.type).toBe('text');
    expect(input.text).toBe('');
    expect(input.layerId).toBe('l1');
    expect(input.style?.fontSize).toBe(16);
    expect(input.style?.fill).toBe('#000000');
  });

  it('creates text on canvas click even when clicking on existing element', async () => {
    const onDrawComplete = vi.fn();
    const textEl = createTextEl('t1', 'Existing');
    const sceneWithText = createScene({ elements: [textEl] });

    const { container } = render(
      <CanvasView
        scene={sceneWithText}
        viewport={viewport}
        activeTool="text"
        drawingLayerId="l1"
        onDrawComplete={onDrawComplete}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 250, clientY: 250 });
    });
    await act(async () => {
      fireEvent.mouseUp(svg, { button: 0, clientX: 250, clientY: 250 });
    });

    expect(onDrawComplete).toHaveBeenCalledTimes(1);
  });

  it('returns null preview for text tool', async () => {
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="text"
        drawingLayerId="l1"
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.mouseDown(svg, { button: 0, clientX: 200, clientY: 200 });
    });

    const previewGroup = svg.querySelector('g[transform] g[pointer-events="none"]');
    expect(previewGroup).not.toBeNull();
  });
});

describe('CanvasView text double-click editing', () => {
  let scene: SceneDocument;
  let viewport: Viewport;
  let selectionManager: SelectionManager;

  beforeEach(() => {
    scene = createScene({
      elements: [createTextEl('t1', 'Hello')],
    });
    viewport = new Viewport();
    selectionManager = new SelectionManager();
  });

  it('calls onTextEditRequest on double-clicking a text element', async () => {
    const onTextEditRequest = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="select"
        selectionManager={selectionManager}
        onTextEditRequest={onTextEditRequest}
      />,
    );

    const textGroup = container.querySelector('[data-element-id="t1"]');
    expect(textGroup).not.toBeNull();

    await act(async () => {
      fireEvent.doubleClick(textGroup!, { clientX: 150, clientY: 115 });
    });

    expect(onTextEditRequest).toHaveBeenCalledWith('t1');
  });

  it('does not call onTextEditRequest on double-clicking a non-text element', async () => {
    const onTextEditRequest = vi.fn();
    const sceneWithShape = createScene({
      elements: [
        createTextEl('t1', 'Text'),
        {
          id: 's1',
          type: 'shape',
          layerId: 'l1',
          shapeKind: 'rect',
          transform: { x: 10, y: 10, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true,
          locked: false,
        },
      ],
    });

    const { container } = render(
      <CanvasView
        scene={sceneWithShape}
        viewport={viewport}
        activeTool="select"
        selectionManager={selectionManager}
        onTextEditRequest={onTextEditRequest}
      />,
    );

    const shapeGroup = container.querySelector('[data-element-id="s1"]');
    expect(shapeGroup).not.toBeNull();

    await act(async () => {
      fireEvent.doubleClick(shapeGroup!, { clientX: 35, clientY: 35 });
    });

    expect(onTextEditRequest).not.toHaveBeenCalled();
  });

  it('does not call onTextEditRequest when editing in polygon mode', async () => {
    const onTextEditRequest = vi.fn();
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="polygon"
        selectionManager={selectionManager}
        onTextEditRequest={onTextEditRequest}
      />,
    );

    await act(async () => {
      fireEvent.mouseDown(container.querySelector('svg')!, { button: 0, clientX: 300, clientY: 300 });
    });

    expect(onTextEditRequest).not.toHaveBeenCalled();
  });

  it('does not call onTextEditRequest when no onTextEditRequest callback provided', async () => {
    const { container } = render(
      <CanvasView
        scene={scene}
        viewport={viewport}
        activeTool="select"
        selectionManager={selectionManager}
      />,
    );
    const svg = container.querySelector('svg')!;

    await act(async () => {
      fireEvent.doubleClick(svg, { clientX: 150, clientY: 115 });
    });

    // Should not throw
  });
});

describe('drawStateToInput for text', () => {
  it('generates correct text ElementInput', async () => {
    const mod = await import('../../canvas/CanvasView');
    const input = mod.drawStateToInput('text', { x1: 50, y1: 100, x2: 50, y2: 100, points: [] }, 'l1');
    expect(input.type).toBe('text');
    expect(input.text).toBe('');
    expect(input.transform.x).toBe(50);
    expect(input.transform.y).toBe(100);
    expect(input.transform.width).toBe(200);
    expect(input.transform.height).toBe(30);
    expect(input.style?.fontSize).toBe(16);
    expect(input.style?.fontFamily).toBe('Arial');
  });
});
