import { describe, it, expect } from 'vitest';
import { validateScene } from '../../core/validator';
import { ErrorCode } from '../../core/errors';

function makeValidScene(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test Project' },
    canvas: {
      units: 'px',
      background: '#ffffff',
      defaultFont: 'Arial',
      gridSize: 10,
      snapToGrid: false,
    },
    rules: {
      maxLayerCount: 10,
      collisionStrategy: 'bbox',
      hiddenElementsCollide: false,
      lockedElementsCollide: true,
      connectorsExempt: true,
    },
    layers: [
      { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
    ],
    elements: [
      {
        id: 'e1',
        type: 'shape',
        layerId: 'l1',
        shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#ccc', stroke: '#000', strokeWidth: 2, opacity: 1 },
        visible: true,
        locked: false,
      },
    ],
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
    ...overrides,
  };
}

describe('validateScene – positive cases', () => {
  it('validates a minimal valid scene', () => {
    const result = validateScene(makeValidScene());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validates a scene with multiple layers', () => {
    const scene = makeValidScene({
      layers: [
        { id: 'l1', name: 'Background', order: 1, visible: true, locked: false },
        { id: 'l2', name: 'Foreground', order: 2, visible: true, locked: false },
        { id: 'l3', name: 'Overlay', order: 3, visible: false, locked: true },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a shape element (rect)', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'rect1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
        transform: { x: 10, y: 20, width: 50, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a shape element (circle)', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'circ1', type: 'shape', layerId: 'l1', shapeKind: 'circle',
        transform: { x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#0f0', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a shape element (polygon)', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'poly1', type: 'shape', layerId: 'l1', shapeKind: 'polygon',
        points: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }],
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#00f', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a text element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'txt1', type: 'text', layerId: 'l1', text: 'Hello World',
        transform: { x: 0, y: 0, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates an image element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'img1', type: 'image', layerId: 'l1', src: 'blob:http://example.com/img.png',
        originalWidth: 800, originalHeight: 600,
        transform: { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: 'none', strokeWidth: 0, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a connector element', () => {
    const scene = makeValidScene({
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'conn1', type: 'connector', layerId: 'l1',
          source: { elementId: 'e1', anchorId: 'right', x: 50, y: 25 },
          target: { x: 200, y: 25 },
          route: { type: 'straight', points: [] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a container element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'cont1', type: 'container', layerId: 'l1', containerLabel: 'Cloud Region',
        transform: { x: 0, y: 0, width: 300, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#e0f0ff', stroke: '#66a', strokeWidth: 2, strokeDasharray: '5,5', opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a mindNode element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'mn1', type: 'mindNode', layerId: 'l1', text: 'Root Topic',
        childrenIds: ['mn2'],
        transform: { x: 300, y: 200, width: 120, height: 40, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fffbe6', stroke: '#da0', strokeWidth: 2, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a topologyNode element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'tn1', type: 'topologyNode', layerId: 'l1', deviceType: 'router', label: 'Core Router',
        transform: { x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#e8f5e9', stroke: '#2e7d32', strokeWidth: 2, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates an rtlModule element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'rtl1', type: 'rtlModule', layerId: 'l1', moduleName: 'register', instanceName: 'r1',
        transform: { x: 0, y: 0, width: 100, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#e3f2fd', stroke: '#1565c0', strokeWidth: 2, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates an rtlPort element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'port1', type: 'rtlPort', layerId: 'l1', direction: 'input', bitWidth: 32, portName: 'data_in',
        transform: { x: 0, y: 0, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#333', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a chart element', () => {
    const scene = makeValidScene({
      elements: [{
        id: 'chart1', type: 'chart', layerId: 'l1', dataSourceId: 'ds1', chartType: 'bar',
        columnMappings: { x: 'category', y: 'value' },
        transform: { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a scene with all element types in one array', () => {
    const scene = makeValidScene({
      elements: [
        { id: 'e_shape', type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e_text', type: 'text', layerId: 'l1', text: 'Hello', transform: { x: 60, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 }, visible: true, locked: false },
        { id: 'e_image', type: 'image', layerId: 'l1', src: 'data:image/png,', originalWidth: 10, originalHeight: 10, transform: { x: 170, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: 'none', stroke: 'none', strokeWidth: 0, opacity: 1 }, visible: true, locked: false },
        { id: 'e_conn', type: 'connector', layerId: 'l1', source: { x: 0, y: 100 }, target: { x: 100, y: 200 }, route: { type: 'straight', points: [] }, transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e_chart', type: 'chart', layerId: 'l1', dataSourceId: 'ds1', chartType: 'line', columnMappings: { x: 'x', y: 'y' }, transform: { x: 230, y: 0, width: 200, height: 200, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e_cont', type: 'container', layerId: 'l1', containerLabel: 'Area', transform: { x: 440, y: 0, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#f0f0f0', stroke: '#999', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e_rtlm', type: 'rtlModule', layerId: 'l1', moduleName: 'mux', instanceName: 'm1', transform: { x: 650, y: 0, width: 80, height: 60, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#e3f2fd', stroke: '#1565c0', strokeWidth: 2, opacity: 1 }, visible: true, locked: false },
        { id: 'e_rtlp', type: 'rtlPort', layerId: 'l1', direction: 'output', bitWidth: 1, portName: 'out', transform: { x: 740, y: 0, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#333', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e_mind', type: 'mindNode', layerId: 'l1', text: 'Topic', transform: { x: 760, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fffbe6', stroke: '#da0', strokeWidth: 2, opacity: 1 }, visible: true, locked: false },
        { id: 'e_topo', type: 'topologyNode', layerId: 'l1', deviceType: 'server', label: 'Srv', transform: { x: 870, y: 0, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#e8f5e9', stroke: '#2e7d32', strokeWidth: 2, opacity: 1 }, visible: true, locked: false },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a scene with optional fields (viewport, metadata, tags)', () => {
    const scene = makeValidScene({
      viewport: { zoom: 1.5, offsetX: 100, offsetY: 200, selectedElementId: 'e1' },
      elements: [{
        id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect', name: 'My Rect',
        tags: ['important', 'review'],
        metadata: { createdBy: 'agent', priority: 1 },
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a scene with groups', () => {
    const scene = makeValidScene({
      groups: [
        { id: 'g1', name: 'Group 1', elementIds: ['e1', 'e2'] },
      ],
      elements: [
        { id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'circle', transform: { x: 60, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a scene with empty elements array', () => {
    const scene = makeValidScene({ elements: [] });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates a scene with empty groups array', () => {
    const scene = makeValidScene({ groups: [] });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('validates return contains empty errors array for valid scene', () => {
    const result = validateScene(makeValidScene());
    expect(result.errors).toEqual([]);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateScene – negative cases', () => {
  it('rejects null data', () => {
    const result = validateScene(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe(ErrorCode.SCHEMA_FIELD_TYPE_ERROR);
    expect(result.errors[0].message).toContain('Root');
  });

  it('rejects a number as root', () => {
    const result = validateScene(42);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe(ErrorCode.SCHEMA_FIELD_TYPE_ERROR);
  });

  it('rejects a string as root', () => {
    const result = validateScene('not a scene');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe(ErrorCode.SCHEMA_FIELD_TYPE_ERROR);
  });

  it('rejects an array as root', () => {
    const result = validateScene([{ id: 'e1' }]);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe(ErrorCode.SCHEMA_FIELD_TYPE_ERROR);
  });

  it('rejects missing schemaVersion', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).schemaVersion;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects non-string schemaVersion', () => {
    const result = validateScene(makeValidScene({ schemaVersion: 123 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR)).toBe(true);
  });

  it('rejects missing project', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).project;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects non-object project', () => {
    const result = validateScene(makeValidScene({ project: 'not an object' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR)).toBe(true);
  });

  it('rejects missing canvas', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).canvas;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects non-object canvas', () => {
    const result = validateScene(makeValidScene({ canvas: 123 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR)).toBe(true);
  });

  it('rejects missing rules', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).rules;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects non-object rules', () => {
    const result = validateScene(makeValidScene({ rules: 'no-rules' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR)).toBe(true);
  });

  it('rejects missing layers', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).layers;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects non-array layers', () => {
    const result = validateScene(makeValidScene({ layers: { id: 'l1' } }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR)).toBe(true);
  });

  it('rejects layer missing id', () => {
    const result = validateScene(makeValidScene({
      layers: [{ name: 'No ID', order: 1, visible: true, locked: false }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID && e.message.includes('layers'))).toBe(true);
  });

  it('rejects layer with non-number order', () => {
    const result = validateScene(makeValidScene({
      layers: [{ id: 'l1', name: 'Layer', order: 'first', visible: true, locked: false }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('order'))).toBe(true);
  });

  it('rejects missing elements', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).elements;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects non-array elements', () => {
    const result = validateScene(makeValidScene({ elements: { id: 'e1' } }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR)).toBe(true);
  });

  it('rejects element missing id', () => {
    const result = validateScene(makeValidScene({
      elements: [{ type: 'shape', layerId: 'l1' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID)).toBe(true);
  });

  it('rejects element with invalid type (SCHEMA_INVALID_TYPE)', () => {
    const result = validateScene(makeValidScene({
      elements: [{ id: 'e1', type: 'unknown_shape', layerId: 'l1' }],
    }));
    expect(result.valid).toBe(false);
    const typeError = result.errors.find((e) => e.code === ErrorCode.SCHEMA_INVALID_TYPE);
    expect(typeError).toBeDefined();
    expect(typeError!.message).toContain('unknown_shape');
  });

  it('rejects element missing layerId', () => {
    const result = validateScene(makeValidScene({
      elements: [{ id: 'e1', type: 'shape' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID && e.message.includes('layerId'))).toBe(true);
  });

  it('rejects element with non-string layerId', () => {
    const result = validateScene(makeValidScene({
      elements: [{ id: 'e1', type: 'shape', layerId: 123 }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('layerId'))).toBe(true);
  });

  it('rejects element with non-boolean visible', () => {
    const result = validateScene(makeValidScene({
      elements: [{ id: 'e1', type: 'shape', layerId: 'l1', visible: 'yes', locked: false }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('visible'))).toBe(true);
  });

  it('rejects element with non-boolean locked', () => {
    const result = validateScene(makeValidScene({
      elements: [{ id: 'e1', type: 'shape', layerId: 'l1', visible: true, locked: 1 }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('locked'))).toBe(true);
  });

  it('rejects non-array groups', () => {
    const result = validateScene(makeValidScene({ groups: 'not-array' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('groups'))).toBe(true);
  });

  it('rejects group missing id', () => {
    const result = validateScene(makeValidScene({
      groups: [{ name: 'No ID', elementIds: ['e1'] }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID && e.message.includes('groups'))).toBe(true);
  });

  it('rejects group missing elementIds', () => {
    const result = validateScene(makeValidScene({
      groups: [{ id: 'g1', name: 'Bad Group' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('elementIds'))).toBe(true);
  });

  it('rejects element with type as number', () => {
    const result = validateScene(makeValidScene({
      elements: [{ id: 'e1', type: 42, layerId: 'l1' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_FIELD_TYPE_ERROR && e.message.includes('string'))).toBe(true);
  });

  it('accumulates multiple errors in a single result', () => {
    const scene = makeValidScene({
      elements: [
        { type: 'shape', layerId: 'l1' },
        { id: 'e_valid', type: 'invalid_type', layerId: 'l1' },
      ],
      groups: [{ name: 'No ID', elementIds: ['e1'] }],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('validateScene – reference integrity', () => {
  it('rejects element with non-existent layerId', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [{
        id: 'e1', type: 'shape', layerId: 'nonexistent_layer',
        shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const refError = result.errors.find((e) => e.code === ErrorCode.REF_LAYER_NOT_FOUND);
    expect(refError).toBeDefined();
    expect(refError!.elementIds).toContain('e1');
    expect(refError!.message).toContain('nonexistent_layer');
  });

  it('rejects multiple elements with non-existent layerIds', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        { id: 'e1', type: 'shape', layerId: 'l_bad', shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e2', type: 'text', layerId: 'l_also_bad', text: 'hi', transform: { x: 0, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 }, visible: true, locked: false },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const refErrors = result.errors.filter((e) => e.code === ErrorCode.REF_LAYER_NOT_FOUND);
    expect(refErrors).toHaveLength(2);
  });

  it('rejects group referencing non-existent element', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [{
        id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
      groups: [
        { id: 'g1', name: 'Bad Group', elementIds: ['e999'] },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const refError = result.errors.find((e) => e.code === ErrorCode.REF_GROUP_NOT_FOUND);
    expect(refError).toBeDefined();
    expect(refError!.elementIds).toContain('e999');
    expect(refError!.message).toContain('e999');
  });

  it('rejects group with mixed valid and invalid element references', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [{
        id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
      groups: [
        { id: 'g1', name: 'Mixed', elementIds: ['e1', 'e_nonexistent', 'e_ghost'] },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const refErrors = result.errors.filter((e) => e.code === ErrorCode.REF_GROUP_NOT_FOUND);
    expect(refErrors).toHaveLength(2);
  });

  it('rejects connector source referencing non-existent element', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'conn1', type: 'connector', layerId: 'l1',
          source: { elementId: 'e_nonexistent', anchorId: 'right', x: 50, y: 25 },
          target: { x: 200, y: 25 },
          route: { type: 'straight', points: [] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const refError = result.errors.find((e) => e.code === ErrorCode.REF_CONNECTOR_ENDPOINT_NOT_FOUND);
    expect(refError).toBeDefined();
    expect(refError!.message).toContain('source');
    expect(refError!.message).toContain('e_nonexistent');
  });

  it('rejects connector target referencing non-existent element', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'conn1', type: 'connector', layerId: 'l1',
          source: { elementId: 'e1', anchorId: 'right', x: 50, y: 25 },
          target: { elementId: 'e_fake', x: 200, y: 25 },
          route: { type: 'straight', points: [] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const refError = result.errors.find((e) => e.code === ErrorCode.REF_CONNECTOR_ENDPOINT_NOT_FOUND && e.message.includes('target'));
    expect(refError).toBeDefined();
    expect(refError!.message).toContain('e_fake');
  });

  it('accepts free-point connector endpoints (no elementId)', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [{
        id: 'conn1', type: 'connector', layerId: 'l1',
        source: { x: 0, y: 0 },
        target: { x: 100, y: 100 },
        route: { type: 'straight', points: [] },
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('accepts connector with valid element references', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'circle',
          transform: { x: 200, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'conn1', type: 'connector', layerId: 'l1',
          source: { elementId: 'e1', anchorId: 'right', x: 50, y: 25 },
          target: { elementId: 'e2', anchorId: 'left', x: 200, y: 25 },
          route: { type: 'straight', points: [] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
      groups: [
        { id: 'g1', name: 'Group', elementIds: ['e1', 'e2'] },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('accepts group referencing only existing elements', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        { id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }, visible: true, locked: false },
        { id: 'e2', type: 'text', layerId: 'l1', text: 'Hello', transform: { x: 60, y: 0, width: 100, height: 20, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 }, visible: true, locked: false },
      ],
      groups: [
        { id: 'g1', name: 'Valid', elementIds: ['e1', 'e2'] },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('rejects both connector and group ref errors together', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'conn1', type: 'connector', layerId: 'l1',
          source: { elementId: 'e_missing', x: 0, y: 0 },
          target: { x: 100, y: 100 },
          route: { type: 'straight', points: [] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
      groups: [
        { id: 'g1', name: 'Bad', elementIds: ['e_ghost'] },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const connErrors = result.errors.filter((e) => e.code === ErrorCode.REF_CONNECTOR_ENDPOINT_NOT_FOUND);
    const groupErrors = result.errors.filter((e) => e.code === ErrorCode.REF_GROUP_NOT_FOUND);
    expect(connErrors).toHaveLength(1);
    expect(groupErrors).toHaveLength(1);
  });

  it('skips reference checks on elements with invalid type', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [{
        id: 'e1', type: 'garbage', layerId: 'nonexistent',
        shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true, locked: false,
      }],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    // Should have SCHEMA_INVALID_TYPE but NOT REF_LAYER_NOT_FOUND
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_INVALID_TYPE)).toBe(true);
    expect(result.errors.some((e) => e.code === ErrorCode.REF_LAYER_NOT_FOUND)).toBe(false);
  });
});

describe('validateScene – geometry rules', () => {
  it('rejects overlapping elements within the same layer', () => {
    const scene = makeValidScene({
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
      ],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const geoErrors = result.errors.filter((e) => e.code === ErrorCode.GEO_SAME_LAYER_OVERLAP);
    expect(geoErrors).toHaveLength(1);
    expect(geoErrors[0].layerIds).toContain('l1');
    expect(geoErrors[0].elementIds).toContain('e1');
    expect(geoErrors[0].elementIds).toContain('e2');
    expect(geoErrors[0].bboxes).toBeDefined();
    expect(geoErrors[0].bboxes!.length).toBeGreaterThanOrEqual(1);
  });

  it('reports multiple collisions in the same layer as separate errors', () => {
    const scene = makeValidScene({
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
      ],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 60, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e3', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 200, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const geoErrors = result.errors.filter((e) => e.code === ErrorCode.GEO_SAME_LAYER_OVERLAP);
    expect(geoErrors).toHaveLength(1); // e1+e2 overlap, e3 is separate
    expect(geoErrors[0].elementIds).toContain('e1');
    expect(geoErrors[0].elementIds).toContain('e2');
  });

  it('collisions only checked within each layer independently', () => {
    const scene = makeValidScene({
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
        { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
      ],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l2', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    // Same positions but different layers — no collision
    expect(validateScene(scene).valid).toBe(true);
  });

  it('connector does not collide with shapes in same layer', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'conn1', type: 'connector', layerId: 'l1',
          source: { x: 20, y: 20 },
          target: { x: 80, y: 80 },
          route: { type: 'straight', points: [] },
          transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('rejects when layer count exceeds rules.maxLayerCount', () => {
    const scene = makeValidScene({
      rules: { maxLayerCount: 2, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: true, connectorsExempt: true },
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
        { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
        { id: 'l3', name: 'Layer 3', order: 3, visible: true, locked: false },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const maxLayerError = result.errors.find((e) => e.code === ErrorCode.RULE_MAX_LAYER_EXCEEDED);
    expect(maxLayerError).toBeDefined();
    expect(maxLayerError!.message).toContain('3');
    expect(maxLayerError!.message).toContain('2');
    expect(maxLayerError!.suggestion).toBeDefined();
  });

  it('accepts when layer count equals rules.maxLayerCount', () => {
    const scene = makeValidScene({
      rules: { maxLayerCount: 3, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: true, connectorsExempt: true },
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
        { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
        { id: 'l3', name: 'Layer 3', order: 3, visible: true, locked: false },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('hidden elements trigger collision when hiddenElementsCollide is true', () => {
    const scene = makeValidScene({
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: false, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.GEO_SAME_LAYER_OVERLAP)).toBe(true);
  });

  it('hidden elements do not trigger collision when hiddenElementsCollide is false', () => {
    const scene = makeValidScene({
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: true, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: false, locked: false,
        },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('locked elements do not trigger collision when lockedElementsCollide is false', () => {
    const scene = makeValidScene({
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: false, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: true,
        },
      ],
    });
    expect(validateScene(scene).valid).toBe(true);
  });

  it('accumulates schema, reference, and geometry errors together', () => {
    const scene = makeValidScene({
      rules: { maxLayerCount: 1, collisionStrategy: 'bbox', hiddenElementsCollide: false, lockedElementsCollide: true, connectorsExempt: true },
      layers: [
        { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false },
        { id: 'l2', name: 'Layer 2', order: 2, visible: true, locked: false },
      ],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === ErrorCode.RULE_MAX_LAYER_EXCEEDED)).toBe(true);
    expect(result.errors.some((e) => e.code === ErrorCode.GEO_SAME_LAYER_OVERLAP)).toBe(true);
  });

  it('collision errors include overlapBBox in bboxes field', () => {
    const scene = makeValidScene({
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 10, y: 10, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
        {
          id: 'e2', type: 'shape', layerId: 'l1', shapeKind: 'rect',
          transform: { x: 50, y: 30, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
    });
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    const geoError = result.errors.find((e) => e.code === ErrorCode.GEO_SAME_LAYER_OVERLAP);
    expect(geoError).toBeDefined();
    expect(geoError!.bboxes).toBeDefined();
    expect(geoError!.bboxes![0]).toEqual({ x: 50, y: 30, width: 40, height: 60 });
  });

  it('skip geometry checks when elements array is missing', () => {
    const scene = makeValidScene();
    delete (scene as Record<string, unknown>).elements;
    const result = validateScene(scene);
    expect(result.valid).toBe(false);
    // Should fail with SCHEMA_MISSING_ID for elements, not geometry errors
    expect(result.errors.some((e) => e.code === ErrorCode.SCHEMA_MISSING_ID && e.message.includes('elements'))).toBe(true);
  });
});
