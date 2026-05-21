import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  matchShortcut,
  matchShortcutOr,
  loadShortcutMap,
  saveShortcutMap,
  formatShortcut,
  isInputFocused,
  DEFAULT_SHORTCUTS,
  ALT_REDO_BINDING,
} from '../../core/keyboard';
import type { ShortcutBinding, ShortcutMap } from '../../core/keyboard';

function createKeyboardEvent(overrides: Partial<{
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key: overrides.key ?? 'a',
    ctrlKey: overrides.ctrlKey ?? false,
    shiftKey: overrides.shiftKey ?? false,
    altKey: overrides.altKey ?? false,
    metaKey: overrides.metaKey ?? false,
    bubbles: true,
    cancelable: true,
  });
}

describe('matchShortcut', () => {
  it('should match Ctrl+Z', () => {
    const binding: ShortcutBinding = { key: 'z', ctrl: true };
    const event = createKeyboardEvent({ key: 'z', ctrlKey: true });
    expect(matchShortcut(event, binding)).toBe(true);
  });

  it('should match Ctrl+Shift+Z', () => {
    const binding: ShortcutBinding = { key: 'z', ctrl: true, shift: true };
    const event = createKeyboardEvent({ key: 'z', ctrlKey: true, shiftKey: true });
    expect(matchShortcut(event, binding)).toBe(true);
  });

  it('should match Delete', () => {
    const binding: ShortcutBinding = { key: 'Delete' };
    const event = createKeyboardEvent({ key: 'Delete' });
    expect(matchShortcut(event, binding)).toBe(true);
  });

  it('should match Backspace', () => {
    const binding: ShortcutBinding = { key: 'Backspace' };
    const event = createKeyboardEvent({ key: 'Backspace' });
    expect(matchShortcut(event, binding)).toBe(true);
  });

  it('should be case-insensitive', () => {
    const binding: ShortcutBinding = { key: 'a', ctrl: true };
    const event = createKeyboardEvent({ key: 'A', ctrlKey: true });
    expect(matchShortcut(event, binding)).toBe(true);
  });

  it('should match Meta key as Ctrl', () => {
    const binding: ShortcutBinding = { key: 'z', ctrl: true };
    const event = createKeyboardEvent({ key: 'z', metaKey: true });
    expect(matchShortcut(event, binding)).toBe(true);
  });

  it('should not match without Ctrl when Ctrl required', () => {
    const binding: ShortcutBinding = { key: 'z', ctrl: true };
    const event = createKeyboardEvent({ key: 'z' });
    expect(matchShortcut(event, binding)).toBe(false);
  });

  it('should not match wrong key', () => {
    const binding: ShortcutBinding = { key: 'a', ctrl: true };
    const event = createKeyboardEvent({ key: 'b', ctrlKey: true });
    expect(matchShortcut(event, binding)).toBe(false);
  });

  it('should not match when Shift required but not pressed', () => {
    const binding: ShortcutBinding = { key: 'z', ctrl: true, shift: true };
    const event = createKeyboardEvent({ key: 'z', ctrlKey: true });
    expect(matchShortcut(event, binding)).toBe(false);
  });

  it('should match Alt binding', () => {
    const binding: ShortcutBinding = { key: '1', alt: true };
    const event = createKeyboardEvent({ key: '1', altKey: true });
    expect(matchShortcut(event, binding)).toBe(true);
  });
});

describe('matchShortcutOr', () => {
  it('should match first option', () => {
    const a: ShortcutBinding = { key: 'z', ctrl: true, shift: true };
    const b: ShortcutBinding = { key: 'y', ctrl: true };
    const event = createKeyboardEvent({ key: 'z', ctrlKey: true, shiftKey: true });
    expect(matchShortcutOr(event, a, b)).toBe(true);
  });

  it('should match second option', () => {
    const a: ShortcutBinding = { key: 'z', ctrl: true, shift: true };
    const b: ShortcutBinding = { key: 'y', ctrl: true };
    const event = createKeyboardEvent({ key: 'y', ctrlKey: true });
    expect(matchShortcutOr(event, a, b)).toBe(true);
  });

  it('should not match either', () => {
    const a: ShortcutBinding = { key: 'z', ctrl: true, shift: true };
    const b: ShortcutBinding = { key: 'y', ctrl: true };
    const event = createKeyboardEvent({ key: 'x', ctrlKey: true });
    expect(matchShortcutOr(event, a, b)).toBe(false);
  });
});

