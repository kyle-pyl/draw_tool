/**
 * Project file loaders — JSON scene file import via browser file picker.
 */

import { useDocumentStore } from '../core/store';
import { validateScene } from '../core/validator';
import type { SceneDocument } from '../core/types';
import type { ValidationResult } from '../core/errors';
import { failureResult } from '../core/errors';

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
