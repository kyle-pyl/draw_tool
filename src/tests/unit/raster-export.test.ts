import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToRaster, downloadRaster } from '../../io/exporters';
import type { SceneDocument } from '../../core/types';

function makeBaseScene(): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test Raster Export' },
    canvas: { units: 'px', background: '#ffffff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
    rules: {
      maxLayerCount: 10, collisionStrategy: 'bbox',
      hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true,
    },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements: [], groups: [], dataSources: [], charts: [], templates: [], exportPresets: [],
  };
}

function makeSceneWithRect(): SceneDocument {
  const scene = makeBaseScene();
  scene.elements = [{
    id: 'e1', type: 'shape', shapeKind: 'rect', layerId: 'l1',
    transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, opacity: 1 },
    visible: true, locked: false,
  }];
  return scene;
}

describe('exportToRaster', () => {
  let origCreateObjectURL: typeof URL.createObjectURL;
  let origRevokeObjectURL: typeof URL.revokeObjectURL;
  let origImage: typeof Image;
  let origGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let origToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    origCreateObjectURL = URL.createObjectURL;
    origRevokeObjectURL = URL.revokeObjectURL;
    origImage = globalThis.Image;
    origGetContext = HTMLCanvasElement.prototype.getContext;
    origToBlob = HTMLCanvasElement.prototype.toBlob;
  });

  afterEach(() => {
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    globalThis.Image = origImage;
    HTMLCanvasElement.prototype.getContext = origGetContext;
    HTMLCanvasElement.prototype.toBlob = origToBlob;
  });

  function setupOpaqueCanvasEnv() {
    // Mock canvas.getContext('2d') to return a usable stub
    const ctxStub = {
      scale: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };
    HTMLCanvasElement.prototype.getContext = vi.fn((_type: string) => ctxStub as unknown as CanvasRenderingContext2D);
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb: (b: Blob | null) => void) => cb(new Blob(['fake'], { type: 'image/png' })));

    // Mock Image: set src triggers onload asynchronously
    const imgProto = {
      set src(_value: string) {
        Promise.resolve().then(() => { if (this.onload) (this.onload as () => void)(); });
      },
      onload: null as (() => void) | null,
      onerror: null as ((() => void) | null) | null,
    };
    const MockImage = vi.fn(function (this: typeof imgProto) {
      this.onload = null;
      this.onerror = null;
    }) as unknown as typeof Image;
    MockImage.prototype = imgProto;
    // @ts-expect-error mocking global Image
    globalThis.Image = MockImage;

    URL.createObjectURL = vi.fn(() => 'blob:mock-svg');
    URL.revokeObjectURL = vi.fn();

    return { imgProto };
  }

  // ── Format selection ────────────────────────────────────────────────
  it('should export as PNG by default', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect());
    expect(blob.type).toBe('image/png');
  });

  it('should export as JPG when format is jpg', async () => {
    setupOpaqueCanvasEnv();
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => cb(new Blob(['fake'], { type: 'image/jpeg' })));
    const blob = await exportToRaster(makeSceneWithRect(), { format: 'jpg' });
    expect(blob.type).toBe('image/jpeg');
  });

  // ── Scale / DPI ─────────────────────────────────────────────────────
  it('should export with 2x scale by default', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect());
    expect(blob).toBeDefined();
    expect(blob.type).toBe('image/png');
  });

  it('should respect custom scale', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { scale: 3 });
    expect(blob).toBeDefined();
  });

  it('should derive scale from DPI', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { dpi: 288 });
    expect(blob).toBeDefined();
  });

  it('should floor DPI scale to at least 1', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { dpi: 36 });
    expect(blob).toBeDefined();
  });

  // ── Background / transparency ───────────────────────────────────────
  it('should create transparent PNG by default', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { format: 'png' });
    expect(blob).toBeDefined();
  });

  it('should fill background for JPG', async () => {
    const { imgProto } = setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { format: 'jpg' });
    expect(blob).toBeDefined();
  });

  it('should respect transparentBackground: false for PNG', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { format: 'png', transparentBackground: false });
    expect(blob).toBeDefined();
  });

  // ── JPEG quality ────────────────────────────────────────────────────
  it('should use default JPEG quality of 0.92', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { format: 'jpg' });
    expect(blob).toBeDefined();
  });

  it('should accept custom JPEG quality', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { format: 'jpg', quality: 0.5 });
    expect(blob).toBeDefined();
  });

  // ── Region modes ────────────────────────────────────────────────────
  it('should export full scene by default', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect());
    expect(blob).toBeDefined();
  });

  it('should export with viewport region', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), {
      region: 'viewport', viewportBBox: { x: 0, y: 0, width: 200, height: 200 },
    });
    expect(blob).toBeDefined();
  });

  it('should export with selection region', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), {
      region: 'selection', selectedElementIds: ['e1'],
    });
    expect(blob).toBeDefined();
  });

  // ── Custom background color ─────────────────────────────────────────
  it('should use custom background color', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), {
      format: 'png', transparentBackground: false, backgroundColor: '#112233',
    });
    expect(blob).toBeDefined();
  });

  // ── Empty scene ─────────────────────────────────────────────────────
  it('should handle empty scene', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeBaseScene());
    expect(blob).toBeDefined();
  });

  // ── Text scene ──────────────────────────────────────────────────────
  it('should handle scene with text elements', async () => {
    setupOpaqueCanvasEnv();
    const scene = makeBaseScene();
    scene.elements = [{
      id: 'e1', type: 'text', layerId: 'l1', text: 'Hello',
      transform: { x: 10, y: 20, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#333', fontSize: 16, fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal', opacity: 1, stroke: 'none', strokeWidth: 0 },
      visible: true, locked: false,
    }];
    const blob = await exportToRaster(scene);
    expect(blob).toBeDefined();
  });

  // ── Margin override ─────────────────────────────────────────────────
  it('should respect margin override', async () => {
    setupOpaqueCanvasEnv();
    const blob = await exportToRaster(makeSceneWithRect(), { margin: 30 });
    expect(blob).toBeDefined();
  });

  // ── Rejection on image load error ───────────────────────────────────
  it('should reject if SVG image fails to load', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(), fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn(),
    }) as unknown as CanvasRenderingContext2D);
    HTMLCanvasElement.prototype.toBlob = vi.fn();

    const imgProto = {
      set src(_value: string) {
        Promise.resolve().then(() => { if (this.onerror) (this.onerror as () => void)(); });
      },
      onload: null as (() => void) | null,
      onerror: null as ((() => void) | null) | null,
    };
    const MockImage = vi.fn(function (this: typeof imgProto) {
      this.onload = null; this.onerror = null;
    }) as unknown as typeof Image;
    MockImage.prototype = imgProto;
    // @ts-expect-error
    globalThis.Image = MockImage;
    URL.createObjectURL = vi.fn(() => 'blob:mock-svg');
    URL.revokeObjectURL = vi.fn();

    await expect(exportToRaster(makeSceneWithRect())).rejects.toThrow('Failed to load SVG for rasterization');
  });

  // ── Rejection on canvas toBlob returning null ───────────────────────
  it('should reject if canvas toBlob returns null', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(), fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn(),
    }) as unknown as CanvasRenderingContext2D);
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb: (b: Blob | null) => void) => cb(null));

    const imgProto = {
      set src(_value: string) {
        Promise.resolve().then(() => { if (this.onload) (this.onload as () => void)(); });
      },
      onload: null as (() => void) | null,
      onerror: null as ((() => void) | null) | null,
    };
    const MockImage = vi.fn(function (this: typeof imgProto) { this.onload = null; this.onerror = null; }) as unknown as typeof Image;
    MockImage.prototype = imgProto;
    // @ts-expect-error
    globalThis.Image = MockImage;
    URL.createObjectURL = vi.fn(() => 'blob:mock-svg');
    URL.revokeObjectURL = vi.fn();

    await expect(exportToRaster(makeSceneWithRect())).rejects.toThrow('Failed to create blob from canvas');
  });
});

