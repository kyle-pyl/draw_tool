import { describe, it, expect, beforeEach } from 'vitest';
import {
  getClipboard,
  setClipboard,
  clearClipboard,
  hasClipboard,
  elementToClipboardInput,
  computePastePosition,
  PASTE_OFFSET,
} from '../../core/clipboard';
import type { SceneElement, ElementInput } from '../../core/types';

function makeShape(id: string): SceneElement {
  return {
    id,
    type: 'shape',
    layerId: 'l1',
    shapeKind: 'rect',
    transform: { x: 10, y: 20, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#ff0000', stroke: '#000', strokeWidth: 2, opacity: 1 },
    visible: true,
    locked: false,
  };
}

function makeText(id: string): SceneElement {
  return {
    id,
    type: 'text',
    layerId: 'l1',
    text: 'Hello',
    transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 16 },
    visible: true,
    locked: false,
  };
}

function makeConnector(id: string): SceneElement {
  return {
    id,
    type: 'connector',
    layerId: 'l1',
    source: { x: 0, y: 0 },
    target: { x: 100, y: 100 },
    route: { type: 'straight', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }] },
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { stroke: '#000', strokeWidth: 1, opacity: 1, fill: 'none' },
    visible: true,
    locked: false,
    semanticKind: 'flow',
  };
}

describe('clipboard', () => {
  beforeEach(() => {
    clearClipboard();
  });

  describe('getClipboard / setClipboard / clearClipboard / hasClipboard', () => {
    it('starts empty', () => {
      expect(hasClipboard()).toBe(false);
      expect(getClipboard()).toEqual([]);
    });

    it('stores and retrieves items', () => {
      const input: ElementInput = {
        type: 'shape',
        layerId: 'l1',
        shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
      };
      setClipboard([input]);
      expect(hasClipboard()).toBe(true);
      expect(getClipboard().length).toBe(1);
      expect(getClipboard()[0].type).toBe('shape');
    });

    it('replaces existing items', () => {
      setClipboard([{ type: 'text', layerId: 'l1', text: 'A', transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 }, style: {}, visible: true, locked: false }]);
      setClipboard([{ type: 'text', layerId: 'l1', text: 'B', transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 }, style: {}, visible: true, locked: false }]);
      expect(getClipboard().length).toBe(1);
      expect(getClipboard()[0].text).toBe('B');
    });

    it('clears clipboard', () => {
      setClipboard([{ type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1 }, style: {}, visible: true, locked: false }]);
      clearClipboard();
      expect(hasClipboard()).toBe(false);
      expect(getClipboard().length).toBe(0);
    });

    it('stores multiple items', () => {
      setClipboard([
        { type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1 }, style: {}, visible: true, locked: false },
        { type: 'text', layerId: 'l1', text: 'Hi', transform: { x: 0, y: 0, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1 }, style: {}, visible: true, locked: false },
      ]);
      expect(getClipboard().length).toBe(2);
    });
  });

  describe('elementToClipboardInput', () => {
    it('converts shape element', () => {
      const el = makeShape('s1');
      const input = elementToClipboardInput(el);
      expect(input.type).toBe('shape');
      expect(input.shapeKind).toBe('rect');
      expect(input.transform.x).toBe(10);
      expect(input.transform.y).toBe(20);
      expect(input.style.fill).toBe('#ff0000');
      expect(input.visible).toBe(true);
    });

    it('converts shape element with points', () => {
      const el: SceneElement = {
        ...makeShape('s1'),
        shapeKind: 'polygon',
        points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }],
      };
      const input = elementToClipboardInput(el);
      expect(input.points?.length).toBe(3);
      expect(input.points?.[0]).toEqual({ x: 0, y: 0 });
    });

    it('converts text element', () => {
      const el = makeText('t1');
      const input = elementToClipboardInput(el);
      expect(input.type).toBe('text');
      expect(input.text).toBe('Hello');
    });

    it('converts image element', () => {
      const el: SceneElement = {
        id: 'img1',
        type: 'image',
        layerId: 'l1',
        src: 'blob:http://example.com/img.png',
        originalWidth: 800,
        originalHeight: 600,
        transform: { x: 0, y: 0, width: 800, height: 600, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { opacity: 1, fill: 'none', stroke: 'none', strokeWidth: 0 },
        visible: true,
        locked: false,
      };
      const input = elementToClipboardInput(el);
      expect(input.type).toBe('image');
      expect(input.src).toBe('blob:http://example.com/img.png');
      expect(input.originalWidth).toBe(800);
    });

    it('converts connector element', () => {
      const el = makeConnector('c1');
      const input = elementToClipboardInput(el);
      expect(input.type).toBe('connector');
      expect(input.source).toBeDefined();
      expect(input.target).toBeDefined();
      expect(input.route?.type).toBe('straight');
    });

    it('converts connector with labels and arrows', () => {
      const el: SceneElement = {
        ...makeConnector('c1'),
        labels: [{ text: 'label', position: 0.5, offset: { dx: 0, dy: -10 } }],
        arrowEnd: { type: 'triangle', size: 1.2 },
      };
      const input = elementToClipboardInput(el);
      expect(input.labels?.length).toBe(1);
      expect(input.labels?.[0].text).toBe('label');
      expect(input.arrowEnd?.type).toBe('triangle');
    });

    it('converts chart element', () => {
      const el: SceneElement = {
        id: 'ch1',
        type: 'chart',
        layerId: 'l1',
        dataSourceId: 'ds1',
        chartType: 'bar',
        columnMappings: { x: 'category', y: 'value' },
        transform: { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { opacity: 1, fill: 'none', stroke: 'none', strokeWidth: 0 },
        visible: true,
        locked: false,
      };
      const input = elementToClipboardInput(el);
      expect(input.type).toBe('chart');
      expect(input.chartType).toBe('bar');
      expect(input.columnMappings?.x).toBe('category');
    });

    it('copies tags and metadata', () => {
      const el: SceneElement = {
        ...makeShape('s1'),
        tags: ['tag1', 'tag2'],
        metadata: { key: 'value' },
      };
      const input = elementToClipboardInput(el);
      expect(input.tags).toEqual(['tag1', 'tag2']);
      expect(input.metadata).toEqual({ key: 'value' });
    });

    it('handles element without tags/metadata', () => {
      const el = makeShape('s1');
      const input = elementToClipboardInput(el);
      expect(input.tags).toBeUndefined();
      expect(input.metadata).toBeUndefined();
    });
  });

  describe('computePastePosition', () => {
    it('offsets from selection center', () => {
      const pos = computePastePosition({ x: 100, y: 200 });
      expect(pos.x).toBe(100 + PASTE_OFFSET);
      expect(pos.y).toBe(200 + PASTE_OFFSET);
    });

    it('uses positive offset', () => {
      const pos = computePastePosition({ x: 0, y: 0 });
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.y).toBeGreaterThan(0);
    });
  });
});
