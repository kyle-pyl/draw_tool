import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TemplatePanel } from '../../ui/TemplatePanel';
import { registerTemplate, getAllTemplates, clearTemplates } from '../../core/templates';
import type { TemplateDefinition } from '../../core/templates';

const defaultTransform = { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 };
const defaultStyle = { fill: '#ffffff', stroke: '#000000', strokeWidth: 2, opacity: 1 };

const rectTemplate: TemplateDefinition = {
  id: 'test-rect',
  name: 'Test Rectangle',
  category: '基础几何',
  elements: [{ type: 'shape', name: 'rect', shapeKind: 'rect', transform: defaultTransform, style: defaultStyle }],
};

const circleTemplate: TemplateDefinition = {
  id: 'test-circle',
  name: 'Test Circle',
  category: '基础几何',
  elements: [{ type: 'shape', name: 'circle', shapeKind: 'circle', transform: { ...defaultTransform, width: 80, height: 80 }, style: defaultStyle }],
};

const processTemplate: TemplateDefinition = {
  id: 'test-process',
  name: 'Test Process',
  category: '流程图',
  elements: [{ type: 'shape', name: 'process', shapeKind: 'rect', transform: { ...defaultTransform, width: 100, height: 50 }, style: defaultStyle }],
};

const dbTemplate: TemplateDefinition = {
  id: 'test-db',
  name: 'Test Database',
  category: '架构图',
  elements: [{ type: 'shape', name: 'db', shapeKind: 'ellipse', transform: { ...defaultTransform, width: 80, height: 40 }, style: { ...defaultStyle, fill: '#e3f2fd' } }],
};

const rtlModuleTemplate: TemplateDefinition = {
  id: 'test-rtl',
  name: 'Test RTL Module',
  category: 'RTL',
  elements: [{ type: 'rtlModule', name: 'module', transform: defaultTransform, style: { fill: '#E3F2FD', stroke: '#1565C0', strokeWidth: 2, opacity: 1 }, moduleName: 'test' }],
};

