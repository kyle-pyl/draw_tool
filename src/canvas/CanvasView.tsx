import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { SceneDocument, SceneElement, ShapeElement, TextElement, ImageElement, ConnectorElement, ConnectorEndpoint, ConnectorLabel, ArrowStyle, ElementStyle, BBox, AnchorPoint } from '../core/types';
import type { ElementInput } from '../core';
import type { Viewport } from './viewport';
import type { SelectionManager } from './selection';
import type { ConflictHighlighter } from './conflict';
import { getAnchors, resolveAnchor } from '../core/anchors';

export type DrawingToolType = 'select' | 'rect' | 'circle' | 'ellipse' | 'line' | 'polygon' | 'text' | 'connector';

interface DrawState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points: { x: number; y: number }[];
}

interface CanvasViewProps {
  scene: SceneDocument;
  viewport: Viewport;
  width?: number | string;
  height?: number | string;
  className?: string;
  onViewportChange?: () => void;
  selectionManager?: SelectionManager;
  onSelectionChange?: () => void;
  conflictHighlighter?: ConflictHighlighter;
  activeTool?: DrawingToolType;
  drawingLayerId?: string;
  onDrawComplete?: (input: ElementInput) => void;
  onTextEditRequest?: (elementId: string) => void;
}

function getElementBBox(el: SceneElement): BBox {
  const { x, y, width, height } = el.transform;
  return { x, y, width, height };
}

function getVisibleAnchors(el: SceneElement): { anchor: AnchorPoint; absX: number; absY: number }[] {
  const anchors = getAnchors(el);
  return anchors.map((anchor) => {
    const resolved = resolveAnchor(el, anchor.id);
    return {
      anchor,
      absX: resolved?.x ?? el.transform.x + anchor.position.x * el.transform.width,
      absY: resolved?.y ?? el.transform.y + anchor.position.y * el.transform.height,
    };
  });
}

function findElementAtPoint(
  canvasX: number,
  canvasY: number,
  elements: SceneElement[],
  excludeConnectors: boolean,
): SceneElement | null {
  const connectorBBoxPad = 0;
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (!el.visible || el.locked) continue;
    if (excludeConnectors && el.type === 'connector') continue;
    const bbox = getElementBBox(el);
    if (
      canvasX >= bbox.x &&
      canvasX <= bbox.x + bbox.width &&
      canvasY >= bbox.y &&
      canvasY <= bbox.y + bbox.height
    ) {
      return el;
    }
  }
  return null;
}

function findNearestAnchor(
  canvasX: number,
  canvasY: number,
  anchors: { anchor: AnchorPoint; absX: number; absY: number }[],
): string | null {
  const snapDist = 16;
  let nearestId: string | null = null;
  let nearestDist = Infinity;
  for (const a of anchors) {
    const dx = canvasX - a.absX;
    const dy = canvasY - a.absY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < snapDist && dist < nearestDist) {
      nearestDist = dist;
      nearestId = a.anchor.id;
    }
  }
  return nearestId;
}

function renderHandles(sx: number, sy: number, sw: number, sh: number, hs: number = 8) {
  const halfHs = hs / 2;
  const positions: [number, number][] = [
    [sx - halfHs, sy - halfHs],
    [sx + sw - halfHs, sy - halfHs],
    [sx - halfHs, sy + sh - halfHs],
    [sx + sw - halfHs, sy + sh - halfHs],
    [sx + sw / 2 - halfHs, sy - halfHs],
    [sx + sw - halfHs, sy + sh / 2 - halfHs],
    [sx + sw / 2 - halfHs, sy + sh - halfHs],
    [sx - halfHs, sy + sh / 2 - halfHs],
  ];
  return positions.map(([hx, hy], i) => (
    <rect key={i} x={hx} y={hy} width={hs} height={hs} fill="#fff" stroke="#2196F3" strokeWidth={1} />
  ));
}

function getElementTransform(el: SceneElement): string {
  const { x, y, width, height, rotation, scaleX, scaleY } = el.transform;
  if (rotation === 0 && scaleX === 1 && scaleY === 1) return '';
  const cx = x + width / 2;
  const cy = y + height / 2;
  const parts: string[] = [];
  if (scaleX !== 1 || scaleY !== 1) {
    parts.push(`translate(${cx}, ${cy}) scale(${scaleX}, ${scaleY}) translate(${-cx}, ${-cy})`);
  }
  if (rotation !== 0) {
    parts.push(`rotate(${rotation}, ${cx}, ${cy})`);
  }
  return parts.join(' ');
}

function pickStyleProps(style: ElementStyle): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (style.fill !== undefined) props.fill = style.fill;
  if (style.stroke !== undefined) props.stroke = style.stroke;
  if (style.strokeWidth !== undefined) props.strokeWidth = style.strokeWidth;
  if (style.strokeDasharray !== undefined) props.strokeDasharray = style.strokeDasharray;
  if (style.opacity !== undefined && style.opacity < 1) props.opacity = style.opacity;
  return props;
}

