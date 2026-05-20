import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerGeometricTemplates,
  geometricTemplateDefinitions,
} from '../../modules/geometric-templates';
import {
  clearTemplates,
  getAllTemplates,
  getTemplate,
  getTemplatesByCategory,
  instantiateTemplate,
} from '../../core/templates';

beforeEach(() => {
  clearTemplates();
});

describe('geometricTemplateDefinitions', () => {
  it('should contain exactly 9 templates', () => {
    expect(geometricTemplateDefinitions).toHaveLength(9);
  });

  it('should have unique IDs for all templates', () => {
    const ids = geometricTemplateDefinitions.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have all templates categorized as 基础几何', () => {
    geometricTemplateDefinitions.forEach((t) => {
      expect(t.category).toBe('基础几何');
    });
  });

  it('should have expected template IDs', () => {
    const ids = geometricTemplateDefinitions.map((t) => t.id).sort();
    expect(ids).toEqual([
      'geom-arrow',
      'geom-bidirectional-arrow',
      'geom-circle',
      'geom-diamond',
      'geom-ellipse',
      'geom-line',
      'geom-pentagram',
      'geom-rect',
      'geom-triangle',
    ]);
  });
});

describe('registerGeometricTemplates', () => {
  it('should register all 9 templates', () => {
    registerGeometricTemplates();
    expect(getAllTemplates()).toHaveLength(9);
  });

  it('should register templates under category 基础几何', () => {
    registerGeometricTemplates();
    expect(getTemplatesByCategory('基础几何')).toHaveLength(9);
  });

  it('should allow re-registration without error', () => {
    registerGeometricTemplates();
    registerGeometricTemplates();
    expect(getAllTemplates()).toHaveLength(9);
  });
});

// ─── Individual template shape kind tests ──────────────────────────────────────

describe('template shape kinds', () => {
  beforeEach(() => {
    registerGeometricTemplates();
  });

  it('rect template should be shapeKind=rect', () => {
    const tpl = getTemplate('geom-rect');
    expect(tpl?.elements[0].shapeKind).toBe('rect');
  });

  it('circle template should be shapeKind=circle', () => {
    const tpl = getTemplate('geom-circle');
    expect(tpl?.elements[0].shapeKind).toBe('circle');
  });

  it('ellipse template should be shapeKind=ellipse', () => {
    const tpl = getTemplate('geom-ellipse');
    expect(tpl?.elements[0].shapeKind).toBe('ellipse');
  });

  it('triangle template should be shapeKind=polygon', () => {
    const tpl = getTemplate('geom-triangle');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('diamond template should be shapeKind=polygon', () => {
    const tpl = getTemplate('geom-diamond');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('pentagram template should be shapeKind=polygon', () => {
    const tpl = getTemplate('geom-pentagram');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('arrow template should be shapeKind=polygon', () => {
    const tpl = getTemplate('geom-arrow');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('bidirectional-arrow template should be shapeKind=polygon', () => {
    const tpl = getTemplate('geom-bidirectional-arrow');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('line template should be shapeKind=path', () => {
    const tpl = getTemplate('geom-line');
    expect(tpl?.elements[0].shapeKind).toBe('path');
  });
});

// ─── Polygon point counts ─────────────────────────────────────────────────────

describe('polygon template points', () => {
  beforeEach(() => {
    registerGeometricTemplates();
  });

  it('triangle should have 3 points', () => {
    const tpl = getTemplate('geom-triangle')!;
    expect(tpl.elements[0].points).toHaveLength(3);
  });

  it('diamond should have 4 points', () => {
    const tpl = getTemplate('geom-diamond')!;
    expect(tpl.elements[0].points).toHaveLength(4);
  });

  it('pentagram should have 10 points', () => {
    const tpl = getTemplate('geom-pentagram')!;
    expect(tpl.elements[0].points).toHaveLength(10);
  });

  it('arrow should have 7 points', () => {
    const tpl = getTemplate('geom-arrow')!;
    expect(tpl.elements[0].points).toHaveLength(7);
  });

  it('bidirectional arrow should have 10 points', () => {
    const tpl = getTemplate('geom-bidirectional-arrow')!;
    expect(tpl.elements[0].points).toHaveLength(10);
  });

  it('line should have pathCommands set', () => {
    const tpl = getTemplate('geom-line')!;
    expect(tpl.elements[0].pathCommands).toBe('M 0,1 L 100,1');
  });
});

// ─── Instantiation tests ──────────────────────────────────────────────────────

describe('instantiation', () => {
  beforeEach(() => {
    registerGeometricTemplates();
  });

  function inst(id: string) {
    return instantiateTemplate(id, { x: 0, y: 0 }, 'l1');
  }

  it('should instantiate rect with correct type', () => {
    const els = inst('geom-rect');
    expect(els).toHaveLength(1);
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('rect');
    }
  });

  it('should instantiate circle with correct type', () => {
    const els = inst('geom-circle');
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('circle');
    }
  });

  it('should instantiate ellipse with correct type', () => {
    const els = inst('geom-ellipse');
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('ellipse');
    }
  });

  it('should instantiate triangle with polygon shapeKind', () => {
    const els = inst('geom-triangle');
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('polygon');
    }
  });

  it('should instantiate diamond with polygon shapeKind', () => {
    const els = inst('geom-diamond');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('polygon');
    }
  });

  it('should instantiate pentagram with correct fill color', () => {
    const els = inst('geom-pentagram');
    expect(els[0].style.fill).toBe('#FFD700');
  });

  it('should instantiate arrow with polygon shapeKind', () => {
    const els = inst('geom-arrow');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('polygon');
    }
  });

  it('should instantiate bidirectional arrow with polygon shapeKind', () => {
    const els = inst('geom-bidirectional-arrow');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('polygon');
    }
  });

  it('should instantiate line with path shapeKind', () => {
    const els = inst('geom-line');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('path');
    }
  });

  it('should apply position offset', () => {
    const els = instantiateTemplate('geom-rect', { x: 50, y: 100 }, 'l1');
    expect(els[0].transform.x).toBe(50);
    expect(els[0].transform.y).toBe(100);
  });

  it('should assign correct layerId', () => {
    const els = inst('geom-diamond');
    expect(els[0].layerId).toBe('l1');
  });

  it('should generate unique IDs for each element', () => {
    const els1 = inst('geom-rect');
    const els2 = inst('geom-rect');
    expect(els1[0].id).not.toBe(els2[0].id);
  });

  it('should generate IDs with element name prefix', () => {
    const els = inst('geom-rect');
    expect(els[0].id).toMatch(/^rect_/);
  });

  it('should instantiate all 9 templates without error', () => {
    const ids = geometricTemplateDefinitions.map((t) => t.id);
    for (const id of ids) {
      expect(() => instantiateTemplate(id, { x: 0, y: 0 }, 'l1')).not.toThrow();
    }
  });

  it('should have correct default visibility and lock state', () => {
    const els = inst('geom-rect');
    expect(els[0].visible).toBe(true);
    expect(els[0].locked).toBe(false);
  });
});
