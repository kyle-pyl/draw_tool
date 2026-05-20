import type { ParsedData, ColumnInfo } from '../../io/csv-parser';
import type { ChartElement, ChartType, ColumnMappings, Transform2D, ElementStyle } from '../../core/types';
import { generateId } from '../../core/utils';

export interface ChartGenerationConfig {
  chartType: ChartType;
  columnMappings: {
    x?: string;
    y?: string;
    group?: string;
    color?: string;
  };
  width?: number;
  height?: number;
  title?: string;
}

interface NumericColumnData {
  name: string;
  values: (number | null)[];
}

interface RenderContext {
  width: number;
  height: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
  chartX: number;
  chartY: number;
  chartW: number;
  chartH: number;
  title: string;
  xLabel: string;
  yLabel: string;
}

interface BarChartData {
  categories: string[];
  series: { name: string; values: (number | null)[]; color: string }[];
}

interface LineChartData {
  categories: string[];
  series: { name: string; values: (number | null)[]; color: string }[];
}

interface ScatterChartData {
  series: { name: string; points: { x: number; y: number }[]; color: string }[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface BoxplotData {
  categories: string[];
  boxes: { name: string; min: number; q1: number; median: number; q3: number; max: number; color: string }[];
}

interface HistogramData {
  bins: { label: string; min: number; max: number; count: number }[];
  xLabel: string;
  yLabel: string;
}

interface HeatmapData {
  yCategories: string[];
  xCategories: string[];
  matrix: { x: number; y: number; value: number }[];
  valueMin: number;
  valueMax: number;
}

const COLORS = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];

function tag(tagName: string, attrs: Record<string, string | number>, content?: string): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');
  if (content !== undefined) return `<${tagName} ${attrStr}>${content}</${tagName}>`;
  return `<${tagName} ${attrStr}/>`;
}

function tagLines(tagName: string, attrs: Record<string, string | number>, lines: string[]): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');
  return `<${tagName} ${attrStr}>\n${lines.join('\n')}\n</${tagName}>`;
}

function computeLayout(config: ChartGenerationConfig): RenderContext {
  const width = config.width || 600;
  const height = config.height || 400;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 50;
  const padBottom = 60;
  return {
    width,
    height,
    padLeft,
    padRight,
    padTop,
    padBottom,
    chartX: padLeft,
    chartY: padTop,
    chartW: width - padLeft - padRight,
    chartH: height - padTop - padBottom,
    title: config.title || '',
    xLabel: config.columnMappings.x || '',
    yLabel: config.columnMappings.y || '',
  };
}

function selectColumn(columns: ColumnInfo[], key?: string): ColumnInfo | undefined {
  if (!key) return undefined;
  return columns.find((c) => c.name === key);
}

function getValues(rows: Record<string, string | number | boolean | null>[], colName: string): (number | null)[] {
  return rows.map((row) => {
    const val = row[colName];
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return Number.isNaN(n) ? null : n;
  });
}

function getStrings(rows: Record<string, string | number | boolean | null>[], colName: string): string[] {
  return rows.map((row) => {
    const val = row[colName];
    if (val === null || val === undefined) return '';
    return String(val);
  });
}

function numericExtent(values: (number | null)[]): [number, number] {
  const valid = values.filter((v) => v !== null) as number[];
  if (valid.length === 0) return [0, 1];
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (min === max) return [min - 0.5, max + 0.5];
  const range = max - min;
  const padding = range * 0.05;
  return [min - padding, max + padding];
}

function niceTicks(min: number, max: number, count: number): number[] {
  const range = max - min;
  if (range <= 0) return [min];
  const roughStep = range / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let step: number;
  if (residual <= 1.5) step = magnitude;
  else if (residual <= 3) step = 2 * magnitude;
  else if (residual <= 7) step = 5 * magnitude;
  else step = 10 * magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(Math.round(v * 1e10) / 1e10);
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Number.isInteger(v)) return String(v);
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(1);
  return v.toFixed(2).replace(/\.?0+$/, '');
}

