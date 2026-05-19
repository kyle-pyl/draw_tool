/**
 * Project file loaders — JSON scene file import via browser file picker.
 */

import { useDocumentStore } from '../core/store';
import { validateScene } from '../core/validator';
import type { SceneDocument } from '../core/types';
import type { ValidationResult } from '../core/errors';
import { failureResult, successResult } from '../core/errors';
import { generateId } from '../core/utils';

/** Tracks blob URLs created during project load for later cleanup */
let _activeBlobUrls: string[] = [];

/**
 * Revoke all tracked blob URLs and clear the list.
 */
function revokeTrackedBlobUrls(): void {
  for (const url of _activeBlobUrls) {
    URL.revokeObjectURL(url);
  }
  _activeBlobUrls = [];
}

/**
 * Read a File object as a UTF-8 text string.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file content'));
    reader.readAsText(file);
  });
}

/**
 * Read a named file from a directory handle.
 * Returns the File or null if not found.
 */
async function readFileFromDirectory(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
): Promise<File | null> {
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName);
    return fileHandle.getFile();
  } catch {
    return null;
  }
}

/**
 * Recursively read all files from a directory handle.
 * Keys are relative paths from the directory root (e.g. "data/report.csv").
 */
async function readAllFilesFromDirectory(
  dirHandle: FileSystemDirectoryHandle,
  prefix: string,
): Promise<Map<string, File>> {
  const files = new Map<string, File>();
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file') {
      files.set(`${prefix}${name}`, await handle.getFile());
    } else if (handle.kind === 'directory') {
      const subFiles = await readAllFilesFromDirectory(handle, `${prefix}${name}/`);
      for (const [path, file] of subFiles) {
        files.set(path, file);
      }
    }
  }
  return files;
}

/**
 * Check whether a filename represents an image the tool can handle.
 */
function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg' || ext === 'gif' || ext === 'webp';
}

/**
 * Infer the DataSource type from a file extension.
 */
function inferDataSourceType(name: string): 'csv' | 'json' | 'xlsx' | 'xls' {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'json':
      return 'json';
    case 'xlsx':
      return 'xlsx';
    case 'xls':
      return 'xls';
    default:
      return 'csv';
  }
}

/**
 * Parse a JSON string and validate + load it as a SceneDocument.
 * Returns the ValidationResult (valid: true and loaded into store, or valid: false with errors).
 */
