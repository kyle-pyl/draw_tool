/**
 * Template system framework — registration and instantiation.
 * Templates define reusable element blueprints with relative coordinates.
 * Instantiation creates full SceneElements at a given position and layer.
 */

import type {
  SceneElement,
  ElementType,
  Transform2D,
  ElementStyle,
  ConnectorEndpoint,
  ConnectorRoute,
  ConnectorLabel,
  ArrowStyle,
  ConnectorSemanticKind,
} from './types';
import { generateId } from './utils';

export interface TemplateRtlPortDef {
  /** Signal direction */
  direction: 'input' | 'output' | 'inout';
  /** Bit width of the signal (e.g. 1 for single-bit, 32 for bus) */
  bitWidth: number;
  /** Signal name */
  portName: string;
}

export interface TemplateElementDef {
  /** Element type */
  type: ElementType;
  /** Optional human-readable name (used as prefix for generated ID) */
  name?: string;
  /** Position, size, rotation and scale relative to template anchor */
  transform: Transform2D;
  /** Visual style */
  style: ElementStyle;
  /** Whether the element is visible (default true) */
  visible?: boolean;
  /** Whether the element is locked (default false) */
  locked?: boolean;
  /** User-defined tags */
  tags?: string[];
  /** Extension data */
  metadata?: Record<string, unknown>;
  // Shape-specific
  shapeKind?: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path';
  cornerRadius?: [number, number, number, number];
  points?: { x: number; y: number }[];
  pathCommands?: string;
  // Text-specific
  text?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  // Image-specific
  src?: string;
  originalWidth?: number;
  originalHeight?: number;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none';
  // Container-specific
  containerLabel?: string;
  // RTL module-specific
  moduleName?: string;
  instanceName?: string;
  parameters?: Record<string, string | number>;
  ports?: TemplateRtlPortDef[];
  collapsed?: boolean;
  // RTL port-specific
  direction?: 'input' | 'output' | 'inout';
  bitWidth?: number;
  portName?: string;
  // Mind node-specific
  parentId?: string;
  childrenIds?: string[];
  // Topology node-specific
  deviceType?: 'router' | 'switch' | 'server' | 'cloud' | 'firewall' | 'loadBalancer' | 'gateway' | 'custom';
  label?: string;
  properties?: Record<string, unknown>;
  // Chart-specific
  dataSourceId?: string;
  chartType?: string;
  columnMappings?: Record<string, string | undefined>;
  options?: Record<string, unknown>;
  svgContent?: string;
}

export interface TemplateConnectorDef {
  /** Index (0-based) of the source element in template.elements */
  sourceElementIndex: number;
  /** Index (0-based) of the target element in template.elements */
  targetElementIndex: number;
  /** Source anchor ID on the source element */
  sourceAnchorId?: string;
  /** Target anchor ID on the target element */
  targetAnchorId?: string;
  /** Route with relative coordinates (offset by position at instantiation) */
  route?: ConnectorRoute;
  /** Arrow style at the start endpoint */
  arrowStart?: ArrowStyle;
  /** Arrow style at the end endpoint */
  arrowEnd?: ArrowStyle;
  /** Labels positioned along the connector */
  labels?: ConnectorLabel[];
  /** Semantic kind for routing and layout hints */
  semanticKind?: ConnectorSemanticKind;
}

export interface TemplateDefinition {
  /** Unique template identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category for grouping in the UI */
  category: string;
  /** Default style merged into all elements (element.style takes precedence) */
  defaultStyle?: Partial<ElementStyle>;
  /** Element blueprints with relative coordinates */
  elements: TemplateElementDef[];
  /** Internal connectors between template elements */
  connectors?: TemplateConnectorDef[];
}

const templateRegistry = new Map<string, TemplateDefinition>();

/**
 * Register a template definition in the global registry.
 * Replaces any existing template with the same id.
 */
