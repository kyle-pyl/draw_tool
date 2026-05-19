/**
 * Project exporters — ZIP, SVG, PNG, JPG export.
 */

import { zipSync, strToU8 } from 'fflate';
import type { Zippable } from 'fflate';
import { useDocumentStore } from '../core/store';
import { validateScene } from '../core/validator';
import { successResult, failureResult } from '../core/errors';
import type { SceneDocument } from '../core/types';
import type { ValidationResult } from '../core/errors';

function extFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
  };
  return map[mimeType] ?? 'png';
}

/**
 * Export the currently loaded project as a ZIP archive.
 *
 * The resulting ZIP mirrors the project directory structure:
 * - scene.json at the root with the current scene state.
 * - data/ directory with CSV/JSON/XLSX files (if a directory handle is available).
 * - assets/ directory with image files (fetched from blob URLs).
 *
 * Blob URLs in ImageElement src fields are replaced with their original
 * relative asset paths (stored in element metadata during import) or
 * generated paths.
 *
 * @returns A Blob of MIME type "application/zip" ready for download.
 * @throws If no scene is currently loaded.
 */
export async function exportProjectToZip(): Promise<Blob> {
  const store = useDocumentStore.getState();
  const scene = store.getScene();
  if (!scene) {
    throw new Error('No scene is currently loaded. Open or create a project first.');
  }

  const exportScene: SceneDocument = JSON.parse(JSON.stringify(scene));
  const zipEntries: Zippable = {};

  // ── Process image elements: replace blob URLs with asset paths ──────────────
  for (const el of exportScene.elements) {
    if (el.type === 'image') {
      const src = el.src as string;
      if (src && src.startsWith('blob:')) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          const mimeType = blob.type || 'image/png';
          const ext = extFromMimeType(mimeType);
          const meta = (el as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
          const originalPath = meta?.originalAssetPath as string | undefined;
          const assetPath = originalPath ?? `assets/image_${el.id}.${ext}`;

          zipEntries[assetPath] = new Uint8Array(arrayBuffer);
          el.src = assetPath;
        } catch {
          // Blob URL unreachable — keep it as-is; the image won't round-trip
        }
      }
    }
  }

  // ── Add scene.json ──────────────────────────────────────────────────────────
  zipEntries['scene.json'] = strToU8(JSON.stringify(exportScene, null, 2));

  // ── Read data/ files from directory handle if available ─────────────────────
  const dirHandle = store.directoryHandle;
  if (dirHandle) {
    try {
      const dataDirHandle = await dirHandle.getDirectoryHandle('data');
      for await (const [name, handle] of dataDirHandle.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          const buf = await file.arrayBuffer();
          zipEntries[`data/${name}`] = new Uint8Array(buf);
        }
      }
    } catch {
      // No data/ directory — fine
    }
  }

  const zipData = zipSync(zipEntries);
  return new Blob([zipData], { type: 'application/zip' });
}

/**
 * Trigger a browser download for a Blob.
 */
function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to ensure the download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Save the currently loaded project.
 *
 * Behaviour depends on how the project was opened:
 *  - If a File System Access API directory handle is available (project opened
 *    via `loadProjectFromDirectory`), the scene.json is written back to the
 *    directory root using `createWritable`. Data and asset files already in
 *    the directory are left untouched.
 *  - If no directory handle is available, the project is exported as a ZIP
 *    and a download is triggered in the browser.
 *
 * Before saving, the current scene is validated with `validateScene`. If
 * validation fails the save is blocked and the ValidationResult with errors
 * is returned.
 *
 * After a successful save `store.markClean()` is called so that `isDirty`
 * resets to `false`.
 *
 * @returns ValidationResult — valid: true when saved successfully;
 *          valid: false when validation blocks the save.
 */
export async function saveProject(): Promise<ValidationResult> {
  const store = useDocumentStore.getState();
  const scene = store.getScene();

  if (!scene) {
    return failureResult({
      code: 'IO_ERROR',
      message: 'No scene is currently loaded. Open or create a project first.',
      severity: 'error',
    });
  }

  // Pre-save validation
  const validation = validateScene(scene);
  if (!validation.valid) {
    return validation;
  }

  const dirHandle = store.directoryHandle;

  if (dirHandle) {
    // ── Save directly to the project directory ──────────────────────────
    try {
      const sceneJson = JSON.stringify(scene, null, 2);

      // Write scene.json
      const fileHandle = await dirHandle.getFileHandle('scene.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(sceneJson);
      await writable.close();
    } catch (err) {
      return failureResult({
        code: 'IO_ERROR',
        message: `Failed to write to project directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  } else {
    // ── Export as ZIP and trigger download ──────────────────────────────
    try {
      const zipBlob = await exportProjectToZip();
      const projectName = scene.project?.name ?? 'project';
      triggerDownload(zipBlob, `${projectName}.zip`);
    } catch (err) {
      return failureResult({
        code: 'IO_ERROR',
        message: `Failed to export project: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  }

  store.markClean();
  return successResult();
}