export async function loadSceneFromFileObject(file: File): Promise<ValidationResult> {
  let text: string;
  try {
    text = await readFileAsText(file);
  } catch (err) {
    return failureResult({
      code: 'IO_ERROR',
      message: `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`,
      severity: 'error',
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return failureResult({
      code: 'PARSE_ERROR',
      message: 'File content is not valid JSON. Check for syntax errors.',
      severity: 'error',
    });
  }

  const result = validateScene(data);

  if (result.valid) {
    useDocumentStore.getState().loadScene(data as SceneDocument);
  }

  return result;
}

/**
 * Open the browser's native file picker, let the user select a .json file,
 * and attempt to parse, validate and load it as a SceneDocument.
 *
 * Uses the File System Access API (showOpenFilePicker) when available,
 * falling back to a hidden `<input type="file">` element otherwise.
 *
 * @returns ValidationResult — valid: true means loaded; valid: false carries error details.
 */
export async function loadSceneFromFile(): Promise<ValidationResult> {
  // Try File System Access API first (Chrome, Edge, Opera)
  if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
    try {
      const [handle] = await (
        window as unknown as {
          showOpenFilePicker: (options: {
            types: { description: string; accept: Record<string, string[]> }[];
            multiple: boolean;
          }) => Promise<{ getFile: () => Promise<File> }[]>;
        }
      ).showOpenFilePicker({
        types: [
          {
            description: 'Scene JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      return loadSceneFromFileObject(file);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return failureResult({
          code: 'USER_CANCELLED',
          message: 'File selection was cancelled.',
          severity: 'warning',
        });
      }
      // If FSAA failed for another reason, fall through to the input element fallback
    }
  }

  // Fallback: hidden <input type="file">
  return new Promise<ValidationResult>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    let resolved = false;

    const cleanup = () => {
      input.remove();
      window.removeEventListener('focus', handleFocus);
    };

    input.addEventListener('change', () => {
      if (resolved) return;
      resolved = true;
      cleanup();

      const file = input.files?.[0];
      if (!file) {
        resolve(
          failureResult({
            code: 'USER_CANCELLED',
            message: 'No file was selected.',
            severity: 'warning',
          }),
        );
        return;
      }
      resolve(loadSceneFromFileObject(file));
    });

    // Detect user cancellation: when the file dialog closes without a file,
    // the window regains focus.
    const handleFocus = () => {
      window.removeEventListener('focus', handleFocus);
      // Delay to allow the change event to fire first if a file was selected
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(
          failureResult({
            code: 'USER_CANCELLED',
            message: 'File selection was cancelled.',
            severity: 'warning',
          }),
        );
      }, 400);
    };
    window.addEventListener('focus', handleFocus);

    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Open a project directory using the File System Access API (showDirectoryPicker),
 * read scene.json, scan data/ and assets/ subdirectories, validate and load the scene.
 *
 * - If the browser does not support showDirectoryPicker, returns an error suggesting ZIP import.
 * - Reads scene.json from the directory root and loads it into the document store.
 * - Scans data/ for CSV, JSON, XLSX, XLS files and adds them as DataSource entries if not already present.
 * - Scans assets/ for image files, creates blob URLs, and resolves ImageElement src references.
 * - Saves the directory handle in the store for later directory-based saves.
 *
 * @returns ValidationResult — valid means the project loaded successfully.
 */
export async function loadProjectFromDirectory(): Promise<ValidationResult> {
  if (typeof window === 'undefined' || typeof (window as Record<string, unknown>).showDirectoryPicker !== 'function') {
    return failureResult({
      code: 'FEATURE_NOT_SUPPORTED',
      message:
        'File System Access API (showDirectoryPicker) is not supported in this browser. Please use ZIP import instead.',
      severity: 'error',
    });
  }

  let dirHandle: FileSystemDirectoryHandle;
  try {
    dirHandle = await (
      window as unknown as {
        showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return failureResult({
        code: 'USER_CANCELLED',
        message: 'Directory selection was cancelled.',
        severity: 'warning',
      });
    }
    return failureResult({
      code: 'IO_ERROR',
      message: `Failed to open directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
      severity: 'error',
    });
  }

  // ── Read scene.json ────────────────────────────────────────────────────────
  const sceneFile = await readFileFromDirectory(dirHandle, 'scene.json');
  if (!sceneFile) {
    return failureResult({
      code: 'IO_ERROR',
      message: 'scene.json not found in the selected directory.',
      severity: 'error',
    });
  }

  let sceneText: string;
  try {
    sceneText = await readFileAsText(sceneFile);
  } catch (err) {
    return failureResult({
      code: 'IO_ERROR',
      message: `Failed to read scene.json: ${err instanceof Error ? err.message : 'Unknown error'}`,
      severity: 'error',
    });
  }

  let sceneData: Record<string, unknown>;
  try {
    sceneData = JSON.parse(sceneText);
  } catch {
    return failureResult({
      code: 'PARSE_ERROR',
      message: 'scene.json content is not valid JSON.',
      severity: 'error',
    });
  }

  // ── Scan data/ directory ───────────────────────────────────────────────────
  let dataFiles: Map<string, File> = new Map();
  try {
    const dataDirHandle = await dirHandle.getDirectoryHandle('data');
    dataFiles = await readAllFilesFromDirectory(dataDirHandle, 'data/');
  } catch {
    // No data/ directory — that's fine, continue with whatever scene.json specifies
  }

  // Add discovered data sources to scene data before validation
  if (dataFiles.size > 0) {
    const existingDataSources = (sceneData.dataSources as Array<{ path: string }>) ?? [];
    const existingPaths = new Set(existingDataSources.map((ds) => ds.path));

    for (const [path, file] of dataFiles) {
      if (!existingPaths.has(path)) {
        existingDataSources.push({
          id: generateId('ds'),
          path,
          type: inferDataSourceType(file.name),
        });
      }
    }
    sceneData.dataSources = existingDataSources;
  }

  // ── Scan assets/ directory ─────────────────────────────────────────────────
  const assetBlobs = new Map<string, string>();
  const blobUrlsToTrack: string[] = [];
  try {
    const assetsDirHandle = await dirHandle.getDirectoryHandle('assets');
    const assetFiles = await readAllFilesFromDirectory(assetsDirHandle, 'assets/');

    for (const [path, file] of assetFiles) {
      if (isImageFile(file.name)) {
        const blobUrl = URL.createObjectURL(file);
        assetBlobs.set(path, blobUrl);
        blobUrlsToTrack.push(blobUrl);
      }
    }
  } catch {
    // No assets/ directory — that's fine
  }

  // Resolve ImageElement src references to blob URLs
  if (assetBlobs.size > 0) {
    const elements = sceneData.elements as Array<Record<string, unknown>> | undefined;
    if (elements) {
      for (const el of elements) {
        if (el.type === 'image') {
          const src = el.src as string | undefined;
          if (src) {
            // Try exact match first, then basename match
            for (const [assetPath, blobUrl] of assetBlobs) {
              const baseName = assetPath.replace(/^assets\//i, '');
              if (src === assetPath || src === baseName || src.endsWith('/' + baseName)) {
                el.src = blobUrl;
                break;
              }
            }
          }
        }
      }
    }
  }

  // ── Validate and load ──────────────────────────────────────────────────────
  const result = validateScene(sceneData);

  if (result.valid) {
    revokeTrackedBlobUrls();
    _activeBlobUrls = blobUrlsToTrack;

    const scene = sceneData as SceneDocument;
    useDocumentStore.getState().loadScene(scene);
    useDocumentStore.getState().setDirectoryHandle(dirHandle);
  }

  return result;
}
