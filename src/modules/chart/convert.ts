import type { ChartElement, ShapeElement, TextElement, ElementStyle, Transform2D } from '../../core/types';
import { generateId } from '../../core/utils';

interface ParsedSvgElement {
  tag: string;
  attrs: Record<string, string>;
  children: ParsedSvgElement[];
  textContent: string;
}

interface SvgDimensions {
  width: number;
  height: number;
}

function parseSvgViewBox(svg: string): SvgDimensions {
  const vbMatch = svg.match(/viewBox=["']([^"']+)["']/);
  if (vbMatch) {
    const parts = vbMatch[1].split(/[\s,]+/);
    if (parts.length >= 4) {
      return { width: parseFloat(parts[2]), height: parseFloat(parts[3]) };
    }
  }
  const wMatch = svg.match(/width=["'](\d+(?:\.\d+)?)["']/);
  const hMatch = svg.match(/height=["'](\d+(?:\.\d+)?)["']/);
  return {
    width: wMatch ? parseFloat(wMatch[1]) : 600,
    height: hMatch ? parseFloat(hMatch[1]) : 400,
  };
}

function parseAttrValue(s: string, key: string, def: number): number {
  const re = new RegExp(`${key}=["']([^"']*)["']`);
  const m = s.match(re);
  if (m) {
    const v = parseFloat(m[1]);
    return Number.isNaN(v) ? def : v;
  }
  return def;
}

function parsePoints(pointStr: string): { x: number; y: number }[] {
  return pointStr
    .trim()
    .split(/[\s,]+/)
    .reduce<number[]>((acc, v) => {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) acc.push(n);
      return acc;
    }, [])
    .reduce<{ x: number; y: number }[]>((acc, v, i, arr) => {
      if (i % 2 === 0) acc.push({ x: v, y: arr[i + 1] });
      return acc;
    }, []);
}

function attrStrToNumber(attrs: Record<string, string>, key: string, def: number): number {
  if (attrs[key] !== undefined) {
    const v = parseFloat(attrs[key]);
    return Number.isNaN(v) ? def : v;
  }
  return def;
}

function extractSvgElements(svg: string): { elements: ParsedSvgElement[]; dims: SvgDimensions } {
  const dims = parseSvgViewBox(svg);
  const escaped = svg.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  const bodyMatch = escaped.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!bodyMatch) return { elements: [], dims };
  const body = bodyMatch[1];
  const elements: ParsedSvgElement[] = [];
  parseElements(body, elements);
  return { elements, dims };
}

function parseElements(html: string, results: ParsedSvgElement[], startAt = 0): number {
  let i = startAt;
  const len = html.length;

  while (i < len) {
    if (html[i] === '<') {
      if (html.slice(i, i + 4) === '<!--') {
        const end = html.indexOf('-->', i);
        i = end !== -1 ? end + 3 : len;
        continue;
      }
      if (html[i + 1] === '/') {
        return i;
      }
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) break;
      const openTag = html.slice(i + 1, tagEnd).split(/\s/);
      const tag = openTag[0].toLowerCase();
      const isSelfClosing = html[tagEnd - 1] === '/';
      const attrStr = html.slice(i + 1 + tag.length, tagEnd - (isSelfClosing ? 1 : 0));
      const attrs: Record<string, string> = {};
      const attrRe = /(\w[\w-]*)=["']([^"']*)["']/g;
      let m: RegExpExecArray | null;
      while ((m = attrRe.exec(attrStr)) !== null) {
        attrs[m[1]] = m[2];
      }

      if (isSelfClosing) {
        results.push({ tag, attrs, children: [], textContent: '' });
        i = tagEnd + 1;
        continue;
      }

      const contentStart = tagEnd + 1;
      const closingTag = `</${tag}>`;
      const closingIdx = findMatchingClose(html, contentStart, tag);
      let textContent = '';
      let children: ParsedSvgElement[] = [];

      if (closingIdx >= 0) {
        const innerContent = html.slice(contentStart, closingIdx);
        if (tag === 'text') {
          textContent = innerContent.replace(/<[^>]*>/g, '').trim();
        } else {
          const childEls: ParsedSvgElement[] = [];
          parseElements(innerContent, childEls);
          children = childEls;
        }
        i = closingIdx + closingTag.length;
      } else {
        textContent = '';
        i = contentStart;
      }

      results.push({ tag, attrs, children, textContent });
    } else {
      i++;
    }
  }

  return i;
}

function findMatchingClose(html: string, start: number, tag: string): number {
  let depth = 1;
  let i = start;
  const len = html.length;

  while (i < len) {
    const open = html.indexOf(`<${tag}`, i);
    const close = html.indexOf(`</${tag}>`, i);

    if (close === -1) return -1;

    if (open !== -1 && open < close && html[open + tag.length + 1] !== '/' && html[open + tag.length + 1] !== '>') {
      i = open + 1;
      continue;
    }

    if (open !== -1 && open < close) {
      depth++;
      i = open + tag.length + 1;
    } else {
      depth--;
      if (depth === 0) return close;
      i = close + tag.length + 3;
    }
  }

  return -1;
}

const VISUAL_TAGS = new Set(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text']);

function isVisualElement(el: ParsedSvgElement): boolean {
  return VISUAL_TAGS.has(el.tag);
}

const CHART_BG_KEYS = new Set([
  'font-family', 'font-size', 'font-weight', 'font-style',
  'text-anchor', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
  'opacity', 'fill-opacity',
]);

const SAFE_STYLE_KEYS = new Set([
  'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
  'opacity', 'fill-opacity', 'stroke-opacity',
  'font-size', 'font-family', 'font-weight', 'font-style',
  'text-anchor', 'transform',
]);

function toElementStyle(attrs: Record<string, string>): ElementStyle {
  const style: ElementStyle = {
    fill: 'none',
    stroke: 'none',
    strokeWidth: 0,
    opacity: 1,
  };

  if (attrs.fill !== undefined && attrs.fill !== 'none') style.fill = attrs.fill;
  if (attrs.stroke !== undefined && attrs.stroke !== 'none') style.stroke = attrs.stroke;
  if (attrs['stroke-width'] !== undefined) style.strokeWidth = parseFloat(attrs['stroke-width']) || 0;
  if (attrs['stroke-dasharray'] !== undefined) style.strokeDasharray = attrs['stroke-dasharray'];
  if (attrs.opacity !== undefined) style.opacity = parseFloat(attrs.opacity);
  if (attrs['fill-opacity'] !== undefined) style.fillOpacity = parseFloat(attrs['fill-opacity']);
  if (attrs['stroke-opacity'] !== undefined) style.strokeOpacity = parseFloat(attrs['stroke-opacity']);
  if (attrs['font-size'] !== undefined) style.fontSize = parseFloat(attrs['font-size']) || 12;
  if (attrs['font-family'] !== undefined) style.fontFamily = attrs['font-family'];
  if (attrs['font-weight'] !== undefined) style.fontWeight = attrs['font-weight'];
  if (attrs['font-style'] !== undefined) style.fontStyle = attrs['font-style'] as 'normal' | 'italic';
  if (attrs['text-anchor'] !== undefined) style.textAlign = mapTextAnchor(attrs['text-anchor']);

  return style;
}

function mapTextAnchor(anchor: string): 'left' | 'center' | 'right' {
  switch (anchor) {
    case 'start': return 'left';
    case 'end': return 'right';
    case 'middle': return 'center';
    default: return 'left';
  }
}

function scaleCoord(v: number, svgDim: number, chartDim: number, offset: number): number {
  const scale = chartDim / svgDim;
  return v * scale + offset;
}

export interface ConvertedElementResult {
  elements: Array<ShapeElement | TextElement>;
}

export function convertChartSvgToElements(
  chartElement: ChartElement,
  targetLayerId: string,
): ConvertedElementResult {
  const svgContent = chartElement.svgContent;
  if (!svgContent) return { elements: [] };

  const { elements: parsedEls, dims } = extractSvgElements(svgContent);
  if (parsedEls.length === 0) return { elements: [] };

  const chartX = chartElement.transform.x;
  const chartY = chartElement.transform.y;
  const chartW = chartElement.transform.width;
  const chartH = chartElement.transform.height;

  const results: Array<ShapeElement | TextElement> = [];
  const visualEls = parsedEls.filter(isVisualElement);

  for (const el of visualEls) {
    const converted = convertSingleElement(el, dims, chartX, chartY, chartW, chartH, targetLayerId);
    if (converted) {
      results.push(converted);
    }
  }

  return { elements: results };
}

function convertSingleElement(
  el: ParsedSvgElement,
  dims: SvgDimensions,
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number,
  layerId: string,
): ShapeElement | TextElement | null {
  const s = (v: number) => scaleCoord(v, dims.width, chartW, chartX);
  const t = (v: number) => scaleCoord(v, dims.height, chartH, chartY);

  const attrs = el.attrs;
  const style = toElementStyle(attrs);

  switch (el.tag) {
    case 'rect': {
      const x = attrStrToNumber(attrs, 'x', 0);
      const y = attrStrToNumber(attrs, 'y', 0);
      const w = attrStrToNumber(attrs, 'width', 0);
      const h = attrStrToNumber(attrs, 'height', 0);
      if (w <= 0 || h <= 0) return null;

      const transform: Transform2D = {
        x: s(x),
        y: t(y),
        width: scaleCoord(w, dims.width, chartW, 0),
        height: scaleCoord(h, dims.height, chartH, 0),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      return {
        id: generateId('vrect'),
        type: 'shape',
        layerId,
        name: '',
        transform,
        style,
        visible: true,
        locked: false,
        shapeKind: 'rect',
      };
    }

    case 'circle': {
      const cx = attrStrToNumber(attrs, 'cx', 0);
      const cy = attrStrToNumber(attrs, 'cy', 0);
      const r = attrStrToNumber(attrs, 'r', 0);
      if (r <= 0) return null;

      const d = r * 2;
      const transform: Transform2D = {
        x: s(cx - r),
        y: t(cy - r),
        width: scaleCoord(d, dims.width, chartW, 0),
        height: scaleCoord(d, dims.height, chartH, 0),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      return {
        id: generateId('vcircle'),
        type: 'shape',
        layerId,
        name: '',
        transform,
        style,
        visible: true,
        locked: false,
        shapeKind: 'circle',
      };
    }

    case 'ellipse': {
      const cx = attrStrToNumber(attrs, 'cx', 0);
      const cy = attrStrToNumber(attrs, 'cy', 0);
      const rx = attrStrToNumber(attrs, 'rx', 0);
      const ry = attrStrToNumber(attrs, 'ry', 0);
      if (rx <= 0 || ry <= 0) return null;

      const transform: Transform2D = {
        x: s(cx - rx),
        y: t(cy - ry),
        width: scaleCoord(rx * 2, dims.width, chartW, 0),
        height: scaleCoord(ry * 2, dims.height, chartH, 0),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      return {
        id: generateId('vellipse'),
        type: 'shape',
        layerId,
        name: '',
        transform,
        style,
        visible: true,
        locked: false,
        shapeKind: 'ellipse',
      };
    }

    case 'line': {
      const x1 = attrStrToNumber(attrs, 'x1', 0);
      const y1 = attrStrToNumber(attrs, 'y1', 0);
      const x2 = attrStrToNumber(attrs, 'x2', 0);
      const y2 = attrStrToNumber(attrs, 'y2', 0);

      const p1x = s(x1);
      const p1y = t(y1);
      const p2x = s(x2);
      const p2y = t(y2);
      const bw = Math.abs(p2x - p1x) || 1;
      const bh = Math.abs(p2y - p1y) || 1;

      const transform: Transform2D = {
        x: Math.min(p1x, p2x),
        y: Math.min(p1y, p2y),
        width: bw,
        height: bh,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      const pathD = `M ${p1x - transform.x} ${p1y - transform.y} L ${p2x - transform.x} ${p2y - transform.y}`;

      return {
        id: generateId('vline'),
        type: 'shape',
        layerId,
        name: '',
        transform,
        style: { ...style, fill: 'none' },
        visible: true,
        locked: false,
        shapeKind: 'path',
        pathCommands: pathD,
      };
    }

    case 'polyline': {
      const pointStr = attrs.points || '';
      const pts = parsePoints(pointStr);
      if (pts.length < 2) return null;
      const scaled = pts.map((p) => ({ x: s(p.x), y: t(p.y) }));
      const xs = scaled.map((p) => p.x);
      const ys = scaled.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const bw = Math.max(maxX - minX, 1);
      const bh = Math.max(maxY - minY, 1);

      const pathD = scaled
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - minX} ${p.y - minY}`)
        .join(' ');

      return {
        id: generateId('vpoly'),
        type: 'shape',
        layerId,
        name: '',
        transform: { x: minX, y: minY, width: bw, height: bh, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...style, fill: 'none' },
        visible: true,
        locked: false,
        shapeKind: 'path',
        pathCommands: pathD,
      };
    }

    case 'polygon': {
      const pointStr = attrs.points || '';
      const pts = parsePoints(pointStr);
      if (pts.length < 3) return null;
      const scaled = pts.map((p) => ({ x: s(p.x), y: t(p.y) }));
      const xs = scaled.map((p) => p.x);
      const ys = scaled.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const bw = Math.max(maxX - minX, 1);
      const bh = Math.max(maxY - minY, 1);

      const pathD = scaled
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - minX} ${p.y - minY}`)
        .join(' ')
        + ' Z';

      return {
        id: generateId('vpoly'),
        type: 'shape',
        layerId,
        name: '',
        transform: { x: minX, y: minY, width: bw, height: bh, rotation: 0, scaleX: 1, scaleY: 1 },
        style,
        visible: true,
        locked: false,
        shapeKind: 'path',
        pathCommands: pathD,
      };
    }

    case 'path': {
      const d = attrs.d || '';
      if (!d) return null;

      const coords = parsePathCoords(d);
      if (coords.length === 0) return null;

      const xs = coords.map((c) => c.x);
      const ys = coords.map((c) => c.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const bw = Math.max(maxX - minX, 1);
      const bh = Math.max(maxY - minY, 1);

      const rebased = rebasePath(d, minX, minY, s, t);

      return {
        id: generateId('vpath'),
        type: 'shape',
        layerId,
        name: '',
        transform: { x: s(minX), y: t(minY), width: scaleCoord(bw, dims.width, chartW, 0), height: scaleCoord(bh, dims.height, chartH, 0), rotation: 0, scaleX: 1, scaleY: 1 },
        style,
        visible: true,
        locked: false,
        shapeKind: 'path',
        pathCommands: rebased,
      };
    }

    case 'text': {
      const text = el.textContent;
      if (!text) return null;

      const x = attrStrToNumber(attrs, 'x', 0);
      const y = attrStrToNumber(attrs, 'y', 0);
      const fontSize = style.fontSize || 12;
      const approxW = text.length * fontSize * 0.6;
      const approxH = fontSize * 1.4;

      const transform: Transform2D = {
        x: s(x),
        y: t(y - approxH * 0.8),
        width: scaleCoord(approxW, dims.width, chartW, 0),
        height: scaleCoord(approxH, dims.height, chartH, 0),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      return {
        id: generateId('vtext'),
        type: 'text',
        layerId,
        name: text.slice(0, 30),
        transform,
        style,
        visible: true,
        locked: false,
        text,
      };
    }

    default:
      return null;
  }
}

function parsePathCoords(d: string): { x: number; y: number }[] {
  const coords: { x: number; y: number }[] = [];
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || [];
  let cx = 0;
  let cy = 0;
  let i = 0;

  while (i < tokens.length) {
    const cmdRaw = tokens[i];
    const cmd = cmdRaw.toUpperCase();
    const isRelative = cmdRaw !== cmdRaw.toUpperCase();

    if (/^[MLHVCSQTAZ]$/i.test(cmdRaw)) {
      i++;

      function nextNum(): number | null {
        while (i < tokens.length && /^[A-Za-z]$/.test(tokens[i])) i++;
        if (i >= tokens.length) return null;
        const n = parseFloat(tokens[i]);
        i++;
        return Number.isNaN(n) ? null : n;
      }

      switch (cmd) {
        case 'M': {
          const nx = nextNum();
          const ny = nextNum();
          if (nx !== null && ny !== null) {
            cx = isRelative ? cx + nx : nx;
            cy = isRelative ? cy + ny : ny;
            coords.push({ x: cx, y: cy });
          }
          while (true) {
            const nx2 = nextNum();
            if (nx2 === null) break;
            const ny2 = nextNum();
            if (ny2 === null) break;
            cx = isRelative ? cx + nx2 : nx2;
            cy = isRelative ? cy + ny2 : ny2;
            coords.push({ x: cx, y: cy });
          }
          break;
        }
        case 'L': {
          while (true) {
            const nx = nextNum();
            if (nx === null) break;
            const ny = nextNum();
            if (ny === null) break;
            cx = isRelative ? cx + nx : nx;
            cy = isRelative ? cy + ny : ny;
            coords.push({ x: cx, y: cy });
          }
          break;
        }
        case 'H': {
          while (true) {
            const nx = nextNum();
            if (nx === null) break;
            cx = isRelative ? cx + nx : nx;
            coords.push({ x: cx, y: cy });
          }
          break;
        }
        case 'V': {
          while (true) {
            const ny = nextNum();
            if (ny === null) break;
            cy = isRelative ? cy + ny : ny;
            coords.push({ x: cx, y: cy });
          }
          break;
        }
        case 'C': {
          while (true) {
            const nx3 = nextNum(); const ny3 = nextNum();
            const nx4 = nextNum(); const ny4 = nextNum();
            const nx5 = nextNum(); if (nx5 === null) break; const ny5 = nextNum(); if (ny5 === null) break;
            const ex = isRelative ? cx + nx5 : nx5;
            const ey = isRelative ? cy + ny5 : ny5;
            coords.push({ x: ex, y: ey });
            cx = ex; cy = ey;
          }
          break;
        }
        case 'S':
        case 'Q':
        case 'T': {
          while (true) {
            const nx2 = nextNum(); if (nx2 === null) break;
            const ny2 = nextNum(); if (ny2 === null) break;
            const nx3 = nextNum(); if (nx3 === null) break;
            const ny3 = nextNum(); if (ny3 === null) break;
            cx = isRelative ? cx + nx3 : nx3;
            cy = isRelative ? cy + ny3 : ny3;
            coords.push({ x: cx, y: cy });
          }
          break;
        }
        case 'A': {
          const nx = nextNum(); const ny = nextNum();
          const nr = nextNum(); const nf1 = nextNum(); const nf2 = nextNum();
          const nlx = nextNum(); if (nlx === null) break;
          const nly = nextNum(); if (nly === null) break;
          cx = isRelative ? cx + nlx : nlx;
          cy = isRelative ? cy + nly : nly;
          coords.push({ x: cx, y: cy });
          break;
        }
        case 'Z':
          break;
      }
    } else {
      i++;
    }
  }

  return coords;
}

function rebasePath(
  d: string,
  offsetX: number,
  offsetY: number,
  scaleX: (v: number) => number,
  scaleY: (v: number) => number,
): string {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || [];
  let i = 0;
  let result = '';

  while (i < tokens.length) {
    const tok = tokens[i];
    if (/^[A-Za-z]$/i.test(tok)) {
      result += tok + ' ';
      i++;
      const cmd = tok.toUpperCase();
      if (cmd === 'Z') continue;
      const isRelative = tok !== tok.toUpperCase();

      function readNum(): number | null {
        while (i < tokens.length && /^[A-Za-z]$/.test(tokens[i])) i++;
        if (i >= tokens.length) return null;
        const n = parseFloat(tokens[i]);
        if (Number.isNaN(n)) return null;
        i++;
        return n;
      }

      if (cmd === 'H') {
        while (true) {
          const nx = readNum(); if (nx === null) break;
          result += `${isRelative ? nx : scaleX(nx) - scaleX(offsetX)} `;
        }
      } else if (cmd === 'V') {
        while (true) {
          const ny = readNum(); if (ny === null) break;
          result += `${isRelative ? ny : scaleY(ny) - scaleY(offsetY)} `;
        }
      } else {
        while (true) {
          const nx = readNum(); if (nx === null) break;
          const ny = readNum(); if (ny === null) break;
          if (cmd === 'M' || cmd === 'L' || cmd === 'T') {
            result += `${isRelative ? nx : scaleX(nx) - scaleX(offsetX)} ${isRelative ? ny : scaleY(ny) - scaleY(offsetY)} `;
          } else if (cmd === 'C') {
            const nx2 = readNum(); if (nx2 === null) break;
            const ny2 = readNum(); if (ny2 === null) break;
            const nx3 = readNum(); if (nx3 === null) break;
            const ny3 = readNum(); if (ny3 === null) break;
            result += `${isRelative ? nx : scaleX(nx) - scaleX(offsetX)} ${isRelative ? ny : scaleY(ny) - scaleY(offsetY)} `;
            result += `${isRelative ? nx2 : scaleX(nx2) - scaleX(offsetX)} ${isRelative ? ny2 : scaleY(ny2) - scaleY(offsetY)} `;
            result += `${isRelative ? nx3 : scaleX(nx3) - scaleX(offsetX)} ${isRelative ? ny3 : scaleY(ny3) - scaleY(offsetY)} `;
          } else if (cmd === 'S' || cmd === 'Q') {
            const nx2 = readNum(); if (nx2 === null) break;
            const ny2 = readNum(); if (ny2 === null) break;
            const nx3 = readNum(); if (nx3 === null) break;
            const ny3 = readNum(); if (ny3 === null) break;
            result += `${isRelative ? nx : scaleX(nx) - scaleX(offsetX)} ${isRelative ? ny : scaleY(ny) - scaleY(offsetY)} `;
            result += `${isRelative ? nx2 : scaleX(nx2) - scaleX(offsetX)} ${isRelative ? ny2 : scaleY(ny2) - scaleY(offsetY)} `;
            result += `${isRelative ? nx3 : scaleX(nx3) - scaleX(offsetX)} ${isRelative ? ny3 : scaleY(ny3) - scaleY(offsetY)} `;
          } else if (cmd === 'A') {
            const nrx = readNum(); if (nrx === null) break;
            const nry = readNum(); if (nry === null) break;
            const nra = readNum(); if (nra === null) break;
            const nf1 = readNum(); if (nf1 === null) break;
            const nf2 = readNum(); if (nf2 === null) break;
            const nlx = readNum(); if (nlx === null) break;
            const nly = readNum(); if (nly === null) break;
            result += `${isRelative ? nrx : nrx} ${isRelative ? nry : nry} ${nra} ${nf1} ${nf2} ${isRelative ? nlx : scaleX(nlx) - scaleX(offsetX)} ${isRelative ? nly : scaleY(nly) - scaleY(offsetY)} `;
            break;
          }
        }
      }
    } else {
      result += tok + ' ';
      i++;
    }
  }

  return result.trim();
}
