import type { SceneDocument, SceneElement, ShapeElement, TextElement, ImageElement, ConnectorElement, ConnectorEndpoint, ElementStyle } from '../core/types';
import type { Viewport } from './viewport';

interface CanvasViewProps {
  scene: SceneDocument;
  viewport: Viewport;
  width?: number | string;
  height?: number | string;
  className?: string;
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

export function CanvasView({ scene, viewport, width, height, className }: CanvasViewProps) {
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

  return (
    <svg
      width={width ?? '100%'}
      height={height ?? '100%'}
      className={className}
      style={{ display: 'block', background: scene.canvas.background }}
    >
      <g transform={viewportTransform}>
        {layersSorted.map((layer) => {
          if (!layer.visible) return null;
          const els = layerElementMap.get(layer.id) ?? [];
          return (
            <g key={layer.id} id={`layer-${layer.id}`} data-layer-name={layer.name}>
              {els.map((el) => renderElement(el, scene.elements))}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
