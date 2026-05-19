import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { importProjectFromZip } from '../../io/importers';
import { exportProjectToZip, saveProject } from '../../io/exporters';
import { useDocumentStore } from '../../core/store';

function makeValidSceneJson(): string {
  return JSON.stringify({
    schemaVersion: '1.0.0',
    project: { name: 'Test Project' },
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
      hiddenElementsCollide: false,
      lockedElementsCollide: false,
      connectorsExempt: true,
    },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements: [
      {
        id: 'e1',
        type: 'shape',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#cccccc', stroke: '#000000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        shapeKind: 'rect',
      },
    ],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  });
}

function makeZipFile(entries: Record<string, string | Uint8Array>): File {
  const zipEntries: Record<string, Uint8Array> = {};
  for (const [name, content] of Object.entries(entries)) {
    zipEntries[name] = typeof content === 'string' ? strToU8(content) : content;
  }
  const zipData = zipSync(zipEntries);
  return new File([zipData], 'project.zip', { type: 'application/zip' });
}

function makeSceneOnlyZip(): File {
  return makeZipFile({ 'scene.json': makeValidSceneJson() });
}

// ─── importProjectFromZip ────────────────────────────────────────────────────

describe('importProjectFromZip', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      scene: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      selectedIds: [],
      isDirty: false,
      directoryHandle: null,
    });
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn().mockImplementation(() => 'blob:mock-zip-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads a valid project from ZIP containing scene.json', async () => {
    const zipFile = makeSceneOnlyZip();
    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);

    const state = useDocumentStore.getState();
    expect(state.scene).not.toBeNull();
    expect(state.scene?.schemaVersion).toBe('1.0.0');
    expect(state.scene?.project.name).toBe('Test Project');
    expect(state.isDirty).toBe(false);
    expect(state.selectedIds).toEqual([]);
    expect(state.directoryHandle).toBeNull();
  });

  it('returns IO_ERROR when ZIP does not contain scene.json', async () => {
    const zipFile = makeZipFile({ 'data/readme.txt': 'hello' });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('IO_ERROR');
    expect(result.errors[0].message).toContain('scene.json');
  });

  it('returns PARSE_ERROR when scene.json is not valid JSON', async () => {
    const zipFile = makeZipFile({ 'scene.json': 'not json {{{' });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('PARSE_ERROR');
  });

  it('returns validation errors for invalid scene.json', async () => {
    const invalidScene = JSON.stringify({
      project: { name: 'No Schema' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
      layers: [], elements: [], groups: [], dataSources: [], charts: [], templates: [], exportPresets: [],
    });
    const zipFile = makeZipFile({ 'scene.json': invalidScene });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCHEMA_MISSING_ID')).toBe(true);
  });

  it('invalid scene does not load into store', async () => {
    const zipFile = makeZipFile({ 'scene.json': '{broken' });

    await importProjectFromZip(zipFile);

    expect(useDocumentStore.getState().scene).toBeNull();
  });

  it('detects data files in data/ directory and adds DataSources', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    sceneData.project.name = 'Data Project';
    const zipFile = makeZipFile({
      'scene.json': JSON.stringify(sceneData),
      'data/sample.csv': 'a,b,c\n1,2,3\n4,5,6',
      'data/config.json': '{"key":"value"}',
    });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().scene;
    expect(scene).not.toBeNull();
    expect(scene!.dataSources).toHaveLength(2);
    expect(scene!.dataSources.some((ds) => ds.path === 'data/sample.csv' && ds.type === 'csv')).toBe(true);
    expect(scene!.dataSources.some((ds) => ds.path === 'data/config.json' && ds.type === 'json')).toBe(true);
  });

  it('does not duplicate DataSources already present in scene.json', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    sceneData.dataSources = [{ id: 'ds-existing', path: 'data/sample.csv', type: 'csv' }];
    const zipFile = makeZipFile({
      'scene.json': JSON.stringify(sceneData),
      'data/sample.csv': 'a,b\n1,2',
    });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().scene;
    expect(scene!.dataSources).toHaveLength(1);
    expect(scene!.dataSources[0].path).toBe('data/sample.csv');
  });

  it('resolves ImageElement src from assets/ to blob URLs', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    sceneData.elements = [
      {
        id: 'img1',
        type: 'image',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 200, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        src: 'assets/logo.png',
        originalWidth: 200,
        originalHeight: 200,
      },
    ];
    const fakePngData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const zipFile = makeZipFile({
      'scene.json': JSON.stringify(sceneData),
      'assets/logo.png': fakePngData,
    });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().scene;
    const imgEl = scene!.elements[0] as { src: string; metadata?: Record<string, unknown> };
    expect(imgEl.src).toBe('blob:mock-zip-url');
    expect(imgEl.metadata?.originalAssetPath).toBe('assets/logo.png');
  });

  it('resolves ImageElement src by basename match from assets/', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    sceneData.elements = [
      {
        id: 'img1',
        type: 'image',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        src: 'photo.jpg',
        originalWidth: 100,
        originalHeight: 100,
      },
    ];
    const fakeJpgData = new Uint8Array([255, 216, 255, 224]); // JPEG header
    const zipFile = makeZipFile({
      'scene.json': JSON.stringify(sceneData),
      'assets/photo.jpg': fakeJpgData,
    });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().scene;
    const imgEl = scene!.elements[0] as { src: string };
    expect(imgEl.src).toBe('blob:mock-zip-url');
  });

  it('does not resolve non-image assets to blob URLs', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    sceneData.elements = [
      {
        id: 'img1',
        type: 'image',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        src: 'assets/readme.txt',
        originalWidth: 100,
        originalHeight: 100,
      },
    ];
    const zipFile = makeZipFile({
      'scene.json': JSON.stringify(sceneData),
      'assets/readme.txt': 'text file',
    });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().scene;
    const imgEl = scene!.elements[0] as { src: string };
    // src should remain unchanged because .txt is not an image file
    expect(imgEl.src).toBe('assets/readme.txt');
  });

  it('detects scene.json at nested level (e.g., project/scene.json)', async () => {
    const zipFile = makeZipFile({ 'project/scene.json': makeValidSceneJson() });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().scene).not.toBeNull();
  });

  it('handles ZIP with scene.json, data/, and assets/ simultaneously', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    sceneData.elements = [
      {
        id: 'img1',
        type: 'image',
        layerId: 'l1',
        transform: { x: 0, y: 0, width: 200, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        src: 'assets/pic.png',
        originalWidth: 200,
        originalHeight: 200,
      },
    ];
    const fakePngData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const zipFile = makeZipFile({
      'scene.json': JSON.stringify(sceneData),
      'data/stats.csv': 'col1,col2\n1,2\n3,4',
      'assets/pic.png': fakePngData,
    });

    const result = await importProjectFromZip(zipFile);

    expect(result.valid).toBe(true);
    const scene = useDocumentStore.getState().scene;
    expect(scene!.dataSources).toHaveLength(1);
    expect(scene!.dataSources[0].path).toBe('data/stats.csv');
    const imgEl = scene!.elements[0] as { src: string };
    expect(imgEl.src).toBe('blob:mock-zip-url');
  });

  it('resets store state on successful ZIP load', async () => {
    useDocumentStore.setState({ isDirty: true, selectedIds: ['x', 'y'] });

    const zipFile = makeSceneOnlyZip();
    await importProjectFromZip(zipFile);

    const state = useDocumentStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.selectedIds).toEqual([]);
  });

  it('returns IO_ERROR on corrupt ZIP file', async () => {
    const corruptFile = new File(
      [new Uint8Array([0, 1, 2, 3, 4, 5])],
      'corrupt.zip',
      { type: 'application/zip' },
    );

    const result = await importProjectFromZip(corruptFile);

    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('IO_ERROR');
    expect(result.errors[0].message).toContain('decompress');
  });

  it('clears directoryHandle on successful import', async () => {
    // Set an existing directory handle to verify it gets cleared
    const fakeHandle = {} as FileSystemDirectoryHandle;
    useDocumentStore.setState({ directoryHandle: fakeHandle });

    const zipFile = makeSceneOnlyZip();
    await importProjectFromZip(zipFile);

    expect(useDocumentStore.getState().directoryHandle).toBeNull();
  });
});

