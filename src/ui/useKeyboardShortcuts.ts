import { useEffect } from 'react';
import type { CommandExecutor } from '../core/commands';
import {
  CreateElementCommand,
  DeleteElementCommand,
  GroupElementsCommand,
  UngroupCommand,
} from '../core/commands';
import type { ElementInput } from '../core/commands';
import { useDocumentStore } from '../core/store';
import type { SceneDocument, SceneElement } from '../core/types';
import { generateId } from '../core/utils';
import {
  matchShortcut,
  matchShortcutOr,
  loadShortcutMap,
  saveShortcutMap,
  DEFAULT_SHORTCUTS,
  ALT_REDO_BINDING,
  isInputFocused,
} from '../core/keyboard';
import type { ShortcutMap } from '../core/keyboard';
import type { SelectionManager } from '../canvas/selection';
import { saveProject } from '../io/exporters';

interface KeyboardShortcutOptions {
  executorRef: React.RefObject<CommandExecutor | null>;
  selectionManager: SelectionManager;
  forceUpdate: () => void;
  activeLayerId: string;
}

const clipboard: ElementInput[] = [];
const PASTE_OFFSET = 20;

function elementToInput(el: SceneElement): ElementInput {
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
    input.source = { ...el.source };
    input.target = { ...el.target };
    input.route = { ...el.route, points: el.route.points.map((p) => ({ ...p })) };
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

function computeCenterOfElements(elements: { transform: { x: number; y: number; width: number; height: number } }[]): { x: number; y: number } {
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (const el of elements) {
    const cx = el.transform.x + el.transform.width / 2;
    const cy = el.transform.y + el.transform.height / 2;
    sumX += cx;
    sumY += cy;
    count++;
  }
  return count > 0 ? { x: sumX / count, y: sumY / count } : { x: 0, y: 0 };
}

function computeCenterOfSelection(scene: SceneDocument, selectedIds: Set<string>): { x: number; y: number } {
  const selectedElements: SceneElement[] = [];
  for (const el of scene.elements) {
    if (selectedIds.has(el.id)) {
      selectedElements.push(el);
    }
  }
  return computeCenterOfElements(selectedElements);
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions): {
  shortcutMap: ShortcutMap;
  resetShortcuts: () => void;
} {
  const { executorRef, selectionManager, forceUpdate, activeLayerId } = options;

  useEffect(() => {
    const shortcutMap = loadShortcutMap();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const executor = executorRef.current;
      if (!executor) return;

      const store = useDocumentStore.getState();
      const scene = store.getScene();
      if (!scene) return;

      const selectedIds = selectionManager.selectedIds;

      // Undo
      if (matchShortcut(e, shortcutMap.undo)) {
        e.preventDefault();
        executor.undo();
        forceUpdate();
        return;
      }

      // Redo: Ctrl+Shift+Z OR Ctrl+Y
      if (matchShortcutOr(e, shortcutMap.redo, ALT_REDO_BINDING)) {
        e.preventDefault();
        executor.redo();
        forceUpdate();
        return;
      }

      // Save
      if (matchShortcut(e, shortcutMap.save)) {
        e.preventDefault();
        saveProject().then(() => forceUpdate());
        return;
      }

      // Copy
      if (matchShortcut(e, shortcutMap.copy)) {
        e.preventDefault();
        clipboard.length = 0;
        for (const el of scene.elements) {
          if (selectedIds.has(el.id)) {
            clipboard.push(elementToInput(el));
          }
        }
        return;
      }

      // Cut
      if (matchShortcut(e, shortcutMap.cut)) {
        e.preventDefault();
        if (selectedIds.size === 0) return;
        clipboard.length = 0;
        for (const el of scene.elements) {
          if (selectedIds.has(el.id)) {
            clipboard.push(elementToInput(el));
          }
        }
        const cmd = new DeleteElementCommand([...selectedIds], 'unbind');
        executor.execute(cmd);
        selectionManager.clearSelection();
        forceUpdate();
        return;
      }

      // Paste
      if (matchShortcut(e, shortcutMap.paste)) {
        e.preventDefault();
        if (clipboard.length === 0) return;

        const pasteLayerId = activeLayerId;
        const center = computeCenterOfSelection(scene, selectedIds);
        const pasteBaseX = center.x + PASTE_OFFSET;

        if (clipboard.length === 1) {
          const item = clipboard[0];
          const input: ElementInput = {
            ...item,
            layerId: pasteLayerId,
            transform: { ...item.transform, x: pasteBaseX, y: center.y + PASTE_OFFSET },
          };
          const cmd = new CreateElementCommand(input, 'Paste');
          executor.execute(cmd);
        } else {
          const clipboardElements = clipboard.map((c) => ({
            transform: c.transform,
          }));
          const clipboardCenter = computeCenterOfElements(clipboardElements);
          for (const item of clipboard) {
            const dx = item.transform.x - clipboardCenter.x;
            const dy = item.transform.y - clipboardCenter.y;
            const input: ElementInput = {
              ...item,
              layerId: pasteLayerId,
              transform: {
                ...item.transform,
                x: pasteBaseX + dx,
                y: center.y + PASTE_OFFSET + dy,
              },
            };
            const cmd = new CreateElementCommand(input, 'Paste');
            executor.execute(cmd);
          }
        }
        forceUpdate();
        return;
      }

      // Delete / Backspace
      if (matchShortcut(e, shortcutMap.delete) || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedIds.size === 0) return;
        const cmd = new DeleteElementCommand([...selectedIds], 'unbind');
        executor.execute(cmd);
        selectionManager.clearSelection();
        forceUpdate();
        return;
      }

      // Select All
      if (matchShortcut(e, shortcutMap.selectAll)) {
        e.preventDefault();
        selectionManager.selectAll(scene);
        forceUpdate();
        return;
      }

      // Group
      if (matchShortcut(e, shortcutMap.group)) {
        e.preventDefault();
        if (selectedIds.size < 2) return;
        const cmd = new GroupElementsCommand([...selectedIds], `Group ${Date.now()}`);
        executor.execute(cmd);
        forceUpdate();
        return;
      }

      // Ungroup
      if (matchShortcut(e, shortcutMap.ungroup)) {
        e.preventDefault();
        if (selectedIds.size === 0) return;
        for (const group of scene.groups) {
          const memberIds = new Set(group.elementIds);
          const matchingIds = [...selectedIds].filter((id) => memberIds.has(id));
          if (matchingIds.length > 0) {
            const cmd = new UngroupCommand(group.id);
            executor.execute(cmd);
          }
        }
        forceUpdate();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executorRef, selectionManager, forceUpdate, activeLayerId]);

  return {
    shortcutMap: loadShortcutMap(),
    resetShortcuts: () => {
      saveShortcutMap({ ...DEFAULT_SHORTCUTS });
    },
  };
}