export function registerTemplate(template: TemplateDefinition): void {
  templateRegistry.set(template.id, template);
}

/**
 * Look up a template by its id.
 */
export function getTemplate(id: string): TemplateDefinition | undefined {
  return templateRegistry.get(id);
}

/**
 * Return all registered templates.
 */
export function getAllTemplates(): TemplateDefinition[] {
  return Array.from(templateRegistry.values());
}

/**
 * Return all templates in a given category.
 */
export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  return getAllTemplates().filter((t) => t.category === category);
}

/**
 * Remove a template from the registry.
 * Returns true if the template existed and was removed.
 */
export function unregisterTemplate(id: string): boolean {
  return templateRegistry.delete(id);
}

/**
 * Remove all templates from the registry.
 */
export function clearTemplates(): void {
  templateRegistry.clear();
}

function applyDefaultStyle(
  style: ElementStyle,
  defaultStyle: Partial<ElementStyle> | undefined,
): ElementStyle {
  if (!defaultStyle) return { ...style };
  return { ...defaultStyle, ...style } as ElementStyle;
}

function offsetTransform(transform: Transform2D, pos: { x: number; y: number }): Transform2D {
  return {
    ...transform,
    x: transform.x + pos.x,
    y: transform.y + pos.y,
  };
}

function offsetRoutePoints(
  route: ConnectorRoute,
  pos: { x: number; y: number },
): ConnectorRoute {
  return {
    ...route,
    points: route.points.map((p) => ({ x: p.x + pos.x, y: p.y + pos.y })),
  };
}

