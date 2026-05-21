import { describe, it, expect } from 'vitest';
import { parseCSV } from '../../io/csv-parser';

describe('Integration: CSV Import', () => {
  const csvWithHeader = `name,age,score
Alice,30,95
Bob,25,88
Charlie,35,92
Diana,28,76`;

  const csvWithoutHeader = `Alice,30,95
Bob,25,88
Charlie,35,92`;

  const csvWithMissing = `name,age,score
Alice,30,95
Bob,,88
Charlie,35,
Diana,,`;

  it('parses CSV with header', () => {
    const result = parseCSV(csvWithHeader);
    expect(result.columns.length).toBe(3);
    expect(result.columns[0].name).toBe('name');
    expect(result.columns[1].name).toBe('age');
    expect(result.columns[2].name).toBe('score');
    expect(result.rows.length).toBe(4);
    expect(result.rowCount).toBe(4);
  });

  it('parses CSV without header', () => {
    const result = parseCSV(csvWithoutHeader);
    expect(result.headers.length).toBeGreaterThan(0);
    expect(result.rows.length).toBe(2);
  });

  it('infers numeric types', () => {
    const result = parseCSV(csvWithHeader);
    const ageCol = result.columns.find((c) => c.name === 'age');
    const scoreCol = result.columns.find((c) => c.name === 'score');
    expect(ageCol!.inferredType).toBe('number');
    expect(scoreCol!.inferredType).toBe('number');
  });

  it('infers string types', () => {
    const result = parseCSV(csvWithHeader);
    const nameCol = result.columns.find((c) => c.name === 'name');
    expect(nameCol!.inferredType).toBe('string');
  });

  it('reports missing rate for columns', () => {
    const result = parseCSV(csvWithMissing);
    const ageCol = result.columns.find((c) => c.name === 'age');
    const scoreCol = result.columns.find((c) => c.name === 'score');
    expect(ageCol!.missingRate).toBeGreaterThan(0);
    expect(scoreCol!.missingRate).toBeGreaterThan(0);
  });

  it('returns correct row count', () => {
    const result = parseCSV(csvWithHeader);
    expect(result.rowCount).toBe(4);
  });

  it('returns parseErrors as empty for valid CSV', () => {
    const result = parseCSV(csvWithHeader);
    expect(result.parseErrors.length).toBe(0);
  });

  it('provides data rows as objects', () => {
    const result = parseCSV(csvWithHeader);
    expect(result.rows.length).toBe(4);
    expect(typeof result.rows[0]).toBe('object');
  });

  it('handles empty CSV gracefully', () => {
    const result = parseCSV('');
    expect(result.columns.length).toBeGreaterThanOrEqual(0);
    expect(result.rows.length).toBe(0);
  });

  it('handles single-row CSV', () => {
    const result = parseCSV('x,y\n1,2');
    expect(result.rows.length).toBe(1);
    expect(result.columns.length).toBe(2);
  });
});