function maybeEmptySvg(ctx: RenderContext): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ctx.width} ${ctx.height}">
  ${tag('rect', { x: 0, y: 0, width: ctx.width, height: ctx.height, fill: '#fff' })}
  ${tag('text', { x: ctx.width / 2, y: ctx.height / 2, 'text-anchor': 'middle', fill: '#999', 'font-size': '14', 'font-family': 'sans-serif' }, 'No data available')}
</svg>`;
}

function svgWrap(ctx: RenderContext, bodyLines: string[], legendLines?: string[]): string {
  const lines = [
    tag('rect', { x: 0, y: 0, width: ctx.width, height: ctx.height, fill: '#fff' }),
    ...(ctx.title ? [tag('text', { x: ctx.width / 2, y: 28, 'text-anchor': 'middle', 'font-size': '15', 'font-weight': 'bold', 'font-family': 'sans-serif', fill: '#222' }, ctx.title)] : []),
    ...bodyLines,
    ...(legendLines || []),
  ];
  return tagLines('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${ctx.width} ${ctx.height}` }, lines);
}

function axes(ctx: RenderContext, xMin: number, xMax: number, yMin: number, yMax: number): string[] {
  const lines: string[] = [];
  lines.push(tag('line', { x1: ctx.chartX, y1: ctx.chartY, x2: ctx.chartX, y2: ctx.chartY + ctx.chartH, stroke: '#333', 'stroke-width': '1' }));
  lines.push(tag('line', { x1: ctx.chartX, y1: ctx.chartY + ctx.chartH, x2: ctx.chartX + ctx.chartW, y2: ctx.chartY + ctx.chartH, stroke: '#333', 'stroke-width': '1' }));

  const yTicks = niceTicks(yMin, yMax, 5);
  for (const t of yTicks) {
    const y = ctx.chartY + ctx.chartH - ((t - yMin) / (yMax - yMin)) * ctx.chartH;
    lines.push(tag('line', { x1: ctx.chartX - 4, y1: Math.round(y), x2: ctx.chartX, y2: Math.round(y), stroke: '#999', 'stroke-width': '1' }));
    lines.push(tag('line', { x1: ctx.chartX, y1: Math.round(y), x2: ctx.chartX + ctx.chartW, y2: Math.round(y), stroke: '#e0e0e0', 'stroke-width': '0.5' }));
    lines.push(tag('text', { x: ctx.chartX - 8, y: Math.round(y) + 4, 'text-anchor': 'end', 'font-size': '11', 'font-family': 'sans-serif', fill: '#555' }, formatTick(t)));
  }

  return lines;
}

function axesXCategories(ctx: RenderContext, categories: string[]): string[] {
  const lines: string[] = [];
  lines.push(tag('line', { x1: ctx.chartX, y1: ctx.chartY + ctx.chartH, x2: ctx.chartX + ctx.chartW, y2: ctx.chartY + ctx.chartH, stroke: '#333', 'stroke-width': '1' }));
  lines.push(tag('line', { x1: ctx.chartX, y1: ctx.chartY, x2: ctx.chartX, y2: ctx.chartY + ctx.chartH, stroke: '#333', 'stroke-width': '1' }));

  const catCount = categories.length;
  const slotW = ctx.chartW / catCount;
  const labelMax = 12;
  for (let i = 0; i < catCount; i++) {
    const cx = ctx.chartX + slotW * (i + 0.5);
    lines.push(tag('line', { x1: Math.round(cx), y1: ctx.chartY + ctx.chartH, x2: Math.round(cx), y2: ctx.chartY + ctx.chartH + 4, stroke: '#999', 'stroke-width': '1' }));
    let label = categories[i];
    if (label.length > labelMax) label = label.slice(0, labelMax - 1) + '\u2026';
    lines.push(tag('text', { x: Math.round(cx), y: ctx.chartY + ctx.chartH + 20, 'text-anchor': label.length > 8 ? 'start' : 'middle', transform: label.length > 8 ? `rotate(-25, ${Math.round(cx)}, ${ctx.chartY + ctx.chartH + 20})` : '', 'font-size': '11', 'font-family': 'sans-serif', fill: '#555' }, label));
  }

  return lines;
}

