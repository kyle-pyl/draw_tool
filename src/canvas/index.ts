/**
 * Canvas module - SVG infinite canvas, viewport transforms, selection, handles, conflict highlighting.
 */

export { Viewport } from './viewport';
export type { ViewportConfig } from './viewport';
export { CanvasView, drawStateToInput, renderDrawPreview } from './CanvasView';
export type { DrawingToolType, CanvasContextMenuEvent } from './CanvasView';
export { SelectionManager } from './selection';
export { ConflictHighlighter } from './conflict';
export type { ConflictInfo } from './conflict';