// ─── exportProjectToZip ──────────────────────────────────────────────────────

describe('exportProjectToZip', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      scene: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      selectedIds: [],
      isDirty: false,
      directoryHandle: null,
    });
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn().mockImplementation(() => 'blob:mock-export'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exports a ZIP blob containing scene.json', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);

    const blob = await exportProjectToZip();

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/zip');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('throws an error when no scene is loaded', async () => {
    await expect(exportProjectToZip()).rejects.toThrow('No scene is currently loaded');
  });

  it('exported ZIP can be re-imported with matching scene data', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);

    const blob = await exportProjectToZip();

    // Convert Blob to File for re-import
    const exportedFile = new File([blob], 'roundtrip.zip', { type: 'application/zip' });

    // Reset store
    useDocumentStore.setState({
      scene: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      selectedIds: [],
      isDirty: false,
      directoryHandle: null,
    });

    const result = await importProjectFromZip(exportedFile);

    expect(result.valid).toBe(true);
    const reimportedScene = useDocumentStore.getState().scene;
    expect(reimportedScene).not.toBeNull();
    expect(reimportedScene!.project.name).toBe('Test Project');
    expect(reimportedScene!.elements).toHaveLength(1);
  });

  it('exported ZIP contains valid JSON that passes validation', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);

    const blob = await exportProjectToZip();
    const exportedFile = new File([blob], 'validate.zip', { type: 'application/zip' });

    // Import to verify validation passes
    const result = await importProjectFromZip(exportedFile);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

