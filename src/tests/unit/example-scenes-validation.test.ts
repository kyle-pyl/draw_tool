import { describe, it, expect } from 'vitest';
import { validateScene } from '../../core/validator';
import flowchartScene from '../../../examples/flowchart/scene.json';
import architectureScene from '../../../examples/architecture/scene.json';
import rtlScene from '../../../examples/rtl/scene.json';
import statisticsScene from '../../../examples/statistics/scene.json';
import topologyScene from '../../../examples/topology/scene.json';

describe('examples/flowchart/scene.json', () => {
  it('should pass validateScene', () => {
    const result = validateScene(flowchartScene);
    if (!result.valid) {
      console.error('Flowchart validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('examples/architecture/scene.json', () => {
  it('should pass validateScene', () => {
    const result = validateScene(architectureScene);
    if (!result.valid) {
      console.error('Architecture validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('examples/rtl/scene.json', () => {
  it('should pass validateScene', () => {
    const result = validateScene(rtlScene);
    if (!result.valid) {
      console.error('RTL validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('examples/statistics/scene.json', () => {
  it('should pass validateScene', () => {
    const result = validateScene(statisticsScene);
    if (!result.valid) {
      console.error('Statistics validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('examples/topology/scene.json', () => {
  it('should pass validateScene', () => {
    const result = validateScene(topologyScene);
    if (!result.valid) {
      console.error('Topology validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
