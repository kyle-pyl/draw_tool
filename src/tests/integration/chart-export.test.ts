import { describe, it, expect, beforeEach } from 'vitest';
import { validateScene } from '../../core/validator';
import { useDocumentStore } from '../../core/store';
import { exportToSVG } from '../../io/exporters';
import { generateChart, type ChartGenerationConfig } from '../../modules/chart/generator';
import { convertChartSvgToElements } from '../../modules/chart/convert';
import { parseCSV } from '../../io/csv-parser';
import type { SceneDocument, ChartElement } from '../../core/types';

describe('Integration: Chart Generation and Export', () => {
  const csvData = `category,value
A,10
B,25
C,15
D,30
E,20`;

  beforeEach(() => {
    useDocumentStore.setState({ scene: null, isDirty: false, zoom: 1, offsetX: 0, offsetY: 0, selectedIds: new Set(), directoryHandle: null });
  });

  it('parses CSV data for chart generation', () => {
    const parsed = parseCSV(csvData);
    expect(parsed.columns.length).toBe(2);
    expect(parsed.rows.length).toBe(5);
    expect(parsed.columns[0].name).toBe('category');
    expect(parsed.columns[1].name).toBe('value');
  });

  it('generates bar chart from CSV data', () => {
    const parsed = parseCSV(csvData);
    const config: ChartGenerationConfig = {
      chartType: 'bar',
      columnMappings: { x: 'category', y: 'value' },
      title: 'Bar Chart',
      width: 600,
      height: 400,
    };

    const chartElement = generateChart(parsed, config, 'ds-test', 'l1');

    expect(chartElement).toBeDefined();
    expect(chartElement.type).toBe('chart');
    expect(chartElement.chartType).toBe('bar');
  });

  it('generates line chart from CSV data', () => {
    const parsed = parseCSV(csvData);
    const config: ChartGenerationConfig = {
      chartType: 'line',
      columnMappings: { x: 'category', y: 'value' },
    };

    const chartElement = generateChart(parsed, config, 'ds-test', 'l1');
    expect(chartElement.type).toBe('chart');
    expect(chartElement.chartType).toBe('line');
  });

  it('chart SVG content is generated', () => {
    const parsed = parseCSV(csvData);
    const config: ChartGenerationConfig = {
      chartType: 'bar',
      columnMappings: { x: 'category', y: 'value' },
    };

    const chartElement = generateChart(parsed, config, 'ds-test', 'l1');
    expect(chartElement.svgContent).toBeDefined();
    expect(chartElement.svgContent).toContain('<svg');
    expect(chartElement.svgContent).toContain('</svg>');
  });

  it('chart can be added to scene and validated', () => {
    const parsed = parseCSV(csvData);
    const config: ChartGenerationConfig = {
      chartType: 'bar',
      columnMappings: { x: 'category', y: 'value' },
    };

    const chartElement = generateChart(parsed, config, 'ds-test', 'l1');

    const scene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'With Chart' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Main', order: 1, visible: true, locked: false }],
      elements: [chartElement],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    const result = validateScene(scene);
    expect(result.valid).toBe(true);
  });

  it('converts chart to vector group', () => {
    const chartElement: ChartElement = {
      id: 'ch1',
      type: 'chart',
      layerId: 'l1',
      dataSourceId: 'ds1',
      chartType: 'bar',
      columnMappings: { x: 'category', y: 'value' },
      transform: { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: 'none', stroke: 'none', strokeWidth: 0, opacity: 1 },
      visible: true,
      locked: false,
      svgContent: '<svg viewBox="0 0 400 300"><rect x="10" y="10" width="50" height="100" fill="#4CAF50"/><text x="20" y="8" fill="#000">A</text></svg>',
    };

    const result = convertChartSvgToElements(chartElement, 'new-layer');
    expect(result.elements.length).toBeGreaterThan(0);
    expect(result.elements.some((e) => e.type === 'shape')).toBe(true);
    expect(result.elements.some((e) => e.type === 'text')).toBe(true);
  });

  it('converts chart with empty SVG content returns empty', () => {
    const chartElement: ChartElement = {
      id: 'ch1',
      type: 'chart',
      layerId: 'l1',
      dataSourceId: 'ds1',
      chartType: 'bar',
      columnMappings: { x: 'x', y: 'y' },
      transform: { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 },
      style: { fill: 'none', stroke: 'none', strokeWidth: 0, opacity: 1 },
      visible: true,
      locked: false,
    };

    const result = convertChartSvgToElements(chartElement, 'new-layer');
    expect(result.elements.length).toBe(0);
  });

  it('SVG export produces valid SVG string', () => {
    const scene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'SVG Export Test' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 'e1', type: 'shape', layerId: 'l1',
          shapeKind: 'rect',
          transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#f00', stroke: '#000', strokeWidth: 1, opacity: 1 },
          visible: true, locked: false,
        },
      ],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    const svg = exportToSVG(scene, {});
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('#f00');
    expect(svg).toContain('rect');
  });

  it('SVG export includes text elements', () => {
    const scene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'Text Export' },
      canvas: { units: 'px', background: '#fff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [
        {
          id: 't1', type: 'text', layerId: 'l1',
          text: 'Hello SVG',
          transform: { x: 0, y: 0, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { fill: '#000', stroke: 'none', strokeWidth: 0, opacity: 1, fontSize: 16 },
          visible: true, locked: false,
        },
      ],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    const svg = exportToSVG(scene, {});
    expect(svg).toContain('Hello SVG');
  });

  it('SVG export respects background option', () => {
    const scene: SceneDocument = {
      schemaVersion: '1.0.0',
      project: { name: 'Bg Test' },
      canvas: { units: 'px', background: '#ffffff', defaultFont: 'Arial', gridSize: 10, snapToGrid: false },
      rules: { maxLayerCount: 10, collisionStrategy: 'bbox', hiddenElementsCollide: true, lockedElementsCollide: true, connectorsExempt: true },
      layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
      elements: [],
      groups: [],
      dataSources: [],
      charts: [],
      templates: [],
      exportPresets: [],
    };

    const svg = exportToSVG(scene, { backgroundColor: '#abcdef' });
    expect(svg).toContain('#abcdef');
  });
});