function renderBarChart(data: BarChartData, config: ChartGenerationConfig): string {
  const ctx = computeLayout(config);
  if (data.categories.length === 0) return maybeEmptySvg(ctx);

  const allValues = data.series.flatMap((s) => s.values.filter((v) => v !== null) as number[]);
  if (allValues.length === 0) return maybeEmptySvg(ctx);

  const [yMin, yMax] = numericExtent(allValues.flatMap((v) => [v]));

  const bodyLines: string[] = [];
  bodyLines.push(...axes(ctx, 0, 1, yMin, yMax));
  bodyLines.push(...axesXCategories(ctx, data.categories));

  const catCount = data.categories.length;
  const seriesCount = data.series.length;
  const groupW = ctx.chartW / catCount;
  const barGap = groupW * 0.15;
  const barW = Math.max(1, (groupW - barGap * 2) / seriesCount);

  for (let si = 0; si < seriesCount; si++) {
    const series = data.series[si];
    for (let ci = 0; ci < catCount; ci++) {
      const val = series.values[ci];
      if (val === null || val === undefined) continue;
      const x = ctx.chartX + groupW * ci + barGap + barW * si;
      const barH = ((val - yMin) / (yMax - yMin)) * ctx.chartH;
      const y = ctx.chartY + ctx.chartH - barH;
      bodyLines.push(tag('rect', { x: Math.round(x), y: Math.round(y), width: Math.round(barW), height: Math.round(barH), fill: series.color, stroke: '#fff', 'stroke-width': '0.5' }));
      if (seriesCount <= 3 && catCount <= 8) {
        bodyLines.push(tag('text', { x: Math.round(x + barW / 2), y: Math.round(y) - 4, 'text-anchor': 'middle', 'font-size': '10', 'font-family': 'sans-serif', fill: '#444' }, formatTick(val)));
      }
    }
  }

  const legendLines = data.series.length > 1 ? renderLegend(ctx, data.series.map((s) => ({ name: s.name, color: s.color }))) : undefined;
  return svgWrap(ctx, bodyLines, legendLines);
}

function renderLineChart(data: LineChartData, config: ChartGenerationConfig): string {
  const ctx = computeLayout(config);
  if (data.categories.length === 0) return maybeEmptySvg(ctx);

  const allValues = data.series.flatMap((s) => s.values.filter((v) => v !== null) as number[]);
  if (allValues.length === 0) return maybeEmptySvg(ctx);

  const [yMin, yMax] = numericExtent(allValues);

  const bodyLines: string[] = [];
  bodyLines.push(...axes(ctx, 0, 1, yMin, yMax));
  bodyLines.push(...axesXCategories(ctx, data.categories));

  const catCount = data.categories.length;
  const slotW = ctx.chartW / catCount;

  for (const series of data.series) {
    const validPoints: { x: number; y: number; val: number }[] = [];
    for (let ci = 0; ci < catCount; ci++) {
      const val = series.values[ci];
      if (val === null || val === undefined) continue;
      const cx = ctx.chartX + slotW * (ci + 0.5);
      const cy = ctx.chartY + ctx.chartH - ((val - yMin) / (yMax - yMin)) * ctx.chartH;
      validPoints.push({ x: cx, y: cy, val });
    }
    if (validPoints.length >= 2) {
      const pointsStr = validPoints.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');
      bodyLines.push(tag('polyline', { points: pointsStr, fill: 'none', stroke: series.color, 'stroke-width': '2', 'stroke-linejoin': 'round' }));
    }
    for (const p of validPoints) {
      bodyLines.push(tag('circle', { cx: Math.round(p.x), cy: Math.round(p.y), r: '4', fill: '#fff', stroke: series.color, 'stroke-width': '1.5' }));
    }
  }

  const legendLines = data.series.length > 1 ? renderLegend(ctx, data.series.map((s) => ({ name: s.name, color: s.color }))) : undefined;
  return svgWrap(ctx, bodyLines, legendLines);
}

