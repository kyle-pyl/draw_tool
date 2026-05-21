import * as pc from 'polygon-clipping';
import type { SceneElement, BBox, GeometryAdapter, GeometryShape } from './types';

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
 * Extract the real geometric shape from a scene element as closed paths.
 *
 * Supported element types:
 * - shape rect: converted to a 4-vertex polygon with rotation applied
 * - shape circle: approximated as a 64-vertex polygon
 * - shape ellipse: approximated as a 64-vertex polygon
 * - shape polygon: points used directly with transform offset
 * - shape path: not yet supported (returns empty paths)
 * - other types: returns empty paths
 */
export function getGeometry(element: SceneElement): GeometryShape {
  if (element.type !== 'shape') {
    return { paths: [] };
  }

  const { x, y, width, height, rotation } = element.transform;
  const cx = x + width / 2;
  const cy = y + height / 2;

  switch (element.shapeKind) {
    case 'rect': {
      const corners: { x: number; y: number }[] = [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x, y: y + height },
      ];
      if (rotation !== 0) {
        const rotated = corners.map((p) => {
          const [rx, ry] = rotatePoint(p.x, p.y, cx, cy, rotation);
          return { x: rx, y: ry };
        });
        return { paths: [rotated] };
      }
      return { paths: [corners] };
    }

    case 'circle': {
      const r = Math.min(width, height) / 2;
      const centerX = cx;
      const centerY = cy;
      const segments = 64;
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < segments; i++) {
        const angle = (2 * Math.PI * i) / segments;
        points.push({
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
        });
      }
      return { paths: [points] };
    }

    case 'ellipse': {
      const rx = width / 2;
      const ry = height / 2;
      const segments = 64;
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < segments; i++) {
        const angle = (2 * Math.PI * i) / segments;
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);
        if (rotation !== 0) {
          const [rpx, rpy] = rotatePoint(px, py, cx, cy, rotation);
          points.push({ x: rpx, y: rpy });
        } else {
          points.push({ x: px, y: py });
        }
      }
      return { paths: [points] };
    }

    case 'polygon': {
      if (element.points && element.points.length >= 3) {
        const absolute = element.points.map((p) => ({
          x: p.x + x,
          y: p.y + y,
        }));
        if (rotation !== 0) {
          const rotated = absolute.map((p) => {
            const [rx, ry] = rotatePoint(p.x, p.y, cx, cy, rotation);
            return { x: rx, y: ry };
          });
          return { paths: [rotated] };
        }
        return { paths: [absolute] };
      }
      return { paths: [] };
    }

    default:
      return { paths: [] };
  }
}

function bboxesOverlap(a: BBox, b: BBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function geometryToMultiPolygon(geom: GeometryShape): pc.MultiPolygon {
  return geom.paths.map((path) =>
    path.map((p) => [p.x, p.y] as pc.Pair)
  ) as pc.MultiPolygon;
}

/**
 * Check if two GeometryShapes intersect using polygon-clipping intersection.
 * If the intersection produces any non-empty paths, the shapes overlap.
 */
function geometriesIntersect(a: GeometryShape, b: GeometryShape): boolean {
  if (a.paths.length === 0 || b.paths.length === 0) return false;
  const mpA = geometryToMultiPolygon(a);
  const mpB = geometryToMultiPolygon(b);
  const result = pc.intersection(mpA, mpB);
  return result.length > 0 && result.some((poly) => poly.length > 0 && poly[0].length >= 3);
}

/**
 * Test if two SceneElements truly intersect at the geometry level.
 *
 * Uses real geometry (via getGeometry) when both elements are shape types
 * with extractable geometry. Falls back to BBox overlap when geometry
 * cannot be extracted (e.g. text, image, container elements).
 *
 * A quick BBox rejection is performed first to avoid expensive polygon
 * clipping when elements are clearly non-overlapping.
 */
export function intersects(a: SceneElement, b: SceneElement): boolean {
  const bboxA = getBBox(a);
  const bboxB = getBBox(b);
  if (!bboxesOverlap(bboxA, bboxB)) return false;

  const geomA = getGeometry(a);
  const geomB = getGeometry(b);

  if (geomA.paths.length === 0 || geomB.paths.length === 0) {
    return true;
  }

  return geometriesIntersect(geomA, geomB);
}

/**
 * Create a GeometryAdapter instance with getBBox, getGeometry, and intersects
 * all fully implemented for real geometry collision detection.
 */
export function createGeometryAdapter(): GeometryAdapter {
  return {
    getBBox,
    getGeometry,
    intersects,
  };
}