function buildElement(
  def: TemplateElementDef,
  id: string,
  layerId: string,
  position: { x: number; y: number },
  defaultStyle: Partial<ElementStyle> | undefined,
): SceneElement {
  const transform = offsetTransform(def.transform, position);
  const style = applyDefaultStyle(def.style, defaultStyle);
  const base = {
    id,
    type: def.type,
    layerId,
    name: def.name,
    transform,
    style,
    visible: def.visible !== undefined ? def.visible : true,
    locked: def.locked !== undefined ? def.locked : false,
    tags: def.tags,
    metadata: def.metadata,
  };

  switch (def.type) {
    case 'shape':
      return {
        ...base,
        type: 'shape',
        shapeKind: def.shapeKind || 'rect',
        cornerRadius: def.cornerRadius,
        points: def.points,
        pathCommands: def.pathCommands,
      } as SceneElement;
    case 'text':
      return {
        ...base,
        type: 'text',
        text: def.text || '',
        backgroundColor: def.backgroundColor,
        borderColor: def.borderColor,
        borderWidth: def.borderWidth,
      } as SceneElement;
    case 'image':
      return {
        ...base,
        type: 'image',
        src: def.src || '',
        originalWidth: def.originalWidth || transform.width,
        originalHeight: def.originalHeight || transform.height,
        objectFit: def.objectFit,
      } as SceneElement;
    case 'connector':
      return {
        ...base,
        type: 'connector',
        source: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        route: { type: 'straight', points: [] },
        arrowStart: { type: 'none' },
        arrowEnd: { type: 'triangle' },
      } as SceneElement;
    case 'container':
      return {
        ...base,
        type: 'container',
        containerLabel: def.containerLabel,
      } as SceneElement;
    case 'rtlModule': {
      const modulePorts: SceneElement[] = [];
      if (def.ports && def.ports.length > 0) {
        const { width, height } = transform;
        const portSize = 10;
        const portStyle: ElementStyle = {
          fill: '#333333',
          stroke: '#000000',
          strokeWidth: 1,
          opacity: 1,
        };

        const inputs = def.ports.filter((p) => p.direction === 'input');
        const outputs = def.ports.filter((p) => p.direction === 'output');
        const inouts = def.ports.filter((p) => p.direction === 'inout');

        // Distribute input ports along the left edge
        const inputSpacing = inputs.length > 1 ? (height - portSize - 4) / (inputs.length - 1) : height / 2;
        for (let i = 0; i < inputs.length; i++) {
          const portY = 2 + (inputs.length === 1 ? inputSpacing - portSize / 2 : i * inputSpacing);
          const portId = generateId('rtlPort');
          modulePorts.push({
            id: portId,
            type: 'rtlPort' as const,
            layerId,
            name: inputs[i].portName,
            transform: {
              x: transform.x - portSize - 4,
              y: transform.y + portY,
              width: portSize,
              height: portSize,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
            },
            style: { ...portStyle, fill: '#4CAF50' },
            visible: true,
            locked: false,
            direction: inputs[i].direction,
            bitWidth: inputs[i].bitWidth,
            portName: inputs[i].portName,
          } as SceneElement);
        }

        // Distribute output ports along the right edge
        const outputSpacing = outputs.length > 1 ? (height - portSize - 4) / (outputs.length - 1) : height / 2;
        for (let i = 0; i < outputs.length; i++) {
          const portY = 2 + (outputs.length === 1 ? outputSpacing - portSize / 2 : i * outputSpacing);
          const portId = generateId('rtlPort');
          modulePorts.push({
            id: portId,
            type: 'rtlPort' as const,
            layerId,
            name: outputs[i].portName,
            transform: {
              x: transform.x + width + 4,
              y: transform.y + portY,
              width: portSize,
              height: portSize,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
            },
            style: { ...portStyle, fill: '#F44336' },
            visible: true,
            locked: false,
            direction: outputs[i].direction,
            bitWidth: outputs[i].bitWidth,
            portName: outputs[i].portName,
          } as SceneElement);
        }

        // Distribute inout ports along the top edge (or bottom if many)
        for (let i = 0; i < inouts.length; i++) {
          const portX = portSize + 4 + i * (portSize + 8);
          const portId = generateId('rtlPort');
          modulePorts.push({
            id: portId,
            type: 'rtlPort' as const,
            layerId,
            name: inouts[i].portName,
            transform: {
              x: transform.x + portX,
              y: transform.y - portSize - 4,
              width: portSize,
              height: portSize,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
            },
            style: { ...portStyle, fill: '#2196F3' },
            visible: true,
            locked: false,
            direction: inouts[i].direction,
            bitWidth: inouts[i].bitWidth,
            portName: inouts[i].portName,
          } as SceneElement);
        }
      }

      return {
        ...base,
        type: 'rtlModule',
        moduleName: def.moduleName || '',
        instanceName: def.instanceName || '',
        parameters: def.parameters,
        ports: modulePorts.length > 0 ? modulePorts : [],
        collapsed: def.collapsed,
      } as SceneElement;
    }
    case 'rtlPort':
      return {
        ...base,
        type: 'rtlPort',
        direction: def.direction || 'input',
        bitWidth: def.bitWidth || 1,
        portName: def.portName || '',
      } as SceneElement;
    case 'mindNode':
      return {
        ...base,
        type: 'mindNode',
        text: def.text || '',
        parentId: def.parentId,
        childrenIds: def.childrenIds || [],
        collapsed: def.collapsed,
      } as SceneElement;
    case 'topologyNode':
      return {
        ...base,
        type: 'topologyNode',
        deviceType: def.deviceType || 'custom',
        label: def.label,
        properties: def.properties,
      } as SceneElement;
    case 'chart':
      return {
        ...base,
        type: 'chart',
        dataSourceId: def.dataSourceId || '',
        chartType: def.chartType as 'bar' | 'line' | 'scatter' | 'boxplot' | 'histogram' | 'heatmap' || 'bar',
        columnMappings: (def.columnMappings || {}) as { x?: string; y?: string; group?: string; color?: string },
        options: def.options,
        svgContent: def.svgContent,
      } as SceneElement;
    default:
      return base as SceneElement;
  }
}

