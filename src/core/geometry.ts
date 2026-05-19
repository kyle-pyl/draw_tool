import type { SceneElement, BBox, GeometryAdapter } from './types';

function rotatePoint(
  px: number, py: number, cx: number, cy: number, angle: number
): [number, number] {
  if (angle === 0) return [px, py];
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return [cos * dx - sin * dy + cx, sin * dx + cos * dy + cy];
}

function bboxFromTransform(
  x: number, y: number, width: number, height: number, rotation: number
): BBox {
  if (rotation === 0) return { x, y, width, height };
  const cx = x + width / 2;
  const cy = y + height / 2;
  const corners: [number, number][] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  const rotated = corners.map(([px, py]) => rotatePoint(px, py, cx, cy, rotation));
  const minX = Math.min(...rotated.map(([rx]) => rx));
  const minY = Math.min(...rotated.map(([, ry]) => ry));
  const maxX = Math.max(...rotated.map(([rx]) => rx));
  const maxY = Math.max(...rotated.map(([, ry]) => ry));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function getShapeBBox(el: SceneElement): BBox {
  if (el.type !== 'shape') return bboxFromTransform(el.transform.x, el.transform.y, el.transform.width, el.transform.height, el.transform.rotation);
  const { x, y, width, height, rotation } = el.transform;
  switch (el.shapeKind) {
    case 'rect':
      return bboxFromTransform(x, y, width, height, rotation);
    case 'circle': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const r = Math.min(width, height) / 2;
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    case 'ellipse': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = width / 2;
      const ry = height / 2;
      return bboxFromTransform(cx - rx, cy - ry, rx * 2, ry * 2, rotation);
    }
    case 'polygon': {
      if (el.points && el.points.length > 0) {
        const xs = el.points.map((p) => p.x + x);
        const ys = el.points.map((p) => p.y + y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const polyBBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        return bboxFromTransform(polyBBox.x, polyBBox.y, polyBBox.width, polyBBox.height, rotation);
      }
      return bboxFromTransform(x, y, width, height, rotation);
    }
    case 'path':
      return bboxFromTransform(x, y, width, height, rotation);
    default:
      return bboxFromTransform(x, y, width, height, rotation);
  }
}

function getTextBBox(el: SceneElement): BBox {
  if (el.type !== 'text') return bboxFromTransform(el.transform.x, el.transform.y, el.transform.width, el.transform.height, el.transform.rotation);
  const { x, y, width, height, rotation } = el.transform;
  const fontSize = el.style.fontSize ?? 16;
  const charCount = el.text.length;
  const estimatedWidth = charCount > 0 ? Math.max(width, charCount * fontSize * 0.6) : width;
  const estimatedHeight = Math.max(height, fontSize * 1.4);
  return bboxFromTransform(x, y, estimatedWidth, estimatedHeight, rotation);
}

function getImageBBox(el: SceneElement): BBox {
  if (el.type !== 'image') return bboxFromTransform(el.transform.x, el.transform.y, el.transform.width, el.transform.height, el.transform.rotation);
  const { x, y, width, height, rotation } = el.transform;
  const w = width || (el.originalWidth > 0 ? el.originalWidth : 100);
  const h = height || (el.originalHeight > 0 ? el.originalHeight : 100);
  return bboxFromTransform(x, y, w, h, rotation);
}

function getConnectorBBox(el: SceneElement): BBox {
  if (el.type !== 'connector') return bboxFromTransform(el.transform.x, el.transform.y, el.transform.width, el.transform.height, el.transform.rotation);
  const allPoints: { x: number; y: number }[] = [];
  allPoints.push({ x: el.source.x, y: el.source.y });
  allPoints.push({ x: el.target.x, y: el.target.y });
  if (el.route.points.length > 0) {
    allPoints.push(...el.route.points);
  }
  if (allPoints.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const xs = allPoints.map((p) => p.x);
  const ys = allPoints.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function getDefaultBBox(el: SceneElement): BBox {
  const { x, y, width, height, rotation } = el.transform;
  return bboxFromTransform(x, y, width, height, rotation);
}

/**
 * Compute the axis-aligned bounding box for a scene element.
 *
 * Calculation depends on element type:
 * - shape: uses geometric properties (rect uses transform bounds, circle/ellipse use inscribed rect, polygon uses point bounds, path uses transform bounds)
 * - text: uses character count and font size to estimate width/height (minimum transform dimensions)
 * - image: uses transform dimensions or originalWidth/originalHeight
 * - connector: computes bounding box of all endpoint and route points
 * - other types: uses transform bounds
 *
 * Rotation is handled: the bounding box of the rotated rectangle is returned.
 */
export function getBBox(element: SceneElement): BBox {
  switch (element.type) {
    case 'shape':
      return getShapeBBox(element);
    case 'text':
      return getTextBBox(element);
    case 'image':
      return getImageBBox(element);
    case 'connector':
      return getConnectorBBox(element);
    default:
      return getDefaultBBox(element);
  }
}

/**
 * Create a GeometryAdapter instance with getBBox fully implemented.
 * getGeometry and intersects are reserved for future advanced collision detection.
 */
export function createGeometryAdapter(): GeometryAdapter {
  return {
    getBBox,
    getGeometry: undefined,
    intersects: undefined,
  };
}
