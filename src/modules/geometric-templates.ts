/**
 * Basic geometric shape templates registered in the global template registry.
 * All templates use the category "基础几何".
 */
import { registerTemplate } from '../core/templates';
import type { TemplateDefinition } from '../core/templates';

const DEFAULT_FILL = '#ffffff';
const DEFAULT_STROKE = '#333333';
const DEFAULT_STROKE_WIDTH = 2;

const style = {
  fill: DEFAULT_FILL,
  stroke: DEFAULT_STROKE,
  strokeWidth: DEFAULT_STROKE_WIDTH,
  opacity: 1,
};

const t1 = (x: number, y: number, w: number, h: number) => ({
  x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1,
});

const CATEGORY = '基础几何';

/**
 * Rectangle template — default 100×60.
 */
const rectTemplate: TemplateDefinition = {
  id: 'geom-rect',
  name: '矩形',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'rect',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 60),
      style,
    },
  ],
};

/**
 * Circle template — default diameter 80.
 */
const circleTemplate: TemplateDefinition = {
  id: 'geom-circle',
  name: '圆',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'circle',
      shapeKind: 'circle',
      transform: t1(0, 0, 80, 80),
      style,
    },
  ],
};

/**
 * Ellipse template — default 100×60.
 */
const ellipseTemplate: TemplateDefinition = {
  id: 'geom-ellipse',
  name: '椭圆',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'ellipse',
      shapeKind: 'ellipse',
      transform: t1(0, 0, 100, 60),
      style,
    },
  ],
};

/**
 * Isosceles triangle template — points upward, default 80×70.
 */
const triangleTemplate: TemplateDefinition = {
  id: 'geom-triangle',
  name: '三角形',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'triangle',
      shapeKind: 'polygon',
      transform: t1(0, 0, 80, 70),
      style,
      points: [
        { x: 40, y: 0 },
        { x: 80, y: 70 },
        { x: 0, y: 70 },
      ],
    },
  ],
};

/**
 * Diamond (rhombus) template — default 80×80.
 */
const diamondTemplate: TemplateDefinition = {
  id: 'geom-diamond',
  name: '菱形',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'diamond',
      shapeKind: 'polygon',
      transform: t1(0, 0, 80, 80),
      style,
      points: [
        { x: 40, y: 0 },
        { x: 80, y: 40 },
        { x: 40, y: 80 },
        { x: 0, y: 40 },
      ],
    },
  ],
};

/**
 * Five-pointed star (pentagram) template — default 80×80.
 * Points computed with outer radius 38, inner radius 14.5, center (40, 40).
 */
const pentagramTemplate: TemplateDefinition = {
  id: 'geom-pentagram',
  name: '五角星',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'pentagram',
      shapeKind: 'polygon',
      transform: t1(0, 0, 80, 80),
      style: { ...style, fill: '#FFD700' },
      points: [
        { x: 40.0, y: 2.0 },
        { x: 48.5, y: 28.3 },
        { x: 76.1, y: 28.3 },
        { x: 53.8, y: 44.5 },
        { x: 62.3, y: 70.7 },
        { x: 40.0, y: 54.5 },
        { x: 17.7, y: 70.7 },
        { x: 26.2, y: 44.5 },
        { x: 3.9, y: 28.3 },
        { x: 31.5, y: 28.3 },
      ],
    },
  ],
};

/**
 * Right-pointing arrow template — default 100×40.
 * Uses polygon to define the arrow shaft + head shape.
 */
const arrowTemplate: TemplateDefinition = {
  id: 'geom-arrow',
  name: '箭头',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'arrow',
      shapeKind: 'polygon',
      transform: t1(0, 0, 100, 40),
      style: { ...style, fill: '#666666' },
      points: [
        { x: 0, y: 12 },
        { x: 60, y: 12 },
        { x: 60, y: 0 },
        { x: 100, y: 20 },
        { x: 60, y: 40 },
        { x: 60, y: 28 },
        { x: 0, y: 28 },
      ],
    },
  ],
};

/**
 * Bidirectional (left↔right) arrow template — default 100×40.
 */
const bidirectionalArrowTemplate: TemplateDefinition = {
  id: 'geom-bidirectional-arrow',
  name: '双向箭头',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'biarrow',
      shapeKind: 'polygon',
      transform: t1(0, 0, 100, 40),
      style: { ...style, fill: '#666666' },
      points: [
        { x: 0, y: 20 },
        { x: 40, y: 0 },
        { x: 40, y: 12 },
        { x: 60, y: 12 },
        { x: 60, y: 0 },
        { x: 100, y: 20 },
        { x: 60, y: 40 },
        { x: 60, y: 28 },
        { x: 40, y: 28 },
        { x: 40, y: 40 },
      ],
    },
  ],
};

/**
 * Horizontal line template — default 100×2.
 * Rendered as a thin path.
 */
const lineTemplate: TemplateDefinition = {
  id: 'geom-line',
  name: '线条',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'line',
      shapeKind: 'path',
      transform: t1(0, 0, 100, 2),
      style: { fill: 'none', stroke: DEFAULT_STROKE, strokeWidth: DEFAULT_STROKE_WIDTH, opacity: 1 },
      pathCommands: 'M 0,1 L 100,1',
    },
  ],
};

const templates: TemplateDefinition[] = [
  rectTemplate,
  circleTemplate,
  ellipseTemplate,
  triangleTemplate,
  diamondTemplate,
  pentagramTemplate,
  arrowTemplate,
  bidirectionalArrowTemplate,
  lineTemplate,
];

/**
 * Register all 9 basic geometric shape templates in the global registry.
 * Safe to call multiple times (overwrites existing entries with same id).
 */
export function registerGeometricTemplates(): void {
  for (const tpl of templates) {
    registerTemplate(tpl);
  }
}

export { templates as geometricTemplateDefinitions };
