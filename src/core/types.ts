/**
 * Core type definitions for the drawing tool.
 * All types follow the top-level design document chapters 10-13.
 * Every exported type includes a JSDoc comment describing its purpose.
 */

// ─── Element Type Discriminant ────────────────────────────────────────────────

/**
 * String literal union of all supported element types.
 * Used as the discriminant in the element type union.
 */
export type ElementType =
  | 'shape'
  | 'text'
  | 'image'
  | 'connector'
  | 'chart'
  | 'container'
  | 'rtlModule'
  | 'rtlPort'
  | 'mindNode'
  | 'topologyNode';

// ─── Geometry Primitives ──────────────────────────────────────────────────────

/**
 * 2D affine transform applied to every element.
 * All coordinates are in canvas units (pixels by default).
 */
export interface Transform2D {
  /** Horizontal position in canvas coordinates */
  x: number;
  /** Vertical position in canvas coordinates */
  y: number;
  /** Width of the element bounding rectangle */
  width: number;
  /** Height of the element bounding rectangle */
  height: number;
  /** Rotation angle in degrees, clockwise */
  rotation: number;
  /** Horizontal scale factor (1.0 = original size) */
  scaleX: number;
  /** Vertical scale factor (1.0 = original size) */
  scaleY: number;
}

/**
 * Visual style properties shared by all element types.
 * All color values use CSS-compatible string formats.
 */
export interface ElementStyle {
  /** Fill color (CSS value) */
  fill: string;
  /** Stroke (outline) color (CSS value) */
  stroke: string;
  /** Stroke width in canvas units */
  strokeWidth: number;
  /** Stroke dash pattern (e.g. "5,5" for dashed lines) */
  strokeDasharray?: string;
  /** Overall element opacity (0-1) */
  opacity: number;
  /** Fill opacity override (0-1) */
  fillOpacity?: number;
  /** Stroke opacity override (0-1) */
  strokeOpacity?: number;
  /** Font size in canvas units (for text and labels) */
  fontSize?: number;
  /** Font family name */
  fontFamily?: string;
  /** Font weight (e.g. "normal", "bold") */
  fontWeight?: string;
  /** Font style (e.g. "normal", "italic") */
  fontStyle?: string;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Text decoration (e.g. "underline", "line-through") */
  textDecoration?: string;
}

/**
 * Axis-aligned bounding box in canvas coordinates.
 */
export interface BBox {
  /** Left edge x coordinate */
  x: number;
  /** Top edge y coordinate */
  y: number;
  /** Width of the bounding box */
  width: number;
  /** Height of the bounding box */
  height: number;
}

// ─── Base Element ─────────────────────────────────────────────────────────────

/**
 * Common properties shared by all scene elements.
 * Every element has a stable id, type discriminant, layer membership,
 * geometry transform, visual style, and visibility/locking state.
 */
export interface BaseElement {
  /** Unique stable identifier */
  id: string;
  /** Element type discriminant */
  type: ElementType;
  /** Reference to the parent layer id */
  layerId: string;
  /** Human-readable name (optional) */
  name?: string;
  /** Position, size, rotation and scale */
  transform: Transform2D;
  /** Visual style properties */
  style: ElementStyle;
  /** Whether the element is rendered */
  visible: boolean;
  /** Whether the element is editable */
  locked: boolean;
  /** User-defined tags for filtering and search */
  tags?: string[];
  /** Extension point for module-specific data */
  metadata?: Record<string, unknown>;
}

// ─── Shape Element ────────────────────────────────────────────────────────────

/**
 * Concrete geometric shape kind.
 */
export type ShapeKind = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path';

/**
 * A geometric shape element (rectangle, circle, ellipse, polygon, path).
 */
export interface ShapeElement extends BaseElement {
  type: 'shape';
  /** Specific shape kind */
  shapeKind: ShapeKind;
  /** Corner radii for rounded rectangles [topLeft, topRight, bottomRight, bottomLeft] */
  cornerRadius?: [number, number, number, number];
  /** Polygon vertex points relative to element origin */
  points?: { x: number; y: number }[];
  /** SVG path commands string */
  pathCommands?: string;
}