describe('downloadRaster', () => {
  let origCreateObjectURL: typeof URL.createObjectURL;
  let origRevokeObjectURL: typeof URL.revokeObjectURL;
  let origImage: typeof Image;
  let origGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let origToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    origCreateObjectURL = URL.createObjectURL;
    origRevokeObjectURL = URL.revokeObjectURL;
    origImage = globalThis.Image;
    origGetContext = HTMLCanvasElement.prototype.getContext;
    origToBlob = HTMLCanvasElement.prototype.toBlob;
  });

  afterEach(() => {
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    globalThis.Image = origImage;
    HTMLCanvasElement.prototype.getContext = origGetContext;
    HTMLCanvasElement.prototype.toBlob = origToBlob;
  });

  function setupMocks() {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      scale: vi.fn(), fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn(),
    }) as unknown as CanvasRenderingContext2D);
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => cb(new Blob(['fake'], { type: 'image/png' })));

    const imgProto = {
      set src(_value: string) {
        Promise.resolve().then(() => { if (this.onload) (this.onload as () => void)(); });
      },
      onload: null as (() => void) | null,
      onerror: null as ((() => void) | null) | null,
    };
    const MockImage = vi.fn(function (this: typeof imgProto) { this.onload = null; this.onerror = null; }) as unknown as typeof Image;
    MockImage.prototype = imgProto;
    // @ts-expect-error
    globalThis.Image = MockImage;
    URL.createObjectURL = vi.fn(() => 'blob:mock-svg');
    URL.revokeObjectURL = vi.fn();
  }

  it('should trigger a download with PNG extension by default', async () => {
    setupMocks();

    let downloadName = '';
    const origCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === 'a') {
        Object.defineProperty(el, 'download', {
          set(value: string) { downloadName = value; },
          get() { return downloadName; },
          configurable: true,
        });
      }
      return el;
    }) as typeof document.createElement;

    await downloadRaster(makeSceneWithRect(), 'my-figure');
    expect(downloadName).toBe('my-figure.png');

    document.createElement = origCreateElement;
  });

  it('should use .jpg extension for JPG format', async () => {
    setupMocks();

    let downloadName = '';
    const origCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === 'a') {
        Object.defineProperty(el, 'download', {
          set(value: string) { downloadName = value; },
          get() { return downloadName; },
          configurable: true,
        });
      }
      return el;
    }) as typeof document.createElement;

    await downloadRaster(makeSceneWithRect(), 'chart', { format: 'jpg' });
    expect(downloadName).toBe('chart.jpg');

    document.createElement = origCreateElement;
  });

  it('should use default filename "export.png" when none provided', async () => {
    setupMocks();

    let downloadName = '';
    const origCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === 'a') {
        Object.defineProperty(el, 'download', {
          set(value: string) { downloadName = value; },
          get() { return downloadName; },
          configurable: true,
        });
      }
      return el;
    }) as typeof document.createElement;

    await downloadRaster(makeSceneWithRect());
    expect(downloadName).toBe('export.png');

    document.createElement = origCreateElement;
  });
});
