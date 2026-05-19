import { describe, it, expect } from 'vitest';
import { validateScene } from '../../core/validator';
import basicScene from '../../../examples/basic/scene.json';

describe('examples/basic/scene.json', () => {
  it('should pass validateScene', () => {
    const result = validateScene(basicScene);
    if (!result.valid) {
      console.error('Validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should have schemaVersion 1.0.0', () => {
    expect((basicScene as Record<string, unknown>).schemaVersion).toBe('1.0.0');
  });

  it('should have exactly 3 layers', () => {
    const layers = (basicScene as Record<string, unknown>).layers as Array<Record<string, unknown>>;
    expect(layers).toHaveLength(3);
    expect(layers.map((l) => l.order)).toEqual([1, 2, 3]);
  });

  it('should have 3 shape elements in layer 1', () => {
    const elements = (basicScene as Record<string, unknown>).elements as Array<Record<string, unknown>>;
    const shapes = elements.filter((e) => e.type === 'shape' && e.layerId === 'l1');
    expect(shapes).toHaveLength(3);
    const shapeKinds = shapes.map((s) => s.shapeKind).sort();
    expect(shapeKinds).toContain('rect');
    expect(shapeKinds).toContain('circle');
    expect(shapeKinds).toContain('polygon');
  });

  it('should have 2 text elements in layer 2', () => {
    const elements = (basicScene as Record<string, unknown>).elements as Array<Record<string, unknown>>;
    const texts = elements.filter((e) => e.type === 'text' && e.layerId === 'l2');
    expect(texts).toHaveLength(2);
  });

  it('should have 1 connector in layer 3', () => {
    const elements = (basicScene as Record<string, unknown>).elements as Array<Record<string, unknown>>;
    const connectors = elements.filter((e) => e.type === 'connector' && e.layerId === 'l3');
    expect(connectors).toHaveLength(1);
  });

  it('should have 1 group containing 2 shapes from layer 1', () => {
    const groups = (basicScene as Record<string, unknown>).groups as Array<Record<string, unknown>>;
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('g1');
    const elementIds = groups[0].elementIds as string[];
    expect(elementIds).toHaveLength(2);
    expect(elementIds).toContain('e1');
    expect(elementIds).toContain('e2');
  });

  it('should have required top-level fields', () => {
    const scene = basicScene as Record<string, unknown>;
    expect(scene.project).toBeDefined();
    expect(scene.canvas).toBeDefined();
    expect(scene.rules).toBeDefined();
    expect(scene.layers).toBeDefined();
    expect(scene.elements).toBeDefined();
    expect(scene.groups).toBeDefined();
  });
});
