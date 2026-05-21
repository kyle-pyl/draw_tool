import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerPanel } from '../../ui/LayerPanel';
import type { SceneDocument, Layer } from '../../core/types';
import type { SelectionManager } from '../../canvas/selection';
import type { ConflictHighlighter } from '../../canvas/conflict';
import { CommandExecutor } from '../../core/commands';
import { useDocumentStore } from '../../core/store';

function makeScene(layers: Layer[]): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
    rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
    layers,
    elements: [
      { id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
      { id: 'e2', type: 'text', layerId: 'l1', text: 'Hi', transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 16 }, visible: true, locked: false },
      { id: 'e3', type: 'shape', layerId: 'l2', shapeKind: 'circle', transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#00f', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
    ],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

describe('LayerPanel', () => {
  let scene: SceneDocument;
  let selectionManager: SelectionManager;
  let conflictHighlighter: ConflictHighlighter;
  let executor: CommandExecutor;
  let forceUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useDocumentStore.setState({ scene: null, isDirty: false, zoom: 1, offsetX: 0, offsetY: 0, selectedIds: [], directoryHandle: null });

    scene = makeScene([
      { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
      { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
      { id: 'l3', name: 'Layer 3', order: 3, visible: false, locked: true },
    ]);

    selectionManager = {
      selectedIds: new Set(),
      select: vi.fn(),
      toggleSelect: vi.fn(),
      clearSelection: vi.fn(),
      selectAll: vi.fn(),
      selectByIds: vi.fn(),
      addToSelection: vi.fn(),
      removeFromSelection: vi.fn(),
      selectGroup: vi.fn(),
      selectGroupByName: vi.fn(),
      getGroupsForSelected: vi.fn().mockReturnValue([]),
      isSelected: vi.fn().mockReturnValue(false),
      getSelectedElements: vi.fn().mockReturnValue([]),
      count: 0,
    } as unknown as SelectionManager;

    conflictHighlighter = {
      conflictingElementIds: new Set(),
      conflictingLayerIds: new Set(),
      highlightConflict: vi.fn(),
      clearConflicts: vi.fn(),
      hasConflicts: vi.fn().mockReturnValue(false),
    } as unknown as ConflictHighlighter;

    executor = new CommandExecutor();
    forceUpdate = vi.fn();

    useDocumentStore.setState({ scene });
  });

  it('renders layer list', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    expect(screen.getByText('Layer 1')).toBeDefined();
    expect(screen.getByText('Layer 2')).toBeDefined();
    expect(screen.getByText('Layer 3')).toBeDefined();
  });

  it('displays layer count in header and footer', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    expect(screen.getByText('Layers')).toBeDefined();
    expect(screen.getByText('3 layers')).toBeDefined();
  });

  it('shows element count badges', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    const l1Els = scene.elements.filter((e) => e.layerId === 'l1');
    const l2Els = scene.elements.filter((e) => e.layerId === 'l2');
    expect(screen.getByText(String(l1Els.length))).toBeDefined();
    expect(screen.getByText(String(l2Els.length))).toBeDefined();
  });

  it('collapses and expands', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    fireEvent.click(screen.getByText('-'));
    expect(screen.getByText('Layers (3)')).toBeDefined();
    fireEvent.click(screen.getByText('Layers (3)'));
    expect(screen.getByText('Layer 1')).toBeDefined();
  });

  it('selects all elements in a layer on click', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    fireEvent.click(screen.getByText('Layer 1'));
    const expectedIds = scene.elements.filter((e) => e.layerId === 'l1' && e.visible && !e.locked).map((e) => e.id);
    expect(selectionManager.selectByIds).toHaveBeenCalledWith(expectedIds);
    expect(forceUpdate).toHaveBeenCalled();
  });

  it('toggles layer visibility', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    const visibilityBtns = screen.getAllByTitle('Hide layer');
    expect(visibilityBtns.length).toBeGreaterThan(0);
    fireEvent.click(visibilityBtns[0]);
    expect(forceUpdate).toHaveBeenCalled();
  });

  it('toggles layer lock', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    const lockBtns = screen.getAllByTitle('Lock layer');
    expect(lockBtns.length).toBeGreaterThan(0);
    fireEvent.click(lockBtns[0]);
    expect(forceUpdate).toHaveBeenCalled();
  });

  it('shows batch operations menu on click', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    const menuBtns = document.querySelectorAll('[title="Batch operations"]');
    expect(menuBtns.length).toBeGreaterThan(0);
    fireEvent.click(menuBtns[0]);
    expect(screen.getByText('Select All Elements')).toBeDefined();
    expect(screen.getByText('Set Fill Color...')).toBeDefined();
    expect(screen.getByText('Delete All Elements')).toBeDefined();
  });

  it('adds new layer', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    fireEvent.click(screen.getByText('+ Add Layer'));
    expect(forceUpdate).toHaveBeenCalled();
    const state = useDocumentStore.getState();
    expect(state.scene?.layers.length).toBe(4);
  });

  it('renders layer rename input on double click', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    fireEvent.dblClick(screen.getByText('Layer 1'));
    const inputs = document.querySelectorAll('input');
    const textInputs = Array.from(inputs).filter((i) => (i as HTMLInputElement).type === 'text' || !(i as HTMLInputElement).type);
    expect(textInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows unlock button for locked layers', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    const unlockBtns = screen.getAllByTitle('Unlock layer');
    expect(unlockBtns.length).toBeGreaterThan(0);
  });

  it('shows show layer button for hidden layers', () => {
    render(<LayerPanel scene={scene} selectionManager={selectionManager} conflictHighlighter={conflictHighlighter} executor={executor} forceUpdate={forceUpdate} />);
    const showBtns = screen.getAllByTitle('Show layer');
    expect(showBtns.length).toBeGreaterThan(0);
  });
});