describe('DEFAULT_SHORTCUTS', () => {
  it('should have all expected actions', () => {
    const actions = Object.keys(DEFAULT_SHORTCUTS);
    expect(actions).toContain('undo');
    expect(actions).toContain('redo');
    expect(actions).toContain('copy');
    expect(actions).toContain('paste');
    expect(actions).toContain('cut');
    expect(actions).toContain('delete');
    expect(actions).toContain('selectAll');
    expect(actions).toContain('group');
    expect(actions).toContain('ungroup');
    expect(actions).toContain('save');
  });

  it('undo should be Ctrl+Z', () => {
    expect(DEFAULT_SHORTCUTS.undo).toEqual({ key: 'z', ctrl: true });
  });

  it('redo should be Ctrl+Shift+Z', () => {
    expect(DEFAULT_SHORTCUTS.redo).toEqual({ key: 'z', ctrl: true, shift: true });
  });

  it('ALT_REDO should be Ctrl+Y', () => {
    expect(ALT_REDO_BINDING).toEqual({ key: 'y', ctrl: true });
  });

  it('copy should be Ctrl+C', () => {
    expect(DEFAULT_SHORTCUTS.copy).toEqual({ key: 'c', ctrl: true });
  });

  it('paste should be Ctrl+V', () => {
    expect(DEFAULT_SHORTCUTS.paste).toEqual({ key: 'v', ctrl: true });
  });

  it('cut should be Ctrl+X', () => {
    expect(DEFAULT_SHORTCUTS.cut).toEqual({ key: 'x', ctrl: true });
  });

  it('delete should be Delete key', () => {
    expect(DEFAULT_SHORTCUTS.delete).toEqual({ key: 'Delete' });
  });

  it('selectAll should be Ctrl+A', () => {
    expect(DEFAULT_SHORTCUTS.selectAll).toEqual({ key: 'a', ctrl: true });
  });

  it('group should be Ctrl+G', () => {
    expect(DEFAULT_SHORTCUTS.group).toEqual({ key: 'g', ctrl: true });
  });

  it('ungroup should be Ctrl+Shift+G', () => {
    expect(DEFAULT_SHORTCUTS.ungroup).toEqual({ key: 'g', ctrl: true, shift: true });
  });

  it('save should be Ctrl+S', () => {
    expect(DEFAULT_SHORTCUTS.save).toEqual({ key: 's', ctrl: true });
  });

  it('each binding should be valid', () => {
    for (const [action, binding] of Object.entries(DEFAULT_SHORTCUTS)) {
      expect(binding).toHaveProperty('key');
      expect(typeof binding.key).toBe('string');
      expect(binding.key.length).toBeGreaterThan(0);
    }
  });

  it('no two shortcuts should have identical bindings except redo', () => {
    const bindings = new Map<string, string[]>();
    for (const [action, binding] of Object.entries(DEFAULT_SHORTCUTS)) {
      if (action === 'redo') continue;
      const key = JSON.stringify(binding);
      if (bindings.has(key)) {
        bindings.get(key)!.push(action);
      } else {
        bindings.set(key, [action]);
      }
    }
    const conflicts: string[] = [];
    for (const [, actions] of bindings) {
      if (actions.length > 1) {
        conflicts.push(`Conflict: ${actions.join(', ')} share binding`);
      }
    }
    expect(conflicts).toEqual([]);
  });
});

describe('formatShortcut', () => {
  it('should format Ctrl+Z', () => {
    expect(formatShortcut({ key: 'z', ctrl: true })).toBe('Ctrl+Z');
  });

  it('should format Ctrl+Shift+Z', () => {
    expect(formatShortcut({ key: 'z', ctrl: true, shift: true })).toBe('Ctrl+Shift+Z');
  });

  it('should format Delete', () => {
    expect(formatShortcut({ key: 'Delete' })).toBe('Delete');
  });

  it('should format Ctrl+Alt+1', () => {
    expect(formatShortcut({ key: '1', ctrl: true, alt: true })).toBe('Ctrl+Alt+1');
  });

  it('should capitalize single-letter keys', () => {
    expect(formatShortcut({ key: 'a', ctrl: true })).toBe('Ctrl+A');
    expect(formatShortcut({ key: 'g', ctrl: true, shift: true })).toBe('Ctrl+Shift+G');
  });
});

describe('loadShortcutMap / saveShortcutMap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return defaults when no saved map exists', () => {
    const map = loadShortcutMap();
    expect(map).toEqual(DEFAULT_SHORTCUTS);
  });

  it('should persist and load custom shortcuts', () => {
    const custom: ShortcutMap = {
      ...DEFAULT_SHORTCUTS,
      undo: { key: 'u', ctrl: true },
    };
    saveShortcutMap(custom);
    const loaded = loadShortcutMap();
    expect(loaded.undo).toEqual({ key: 'u', ctrl: true });
  });

  it('should preserve defaults for unset actions', () => {
    saveShortcutMap({ undo: { key: 'u', ctrl: true }, copy: { key: 'c', ctrl: true } } as ShortcutMap);
    const loaded = loadShortcutMap();
    expect(loaded.undo).toEqual({ key: 'u', ctrl: true });
    expect(loaded.copy).toEqual({ key: 'c', ctrl: true });
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('draw-tool-shortcuts', '{invalid json');
    const map = loadShortcutMap();
    expect(map).toEqual(DEFAULT_SHORTCUTS);
  });

  it('should handle partial saved data', () => {
    localStorage.setItem('draw-tool-shortcuts', JSON.stringify({ undo: { key: 'u', ctrl: true } }));
    const loaded = loadShortcutMap();
    expect(loaded.undo).toEqual({ key: 'u', ctrl: true });
    expect(loaded.copy).toEqual(DEFAULT_SHORTCUTS.copy);
  });
});

describe('isInputFocused', () => {
  it('should return false when no element focused', () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    document.body.focus();
    // document.body might not be focusable in test environment
    expect(isInputFocused()).toBe(false);
  });

  it('should return true for INPUT element', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(isInputFocused()).toBe(true);
    document.body.removeChild(input);
  });

  it('should return true for TEXTAREA element', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();
    expect(isInputFocused()).toBe(true);
    document.body.removeChild(textarea);
  });

  it('should return true for SELECT element', () => {
    const select = document.createElement('select');
    document.body.appendChild(select);
    select.focus();
    expect(isInputFocused()).toBe(true);
    document.body.removeChild(select);
  });

  it('should return true for contentEditable element', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);
    div.focus();
    expect(isInputFocused()).toBe(true);
    document.body.removeChild(div);
  });

  it('should return false for regular DIV', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    div.focus();
    expect(isInputFocused()).toBe(false);
    document.body.removeChild(div);
  });
});