function renderScatterChart(data: ScatterChartData, config: ChartGenerationConfig): string {
  const ctx = computeLayout(config);
  const allPoints = data.series.flatMap((s) => s.points);
  if (allPoints.length === 0) return maybeEmptySvg(ctx);

  const bodyLines: string[] = [];
  bodyLines.push(...axes(ctx, data.xMin, data.xMax, data.yMin, data.yMax));
  bodyLines.push(...axesXCategories(ctx, []));

  for (const series of data.series) {
    for (const pt of series.points) {
      const cx = ctx.chartX + ((pt.x - data.xMin) / (data.xMax - data.xMin)) * ctx.chartW;
      const cy = ctx.chartY + ctx.chartH - ((pt.y - data.yMin) / (data.yMax - data.yMin)) * ctx.chartH;
      bodyLines.push(tag('circle', { cx: Math.round(cx), cy: Math.round(cy), r: '5', fill: series.color, opacity: '0.7', stroke: series.color, 'stroke-width': '1' }));
    }
  }

  const legendLines = data.series.length > 1 ? renderLegend(ctx, data.series.map((s) => ({ name: s.name, color: s.color }))) : undefined;
  return svgWrap(ctx, bodyLines, legendLines);
}

function renderBoxplotChart(data: BoxplotData, config: ChartGenerationConfig): string {
  const ctx = computeLayout(config);
  if (data.boxes.length === 0) return maybeEmptySvg(ctx);

  const allVals = data.boxes.flatMap((b) => [b.min, b.q1, b.median, b.q3, b.max]);
  const [yMin, yMax] = numericExtent(allVals);

  const bodyLines: string[] = [];
  bodyLines.push(...axes(ctx, 0, 1, yMin, yMax));
  bodyLines.push(...axesXCategories(ctx, data.categories));

  const catCount = data.boxes.length;
  const slotW = ctx.chartW / catCount;

  for (let i = 0; i < catCount; i++) {
    const box = data.boxes[i];
    const cx = ctx.chartX + slotW * (i + 0.5);
    const boxW = Math.max(8, slotW * 0.5);

    const toY = (v: number) => ctx.chartY + ctx.chartH - ((v - yMin) / (yMax - yMin)) * ctx.chartH;

    const yMinV = toY(box.min);
    const yQ1 = toY(box.q1);
    const yMed = toY(box.median);
    const yQ3 = toY(box.q3);
    const yMaxV = toY(box.max);

    bodyLines.push(tag('line', { x1: Math.round(cx), y1: Math.round(yMinV), x2: Math.round(cx), y2: Math.round(yMaxV), stroke: '#555', 'stroke-width': '1' }));
    bodyLines.push(tag('line', { x1: Math.round(cx - boxW / 4), y1: Math.round(yMinV), x2: Math.round(cx + boxW / 4), y2: Math.round(yMinV), stroke: '#555', 'stroke-width': '1' }));
    bodyLines.push(tag('line', { x1: Math.round(cx - boxW / 4), y1: Math.round(yMaxV), x2: Math.round(cx + boxW / 4), y2: Math.round(yMaxV), stroke: '#555', 'stroke-width': '1' }));

    bodyLines.push(tag('rect', { x: Math.round(cx - boxW / 2), y: Math.round(yQ3), width: Math.round(boxW), height: Math.max(1, Math.round(yQ1 - yQ3)), fill: box.color, stroke: '#333', 'stroke-width': '1', opacity: '0.6' }));
    bodyLines.push(tag('line', { x1: Math.round(cx - boxW / 2), y1: Math.round(yMed), x2: Math.round(cx + boxW / 2), y2: Math.round(yMed), stroke: '#222', 'stroke-width': '2' }));
  }

  const legendLines = data.boxes.length > 1 ? renderLegend(ctx, data.boxes.map((b, i) => ({ name: b.name, color: b.color }))) : undefined;
  return svgWrap(ctx, bodyLines, legendLines);
}

