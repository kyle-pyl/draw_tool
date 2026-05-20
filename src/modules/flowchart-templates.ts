/**
 * Flowchart-specific templates registered in the global template registry.
 * All templates use the category "流程图".
 *
 * Templates:
 *   - 开始/结束  (Terminator) : rounded rectangle
 *   - 处理       (Process)    : rectangle
 *   - 判断       (Decision)   : diamond with 是/否 anchors
 *   - 输入输出   (I/O)        : parallelogram
 *   - 子流程     (Subprocess) : double-border rectangle
 *   - 泳道       (Swimlane)   : container
 *   - 注释       (Annotation) : text with dashed border
 */
import { registerTemplate } from '../core/templates';
import type { TemplateDefinition } from '../core/templates';

const FILL = '#ffffff';
const STROKE = '#333333';
const STROKE_W = 2;

const style = {
  fill: FILL,
  stroke: STROKE,
  strokeWidth: STROKE_W,
  opacity: 1,
};

const t1 = (x: number, y: number, w: number, h: number) => ({
  x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1,
});

const CATEGORY = '流程图';

// ─── 1. 开始/结束 — rounded rectangle 100×40 ──────────────────────────────────

const terminatorTemplate: TemplateDefinition = {
  id: 'fc-terminator',
  name: '开始/结束',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'terminator',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 40),
      style,
      cornerRadius: [20, 20, 20, 20],
    },
  ],
};

// ─── 2. 处理 — rectangle 100×50 ───────────────────────────────────────────────

const processTemplate: TemplateDefinition = {
  id: 'fc-process',
  name: '处理',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'process',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 50),
      style,
    },
  ],
};

// ─── 3. 判断 — diamond 100×70, anchors annotated 是/否 ─────────────────────────

const diamondStyle = { ...style, fill: '#fafafa' };

const decisionTemplate: TemplateDefinition = {
  id: 'fc-decision',
  name: '判断',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'decision',
      shapeKind: 'polygon',
      transform: t1(0, 0, 100, 70),
      style: diamondStyle,
      points: [
        { x: 50, y: 0 },
        { x: 100, y: 35 },
        { x: 50, y: 70 },
        { x: 0, y: 35 },
      ],
      metadata: {
        anchors: [
          { id: 'top', position: { x: 0.5, y: 0 }, direction: -Math.PI / 2 },
          { id: 'bottom_yes', position: { x: 0.5, y: 1 }, direction: Math.PI / 2 },
          { id: 'left_no', position: { x: 0, y: 0.5 }, direction: Math.PI },
          { id: 'right_no', position: { x: 1, y: 0.5 }, direction: 0 },
          { id: 'center', position: { x: 0.5, y: 0.5 }, direction: 0 },
          { id: 'top-left', position: { x: 0, y: 0 }, direction: -3 * Math.PI / 4 },
          { id: 'top-right', position: { x: 1, y: 0 }, direction: -Math.PI / 4 },
          { id: 'bottom-left', position: { x: 0, y: 1 }, direction: 3 * Math.PI / 4 },
          { id: 'bottom-right', position: { x: 1, y: 1 }, direction: Math.PI / 4 },
        ],
      },
    },
  ],
};

// ─── 4. 输入输出 — parallelogram 100×50 ────────────────────────────────────────

const ioTemplate: TemplateDefinition = {
  id: 'fc-io',
  name: '输入输出',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'io',
      shapeKind: 'polygon',
      transform: t1(0, 0, 100, 50),
      style,
      points: [
        { x: 18, y: 0 },
        { x: 100, y: 0 },
        { x: 82, y: 50 },
        { x: 0, y: 50 },
      ],
    },
  ],
};

// ─── 5. 子流程 — double-border rectangle (outer 100×50 + inner 94×44) ──────────

const subprocessTemplate: TemplateDefinition = {
  id: 'fc-subprocess',
  name: '子流程',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'subprocess-outer',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 50),
      style,
    },
    {
      type: 'shape',
      name: 'subprocess-inner',
      shapeKind: 'rect',
      transform: t1(3, 3, 94, 44),
      style,
    },
  ],
};

// ─── 6. 泳道 — container 600×200 ───────────────────────────────────────────────

const swimlaneTemplate: TemplateDefinition = {
  id: 'fc-swimlane',
  name: '泳道',
  category: CATEGORY,
  elements: [
    {
      type: 'container',
      name: 'swimlane',
      containerLabel: '泳道',
      transform: t1(0, 0, 600, 200),
      style,
    },
  ],
};

// ─── 7. 注释 — text box with dashed border ─────────────────────────────────────

const annotationTemplate: TemplateDefinition = {
  id: 'fc-annotation',
  name: '注释',
  category: CATEGORY,
  elements: [
    {
      type: 'text',
      name: 'annotation',
      text: '注释',
      transform: t1(0, 0, 120, 40),
      style: {
        fill: '#555555',
        stroke: '#999999',
        strokeWidth: 1,
        strokeDasharray: '4,2',
        opacity: 1,
        fontSize: 14,
        fontFamily: 'sans-serif',
        textAlign: 'center',
      },
      backgroundColor: 'transparent',
      borderColor: '#999999',
      borderWidth: 0,
    },
  ],
};

// ─── Aggregate and export ──────────────────────────────────────────────────────

const templates: TemplateDefinition[] = [
  terminatorTemplate,
  processTemplate,
  decisionTemplate,
  ioTemplate,
  subprocessTemplate,
  swimlaneTemplate,
  annotationTemplate,
];

/**
 * Register all 7 flowchart-specific templates in the global registry.
 * Safe to call multiple times (overwrites existing entries with same id).
 */
export function registerFlowchartTemplates(): void {
  for (const tpl of templates) {
    registerTemplate(tpl);
  }
}

export { templates as flowchartTemplateDefinitions };
