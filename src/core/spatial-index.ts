import RBush from 'rbush';
import type { BBox } from './types';

interface IndexEntry {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  elementId: string;
}

export class SpatialIndex {
  private tree: RBush<IndexEntry>;
  private entryMap = new Map<string, IndexEntry>();

  constructor(maxEntries = 16) {
    this.tree = new RBush<IndexEntry>(maxEntries);
  }

  insert(elementId: string, bbox: BBox): void {
    const entry: IndexEntry = {
      minX: bbox.x,
      minY: bbox.y,
      maxX: bbox.x + bbox.width,
      maxY: bbox.y + bbox.height,
      elementId,
    };
    this.entryMap.set(elementId, entry);
    this.tree.insert(entry);
  }

  remove(elementId: string): void {
    const entry = this.entryMap.get(elementId);
    if (entry) {
      this.tree.remove(entry, (a, b) => a.elementId === b.elementId);
      this.entryMap.delete(elementId);
    }
  }

  clear(): void {
    this.tree.clear();
    this.entryMap.clear();
  }

  size(): number {
    return this.entryMap.size;
  }

  search(bbox: BBox): string[] {
    const results = this.tree.search({
      minX: bbox.x,
      minY: bbox.y,
      maxX: bbox.x + bbox.width,
      maxY: bbox.y + bbox.height,
    });
    return results.map((r) => r.elementId);
  }

  getAllIds(): string[] {
    return this.tree.all().map((r) => r.elementId);
  }
}

/**
 * Compute all pairs of elements whose bounding boxes overlap using the spatial index.
 * This reduces collision detection from O(n^2) to O(n log n) average case.
 */
export function findCollisionPairsFromIndex(
  indexedIds: string[],
  bboxes: Map<string, BBox>,
): Array<{ elementA: string; elementB: string }> {
  const pairs: Array<{ elementA: string; elementB: string }> = [];
  const index = new SpatialIndex();

  for (const id of indexedIds) {
    const bbox = bboxes.get(id);
    if (!bbox) continue;
    index.insert(id, bbox);
  }

  const allEntries = index.getAllIds();
  for (let i = 0; i < allEntries.length; i++) {
    const idA = allEntries[i];
    const bboxA = bboxes.get(idA);
    if (!bboxA) continue;
    const nearby = index.search(bboxA);
    for (const idB of nearby) {
      if (idB <= idA) continue;
      pairs.push({ elementA: idA, elementB: idB });
    }
  }

  return pairs;
}
