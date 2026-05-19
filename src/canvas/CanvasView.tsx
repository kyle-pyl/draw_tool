import { useRef, useState, useEffect, useCallback } from 'react';
import type { SceneDocument, SceneElement, ShapeElement, TextElement, ImageElement, ConnectorElement, ConnectorEndpoint, ElementStyle, BBox } from '../core/types';
import type { Viewport } from './viewport';
import type { SelectionManager } from './selection';

interface CanvasViewProps {
  scene: SceneDocument;
  viewport: Viewport;
  width?: number | string;
  height?: number | string;
  className?: string;
  onViewportChange?: () => void;
  selectionManager?: SelectionManager;
  onSelectionChange?: () => void;
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
  const { x, y, width } = el.transform;
  const { fill, fontSize, fontFamily, fontWeight, fontStyle, textAlign, textDecoration, opacity } = el.style;
  const t = getElementTransform(el);

  const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';
  const displayY = y + (fontSize ?? 16);

  return (
    <text
      key={el.id}
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

export function CanvasView({ scene, viewport, width, height, className, onViewportChange, selectionManager, onSelectionChange }: CanvasViewProps) {
  const layersSorted = [...scene.layers].sort((a, b) => a.order - b.order);
  const layerElementMap = new Map<string, SceneElement[]>();

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

  const selectedElements = selectionManager
    ? selectionManager.getSelectedElements(scene)
    : [];

  const notifyChange = useCallback(() => {
    onViewportChange?.();
  }, [onViewportChange]);

  const handleElementClick = useCallback(
    (e: React.MouseEvent, el: SceneElement) => {
      e.stopPropagation();
      if (!selectionManager) return;
      if (spaceDownRef.current) return;
      if (el.locked) return;
      if (e.shiftKey) {
        selectionManager.toggleSelect(el.id);
      } else {
        selectionManager.select(el.id);
      }
      onSelectionChange?.();
    },
    [selectionManager, onSelectionChange]
  );

  const handleBackgroundClick = useCallback(() => {
    if (!selectionManager) return;
    selectionManager.clearSelection();
    onSelectionChange?.();
  }, [selectionManager, onSelectionChange]);

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
      }
    },
    [spacePressed]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      viewport.pan(dx, dy);
      notifyChange();
    },
    [viewport, notifyChange]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.button === 1 || e.button === 0) && isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanningRef.current) {
      e.preventDefault();
    }
  }, []);

  const cursor = isPanning ? 'grabbing' : spacePressed ? 'grab' : 'default';

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
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onClick={handleBackgroundClick}
    >
      <g transform={viewportTransform}>
        {layersSorted.map((layer) => {
          if (!layer.visible) return null;
          const els = layerElementMap.get(layer.id) ?? [];
          return (
            <g key={layer.id} id={`layer-${layer.id}`} data-layer-name={layer.name}>
              {els.map((el) => (
                <g
                  key={el.id}
                  onClick={(e) => handleElementClick(e, el)}
                  style={{ cursor: el.locked ? 'default' : 'pointer' }}
                  data-element-id={el.id}
                >
                  {renderElement(el, scene.elements)}
                </g>
              ))}
            </g>
          );
        })}
      </g>
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
    </svg>
  );
}
