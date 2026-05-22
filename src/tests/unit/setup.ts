import '@testing-library/jest-dom';

// Mock HTMLCanvasElement.getContext for jsdom environment.
// jsdom does not implement Canvas 2D API. This provides a minimal
// no-op mock so components (e.g. Ruler) can render in tests without
// throwing "Not implemented" errors.
const createMockContext = () => {
  const ctx = {
    scale: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'center',
    textBaseline: 'middle',
    canvas: { width: 0, height: 0 },
  };
  return ctx;
};

const origGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (...args: unknown[]) {
  if (args[0] === '2d') {
    return createMockContext() as unknown as CanvasRenderingContext2D;
  }
  return origGetContext.apply(this, args as [string, ...unknown[]]);
};
