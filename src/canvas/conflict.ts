import type { BBox, Layer, SceneElement } from '../core/types';
import type { CollisionEntry } from '../core/collision';

export interface ConflictInfo {
  id: string;
  layerId: string;
  layerName: string;
  elementAId: string;
  elementAName: string;
  elementBId: string;
  elementBName: string;
  overlapBBox: BBox;
  suggestion: string;
}

export class ConflictHighlighter {
  private conflicts: ConflictInfo[] = [];
  private _conflictingLayerIds: Set<string> = new Set();
  private _conflictingElementIds: Set<string> = new Set();
  private _listeners: Set<() => void> = new Set();

  get hasConflicts(): boolean {
    return this.conflicts.length > 0;
  }

  get conflictingLayerIds(): ReadonlySet<string> {
    return this._conflictingLayerIds;
  }

  get conflictingElementIds(): ReadonlySet<string> {
    return this._conflictingElementIds;
  }

  getConflicts(): readonly ConflictInfo[] {
    return this.conflicts;
  }

  setCollisions(
    collisions: CollisionEntry[],
    elements: SceneElement[],
    layers: Layer[]
  ): void {
    const elementMap = new Map(elements.map((e) => [e.id, e]));
    const layerMap = new Map(layers.map((l) => [l.id, l]));

    this.conflicts = [];
    this._conflictingLayerIds.clear();
    this._conflictingElementIds.clear();

    for (const col of collisions) {
      const elA = elementMap.get(col.elementA);
      const elB = elementMap.get(col.elementB);
      if (!elA || !elB) continue;

      const layerA = layerMap.get(elA.layerId);
      const layerName = layerA?.name ?? `Layer(${elA.layerId})`;

      this._conflictingElementIds.add(col.elementA);
      this._conflictingElementIds.add(col.elementB);
      this._conflictingLayerIds.add(elA.layerId);

      const suggestion = `Move "${elA.name ?? elA.id}" or "${elB.name ?? elB.id}" to avoid overlap on layer "${layerName}".`;

      this.conflicts.push({
        id: `${col.elementA}-${col.elementB}`,
        layerId: elA.layerId,
        layerName,
        elementAId: col.elementA,
        elementAName: elA.name ?? elA.id,
        elementBId: col.elementB,
        elementBName: elB.name ?? elB.id,
        overlapBBox: col.overlapBBox,
        suggestion,
      });
    }

    this._notify();
  }

  clearCollisions(): void {
    if (this.conflicts.length === 0) return;
    this.conflicts = [];
    this._conflictingLayerIds.clear();
    this._conflictingElementIds.clear();
    this._notify();
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }
}