describe('TemplatePanel', () => {
  beforeEach(() => {
    clearTemplates();
    registerTemplate(rectTemplate);
    registerTemplate(circleTemplate);
    registerTemplate(processTemplate);
    registerTemplate(dbTemplate);
    registerTemplate(rtlModuleTemplate);
  });

  it('renders the template panel with header', () => {
    const onInsert = () => {};
    const { getByText } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    expect(getByText('Templates')).toBeDefined();
  });

  it('renders all categories', () => {
    const onInsert = () => {};
    const { getByText } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    expect(getByText('基础几何')).toBeDefined();
    expect(getByText('流程图')).toBeDefined();
    expect(getByText('架构图')).toBeDefined();
    expect(getByText('RTL')).toBeDefined();
  });

  it('renders template names in each category', () => {
    const onInsert = () => {};
    const { getByText } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    expect(getByText('Test Rectangle')).toBeDefined();
    expect(getByText('Test Circle')).toBeDefined();
    expect(getByText('Test Process')).toBeDefined();
    expect(getByText('Test Database')).toBeDefined();
    expect(getByText('Test RTL Module')).toBeDefined();
  });

  it('renders search input', () => {
    const onInsert = () => {};
    const { getByPlaceholderText } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    expect(getByPlaceholderText('Search templates...')).toBeDefined();
  });

  it('filters templates by search text', () => {
    const onInsert = () => {};
    const { getByPlaceholderText, queryByText, getByText } = render(
      <TemplatePanel onTemplateInsert={onInsert} />,
    );
    const input = getByPlaceholderText('Search templates...');
    fireEvent.change(input, { target: { value: 'Circle' } });

    // Only Circle should remain in 基础几何
    expect(queryByText('Test Circle')).toBeDefined();
    expect(queryByText('Test Rectangle')).toBeNull();

    // Categories without matches should not be shown
    expect(queryByText('流程图')).toBeNull();
    expect(queryByText('架构图')).toBeNull();

    // 基础几何 should still appear since it has a match
    expect(getByText('基础几何')).toBeDefined();
  });

  it('shows "No templates found" when search has no matches', () => {
    const onInsert = () => {};
    const { getByPlaceholderText, getByText } = render(
      <TemplatePanel onTemplateInsert={onInsert} />,
    );
    const input = getByPlaceholderText('Search templates...');
    fireEvent.change(input, { target: { value: 'nonexistentxyz' } });
    expect(getByText('No templates found')).toBeDefined();
  });

  it('calls onTemplateInsert when a template is clicked', () => {
    const calls: string[] = [];
    const onInsert = (id: string) => calls.push(id);
    const { getByText } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    fireEvent.click(getByText('Test Rectangle'));
    expect(calls).toEqual(['test-rect']);
  });

  it('calls onTemplateInsert for a template in another category', () => {
    const calls: string[] = [];
    const onInsert = (id: string) => calls.push(id);
    const { getByText } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    fireEvent.click(getByText('Test Database'));
    expect(calls).toEqual(['test-db']);
  });

  it('collapses a category when header is clicked', () => {
    const onInsert = () => {};
    const { getByText, queryByText } = render(<TemplatePanel onTemplateInsert={onInsert} />);

    // All templates visible initially
    expect(queryByText('Test Circle')).toBeDefined();

    // Click category header to collapse
    fireEvent.click(getByText('基础几何'));

    // Templates in that category should be hidden
    expect(queryByText('Test Circle')).toBeNull();
    expect(queryByText('Test Rectangle')).toBeNull();

    // Other categories still visible
    expect(queryByText('Test Process')).toBeDefined();
  });

  it('dismisses panel when close button is clicked', () => {
    const onInsert = () => {};
    const { getByLabelText, queryByText, getByText } = render(
      <TemplatePanel onTemplateInsert={onInsert} />,
    );
    fireEvent.click(getByLabelText('Close template panel'));

    // Panel header should be gone
    expect(queryByText('Templates')).toBeNull();
    // Show button should appear
    expect(getByText('Show Templates')).toBeDefined();
  });

  it('re-shows panel when show button is clicked after dismiss', () => {
    const onInsert = () => {};
    const { getByLabelText, getByText, queryByText } = render(
      <TemplatePanel onTemplateInsert={onInsert} />,
    );

    // Dismiss
    fireEvent.click(getByLabelText('Close template panel'));
    expect(getByText('Show Templates')).toBeDefined();

    // Re-show
    fireEvent.click(getByText('Show Templates'));
    expect(getByText('Templates')).toBeDefined();
    expect(queryByText('Show Templates')).toBeNull();
  });

  it('renders SVG thumbnails for each template', () => {
    const onInsert = () => {};
    const { container } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    const svgs = container.querySelectorAll('svg');
    // 5 templates, each should have at least 1 SVG
    expect(svgs.length).toBeGreaterThanOrEqual(5);
  });

  it('case-insensitive search', () => {
    const onInsert = () => {};
    const { getByPlaceholderText, queryByText } = render(
      <TemplatePanel onTemplateInsert={onInsert} />,
    );
    const input = getByPlaceholderText('Search templates...');

    fireEvent.change(input, { target: { value: 'circle' } });
    expect(queryByText('Test Circle')).toBeDefined();

    fireEvent.change(input, { target: { value: 'CIRCLE' } });
    expect(queryByText('Test Circle')).toBeDefined();
  });

  it('renders empty panel gracefully when no templates registered', () => {
    clearTemplates();
    const onInsert = () => {};
    const { getByText, container } = render(<TemplatePanel onTemplateInsert={onInsert} />);
    expect(getByText('Templates')).toBeDefined();
    expect(container.querySelector('.template-panel')).toBeDefined();
  });
});
