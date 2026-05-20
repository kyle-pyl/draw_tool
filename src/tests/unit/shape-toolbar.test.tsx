import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ShapeToolbar } from '../../ui/ShapeToolbar';
import type { DrawingToolType } from '../../canvas';

describe('ShapeToolbar', () => {
  it('renders all tool buttons', () => {
    const onToolChange = vi.fn();
    const { getAllByRole } = render(
      <ShapeToolbar activeTool="select" onToolChange={onToolChange} />,
    );
    const buttons = getAllByRole('button');
    expect(buttons.length).toBe(6);
  });

  it('renders tool buttons with correct titles', () => {
    const onToolChange = vi.fn();
    const { getByTitle } = render(
      <ShapeToolbar activeTool="select" onToolChange={onToolChange} />,
    );
    expect(getByTitle('Select')).toBeDefined();
    expect(getByTitle('Rectangle')).toBeDefined();
    expect(getByTitle('Circle')).toBeDefined();
    expect(getByTitle('Ellipse')).toBeDefined();
    expect(getByTitle('Line')).toBeDefined();
    expect(getByTitle('Polygon')).toBeDefined();
  });

  it('highlights active tool button', () => {
    const onToolChange = vi.fn();
    const { getByTitle } = render(
      <ShapeToolbar activeTool="circle" onToolChange={onToolChange} />,
    );
    const circleBtn = getByTitle('Circle');
    const selectBtn = getByTitle('Select');

    // Active button should have the highlight color
    expect(circleBtn.style.background).toBe('rgb(227, 242, 253)');
    // Inactive button should be transparent
    expect(selectBtn.style.background).toBe('transparent');
  });

  it('calls onToolChange when a tool button is clicked', () => {
    const onToolChange = vi.fn();
    const { getByTitle } = render(
      <ShapeToolbar activeTool="select" onToolChange={onToolChange} />,
    );

    fireEvent.click(getByTitle('Rectangle'));
    expect(onToolChange).toHaveBeenCalledTimes(1);
    expect(onToolChange).toHaveBeenCalledWith('rect');
  });

  it('calls onToolChange for each tool type', () => {
    const onToolChange = vi.fn();
    const { getByTitle } = render(
      <ShapeToolbar activeTool="select" onToolChange={onToolChange} />,
    );

    const tools: { title: string; type: DrawingToolType }[] = [
      { title: 'Select', type: 'select' },
      { title: 'Rectangle', type: 'rect' },
      { title: 'Circle', type: 'circle' },
      { title: 'Ellipse', type: 'ellipse' },
      { title: 'Line', type: 'line' },
      { title: 'Polygon', type: 'polygon' },
    ];

    for (const { title, type } of tools) {
      fireEvent.click(getByTitle(title));
      expect(onToolChange).toHaveBeenCalledWith(type);
    }
    expect(onToolChange).toHaveBeenCalledTimes(6);
  });

  it('does not crash when activeTool is a drawing type', () => {
    const onToolChange = vi.fn();
    const { getByTitle } = render(
      <ShapeToolbar activeTool="rect" onToolChange={onToolChange} />,
    );
    expect(getByTitle('Rectangle').style.background).toBe('rgb(227, 242, 253)');
  });

  it('renders SVG icons inside each button', () => {
    const onToolChange = vi.fn();
    const { getAllByRole } = render(
      <ShapeToolbar activeTool="select" onToolChange={onToolChange} />,
    );
    const buttons = getAllByRole('button');
    for (const btn of buttons) {
      // Each button should contain an SVG icon
      expect(btn.querySelector('svg')).not.toBeNull();
    }
  });
});