// ─── saveProject ─────────────────────────────────────────────────────────────

describe('saveProject', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      scene: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      selectedIds: [],
      isDirty: false,
      directoryHandle: null,
    });
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn().mockReturnValue('blob:mock-save'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns IO_ERROR when no scene is loaded', async () => {
    const result = await saveProject();

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('IO_ERROR');
    expect(result.errors[0].message).toContain('No scene is currently loaded');
  });

  it('returns validation errors when scene is invalid and blocks save', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);
    useDocumentStore.setState({ isDirty: true });

    // Mutate the scene to make it invalid (remove schemaVersion)
    const state = useDocumentStore.getState();
    state.updateScene((s) => {
      const modified = JSON.parse(JSON.stringify(s));
      delete (modified as Record<string, unknown>).schemaVersion;
      return modified;
    });

    const result = await saveProject();

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // isDirty should still be true since save was blocked
    expect(useDocumentStore.getState().isDirty).toBe(true);
  });

  it('saves to directory handle and marks clean', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);
    useDocumentStore.setState({ isDirty: true });

    // Create a mock directory handle with createWritable support
    const writtenChunks: string[] = [];
    const mockWritable = {
      write: vi.fn().mockImplementation((chunk: string) => {
        writtenChunks.push(chunk);
        return Promise.resolve();
      }),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const mockFileHandle = {
      kind: 'file' as const,
      name: 'scene.json',
      createWritable: vi.fn().mockResolvedValue(mockWritable),
    };
    const mockDirHandle = {
      kind: 'directory' as const,
      name: 'project',
      getFileHandle: vi.fn().mockResolvedValue(mockFileHandle),
    } as unknown as FileSystemDirectoryHandle;

    useDocumentStore.setState({ directoryHandle: mockDirHandle });

    const result = await saveProject();

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);

    // Verify directory write was called
    expect(mockDirHandle.getFileHandle).toHaveBeenCalledWith('scene.json', { create: true });
    expect(mockFileHandle.createWritable).toHaveBeenCalled();
    expect(mockWritable.write).toHaveBeenCalled();
    expect(mockWritable.close).toHaveBeenCalled();

    // Verify written content is valid JSON with the current scene
    const writtenJson = JSON.parse(writtenChunks[0]);
    expect(writtenJson.schemaVersion).toBe('1.0.0');
    expect(writtenJson.project.name).toBe('Test Project');

    // isDirty should be false after successful save
    expect(useDocumentStore.getState().isDirty).toBe(false);
  });

  it('saves via ZIP download when no directory handle', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);
    useDocumentStore.setState({ isDirty: true, directoryHandle: null });

    // Spy on createElement only for the anchor, allow all other elements through
    const origCreateElement = document.createElement.bind(document);
    const anchor = origCreateElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag, opts) => {
      if (tag === 'a') return anchor;
      return origCreateElement(tag, opts);
    });
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(anchor);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(anchor);

    const result = await saveProject();

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(clickSpy).toHaveBeenCalled();
    expect(anchor.download).toBe('Test Project.zip');
    expect(useDocumentStore.getState().isDirty).toBe(false);

    createElSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('returns IO_ERROR when directory write fails', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);
    useDocumentStore.setState({ isDirty: true });

    const mockDirHandle = {
      kind: 'directory' as const,
      name: 'project',
      getFileHandle: vi.fn().mockRejectedValue(new Error('Permission denied')),
    } as unknown as FileSystemDirectoryHandle;

    useDocumentStore.setState({ directoryHandle: mockDirHandle });

    const result = await saveProject();

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('IO_ERROR');
    expect(result.errors[0].message).toContain('Permission denied');

    // isDirty should still be true since save failed
    expect(useDocumentStore.getState().isDirty).toBe(true);
  });

  it('isDirty is set to false after successful save', async () => {
    const sceneData = JSON.parse(makeValidSceneJson());
    useDocumentStore.getState().loadScene(sceneData);
    useDocumentStore.setState({ isDirty: true, directoryHandle: null });

    // Mock document.createElement('a') to suppress jsdom navigation
    const origCreateElement = document.createElement.bind(document);
    const anchor = origCreateElement('a');
    vi.spyOn(anchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation((tag, opts) => {
      if (tag === 'a') return anchor;
      return origCreateElement(tag, opts);
    });
    vi.spyOn(document.body, 'appendChild').mockReturnValue(anchor);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(anchor);

    const result = await saveProject();

    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().isDirty).toBe(false);
  });
});