function renderShapeElement(el: ShapeElement) {
  const { x, y, width, height } = el.transform;
  const styleProps = pickStyleProps(el.style);
  const t = getElementTransform(el);

  switch (el.shapeKind) {
    case 'rect': {
      const rx = el.cornerRadius?.[0] ?? 0;
      return (
        <rect
          key={el.id}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={rx}
          transform={t || undefined}
          {...styleProps}
        />
      );
    }
    case 'circle': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const r = Math.min(width, height) / 2;
      return (
        <circle
          key={el.id}
          cx={cx}
          cy={cy}
          r={r}
          transform={t || undefined}
          {...styleProps}
        />
      );
    }
    case 'ellipse': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = width / 2;
      const ry = height / 2;
      return (
        <ellipse
          key={el.id}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          transform={t || undefined}
          {...styleProps}
        />
      );
    }
    case 'polygon': {
      const pointsStr = el.points?.map((p) => `${p.x},${p.y}`).join(' ') ?? '';
      return (
        <polygon
          key={el.id}
          points={pointsStr}
          transform={`translate(${x}, ${y})${t ? ' ' + t : ''}`}
          {...styleProps}
        />
      );
    }
    case 'path': {
      const d = el.pathCommands ?? '';
      return (
        <path
          key={el.id}
          d={d}
          transform={`translate(${x}, ${y})${t ? ' ' + t : ''}`}
          {...styleProps}
        />
      );
    }
    default:
      return null;
  }
}

function renderTextElement(el: TextElement) {
  const { x, y, width, height } = el.transform;
  const { fill, fontSize, fontFamily, fontWeight, fontStyle, textAlign, textDecoration, opacity } = el.style;
  const t = getElementTransform(el);

  const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';
  const displayY = y + (fontSize ?? 16);

  const hasBackground = el.backgroundColor && el.backgroundColor !== 'transparent';
  const hasBorder = el.borderColor && el.borderColor !== 'transparent' && (el.borderWidth ?? 1) > 0;

  return (
    <g key={el.id}>
      {(hasBackground || hasBorder) && (
        <rect
          x={x}
          y={y}
          width={width}
          height={height || (fontSize ?? 16) * 1.4}
          fill={hasBackground ? el.backgroundColor : 'none'}
          stroke={hasBorder ? el.borderColor : 'none'}
          strokeWidth={hasBorder ? (el.borderWidth ?? 1) : 0}
        />
      )}
      <text
        x={textAnchor === 'middle' ? x + width / 2 : textAnchor === 'end' ? x + width : x}
        y={displayY}
        fill={fill}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
        textDecoration={textDecoration}
        opacity={opacity !== 1 ? opacity : undefined}
        textAnchor={textAnchor}
        transform={t || undefined}
      >
        {el.text}
      </text>
    </g>
  );
}

function renderImageElement(el: ImageElement) {
  const { x, y, width, height } = el.transform;
  const t = getElementTransform(el);
  const { opacity } = el.style;

  return (
    <image
      key={el.id}
      href={el.src}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity !== 1 ? opacity : undefined}
      preserveAspectRatio={el.objectFit === 'contain' ? 'xMidYMid meet' : el.objectFit === 'cover' ? 'xMidYMid slice' : 'none'}
      transform={t || undefined}
    />
  );
}

function resolveEndpointPosition(ep: ConnectorEndpoint, _elements: SceneElement[]): { x: number; y: number } {
  return { x: ep.x, y: ep.y };
}

function computePathPoints(
  source: { x: number; y: number },
  target: { x: number; y: number },
  routePoints: { x: number; y: number }[],
): { x: number; y: number }[] {
  return [source, ...routePoints, target];
}

function computeTotalPathLength(points: { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function computePointOnPath(points: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const tClamped = Math.max(0, Math.min(1, t));
  const totalLen = computeTotalPathLength(points);
  if (totalLen === 0) return points[0];

  const targetDist = tClamped * totalLen;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segLen >= targetDist || i === points.length - 1) {
      const segT = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      const segTClamped = Math.max(0, Math.min(1, segT));
      return {
        x: points[i - 1].x + segTClamped * dx,
        y: points[i - 1].y + segTClamped * dy,
      };
    }
    accumulated += segLen;
  }

  return points[points.length - 1];
}

function createArrowMarkerId(arrow: ArrowStyle, prefix: string): string {
  return `arrow-${prefix}-${arrow.type}-${arrow.size ?? 1}-${arrow.color ?? 'default'}-${Date.now()}`;
}

const arrowMarkerCache = new Map<string, React.ReactElement>();