// ─── Text Element ─────────────────────────────────────────────────────────────

/**
 * A text element used for labels, annotations, panel titles, etc.
 */
export interface TextElement extends BaseElement {
  type: 'text';
  /** The text content */
  text: string;
  /** Background color of the text box */
  backgroundColor?: string;
  /** Border color of the text box */
  borderColor?: string;
  /** Border width of the text box */
  borderWidth?: number;
}

// ─── Image Element ────────────────────────────────────────────────────────────

/**
 * An imported image element (PNG, JPG, or sanitized SVG).
 * The image source is stored as a blob URL or data URL.
 */
export interface ImageElement extends BaseElement {
  type: 'image';
  /** Blob URL or data URL of the image */
  src: string;
  /** Original image width for aspect ratio calculation */
  originalWidth: number;
  /** Original image height for aspect ratio calculation */
  originalHeight: number;
  /** How the image fits within its bounding box */
  objectFit?: 'fill' | 'contain' | 'cover' | 'none';
}

// ─── Connector Element ────────────────────────────────────────────────────────

/**
 * Endpoint of a connector line.
 * Can be bound to an element anchor or be a free-floating point.
 */
export interface ConnectorEndpoint {
  /** Referenced element id (null/undefined for free points) */
  elementId?: string;
  /** Anchored anchor id on the referenced element */
  anchorId?: string;
  /** Absolute canvas x coordinate (used for free points or resolved from anchor) */
  x: number;
  /** Absolute canvas y coordinate */
  y: number;
}

/**
 * Routing strategy for connector lines.
 */
export type ConnectorRouteType = 'straight' | 'polyline' | 'orthogonal' | 'curve';

/**
 * Route definition for a connector line.
 */
export interface ConnectorRoute {
  /** Routing strategy */
  type: ConnectorRouteType;
  /** Waypoints in canvas coordinates */
  points: { x: number; y: number }[];
}

/**
 * A label placed on a connector line.
 */
export interface ConnectorLabel {
  /** Label text content */
  text: string;
  /** Position along the line (0.0 = start, 0.5 = middle, 1.0 = end) */
  position: number;
  /** Offset from the line in canvas units */
  offset: { dx: number; dy: number };
}

/**
 * Arrow head style type.
 */
export type ArrowStyleKind = 'none' | 'triangle' | 'openTriangle' | 'diamond' | 'circle';

/**
 * Arrow style configuration for connector endpoints.
 */
export interface ArrowStyle {
  /** Arrow head shape type */
  type: ArrowStyleKind;
  /** Arrow size multiplier (default 1.0) */
  size?: number;
  /** Arrow fill color override */
  color?: string;
}

/**
 * Semantic classification of a connector, used for routing and layout hints.
 */
export type ConnectorSemanticKind =
  | 'flow'
  | 'dependency'
  | 'rtl-net'
  | 'rtl-bus'
  | 'network-link'
  | 'mind-edge';

/**
 * A connector element that links two endpoints, spanning layers.
 * Connectors are exempt from same-layer collision rules.
 */
export interface ConnectorElement extends BaseElement {
  type: 'connector';
  /** Starting endpoint */
  source: ConnectorEndpoint;
  /** Ending endpoint */
  target: ConnectorEndpoint;
  /** Path routing definition */
  route: ConnectorRoute;
  /** Labels positioned along the connector */
  labels?: ConnectorLabel[];
  /** Arrow style at the start endpoint */
  arrowStart?: ArrowStyle;
  /** Arrow style at the end endpoint */
  arrowEnd?: ArrowStyle;
  /** Semantic kind for routing and layout hints */
  semanticKind?: ConnectorSemanticKind;
}

// ─── Chart Element ────────────────────────────────────────────────────────────

/**
 * Supported chart types.
 */