function renderHistogramChart(data: HistogramData, config: ChartGenerationConfig): string {
  const ctx = computeLayout(config);
  if (data.bins.length === 0) return maybeEmptySvg(ctx);

  const counts = data.bins.map((b) => b.count);
  const [yMin, yMax] = numericExtent(counts);

  const bodyLines: string[] = [];
  bodyLines.push(...axes(ctx, 0, 1, 0, yMax));
  bodyLines.push(...axesXCategories(ctx, data.bins.map((b) => b.label)));

  const binCount = data.bins.length;
  const barW = ctx.chartW / binCount;
  const barGap = Math.max(0, barW * 0.05);

  for (let i = 0; i < binCount; i++) {
    const bin = data.bins[i];
    if (bin.count === 0) continue;
    const x = ctx.chartX + barW * i + barGap;
    const barH = (bin.count / yMax) * ctx.chartH;
    const y = ctx.chartY + ctx.chartH - barH;
    const rw = barW - barGap * 2;
    bodyLines.push(tag('rect', { x: Math.round(x), y: Math.round(y), width: Math.round(rw), height: Math.round(barH), fill: COLORS[0], stroke: '#fff', 'stroke-width': '0.5' }));
  }

  return svgWrap(ctx, bodyLines);
}

function renderHeatmapChart(data: HeatmapData, config: ChartGenerationConfig): string {
  const ctx = computeLayout(config);
  if (data.matrix.length === 0) return maybeEmptySvg(ctx);

  const xCount = data.xCategories.length;
  const yCount = data.yCategories.length;
  const cellW = ctx.chartW / xCount;
  const cellH = ctx.chartH / yCount;

  const bodyLines: string[] = [];

  for (const cell of data.matrix) {
    const t = data.valueMax !== data.valueMin ? (cell.value - data.valueMin) / (data.valueMax - data.valueMin) : 0.5;
    const clamped = Math.max(0, Math.min(1, t));
    const intensity = Math.round(clamped * 255);
    const color = `rgb(${255 - intensity}, ${Math.round(100 + intensity * 0.3)}, ${Math.round(200 - intensity * 0.7)})`;
    const x = ctx.chartX + cell.x * cellW;
    const y = ctx.chartY + cell.y * cellH;
    bodyLines.push(tag('rect', { x: Math.round(x), y: Math.round(y), width: Math.round(cellW), height: Math.round(cellH), fill: color, stroke: '#fff', 'stroke-width': '1' }));
    bodyLines.push(tag('text', { x: Math.round(x + cellW / 2), y: Math.round(y + cellH / 2 + 4), 'text-anchor': 'middle', 'font-size': '10', 'font-family': 'sans-serif', fill: clamped > 0.5 ? '#fff' : '#222' }, formatTick(cell.value)));
  }

  for (let i = 0; i < yCount; i++) {
    const y = ctx.chartY + cellH * (i + 0.5);
    let label = data.yCategories[i];
    if (label.length > 10) label = label.slice(0, 9) + '\u2026';
    bodyLines.push(tag('text', { x: ctx.chartX - 8, y: Math.round(y + 4), 'text-anchor': 'end', 'font-size': '10', 'font-family': 'sans-serif', fill: '#555' }, label));
  }
  for (let i = 0; i < xCount; i++) {
    const x = ctx.chartX + cellW * (i + 0.5);
    let label = data.xCategories[i];
    if (label.length > 8) label = label.slice(0, 7) + '\u2026';
    bodyLines.push(tag('text', { x: Math.round(x), y: ctx.chartY + ctx.chartH + cellH * yCount > ctx.chartY + ctx.chartH ? ctx.height - 10 : ctx.chartY + ctx.chartH + 20, 'text-anchor': 'middle', 'font-size': '10', 'font-family': 'sans-serif', fill: '#555' }, label));
  }

  return svgWrap(ctx, bodyLines);
}

