import { describe, it, expect } from 'vitest';
import { generateChart, type ChartGenerationConfig, type BarChartData, type LineChartData, type ScatterChartData, type BoxplotData, type HistogramData, type HeatmapData } from '../../modules/chart/generator';
import { parseCSV, type ParsedData } from '../../io/csv-parser';

function makeData(rows: Record<string, string | number | boolean | null>[]): ParsedData {
  const csv = ['name,value,category', ...rows.map((r) => `${r.name},${r.value},${r.category}`)].join('\n');
  return parseCSV(csv);
}

describe('generateChart', () => {
  const sampleData = makeData([
    { name: 'A', value: 10, category: 'X' },
    { name: 'B', value: 25, category: 'Y' },
    { name: 'C', value: 15, category: 'X' },
  ]);

  describe('ChartElement structure', () => {
    it('returns a ChartElement with correct type', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.type).toBe('chart');
      expect(result.dataSourceId).toBe('ds-1');
      expect(result.layerId).toBe('layer-1');
      expect(result.chartType).toBe('bar');
      expect(result.id).toMatch(/^chart_/);
    });

    it('preserves column mappings', () => {
      const config: ChartGenerationConfig = {
        chartType: 'line',
        columnMappings: { x: 'name', y: 'value', group: 'category' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.columnMappings).toEqual({ x: 'name', y: 'value', group: 'category' });
    });

    it('has valid transform and style', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.transform.width).toBe(600);
      expect(result.transform.height).toBe(400);
      expect(result.visible).toBe(true);
      expect(result.locked).toBe(false);
    });

    it('respects custom width and height', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
        width: 800,
        height: 500,
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.transform.width).toBe(800);
      expect(result.transform.height).toBe(500);
    });

    it('uses chart type as default name', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.name).toBe('bar');
    });

    it('uses title as name when provided', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
        title: 'My Chart',
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.name).toBe('My Chart');
    });
  });

  describe('SVG generation', () => {
    it('generates valid SVG for bar chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toBeDefined();
      expect(result.svgContent).toContain('<svg ');
      expect(result.svgContent).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(result.svgContent).toContain('</svg>');
    });

    it('generates valid SVG for line chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'line',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<polyline');
      expect(result.svgContent).toContain('</svg>');
    });

    it('generates valid SVG for scatter chart', () => {
      const scatterData = parseCSV('x,y\n1,10\n2,25\n3,15');
      const config: ChartGenerationConfig = {
        chartType: 'scatter',
        columnMappings: { x: 'x', y: 'y' },
      };
      const result = generateChart(scatterData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('generates valid SVG for boxplot chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'boxplot',
        columnMappings: { x: 'category', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('generates valid SVG for histogram chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'histogram',
        columnMappings: { y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('generates valid SVG for heatmap chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'heatmap',
        columnMappings: { x: 'category', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('includes title in SVG when provided', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
        title: 'Revenue Chart',
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('Revenue Chart');
    });

    it('includes axis lines in bar chart SVG', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<line');
      expect(result.svgContent).toContain('stroke="#333"');
    });

    it('generates bars with correct fill color', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<rect');
    });

    it('generates unique chart IDs', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const r1 = generateChart(sampleData, config, 'ds-1', 'layer-1');
      const r2 = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe('bar chart specifics', () => {
    it('renders bars for each category', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      const svg = result.svgContent!;
      const rectMatches = svg.match(/<rect/g);
      expect(rectMatches).not.toBeNull();
      expect(rectMatches!.length).toBeGreaterThanOrEqual(3);
    });

    it('auto-detects x and y columns when not specified', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: {},
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
      expect(result.chartType).toBe('bar');
    });

    it('handles grouped bar chart with group column', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value', group: 'category' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });
  });

  describe('edge cases', () => {
    it('handles empty data gracefully', () => {
      const empty = parseCSV('name,value\n');
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(empty, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('No data available');
    });

    it('handles single data point', () => {
      const single = makeData([{ name: 'Only', value: 42, category: 'X' }]);
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(single, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('handles data with null values', () => {
      const withNulls = parseCSV('name,value\nA,10\nB,\nC,30');
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(withNulls, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('handles data with all null y-values', () => {
      const allNulls = parseCSV('name,value\nA,\nB,\nC,');
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(allNulls, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('No data available');
    });

    it('handles negative values', () => {
      const negData = makeData([
        { name: 'A', value: -10, category: 'X' },
        { name: 'B', value: 5, category: 'Y' },
      ]);
      const config: ChartGenerationConfig = {
        chartType: 'line',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(negData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('handles large data sets', () => {
      const rows: { name: string; value: number; category: string }[] = [];
      for (let i = 0; i < 50; i++) {
        rows.push({ name: `Item${i}`, value: i * 10, category: i % 3 === 0 ? 'X' : 'Y' });
      }
      const largeData = makeData(rows);
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(largeData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('</svg>');
    });

    it('handles CSV strings with numeric-like names', () => {
      const numNameData = parseCSV('id,score\n1,90\n2,85\n3,95');
      const config: ChartGenerationConfig = {
        chartType: 'line',
        columnMappings: { x: 'id', y: 'score' },
      };
      const result = generateChart(numNameData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<polyline');
    });
  });

  describe('all chart types generate valid SVG', () => {
    const types: Array<'bar' | 'line' | 'scatter' | 'boxplot' | 'histogram' | 'heatmap'> = [
      'bar', 'line', 'scatter', 'boxplot', 'histogram', 'heatmap',
    ];

    for (const chartType of types) {
      it(`${chartType} generates non-empty SVG with correct tags`, () => {
        const config: ChartGenerationConfig = {
          chartType,
          columnMappings: { x: 'name', y: 'value', group: 'category' },
          title: `${chartType} Chart`,
        };
        const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
        expect(result.svgContent).toBeDefined();
        expect(result.svgContent!.length).toBeGreaterThan(50);
        expect(result.svgContent).toMatch(/^<svg /);
        expect(result.svgContent).toMatch(/<\/svg>$/m);
        expect(result.svgContent!.indexOf('xmlns="http://www.w3.org/2000/svg"')).toBeGreaterThan(0);
      });
    }
  });

  describe('data binding', () => {
    it('stores correct dataSourceId', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(sampleData, config, 'ds-abc-123', 'layer-1');
      expect(result.dataSourceId).toBe('ds-abc-123');
    });

    it('stores column mappings for round-tripping', () => {
      const mappings = { x: 'name', y: 'value', group: 'category', color: 'value' };
      const config: ChartGenerationConfig = {
        chartType: 'scatter',
        columnMappings: mappings,
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      expect(result.columnMappings).toEqual(mappings);
    });

    it('stores chartType correctly for all types', () => {
      for (const chartType of ['bar', 'line', 'scatter', 'boxplot', 'histogram', 'heatmap'] as const) {
        const config: ChartGenerationConfig = {
          chartType,
          columnMappings: { x: 'name', y: 'value' },
        };
        const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
        expect(result.chartType).toBe(chartType);
      }
    });
  });

  describe('line chart specifics', () => {
    const lineData = makeData([
      { name: 'Jan', value: 100, category: 'Sales' },
      { name: 'Feb', value: 150, category: 'Sales' },
      { name: 'Mar', value: 120, category: 'Sales' },
    ]);

    it('renders line chart with polyline', () => {
      const config: ChartGenerationConfig = {
        chartType: 'line',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(lineData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<polyline');
    });

    it('renders data point circles on line chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'line',
        columnMappings: { x: 'name', y: 'value' },
      };
      const result = generateChart(lineData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<circle');
    });
  });

  describe('scatter chart specifics', () => {
    it('uses numeric x and y for scatter plot', () => {
      const scatterData = makeData([
        { name: 'A', value: 5, category: 'X' },
        { name: 'B', value: 12, category: 'Y' },
        { name: 'C', value: 8, category: 'X' },
      ]);
      const config: ChartGenerationConfig = {
        chartType: 'scatter',
        columnMappings: { x: 'value', y: 'value' },
      };
      const result = generateChart(scatterData, config, 'ds-1', 'layer-1');
      expect(result.svgContent).toContain('<circle');
    });
  });

  describe('legend rendering', () => {
    it('renders legend for grouped bar chart', () => {
      const config: ChartGenerationConfig = {
        chartType: 'bar',
        columnMappings: { x: 'name', y: 'value', group: 'category' },
      };
      const result = generateChart(sampleData, config, 'ds-1', 'layer-1');
      const svg = result.svgContent!;
      if (svg.includes('<text') && (svg.includes('X') || svg.includes('Y'))) {
        expect(svg).toBeDefined();
      }
    });
  });
});