export type ChartType = 'bar' | 'line' | 'scatter' | 'boxplot' | 'histogram' | 'heatmap';

/**
 * Mapping of data columns to chart dimensions.
 */
export interface ColumnMappings {
  /** Column used for the x-axis / category */
  x?: string;
  /** Column used for the y-axis / value */
  y?: string;
  /** Column used for grouping / color series */
  group?: string;
  /** Column used for color encoding */
  color?: string;
}

/**
 * A data-bound chart element that renders from a DataSource.
 * The chart SVG is cached and regenerated when data or options change.
 */
export interface ChartElement extends BaseElement {
  type: 'chart';
  /** Reference to a DataSource id in scene.dataSources */
  dataSourceId: string;
  /** Type of chart to render */
  chartType: ChartType;
  /** Column-to-axis mappings */
  columnMappings: ColumnMappings;
  /** Chart-specific rendering options */
  options?: Record<string, unknown>;
  /** Cached rendered SVG content */
  svgContent?: string;
}

// ─── Container Element ────────────────────────────────────────────────────────

/**
 * A container element used for swimlanes, cloud regions, subnet areas, etc.
 * Containers provide visual grouping and layout boundaries.
 */
export interface ContainerElement extends BaseElement {
  type: 'container';
  /** Display label for the container */
  containerLabel?: string;
}

// ─── RTL Module and Port Elements ─────────────────────────────────────────────

/**
 * Direction of an RTL port signal.
 */
export type RtlPortDirection = 'input' | 'output' | 'inout';

/**
 * A port element belonging to an RTL module.
 * Ports define the interface of a hardware module.
 */
export interface RtlPortElement extends BaseElement {
  type: 'rtlPort';
  /** Signal direction */
  direction: RtlPortDirection;
  /** Bit width of the signal (e.g. 1 for single-bit, 32 for bus) */
  bitWidth: number;
  /** Signal name */
  portName: string;
}

/**
 * An RTL hardware module element.
 * Modules can contain ports and be connected via connector elements.
 */
export interface RtlModuleElement extends BaseElement {
  type: 'rtlModule';
  /** Module type name (e.g. "register", "mux", "ALU") */
  moduleName: string;
  /** Instance name (unique within the design) */
  instanceName: string;
  /** Generic parameters (e.g. WIDTH, DEPTH) */
  parameters?: Record<string, string | number>;
  /** Ports associated with this module */
  ports?: RtlPortElement[];
  /** Whether the module is in collapsed view */
  collapsed?: boolean;
}

// ─── Mind Map Node Element ────────────────────────────────────────────────────

/**
 * A mind map node element.
 * Nodes form a tree structure referenced by parentId and childrenIds.
 */
export interface MindNodeElement extends BaseElement {
  type: 'mindNode';
  /** Content text of this node */
  text: string;
  /** Reference to parent node id (null for root) */
  parentId?: string;
  /** Reference to children node ids */
  childrenIds?: string[];
  /** Whether this node's subtree is collapsed */
  collapsed?: boolean;
}

// ─── Topology Node Element ────────────────────────────────────────────────────

/**
 * Device type for network topology nodes.
 */
export type TopologyDeviceType =
  | 'router'
  | 'switch'
  | 'server'
  | 'cloud'
  | 'firewall'
  | 'loadBalancer'
  | 'gateway'
  | 'custom';

/**
 * A network topology node element representing a network device.
 */
export interface TopologyNodeElement extends BaseElement {
  type: 'topologyNode';
  /** Category of network device */
  deviceType: TopologyDeviceType;
  /** Display label */
  label?: string;
  /** Device-specific properties (e.g. IP, vendor, model) */
  properties?: Record<string, unknown>;
}

// ─── SceneElement Union ───────────────────────────────────────────────────────

/**
 * Union type of all concrete element types that can appear in scene.elements.
 */
