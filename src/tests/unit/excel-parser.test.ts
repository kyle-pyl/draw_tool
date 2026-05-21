import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  _resetXlsxCacheForTesting,
  _setXlsxCacheForTesting,
} from '../../io/excel-parser';

// ---------------------------------------------------------------------------
// Mock File.prototype.arrayBuffer — not available in jsdom
// ---------------------------------------------------------------------------
const _arrayBufferMock = vi.fn(() => Promise.resolve(new ArrayBuffer(8)));
Object.defineProperty(File.prototype, 'arrayBuffer', {
  configurable: true,
  writable: true,
  value: _arrayBufferMock,
});

// ---------------------------------------------------------------------------
// Mutable state for the xlsx mock — plain variables so beforeEach can tweak
// ---------------------------------------------------------------------------
let _xlsxAvailable = true;
let _sheetCsv = '';
let _sheetNames: string[] = ['Employees'];

// ---------------------------------------------------------------------------
// Mock the xlsx library (hoisted via vi.mock; factory re-evaluated per import)
// ---------------------------------------------------------------------------
vi.mock('xlsx', () => {
  if (!_xlsxAvailable) {
    throw new Error('Cannot find module xlsx');
  }
  return {
    read(
      _data: Uint8Array,
      _opts: Record<string, unknown>,
    ) {
      const sheets: Record<string, unknown> = {};
      for (const name of _sheetNames) {
        sheets[name] = {};
      }
      return { SheetNames: [..._sheetNames], Sheets: sheets };
    },
    utils: {
      sheet_to_csv(
        _worksheet: unknown,
        _opts: Record<string, unknown>,
      ): string {
        return _sheetCsv;
      },
    },
  };
});

// ---------------------------------------------------------------------------
// Helper to reload the module-under-test after changing mock state
// ---------------------------------------------------------------------------
async function reloadParser() {
  _resetXlsxCacheForTesting();
  const mod = await import('../../io/excel-parser');
  return mod;
}

describe('parseExcel (with xlsx available)', () => {
  beforeEach(async () => {
    _xlsxAvailable = true;
    _sheetNames = ['Employees'];
    _sheetCsv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    _arrayBufferMock.mockResolvedValue(new ArrayBuffer(8));
    _resetXlsxCacheForTesting();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parses an Excel file and returns ParsedData', async () => {
    const { parseExcel } = await reloadParser();
    const file = new File(['dummy'], 'test.xlsx');

    const result = await parseExcel(file);

    expect(result.headers).toEqual(['name', 'age', 'city']);
    expect(result.rowCount).toBe(2);
    expect(result.rows).toHaveLength(2);
    expect(result.parseErrors).toEqual([]);
    expect(result.columns).toHaveLength(3);
  });

  it('parses Excel from ArrayBuffer', async () => {
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer);

    expect(result.headers).toEqual(['name', 'age', 'city']);
    expect(result.rowCount).toBe(2);
    expect(result.parseErrors).toEqual([]);
  });

  it('parses Excel with a specific sheet name', async () => {
    _sheetNames = ['Data', 'Summary'];
    _sheetCsv = 'col1,col2\nx,1\ny,2';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer, {
      sheetName: 'Summary',
    });

    expect(result.headers).toEqual(['col1', 'col2']);
    expect(result.rowCount).toBe(2);
  });

  it('returns error when requested sheet does not exist', async () => {
    _sheetNames = ['Sheet1'];
    _sheetCsv = '';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer, {
      sheetName: 'NonExistent',
    });

    expect(result.parseErrors).toHaveLength(1);
    expect(result.parseErrors[0]).toContain('NonExistent');
    expect(result.parseErrors[0]).toContain('Sheet1');
  });

  it('returns error when workbook contains no sheets', async () => {
    _sheetNames = [];
    _sheetCsv = '';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer);

    expect(result.parseErrors).toHaveLength(1);
    expect(result.parseErrors[0]).toContain('no sheets');
  });

  it('infers column types correctly (via CSV parser)', async () => {
    _sheetNames = ['Data'];
    _sheetCsv = 'name,score,active\nalice,95,true\nbob,87,false';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer);

    const nameCol = result.columns.find((c) => c.name === 'name');
    const scoreCol = result.columns.find((c) => c.name === 'score');
    const activeCol = result.columns.find((c) => c.name === 'active');

    expect(nameCol?.inferredType).toBe('string');
    expect(scoreCol?.inferredType).toBe('number');
    expect(activeCol?.inferredType).toBe('boolean');
  });

  it('handles missing values correctly (via CSV parser)', async () => {
    _sheetNames = ['Data'];
    _sheetCsv = 'value\n100\nNA\n200';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer);

    expect(result.columns[0].missingRate).toBeCloseTo(1 / 3);
    expect(result.rows[1].value).toBeNull();
  });

  it('handles empty Excel data', async () => {
    _sheetNames = ['Sheet1'];
    _sheetCsv = 'header\n';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer);

    expect(result.rowCount).toBe(0);
    expect(result.columns).toHaveLength(1);
  });

  it('uses the first sheet by default when no sheetName specified', async () => {
    _sheetNames = ['FirstSheet', 'SecondSheet'];
    _sheetCsv = 'x,y\n1,2\n3,4';
    const { parseExcelFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const result = await parseExcelFromBuffer(buffer);
    expect(result.headers).toEqual(['x', 'y']);
    expect(result.rowCount).toBe(2);
  });
});

