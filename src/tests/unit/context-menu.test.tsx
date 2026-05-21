import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from '../../ui/ContextMenu';
import type { ContextMenuState } from '../../ui/ContextMenu';

describe('ContextMenu', () => {
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
  });

  it('renders null when state is null', () => {
    const { container } = render(<ContextMenu state={null} onClose={onClose} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders menu with items', () => {
    const state: ContextMenuState = {
      x: 100,
      y: 50,
      items: [
        { label: 'Copy', action: vi.fn(), shortcut: 'Ctrl+C' },
        { label: 'Paste', action: vi.fn(), shortcut: 'Ctrl+V' },
        { label: 'Delete', action: vi.fn() },
      ],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    expect(screen.getByText('Copy')).toBeDefined();
    expect(screen.getByText('Paste')).toBeDefined();
    expect(screen.getByText('Delete')).toBeDefined();
    expect(screen.getByText('Ctrl+C')).toBeDefined();
    expect(screen.getByText('Ctrl+V')).toBeDefined();
  });

  it('renders separator items', () => {
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [
        { label: 'Item 1', action: vi.fn() },
        { label: '', separator: true },
        { label: 'Item 2', action: vi.fn() },
      ],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    expect(screen.getByText('Item 1')).toBeDefined();
    expect(screen.getByText('Item 2')).toBeDefined();
  });

  it('calls action and closes on click', () => {
    const copyAction = vi.fn();
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [{ label: 'Copy', action: copyAction }],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(copyAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call action for disabled items', () => {
    const disabledAction = vi.fn();
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [{ label: 'Disabled', action: disabledAction, disabled: true }],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    fireEvent.click(screen.getByText('Disabled'));
    expect(disabledAction).not.toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [{ label: 'Item', action: vi.fn() }],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on outside click', () => {
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [{ label: 'Item', action: vi.fn() }],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders submenu arrow for items with children', () => {
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [
        {
          label: 'Align',
          children: [
            { label: 'Left', action: vi.fn() },
            { label: 'Right', action: vi.fn() },
          ],
        },
      ],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    expect(screen.getByText('Align')).toBeDefined();
    expect(screen.getByText('▸')).toBeDefined();
  });

  it('shows submenu on hover', () => {
    const leftAction = vi.fn();
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [
        {
          label: 'Align',
          children: [
            { label: 'Left', action: leftAction },
            { label: 'Right', action: vi.fn() },
          ],
        },
      ],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    fireEvent.mouseEnter(screen.getByText('Align'));
    expect(screen.getByText('Left')).toBeDefined();
    expect(screen.getByText('Right')).toBeDefined();
  });

  it('calls submenu item action and closes', () => {
    const leftAction = vi.fn();
    const state: ContextMenuState = {
      x: 0,
      y: 0,
      items: [
        {
          label: 'Align',
          children: [{ label: 'Left', action: leftAction }],
        },
      ],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    fireEvent.mouseEnter(screen.getByText('Align'));
    fireEvent.click(screen.getByText('Left'));
    expect(leftAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('resets submenu when state changes', () => {
    const state1: ContextMenuState = {
      x: 0,
      y: 0,
      items: [
        {
          label: 'Menu 1',
          children: [{ label: 'Sub 1', action: vi.fn() }],
        },
      ],
    };
    const { rerender } = render(<ContextMenu state={state1} onClose={onClose} />);
    fireEvent.mouseEnter(screen.getByText('Menu 1'));

    const state2: ContextMenuState = {
      x: 0,
      y: 0,
      items: [{ label: 'Menu 2', action: vi.fn() }],
    };
    rerender(<ContextMenu state={state2} onClose={onClose} />);
    expect(screen.queryByText('Sub 1')).toBeNull();
  });

  it('adjusts position when menu would overflow right', () => {
    const state: ContextMenuState = {
      x: window.innerWidth - 10,
      y: 50,
      items: [{ label: 'Item', action: vi.fn() }],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    const menu = document.querySelector('.context-menu') as HTMLElement;
    expect(menu).toBeDefined();
    const left = parseInt(menu.style.left, 10);
    expect(left).toBeLessThan(window.innerWidth - 20);
  });

  it('clamps position to not go off-screen left/top', () => {
    const state: ContextMenuState = {
      x: -5,
      y: -5,
      items: [{ label: 'Item', action: vi.fn() }],
    };
    render(<ContextMenu state={state} onClose={onClose} />);
    const menu = document.querySelector('.context-menu') as HTMLElement;
    expect(menu).toBeDefined();
    const left = parseInt(menu.style.left, 10);
    const top = parseInt(menu.style.top, 10);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(top).toBeGreaterThanOrEqual(0);
  });
});