export type SceneElement =
  | ShapeElement
  | TextElement
  | ImageElement
  | ConnectorElement
  | ChartElement
  | ContainerElement
  | RtlModuleElement
  | RtlPortElement
  | MindNodeElement
  | TopologyNodeElement;

// ─── Layer ────────────────────────────────────────────────────────────────────

/**
 * A named layer that contains elements.
 * Layers are rendered in ascending order (higher order = on top).
 */
export interface Layer {
  /** Unique layer identifier */
  id: string;
  /** Layer display name */
  name: string;
  /** Rendering order (ascending: 1 = bottom, higher = top) */
  order: number;
  /** Whether the layer is rendered */
  visible: boolean;
  /** Whether elements on this layer can be edited */
  locked: boolean;
  /** Default style applied to new elements on this layer */
  defaultStyle?: Partial<ElementStyle>;
  /** Extension point for layer metadata */
  metadata?: Record<string, unknown>;
}

// ─── Element Group ────────────────────────────────────────────────────────────

/**
 * A named group that can span multiple layers.
 * Groups enable batch selection, movement, and style editing.
 */
export interface ElementGroup {
  /** Unique group identifier */
  id: string;
  /** Group display name */
  name: string;
  /** IDs of elements that belong to this group */
  elementIds: string[];
  /** Extension point for group metadata */
  metadata?: Record<string, unknown>;
}

// ─── Project Meta ─────────────────────────────────────────────────────────────

/**
 * Project-level metadata stored in scene.json.
 */
export interface ProjectMeta {
  /** Project name / figure title */
  name: string;
  /** Author or creator name */
  author?: string;
  /** Creation timestamp (ISO 8601) */
  createdAt?: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt?: string;
  /** Project description */
  description?: string;
}

// ─── Canvas Configuration ─────────────────────────────────────────────────────

/**
 * Canvas and rendering configuration.
 */
export interface CanvasConfig {
  /** Coordinate unit (default "px") */
  units: string;
  /** Background color (CSS value) */
  background: string;
  /** Default font family applied to new text elements */
  defaultFont: string;
  /** Grid spacing (0 = grid disabled) */
  gridSize: number;
  /** Whether snap-to-grid is enabled */
  snapToGrid: boolean;
  /** Artboard / viewport dimensions in canvas units */
  artboard?: { width: number; height: number };
}

// ─── Viewport State ───────────────────────────────────────────────────────────

/**
 * Current viewport state (zoom, pan, last selected element).
 * Stored optionally in scene.json and updated at runtime.
 */
export interface ViewportState {
  /** Current zoom level */
  zoom: number;
  /** Horizontal pan offset */
  offsetX: number;
  /** Vertical pan offset */
  offsetY: number;
  /** ID of the last selected element (for session restore) */
  selectedElementId?: string;
}

// ─── Scene Rules ──────────────────────────────────────────────────────────────

/**
 * Collision detection strategy.
 */
export type CollisionStrategy = 'bbox' | 'geometry';

/**
 * Scene-level rules and constraints.
 */
export interface SceneRules {
  /** Maximum number of layers allowed */
  maxLayerCount: number;
  /** Collision detection strategy */
  collisionStrategy: CollisionStrategy;
  /** Whether hidden elements participate in collision checks */
  hiddenElementsCollide: boolean;
  /** Whether locked elements participate in collision checks */
  lockedElementsCollide: boolean;
  /** Whether connectors are exempt from layer collision */
  connectorsExempt: boolean;
}

// ─── Data Source ──────────────────────────────────────────────────────────────

/**
 * Reference to an external data file and its parsing configuration.
 */
export interface DataSource {
  /** Unique data source identifier */
  id: string;
  /** Relative path to the data file (e.g. "data/table_001.csv") */
  path: string;
  /** Data file type */
  type: 'csv' | 'json' | 'xlsx' | 'xls';
  /** Parsing configuration options */
  parseConfig?: Record<string, unknown>;
}

// ─── Chart Definition ─────────────────────────────────────────────────────────

