import type { SceneElement, GeometryAdapter, BBox } from './types';

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

export function checkLayerCollisions(
  elements: SceneElement[],
  geometryAdapter: GeometryAdapter,
  options?: CollisionCheckOptions
): CollisionResult {
  const collisions: CollisionEntry[] = [];

  const candidates = elements.filter((el) => {
    if (el.type === 'connector') return false;
    if (options?.skipHidden && !el.visible) return false;
    if (options?.skipLocked && el.locked) return false;
    return true;
  });

  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    const bboxA = geometryAdapter.getBBox(a);
    for (let j = i + 1; j < candidates.length; j++) {
      const b = candidates[j];
      const bboxB = geometryAdapter.getBBox(b);
      if (bboxesOverlap(bboxA, bboxB)) {
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
