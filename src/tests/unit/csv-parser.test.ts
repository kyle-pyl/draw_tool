import { describe, it, expect } from 'vitest';
import { parseCSV } from '../../io/csv-parser';
import type { ParsedData, ColumnInfo } from '../../io/csv-parser';

describe('parseCSV', () => {
  describe('basic parsing', () => {
    it('parses CSV with headers', () => {
      const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['name', 'age', 'city']);
      expect(result.rowCount).toBe(2);
      expect(result.rows).toHaveLength(2);
    });

    it('parses CSV without headers', () => {
      const csv = 'Alice,30,NYC\nBob,25,LA';
      const result = parseCSV(csv, { header: false });
      expect(result.rowCount).toBe(2);
      expect(result.headers).toEqual([]);
    });

    it('parses empty CSV', () => {
      const csv = '';
      const result = parseCSV(csv);
      expect(result.rowCount).toBe(0);
      expect(result.headers).toEqual([]);
    });

    it('parses CSV with only headers', () => {
      const csv = 'name,age,city';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['name', 'age', 'city']);
      expect(result.rowCount).toBe(0);
    });

    it('skips empty lines', () => {
      const csv = 'name,age\nAlice,30\n\nBob,25\n';
      const result = parseCSV(csv);
      expect(result.rowCount).toBe(2);
    });

    it('returns parseErrors as empty array for valid CSV', () => {
      const csv = 'a,b\n1,2';
      const result = parseCSV(csv);
      expect(result.parseErrors).toEqual([]);
    });
  });

  describe('type inference - number', () => {
    it('infers integer column as number', () => {
      const csv = 'x,y\n10,20\n30,40';
      const result = parseCSV(csv);
      expect(result.columns.find((c) => c.name === 'x')?.inferredType).toBe('number');
      expect(result.columns.find((c) => c.name === 'y')?.inferredType).toBe('number');
    });

    it('infers float column as number', () => {
      const csv = 'val\n1.5\n3.14\n2.0';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('number');
    });

    it('infers negative numbers as number', () => {
      const csv = 'temp\n-5\n-10\n3';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('number');
    });

    it('parses number values correctly', () => {
      const csv = 'count\n42\n100';
      const result = parseCSV(csv);
      expect(result.rows[0].count).toBe(42);
      expect(result.rows[1].count).toBe(100);
    });
  });

  describe('type inference - boolean', () => {
    it('infers true/false column as boolean', () => {
      const csv = 'active\ntrue\nfalse\ntrue';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('boolean');
      expect(result.rows[0].active).toBe(true);
      expect(result.rows[1].active).toBe(false);
    });

    it('infers yes/no column as boolean', () => {
      const csv = 'enabled\nyes\nno\nyes';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('boolean');
      expect(result.rows[0].enabled).toBe(true);
      expect(result.rows[1].enabled).toBe(false);
    });

    it('infers 1/0 column as boolean', () => {
      const csv = 'flag\n1\n0\n1';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('boolean');
      expect(result.rows[0].flag).toBe(true);
      expect(result.rows[1].flag).toBe(false);
    });
  });

  describe('type inference - date', () => {
    it('infers ISO date column as date', () => {
      const csv = 'date\n2024-01-15\n2024-02-20\n2024-03-10';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('date');
    });

    it('infers slash date column as date', () => {
      const csv = 'date\n01/15/2024\n02/20/2024';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('date');
    });

    it('infers ISO datetime column as date', () => {
      const csv = 'timestamp\n2024-01-15T10:30:00\n2024-01-16T11:00:00';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('date');
    });
  });

  describe('type inference - string', () => {
    it('infers mixed column as string', () => {
      const csv = 'name\nAlice\n100\nBob';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('string');
    });

    it('infers text column as string', () => {
      const csv = 'label\nHigh\nMedium\nLow';
      const result = parseCSV(csv);
      expect(result.columns[0].inferredType).toBe('string');
    });
  });

  describe('missing value detection', () => {
    it('detects empty string as missing', () => {
      const csv = 'name,value\nAlice,10\nBob,\n,30';
      const result = parseCSV(csv);
      const valueCol = result.columns.find((c) => c.name === 'value')!;
      expect(valueCol.missingRate).toBeCloseTo(1 / 3);
      expect(result.rows[1].value).toBeNull();
    });

    it('detects NA as missing', () => {
      const csv = 'score\n100\nNA\n200';
      const result = parseCSV(csv);
      expect(result.columns[0].missingRate).toBeCloseTo(1 / 3);
      expect(result.rows[1].score).toBeNull();
    });

    it('detects N/A as missing', () => {
      const csv = 'score\n100\nN/A\n200';
      const result = parseCSV(csv);
      expect(result.columns[0].missingRate).toBeCloseTo(1 / 3);
      expect(result.rows[1].score).toBeNull();
    });

    it('detects null as missing', () => {
      const csv = 'x\n1\nnull\n3';
      const result = parseCSV(csv);
      expect(result.columns[0].missingRate).toBeCloseTo(1 / 3);
    });

    it('return zero missingRate when no missing values', () => {
      const csv = 'x\n1\n2\n3';
      const result = parseCSV(csv);
      expect(result.columns[0].missingRate).toBe(0);
    });

    it('return 1.0 missingRate when all values missing', () => {
      const csv = 'x\nNA\nN/A\n';
      const result = parseCSV(csv);
      expect(result.columns[0].missingRate).toBe(1);
    });
  });

  describe('custom delimiter', () => {
    it('parses tab-delimited CSV', () => {
      const csv = 'name\tage\nAlice\t30\nBob\t25';
      const result = parseCSV(csv, { delimiter: '\t' });
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.rowCount).toBe(2);
    });

    it('parses semicolon-delimited CSV', () => {
      const csv = 'name;age\nAlice;30\nBob;25';
      const result = parseCSV(csv, { delimiter: ';' });
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.rowCount).toBe(2);
    });
  });

  describe('whitespace handling', () => {
    it('trims header whitespace', () => {
      const csv = '  name  ,  age  \nAlice,30';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['name', 'age']);
    });
  });

  describe('integration with example CSV', () => {
    it('correctly parses the sample.csv data', () => {
      const csv = `category,value,count,label
Electronics,12500,42,High
Furniture,8700,31,Medium
Clothing,5600,28,Low
Food,4300,55,Medium
Books,2100,19,Low
Sports,9800,36,High
Toys,3400,24,Medium
Automotive,15600,47,High
Health,7200,33,Medium
Garden,2900,15,Low`;
      const result = parseCSV(csv);

      expect(result.headers).toEqual(['category', 'value', 'count', 'label']);
      expect(result.rowCount).toBe(10);
      expect(result.columns).toHaveLength(4);
      expect(result.parseErrors).toEqual([]);

      const categoryCol = result.columns.find((c) => c.name === 'category')!;
      expect(categoryCol.inferredType).toBe('string');
      expect(categoryCol.missingRate).toBe(0);

      const valueCol = result.columns.find((c) => c.name === 'value')!;
      expect(valueCol.inferredType).toBe('number');
      expect(valueCol.missingRate).toBe(0);

      const countCol = result.columns.find((c) => c.name === 'count')!;
      expect(countCol.inferredType).toBe('number');
      expect(countCol.missingRate).toBe(0);

      const labelCol = result.columns.find((c) => c.name === 'label')!;
      expect(labelCol.inferredType).toBe('string');
      expect(labelCol.missingRate).toBe(0);

      expect(result.rows[0].category).toBe('Electronics');
      expect(result.rows[0].value).toBe(12500);
      expect(result.rows[0].count).toBe(42);
      expect(result.rows[0].label).toBe('High');

      expect(result.rows[9].category).toBe('Garden');
      expect(result.rows[9].value).toBe(2900);
    });
  });
});
