import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  unregisterTemplate,
  clearTemplates,
  instantiateTemplate,
  createTemplateInstance,
} from '../../core/templates';
import type { TemplateDefinition } from '../../core/templates';

const DEFAULT_STYLE = {
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 2,
  opacity: 1,
};

const defaultTransform = {
  x: 0,
  y: 0,
  width: 100,
  height: 60,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

const simpleRectTemplate: TemplateDefinition = {
  id: 'simple-rect',
  name: 'Simple Rectangle',
  category: '基础几何',
  elements: [
    {
      type: 'shape',
      name: 'rect',
      shapeKind: 'rect',
      transform: defaultTransform,
      style: DEFAULT_STYLE,
    },
  ],
};

const twoElementsTemplate: TemplateDefinition = {
  id: 'two-elements',
  name: 'Two Elements',
  category: '基础几何',
  defaultStyle: { fill: '#eeeeee' },
  elements: [
    {
      type: 'shape',
      name: 'rect-a',
      shapeKind: 'rect',
      transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: DEFAULT_STYLE,
    },
    {
      type: 'text',
      name: 'label',
      text: 'Hello',
      transform: { x: 10, y: 80, width: 80, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
    },
  ],
};

const templateWithConnector: TemplateDefinition = {
  id: 'with-connector',
  name: 'Two Rectangles Connected',
  category: '流程图',
  defaultStyle: { fill: '#ffffff', stroke: '#333333', strokeWidth: 2, opacity: 1 },
  elements: [
    {
      type: 'shape',
      name: 'src',
      shapeKind: 'rect',
      transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#e0e0ff', stroke: '#0000ff', strokeWidth: 2, opacity: 1 },
    },
    {
      type: 'shape',
      name: 'tgt',
      shapeKind: 'rect',
      transform: { x: 200, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: '#ffe0e0', stroke: '#ff0000', strokeWidth: 2, opacity: 1 },
    },
  ],
  connectors: [
    {
      sourceElementIndex: 0,
      targetElementIndex: 1,
      sourceAnchorId: 'right',
      targetAnchorId: 'left',
      arrowEnd: { type: 'triangle' },
    },
  ],
};

beforeEach(() => {
  clearTemplates();
});

// ─── Registration ──────────────────────────────────────────────────────────────

describe('registerTemplate', () => {
  it('should register a template and make it retrievable', () => {
    registerTemplate(simpleRectTemplate);
    expect(getTemplate('simple-rect')).toBe(simpleRectTemplate);
  });

  it('should overwrite a template with the same id', () => {
    registerTemplate(simpleRectTemplate);
    const v2: TemplateDefinition = { ...simpleRectTemplate, name: 'Updated' };
    registerTemplate(v2);
    expect(getTemplate('simple-rect')?.name).toBe('Updated');
  });

  it('should allow registering multiple templates', () => {
    registerTemplate(simpleRectTemplate);
    registerTemplate(twoElementsTemplate);
    expect(getTemplate('simple-rect')).toBeDefined();
    expect(getTemplate('two-elements')).toBeDefined();
  });
});

// ─── Retrieval ────────────────────────────────────────────────────────────────

describe('getTemplate', () => {
  it('should return undefined for unregistered template', () => {
    expect(getTemplate('nonexistent')).toBeUndefined();
  });

  it('should return the exact template reference', () => {
    registerTemplate(simpleRectTemplate);
    expect(getTemplate('simple-rect')?.id).toBe('simple-rect');
    expect(getTemplate('simple-rect')?.elements.length).toBe(1);
  });
});

describe('getAllTemplates', () => {
  it('should return empty array when no templates registered', () => {
    expect(getAllTemplates()).toEqual([]);
  });

  it('should return all registered templates', () => {
    registerTemplate(simpleRectTemplate);
    registerTemplate(twoElementsTemplate);
    expect(getAllTemplates().length).toBe(2);
  });
});

describe('getTemplatesByCategory', () => {
  it('should filter templates by category', () => {
    registerTemplate(simpleRectTemplate);
    registerTemplate(templateWithConnector);
    expect(getTemplatesByCategory('基础几何').length).toBe(1);
    expect(getTemplatesByCategory('流程图').length).toBe(1);
    expect(getTemplatesByCategory('nonexistent').length).toBe(0);
  });
});

// ─── Removal ───────────────────────────────────────────────────────────────────

describe('unregisterTemplate', () => {
  it('should remove a registered template and return true', () => {
    registerTemplate(simpleRectTemplate);
    expect(unregisterTemplate('simple-rect')).toBe(true);
    expect(getTemplate('simple-rect')).toBeUndefined();
  });

  it('should return false for nonexistent template', () => {
    expect(unregisterTemplate('nonexistent')).toBe(false);
  });
});

describe('clearTemplates', () => {
  it('should remove all templates', () => {
    registerTemplate(simpleRectTemplate);
    registerTemplate(twoElementsTemplate);
    clearTemplates();
    expect(getAllTemplates().length).toBe(0);
  });
});

// ─── Instantiation ────────────────────────────────────────────────────────────

describe('instantiateTemplate', () => {
  it('should throw for unregistered template', () => {
    expect(() => instantiateTemplate('nonexistent', { x: 0, y: 0 }, 'l1')).toThrow(
      'Template "nonexistent" not found.',
    );
  });

  it('should create a single shape element with correct position offset', () => {
    registerTemplate(simpleRectTemplate);
    const elements = instantiateTemplate('simple-rect', { x: 50, y: 100 }, 'layer-1');

    expect(elements.length).toBe(1);
    const el = elements[0];
    expect(el.type).toBe('shape');
    expect(el.layerId).toBe('layer-1');
    expect(el.transform.x).toBe(50);
    expect(el.transform.y).toBe(100);
    expect(el.transform.width).toBe(100);
    expect(el.transform.height).toBe(60);
  });

  it('should generate unique IDs for instantiated elements', () => {
    registerTemplate(simpleRectTemplate);
    const batch1 = instantiateTemplate('simple-rect', { x: 0, y: 0 }, 'l1');
    const batch2 = instantiateTemplate('simple-rect', { x: 0, y: 0 }, 'l1');
    expect(batch1[0].id).not.toBe(batch2[0].id);
  });

  it('should generate IDs with name-based prefix', () => {
    registerTemplate(simpleRectTemplate);
    const elements = instantiateTemplate('simple-rect', { x: 0, y: 0 }, 'l1');
    expect(elements[0].id).toMatch(/^rect_/);
  });

  it('should instantiate multiple elements with correct positions', () => {
    registerTemplate(twoElementsTemplate);
    const elements = instantiateTemplate('two-elements', { x: 100, y: 200 }, 'layer-x');

    expect(elements.length).toBe(2);

    const rect = elements[0];
    expect(rect.type).toBe('shape');
    expect(rect.transform.x).toBe(100);
    expect(rect.transform.y).toBe(200);

    const text = elements[1];
    expect(text.type).toBe('text');
    expect(text.transform.x).toBe(110); // 10 + 100
    expect(text.transform.y).toBe(280); // 80 + 200
  });

  it('should apply defaultStyle from template', () => {
    registerTemplate(twoElementsTemplate);
    const elements = instantiateTemplate('two-elements', { x: 0, y: 0 }, 'l1');

    // defaultStyle sets fill to #eeeeee, but element style overrides
    const rect = elements[0];
    expect(rect.style.fill).toBe('#ffffff'); // element style overrides
    expect(rect.style.stroke).toBe('#000000'); // from element style
  });

  it('should create connector elements linking template elements', () => {
    registerTemplate(templateWithConnector);
    const elements = instantiateTemplate('with-connector', { x: 10, y: 20 }, 'l1');

    // 2 shape elements + 1 connector = 3 elements
    expect(elements.length).toBe(3);

    const connector = elements[2];
    expect(connector.type).toBe('connector');

    if (connector.type !== 'connector') {
      throw new Error('Expected connector element');
    }

    // Connector should reference the generated IDs of source and target
    expect(connector.source.elementId).toBe(elements[0].id);
    expect(connector.target.elementId).toBe(elements[1].id);
    expect(connector.source.anchorId).toBe('right');
    expect(connector.target.anchorId).toBe('left');
    expect(connector.arrowEnd?.type).toBe('triangle');
  });

  it('should offset connector route points by position', () => {
    const tpl: TemplateDefinition = {
      id: 'conn-route',
      name: 'Connector with Route',
      category: 'test',
      elements: [
        {
          type: 'shape',
          name: 's',
          shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
          style: DEFAULT_STYLE,
        },
        {
          type: 'shape',
          name: 't',
          shapeKind: 'rect',
          transform: { x: 200, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
          style: DEFAULT_STYLE,
        },
      ],
      connectors: [
        {
          sourceElementIndex: 0,
          targetElementIndex: 1,
          route: {
            type: 'polyline',
            points: [
              { x: 50, y: 30 },
              { x: 150, y: 30 },
            ],
          },
        },
      ],
    };
    registerTemplate(tpl);
    const elements = instantiateTemplate('conn-route', { x: 100, y: 50 }, 'l1');

    expect(elements.length).toBe(3);
    const conn = elements[2];
    if (conn.type !== 'connector') throw new Error('Expected connector');
    expect(conn.route.type).toBe('polyline');
    expect(conn.route.points[0].x).toBe(150); // 50 + 100
    expect(conn.route.points[0].y).toBe(80); // 30 + 50
    expect(conn.route.points[1].x).toBe(250); // 150 + 100
    expect(conn.route.points[1].y).toBe(80); // 30 + 50
  });

  it('should throw for invalid connector element indices', () => {
    const tpl: TemplateDefinition = {
      id: 'bad-conn',
      name: 'Bad Connector',
      category: 'test',
      elements: [
        {
          type: 'shape',
          name: 's',
          shapeKind: 'rect',
          transform: defaultTransform,
          style: DEFAULT_STYLE,
        },
      ],
      connectors: [
        { sourceElementIndex: 0, targetElementIndex: 99 },
      ],
    };
    registerTemplate(tpl);
    expect(() => instantiateTemplate('bad-conn', { x: 0, y: 0 }, 'l1')).toThrow(
      /invalid element index/,
    );
  });

  it('should create elements with correct layerId', () => {
    registerTemplate(simpleRectTemplate);
    const elements = instantiateTemplate('simple-rect', { x: 0, y: 0 }, 'my-layer');

    elements.forEach((el) => {
      expect(el.layerId).toBe('my-layer');
    });
  });

  it('should preserve element custom visibility and locked state', () => {
    const tpl: TemplateDefinition = {
      id: 'hidden-locked',
      name: 'Hidden and Locked',
      category: 'test',
      elements: [
        {
          type: 'shape',
          name: 's',
          shapeKind: 'rect',
          transform: defaultTransform,
          style: DEFAULT_STYLE,
          visible: false,
          locked: true,
        },
      ],
    };
    registerTemplate(tpl);
    const elements = instantiateTemplate('hidden-locked', { x: 0, y: 0 }, 'l1');

    expect(elements[0].visible).toBe(false);
    expect(elements[0].locked).toBe(true);
  });

  it('should default to visible:true and locked:false', () => {
    registerTemplate(simpleRectTemplate);
    const elements = instantiateTemplate('simple-rect', { x: 0, y: 0 }, 'l1');

    expect(elements[0].visible).toBe(true);
    expect(elements[0].locked).toBe(false);
  });

  it('should create text element with text content', () => {
    registerTemplate(twoElementsTemplate);
    const elements = instantiateTemplate('two-elements', { x: 0, y: 0 }, 'l1');
    const text = elements[1];
    expect(text.type).toBe('text');
    if (text.type !== 'text') throw new Error('Expected text element');
    expect(text.text).toBe('Hello');
  });

  it('should create different element types correctly', () => {
    const tpl: TemplateDefinition = {
      id: 'multi-types',
      name: 'Multiple Element Types',
      category: 'test',
      elements: [
        {
          type: 'shape',
          name: 'circle',
          shapeKind: 'circle',
          transform: { x: 0, y: 0, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: DEFAULT_STYLE,
        },
        {
          type: 'text',
          name: 'txt',
          text: 'test',
          transform: { x: 60, y: 10, width: 80, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1 },
          backgroundColor: '#ffff00',
          borderColor: '#000000',
          borderWidth: 1,
        },
        {
          type: 'container',
          name: 'box',
          containerLabel: 'My Container',
          transform: { x: 0, y: 0, width: 200, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: 'none', stroke: '#999', strokeWidth: 1, opacity: 1 },
        },
      ],
    };
    registerTemplate(tpl);
    const elements = instantiateTemplate('multi-types', { x: 10, y: 10 }, 'l1');

    expect(elements.length).toBe(3);
    expect(elements[0].type).toBe('shape');
    expect(elements[1].type).toBe('text');
    expect(elements[2].type).toBe('container');

    const text = elements[1] as { type: 'text'; text: string; backgroundColor?: string; borderColor?: string; borderWidth?: number };
    expect(text.text).toBe('test');
    expect(text.backgroundColor).toBe('#ffff00');
    expect(text.borderColor).toBe('#000000');
    expect(text.borderWidth).toBe(1);

    const container = elements[2] as { type: 'container'; containerLabel?: string };
    expect(container.containerLabel).toBe('My Container');
  });

  it('should create connector without arrow styles when none specified', () => {
    const tpl: TemplateDefinition = {
      id: 'conn-no-arrow',
      name: 'Connector No Arrow',
      category: 'test',
      elements: [
        {
          type: 'shape',
          name: 'a',
          shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
          style: DEFAULT_STYLE,
        },
        {
          type: 'shape',
          name: 'b',
          shapeKind: 'rect',
          transform: { x: 200, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
          style: DEFAULT_STYLE,
        },
      ],
      connectors: [
        { sourceElementIndex: 0, targetElementIndex: 1 },
      ],
    };
    registerTemplate(tpl);
    const elements = instantiateTemplate('conn-no-arrow', { x: 0, y: 0 }, 'l1');

    expect(elements.length).toBe(3);
    const conn = elements[2];
    if (conn.type !== 'connector') throw new Error('Expected connector');
    expect(conn.source.elementId).toBe(elements[0].id);
    expect(conn.target.elementId).toBe(elements[1].id);
    expect(conn.route.type).toBe('straight');
  });
});

// ─── createTemplateInstance ────────────────────────────────────────────────────

describe('createTemplateInstance', () => {
  it('should create a template instance record', () => {
    const record = createTemplateInstance('tpl-1', { x: 10, y: 20 }, 'l1', ['e1', 'e2']);
    expect(record.templateId).toBe('tpl-1');
    expect(record.position).toEqual({ x: 10, y: 20 });
    expect(record.layerId).toBe('l1');
    expect(record.elementIds).toEqual(['e1', 'e2']);
  });

  it('should include params when provided', () => {
    const record = createTemplateInstance('tpl-1', { x: 0, y: 0 }, 'l1', ['e1'], { color: 'red' });
    expect(record.params).toEqual({ color: 'red' });
  });

  it('should omit params when not provided', () => {
    const record = createTemplateInstance('tpl-1', { x: 0, y: 0 }, 'l1', ['e1']);
    expect(record.params).toBeUndefined();
  });
});