function renderLegend(ctx: RenderContext, items: { name: string; color: string }[]): string[] {
  const itemW = 100;
  const totalW = items.length * itemW;
  const startX = (ctx.width - totalW) / 2;
  const legendY = ctx.height - 16;
  return items.map((item, i) => {
    const x = startX + i * itemW;
    return [
      tag('rect', { x: Math.round(x), y: Math.round(legendY - 8), width: '10', height: '10', fill: item.color }),
      tag('text', { x: Math.round(x + 14), y: Math.round(legendY), 'font-size': '11', 'font-family': 'sans-serif', fill: '#555' }, item.name),
    ].join('');
  });
}

function prepareBarData(data: ParsedData, config: ChartGenerationConfig): BarChartData {
  const { columnMappings } = config;
  const xCol = columnMappings.x;
  const yCol = columnMappings.y;
  const groupCol = columnMappings.group;

  if (!yCol) {
    const firstNum = data.columns.find((c) => c.inferredType === 'number');
    const catCol = data.columns.find((c) => c.inferredType === 'string');
    if (catCol && firstNum) {
      return prepareBarData(data, { ...config, columnMappings: { ...columnMappings, x: catCol.name, y: firstNum.name } });
    }
    return { categories: [], series: [] };
  }

  const yValues = getValues(data.rows, yCol);

  if (xCol && groupCol) {
    const groups = new Map<string, (number | null)[]>();
    const xSet = new Set<string>();
    for (let i = 0; i < data.rows.length; i++) {
      const gVal = String(data.rows[i][groupCol] ?? '');
      const xVal = String(data.rows[i][xCol] ?? '');
      xSet.add(xVal);
      if (!groups.has(gVal)) groups.set(gVal, []);
    }
    const categories = Array.from(xSet);
    const series: BarChartData['series'] = [];
    let ci = 0;
    for (const [gName] of groups) {
      const vals: (number | null)[] = [];
      for (let i = 0; i < data.rows.length; i++) {
        const rowG = String(data.rows[i][groupCol] ?? '');
        const rowX = String(data.rows[i][xCol] ?? '');
        if (rowG === gName && categories.includes(rowX)) {
          vals.push(yValues[i]);
        }
      }
      series.push({ name: gName, values: vals.length === categories.length ? vals : categories.map((cat) => {
        const idx = data.rows.findIndex((r, ri) => String(r[groupCol] ?? '') === gName && String(r[xCol] ?? '') === cat);
        return idx >= 0 ? yValues[idx] : null;
      }), color: COLORS[ci % COLORS.length] });
      ci++;
    }
    return { categories, series };
  }

  if (xCol) {
    const categories = getStrings(data.rows, xCol);
    return {
      categories,
      series: [{ name: yCol, values: yValues, color: COLORS[0] }],
    };
  }

  const categories = data.rows.map((_, i) => `${i + 1}`);
  return {
    categories,
    series: [{ name: yCol, values: yValues, color: COLORS[0] }],
  };
}

function prepareLineData(data: ParsedData, config: ChartGenerationConfig): LineChartData {
  const barData = prepareBarData(data, config);
  return { categories: barData.categories, series: barData.series };
}

