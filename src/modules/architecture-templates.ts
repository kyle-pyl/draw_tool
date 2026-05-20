/**
 * Architecture diagram templates registered in the global template registry.
 * All templates use the category "架构图".
 *
 * Templates:
 *   - 服务         (Service)       : rectangle with server-style appearance
 *   - 数据库       (Database)      : cylinder shape
 *   - 缓存         (Cache)         : lightning-bolt polygon
 *   - 消息队列     (Message Queue) : three stacked rectangles
 *   - API网关      (API Gateway)   : hexagon shape
 *   - 负载均衡     (Load Balancer) : circle with arrows
 *   - 云区域       (Cloud Area)    : container (cloud boundary)
 *   - 浏览器/客户端 (Browser/Client): rectangle with title bar
 */
import { registerTemplate } from '../core/templates';
import type { TemplateDefinition } from '../core/templates';

const CATEGORY = '架构图';

const baseStyle = {
  opacity: 1,
  strokeWidth: 2,
};

const t1 = (x: number, y: number, w: number, h: number) => ({
  x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1,
});

// ─── 1. 服务 — rectangle 100×50, server blue ──────────────────────────────────

const serviceTemplate: TemplateDefinition = {
  id: 'arch-service',
  name: '服务',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'service',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 50),
      style: { fill: '#5B9BD5', stroke: '#3A7BC8', ...baseStyle },
    },
  ],
};

// ─── 2. 数据库 — cylinder shape, path-based ────────────────────────────────────

const databaseTemplate: TemplateDefinition = {
  id: 'arch-database',
  name: '数据库',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'database',
      shapeKind: 'path',
      transform: t1(0, 0, 80, 65),
      style: { fill: '#5B9BD5', stroke: '#3A7BC8', ...baseStyle },
      pathCommands:
        'M 0,18 A 40,18 0 0,1 80,18 L 80,47 A 40,18 0 0,1 0,47 Z M 0,18 A 40,18 0 0,0 80,18',
    },
  ],
};

// ─── 3. 缓存 — lightning bolt polygon, orange ─────────────────────────────────

const cacheTemplate: TemplateDefinition = {
  id: 'arch-cache',
  name: '缓存',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'cache',
      shapeKind: 'polygon',
      transform: t1(0, 0, 50, 60),
      style: { fill: '#F5A623', stroke: '#D4891A', ...baseStyle },
      points: [
        { x: 25, y: 0 },
        { x: 18, y: 28 },
        { x: 28, y: 28 },
        { x: 15, y: 60 },
        { x: 50, y: 22 },
        { x: 36, y: 22 },
        { x: 42, y: 0 },
      ],
    },
  ],
};

// ─── 4. 消息队列 — three stacked horizontal rectangles ─────────────────────────

const mqTemplate: TemplateDefinition = {
  id: 'arch-mq',
  name: '消息队列',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'mq-top',
      shapeKind: 'rect',
      transform: t1(5, 5, 70, 12),
      style: { fill: '#F8E71C', stroke: '#D4C81A', ...baseStyle },
    },
    {
      type: 'shape',
      name: 'mq-mid',
      shapeKind: 'rect',
      transform: t1(10, 19, 60, 12),
      style: { fill: '#F8E71C', stroke: '#D4C81A', ...baseStyle },
    },
    {
      type: 'shape',
      name: 'mq-bot',
      shapeKind: 'rect',
      transform: t1(15, 33, 50, 12),
      style: { fill: '#F8E71C', stroke: '#D4C81A', ...baseStyle },
    },
  ],
};

// ─── 5. API网关 — hexagon, purple ─────────────────────────────────────────────

const gatewayTemplate: TemplateDefinition = {
  id: 'arch-gateway',
  name: 'API网关',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'gateway',
      shapeKind: 'polygon',
      transform: t1(0, 0, 80, 70),
      style: { fill: '#7B68EE', stroke: '#5A4FCF', ...baseStyle },
      points: [
        { x: 40, y: 0 },
        { x: 80, y: 17 },
        { x: 80, y: 53 },
        { x: 40, y: 70 },
        { x: 0, y: 53 },
        { x: 0, y: 17 },
      ],
    },
  ],
};

// ─── 6. 负载均衡 — circle with directional arrows, green ───────────────────────

