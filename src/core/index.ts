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

export { validateScene, validateAndCast } from './validator';

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

export { generateId } from './utils';

export {
  getClipboard,
  setClipboard,
  clearClipboard,
  hasClipboard,
  elementToClipboardInput,
  computePastePosition,
  PASTE_OFFSET,
} from './clipboard';

export { useDocumentStore } from './store';
export type { DocumentStore } from './store';

export { getBBox, getGeometry, intersects, createGeometryAdapter } from './geometry';

export { getAnchors, resolveAnchor } from './anchors';

export { directionToCardinal, computeOrthogonalRoute, recalculateConnectorRoute, recalculateRoutesForElements } from './routing';
export type { CardinalDirection } from './routing';

export { checkLayerCollisions, checkElementsCollide } from './collision';
export type { CollisionEntry, CollisionResult, CollisionCheckOptions } from './collision';

export { SpatialIndex, findCollisionPairsFromIndex } from './spatial-index';

export {
  CommandExecutor,
  CreateElementCommand,
  MoveElementsCommand,
  UpdateElementCommand,
  ChangeLayerCommand,
  TransformElementsCommand,
  GroupElementsCommand,
  UngroupCommand,
  AddToGroupCommand,
  RemoveFromGroupCommand,
  AlignElementsCommand,
  DistributeElementsCommand,
  BatchLayerEditCommand,
  MoveLayersCommand,
  DeleteElementCommand,
  ChartToVectorCommand,
  BooleanOperationCommand,
  ClipElementCommand,
  LayoutCommand,
  createLayoutCommand,
} from './commands';
export type { SceneCommand, CommandHistoryEntry, ElementInput, ElementChanges, TransformParams, AlignType, DistributeType, CircularDistributeOptions, BatchLayerOperation, LayerMoveDirection, DeleteElementStrategy, ClipStrategy } from './commands';

export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  unregisterTemplate,
  clearTemplates,
  instantiateTemplate,
  createTemplateInstance,
} from './templates';
export type {
  TemplateElementDef,
  TemplateRtlPortDef,
  TemplateConnectorDef,
  TemplateDefinition,
} from './templates';

export { applyLayoutToScene, extractLayoutNodes, extractLayoutEdges } from './layout';
export type {
  LayoutDirection,
  LayoutHAlign,
  LayoutVAlign,
  LayoutOptions,
  LayoutNode,
  LayoutEdge,
  LayoutNodeResult,
  LayoutEdgeResult,
  LayoutResult,
  LayoutEngine,
} from './layout';

export { performBooleanOperation, geometryToSvgPath } from './boolean-ops';
export type {
  BooleanOperationType } from './boolean-ops';

export {
  matchShortcut,
  matchShortcutOr,
  loadShortcutMap,
  saveShortcutMap,
  formatShortcut,
  isInputFocused,
  DEFAULT_SHORTCUTS,
  ALT_REDO_BINDING,
} from './keyboard';
export type {
  ShortcutActionId,
  ShortcutBinding,
  ShortcutMap,
} from './keyboard';
