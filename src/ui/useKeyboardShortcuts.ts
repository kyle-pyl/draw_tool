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
import type { SceneDocument } from '../core/types';
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
import {
  getClipboard,
  setClipboard,
  clearClipboard,
  hasClipboard,
  elementToClipboardInput,
  computePastePosition,
  PASTE_OFFSET,
} from '../core/clipboard';

interface KeyboardShortcutOptions {
  executorRef: React.RefObject<CommandExecutor | null>;
  selectionManager: SelectionManager;
  forceUpdate: () => void;
  activeLayerId: string;
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
        const items: ElementInput[] = [];
        for (const el of scene.elements) {
          if (selectedIds.has(el.id)) {
            items.push(elementToClipboardInput(el));
          }
        }
        setClipboard(items);
        return;
      }

      // Cut
      if (matchShortcut(e, shortcutMap.cut)) {
        e.preventDefault();
        if (selectedIds.size === 0) return;
        const items: ElementInput[] = [];
        for (const el of scene.elements) {
          if (selectedIds.has(el.id)) {
            items.push(elementToClipboardInput(el));
          }
        }
        setClipboard(items);
        const cmd = new DeleteElementCommand([...selectedIds], 'unbind');
        executor.execute(cmd);
        selectionManager.clearSelection();
        forceUpdate();
        return;
      }

      // Paste
      if (matchShortcut(e, shortcutMap.paste)) {
        e.preventDefault();
        const cb = getClipboard();
        if (cb.length === 0) return;

        const pasteLayerId = activeLayerId;
        const center = computeCenterOfSelection(scene, selectedIds);
        const pasteBase = computePastePosition(center);

        if (cb.length === 1) {
          const item = cb[0];
          const input: ElementInput = {
            ...item,
            layerId: pasteLayerId,
            transform: { ...item.transform, x: pasteBase.x, y: pasteBase.y },
          };
          const cmd = new CreateElementCommand(input, 'Paste');
          executor.execute(cmd);
        } else {
          const clipboardElements = cb.map((c) => ({
            transform: c.transform,
          }));
          const clipboardCenter = computeCenterOfElements(clipboardElements);
          for (const item of cb) {
            const dx = item.transform.x - clipboardCenter.x;
            const dy = item.transform.y - clipboardCenter.y;
            const input: ElementInput = {
              ...item,
              layerId: pasteLayerId,
              transform: {
                ...item.transform,
                x: pasteBase.x + dx,
                y: pasteBase.y + dy,
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