function prepareScatterData(data: ParsedData, config: ChartGenerationConfig): ScatterChartData {
  const { columnMappings } = config;
  const xCol = columnMappings.x;
  const yCol = columnMappings.y;
  const groupCol = columnMappings.group;

  const numCols = data.columns.filter((c) => c.inferredType === 'number');
  const effectiveX = xCol || numCols[0]?.name || '';
  const effectiveY = yCol || numCols[1]?.name || numCols[0]?.name || '';

  const xVals = getValues(data.rows, effectiveX);
  const yVals = getValues(data.rows, effectiveY);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < data.rows.length; i++) {
    if (xVals[i] !== null && yVals[i] !== null) {
      points.push({ x: xVals[i]!, y: yVals[i]! });
    }
  }

  if (points.length === 0) {
    return { series: [], xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [xMin, xMax] = numericExtent(xs);
  const [yMin, yMax] = numericExtent(ys);

  if (groupCol) {
    const groups = new Map<string, { x: number; y: number }[]>();
    for (let i = 0; i < data.rows.length; i++) {
      if (xVals[i] !== null && yVals[i] !== null) {
        const g = String(data.rows[i][groupCol] ?? '');
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g)!.push({ x: xVals[i]!, y: yVals[i]! });
      }
    }
    const series = Array.from(groups).map(([name, pts], i) => ({
      name,
      points: pts,
      color: COLORS[i % COLORS.length],
    }));
    return { series, xMin, xMax, yMin, yMax };
  }

  return {
    series: [{ name: `${effectiveX} vs ${effectiveY}`, points, color: COLORS[0] }],
    xMin,
    xMax,
    yMin,
    yMax,
  };
}

function prepareBoxplotData(data: ParsedData, config: ChartGenerationConfig): BoxplotData {
  const { columnMappings } = config;
  const yCol = columnMappings.y || data.columns.find((c) => c.inferredType === 'number')?.name;
  const xCol = columnMappings.x || data.columns.find((c) => c.inferredType === 'string')?.name;

  if (!yCol) return { categories: [], boxes: [] };

  if (xCol) {
    const groups = new Map<string, number[]>();
    for (let i = 0; i < data.rows.length; i++) {
      const xVal = String(data.rows[i][xCol] ?? '');
      const yVal = Number(data.rows[i][yCol]);
      if (!Number.isNaN(yVal)) {
        if (!groups.has(xVal)) groups.set(xVal, []);
        groups.get(xVal)!.push(yVal);
      }
    }
    const categories: string[] = [];
    const boxes: BoxplotData['boxes'] = [];
    let ci = 0;
    for (const [name, vals] of groups) {
      vals.sort((a, b) => a - b);
      const n = vals.length;
      const q1 = vals[Math.floor(n * 0.25)];
      const median = vals[Math.floor(n * 0.5)];
      const q3 = vals[Math.floor(n * 0.75)];
      categories.push(name);
      boxes.push({ name, min: vals[0], q1, median, q3, max: vals[n - 1], color: COLORS[ci % COLORS.length] });
      ci++;
    }
    return { categories, boxes };
  }

  const vals = getValues(data.rows, yCol).filter((v) => v !== null) as number[];
  vals.sort((a, b) => a - b);
  const n = vals.length;
  if (n === 0) return { categories: [], boxes: [] };
  return {
    categories: [yCol],
    boxes: [{ name: yCol, min: vals[0], q1: vals[Math.floor(n * 0.25)], median: vals[Math.floor(n * 0.5)], q3: vals[Math.floor(n * 0.75)], max: vals[n - 1], color: COLORS[0] }],
  };
}

function prepareHistogramData(data: ParsedData, config: ChartGenerationConfig): HistogramData {
  const { columnMappings } = config;
  const yCol = columnMappings.y || data.columns.find((c) => c.inferredType === 'number')?.name;
  if (!yCol) return { bins: [], xLabel: '', yLabel: '' };

  const values = getValues(data.rows, yCol).filter((v) => v !== null) as number[];
  if (values.length === 0) return { bins: [], xLabel: yCol, yLabel: 'Count' };

  const [vMin, vMax] = numericExtent(values);
  const binCount = Math.max(4, Math.min(15, Math.ceil(Math.sqrt(values.length))));
  const binWidth = (vMax - vMin) / binCount;

  const bins: HistogramData['bins'] = [];
  for (let b = 0; b < binCount; b++) {
    const binMin = vMin + b * binWidth;
    const binMax = binMin + binWidth;
    const count = values.filter((v) => v >= binMin && (b === binCount - 1 ? v <= binMax : v < binMax)).length;
    bins.push({ label: `${formatTick(binMin)}-${formatTick(binMax)}`, min: binMin, max: binMax, count });
  }
  return { bins, xLabel: yCol, yLabel: 'Count' };
}

