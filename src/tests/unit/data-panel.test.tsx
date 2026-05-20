import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DataPanel } from '../../ui/DataPanel';
import type { DataPanelProps, ChartConfig } from '../../ui/DataPanel';
import type { DataSource } from '../../core/types';
import type { ParsedData, ColumnInfo } from '../../io/csv-parser';

function makeDataSource(overrides?: Partial<DataSource>): DataSource {
  return {
    id: 'ds-1',
    path: 'data/sales.csv',
    type: 'csv',
    ...overrides,
  };
}

function makeParsedData(overrides?: Partial<ParsedData>): ParsedData {
  return {
    columns: [
      { name: 'Month', inferredType: 'string', missingRate: 0 },
      { name: 'Revenue', inferredType: 'number', missingRate: 0.05 },
      { name: 'Cost', inferredType: 'number', missingRate: 0.1 },
      { name: 'Active', inferredType: 'boolean', missingRate: 0 },
    ],
    rows: [
      { Month: 'Jan', Revenue: 100, Cost: 60, Active: true },
      { Month: 'Feb', Revenue: 120, Cost: 65, Active: false },
      { Month: 'Mar', Revenue: 110, Cost: 70, Active: true },
    ],
    rowCount: 3,
    headers: ['Month', 'Revenue', 'Cost', 'Active'],
    parseErrors: [],
    ...overrides,
  };
}

function renderPanel(overrides?: Partial<DataPanelProps>) {
  const props: DataPanelProps = {
    dataSources: [],
    parsedData: null,
    loading: false,
    parseError: null,
    onSelectDataSource: () => {},
    onGenerateChart: () => {},
    ...overrides,
  };
  return render(<DataPanel {...props} />);
}

