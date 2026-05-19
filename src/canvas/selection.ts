import type { SceneDocument, SceneElement } from '../core/types';

export class SelectionManager {
  private _selectedIds: Set<string>;

  constructor() {
    this._selectedIds = new Set();
  }

  get selectedIds(): ReadonlySet<string> {
    return this._selectedIds;
  }

  select(id: string): void {
    this._selectedIds.clear();
    this._selectedIds.add(id);
  }

  toggleSelect(id: string): void {
    if (this._selectedIds.has(id)) {
      this._selectedIds.delete(id);
    } else {
      this._selectedIds.add(id);
    }
  }

  clearSelection(): void {
    this._selectedIds.clear();
  }

  selectAll(scene: SceneDocument): void {
    this._selectedIds.clear();
    for (const el of scene.elements) {
      if (el.visible && !el.locked) {
        this._selectedIds.add(el.id);
      }
    }
  }

  selectByIds(ids: string[]): void {
    this._selectedIds.clear();
    for (const id of ids) {
      this._selectedIds.add(id);
    }
  }

  addToSelection(ids: string[]): void {
    for (const id of ids) {
      this._selectedIds.add(id);
    }
  }

  removeFromSelection(ids: string[]): void {
    for (const id of ids) {
      this._selectedIds.delete(id);
    }
  }

  isSelected(id: string): boolean {
    return this._selectedIds.has(id);
  }

  getSelectedElements(scene: SceneDocument): SceneElement[] {
    return scene.elements.filter((el) => this._selectedIds.has(el.id));
  }

  get count(): number {
    return this._selectedIds.size;
  }
}