/**
 * Standalone chart definition stored in scene.charts.
 * Separate from ChartElement to allow multiple views of the same data.
 */
export interface ChartDefinition {
  /** Unique chart definition identifier */
  id: string;
  /** Reference to a DataSource id */
  dataSourceId: string;
  /** Chart type */
  chartType: ChartType;
  /** Column-to-axis mapping configuration */
  columnMappings: ColumnMappings;
  /** Chart-specific rendering options */
  options?: Record<string, unknown>;
}

// ─── Template Instance ────────────────────────────────────────────────────────

/**
 * Record of a template instance placed on the canvas.
 * The elements themselves are stored in scene.elements with generated ids.
 */
export interface TemplateInstance {
  /** Template definition id this instance was created from */
  templateId: string;
  /** Position where the template was instantiated */
  position: { x: number; y: number };
  /** Layer id the template elements were placed in */
  layerId: string;
  /** Override parameters applied during instantiation */
  params?: Record<string, unknown>;
  /** IDs of elements created by this template instance */
  elementIds: string[];
}

// ─── Export Preset ────────────────────────────────────────────────────────────

/**
 * Export region mode.
 */
export type ExportRegion = 'viewport' | 'selection' | 'artboard' | 'full';

/**
 * Export image format.
 */
export type ExportFormat = 'svg' | 'png' | 'jpg';

/**
 * Pre-configured export settings stored in the scene.
 */
export interface ExportPreset {
  /** Unique preset identifier */
  id: string;
  /** Human-readable preset name */
  name: string;
  /** Which region of the canvas to export */
  region: ExportRegion;
  /** Output format */
  format: ExportFormat;
  /** Format-specific export options */
  options?: Record<string, unknown>;
}

// ─── Scene Document ───────────────────────────────────────────────────────────

/**
 * Top-level scene document.
 * This is the root object serialized to/from scene.json.
 */
export interface SceneDocument {
  /** Schema version for compatibility and migration */
  schemaVersion: string;
  /** Project-level metadata */
  project: ProjectMeta;
  /** Canvas and rendering configuration */
  canvas: CanvasConfig;
  /** Current viewport state (optional, updated at runtime) */
  viewport?: ViewportState;
  /** Scene-level rules and constraints */
  rules: SceneRules;
  /** All layers, ordered by the array index (order field determines render order) */
  layers: Layer[];
  /** All scene elements */
  elements: SceneElement[];
  /** Cross-layer element groups */
  groups: ElementGroup[];
  /** Data source references */
  dataSources: DataSource[];
  /** Chart definitions */
  charts: ChartDefinition[];
  /** Template instances placed on the canvas */
  templates: TemplateInstance[];
  /** Saved export presets */
  exportPresets: ExportPreset[];
}

// ─── Geometry Adapter ─────────────────────────────────────────────────────────

/**
 * A geometric shape represented by a set of closed paths.
 * Used for real geometry collision detection and boolean operations.
 */
export interface GeometryShape {
  /** Array of closed paths, each path is an array of vertices */
  paths: { x: number; y: number }[][];
}

/**
 * Geometry adapter interface for bounding box calculation,
 * real geometry access, and intersection testing.
 * Extendable for future real-geometry collision detection.
 */
export interface GeometryAdapter {
  /** Compute the axis-aligned bounding box for an element */
  getBBox(element: SceneElement): BBox;
  /** Get the real geometric shape of an element (optional, for advanced collision) */
  getGeometry?(element: SceneElement): GeometryShape;
  /** Test if two elements intersect using real geometry (optional) */
  intersects?(a: SceneElement, b: SceneElement): boolean;
}

// ─── Anchor system types (forward-declared for connector use) ─────────────────

/**
 * A connection anchor on an element.
 */
export interface AnchorPoint {
  /** Unique anchor identifier */
  id: string;
  /** Position relative to the element's top-left corner (0-1 range for x and y) */
  position: { x: number; y: number };
  /** Normal direction of the anchor (radians, pointing outward) */
  direction: number;
}