const lbTemplate: TemplateDefinition = {
  id: 'arch-lb',
  name: '负载均衡',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'lb-circle',
      shapeKind: 'circle',
      transform: t1(0, 0, 60, 60),
      style: { fill: '#50C878', stroke: '#3DA85E', ...baseStyle },
    },
    {
      type: 'shape',
      name: 'lb-arrow-up',
      shapeKind: 'polygon',
      transform: t1(25, 5, 10, 22),
      style: { fill: '#FFFFFF', stroke: 'none', strokeWidth: 0, opacity: 0.9 },
      points: [
        { x: 5, y: 0 },
        { x: 10, y: 12 },
        { x: 7, y: 12 },
        { x: 7, y: 22 },
        { x: 3, y: 22 },
        { x: 3, y: 12 },
        { x: 0, y: 12 },
      ],
    },
    {
      type: 'shape',
      name: 'lb-arrow-down',
      shapeKind: 'polygon',
      transform: t1(25, 33, 10, 22),
      style: { fill: '#FFFFFF', stroke: 'none', strokeWidth: 0, opacity: 0.9 },
      points: [
        { x: 5, y: 22 },
        { x: 10, y: 10 },
        { x: 7, y: 10 },
        { x: 7, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 10 },
        { x: 0, y: 10 },
      ],
    },
    {
      type: 'shape',
      name: 'lb-arrow-left',
      shapeKind: 'polygon',
      transform: t1(5, 25, 22, 10),
      style: { fill: '#FFFFFF', stroke: 'none', strokeWidth: 0, opacity: 0.9 },
      points: [
        { x: 0, y: 5 },
        { x: 12, y: 10 },
        { x: 12, y: 7 },
        { x: 22, y: 7 },
        { x: 22, y: 3 },
        { x: 12, y: 3 },
        { x: 12, y: 0 },
      ],
    },
    {
      type: 'shape',
      name: 'lb-arrow-right',
      shapeKind: 'polygon',
      transform: t1(33, 25, 22, 10),
      style: { fill: '#FFFFFF', stroke: 'none', strokeWidth: 0, opacity: 0.9 },
      points: [
        { x: 22, y: 5 },
        { x: 10, y: 10 },
        { x: 10, y: 7 },
        { x: 0, y: 7 },
        { x: 0, y: 3 },
        { x: 10, y: 3 },
        { x: 10, y: 0 },
      ],
    },
  ],
};

// ─── 7. 云区域 — container 400×200, light cloud blue ───────────────────────────

const cloudTemplate: TemplateDefinition = {
  id: 'arch-cloud',
  name: '云区域',
  category: CATEGORY,
  elements: [
    {
      type: 'container',
      name: 'cloud',
      containerLabel: '云区域',
      transform: t1(0, 0, 400, 200),
      style: {
        fill: '#E8F4FD',
        stroke: '#5B9BD5',
        strokeWidth: 2,
        strokeDasharray: '8,4',
        opacity: 0.6,
      },
    },
  ],
};

// ─── 8. 浏览器/客户端 — rectangle with title bar ──────────────────────────────

const clientTemplate: TemplateDefinition = {
  id: 'arch-client',
  name: '浏览器/客户端',
  category: CATEGORY,
  elements: [
    {
      type: 'shape',
      name: 'client-frame',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 70),
      style: { fill: '#E8E8E8', stroke: '#9B9B9B', ...baseStyle },
    },
    {
      type: 'shape',
      name: 'client-titlebar',
      shapeKind: 'rect',
      transform: t1(0, 0, 100, 18),
      style: { fill: '#D0D0D0', stroke: 'none', strokeWidth: 0, opacity: 1 },
    },
    {
      type: 'shape',
      name: 'client-dot1',
      shapeKind: 'circle',
      transform: t1(8, 5, 8, 8),
      style: { fill: '#FF5F57', stroke: 'none', strokeWidth: 0, opacity: 1 },
    },
    {
      type: 'shape',
      name: 'client-dot2',
      shapeKind: 'circle',
      transform: t1(20, 5, 8, 8),
      style: { fill: '#FFBD2E', stroke: 'none', strokeWidth: 0, opacity: 1 },
    },
    {
      type: 'shape',
      name: 'client-dot3',
      shapeKind: 'circle',
      transform: t1(32, 5, 8, 8),
      style: { fill: '#27C93F', stroke: 'none', strokeWidth: 0, opacity: 1 },
    },
    {
      type: 'shape',
      name: 'client-address',
      shapeKind: 'rect',
      transform: t1(48, 5, 44, 8),
      style: { fill: '#FAFAFA', stroke: 'none', strokeWidth: 0, opacity: 1, cornerRadius: 4 },
    },
  ],
};

// ─── Aggregate and export ──────────────────────────────────────────────────────

const templates: TemplateDefinition[] = [
  serviceTemplate,
  databaseTemplate,
  cacheTemplate,
  mqTemplate,
  gatewayTemplate,
  lbTemplate,
  cloudTemplate,
  clientTemplate,
];

/**
 * Register all 8 architecture diagram templates in the global registry.
 * Safe to call multiple times (overwrites existing entries with same id).
 */
export function registerArchitectureTemplates(): void {
  for (const tpl of templates) {
    registerTemplate(tpl);
  }
}

export { templates as architectureTemplateDefinitions };
