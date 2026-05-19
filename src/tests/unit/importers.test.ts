import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSceneFromFileObject, loadSceneFromFile } from '../../io/importers';
import { useDocumentStore } from '../../core/store';

function makeValidSceneJson(): string {
  return JSON.stringify({
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: {
      units: 'px',
      background: '#fff',
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
        style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
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

function createFile(name: string, content: string, type = 'application/json'): File {
  return new File([content], name, { type });
}

describe('loadSceneFromFileObject', () => {
  beforeEach(() => {
    // Reset store between tests
    useDocumentStore.setState({
      scene: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      selectedIds: [],
      isDirty: false,
    });
  });

  it('loads a valid scene JSON and stores it', async () => {
    const file = createFile('scene.json', makeValidSceneJson());
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);

    const state = useDocumentStore.getState();
    expect(state.scene).not.toBeNull();
    expect(state.scene?.schemaVersion).toBe('1.0.0');
    expect(state.scene?.project.name).toBe('Test');
    expect(state.isDirty).toBe(false);
    expect(state.selectedIds).toEqual([]);
  });

  it('returns PARSE_ERROR for non-JSON content', async () => {
    const file = createFile('scene.json', 'not valid json at all {{');
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('PARSE_ERROR');
    expect(result.errors[0].message).toContain('not valid JSON');

    const state = useDocumentStore.getState();
    expect(state.scene).toBeNull();
  });

  it('returns PARSE_ERROR for empty file', async () => {
    const file = createFile('scene.json', '');
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('PARSE_ERROR');
  });

  it('returns validation errors for JSON missing schemaVersion', async () => {
    const file = createFile(
      'scene.json',
      JSON.stringify({
        project: { name: 'Test' },
        canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
        rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
        layers: [{ id: 'l1', name: 'L1', order: 1, visible: true, locked: false }],
        elements: [],
        groups: [],
        dataSources: [],
        charts: [],
        templates: [],
        exportPresets: [],
      }),
    );
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.code === 'SCHEMA_MISSING_ID')).toBe(true);
  });

  it('returns validation errors for JSON with invalid element type', async () => {
    const scene = JSON.parse(makeValidSceneJson());
    scene.elements.push({
      id: 'e2',
      type: 'invalidType',
      layerId: 'l1',
      transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
      visible: true,
      locked: false,
    });
    const file = createFile('scene.json', JSON.stringify(scene));
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCHEMA_INVALID_TYPE')).toBe(true);
  });

  it('invalid JSON does not load into store', async () => {
    const file = createFile('scene.json', '{broken}');
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(false);
    expect(useDocumentStore.getState().scene).toBeNull();
  });

  it('loads a scene with full elements (shapes, text, connector)', async () => {
    const file = createFile(
      'scene.json',
      JSON.stringify({
        schemaVersion: '1.0.0',
        project: { name: 'Full Scene' },
        canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 0, snapToGrid: false },
        rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
        layers: [
          { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
          { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
        ],
        elements: [
          {
            id: 'e1', type: 'shape', layerId: 'l1',
            transform: { x: 10, y: 10, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
            visible: true, locked: false, shapeKind: 'rect',
          },
          {
            id: 'e2', type: 'text', layerId: 'l2',
            transform: { x: 100, y: 10, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#333', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 14 },
            visible: true, locked: false, text: 'Hello',
          },
          {
            id: 'e3', type: 'connector', layerId: 'l2',
            transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: 'none', stroke: '#999', strokeWidth: 2, opacity: 1 },
            visible: true, locked: false,
            source: { elementId: 'e1', x: 60, y: 35 },
            target: { elementId: 'e2', x: 100, y: 25 },
            route: { type: 'straight', points: [] },
          },
        ],
        groups: [],
        dataSources: [],
        charts: [],
        templates: [],
        exportPresets: [],
      }),
    );
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(true);
    const state = useDocumentStore.getState();
    expect(state.scene).not.toBeNull();
    expect(state.scene?.elements).toHaveLength(3);
    expect(state.scene?.elements[0].type).toBe('shape');
    expect(state.scene?.elements[1].type).toBe('text');
    expect(state.scene?.elements[2].type).toBe('connector');
  });

  it('resets store state on load (isDirty=false, selectedIds empty)', async () => {
    // Set some pre-existing state
    useDocumentStore.setState({ isDirty: true, selectedIds: ['x', 'y'] });

    const file = createFile('scene.json', makeValidSceneJson());
    await loadSceneFromFileObject(file);

    const state = useDocumentStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.selectedIds).toEqual([]);
  });

  it('valid scene JSON with .json extension works', async () => {
    const file = createFile('my_scene.json', makeValidSceneJson());
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().scene).not.toBeNull();
  });

  it('returns reference error when element layerId does not exist', async () => {
    const scene = JSON.parse(makeValidSceneJson());
    scene.elements = [
      {
        id: 'e99',
        type: 'shape',
        layerId: 'nonexistent_layer',
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#ccc', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        shapeKind: 'rect',
      },
    ];
    const file = createFile('scene.json', JSON.stringify(scene));
    const result = await loadSceneFromFileObject(file);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'REF_LAYER_NOT_FOUND')).toBe(true);
  });
});

describe('loadSceneFromFile', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      scene: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      selectedIds: [],
      isDirty: false,
    });
  });

  it('opens file picker and loads a valid file using showOpenFilePicker', async () => {
    const mockFile = createFile('scene.json', makeValidSceneJson());
    const mockHandle = { getFile: vi.fn().mockResolvedValue(mockFile) };
    const showOpenFilePicker = vi.fn().mockResolvedValue([mockHandle]);

    // Mock the FSAA API
    vi.stubGlobal('showOpenFilePicker', showOpenFilePicker);

    const result = await loadSceneFromFile();

    expect(showOpenFilePicker).toHaveBeenCalledWith({
      types: [{ description: 'Scene JSON', accept: { 'application/json': ['.json'] } }],
      multiple: false,
    });
    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().scene).not.toBeNull();

    vi.unstubAllGlobals();
  });

  it('returns USER_CANCELLED when user cancels showOpenFilePicker', async () => {
    const abortError = new DOMException('User cancelled', 'AbortError');
    const showOpenFilePicker = vi.fn().mockRejectedValue(abortError);

    vi.stubGlobal('showOpenFilePicker', showOpenFilePicker);

    const result = await loadSceneFromFile();

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('USER_CANCELLED');
    expect(result.errors[0].severity).toBe('warning');

    vi.unstubAllGlobals();
  });

  it('falls back to input element when showOpenFilePicker is not available', async () => {
    // Remove showOpenFilePicker
    vi.stubGlobal('showOpenFilePicker', undefined);

    // Mock document.createElement to intercept input creation
    const originalCreateElement = document.createElement.bind(document);
    const input = originalCreateElement('input');
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {
      // Simulate async file selection
      setTimeout(() => {
        const changeEvent = new Event('change');
        Object.defineProperty(input, 'files', {
          value: [createFile('scene.json', makeValidSceneJson())],
          writable: false,
        });
        input.dispatchEvent(changeEvent);
      }, 50);
    });

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'input') return input;
      return originalCreateElement(tagName, options);
    });

    const result = await loadSceneFromFile();

    expect(clickSpy).toHaveBeenCalled();
    expect(result.valid).toBe(true);
    expect(useDocumentStore.getState().scene).not.toBeNull();

    createElementSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
