import * as pc from 'polygon-clipping';
import type { GeometryShape } from './types';

export type BooleanOperationType = 'union' | 'intersect' | 'xor' | 'subtract';

function geometryToMultiPolygon(geom: GeometryShape): pc.MultiPolygon {
  return geom.paths.map((path) =>
    path.map((p) => [p.x, p.y] as pc.Pair)
  ) as pc.MultiPolygon;
}

function multiPolygonToGeometry(mp: pc.MultiPolygon): GeometryShape {
  const paths = mp.map((polygon) =>
    polygon[0].map(([x, y]) => ({ x, y }))
  );
  return { paths };
}

export function performBooleanOperation(
  shapes: GeometryShape[],
  operation: BooleanOperationType,
): GeometryShape {
  if (shapes.length === 0) return { paths: [] };
  if (shapes.length === 1) return shapes[0];

  let result: pc.MultiPolygon;
  const first = geometryToMultiPolygon(shapes[0]);
  const rest = shapes.slice(1).map(geometryToMultiPolygon);

  switch (operation) {
    case 'union':
      result = pc.union(first, ...rest);
      break;
    case 'intersect':
      result = pc.intersection(first, ...rest);
      break;
    case 'xor':
      result = pc.xor(first, ...rest);
      break;
    case 'subtract':
      result = pc.difference(first, ...rest);
      break;
    default:
      return { paths: [] };
  }

  return multiPolygonToGeometry(result);
}

export function geometryToSvgPath(geom: GeometryShape): string {
  if (geom.paths.length === 0) return '';

  return geom.paths
    .map((path) => {
      if (path.length === 0) return '';
      const parts = path.map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        return `L ${p.x} ${p.y}`;
      });
      parts.push('Z');
      return parts.join(' ');
    })
    .join(' ');
}
