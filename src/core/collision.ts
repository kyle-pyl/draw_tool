import type { SceneElement, GeometryAdapter, BBox, CollisionStrategy } from './types';
import { findCollisionPairsFromIndex } from './spatial-index';

export interface CollisionEntry {
  elementA: string;
  elementB: string;
  overlapBBox: BBox;
}

export interface CollisionResult {
  hasCollision: boolean;
  collisions: CollisionEntry[];
}

export interface CollisionCheckOptions {
  skipHidden?: boolean;
  skipLocked?: boolean;
  skipConnectors?: boolean;
  collisionStrategy?: CollisionStrategy;
}

function bboxesOverlap(a: BBox, b: BBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function bboxIntersection(a: BBox, b: BBox): BBox {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const width = Math.min(a.x + a.width, b.x + b.width) - x;
  const height = Math.min(a.y + a.height, b.y + b.height) - y;
  return { x, y, width, height };
}

const SPATIAL_INDEX_THRESHOLD = 50;

export function checkLayerCollisions(
  elements: SceneElement[],
  geometryAdapter: GeometryAdapter,
  options?: CollisionCheckOptions
): CollisionResult {
  const skipConnectors = options?.skipConnectors !== false;
  const useGeometry = options?.collisionStrategy === 'geometry' && typeof geometryAdapter.intersects === 'function';
  const candidates = elements.filter((el) => {
    if (skipConnectors && el.type === 'connector') return false;
    if (options?.skipHidden && !el.visible) return false;
    if (options?.skipLocked && el.locked) return false;
    return true;
  });

  if (candidates.length >= SPATIAL_INDEX_THRESHOLD) {
    return checkWithSpatialIndex(candidates, geometryAdapter, useGeometry);
  }

  return checkWithNestedLoop(candidates, geometryAdapter, useGeometry);
}

function checkWithSpatialIndex(
  candidates: SceneElement[],
  geometryAdapter: GeometryAdapter,
  useGeometry: boolean,
): CollisionResult {
  const collisions: CollisionEntry[] = [];
  const elementMap = new Map(candidates.map((el) => [el.id, el]));
  const bboxMap = new Map(candidates.map((el) => [el.id, geometryAdapter.getBBox(el)]));

  const pairs = findCollisionPairsFromIndex(
    candidates.map((el) => el.id),
    bboxMap,
  );

  for (const { elementA, elementB } of pairs) {
    const a = elementMap.get(elementA);
    const b = elementMap.get(elementB);
    if (!a || !b) continue;

    const bboxA = bboxMap.get(elementA)!;
    const bboxB = bboxMap.get(elementB)!;

    if (!bboxesOverlap(bboxA, bboxB)) continue;

    if (useGeometry) {
      if (geometryAdapter.intersects!(a, b)) {
        collisions.push({
          elementA: a.id,
          elementB: b.id,
          overlapBBox: bboxIntersection(bboxA, bboxB),
        });
      }
    } else {
      collisions.push({
        elementA: a.id,
        elementB: b.id,
        overlapBBox: bboxIntersection(bboxA, bboxB),
      });
    }
  }

  return { hasCollision: collisions.length > 0, collisions };
}

function checkWithNestedLoop(
  candidates: SceneElement[],
  geometryAdapter: GeometryAdapter,
  useGeometry: boolean,
): CollisionResult {
  const collisions: CollisionEntry[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    const bboxA = geometryAdapter.getBBox(a);
    for (let j = i + 1; j < candidates.length; j++) {
      const b = candidates[j];
      const bboxB = geometryAdapter.getBBox(b);
      if (!bboxesOverlap(bboxA, bboxB)) continue;

      if (useGeometry) {
        if (geometryAdapter.intersects!(a, b)) {
          collisions.push({
            elementA: a.id,
            elementB: b.id,
            overlapBBox: bboxIntersection(bboxA, bboxB),
          });
        }
      } else {
        collisions.push({
          elementA: a.id,
          elementB: b.id,
          overlapBBox: bboxIntersection(bboxA, bboxB),
        });
      }
    }
  }

  return {
    hasCollision: collisions.length > 0,
    collisions,
  };
}

/**
 * Check if two SceneElements collide, respecting the collision strategy.
 *
 * When `strategy` is 'geometry' and the adapter provides `intersects`,
 * polygon-level intersection is used after a quick BBox pre-filter.
 * Falls back to BBox overlap when `strategy` is 'bbox' or geometry
 * cannot be extracted.
 */
export function checkElementsCollide(
  a: SceneElement,
  b: SceneElement,
  adapter: GeometryAdapter,
  strategy: CollisionStrategy,
): boolean {
  const bboxA = adapter.getBBox(a);
  const bboxB = adapter.getBBox(b);
  if (!bboxesOverlap(bboxA, bboxB)) return false;

  if (strategy === 'geometry' && adapter.intersects) {
    return adapter.intersects(a, b);
  }

  return true;
}
