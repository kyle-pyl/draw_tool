/**
 * Core module - Scene Model, Validator, Geometry Adapter, types and error codes.
 * This is the shared data contract between Agent, Editor and Exporters.
 */

export type {
  // Element types
  ElementType,
  ShapeKind,
  ChartType,
  RtlPortDirection,
  TopologyDeviceType,
  ConnectorRouteType,
  ArrowStyleKind,
  ConnectorSemanticKind,
  CollisionStrategy,
  ExportRegion,
  ExportFormat,
  // Geometry primitives
  Transform2D,
  ElementStyle,
  BBox,
  GeometryShape,
  // Element interfaces
  BaseElement,
  ShapeElement,
  TextElement,
  ImageElement,
  ConnectorEndpoint,
  ConnectorRoute,
  ConnectorLabel,
  ArrowStyle,
  ConnectorElement,
  ChartElement,
  ColumnMappings,
  ContainerElement,
  RtlPortElement,
  RtlModuleElement,
  MindNodeElement,
  TopologyNodeElement,
  SceneElement,
  // Structural types
  Layer,
  ElementGroup,
  ProjectMeta,
  CanvasConfig,
  ViewportState,
  SceneRules,
  DataSource,
  ChartDefinition,
  TemplateInstance,
  ExportPreset,
  SceneDocument,
  // Adapter
  GeometryAdapter,
  AnchorPoint,
} from './types';

export { validateScene } from './validator';

export {
  ErrorCode,
} from './errors';

export type {
  ValidationSeverity,
  ValidationError,
  ValidationResult,
} from './errors';

export {
  successResult,
  failureResult,
} from './errors';
