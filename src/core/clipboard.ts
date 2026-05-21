/**
 * Shared clipboard for copy/cut/paste across the application.
 * Used by both keyboard shortcuts and context menu.
 */
import type { ElementInput } from './commands';
import type { SceneElement } from './types';

const _clipboard: ElementInput[] = [];
export const PASTE_OFFSET = 20;

export function getClipboard(): readonly ElementInput[] {
  return _clipboard;
}

export function setClipboard(items: ElementInput[]): void {
  _clipboard.length = 0;
  _clipboard.push(...items);
}

export function clearClipboard(): void {
  _clipboard.length = 0;
}

export function hasClipboard(): boolean {
  return _clipboard.length > 0;
}

export function elementToClipboardInput(el: SceneElement): ElementInput {
  const input: ElementInput = {
    type: el.type,
    layerId: el.layerId,
    name: el.name,
    transform: { ...el.transform },
    style: { ...el.style },
    visible: el.visible,
    locked: el.locked,
    tags: el.tags ? [...el.tags] : undefined,
    metadata: el.metadata ? { ...el.metadata } : undefined,
  };

  if (el.type === 'shape') {
    input.shapeKind = el.shapeKind;
    input.cornerRadius = el.cornerRadius;
    input.points = el.points ? el.points.map((p) => ({ ...p })) : undefined;
    input.pathCommands = el.pathCommands;
  } else if (el.type === 'text') {
    input.text = el.text;
  } else if (el.type === 'image') {
    input.src = el.src;
    input.originalWidth = el.originalWidth;
    input.originalHeight = el.originalHeight;
    input.objectFit = el.objectFit;
  } else if (el.type === 'connector') {
    input.source = el.source ? { ...el.source } : undefined;
    input.target = el.target ? { ...el.target } : undefined;
    input.route = el.route ? { ...el.route, points: el.route.points.map((p) => ({ ...p })) } : undefined;
    input.arrowStart = el.arrowStart;
    input.arrowEnd = el.arrowEnd;
    input.labels = el.labels ? el.labels.map((l) => ({ ...l })) : undefined;
  } else if (el.type === 'chart') {
    input.dataSourceId = el.dataSourceId;
    input.chartType = el.chartType;
    input.columnMappings = el.columnMappings ? { ...el.columnMappings } : undefined;
    input.options = el.options ? { ...el.options } : undefined;
    input.svgContent = el.svgContent;
  }

  return input;
}

export function computePastePosition(
  selectionCenter: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: selectionCenter.x + PASTE_OFFSET,
    y: selectionCenter.y + PASTE_OFFSET,
  };
}
