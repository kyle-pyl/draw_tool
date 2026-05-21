import type { SceneElement } from '../core/types';
import { getBBox } from '../core/geometry';

export interface SnapConfig {
  enabled: boolean;
  gridSnap: boolean;
  elementSnap: boolean;
  snapDistance: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  snapTarget?: string;
}

const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  gridSnap: true,
  elementSnap: true,
  snapDistance: 8,
};

export class SnapManager {
  config: SnapConfig;

  constructor(config?: Partial<SnapConfig>) {
    this.config = { ...DEFAULT_SNAP_CONFIG, ...config };
  }

  snapPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    gridSize: number,
    elements: SceneElement[],
    excludeIds: string[],
  ): SnapResult {
    if (!this.config.enabled) {
      return { x, y, snappedX: false, snappedY: false };
    }

    const right = x + width;
    const bottom = y + height;
    const cx = x + width / 2;
    const cy = y + height / 2;

    const maxDist = this.config.snapDistance;

    let bestX = x;
    let bestY = y;
    let snappedX = false;
    let snappedY = false;
    let snapTarget: string | undefined;

    if (this.config.gridSnap && gridSize > 0) {
      const gx = this._snapToGrid(x, gridSize);
      const gy = this._snapToGrid(y, gridSize);
      if (gx.snapped) { bestX = gx.value; snappedX = true; }
      if (gy.snapped) { bestY = gy.value; snappedY = true; }
    }

    if (this.config.elementSnap) {
      const excludeSet = new Set(excludeIds);
      let bestDistX = maxDist;
      let bestDistY = maxDist;

      for (const el of elements) {
        if (excludeSet.has(el.id)) continue;
        if (el.type === 'connector') continue;
        if (!el.visible) continue;

        const bbox = getBBox(el);
        const elRight = bbox.x + bbox.width;
        const elBottom = bbox.y + bbox.height;
        const elCx = bbox.x + bbox.width / 2;
        const elCy = bbox.y + bbox.height / 2;

        const xTargets = [bbox.x, elRight, elCx];
        const xSources = [x, right, cx];
        for (const t of xTargets) {
          for (const s of xSources) {
            const dist = Math.abs(t - s);
            if (dist < bestDistX) {
              bestDistX = dist;
              bestX = s - (x - s === 0 ? 0 : right - s === 0 ? right - t : cx - s === 0 ? t - width / 2 : s);
              if (s === x) bestX = t;
              else if (s === right) bestX = t - width;
              else if (s === cx) bestX = t - width / 2;
              snappedX = true;
              snapTarget = el.id;
            }
          }
        }

        const yTargets = [bbox.y, elBottom, elCy];
        const ySources = [y, bottom, cy];
        for (const t of yTargets) {
          for (const s of ySources) {
            const dist = Math.abs(t - s);
            if (dist < bestDistY) {
              bestDistY = dist;
              if (s === y) bestY = t;
              else if (s === bottom) bestY = t - height;
              else if (s === cy) bestY = t - height / 2;
              snappedY = true;
              snapTarget = el.id;
            }
          }
        }
      }
    }

    return { x: bestX, y: bestY, snappedX, snappedY, snapTarget };
  }

  _snapToGrid(value: number, gridSize: number): { value: number; snapped: boolean } {
    const snapped = Math.round(value / gridSize) * gridSize;
    const dist = Math.abs(snapped - value);
    if (dist <= this.config.snapDistance) {
      return { value: snapped, snapped: true };
    }
    return { value, snapped: false };
  }
}
