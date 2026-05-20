import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PropertyPanel } from '../../ui/PropertyPanel';
import type { PropertyPanelProps } from '../../ui/PropertyPanel';
import { SelectionManager } from '../../canvas/selection';
import type { SceneDocument, SceneElement, Layer } from '../../core/types';

function makeElement(
  id: string,
  type: 'shape' | 'text' | 'image' = 'shape',
  overrides: Partial<SceneElement> = {},
): SceneElement {
  const base = {
    id,
    type,
    layerId: 'l1',
    name: `Element ${id}`,
    transform: { x: 100, y: 200, width: 300, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
  };
  if (type === 'text') {
    return { ...base, type: 'text', text: 'Hello' } as unknown as SceneElement;
  }
  if (type === 'image') {
    return {
      ...base,
      type: 'image',
      src: 'blob:test',
      originalWidth: 800,
      originalHeight: 600,
    } as unknown as SceneElement;
  }
  return {
    ...base,
    type: 'shape',
    shapeKind: 'rect' as const,
    ...overrides,
  } as SceneElement;
}

function makeLayer(id: string, name: string, order: number): Layer {
  return { id, name, order, visible: true, locked: false };
}

function makeScene(elements: SceneElement[], layers: Layer[]): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: { units: 'px', background: '#ffffff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
    rules: {
      maxLayerCount: 10,
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
}

describe('PropertyPanel', () => {
  let selectionManager: SelectionManager;
  let onPropertyChange: ReturnType<typeof vi.fn>;
  let onLayerChange: ReturnType<typeof vi.fn>;
  let scene: SceneDocument;
  let layers: Layer[];

  beforeEach(() => {
    selectionManager = new SelectionManager();
    onPropertyChange = vi.fn();
    onLayerChange = vi.fn();
    layers = [makeLayer('l1', 'Layer 1', 1), makeLayer('l2', 'Layer 2', 2)];
    scene = makeScene([], layers);
  });

  function renderPanel(): ReturnType<typeof render> & { rerender: (ui: React.ReactElement) => void } {
    return render(
      <PropertyPanel
        scene={scene}
        selectionManager={selectionManager}
        onPropertyChange={onPropertyChange}
        onLayerChange={onLayerChange}
      />,
    );
  }

  it('renders nothing when no elements are selected', () => {
    const { container } = renderPanel();
    expect(container.querySelector('.property-panel')).toBeNull();
  });

  it('renders property panel when one element is selected', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.querySelector('.property-panel')).toBeInTheDocument();
  });

  it('shows element name in header for single selection', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const header = container.querySelector('.property-panel > div:first-child');
    expect(header?.textContent).toContain('Element e1');
  });

  it('shows selection count in header for multi selection', () => {
    const e1 = makeElement('e1', 'shape');
    const e2 = makeElement('e2', 'shape');
    scene = makeScene([e1, e2], layers);
    selectionManager.selectByIds(['e1', 'e2']);
    const { container } = renderPanel();
    const header = container.querySelector('.property-panel > div:first-child');
    expect(header?.textContent).toContain('2 elements selected');
  });

  it('dismisses and shows "Show Properties" button on close', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const closeBtn = container.querySelector('button[aria-label="Close property panel"]')!;
    fireEvent.click(closeBtn);
    expect(container.querySelector('.property-panel')).toBeNull();
    expect(container.textContent).toContain('Show Properties');
  });

  it('re-opens property panel when "Show Properties" is clicked', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    fireEvent.click(container.querySelector('button[aria-label="Close property panel"]')!);
    expect(container.querySelector('.property-panel')).toBeNull();
    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('.property-panel')).toBeInTheDocument();
  });

  it('shows position and size section', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).toContain('Position');
    expect(container.textContent).toContain('Size');
  });

  it('shows fill and stroke section', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).toContain('Fill');
    expect(container.textContent).toContain('Stroke');
  });

  it('shows layer section with current layer name', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).toContain('Layer 1');
  });

  it('shows visibility and lock section', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).toContain('Visible');
    expect(container.textContent).toContain('Locked');
  });

  it('shows text style section when text elements are selected', () => {
    const el = makeElement('e1', 'text');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).toContain('Text Style');
    expect(container.textContent).toContain('Font Size');
    expect(container.textContent).toContain('Font');
  });

  it('does not show text style section for non-text elements', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).not.toContain('Text Style');
  });

  it('calls onPropertyChange when X value is changed', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const xInput = container.querySelectorAll('input[type="number"]')[0];
    fireEvent.change(xInput, { target: { value: '150' } });
    expect(onPropertyChange).toHaveBeenCalledWith(['e1'], { transform: { x: 150 } });
  });

  it('calls onPropertyChange when fill color is changed', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const colorInputs = container.querySelectorAll('input[type="color"]');
    fireEvent.change(colorInputs[0], { target: { value: '#00ff00' } });
    expect(onPropertyChange).toHaveBeenCalledWith(['e1'], { style: { fill: '#00ff00' } });
  });

  it('calls onPropertyChange when opacity slider is changed', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const rangeInput = container.querySelector('input[type="range"]')!;
    fireEvent.change(rangeInput, { target: { value: '0.5' } });
    expect(onPropertyChange).toHaveBeenCalledWith(['e1'], { style: { opacity: 0.5 } });
  });

  it('calls onPropertyChange when visible checkbox is toggled', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const visCheckbox = container.querySelector('#prop-visible') as HTMLInputElement;
    fireEvent.click(visCheckbox);
    expect(onPropertyChange).toHaveBeenCalledWith(['e1'], { visible: false });
  });

  it('calls onPropertyChange when locked checkbox is toggled', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const lockCheckbox = container.querySelector('#prop-locked') as HTMLInputElement;
    fireEvent.click(lockCheckbox);
    expect(onPropertyChange).toHaveBeenCalledWith(['e1'], { locked: true });
  });

  it('calls onLayerChange when layer dropdown changes', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'l2' } });
    expect(onLayerChange).toHaveBeenCalledWith(['e1'], 'l2');
  });

  it('shows mixed state for X when multiple elements have different X values', () => {
    const e1 = makeElement('e1', 'shape', { transform: { x: 100, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } });
    const e2 = makeElement('e2', 'shape', { transform: { x: 200, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 } });
    scene = makeScene([e1, e2], layers);
    selectionManager.selectByIds(['e1', 'e2']);
    const { container } = renderPanel();
    expect(container.textContent).toContain('mixed');
  });

  it('calls onPropertyChange for all selected element IDs', () => {
    const e1 = makeElement('e1', 'shape');
    const e2 = makeElement('e2', 'shape');
    scene = makeScene([e1, e2], layers);
    selectionManager.selectByIds(['e1', 'e2']);
    const { container } = renderPanel();
    // Change fill color - both have same color so not mixed
    const colorInputs = container.querySelectorAll('input[type="color"]');
    fireEvent.change(colorInputs[0], { target: { value: '#00ff00' } });
    expect(onPropertyChange).toHaveBeenCalledWith(['e1', 'e2'], { style: { fill: '#00ff00' } });
  });

  it('sections can be collapsed and expanded', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const sectionHeaders = container.querySelectorAll('[style*="cursor: pointer"]');
    // Click the position section header
    const posHeader = Array.from(sectionHeaders).find(
      (h) => h.textContent?.includes('Position'),
    )!;
    fireEvent.click(posHeader);
    // After collapse, the X/Y/Width/Height inputs should be hidden
    // Section shows '+' when collapsed
    expect(posHeader.textContent).toContain('+');
    // Click again to expand
    fireEvent.click(posHeader);
    expect(posHeader.textContent).toContain('-');
  });

  it('does not show layer change option for same layer', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const select = container.querySelector('select')!;
    const options = select.querySelectorAll('option');
    // Should not include l1 in the move-to dropdown
    const optionValues = Array.from(options).map((o) => o.value);
    expect(optionValues).not.toContain('l1');
  });

  it('shows text style section with backgroundColor picker', () => {
    const el = makeElement('e1', 'text');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    expect(container.textContent).toContain('BG Color');
    expect(container.textContent).toContain('Border');
  });

  it('calls onPropertyChange with backgroundColor when text background changes', () => {
    const el = makeElement('e1', 'text');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const colorInputs = container.querySelectorAll('input[type="color"]');
    // First 2 are fill/stroke, next is BG color
    fireEvent.change(colorInputs[2], { target: { value: '#ffff00' } });
    expect(onPropertyChange).toHaveBeenCalledWith(['e1'], { backgroundColor: '#ffff00' });
  });

  it('shows width input with min value 1', () => {
    const el = makeElement('e1', 'shape');
    scene = makeScene([el], layers);
    selectionManager.select('e1');
    const { container } = renderPanel();
    const numInputs = container.querySelectorAll('input[type="number"]');
    // Find the width input (3rd number input: x, y, width, height, rotation)
    const widthInput = numInputs[2] as HTMLInputElement;
    expect(widthInput.min).toBe('1');
  });

  it('shows different layers text when multi-select has different layers', () => {
    const e1 = makeElement('e1', 'shape');
    const e2 = makeElement('e2', 'shape', { layerId: 'l2' });
    scene = makeScene([e1, e2], layers);
    selectionManager.selectByIds(['e1', 'e2']);
    const { container } = renderPanel();
    expect(container.textContent).toContain('different layers');
  });

  it('renders indeterminate checkbox when visible values are mixed', () => {
    const e1 = makeElement('e1', 'shape', { visible: true });
    const e2 = makeElement('e2', 'shape', { visible: false });
    scene = makeScene([e1, e2], layers);
    selectionManager.selectByIds(['e1', 'e2']);
    const { container } = renderPanel();
    const visCheckbox = container.querySelector('#prop-visible') as HTMLInputElement;
    expect(visCheckbox.indeterminate).toBe(true);
  });
});
