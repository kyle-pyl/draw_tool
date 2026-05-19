import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { ConflictPanel } from '../../ui/ConflictPanel';
import { ConflictHighlighter } from '../../canvas/conflict';
import type { SceneElement, Layer } from '../../core/types';
import type { CollisionEntry } from '../../core/collision';

function makeElement(id: string, layerId: string, name: string): SceneElement {
  return {
    id,
    type: 'shape',
    shapeKind: 'rect',
    layerId,
    name,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeCollisionEntry(a: string, b: string): CollisionEntry {
  return {
    elementA: a,
    elementB: b,
    overlapBBox: { x: 50, y: 50, width: 50, height: 50 },
  };
}

describe('ConflictPanel', () => {
  let highlighter: ConflictHighlighter;
  let elements: SceneElement[];
  let layers: Layer[];

  beforeEach(() => {
    highlighter = new ConflictHighlighter();
    elements = [
      makeElement('e1', 'l1', 'Element A'),
      makeElement('e2', 'l1', 'Element B'),
    ];
    layers = [
      { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
    ];
  });

  it('renders nothing when no conflicts', () => {
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    expect(container.querySelector('.conflict-panel')).toBeNull();
  });

  it('renders conflict panel when conflicts exist', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    const panel = container.querySelector('.conflict-panel');
    expect(panel).toBeInTheDocument();
  });

  it('shows conflict count in header', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    const header = container.querySelector('.conflict-panel > div:first-child');
    expect(header).toHaveTextContent('Layer Conflict (1)');
  });

  it('shows element names in conflict item', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    expect(container.textContent).toContain('Element A');
    expect(container.textContent).toContain('Element B');
  });

  it('shows layer name in conflict item', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    expect(container.textContent).toContain('Layer 1');
  });

  it('shows suggestion text', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Move');
  });

  it('dismisses when close button clicked', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    const closeBtn = container.querySelector('button[aria-label="Close conflict panel"]')!;
    fireEvent.click(closeBtn);
    expect(container.querySelector('.conflict-panel')).toBeNull();
  });

  it('re-appears when new conflicts set after dismiss', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    fireEvent.click(container.querySelector('button[aria-label="Close conflict panel"]')!);
    expect(container.querySelector('.conflict-panel')).toBeNull();

    act(() => {
      highlighter.clearCollisions();
      highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    });

    expect(container.querySelector('.conflict-panel')).toBeInTheDocument();
  });

  it('disappears when conflicts are cleared', () => {
    highlighter.setCollisions([makeCollisionEntry('e1', 'e2')], elements, layers);
    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    expect(container.querySelector('.conflict-panel')).toBeInTheDocument();

    act(() => {
      highlighter.clearCollisions();
    });

    expect(container.querySelector('.conflict-panel')).toBeNull();
  });

  it('renders multiple conflicts correctly', () => {
    const e3 = makeElement('e3', 'l2', 'Element C');
    const e4 = makeElement('e4', 'l2', 'Element D');
    const allElements = [...elements, e3, e4];
    const allLayers: Layer[] = [
      ...layers,
      { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
    ];

    highlighter.setCollisions(
      [makeCollisionEntry('e1', 'e2'), makeCollisionEntry('e3', 'e4')],
      allElements,
      allLayers
    );

    const { container } = render(<ConflictPanel conflictHighlighter={highlighter} />);
    const header = container.querySelector('.conflict-panel > div:first-child');
    expect(header).toHaveTextContent('Layer Conflict (2)');
    expect(container.textContent).toContain('Element C');
    expect(container.textContent).toContain('Element D');
    expect(container.textContent).toContain('Layer 2');
  });
});
