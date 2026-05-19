import { describe, it, expect } from 'vitest';
import { generateId } from '../../core/utils';

describe('generateId', () => {
  it('should return a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate an ID with at least 12 characters when no prefix', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThanOrEqual(12);
  });

  it('should generate exactly 12 characters by default (no prefix)', () => {
    const id = generateId();
    expect(id.length).toBe(12);
  });

  it('should use only URL-safe characters', () => {
    const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
    for (let i = 0; i < 100; i++) {
      expect(generateId()).toMatch(urlSafeRegex);
    }
  });

  it('should prepend prefix with underscore separator', () => {
    const id = generateId('shape');
    expect(id).toMatch(/^shape_[A-Za-z0-9_-]{12}$/);
  });

  it('should treat empty string prefix as no prefix (falsy)', () => {
    const id = generateId('');
    expect(id).toMatch(/^[A-Za-z0-9_-]{12}$/);
  });

  it('should handle prefix with special chars (underscores and hyphens)', () => {
    const id = generateId('my_prefix-element');
    expect(id).toMatch(/^my_prefix-element_[A-Za-z0-9_-]{12}$/);
  });

  it('should generate 10000 unique IDs without duplicates', () => {
    const ids = new Set<string>();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(count);
  });

  it('should generate 10000 unique IDs with prefix without duplicates', () => {
    const ids = new Set<string>();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      ids.add(generateId('el'));
    }
    expect(ids.size).toBe(count);
  });

  it('should produce IDs that differ from each other', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should work for typical ID generation scenarios (element, layer, group)', () => {
    const elementId = generateId('shape');
    const layerId = generateId('layer');
    const groupId = generateId('group');

    expect(elementId).toMatch(/^shape_[A-Za-z0-9_-]{12}$/);
    expect(layerId).toMatch(/^layer_[A-Za-z0-9_-]{12}$/);
    expect(groupId).toMatch(/^group_[A-Za-z0-9_-]{12}$/);
    expect(elementId).not.toBe(layerId);
    expect(layerId).not.toBe(groupId);
    expect(elementId).not.toBe(groupId);
  });
});
