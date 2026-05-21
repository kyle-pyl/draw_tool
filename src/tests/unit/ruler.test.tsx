import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Ruler } from '../../ui/Ruler';
import { Viewport } from '../../canvas/viewport';

describe('Ruler', () => {
  let viewport: Viewport;

  beforeEach(() => {
    viewport = new Viewport();
    viewport.offsetX = 0;
    viewport.offsetY = 0;
    vi.spyOn(viewport, 'zoom', 'get').mockReturnValue(1);
  });

  it('renders horizontal and vertical canvas elements', () => {
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    const canvases = container.querySelectorAll('canvas');
    expect(canvases.length).toBe(2);
    expect(canvases[0].className).toBe('ruler-v');
    expect(canvases[1].className).toBe('ruler-h');
  });

  it('renders corner box', () => {
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    const corner = container.querySelector('.ruler-corner');
    expect(corner).toBeDefined();
  });

  it('respects custom rulerSize', () => {
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} rulerSize={30} />);
    const corner = container.querySelector('.ruler-corner') as HTMLElement;
    expect(corner.style.width).toBe('30px');
    expect(corner.style.height).toBe('30px');
  });

  it('uses default rulerSize of 25', () => {
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    const corner = container.querySelector('.ruler-corner') as HTMLElement;
    expect(corner.style.width).toBe('25px');
    expect(corner.style.height).toBe('25px');
  });

  it('computes tick interval for default zoom', () => {
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    expect(container.querySelectorAll('canvas').length).toBe(2);
  });

  it('handles zoomed in viewport', () => {
    vi.spyOn(viewport, 'zoom', 'get').mockReturnValue(2);
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    expect(container.querySelectorAll('canvas').length).toBe(2);
  });

  it('handles zoomed out viewport', () => {
    vi.spyOn(viewport, 'zoom', 'get').mockReturnValue(0.2);
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    expect(container.querySelectorAll('canvas').length).toBe(2);
  });

  it('handles offset viewport', () => {
    viewport.offsetX = 100;
    viewport.offsetY = -50;
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} />);
    expect(container.querySelectorAll('canvas').length).toBe(2);
  });

  it('positions canvases correctly with rulerSize offset', () => {
    const { container } = render(<Ruler viewport={viewport} width={800} height={600} rulerSize={25} />);
    const hCanvas = container.querySelector('.ruler-h') as HTMLElement;
    const vCanvas = container.querySelector('.ruler-v') as HTMLElement;
    expect(hCanvas.style.left).toBe('25px');
    expect(hCanvas.style.top).toBe('0px');
    expect(vCanvas.style.left).toBe('0px');
    expect(vCanvas.style.top).toBe('25px');
  });
});
