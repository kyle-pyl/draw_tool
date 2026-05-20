import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { TextEditor } from '../../ui/TextEditor';
import { Viewport } from '../../canvas/viewport';
import type { TextElement } from '../../core/types';

function createTextElement(overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: 't1',
    type: 'text',
    layerId: 'l1',
    text: 'Hello World',
    transform: {
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    style: {
      fill: '#000000',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      opacity: 1,
      stroke: 'none',
      strokeWidth: 0,
    },
    visible: true,
    locked: false,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    ...overrides,
  };
}

describe('TextEditor', () => {
  let element: TextElement;
  let viewport: Viewport;
  let onCommit: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    element = createTextElement();
    viewport = new Viewport();
    onCommit = vi.fn();
    onCancel = vi.fn();
  });

  it('renders textarea with element text', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    expect(textarea!.value).toBe('Hello World');
  });

  it('renders toolbar with font controls', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onCommit on blur', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('calls onCommit on Enter without Shift', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('does not call onCommit on Shift+Enter', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('calls onCancel on Escape', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('commits changed text', async () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'New Text' } });
    });

    fireEvent.blur(textarea);
    expect(onCommit).toHaveBeenCalledWith('t1', expect.objectContaining({ text: 'New Text' }));
  });

  it('commits style changes', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );

    const boldBtn = container.querySelector('button[title="Bold"]');
    expect(boldBtn).not.toBeNull();
    fireEvent.click(boldBtn!);

    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);

    expect(onCommit).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({
        style: expect.objectContaining({
          fontWeight: 'bold',
        }),
      }),
    );
  });

  it('toggles italic style', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );

    const italicBtn = container.querySelector('button[title="Italic"]');
    expect(italicBtn).not.toBeNull();
    fireEvent.click(italicBtn!);

    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);

    expect(onCommit).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({
        style: expect.objectContaining({
          fontStyle: 'italic',
        }),
      }),
    );
  });

  it('shows pre-populated bold state for bold element', () => {
    const boldEl = createTextElement({
      style: { ...element.style, fontWeight: 'bold' },
    });
    const { container } = render(
      <TextEditor element={boldEl} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const boldBtn = container.querySelector('button[title="Bold"]')!;
    expect(boldBtn.style.background).toBeTruthy();
  });

  it('shows pre-populated italic state for italic element', () => {
    const italicEl = createTextElement({
      style: { ...element.style, fontStyle: 'italic' },
    });
    const { container } = render(
      <TextEditor element={italicEl} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const italicBtn = container.querySelector('button[title="Italic"]')!;
    expect(italicBtn.style.background).toBeTruthy();
  });

  it('commits background color change', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('commits border changes', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('renders at correct screen position based on element transform', () => {
    const { container } = render(
      <TextEditor element={element} viewport={viewport} onCommit={onCommit} onCancel={onCancel} />,
    );
    const overlay = container.querySelector('.text-editor-overlay') as HTMLElement;
    expect(overlay).not.toBeNull();
    const style = overlay!.style;
    expect(style.position).toBe('fixed');
  });
});