describe('parseExcel (xlsx not available — Lite package)', () => {
  beforeEach(() => {
    _xlsxAvailable = true;
    _arrayBufferMock.mockResolvedValue(new ArrayBuffer(8));
  });

  it('returns friendly error in parseErrors for parseExcel', async () => {
    const { parseExcel } = await reloadParser();
    // Simulate Lite package by setting the cache to null (simulating failed import)
    _setXlsxCacheForTesting(null);
    const file = new File(['dummy'], 'test.xlsx');

    const result = await parseExcel(file);

    expect(result.columns).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.parseErrors).toHaveLength(1);
    expect(result.parseErrors[0]).toContain('Full package');
    expect(result.parseErrors[0]).toContain('Lite package');
  });

  it('returns friendly error for parseExcelFromBuffer', async () => {
    const { parseExcelFromBuffer } = await reloadParser();
    _setXlsxCacheForTesting(null);

    const result = await parseExcelFromBuffer(new ArrayBuffer(8));

    expect(result.parseErrors).toHaveLength(1);
    expect(result.parseErrors[0]).toContain('Full package');
  });
});

describe('getExcelSheetNames', () => {
  beforeEach(() => {
    _xlsxAvailable = true;
    _sheetNames = ['Sheet1', 'Summary', 'Raw Data'];
    _sheetCsv = '';
    _arrayBufferMock.mockResolvedValue(new ArrayBuffer(8));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns all sheet names from a File', async () => {
    const { getExcelSheetNames } = await reloadParser();
    const file = new File(['dummy'], 'test.xlsx');

    const names = await getExcelSheetNames(file);
    expect(names).toEqual(['Sheet1', 'Summary', 'Raw Data']);
  });

  it('returns sheet names from an ArrayBuffer', async () => {
    const { getExcelSheetNamesFromBuffer } = await reloadParser();
    const buffer = new ArrayBuffer(8);

    const names = await getExcelSheetNamesFromBuffer(buffer);
    expect(names).toEqual(['Sheet1', 'Summary', 'Raw Data']);
  });

  it('returns empty array in Lite package', async () => {
    const { getExcelSheetNames } = await reloadParser();
    _setXlsxCacheForTesting(null);
    const file = new File(['dummy'], 'test.xlsx');

    const names = await getExcelSheetNames(file);
    expect(names).toEqual([]);
  });
});