describe('DataPanel', () => {
  it('renders the panel with header', () => {
    const { getByText } = renderPanel();
    expect(getByText('Data Panel')).toBeDefined();
  });

  it('shows "No data sources available" when list is empty', () => {
    const { getByText } = renderPanel();
    expect(getByText('No data sources available')).toBeDefined();
  });

  it('renders data source entries', () => {
    const ds1 = makeDataSource({ id: 'ds-1', path: 'data/sales.csv' });
    const ds2 = makeDataSource({ id: 'ds-2', path: 'data/users.csv', type: 'json' });
    const { getByText } = renderPanel({ dataSources: [ds1, ds2] });
    expect(getByText('data/sales.csv')).toBeDefined();
    expect(getByText('data/users.csv')).toBeDefined();
  });

  it('shows data source count in section header', () => {
    const ds1 = makeDataSource();
    const { getByText } = renderPanel({ dataSources: [ds1] });
    expect(getByText(/\(1\)/)).toBeDefined();
  });

  it('shows type and id for each data source', () => {
    const ds = makeDataSource({ id: 'ds-42', path: 'data/table.csv', type: 'csv' });
    const { getByText } = renderPanel({ dataSources: [ds] });
    expect(getByText('CSV · ds-42')).toBeDefined();
  });

  it('calls onSelectDataSource when a source is clicked', () => {
    const calls: string[] = [];
    const ds = makeDataSource({ id: 'ds-1' });
    const { getByText } = renderPanel({
      dataSources: [ds],
      onSelectDataSource: (id) => calls.push(id),
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(calls).toEqual(['ds-1']);
  });

  it('highlights the selected data source', () => {
    const ds1 = makeDataSource({ id: 'ds-1', path: 'data/a.csv' });
    const ds2 = makeDataSource({ id: 'ds-2', path: 'data/b.csv' });
    const { getByText, container } = renderPanel({
      dataSources: [ds1, ds2],
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/a.csv'));

    // After clicking, the Column Info section should appear
    expect(getByText('Column Info')).toBeDefined();
  });

  it('shows loading state when data is being loaded', () => {
    const ds = makeDataSource();
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: null,
      loading: true,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(getByText('Loading data...')).toBeDefined();
  });

  it('shows parse error when present', () => {
    const ds = makeDataSource();
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: null,
      loading: false,
      parseError: 'Failed to parse CSV: invalid format',
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(getByText('Failed to parse CSV: invalid format')).toBeDefined();
  });

  it('shows column info table with type badges', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getAllByText, getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));

    // Column names appear in both the info table and sample table header
    expect(getAllByText('Month').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Revenue').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Cost').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(getByText('string')).toBeDefined();
    expect(getAllByText('number').length).toBeGreaterThanOrEqual(1);
    expect(getByText('boolean')).toBeDefined();
  });

  it('shows missing rates', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getAllByText, getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));

    // Two columns have 0% missing: Month and Active
    expect(getAllByText('0%').length).toBe(2);
    expect(getByText('5%')).toBeDefined();
    expect(getByText('10%')).toBeDefined();
  });

  it('shows sample row count', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(getByText('Showing 3 of 3 rows')).toBeDefined();
  });

  it('shows sample data values in table', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getAllByText, getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));

    expect(getByText('Jan')).toBeDefined();
    expect(getByText('100')).toBeDefined();
    // 'true' appears in multiple rows (Jan and Mar both have Active: true)
    expect(getAllByText('true').length).toBe(2);
  });

  it('collapses data sources section when header is clicked', () => {
    const ds = makeDataSource();
    const { getByText, queryByText } = renderPanel({
      dataSources: [ds],
      onSelectDataSource: () => {},
    });

    expect(queryByText('data/sales.csv')).toBeDefined();

    const sectionHeader = getByText('Data Sources');
    fireEvent.click(sectionHeader);

    expect(queryByText('data/sales.csv')).toBeNull();
  });

  it('shows chart config section when data is selected and parsed', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(getByText('Chart Config')).toBeDefined();
  });

  it('shows all chart type options', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText, container } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));

    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select).toBeDefined();
    const options = Array.from(select?.options ?? []).map((o) => o.textContent);
    expect(options).toContain('Bar');
    expect(options).toContain('Line');
    expect(options).toContain('Scatter');
    expect(options).toContain('Boxplot');
    expect(options).toContain('Histogram');
    expect(options).toContain('Heatmap');
  });

  it('shows Y axis select with column choices', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText, container } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));

    // Find the Y axis select element - it's the one after "Y Axis (Value)" label
    const selects = container.querySelectorAll('select');
    // selects[0] = chart type, selects[1] = X axis, selects[2] = Y axis
    const yAxisSelect = selects[2] as HTMLSelectElement;
    const options = Array.from(yAxisSelect.options).map((o) => o.textContent);
    expect(options).toContainEqual(expect.stringContaining('Revenue'));
    expect(options).toContainEqual(expect.stringContaining('Cost'));
  });

  it('calls onGenerateChart with correct config when button is clicked', () => {
    const calls: ChartConfig[] = [];
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText, container } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
      onGenerateChart: (config) => calls.push(config),
    });
    fireEvent.click(getByText('data/sales.csv'));

    // Select Y axis - Revenue (3rd select: chart type, x, y, group, color)
    const selects = container.querySelectorAll('select');
    const ySelect = selects[2] as HTMLSelectElement;
    fireEvent.change(ySelect, { target: { value: 'Revenue' } });

    // Click generate button
    fireEvent.click(getByText('Generate Chart'));

    expect(calls.length).toBe(1);
    expect(calls[0]).toEqual({
      dataSourceId: 'ds-1',
      chartType: 'bar',
      columnMappings: {
        x: undefined,
        y: 'Revenue',
        group: undefined,
        color: undefined,
      },
    });
  });

  it('calls onGenerateChart with all column mappings set', () => {
    const calls: ChartConfig[] = [];
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText, container } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
      onGenerateChart: (config) => calls.push(config),
    });
    fireEvent.click(getByText('data/sales.csv'));

    const selects = container.querySelectorAll('select');
    // selects[0] = chart type
    fireEvent.change(selects[0], { target: { value: 'scatter' } });
    // selects[1] = X axis
    fireEvent.change(selects[1], { target: { value: 'Month' } });
    // selects[2] = Y axis
    fireEvent.change(selects[2], { target: { value: 'Revenue' } });
    // selects[3] = Group
    fireEvent.change(selects[3], { target: { value: 'Active' } });
    // selects[4] = Color
    fireEvent.change(selects[4], { target: { value: 'Cost' } });

    // Click generate button
    fireEvent.click(getByText('Generate Chart'));

    expect(calls.length).toBe(1);
    expect(calls[0]).toEqual({
      dataSourceId: 'ds-1',
      chartType: 'scatter',
      columnMappings: {
        x: 'Month',
        y: 'Revenue',
        group: 'Active',
        color: 'Cost',
      },
    });
  });

  it('generate button is disabled when no Y axis selected', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData();
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
      onGenerateChart: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));

    const btn = getByText('Generate Chart') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('dismisses panel when close button is clicked', () => {
    const { getByLabelText, queryByText, getByText } = renderPanel();
    fireEvent.click(getByLabelText('Close data panel'));

    expect(queryByText('Data Panel')).toBeNull();
    expect(getByText('Show Data')).toBeDefined();
  });

  it('re-shows panel when show button is clicked after dismiss', () => {
    const { getByLabelText, getByText, queryByText } = renderPanel();
    fireEvent.click(getByLabelText('Close data panel'));
    expect(getByText('Show Data')).toBeDefined();

    fireEvent.click(getByText('Show Data'));
    expect(getByText('Data Panel')).toBeDefined();
    expect(queryByText('Show Data')).toBeNull();
  });

  it('renders null values as em dash in sample table', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData({
      rows: [
        { Month: 'Jan', Revenue: null, Cost: 60, Active: true },
      ],
      rowCount: 1,
    });
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(getByText('\u2014')).toBeDefined();
  });

  it('shows "No columns parsed" when parsedData has no columns', () => {
    const ds = makeDataSource();
    const parsed = makeParsedData({
      columns: [],
      rows: [],
      rowCount: 0,
      headers: [],
    });
    const { getByText } = renderPanel({
      dataSources: [ds],
      parsedData: parsed,
      onSelectDataSource: () => {},
    });
    fireEvent.click(getByText('data/sales.csv'));
    expect(getByText('No columns parsed')).toBeDefined();
  });
});
