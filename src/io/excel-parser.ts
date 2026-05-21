/**
 * Excel (.xlsx / .xls) parser — Full-package feature.
 * Dynamically loads SheetJS (xlsx) on demand. In the Lite package the import
 * fails at runtime and the function returns a friendly error in parseErrors.
 */
import type { ParsedData } from './csv-parser';
import { parseCSV } from './csv-parser';

export interface ExcelParseOptions {
  sheetName?: string;
}

/** Cached handle to the dynamically-imported xlsx library. */
let _xlsxCache: typeof import('xlsx') | null | undefined;

async function getXlsx(): Promise<typeof import('xlsx') | null> {
  if (_xlsxCache !== undefined) return _xlsxCache;
  if (__BUNDLE_TYPE__ === 'lite') {
    _xlsxCache = null;
    return null;
  }
  try {
    _xlsxCache = await import('xlsx');
  } catch {
    _xlsxCache = null;
  }
  return _xlsxCache;
}

/** Reset the xlsx cache (used in tests only). */
export function _resetXlsxCacheForTesting(): void {
  _xlsxCache = undefined;
}

/** Directly set the xlsx cache for testing. Use null to simulate Lite package. */
export function _setXlsxCacheForTesting(value: typeof import('xlsx') | null | undefined): void {
  _xlsxCache = value;
}

function noXlsxResult(): ParsedData {
  return {
    columns: [],
    rows: [],
    rowCount: 0,
    headers: [],
    parseErrors: [
      'Excel parsing requires the Full package. SheetJS (xlsx) is not available in the Lite package.',
    ],
  };
}

function parseWithXlsx(
  xlsx: typeof import('xlsx'),
  buffer: ArrayBuffer,
  options?: ExcelParseOptions,
): ParsedData {
  const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });

  const sheetName = options?.sheetName ?? workbook.SheetNames[0];
  if (!sheetName || !workbook.SheetNames.includes(sheetName)) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      headers: [],
      parseErrors: [
        sheetName
          ? `Sheet '${sheetName}' not found in workbook. Available sheets: ${workbook.SheetNames.join(', ')}`
          : 'Workbook contains no sheets.',
      ],
    };
  }

  const worksheet = workbook.Sheets[sheetName];
  const csv = xlsx.utils.sheet_to_csv(worksheet, { FS: ',', blankrows: false });
  return parseCSV(csv);
}

export async function parseExcel(file: File, options?: ExcelParseOptions): Promise<ParsedData> {
  const xlsx = await getXlsx();
  if (!xlsx) return noXlsxResult();

  const buffer = await file.arrayBuffer();
  return parseWithXlsx(xlsx, buffer, options);
}

export async function parseExcelFromBuffer(
  buffer: ArrayBuffer,
  options?: ExcelParseOptions,
): Promise<ParsedData> {
  const xlsx = await getXlsx();
  if (!xlsx) return noXlsxResult();

  return parseWithXlsx(xlsx, buffer, options);
}

export async function getExcelSheetNames(file: File): Promise<string[]> {
  const xlsx = await getXlsx();
  if (!xlsx) return [];

  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });
  return workbook.SheetNames;
}

export async function getExcelSheetNamesFromBuffer(buffer: ArrayBuffer): Promise<string[]> {
  const xlsx = await getXlsx();
  if (!xlsx) return [];

  const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });
  return workbook.SheetNames;
}
