/**
 * Keyboard shortcut system — type definitions, default bindings and matching logic.
 * Shortcuts are configurable and can be viewed / customized at runtime.
 */

export type ShortcutActionId =
  | 'undo'
  | 'redo'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'delete'
  | 'selectAll'
  | 'group'
  | 'ungroup'
  | 'save';

export interface ShortcutBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export type ShortcutMap = Record<ShortcutActionId, ShortcutBinding>;

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  undo: { key: 'z', ctrl: true },
  redo: { key: 'z', ctrl: true, shift: true },
  copy: { key: 'c', ctrl: true },
  paste: { key: 'v', ctrl: true },
  cut: { key: 'x', ctrl: true },
  delete: { key: 'Delete' },
  selectAll: { key: 'a', ctrl: true },
  group: { key: 'g', ctrl: true },
  ungroup: { key: 'g', ctrl: true, shift: true },
  save: { key: 's', ctrl: true },
};

export const ALT_REDO_BINDING: ShortcutBinding = { key: 'y', ctrl: true };

export function matchShortcut(event: KeyboardEvent, binding: ShortcutBinding): boolean {
  const evKey = event.key.toLowerCase();
  const bdKey = binding.key.toLowerCase();
  if (evKey !== bdKey) return false;
  const ctrl = event.ctrlKey || event.metaKey;
  if ((binding.ctrl ?? false) !== ctrl) return false;
  if ((binding.shift ?? false) !== event.shiftKey) return false;
  if ((binding.alt ?? false) !== event.altKey) return false;
  return true;
}

export function matchShortcutOr(event: KeyboardEvent, a: ShortcutBinding, b: ShortcutBinding): boolean {
  return matchShortcut(event, a) || matchShortcut(event, b);
}

export const STORAGE_KEY = 'draw-tool-shortcuts';

export function loadShortcutMap(): ShortcutMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const map: ShortcutMap = { ...DEFAULT_SHORTCUTS };
      for (const actionId of Object.keys(DEFAULT_SHORTCUTS)) {
        if (parsed[actionId] && typeof parsed[actionId].key === 'string') {
          map[actionId as ShortcutActionId] = {
            key: parsed[actionId].key,
            ctrl: 'ctrl' in parsed[actionId] ? !!parsed[actionId].ctrl : DEFAULT_SHORTCUTS[actionId as ShortcutActionId].ctrl,
            shift: 'shift' in parsed[actionId] ? !!parsed[actionId].shift : DEFAULT_SHORTCUTS[actionId as ShortcutActionId].shift,
            alt: 'alt' in parsed[actionId] ? !!parsed[actionId].alt : DEFAULT_SHORTCUTS[actionId as ShortcutActionId].alt,
            meta: 'meta' in parsed[actionId] ? !!parsed[actionId].meta : undefined,
          };
        }
      }
      return map;
    }
  } catch {
    // ignore corrupted localStorage
  }
  return { ...DEFAULT_SHORTCUTS };
}

export function saveShortcutMap(map: ShortcutMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

export function formatShortcut(binding: ShortcutBinding): string {
  const parts: string[] = [];
  if (binding.ctrl) parts.push('Ctrl');
  if (binding.shift) parts.push('Shift');
  if (binding.alt) parts.push('Alt');
  if (binding.meta) parts.push('Meta');
  const keyName = binding.key.length === 1 ? binding.key.toUpperCase() : binding.key;
  parts.push(keyName);
  return parts.join('+');
}

export function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  const htmlEl = el as HTMLElement;
  if (htmlEl.isContentEditable) return true;
  if (htmlEl.getAttribute('contenteditable') === 'true') return true;
  return false;
}