function prepareHeatmapData(data: ParsedData, config: ChartGenerationConfig): HeatmapData {
  const { columnMappings } = config;
  const xCol = columnMappings.x || data.columns[0]?.name || '';
  const yCol = columnMappings.group || columnMappings.y || data.columns[1]?.name || data.columns[0]?.name || '';
  const valCol = columnMappings.y || columnMappings.color || data.columns.find((c) => c.inferredType === 'number')?.name || '';

  if (!xCol || !valCol) return { yCategories: [], xCategories: [], matrix: [], valueMin: 0, valueMax: 1 };

  const xCategories = Array.from(new Set(getStrings(data.rows, xCol)));
  const yCategories = Array.from(new Set(getStrings(data.rows, yCol)));

  const matrix: HeatmapData['matrix'] = [];
  const vals: number[] = [];
  for (let yi = 0; yi < yCategories.length; yi++) {
    for (let xi = 0; xi < xCategories.length; xi++) {
      const row = data.rows.find((r) => String(r[xCol] ?? '') === xCategories[xi] && String(r[yCol] ?? '') === yCategories[yi]);
      const v = row ? Number(row[valCol] ?? 0) : 0;
      if (!Number.isNaN(v)) {
        matrix.push({ x: xi, y: yi, value: v });
        vals.push(v);
      }
    }
  }

  if (vals.length === 0) return { yCategories, xCategories, matrix, valueMin: 0, valueMax: 1 };

  const [vMin, vMax] = numericExtent(vals);
  return { yCategories, xCategories, matrix, valueMin: vMin, valueMax: vMax };
}

export function generateChart(
  data: ParsedData,
  config: ChartGenerationConfig,
  dataSourceId: string,
  layerId: string,
): ChartElement {
  const width = config.width || 600;
  const height = config.height || 400;
  const baseTransform: Transform2D = { x: 0, y: 0, width, height, rotation: 0, scaleX: 1, scaleY: 1 };
  const baseStyle: ElementStyle = {
    fill: '#ffffff',
    stroke: '#cccccc',
    strokeWidth: 1,
    opacity: 1,
  };

  let svgContent: string;

  switch (config.chartType) {
    case 'bar': {
      const barData = prepareBarData(data, config);
      svgContent = renderBarChart(barData, config);
      break;
    }
    case 'line': {
      const lineData = prepareLineData(data, config);
      svgContent = renderLineChart(lineData, config);
      break;
    }
    case 'scatter': {
      const scatterData = prepareScatterData(data, config);
      svgContent = renderScatterChart(scatterData, config);
      break;
    }
    case 'boxplot': {
      const boxplotData = prepareBoxplotData(data, config);
      svgContent = renderBoxplotChart(boxplotData, config);
      break;
    }
    case 'histogram': {
      const histData = prepareHistogramData(data, config);
      svgContent = renderHistogramChart(histData, config);
      break;
    }
    case 'heatmap': {
      const heatmapData = prepareHeatmapData(data, config);
      svgContent = renderHeatmapChart(heatmapData, config);
      break;
    }
    default: {
      const barData = prepareBarData(data, { ...config, chartType: 'bar' });
      svgContent = renderBarChart(barData, { ...config, chartType: 'bar' });
    }
  }

  return {
    id: generateId('chart'),
    type: 'chart',
    layerId,
    name: config.title || config.chartType,
    transform: baseTransform,
    style: baseStyle,
    visible: true,
    locked: false,
    dataSourceId,
    chartType: config.chartType,
    columnMappings: config.columnMappings,
    svgContent,
  };
}

export type { BarChartData, LineChartData, ScatterChartData, BoxplotData, HistogramData, HeatmapData };
