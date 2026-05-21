/**
 * Project exporters — ZIP, SVG, PNG, JPG export.
 */

import { zipSync, strToU8 } from 'fflate';
import type { Zippable } from 'fflate';
import { useDocumentStore } from '../core/store';
import { validateScene } from '../core/validator';
import { successResult, failureResult } from '../core/errors';
import { getBBox } from '../core/geometry';
import type {
  SceneDocument,
  SceneElement,
  ShapeElement,
  TextElement,
  ImageElement,
  ConnectorElement,
  ArrowStyle,
  BBox,
} from '../core/types';
import type { ValidationResult } from '../core/errors';

function extFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
  };
  return map[mimeType] ?? 'png';
}

/**
 * Export the currently loaded project as a ZIP archive.
 *
 * The resulting ZIP mirrors the project directory structure:
 * - scene.json at the root with the current scene state.
 * - data/ directory with CSV/JSON/XLSX files (if a directory handle is available).
 * - assets/ directory with image files (fetched from blob URLs).
 *
 * Blob URLs in ImageElement src fields are replaced with their original
 * relative asset paths (stored in element metadata during import) or
 * generated paths.
 *
 * @returns A Blob of MIME type "application/zip" ready for download.
 * @throws If no scene is currently loaded.
 */
export async function exportProjectToZip(): Promise<Blob> {
  const store = useDocumentStore.getState();
  const scene = store.getScene();
  if (!scene) {
    throw new Error('No scene is currently loaded. Open or create a project first.');
  }

  const exportScene: SceneDocument = JSON.parse(JSON.stringify(scene));
  const zipEntries: Zippable = {};

  // ── Process image elements: replace blob URLs with asset paths ──────────────
  for (const el of exportScene.elements) {
    if (el.type === 'image') {
      const src = el.src as string;
      if (src && src.startsWith('blob:')) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          const mimeType = blob.type || 'image/png';
          const ext = extFromMimeType(mimeType);
          const meta = (el as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
          const originalPath = meta?.originalAssetPath as string | undefined;
          const assetPath = originalPath ?? `assets/image_${el.id}.${ext}`;

          zipEntries[assetPath] = new Uint8Array(arrayBuffer);
          el.src = assetPath;
        } catch {
          // Blob URL unreachable — keep it as-is; the image won't round-trip
        }
      }
    }
  }

  // ── Add scene.json ──────────────────────────────────────────────────────────
  zipEntries['scene.json'] = strToU8(JSON.stringify(exportScene, null, 2));

  // ── Read data/ files from directory handle if available ─────────────────────
  const dirHandle = store.directoryHandle;
  if (dirHandle) {
    try {
      const dataDirHandle = await dirHandle.getDirectoryHandle('data');
      for await (const [name, handle] of dataDirHandle.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          const buf = await file.arrayBuffer();
          zipEntries[`data/${name}`] = new Uint8Array(buf);
        }
      }
    } catch {
      // No data/ directory — fine
    }
  }

  const zipData = zipSync(zipEntries);
  return new Blob([zipData], { type: 'application/zip' });
}

/**
 * Trigger a browser download for a Blob.
 */
function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to ensure the download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Save the currently loaded project.
 *
 * Behaviour depends on how the project was opened:
 *  - If a File System Access API directory handle is available (project opened
 *    via `loadProjectFromDirectory`), the scene.json is written back to the
 *    directory root using `createWritable`. Data and asset files already in
 *    the directory are left untouched.
 *  - If no directory handle is available, the project is exported as a ZIP
 *    and a download is triggered in the browser.
 *
 * Before saving, the current scene is validated with `validateScene`. If
 * validation fails the save is blocked and the ValidationResult with errors
 * is returned.
 *
 * After a successful save `store.markClean()` is called so that `isDirty`
 * resets to `false`.
 *
 * @returns ValidationResult — valid: true when saved successfully;
 *          valid: false when validation blocks the save.
 */
