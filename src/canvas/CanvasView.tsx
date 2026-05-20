import { useRef, useState, useEffect, useCallback } from 'react';
import type { SceneDocument, SceneElement, ShapeElement, TextElement, ImageElement, ConnectorElement, ConnectorEndpoint, ElementStyle, BBox } from '../core/types';
import type { ElementInput } from '../core';
import type { Viewport } from './viewport';
import type { SelectionManager } from './selection';
import type { ConflictHighlighter } from './conflict';

export type DrawingToolType = 'select' | 'rect' | 'circle' | 'ellipse' | 'line' | 'polygon' | 'text';

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

function renderConnectorElement(el: ConnectorElement, elements: SceneElement[]) {
  const source = resolveEndpointPosition(el.source, elements);
  const target = resolveEndpointPosition(el.target, elements);
  const routePoints = el.route.points;

  const allPoints =
    routePoints.length > 0
      ? [source, ...routePoints, target]
      : [source, target];

  const pointsStr = allPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const styleProps = pickStyleProps(el.style);

  return (
    <polyline
      key={el.id}
      points={pointsStr}
      fill="none"
      {...styleProps}
    />
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
  const isDrawing = activeTool && activeTool !== 'select';

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
    [spacePressed, isDrawing, activeTool, screenToCanvas]
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
    },
    [viewport, notifyChange, marquee, screenToCanvas]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.button === 1 || e.button === 0) && isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
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
  }, [viewport, marquee, selectionManager, scene, onSelectionChange, activeTool, completeDragDraw]);

  const handleContextMenu = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanningRef.current) {
      e.preventDefault();
    }
  }, []);

  const getCursor = (): string => {
    if (isPanning) return 'grabbing';
    if (spacePressed) return 'grab';
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
