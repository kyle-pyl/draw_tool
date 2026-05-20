import { describe, it, expect } from 'vitest';
import { convertChartSvgToElements, type ConvertedElementResult } from '../../modules/chart/convert';
import { generateChart, type ChartGenerationConfig } from '../../modules/chart/generator';
import { parseCSV, type ParsedData } from '../../io/csv-parser';
import type { ChartElement, ElementStyle, Transform2D } from '../../core/types';

function makeData(rows: Record<string, string | number | boolean | null>[]): ParsedData {
  const csv = ['name,value,category', ...rows.map((r) => `${r.name},${r.value},${r.category}`)].join('\n');
  return parseCSV(csv);
}

const sampleData = makeData([
  { name: 'A', value: 10, category: 'X' },
  { name: 'B', value: 25, category: 'Y' },
  { name: 'C', value: 15, category: 'X' },
]);

function makeChartElement(chartType: ChartGenerationConfig['chartType'], overrides?: Partial<ChartGenerationConfig>): ChartElement {
  const config: ChartGenerationConfig = { chartType, columnMappings: { x: 'name', y: 'value' }, ...overrides };
  return generateChart(sampleData, config, 'ds-1', 'layer-1');
}

describe('convertChartSvgToElements', () => {
  describe('basic conversion', () => {
    it('returns empty array for chart element without svgContent', () => {
      const chartEl: ChartElement = {
        id: 'c1',
        type: 'chart',
        layerId: 'l1',
        name: 'Chart',
        transform: { x: 0, y: 0, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#ccc', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        dataSourceId: 'ds-1',
        chartType: 'bar',
        columnMappings: {},
      };
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements).toEqual([]);
    });

    it('converts a bar chart into multiple elements', () => {
      const chartEl = makeChartElement('bar');
      expect(chartEl.svgContent).toBeDefined();
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });

    it('converts a line chart into multiple elements', () => {
      const chartEl = makeChartElement('line');
      expect(chartEl.svgContent).toBeDefined();
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });

    it('converts a scatter chart into multiple elements', () => {
      const chartEl = makeChartElement('scatter');
      expect(chartEl.svgContent).toBeDefined();
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });

    it('converts a histogram chart into multiple elements', () => {
      const chartEl = makeChartElement('histogram');
      expect(chartEl.svgContent).toBeDefined();
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });

    it('converts a boxplot chart into multiple elements', () => {
      const chartEl = makeChartElement('boxplot');
      expect(chartEl.svgContent).toBeDefined();
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });

    it('converts a heatmap chart into multiple elements', () => {
      const chartEl = makeChartElement('heatmap');
      expect(chartEl.svgContent).toBeDefined();
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });
  });

  describe('element properties', () => {
    it('all converted elements have unique IDs', () => {
      const chartEl = makeChartElement('bar');
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      const ids = result.elements.map((el) => el.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all converted elements belong to the target layer', () => {
      const chartEl = makeChartElement('bar');
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      for (const el of result.elements) {
        expect(el.layerId).toBe('target-layer');
      }
    });

    it('all converted elements are visible and unlocked', () => {
      const chartEl = makeChartElement('bar');
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      for (const el of result.elements) {
        expect(el.visible).toBe(true);
        expect(el.locked).toBe(false);
      }
    });

    it('converted elements include shapes and text', () => {
      const chartEl = makeChartElement('bar', { title: 'Revenue Chart' });
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      const shapes = result.elements.filter((el) => el.type === 'shape');
      const texts = result.elements.filter((el) => el.type === 'text');
      expect(shapes.length).toBeGreaterThan(0);
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('coordinate mapping', () => {
    it('maps coordinates based on chart element transform', () => {
      const chartEl = makeChartElement('bar');
      chartEl.transform = { x: 100, y: 200, width: 300, height: 200, rotation: 0, scaleX: 1, scaleY: 1 };
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);

      for (const el of result.elements) {
        expect(el.transform.x).toBeGreaterThanOrEqual(98);
        expect(el.transform.y).toBeGreaterThanOrEqual(180);
      }
    });

    it('preserves the same visual layout for bars regardless of position', () => {
      const chartEl1 = makeChartElement('bar');
      chartEl1.transform = { x: 0, y: 0, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 };
      const result1 = convertChartSvgToElements(chartEl1, 'l1');

      const chartEl2 = makeChartElement('bar');
      chartEl2.transform = { x: 200, y: 100, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 };
      const result2 = convertChartSvgToElements(chartEl2, 'l1');

      expect(result1.elements.length).toBe(result2.elements.length);

      for (let i = 0; i < result1.elements.length; i++) {
        const el1 = result1.elements[i];
        const el2 = result2.elements[i];
        if (el1.type === 'shape' && el2.type === 'shape') {
          expect(el2.transform.x).toBe(el1.transform.x + 200);
          expect(el2.transform.y).toBe(el1.transform.y + 100);
        }
      }
    });

    it('scales coordinates when chart element size differs from SVG viewBox', () => {
      const chartEl = makeChartElement('bar');
      chartEl.transform = { x: 0, y: 0, width: 300, height: 200, rotation: 0, scaleX: 1, scaleY: 1 };
      const resultScaled = convertChartSvgToElements(chartEl, 'l1');

      chartEl.transform = { x: 0, y: 0, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 };
      const resultFull = convertChartSvgToElements(chartEl, 'l1');

      expect(resultScaled.elements.length).toBe(resultFull.elements.length);

      for (let i = 0; i < resultFull.elements.length; i++) {
        const elFull = resultFull.elements[i];
        const elScaled = resultScaled.elements[i];
        if (elFull.type === 'shape' && elScaled.type === 'shape') {
          expect(elScaled.transform.x).toBeCloseTo(elFull.transform.x / 2, 0);
          expect(elScaled.transform.y).toBeCloseTo(elFull.transform.y / 2, 0);
        }
      }
    });
  });

  describe('rect element conversion', () => {
    it('converts SVG rect to shape rect elements', () => {
      const chartEl = makeChartElement('bar');
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      const rectShapes = result.elements.filter(
        (el) => el.type === 'shape' && (el as any).shapeKind === 'rect',
      );
      expect(rectShapes.length).toBeGreaterThan(0);
    });
  });

  describe('text element conversion', () => {
    it('extracts text content from SVG text elements', () => {
      const chartEl = makeChartElement('bar', { title: 'Revenue' });
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      const textElements = result.elements.filter((el) => el.type === 'text');
      expect(textElements.length).toBeGreaterThan(0);

      const texts = textElements.map((el) => (el as any).text);
      const titleTextEl = textElements.find((el) => {
        const t = el as any;
        return t.text?.toLowerCase().includes('revenue');
      });
      expect(titleTextEl).toBeDefined();
    });

    it('preserves font styles on text elements', () => {
      const chartEl = makeChartElement('bar', { title: 'My Chart' });
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      const textElements = result.elements.filter((el) => el.type === 'text');
      const boldText = textElements.find((el) => el.style.fontWeight === 'bold');
      expect(boldText).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles chart with no data', () => {
      const emptyData = makeData([]);
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const chartEl = generateChart(emptyData, config, 'ds-1', 'layer-1');
      expect(chartEl.svgContent).toContain('No data available');
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBeGreaterThan(0);
    });

    it('handles empty SVG string', () => {
      const chartEl: ChartElement = {
        id: 'c1',
        type: 'chart',
        layerId: 'l1',
        name: 'Chart',
        transform: { x: 0, y: 0, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#ccc', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        dataSourceId: 'ds-1',
        chartType: 'bar',
        columnMappings: {},
        svgContent: '',
      };
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements).toEqual([]);
    });

    it('handles SVG with only self-closing tags', () => {
      const chartEl: ChartElement = {
        id: 'c1',
        type: 'chart',
        layerId: 'l1',
        name: 'Chart',
        transform: { x: 0, y: 0, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: '#fff', stroke: '#ccc', strokeWidth: 1, opacity: 1 },
        visible: true,
        locked: false,
        dataSourceId: 'ds-1',
        chartType: 'bar',
        columnMappings: {},
        svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect x="10" y="20" width="30" height="40" fill="#f00"/><circle cx="100" cy="100" r="20" fill="#0f0"/></svg>',
      };
      const result = convertChartSvgToElements(chartEl, 'target-layer');
      expect(result.elements.length).toBe(2);
    });

    it('generates different IDs for each element', () => {
      const chartEl = makeChartElement('bar');
      const result = convertChartSvgToElements(chartEl, 'layer-a');
      const result2 = convertChartSvgToElements(chartEl, 'layer-b');
      const allIds = [...result.elements.map((e) => e.id), ...result2.elements.map((e) => e.id)];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });
});
