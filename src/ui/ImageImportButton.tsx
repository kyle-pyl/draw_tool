import { useRef, useCallback } from 'react';
import { importImageFromFile } from '../io/image-utils';
import type { ElementInput } from '../core/commands';

export interface ImageImportButtonProps {
  layerId: string;
  onImport: (input: ElementInput) => void;
  onError?: (message: string) => void;
}

export function ImageImportButton({ layerId, onImport, onError }: ImageImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      try {
        const file = files[0];
        const input = await importImageFromFile(file, layerId);
        onImport(input);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import image';
        onError?.(message);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [layerId, onImport, onError],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg,.gif,.webp,image/png,image/jpeg,image/svg+xml,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        className="image-import-btn"
        title="Import Image"
        onClick={handleClick}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      </button>
    </>
  );
}