function buildArrowMarkers(scene: SceneDocument): React.ReactElement[] {
  const markers: React.ReactElement[] = [];
  const seen = new Set<string>();

  for (const el of scene.elements) {
    if (el.type !== 'connector') continue;
    const conn = el as ConnectorElement;

    for (const [pos, arrow] of [['start', conn.arrowStart], ['end', conn.arrowEnd]] as const) {
      if (!arrow || arrow.type === 'none') continue;
      const key = `${pos}-${arrow.type}-${arrow.size ?? 1}-${arrow.color ?? conn.style.stroke}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const color = arrow.color ?? (conn.style.stroke as string) ?? '#333';
      const size = (arrow.size ?? 1) * 6;

      switch (arrow.type) {
        case 'triangle': {
          const w = size * 1.6;
          const h = size * 1.2;
          markers.push(
            <marker
              key={key}
              id={key}
              markerWidth={w}
              markerHeight={h}
              refX={pos === 'end' ? w * 0.85 : w * 0.15}
              refY={h / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d={`M 0 0 L ${w} ${h / 2} L 0 ${h} Z`} fill={color} />
            </marker>,
          );
          break;
        }
        case 'openTriangle': {
          const w = size * 1.6;
          const h = size * 1.2;
          const sw = 1.5;
          markers.push(
            <marker
              key={key}
              id={key}
              markerWidth={w}
              markerHeight={h}
              refX={pos === 'end' ? w * 0.85 : w * 0.15}
              refY={h / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d={`M ${sw} ${sw} L ${w - sw} ${h / 2} L ${sw} ${h - sw}`} fill="none" stroke={color} strokeWidth={sw} />
            </marker>,
          );
          break;
        }
        case 'diamond': {
          const w = size * 1.6;
          const h = size * 1.6;
          markers.push(
            <marker
              key={key}
              id={key}
              markerWidth={w}
              markerHeight={h}
              refX={pos === 'end' ? w * 0.8 : w * 0.2}
              refY={h / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} fill={color} />
            </marker>,
          );
          break;
        }
        case 'circle': {
          const w = size;
          const h = size;
          const r = size / 2 - 0.5;
          markers.push(
            <marker
              key={key}
              id={key}
              markerWidth={w}
              markerHeight={h}
              refX={pos === 'end' ? w * 0.7 : w * 0.3}
              refY={h / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <circle cx={w / 2} cy={h / 2} r={r} fill={color} />
            </marker>,
          );
          break;
        }
      }
    }
  }
  return markers;
}

function renderConnectorElement(el: ConnectorElement, elements: SceneElement[]) {
  const source = resolveEndpointPosition(el.source, elements);
  const target = resolveEndpointPosition(el.target, elements);
  const routePoints = el.route.points;
  const routeType = el.route.type;

  const styleProps = pickStyleProps(el.style);
  const strokeColor = (styleProps.stroke as string) || '#333';
  const strokeW = (styleProps.strokeWidth as number) || 2;

  const pathPoints = computePathPoints(source, target, routeType === 'straight' && routePoints.length === 0 ? [] : routePoints);

  const arrowStartKey = el.arrowStart && el.arrowStart.type !== 'none'
    ? `start-${el.arrowStart.type}-${el.arrowStart.size ?? 1}-${el.arrowStart.color ?? strokeColor}`
    : undefined;

  const arrowEndKey = el.arrowEnd && el.arrowEnd.type !== 'none'
    ? `end-${el.arrowEnd.type}-${el.arrowEnd.size ?? 1}-${el.arrowEnd.color ?? strokeColor}`
    : undefined;

  const pointsStr = pathPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const lineMarkup: React.ReactNode = pathPoints.length === 2 && routeType !== 'polyline' ? (
    <line
      x1={pathPoints[0].x}
      y1={pathPoints[0].y}
      x2={pathPoints[1].x}
      y2={pathPoints[1].y}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeW}
      opacity={styleProps.opacity as number}
      strokeDasharray={styleProps.strokeDasharray as string}
      markerStart={arrowStartKey ? `url(#${arrowStartKey})` : undefined}
      markerEnd={arrowEndKey ? `url(#${arrowEndKey})` : undefined}
    />
  ) : (
    <polyline
      points={pointsStr}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeW}
      opacity={styleProps.opacity as number}
      strokeDasharray={styleProps.strokeDasharray as string}
      markerStart={arrowStartKey ? `url(#${arrowStartKey})` : undefined}
      markerEnd={arrowEndKey ? `url(#${arrowEndKey})` : undefined}
    />
  );

  const labelMarkup: React.ReactNode[] = [];
  if (el.labels && el.labels.length > 0) {
    for (let i = 0; i < el.labels.length; i++) {
      const label = el.labels[i];
      const pt = computePointOnPath(pathPoints, label.position);
      const lx = pt.x + (label.offset?.dx ?? 0);
      const ly = pt.y + (label.offset?.dy ?? 0);
      labelMarkup.push(
        <text
          key={`label-${i}`}
          x={lx}
          y={ly}
          fill={strokeColor}
          fontSize={el.style.fontSize ?? 12}
          fontFamily={el.style.fontFamily ?? 'Arial'}
          fontWeight={el.style.fontWeight}
          fontStyle={el.style.fontStyle}
          textAnchor="middle"
          dominantBaseline="central"
          pointerEvents="none"
        >
          {label.text}
        </text>,
      );
    }
  }

  return (
    <g key={el.id}>
      {lineMarkup}
      {labelMarkup}
    </g>
  );
}

function renderElement(el: SceneElement, elements: SceneElement[]): React.ReactElement | null {
  if (!el.visible) return null;

  switch (el.type) {
    case 'shape':
      return renderShapeElement(el as ShapeElement);
    case 'text':
      return renderTextElement(el as TextElement);
    case 'image':
      return renderImageElement(el as ImageElement);
    case 'connector':
      return renderConnectorElement(el as ConnectorElement, elements);
    default:
      return null;
  }
}

interface MarqueeState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const DEFAULT_STYLE: ElementStyle = {
  fill: '#e8e8e8',
  stroke: '#333',
  strokeWidth: 2,
  opacity: 1,
};

export function drawStateToInput(tool: DrawingToolType, state: DrawState, layerId: string): ElementInput {
  const { x1, y1, x2, y2, points } = state;

  switch (tool) {
    case 'rect': {
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const w = Math.abs(x2 - x1) || 20;
      const h = Math.abs(y2 - y1) || 20;
      return {
        type: 'shape',
        layerId,
        shapeKind: 'rect',
        transform: { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...DEFAULT_STYLE },
      };
    }
    case 'circle': {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const d = Math.max(Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)), 10);
      return {
        type: 'shape',
        layerId,
        shapeKind: 'circle',
        transform: { x: cx - d / 2, y: cy - d / 2, width: d, height: d, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...DEFAULT_STYLE },
      };
    }
    case 'ellipse': {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.max(Math.abs(x2 - x1) / 2, 10);
      const ry = Math.max(Math.abs(y2 - y1) / 2, 10);
      return {
        type: 'shape',
        layerId,
        shapeKind: 'ellipse',
        transform: { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...DEFAULT_STYLE },
      };
    }
    case 'line': {
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const w = Math.abs(x2 - x1) || 20;
      const h = Math.abs(y2 - y1) || 20;
      const d = `M ${x1 - x} ${y1 - y} L ${x2 - x} ${y2 - y}`;
      return {
        type: 'shape',
        layerId,
        shapeKind: 'path',
        pathCommands: d,
        transform: { x: x, y: y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...DEFAULT_STYLE, fill: 'none' },
      };
    }
    case 'polygon': {
      if (points.length < 3) {
        const px = Math.min(...points.map((p) => p.x));
        const py = Math.min(...points.map((p) => p.y));
        const w = Math.max(Math.max(...points.map((p) => p.x)) - px, 10);
        const h = Math.max(Math.max(...points.map((p) => p.y)) - py, 10);
        return {
          type: 'shape',
          layerId,
          shapeKind: 'path',
          pathCommands: `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`,
          transform: { x: px, y: py, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
          style: { ...DEFAULT_STYLE },
        };
      }
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const w = Math.max(maxX - minX, 10);
      const h = Math.max(maxY - minY, 10);
      const relPoints = points.map((p) => ({ x: p.x - minX, y: p.y - minY }));
      return {
        type: 'shape',
        layerId,
        shapeKind: 'polygon',
        points: relPoints,
        transform: { x: minX, y: minY, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...DEFAULT_STYLE },
      };
    }
    case 'text': {
      const x = x1;
      const y = y1;
      return {
        type: 'text',
        layerId,
        text: '',
        transform: { x, y, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        style: {
          fill: '#000000',
          fontSize: 16,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left',
          opacity: 1,
          stroke: 'none',
          strokeWidth: 0,
        },
      };
    }
    default:
      return {
        type: 'shape',
        layerId,
        shapeKind: 'rect',
        transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { ...DEFAULT_STYLE },
      };
  }
}

export function renderDrawPreview(tool: DrawingToolType, state: DrawState): React.ReactNode {
  const { x1, y1, x2, y2, points } = state;
  const previewStroke = '#4285F4';
  const previewFill = 'rgba(66, 133, 244, 0.12)';

  switch (tool) {
    case 'rect': {
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const w = Math.abs(x2 - x1);
      const h = Math.abs(y2 - y1);
      return (
        <rect
          x={x}
          y={y}
          width={w || 1}
          height={h || 1}
          fill={previewFill}
          stroke={previewStroke}
          strokeWidth={2}
          strokeDasharray="5 3"
          pointerEvents="none"
        />
      );
    }
    case 'circle': {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const r = Math.max(Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2, 1);
      return (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={previewFill}
          stroke={previewStroke}
          strokeWidth={2}
          strokeDasharray="5 3"
          pointerEvents="none"
        />
      );
    }
    case 'ellipse': {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.max(Math.abs(x2 - x1) / 2, 1);
      const ry = Math.max(Math.abs(y2 - y1) / 2, 1);
      return (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={previewFill}
          stroke={previewStroke}
          strokeWidth={2}
          strokeDasharray="5 3"
          pointerEvents="none"
        />
      );
    }
    case 'line': {
      return (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={previewStroke}
          strokeWidth={2}
          strokeDasharray="5 3"
          pointerEvents="none"
        />
      );
    }
    case 'polygon': {
      if (points.length === 0) return null;
      const ptsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
      return (
        <g pointerEvents="none">
          {points.length > 1 && (
            <polyline
              points={ptsStr}
              fill="none"
              stroke={previewStroke}
              strokeWidth={2}
              strokeDasharray="2 2"
            />
          )}
          <line
            x1={points[points.length - 1].x}
            y1={points[points.length - 1].y}
            x2={x2}
            y2={y2}
            stroke={previewStroke}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={previewStroke} stroke="none" />
          ))}
        </g>
      );
    }
    case 'text': {
      return (
        <text
          x={x1}
          y={y1}
          fill="#4285F4"
          fontSize={14}
          fontStyle="italic"
          opacity={0.6}
          pointerEvents="none"
        >
          Click to type...
        </text>
      );
    }
    default:
      return null;
  }
}

