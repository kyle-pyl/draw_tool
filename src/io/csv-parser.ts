import Papa from 'papaparse';

const MISSING_VALUES = new Set(['', 'null', 'NA', 'N/A', 'NaN', 'undefined']);

export interface ColumnInfo {
  name: string;
  inferredType: 'number' | 'string' | 'date' | 'boolean';
  missingRate: number;
}

export interface ParsedData {
  columns: ColumnInfo[];
  rows: Record<string, string | number | boolean | null>[];
  rowCount: number;
  headers: string[];
  parseErrors: string[];
}

export interface CsvParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const s = String(value).trim();
  return MISSING_VALUES.has(s);
}

function inferColumnType(values: string[]): 'number' | 'string' | 'date' | 'boolean' {
  const nonMissing = values.filter((v) => !isMissing(v));
  if (nonMissing.length === 0) return 'string';

  if (nonMissing.every((v) => {
    const lower = v.toLowerCase();
    return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no' || lower === '1' || lower === '0';
  })) {
    return 'boolean';
  }

  if (nonMissing.every((v) => {
    const n = Number(v);
    return v !== '' && !Number.isNaN(n);
  })) {
    return 'number';
  }

  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^\d{4}\/\d{2}\/\d{2}$/,
    /^\d{4}-\d{2}-\d{2}T/,
  ];
  if (nonMissing.every((v) => datePatterns.some((p) => p.test(v.trim())) || !Number.isNaN(Date.parse(v)))) {
    return 'date';
  }

  return 'string';
}

function parseValue(value: string, targetType: 'number' | 'string' | 'date' | 'boolean'): string | number | boolean | null {
  const trimmed = value.trim();
  if (isMissing(trimmed)) return null;

  switch (targetType) {
    case 'number': {
      const n = Number(trimmed);
      return Number.isNaN(n) ? trimmed : n;
    }
    case 'boolean': {
      const lower = trimmed.toLowerCase();
      if (lower === 'true' || lower === 'yes' || lower === '1') return true;
      if (lower === 'false' || lower === 'no' || lower === '0') return false;
      return trimmed;
    }
    case 'date':
      return trimmed;
    default:
      return trimmed;
  }
}

export function parseCSV(content: string, options?: CsvParseOptions): ParsedData {
  const parseErrors: string[] = [];

  const result = Papa.parse(content, {
    header: options?.header ?? true,
    skipEmptyLines: options?.skipEmptyLines ?? true,
    delimiter: options?.delimiter,
    dynamicTyping: false,
    transformHeader: (h: string) => h.trim(),
  });

  for (const err of result.errors) {
    if (err.type === 'Quotes') {
      parseErrors.push(`Row ${err.row ?? '?'}: quoting issue detected`);
    } else if (err.type === 'Delimiter') {
      parseErrors.push(`Row ${err.row ?? '?'}: delimiter issue detected`);
    } else if (err.type === 'FieldMismatch') {
      parseErrors.push(`Row ${err.row ?? '?'}: field count mismatch`);
    } else {
      parseErrors.push(`Row ${err.row ?? '?'}: ${err.message || 'Unknown parse error'}`);
    }
  }

  const headers: string[] = result.meta.fields ?? [];
  if (!options?.header && headers.length === 0) {
    parseErrors.push('No header row found. Set header:true or provide column names.');
  }

  const rawRows = result.data as Record<string, string>[];
  const rowCount = rawRows.length;

  const columns: ColumnInfo[] = headers.map((name) => {
    const values = rawRows.map((row) => row[name] ?? '');
    const missingCount = values.filter((v) => isMissing(v)).length;
    const totalCount = values.length;
    return {
      name,
      inferredType: inferColumnType(values),
      missingRate: totalCount > 0 ? missingCount / totalCount : 0,
    };
  });

  const rows: Record<string, string | number | boolean | null>[] = rawRows.map((row) => {
    const parsed: Record<string, string | number | boolean | null> = {};
    for (const col of columns) {
      const raw = row[col.name] ?? '';
      parsed[col.name] = parseValue(raw, col.inferredType);
    }
    return parsed;
  });

  return { columns, rows, rowCount, headers, parseErrors };
}
