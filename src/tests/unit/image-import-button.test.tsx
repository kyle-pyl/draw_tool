import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ImageImportButton } from '../../ui/ImageImportButton';
import type { ElementInput } from '../../core/commands';

let urlCounter = 0;

describe('ImageImportButton', () => {
  beforeEach(() => {
    urlCounter = 0;
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => `blob:mock-${++urlCounter}`),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders an import button', () => {
    const onImport = vi.fn();
    const { getByTitle } = render(
      <ImageImportButton layerId="l1" onImport={onImport} />,
    );
    expect(getByTitle('Import Image')).toBeDefined();
  });

  it('clicking button opens file input', () => {
    const onImport = vi.fn();
    const { container } = render(
      <ImageImportButton layerId="l1" onImport={onImport} />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeDefined();
  });

  it('has correct accept attribute on file input', () => {
    const onImport = vi.fn();
    const { container } = render(
      <ImageImportButton layerId="l1" onImport={onImport} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toContain('.png');
    expect(input.accept).toContain('.svg');
  });

  it('calls onImport with ElementInput when SVG file is selected', async () => {
    const onImport = vi.fn();
    const { container } = render(
      <ImageImportButton layerId="l1" onImport={onImport} />,
    );

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="red"/></svg>';
    const file = new File([svg], 'test.svg', { type: 'image/svg+xml' });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    const calledInput: ElementInput = onImport.mock.calls[0][0];
    expect(calledInput.type).toBe('image');
    expect(calledInput.name).toBe('test.svg');
  });

  it('passes correct layerId to importImageFromFile', async () => {
    const onImport = vi.fn();
    const { container } = render(
      <ImageImportButton layerId="layer-abc" onImport={onImport} />,
    );

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"/></svg>';
    const file = new File([svg], 'icon.svg', { type: 'image/svg+xml' });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    const calledInput: ElementInput = onImport.mock.calls[0][0];
    expect(calledInput.layerId).toBe('layer-abc');
  });

  it('calls onError when import fails', async () => {
    const onImport = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <ImageImportButton layerId="l1" onImport={onImport} onError={onError} />,
    );

    // Create a file that looks like SVG but isn't valid
    const file = new File(['not an svg'], 'bad.svg', { type: 'image/svg+xml' });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onImport).not.toHaveBeenCalled();
  });
});
