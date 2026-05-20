import type { SceneElement, AnchorPoint } from './types';

const DEFAULT_ANCHORS: readonly AnchorPoint[] = [
  { id: 'top', position: { x: 0.5, y: 0 }, direction: -Math.PI / 2 },
  { id: 'bottom', position: { x: 0.5, y: 1 }, direction: Math.PI / 2 },
  { id: 'left', position: { x: 0, y: 0.5 }, direction: Math.PI },
  { id: 'right', position: { x: 1, y: 0.5 }, direction: 0 },
  { id: 'center', position: { x: 0.5, y: 0.5 }, direction: 0 },
  { id: 'top-left', position: { x: 0, y: 0 }, direction: -3 * Math.PI / 4 },
  { id: 'top-right', position: { x: 1, y: 0 }, direction: -Math.PI / 4 },
  { id: 'bottom-left', position: { x: 0, y: 1 }, direction: 3 * Math.PI / 4 },
  { id: 'bottom-right', position: { x: 1, y: 1 }, direction: Math.PI / 4 },
];

function rotatePoint(
  px: number, py: number, cx: number, cy: number, angleDeg: number
): { x: number; y: number } {
  if (angleDeg === 0) return { x: px, y: py };
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cos * dx - sin * dy + cx,
    y: sin * dx + cos * dy + cy,
  };
}

/**
 * Return available anchor points for a scene element.
 *
 * By default every element gets 9 standard anchors:
 * top, bottom, left, right, center, and four corners.
 *
 * For shape elements, custom anchors may be provided via
 * `element.metadata.anchors` as an AnchorPoint[].
 * Custom anchors replace the defaults entirely when present.
 */
export function getAnchors(element: SceneElement): AnchorPoint[] {
  if (element.type === 'shape' && element.metadata?.anchors) {
    const custom = element.metadata.anchors as AnchorPoint[];
    if (Array.isArray(custom) && custom.length > 0) {
      return custom;
    }
  }
  return [...DEFAULT_ANCHORS];
}

/**
 * Resolve an anchor to its absolute canvas coordinate.
 *
 * Takes an element and an anchor id, looks up the anchor's relative
 * position (0-1 within the element's bounding rectangle), and computes
 * the absolute (x, y) in canvas space.  Rotation is applied around the
 * element centre.
 *
 * Returns null if the anchor id is not found on the element.
 */
export function resolveAnchor(
  element: SceneElement,
  anchorId: string,
): { x: number; y: number } | null {
  const anchors = getAnchors(element);
  const anchor = anchors.find((a) => a.id === anchorId);
  if (!anchor) return null;

  const { x, y, width, height, rotation } = element.transform;

  const localX = x + anchor.position.x * width;
  const localY = y + anchor.position.y * height;

  if (rotation === 0) return { x: localX, y: localY };

  const cx = x + width / 2;
  const cy = y + height / 2;
  return rotatePoint(localX, localY, cx, cy, rotation);
}