export function CanvasView({ scene, viewport, width, height, className, onViewportChange, selectionManager, onSelectionChange, conflictHighlighter, activeTool, drawingLayerId, onDrawComplete, onTextEditRequest }: CanvasViewProps) {
  const layersSorted = [...scene.layers].sort((a, b) => a.order - b.order);
  const layerElementMap = new Map<string, SceneElement[]>();
  const layerMap = new Map(scene.layers.map((l) => [l.id, l]));

  for (const el of scene.elements) {
    const list = layerElementMap.get(el.layerId);
    if (list) {
      list.push(el);
    } else {
      layerElementMap.set(el.layerId, [el]);
    }
  }

  const viewportTransform = viewport.getTransformMatrix();

  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const spaceDownRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const didDragRef = useRef(false);

  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const drawStateRef = useRef<DrawState | null>(null);
  const drawHandledRef = useRef(false);
  const isDrawing = activeTool && activeTool !== 'select' && activeTool !== 'connector';
  const isConnectorTool = activeTool === 'connector';

  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [hoveredAnchorId, setHoveredAnchorId] = useState<string | null>(null);
  const [connectorDrawing, setConnectorDrawing] = useState<{
    sourceElementId: string;
    sourceAnchorId: string;
    sourceX: number;
    sourceY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const connectorDrawingRef = useRef<{
    sourceElementId: string;
    sourceAnchorId: string;
    sourceX: number;
    sourceY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const selectedElements = selectionManager
    ? selectionManager.getSelectedElements(scene)
    : [];

  const notifyChange = useCallback(() => {
    onViewportChange?.();
  }, [onViewportChange]);

  const screenToCanvas = useCallback(
    (sx: number, sy: number) => viewport.screenToCanvas(sx, sy),
    [viewport],
  );

  const completeDragDraw = useCallback(
    (tool: DrawingToolType, state: DrawState) => {
      if (!onDrawComplete || !drawingLayerId) return;
      const input = drawStateToInput(tool, state, drawingLayerId);
      onDrawComplete(input);
    },
    [onDrawComplete, drawingLayerId],
  );

  const completePolygonDraw = useCallback(
    (state: DrawState) => {
      if (!onDrawComplete || !drawingLayerId) return;
      if (state.points.length < 2) return;
      const fullPoints = state.points;
      const input = drawStateToInput('polygon', { ...state, points: fullPoints }, drawingLayerId);
      onDrawComplete(input);
    },
    [onDrawComplete, drawingLayerId],
  );

  const handleElementClick = useCallback(
    (e: React.MouseEvent, el: SceneElement) => {
      e.stopPropagation();
      if (!selectionManager) return;
      if (spaceDownRef.current) return;
      if (el.locked) return;
      if (isDrawing) return;
      if (e.shiftKey) {
        selectionManager.toggleSelect(el.id);
      } else {
        selectionManager.select(el.id);
      }
      onSelectionChange?.();
    },
    [selectionManager, onSelectionChange, isDrawing]
  );

  const handleBackgroundClick = useCallback(() => {
    if (!selectionManager) return;
    if (drawHandledRef.current) {
      drawHandledRef.current = false;
      return;
    }
    if (didDragRef.current) return;
    selectionManager.clearSelection();
    onSelectionChange?.();
  }, [selectionManager, onSelectionChange]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as Element;
      const isOnElement = target.closest('[data-element-id]') !== null;

      if (drawStateRef.current && activeTool === 'polygon' && drawStateRef.current.points.length >= 2) {
        e.preventDefault();
        completePolygonDraw(drawStateRef.current);
        drawStateRef.current = null;
        setDrawState(null);
        drawHandledRef.current = true;
        return;
      }

      if (isOnElement && onTextEditRequest) {
        const elementGroup = target.closest('[data-element-id]');
        if (elementGroup) {
          const elementId = elementGroup.getAttribute('data-element-id');
          if (elementId) {
            const el = scene.elements.find((e2) => e2.id === elementId);
            if (el && el.type === 'text') {
              e.preventDefault();
              onTextEditRequest(elementId);
            }
          }
        }
      }
    },
    [activeTool, completePolygonDraw, scene.elements, onTextEditRequest],
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
    }
    setMarquee(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        spaceDownRef.current = true;
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDownRef.current = false;
        setSpacePressed(false);
        if (isPanningRef.current) {
          isPanningRef.current = false;
          setIsPanning(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;

      if (e.deltaY < 0) {
        viewport.zoomIn(centerX, centerY);
      } else {
        viewport.zoomOut(centerX, centerY);
      }
      notifyChange();
    },
    [viewport, notifyChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button === 1 || (e.button === 0 && spacePressed)) {
        e.preventDefault();
        isPanningRef.current = true;
        setIsPanning(true);
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (e.button === 0 && isConnectorTool) {
        const target = e.target as Element;
        const elementGroup = target.closest('[data-element-id]');
        if (elementGroup) {
          const elementId = elementGroup.getAttribute('data-element-id');
          if (elementId) {
            const el = scene.elements.find((e2) => e2.id === elementId);
            if (el && el.type !== 'connector') {
              const rect = e.currentTarget.getBoundingClientRect();
              const canvasPt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
              const anchors = getVisibleAnchors(el);
              const nearestAnchorId = findNearestAnchor(canvasPt.x, canvasPt.y, anchors);
              if (nearestAnchorId) {
                const resolved = resolveAnchor(el, nearestAnchorId);
                if (resolved) {
                  e.stopPropagation();
                  e.preventDefault();
                  const state = {
                    sourceElementId: el.id,
                    sourceAnchorId: nearestAnchorId,
                    sourceX: resolved.x,
                    sourceY: resolved.y,
                    currentX: resolved.x,
                    currentY: resolved.y,
                  };
                  connectorDrawingRef.current = state;
                  setConnectorDrawing(state);
                  return;
                }
              }
            }
          }
        }
        return;
      }

      if (e.button === 0 && isDrawing) {
        const target = e.target as Element;
        const isOnElement = target.closest('[data-element-id]') !== null;

        if (activeTool === 'polygon') {
          if (isOnElement) return;
          e.preventDefault();
          drawHandledRef.current = true;
          const rect = e.currentTarget.getBoundingClientRect();
          const canvasPt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);

          const prev = drawStateRef.current;
          const newPoints = prev?.points ? [...prev.points, canvasPt] : [canvasPt];
          const newState: DrawState = {
            x1: canvasPt.x,
            y1: canvasPt.y,
            x2: canvasPt.x,
            y2: canvasPt.y,
            points: newPoints,
          };
          drawStateRef.current = newState;
          setDrawState(newState);
          return;
        }

        if (activeTool === 'text' || !isOnElement) {
          const rect = e.currentTarget.getBoundingClientRect();
          const canvasPt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
          const newState: DrawState = {
            x1: canvasPt.x,
            y1: canvasPt.y,
            x2: canvasPt.x,
            y2: canvasPt.y,
            points: [],
          };
          drawStateRef.current = newState;
          setDrawState(newState);
          return;
        }

        return;
      }

      if (e.button === 0) {
        const target = e.target as Element;
        const isOnElement = target.closest('[data-element-id]') !== null;
        if (!isOnElement) {
          const rect = e.currentTarget.getBoundingClientRect();
          setMarquee({
            startX: e.clientX - rect.left,
            startY: e.clientY - rect.top,
            endX: e.clientX - rect.left,
            endY: e.clientY - rect.top,
          });
          didDragRef.current = false;
        }
      }
    },
    [spacePressed, isDrawing, activeTool, screenToCanvas, isConnectorTool, scene.elements]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        viewport.pan(dx, dy);
        notifyChange();
        return;
      }

      if (connectorDrawingRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const canvasPt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        const cd = connectorDrawingRef.current;
        const updated = { ...cd, currentX: canvasPt.x, currentY: canvasPt.y };
        connectorDrawingRef.current = updated;
        setConnectorDrawing(updated);
        return;
      }

      if (drawStateRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const canvasPt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        const ds = drawStateRef.current;
        const updated: DrawState = { ...ds, x2: canvasPt.x, y2: canvasPt.y };
        drawStateRef.current = updated;
        setDrawState(updated);
        return;
      }

      if (marquee) {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (Math.abs(mx - marquee.startX) > 3 || Math.abs(my - marquee.startY) > 3) {
          didDragRef.current = true;
        }
        setMarquee(prev => prev ? { ...prev, endX: mx, endY: my } : null);
      }

      if (isConnectorTool && !connectorDrawingRef.current) {
        const target = e.target as Element;
        const elementGroup = target.closest('[data-element-id]');
        if (elementGroup) {
          const elementId = elementGroup.getAttribute('data-element-id');
          if (elementId) {
            const el = scene.elements.find((e2) => e2.id === elementId);
            if (el && el.type !== 'connector') {
              const rect = e.currentTarget.getBoundingClientRect();
              const canvasPt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
              const anchors = getVisibleAnchors(el);
              const nearestId = findNearestAnchor(canvasPt.x, canvasPt.y, anchors);
              setHoveredElementId(elementId);
              setHoveredAnchorId(nearestId);
              return;
            }
          }
        }
        setHoveredElementId(null);
        setHoveredAnchorId(null);
      }
    },
    [viewport, notifyChange, marquee, screenToCanvas, isConnectorTool, scene.elements]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.button === 1 || e.button === 0) && isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      return;
    }

    if (connectorDrawingRef.current && onDrawComplete && drawingLayerId) {
      const cd = connectorDrawingRef.current;
      const target = e.target as Element;
      const elementGroup = target.closest('[data-element-id]');
      let targetElementId: string | undefined;
      let targetAnchorId: string | undefined;

      if (elementGroup) {
        const elId = elementGroup.getAttribute('data-element-id');
        if (elId && elId !== cd.sourceElementId) {
          const el = scene.elements.find((e2) => e2.id === elId);
          if (el && el.type !== 'connector') {
            const anchors = getVisibleAnchors(el);
            const nearestId = findNearestAnchor(cd.currentX, cd.currentY, anchors);
            if (nearestId) {
              targetElementId = el.id;
              targetAnchorId = nearestId;
            }
          }
        }
      }

      const input: ElementInput = {
        type: 'connector',
        layerId: drawingLayerId,
        transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        style: { fill: 'none', stroke: '#333', strokeWidth: 2, opacity: 1 },
        source: {
          elementId: cd.sourceElementId,
          anchorId: cd.sourceAnchorId,
          x: cd.sourceX,
          y: cd.sourceY,
        },
        target: {
          elementId: targetElementId,
          anchorId: targetAnchorId,
          x: targetElementId ? (() => {
            const tel = scene.elements.find((e2) => e2.id === targetElementId);
            if (tel && targetAnchorId) {
              const r = resolveAnchor(tel, targetAnchorId);
              if (r) return r.x;
            }
            return cd.currentX;
          })() : cd.currentX,
          y: targetElementId ? (() => {
            const tel = scene.elements.find((e2) => e2.id === targetElementId);
            if (tel && targetAnchorId) {
              const r = resolveAnchor(tel, targetAnchorId);
              if (r) return r.y;
            }
            return cd.currentY;
          })() : cd.currentY,
        },
        route: { type: 'straight', points: [] },
      };

      onDrawComplete(input);
      connectorDrawingRef.current = null;
      setConnectorDrawing(null);
      return;
    }

    if (drawStateRef.current && activeTool && activeTool !== 'polygon') {
      completeDragDraw(activeTool, drawStateRef.current);
      drawStateRef.current = null;
      setDrawState(null);
      return;
    }

    if (marquee && didDragRef.current && selectionManager) {
      const minX = Math.min(marquee.startX, marquee.endX);
      const maxX = Math.max(marquee.startX, marquee.endX);
      const minY = Math.min(marquee.startY, marquee.endY);
      const maxY = Math.max(marquee.startY, marquee.endY);

      const canvasTopLeft = viewport.screenToCanvas(minX, minY);
      const canvasBottomRight = viewport.screenToCanvas(maxX, maxY);

      const containedIds: string[] = [];
      for (const el of scene.elements) {
        if (!el.visible || el.locked) continue;
        const elLayer = layerMap.get(el.layerId);
        if (elLayer?.locked) continue;
        const bbox = getElementBBox(el);
        if (
          bbox.x >= canvasTopLeft.x &&
          bbox.y >= canvasTopLeft.y &&
          bbox.x + bbox.width <= canvasBottomRight.x &&
          bbox.y + bbox.height <= canvasBottomRight.y
        ) {
          containedIds.push(el.id);
        }
      }

      if (e.shiftKey) {
        selectionManager.addToSelection(containedIds);
      } else {
        selectionManager.selectByIds(containedIds);
      }
      onSelectionChange?.();
    }

    setMarquee(null);
  }, [viewport, marquee, selectionManager, scene, onSelectionChange, activeTool, completeDragDraw, onDrawComplete, drawingLayerId]);

  const handleContextMenu = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanningRef.current) {
      e.preventDefault();
    }
  }, []);

  const getCursor = (): string => {
    if (isPanning) return 'grabbing';
    if (spacePressed) return 'grab';
    if (activeTool === 'connector') return 'crosshair';
    if (activeTool === 'polygon') return 'crosshair';
    if (isDrawing) return 'crosshair';
    return 'default';
  };

  const cursor = getCursor();

  return (
    <svg
      width={width ?? '100%'}
      height={height ?? '100%'}
      className={className}
      style={{ display: 'block', background: scene.canvas.background, cursor }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onClick={handleBackgroundClick}
    >
      <defs>
        {buildArrowMarkers(scene)}
      </defs>
      <g transform={viewportTransform}>
        {layersSorted.map((layer) => {
          const els = layerElementMap.get(layer.id) ?? [];
          const isLayerLocked = layer.locked;
          const isLayerHidden = !layer.visible;
          return (
            <g
              key={layer.id}
              id={`layer-${layer.id}`}
              data-layer-name={layer.name}
              style={isLayerHidden ? { visibility: 'hidden' } : undefined}
            >
              {els.map((el) => (
                <g
                  key={el.id}
                  onClick={isLayerLocked || el.locked ? undefined : (e) => handleElementClick(e, el)}
                  style={{ cursor: isLayerLocked || el.locked ? 'default' : 'pointer' }}
                  data-element-id={el.id}
                >
                  {renderElement(el, scene.elements)}
                </g>
              ))}
            </g>
          );
        })}
        {drawState && activeTool && (
          <g pointerEvents="none">
            {renderDrawPreview(activeTool, drawState)}
          </g>
        )}
        {isConnectorTool && hoveredElementId && (() => {
          const el = scene.elements.find((e) => e.id === hoveredElementId);
          if (!el || el.type === 'connector') return null;
          const anchors = getVisibleAnchors(el);
          return (
            <g pointerEvents="none">
              {anchors.map((a) => {
                const isHovered = a.anchor.id === hoveredAnchorId;
                const r = isHovered ? 6 : 4;
                return (
                  <circle
                    key={`anchor-${el.id}-${a.anchor.id}`}
                    cx={a.absX}
                    cy={a.absY}
                    r={r}
                    fill={isHovered ? '#4CAF50' : '#fff'}
                    stroke={isHovered ? '#2E7D32' : '#2196F3'}
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          );
        })()}
        {connectorDrawing && (
          <g pointerEvents="none">
            <line
              x1={connectorDrawing.sourceX}
              y1={connectorDrawing.sourceY}
              x2={connectorDrawing.currentX}
              y2={connectorDrawing.currentY}
              stroke="#4CAF50"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
            <circle
              cx={connectorDrawing.sourceX}
              cy={connectorDrawing.sourceY}
              r={5}
              fill="#4CAF50"
            />
          </g>
        )}
      </g>
      {marquee && (
        <rect
          x={Math.min(marquee.startX, marquee.endX)}
          y={Math.min(marquee.startY, marquee.endY)}
          width={Math.abs(marquee.endX - marquee.startX)}
          height={Math.abs(marquee.endY - marquee.startY)}
          fill="rgba(33, 150, 243, 0.1)"
          stroke="#2196F3"
          strokeWidth={1}
          strokeDasharray="4 2"
          pointerEvents="none"
        />
      )}
      {selectedElements.length > 0 && (
        <g pointerEvents="none" className="selection-overlay">
          {selectedElements.map((el) => {
            const bbox = getElementBBox(el);
            const sx = viewport.zoom * bbox.x + viewport.offsetX;
            const sy = viewport.zoom * bbox.y + viewport.offsetY;
            const sw = viewport.zoom * bbox.width;
            const sh = viewport.zoom * bbox.height;

            return (
              <g key={`sel-${el.id}`}>
                <rect
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  fill="none"
                  stroke="#2196F3"
                  strokeWidth={1}
                />
                {renderHandles(sx, sy, sw, sh)}
              </g>
            );
          })}
        </g>
      )}
      {conflictHighlighter?.hasConflicts && (
        <g pointerEvents="none" className="conflict-overlay">
          {conflictHighlighter.getConflicts().map((conflict) => {
            const elA = scene.elements.find((e) => e.id === conflict.elementAId);
            const elB = scene.elements.find((e) => e.id === conflict.elementBId);

            return (
              <g key={`conflict-${conflict.id}`}>
                {elA && (() => {
                  const bbox = getElementBBox(elA);
                  const sx = viewport.zoom * bbox.x + viewport.offsetX;
                  const sy = viewport.zoom * bbox.y + viewport.offsetY;
                  const sw = viewport.zoom * bbox.width;
                  const sh = viewport.zoom * bbox.height;
                  return (
                    <rect
                      x={sx}
                      y={sy}
                      width={sw}
                      height={sh}
                      fill="rgba(244, 67, 54, 0.08)"
                      stroke="#F44336"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                    />
                  );
                })()}
                {elB && (() => {
                  const bbox = getElementBBox(elB);
                  const sx = viewport.zoom * bbox.x + viewport.offsetX;
                  const sy = viewport.zoom * bbox.y + viewport.offsetY;
                  const sw = viewport.zoom * bbox.width;
                  const sh = viewport.zoom * bbox.height;
                  return (
                    <rect
                      x={sx}
                      y={sy}
                      width={sw}
                      height={sh}
                      fill="rgba(244, 67, 54, 0.08)"
                      stroke="#F44336"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                    />
                  );
                })()}
                <rect
                  x={viewport.zoom * conflict.overlapBBox.x + viewport.offsetX}
                  y={viewport.zoom * conflict.overlapBBox.y + viewport.offsetY}
                  width={viewport.zoom * conflict.overlapBBox.width}
                  height={viewport.zoom * conflict.overlapBBox.height}
                  fill="rgba(244, 67, 54, 0.15)"
                  stroke="none"
                />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
