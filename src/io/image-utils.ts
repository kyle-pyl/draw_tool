/**
 * Image import utilities.
 * Supports importing PNG, JPG, SVG files via file picker or drag-and-drop.
 * SVG files are sanitized before import.
 */

import type { ElementInput } from '../core/commands';
import { sanitizeSvg } from './svg-sanitizer';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

const SUPPORTED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp']);
const SUPPORTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/gif',
  'image/webp',
]);

export function isSupportedImageFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && SUPPORTED_EXTENSIONS.has(ext)) return true;
  return SUPPORTED_MIME_TYPES.has(file.type);
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image dimensions'));
    img.src = url;
  });
}

function getSvgDimensions(svgText: string): { width: number; height: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl = doc.documentElement;

  const viewBox = svgEl.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && parts.every((n) => !isNaN(n))) {
      return { width: parts[2], height: parts[3] };
    }
  }

  const w = parseFloat(svgEl.getAttribute('width') || '0');
  const h = parseFloat(svgEl.getAttribute('height') || '0');
  if (w > 0 && h > 0) return { width: w, height: h };

  return { width: 800, height: 600 };
}

function scaleToFit(width: number, height: number, maxDim: number): { width: number; height: number } {
  const scale = Math.min(1, maxDim / Math.max(width, height, 1));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

const MAX_INITIAL_DIM = 600;

export async function importImageFromFile(
  file: File,
  layerId: string,
): Promise<ElementInput> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const isSvg = ext === 'svg' || file.type === 'image/svg+xml';

  if (isSvg) {
    const svgText = await readFileAsText(file);
    const sanitized = sanitizeSvg(svgText);
    const dims = getSvgDimensions(sanitized);
    const blob = new Blob([sanitized], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const display = scaleToFit(dims.width, dims.height, MAX_INITIAL_DIM);

    return {
      type: 'image',
      layerId,
      name: file.name,
      src: blobUrl,
      originalWidth: dims.width,
      originalHeight: dims.height,
      objectFit: 'contain',
      transform: {
        x: 0,
        y: 0,
        width: display.width,
        height: display.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      style: {
        fill: 'none',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 1,
      },
    };
  }

  const blobUrl = URL.createObjectURL(file);
  const dims = await getImageDimensions(blobUrl);
  const display = scaleToFit(dims.width, dims.height, MAX_INITIAL_DIM);

  return {
    type: 'image',
    layerId,
    name: file.name,
    src: blobUrl,
    originalWidth: dims.width,
    originalHeight: dims.height,
    objectFit: 'contain',
    transform: {
      x: 0,
      y: 0,
      width: display.width,
      height: display.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    style: {
      fill: 'none',
      stroke: 'none',
      strokeWidth: 0,
      opacity: 1,
    },
  };
}
