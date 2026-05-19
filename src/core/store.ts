import { create } from 'zustand';
import type { SceneDocument } from './types';

/**
 * Document Store state shape.
 * Holds the current scene, viewport, selection, and dirty flag.
 */
export interface DocumentStore {
  /** Currently loaded scene document, or null if no document is open */
  scene: SceneDocument | null;
  /** Current viewport zoom level */
  zoom: number;
  /** Current viewport horizontal offset */
  offsetX: number;
  /** Current viewport vertical offset */
  offsetY: number;
  /** Currently selected element IDs */
  selectedIds: string[];
  /** Whether the document has unsaved modifications */
  isDirty: boolean;
  /** File System Access API directory handle for project-directory-based save */
  directoryHandle: FileSystemDirectoryHandle | null;

  /** Load a scene document into the store, resetting dirty flag and selection */
  loadScene: (scene: SceneDocument) => void;
  /** Update the scene using an immutable updater function, marking as dirty */
  updateScene: (updater: (scene: SceneDocument) => SceneDocument) => void;
  /** Imperative accessor for the current scene */
  getScene: () => SceneDocument | null;
  /** Mark the document as clean (saved) */
  markClean: () => void;
  /** Update viewport zoom and offset */
  setViewport: (zoom: number, offsetX: number, offsetY: number) => void;
  /** Replace the current selection set */
  setSelectedIds: (ids: string[]) => void;
  /** Store the FSAA directory handle for later project-directory saves */
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  scene: null,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  selectedIds: [],
  isDirty: false,
  directoryHandle: null,

  loadScene: (scene: SceneDocument) => {
    set({ scene, isDirty: false, selectedIds: [] });
  },

  updateScene: (updater: (scene: SceneDocument) => SceneDocument) => {
    const current = get().scene;
    if (!current) return;
    set({ scene: updater(current), isDirty: true });
  },

  getScene: () => get().scene,

  markClean: () => {
    set({ isDirty: false });
  },

  setViewport: (zoom: number, offsetX: number, offsetY: number) => {
    set({ zoom, offsetX, offsetY });
  },

  setSelectedIds: (ids: string[]) => {
    set({ selectedIds: ids });
  },

  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => {
    set({ directoryHandle: handle });
  },
}));
