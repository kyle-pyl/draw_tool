import type { BBox, SceneDocument, ConnectorElement } from './types';
import { getBBox } from './geometry';
import { getAnchors, resolveAnchor } from './anchors';

export type CardinalDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Convert an anchor direction angle (radians) to the nearest cardinal direction.
 * Uses 45-degree quadrant thresholds around each cardinal.
 */
export function directionToCardinal(dir: number): CardinalDirection {
  let deg = (dir * 180) / Math.PI;
  deg = ((deg % 360) + 360) % 360;

  if (deg >= 315 || deg < 45) return 'right';
  if (deg >= 45 && deg < 135) return 'down';
  if (deg >= 135 && deg < 225) return 'left';
  return 'up';
}

function extendPoint(
  point: { x: number; y: number },
  dir: CardinalDirection,
  dist: number,
): { x: number; y: number } {
  switch (dir) {
    case 'right': return { x: point.x + dist, y: point.y };
    case 'left': return { x: point.x - dist, y: point.y };
    case 'down': return { x: point.x, y: point.y + dist };
    case 'up': return { x: point.x, y: point.y - dist };
  }
}

function pointInBBox(p: { x: number; y: number }, bbox: BBox): boolean {
  const pad = 2;
  return (
    p.x > bbox.x - pad &&
    p.x < bbox.x + bbox.width + pad &&
    p.y > bbox.y - pad &&
    p.y < bbox.y + bbox.height + pad
  );
}

function dedupePoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  for (const p of points) {
    if (result.length === 0 || result[result.length - 1].x !== p.x || result[result.length - 1].y !== p.y) {
      result.push({ x: p.x, y: p.y });
    }
  }
  return result;
}

/**
 * Compute the set of orthogonal route waypoints connecting two anchored endpoints.
 *
 * The route consists exclusively of horizontal and vertical segments.
 * Waypoints are chosen so the path does not pass through the bounding boxes
 * of the source or target elements.
 *
 * @param sourcePos - Absolute canvas position of the source anchor
 * @param sourceAnchorDir - Direction of the source anchor in radians
 * @param targetPos - Absolute canvas position of the target anchor
 * @param targetAnchorDir - Direction of the target anchor in radians
 * @param sourceBBox - Bounding box of the source element
 * @param targetBBox - Bounding box of the target element
 * @param margin - Distance to extend beyond element bounds (default 30)
 * @returns Array of intermediate waypoints (not including source/target endpoints)
 */
export function computeOrthogonalRoute(
  sourcePos: { x: number; y: number },
  sourceAnchorDir: number,
  targetPos: { x: number; y: number },
  targetAnchorDir: number,
  sourceBBox: BBox,
  targetBBox: BBox,
  margin: number = 30,
): { x: number; y: number }[] {
  const srcCardinal = directionToCardinal(sourceAnchorDir);
  const tgtCardinal = directionToCardinal(targetAnchorDir);

  const srcExit = extendPoint(sourcePos, srcCardinal, margin);
  const tgtEntry = extendPoint(targetPos, tgtCardinal, margin);

  if (srcExit.x === tgtEntry.x || srcExit.y === tgtEntry.y) {
    return dedupePoints([srcExit, tgtEntry]);
  }

  const bendA = { x: tgtEntry.x, y: srcExit.y };
  const bendB = { x: srcExit.x, y: tgtEntry.y };

  const aInSource = pointInBBox(bendA, sourceBBox);
  const aInTarget = pointInBBox(bendA, targetBBox);

  if (!aInSource && !aInTarget) {
    return dedupePoints([srcExit, bendA, tgtEntry]);
  }

  return dedupePoints([srcExit, bendB, tgtEntry]);
}

/**
 * Resolve the absolute position and direction for a connector endpoint
 * that references an element anchor. Falls back to the stored coordinates
 * when the element or anchor cannot be found.
 */
function resolveEndpointForRouting(
  endpoint: { elementId?: string; anchorId?: string; x: number; y: number },
  elements: SceneDocument['elements'],
): { pos: { x: number; y: number }; dir: number } {
  if (!endpoint.elementId) {
    return { pos: { x: endpoint.x, y: endpoint.y }, dir: 0 };
  }

  const el = elements.find((e) => e.id === endpoint.elementId);
  if (!el) {
    return { pos: { x: endpoint.x, y: endpoint.y }, dir: 0 };
  }

  if (!endpoint.anchorId) {
    return { pos: { x: endpoint.x, y: endpoint.y }, dir: 0 };
  }

  const resolved = resolveAnchor(el, endpoint.anchorId);
  const anchors = getAnchors(el);
  const anchor = anchors.find((a) => a.id === endpoint.anchorId);

  return {
    pos: resolved ?? { x: endpoint.x, y: endpoint.y },
    dir: anchor?.direction ?? 0,
  };
}

/**
 * Recalculate orthogonal route waypoints for a single connector element.
 * Returns the element unchanged if it is not an orthogonal connector
 * or if its endpoints cannot be resolved.
 */
export function recalculateConnectorRoute(
  connector: ConnectorElement,
  elements: SceneDocument['elements'],
): ConnectorElement {
  if (connector.route.type !== 'orthogonal') return connector;

  const src = resolveEndpointForRouting(connector.source, elements);
  const tgt = resolveEndpointForRouting(connector.target, elements);

  const srcEl = connector.source.elementId
    ? elements.find((e) => e.id === connector.source.elementId)
    : undefined;
  const tgtEl = connector.target.elementId
    ? elements.find((e) => e.id === connector.target.elementId)
    : undefined;

  if (!srcEl || !tgtEl || !connector.source.anchorId || !connector.target.anchorId) {
    return connector;
  }

  const srcBBox = getBBox(srcEl);
  const tgtBBox = getBBox(tgtEl);

  const routePoints = computeOrthogonalRoute(
    src.pos,
    src.dir,
    tgt.pos,
    tgt.dir,
    srcBBox,
    tgtBBox,
  );

  return {
    ...connector,
    source: { ...connector.source, x: src.pos.x, y: src.pos.y },
    target: { ...connector.target, x: tgt.pos.x, y: tgt.pos.y },
    route: { ...connector.route, points: routePoints },
  };
}

/**
 * Recalculate orthogonal route waypoints for all connectors whose endpoints
 * reference any of the given element IDs. Used after positional changes.
 */
export function recalculateRoutesForElements(
  scene: SceneDocument,
  movedElementIds: Set<string>,
): SceneDocument {
  const elements = scene.elements.map((el) => {
    if (el.type !== 'connector') return el;
    const conn = el as ConnectorElement;

    const srcAffected = conn.source?.elementId && movedElementIds.has(conn.source.elementId);
    const tgtAffected = conn.target?.elementId && movedElementIds.has(conn.target.elementId);

    if (!srcAffected && !tgtAffected) return el;

    return recalculateConnectorRoute(conn, scene.elements);
  });

  return { ...scene, elements };
}