/**
 * Instantiate a template at the given position and layer.
 * All template internal IDs are remapped to newly generated IDs.
 * All relative coordinates are offset by the position parameter.
 *
 * Returns the created scene elements. Connectors source/target endpoints
 * reference the new element IDs and their relative route coordinates
 * are also offset.
 *
 * @throws Error if the template id is not found
 */
export function instantiateTemplate(
  templateId: string,
  position: { x: number; y: number },
  layerId: string,
): SceneElement[] {
  const template = templateRegistry.get(templateId);
  if (!template) {
    throw new Error(`Template "${templateId}" not found.`);
  }

  const idMap = new Map<number, string>();
  const result: SceneElement[] = [];

  // Phase 1: create all elements
  for (let i = 0; i < template.elements.length; i++) {
    const def = template.elements[i];
    const prefix = def.name || def.type;
    const newId = generateId(prefix);
    idMap.set(i, newId);

    const element = buildElement(def, newId, layerId, position, template.defaultStyle);
    result.push(element);
  }

  // Phase 2: create and link connectors
  if (template.connectors) {
    for (let ci = 0; ci < template.connectors.length; ci++) {
      const cd = template.connectors[ci];
      const srcIdx = cd.sourceElementIndex;
      const tgtIdx = cd.targetElementIndex;
      const srcId = idMap.get(srcIdx);
      const tgtId = idMap.get(tgtIdx);

      if (!srcId || !tgtId) {
        throw new Error(
          `Template "${templateId}" connector ${ci}: invalid element index (${srcIdx} or ${tgtIdx})`,
        );
      }

      const srcDef = template.elements[srcIdx];
      const tgtDef = template.elements[tgtIdx];

      // Default style for connectors uses element style or default
      const connStyle = applyDefaultStyle(
        {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
        },
        template.defaultStyle,
      );

      const connTransform: Transform2D = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      // Compute absolute endpoint positions from source/target element geometry
      const srcCenterX = srcDef.transform.x + position.x + srcDef.transform.width / 2;
      const srcCenterY = srcDef.transform.y + position.y + srcDef.transform.height / 2;
      const tgtCenterX = tgtDef.transform.x + position.x + tgtDef.transform.width / 2;
      const tgtCenterY = tgtDef.transform.y + position.y + tgtDef.transform.height / 2;

      const sourceEndpoint: ConnectorEndpoint = {
        elementId: srcId,
        anchorId: cd.sourceAnchorId || 'center',
        x: srcCenterX,
        y: srcCenterY,
      };
      const targetEndpoint: ConnectorEndpoint = {
        elementId: tgtId,
        anchorId: cd.targetAnchorId || 'center',
        x: tgtCenterX,
        y: tgtCenterY,
      };

      const route: ConnectorRoute = cd.route
        ? offsetRoutePoints(cd.route, position)
        : { type: 'straight', points: [] };

      const connId = generateId('conn');
      const connector: SceneElement = {
        id: connId,
        type: 'connector',
        layerId,
        name: `conn_${ci}`,
        transform: connTransform,
        style: connStyle,
        visible: true,
        locked: false,
        source: sourceEndpoint,
        target: targetEndpoint,
        route,
        labels: cd.labels,
        arrowStart: cd.arrowStart,
        arrowEnd: cd.arrowEnd,
        semanticKind: cd.semanticKind,
      } as SceneElement;

      result.push(connector);
    }
  }

  return result;
}

/**
 * Create a TemplateInstance record from an instantiated template.
 * The returned record can be stored in scene.templates to track
 * which elements came from which template.
 */
export function createTemplateInstance(
  templateId: string,
  position: { x: number; y: number },
  layerId: string,
  elementIds: string[],
  params?: Record<string, unknown>,
): { templateId: string; position: { x: number; y: number }; layerId: string; params?: Record<string, unknown>; elementIds: string[] } {
  return { templateId, position, layerId, params, elementIds };
}