export async function saveProject(): Promise<ValidationResult> {
  const store = useDocumentStore.getState();
  const scene = store.getScene();

  if (!scene) {
    return failureResult({
      code: 'IO_ERROR',
      message: 'No scene is currently loaded. Open or create a project first.',
      severity: 'error',
    });
  }

  // Pre-save validation
  const validation = validateScene(scene);
  if (!validation.valid) {
    return validation;
  }

  const dirHandle = store.directoryHandle;

  if (dirHandle) {
    // ── Save directly to the project directory ──────────────────────────
    try {
      const sceneJson = JSON.stringify(scene, null, 2);

      // Write scene.json
      const fileHandle = await dirHandle.getFileHandle('scene.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(sceneJson);
      await writable.close();
    } catch (err) {
      return failureResult({
        code: 'IO_ERROR',
        message: `Failed to write to project directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  } else {
    // ── Export as ZIP and trigger download ──────────────────────────────
    try {
      const zipBlob = await exportProjectToZip();
      const projectName = scene.project?.name ?? 'project';
      triggerDownload(zipBlob, `${projectName}.zip`);
    } catch (err) {
      return failureResult({
        code: 'IO_ERROR',
        message: `Failed to export project: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  }

  store.markClean();
  return successResult();
}

// ─── SVG Export ────────────────────────────────────────────────────────────────

/**
 * Options for SVG export.
 */
export interface SvgExportOptions {
  /** Export region mode. Default: 'full'. */
  region?: 'viewport' | 'selection' | 'full';
  /** Viewport bounding box in canvas coordinates (required when region is 'viewport'). */
  viewportBBox?: BBox;
  /** IDs of elements to export (required when region is 'selection'). */
  selectedElementIds?: string[];
  /** Background color for the exported SVG. Default: scene.canvas.background. */
  backgroundColor?: string;
  /** Margin in canvas units around the exported content. Default: 10. */
  margin?: number;
  /** Additional CSS to embed in the SVG. */
  embedCss?: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function svgAttr(key: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return ` ${key}="${typeof value === 'number' ? value.toString() : escapeXml(String(value))}"`;
}

function attrStr(attrs: Record<string, string | number | undefined | null>): string {
  let s = '';
  for (const [k, v] of Object.entries(attrs)) {
    s += svgAttr(k, v);
  }
  return s;
}

function computeTransformString(el: SceneElement): string {
  const { x, y, width, height, rotation, scaleX, scaleY } = el.transform;
  if (rotation === 0 && scaleX === 1 && scaleY === 1) return '';
  const cx = x + width / 2;
  const cy = y + height / 2;
  const parts: string[] = [];
  if (scaleX !== 1 || scaleY !== 1) {
    parts.push(`translate(${cx}, ${cy}) scale(${scaleX}, ${scaleY}) translate(${-cx}, ${-cy})`);
  }
  if (rotation !== 0) {
    parts.push(`rotate(${rotation}, ${cx}, ${cy})`);
  }
  return parts.join(' ');
}

function styleToAttr(el: SceneElement): Record<string, string | number | undefined | null> {
  const s = el.style;
  const attrs: Record<string, string | number | undefined | null> = {};
  if (s.fill !== undefined) attrs.fill = s.fill;
  if (s.stroke !== undefined) attrs.stroke = s.stroke;
  if (s.strokeWidth !== undefined) attrs['stroke-width'] = s.strokeWidth;
  if (s.strokeDasharray !== undefined) attrs['stroke-dasharray'] = s.strokeDasharray;
  if (s.opacity !== undefined && s.opacity < 1) attrs.opacity = s.opacity;
  return attrs;
}

function renderShapeToSvg(el: ShapeElement): string {
  const { x, y, width, height } = el.transform;
  const attrs = styleToAttr(el);
  const t = computeTransformString(el);

  switch (el.shapeKind) {
    case 'rect': {
      const rx = el.cornerRadius?.[0] ?? 0;
      return `<rect${svgAttr('x', x)}${svgAttr('y', y)}${svgAttr('width', width)}${svgAttr('height', height)}${svgAttr('rx', rx)}${t ? svgAttr('transform', t) : ''}${attrStr(attrs)}/>`;
    }
    case 'circle': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const r = Math.min(width, height) / 2;
      return `<circle${svgAttr('cx', cx)}${svgAttr('cy', cy)}${svgAttr('r', r)}${t ? svgAttr('transform', t) : ''}${attrStr(attrs)}/>`;
    }
    case 'ellipse': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = width / 2;
      const ry = height / 2;
      return `<ellipse${svgAttr('cx', cx)}${svgAttr('cy', cy)}${svgAttr('rx', rx)}${svgAttr('ry', ry)}${t ? svgAttr('transform', t) : ''}${attrStr(attrs)}/>`;
    }
    case 'polygon': {
      const pointsStr = el.points?.map((p) => `${p.x},${p.y}`).join(' ') ?? '';
      const fullTransform = `translate(${x}, ${y})${t ? ' ' + t : ''}`;
      return `<polygon${svgAttr('points', pointsStr)}${svgAttr('transform', fullTransform)}${attrStr(attrs)}/>`;
    }
    case 'path': {
      const d = el.pathCommands ?? '';
      const fullTransform = `translate(${x}, ${y})${t ? ' ' + t : ''}`;
      return `<path${svgAttr('d', d)}${svgAttr('transform', fullTransform)}${attrStr(attrs)}/>`;
    }
    default:
      return '';
  }
}

function renderTextToSvg(el: TextElement): string {
  const { x, y, width, height } = el.transform;
  const s = el.style;
  const t = computeTransformString(el);
  const fontSize = s.fontSize ?? 16;
  const textAnchor = s.textAlign === 'center' ? 'middle' : s.textAlign === 'right' ? 'end' : undefined;
  const displayY = y + fontSize;

  const parts: string[] = [];

  const hasBackground = el.backgroundColor && el.backgroundColor !== 'transparent';
  const hasBorder = el.borderColor && el.borderColor !== 'transparent' && (el.borderWidth ?? 1) > 0;

  if (hasBackground || hasBorder) {
    const rectH = height || fontSize * 1.4;
    parts.push(`<rect${svgAttr('x', x)}${svgAttr('y', y)}${svgAttr('width', width)}${svgAttr('height', rectH)}${svgAttr('fill', hasBackground ? el.backgroundColor : 'none')}${svgAttr('stroke', hasBorder ? el.borderColor : 'none')}${svgAttr('stroke-width', hasBorder ? (el.borderWidth ?? 1) : 0)}/>`);
  }

  const textAttrs: Record<string, string | number | undefined | null> = {
    fill: s.fill,
    'font-size': fontSize,
    'font-family': s.fontFamily,
    'font-weight': s.fontWeight,
    'font-style': s.fontStyle,
    'text-decoration': s.textDecoration,
    opacity: s.opacity !== 1 ? s.opacity : undefined,
    'text-anchor': textAnchor,
  };
  if (t) textAttrs.transform = t;

  parts.push(`<text${svgAttr('x', textAnchor === 'middle' ? x + width / 2 : textAnchor === 'end' ? x + width : x)}${svgAttr('y', displayY)}${attrStr(textAttrs)}>${escapeXml(el.text)}</text>`);

  return parts.join('\n');
}

function renderImageToSvg(el: ImageElement): string {
  const { x, y, width, height } = el.transform;
  const t = computeTransformString(el);
  const { opacity } = el.style;
  const preserveAspectRatio = el.objectFit === 'contain' ? 'xMidYMid meet' : el.objectFit === 'cover' ? 'xMidYMid slice' : undefined;

  return `<image${svgAttr('href', el.src)}${svgAttr('x', x)}${svgAttr('y', y)}${svgAttr('width', width)}${svgAttr('height', height)}${svgAttr('preserveAspectRatio', preserveAspectRatio)}${opacity !== undefined && opacity < 1 ? svgAttr('opacity', opacity) : ''}${t ? svgAttr('transform', t) : ''}/>`;
}

function createArrowMarkerDef(arrow: ArrowStyle, id: string, color: string, position: 'start' | 'end'): string {
  const size = (arrow.size ?? 1) * 6;
  const isEnd = position === 'end';

  switch (arrow.type) {
    case 'triangle': {
      const w = size * 1.6;
      const h = size * 1.2;
      const refX = isEnd ? w * 0.85 : w * 0.15;
      return `<marker id="${id}" markerWidth="${w}" markerHeight="${h}" refX="${refX}" refY="${h / 2}" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L ${w} ${h / 2} L 0 ${h} Z" fill="${escapeXml(color)}"/></marker>`;
    }
    case 'openTriangle': {
      const w = size * 1.6;
      const h = size * 1.2;
      const sw = 1.5;
      const refX = isEnd ? w * 0.85 : w * 0.15;
      return `<marker id="${id}" markerWidth="${w}" markerHeight="${h}" refX="${refX}" refY="${h / 2}" orient="auto" markerUnits="userSpaceOnUse"><path d="M ${sw} ${sw} L ${w - sw} ${h / 2} L ${sw} ${h - sw}" fill="none" stroke="${escapeXml(color)}" stroke-width="${sw}"/></marker>`;
    }
    case 'diamond': {
      const w = size * 1.6;
      const h = size * 1.6;
      const refX = isEnd ? w * 0.8 : w * 0.2;
      return `<marker id="${id}" markerWidth="${w}" markerHeight="${h}" refX="${refX}" refY="${h / 2}" orient="auto" markerUnits="userSpaceOnUse"><polygon points="${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}" fill="${escapeXml(color)}"/></marker>`;
    }
    case 'circle': {
      const w = size;
      const h = size;
      const r = size / 2 - 0.5;
      const refX = isEnd ? w * 0.7 : w * 0.3;
      return `<marker id="${id}" markerWidth="${w}" markerHeight="${h}" refX="${refX}" refY="${h / 2}" orient="auto" markerUnits="userSpaceOnUse"><circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${escapeXml(color)}"/></marker>`;
    }
    default:
      return '';
  }
}

function resolveEndpointPositionSvg(ep: { x: number; y: number }): { x: number; y: number } {
  return { x: ep.x, y: ep.y };
}

function computePathLength(points: { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function computePointAtLength(points: { x: number; y: number }[], dist: number): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  if (dist <= 0) return points[0];
  if (dist >= computePathLength(points)) return points[points.length - 1];

  let accumulated = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (accumulated + segLen >= dist) {
      const t = segLen > 0 ? (dist - accumulated) / segLen : 0;
      return {
        x: points[i - 1].x + t * dx,
        y: points[i - 1].y + t * dy,
      };
    }
    accumulated += segLen;
  }
  return points[points.length - 1];
}

function renderConnectorToSvg(el: ConnectorElement, arrowDefIds: Map<string, string>): string {
  const source = resolveEndpointPositionSvg(el.source);
  const target = resolveEndpointPositionSvg(el.target);
  const routePoints = el.route.points;
  const routeType = el.route.type;
  const s = el.style;
  const strokeColor = (s.stroke as string) || '#333';
  const strokeW = (s.strokeWidth as number) || 2;

  const pathPoints = [source, ...(routeType === 'straight' && routePoints.length === 0 ? [] : routePoints), target];
  const pointsStr = pathPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const lineAttrs: Record<string, string | number | undefined | null> = {
    fill: 'none',
    stroke: strokeColor,
    'stroke-width': strokeW,
    opacity: s.opacity !== undefined && s.opacity < 1 ? s.opacity : undefined,
    'stroke-dasharray': s.strokeDasharray,
  };

  let markerStart: string | undefined;
  if (el.arrowStart && el.arrowStart.type !== 'none') {
    const key = `start:${el.arrowStart.type}:${el.arrowStart.size ?? 1}:${el.arrowStart.color ?? strokeColor}`;
    markerStart = arrowDefIds.get(key);
    if (markerStart) lineAttrs['marker-start'] = `url(#${markerStart})`;
  }

  let markerEnd: string | undefined;
  if (el.arrowEnd && el.arrowEnd.type !== 'none') {
    const key = `end:${el.arrowEnd.type}:${el.arrowEnd.size ?? 1}:${el.arrowEnd.color ?? strokeColor}`;
    markerEnd = arrowDefIds.get(key);
    if (markerEnd) lineAttrs['marker-end'] = `url(#${markerEnd})`;
  }

  let lineSvg: string;
  if (pathPoints.length === 2 && routeType !== 'polyline') {
    lineSvg = `<line${svgAttr('x1', pathPoints[0].x)}${svgAttr('y1', pathPoints[0].y)}${svgAttr('x2', pathPoints[1].x)}${svgAttr('y2', pathPoints[1].y)}${attrStr(lineAttrs)}/>`;
  } else {
    lineSvg = `<polyline${svgAttr('points', pointsStr)}${attrStr(lineAttrs)}/>`;
  }

  const parts: string[] = [lineSvg];

  if (el.labels && el.labels.length > 0) {
    const totalLen = computePathLength(pathPoints);
    for (const label of el.labels) {
      const dist = label.position * totalLen;
      const pt = computePointAtLength(pathPoints, dist);
      const lx = pt.x + (label.offset?.dx ?? 0);
      const ly = pt.y + (label.offset?.dy ?? 0);
      const labelAttrs = {
        x: lx,
        y: ly,
        fill: strokeColor,
        'font-size': s.fontSize ?? 12,
        'font-family': s.fontFamily ?? 'Arial',
        'font-weight': s.fontWeight,
        'font-style': s.fontStyle,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      };
      parts.push(`<text${attrStr(labelAttrs)}>${escapeXml(label.text)}</text>`);
    }
  }

  return parts.join('\n');
}

function renderElementToSvg(el: SceneElement, arrowDefIds: Map<string, string>): string {
  switch (el.type) {
    case 'shape':
      return renderShapeToSvg(el as ShapeElement);
    case 'text':
      return renderTextToSvg(el as TextElement);
    case 'image':
      return renderImageToSvg(el as ImageElement);
    case 'connector':
      return renderConnectorToSvg(el as ConnectorElement, arrowDefIds);
    default:
      return '';
  }
}

function collectArrowDefs(scene: SceneDocument): { defsSvg: string; idMap: Map<string, string> } {
  const idMap = new Map<string, string>();
  const defsParts: string[] = [];
  let counter = 0;

  for (const el of scene.elements) {
    if (el.type !== 'connector') continue;
    const conn = el as ConnectorElement;
    const strokeColor = (conn.style.stroke as string) || '#333';

    if (conn.arrowStart && conn.arrowStart.type !== 'none') {
      const key = `start:${conn.arrowStart.type}:${conn.arrowStart.size ?? 1}:${conn.arrowStart.color ?? strokeColor}`;
      if (!idMap.has(key)) {
        const id = `a${counter++}`;
        idMap.set(key, id);
        defsParts.push(createArrowMarkerDef(conn.arrowStart, id, conn.arrowStart.color ?? strokeColor, 'start'));
      }
    }
    if (conn.arrowEnd && conn.arrowEnd.type !== 'none') {
      const key = `end:${conn.arrowEnd.type}:${conn.arrowEnd.size ?? 1}:${conn.arrowEnd.color ?? strokeColor}`;
      if (!idMap.has(key)) {
        const id = `a${counter++}`;
        idMap.set(key, id);
        defsParts.push(createArrowMarkerDef(conn.arrowEnd, id, conn.arrowEnd.color ?? strokeColor, 'end'));
      }
    }
  }

  return { defsSvg: defsParts.join('\n'), idMap };
}

function computeExportBBox(
  scene: SceneDocument,
  options: SvgExportOptions,
): BBox {
  const margin = options.margin ?? 10;

  if (options.region === 'selection' && options.selectedElementIds !== undefined) {
    if (options.selectedElementIds.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }
    const selectedIds = new Set(options.selectedElementIds);
    const selectedElements = scene.elements.filter((el) => selectedIds.has(el.id) && el.visible);
    if (selectedElements.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }
    const bboxes = selectedElements.map((el) => getBBox(el));
    const minX = Math.min(...bboxes.map((b) => b.x));
    const minY = Math.min(...bboxes.map((b) => b.y));
    const maxX = Math.max(...bboxes.map((b) => b.x + b.width));
    const maxY = Math.max(...bboxes.map((b) => b.y + b.height));
    return {
      x: minX - margin,
      y: minY - margin,
      width: maxX - minX + margin * 2,
      height: maxY - minY + margin * 2,
    };
  }

  if (options.region === 'viewport' && options.viewportBBox) {
    return {
      x: options.viewportBBox.x - margin,
      y: options.viewportBBox.y - margin,
      width: options.viewportBBox.width + margin * 2,
      height: options.viewportBBox.height + margin * 2,
    };
  }

  // 'full' mode (default): compute bounding box of all visible elements
  const visibleElements = scene.elements.filter((el) => el.visible);
  if (visibleElements.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }
  const bboxes = visibleElements.map((el) => getBBox(el));
  const minX = Math.min(...bboxes.map((b) => b.x));
  const minY = Math.min(...bboxes.map((b) => b.y));
  const maxX = Math.max(...bboxes.map((b) => b.x + b.width));
  const maxY = Math.max(...bboxes.map((b) => b.y + b.height));
  return {
    x: minX - margin,
    y: minY - margin,
    width: Math.max(maxX - minX + margin * 2, 1),
    height: Math.max(maxY - minY + margin * 2, 1),
  };
}

/**
 * Export the current scene as a standalone SVG string.
 *
 * Renders all visible elements in layer order, preserving text as `<text>`
 * elements, images as `<image>`, and connectors with arrow markers in
 * `<defs>`. The resulting SVG is a self-contained document with proper
 * XML namespace declarations.
 *
 * Export region options:
 * - `'full'` (default): all visible elements with a margin.
 * - `'viewport'`: only the area specified by `viewportBBox`.
 * - `'selection'`: only the elements listed in `selectedElementIds`.
 *
 * @param scene The scene document to export.
 * @param options Export configuration.
 * @returns A complete SVG document as a string.
 */
export function exportToSVG(scene: SceneDocument, options: SvgExportOptions = {}): string {
  const bbox = computeExportBBox(scene, options);
  const bg = options.backgroundColor ?? scene.canvas.background ?? '#ffffff';
  const layersSorted = [...scene.layers].sort((a, b) => a.order - b.order);
  const layerMap = new Map(scene.layers.map((l) => [l.id, l]));
  const { defsSvg, idMap } = collectArrowDefs(scene);

  const layerElementMap = new Map<string, SceneElement[]>();
  for (const el of scene.elements) {
    const list = layerElementMap.get(el.layerId);
    if (list) {
      list.push(el);
    } else {
      layerElementMap.set(el.layerId, [el]);
    }
  }

  const elementsSvgParts: string[] = [];

  for (const layer of layersSorted) {
    if (!layer.visible) continue;
    const els = layerElementMap.get(layer.id) ?? [];
    if (els.length === 0) continue;

    const layerParts: string[] = [];
    for (const el of els) {
      if (!el.visible) continue;
      if (options.region === 'selection' && options.selectedElementIds) {
        if (!options.selectedElementIds.includes(el.id)) continue;
      }
      const svg = renderElementToSvg(el, idMap);
      if (svg) {
        layerParts.push(`<g data-element-id="${escapeXml(el.id)}">${svg}</g>`);
      }
    }
    if (layerParts.length > 0) {
      elementsSvgParts.push(`<g id="layer-${escapeXml(layer.id)}" data-layer-name="${escapeXml(layer.name)}">${layerParts.join('\n')}</g>`);
    }
  }

  const defsBlock = defsSvg ? `\n  <defs>\n    ${defsSvg.replace(/\n/g, '\n    ')}\n  </defs>\n` : '';
  const cssBlock = options.embedCss ? `\n  <style>\n${options.embedCss}\n  </style>\n` : '';

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `  width="${bbox.width}" height="${bbox.height}"`,
    `  viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">`,
    defsBlock + cssBlock,
    `  <rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="${escapeXml(bg)}"/>`,
    `  <g transform="translate(0, 0)">`,
    `    ${elementsSvgParts.join('\n    ')}`,
    `  </g>`,
    `</svg>`,
  ].join('\n');

  return svg;
}

/**
 * Export the scene as an SVG string and trigger a browser download.
 *
 * @param scene The scene document to export.
 * @param fileName Base file name (without extension). Default: 'export'.
 * @param options Export configuration.
 */
export function downloadSvg(scene: SceneDocument, fileName?: string, options?: SvgExportOptions): void {
  const svg = exportToSVG(scene, options);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  triggerDownload(blob, `${fileName ?? 'export'}.svg`);
}
