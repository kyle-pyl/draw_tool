import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSupportedImageFile, importImageFromFile } from '../../io/image-utils';

const trackedUrls: string[] = [];
let urlCounter = 0;

const mockCreateObjectURL = vi.fn((_blob: Blob) => {
  const url = `blob:mock-${++urlCounter}`;
  trackedUrls.push(url);
  return url;
});

const mockRevokeObjectURL = vi.fn((url: string) => {
  const idx = trackedUrls.indexOf(url);
  if (idx >= 0) trackedUrls.splice(idx, 1);
});

describe('isSupportedImageFile', () => {
  it('returns true for PNG files', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    expect(isSupportedImageFile(file)).toBe(true);
  });

  it('returns true for JPEG files', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    expect(isSupportedImageFile(file)).toBe(true);
  });

  it('returns true for SVG files', () => {
    const file = new File([''], 'icon.svg', { type: 'image/svg+xml' });
    expect(isSupportedImageFile(file)).toBe(true);
  });

  it('returns true for GIF files', () => {
    const file = new File([''], 'anim.gif', { type: 'image/gif' });
    expect(isSupportedImageFile(file)).toBe(true);
  });

  it('returns true for WebP files', () => {
    const file = new File([''], 'img.webp', { type: 'image/webp' });
    expect(isSupportedImageFile(file)).toBe(true);
  });

  it('returns true for files with extension but no MIME type', () => {
    const file = new File([''], 'image.png', { type: '' });
    expect(isSupportedImageFile(file)).toBe(true);
  });

  it('returns false for non-image files', () => {
    const file = new File([''], 'doc.pdf', { type: 'application/pdf' });
    expect(isSupportedImageFile(file)).toBe(false);
  });

  it('returns false for text files', () => {
    const file = new File([''], 'readme.txt', { type: 'text/plain' });
    expect(isSupportedImageFile(file)).toBe(false);
  });

  it('returns false for CSV files', () => {
    const file = new File([''], 'data.csv', { type: 'text/csv' });
    expect(isSupportedImageFile(file)).toBe(false);
  });

  it('returns false for JSON files', () => {
    const file = new File([''], 'scene.json', { type: 'application/json' });
    expect(isSupportedImageFile(file)).toBe(false);
  });
});

describe('importImageFromFile', () => {
  beforeEach(() => {
    urlCounter = 0;
    trackedUrls.length = 0;
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
  });

  afterEach(() => {
    for (const url of trackedUrls) {
      // Clean up
    }
    vi.unstubAllGlobals();
  });

  it('returns ElementInput with type image for SVG files', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect width="100%" height="100%" fill="blue"/></svg>';
    const file = new File([svg], 'test.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.type).toBe('image');
    expect(input.layerId).toBe('l1');
    expect(input.name).toBe('test.svg');
    expect(input.src).toMatch(/^blob:mock-/);
    expect(input.originalWidth).toBe(200);
    expect(input.originalHeight).toBe(100);
    expect(input.transform.width).toBe(200);
    expect(input.transform.height).toBe(100);
  });

  it('returns ElementInput for SVG with dimensions parsed from viewBox', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0, 0, 400, 300"><rect width="100%" height="100%"/></svg>';
    const file = new File([svg], 'dims.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.originalWidth).toBe(400);
    expect(input.originalHeight).toBe(300);
  });

  it('sanitizes SVG removing script elements', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><script>alert(1)</script><circle cx="50" cy="50" r="40"/></svg>';
    const file = new File([svg], 'evil.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.type).toBe('image');
    expect(input.originalWidth).toBe(100);
    expect(input.originalHeight).toBe(100);
  });

  it('uses SVG width/height when viewBox is absent', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><rect width="100%" height="100%"/></svg>';
    const file = new File([svg], 'size.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.originalWidth).toBe(300);
    expect(input.originalHeight).toBe(150);
  });

  it('uses default dimensions for SVG without viewBox or size', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>';
    const file = new File([svg], 'default.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.originalWidth).toBe(800);
    expect(input.originalHeight).toBe(600);
  });

  it('scales large images to max initial dimension', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1000"><rect width="100%" height="100%"/></svg>';
    const file = new File([svg], 'large.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.transform.width).toBeLessThanOrEqual(600);
    expect(input.transform.height).toBeLessThanOrEqual(600);
    expect(input.originalWidth).toBe(2000);
    expect(input.originalHeight).toBe(1000);
  });

  it('sets objectFit to contain', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
    const file = new File([svg], 'objfit.svg', { type: 'image/svg+xml' });

    const input = await importImageFromFile(file, 'l1');

    expect(input.objectFit).toBe('contain');
  });

  it('creates blob URLs for each import', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><rect width="100%" height="100%"/></svg>';
    const file = new File([svg], 'a.svg', { type: 'image/svg+xml' });

    const input1 = await importImageFromFile(file, 'l1');
    const input2 = await importImageFromFile(file, 'l1');

    expect(input1.src).not.toBe(input2.src);
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });
});
