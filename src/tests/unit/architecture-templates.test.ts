import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerArchitectureTemplates,
  architectureTemplateDefinitions,
} from '../../modules/architecture-templates';
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

describe('architectureTemplateDefinitions', () => {
  it('should contain exactly 8 templates', () => {
    expect(architectureTemplateDefinitions).toHaveLength(8);
  });

  it('should have unique IDs for all templates', () => {
    const ids = architectureTemplateDefinitions.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have all templates categorized as 架构图', () => {
    architectureTemplateDefinitions.forEach((t) => {
      expect(t.category).toBe('架构图');
    });
  });

  it('should have expected template IDs', () => {
    const ids = architectureTemplateDefinitions.map((t) => t.id).sort();
    expect(ids).toEqual([
      'arch-cache',
      'arch-client',
      'arch-cloud',
      'arch-database',
      'arch-gateway',
      'arch-lb',
      'arch-mq',
      'arch-service',
    ]);
  });
});

describe('registerArchitectureTemplates', () => {
  it('should register all 8 templates', () => {
    registerArchitectureTemplates();
    expect(getAllTemplates()).toHaveLength(8);
  });

  it('should register templates under category 架构图', () => {
    registerArchitectureTemplates();
    expect(getTemplatesByCategory('架构图')).toHaveLength(8);
  });

  it('should allow re-registration without error', () => {
    registerArchitectureTemplates();
    registerArchitectureTemplates();
    expect(getAllTemplates()).toHaveLength(8);
  });
});

// ─── Template shape kind / element type tests ──────────────────────────────────

describe('template element types', () => {
  beforeEach(() => {
    registerArchitectureTemplates();
  });

  it('service should have shapeKind=rect', () => {
    const tpl = getTemplate('arch-service');
    expect(tpl?.elements[0].shapeKind).toBe('rect');
  });

  it('database should have shapeKind=path', () => {
    const tpl = getTemplate('arch-database');
    expect(tpl?.elements[0].shapeKind).toBe('path');
  });

  it('cache should have shapeKind=polygon', () => {
    const tpl = getTemplate('arch-cache');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('message queue should have 3 rect elements', () => {
    const tpl = getTemplate('arch-mq');
    expect(tpl?.elements).toHaveLength(3);
    expect(tpl?.elements[0].shapeKind).toBe('rect');
    expect(tpl?.elements[1].shapeKind).toBe('rect');
    expect(tpl?.elements[2].shapeKind).toBe('rect');
  });

  it('gateway should have shapeKind=polygon', () => {
    const tpl = getTemplate('arch-gateway');
    expect(tpl?.elements[0].shapeKind).toBe('polygon');
  });

  it('load balancer should have 1 circle + 4 arrow polygons', () => {
    const tpl = getTemplate('arch-lb');
    expect(tpl?.elements).toHaveLength(5);
    expect(tpl!.elements[0].shapeKind).toBe('circle');
    expect(tpl!.elements[1].shapeKind).toBe('polygon');
  });

  it('cloud should have container type', () => {
    const tpl = getTemplate('arch-cloud');
    expect(tpl?.elements[0].type).toBe('container');
  });

  it('client should have 6 elements', () => {
    const tpl = getTemplate('arch-client');
    expect(tpl?.elements).toHaveLength(6);
  });
});

// ─── Polygon point counts ─────────────────────────────────────────────────────

describe('polygon element points', () => {
  beforeEach(() => {
    registerArchitectureTemplates();
  });

  it('cache lightning bolt should have 7 points', () => {
    const tpl = getTemplate('arch-cache')!;
    expect(tpl.elements[0].points).toHaveLength(7);
  });

  it('gateway hexagon should have 6 points', () => {
    const tpl = getTemplate('arch-gateway')!;
    expect(tpl.elements[0].points).toHaveLength(6);
  });

  it('database should have pathCommands set', () => {
    const tpl = getTemplate('arch-database')!;
    expect(tpl.elements[0].pathCommands).toBeTruthy();
    expect(tpl.elements[0].pathCommands).toContain('A 40,18');
  });
});

// ─── Instantiation tests ──────────────────────────────────────────────────────

describe('instantiation', () => {
  beforeEach(() => {
    registerArchitectureTemplates();
  });

  function inst(id: string) {
    return instantiateTemplate(id, { x: 0, y: 0 }, 'l1');
  }

  it('should instantiate service with correct type and color', () => {
    const els = inst('arch-service');
    expect(els).toHaveLength(1);
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('rect');
    }
    expect(els[0].style.fill).toBe('#5B9BD5');
  });

  it('should instantiate database with correct type', () => {
    const els = inst('arch-database');
    expect(els).toHaveLength(1);
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('path');
    }
    expect(els[0].style.fill).toBe('#5B9BD5');
  });

  it('should instantiate cache with polygon shape', () => {
    const els = inst('arch-cache');
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('polygon');
    }
    expect(els[0].style.fill).toBe('#F5A623');
  });

  it('should instantiate message queue with 3 elements', () => {
    const els = inst('arch-mq');
    expect(els).toHaveLength(3);
    els.forEach((el) => {
      expect(el.type).toBe('shape');
    });
  });

  it('should instantiate gateway with hexagon shape', () => {
    const els = inst('arch-gateway');
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('polygon');
    }
    expect(els[0].style.fill).toBe('#7B68EE');
  });

  it('should instantiate load balancer with 5 elements', () => {
    const els = inst('arch-lb');
    expect(els).toHaveLength(5);
    expect(els[0].type).toBe('shape');
    if (els[0].type === 'shape') {
      expect(els[0].shapeKind).toBe('circle');
    }
  });

  it('should instantiate cloud as container type', () => {
    const els = inst('arch-cloud');
    expect(els).toHaveLength(1);
    expect(els[0].type).toBe('container');
    if (els[0].type === 'container') {
      expect(els[0].containerLabel).toBe('云区域');
    }
    expect(els[0].transform.width).toBe(400);
    expect(els[0].transform.height).toBe(200);
    expect(els[0].style.strokeDasharray).toBe('8,4');
  });

  it('should instantiate client with 6 elements (frame + titlebar + dots + address)', () => {
    const els = inst('arch-client');
    expect(els).toHaveLength(6);
    expect(els[0].type).toBe('shape');
    expect(els[1].type).toBe('shape');
    expect(els[2].type).toBe('shape');
    expect(els[3].type).toBe('shape');
    expect(els[4].type).toBe('shape');
    expect(els[5].type).toBe('shape');
  });

  it('should apply position offset', () => {
    const els = instantiateTemplate('arch-service', { x: 50, y: 100 }, 'l1');
    expect(els[0].transform.x).toBe(50);
    expect(els[0].transform.y).toBe(100);
  });

  it('should assign correct layerId', () => {
    const els = inst('arch-gateway');
    expect(els[0].layerId).toBe('l1');
  });

  it('should generate unique IDs for each element', () => {
    const els1 = inst('arch-service');
    const els2 = inst('arch-service');
    expect(els1[0].id).not.toBe(els2[0].id);
  });

  it('should generate IDs with element name prefix', () => {
    const els = inst('arch-service');
    expect(els[0].id).toMatch(/^service_/);
  });

  it('should instantiate all 8 templates without error', () => {
    const ids = architectureTemplateDefinitions.map((t) => t.id);
    for (const id of ids) {
      expect(() => instantiateTemplate(id, { x: 0, y: 0 }, 'l1')).not.toThrow();
    }
  });

  it('should have correct default visibility and lock state', () => {
    const els = inst('arch-service');
    expect(els[0].visible).toBe(true);
    expect(els[0].locked).toBe(false);
  });
});

// ─── Multi-element template ID uniqueness ──────────────────────────────────────

describe('multi-element ID uniqueness', () => {
  beforeEach(() => {
    registerArchitectureTemplates();
  });

  it('message queue elements should have unique IDs', () => {
    const els = instantiateTemplate('arch-mq', { x: 0, y: 0 }, 'l1');
    const ids = new Set(els.map((e) => e.id));
    expect(ids.size).toBe(3);
  });

  it('load balancer elements should have unique IDs', () => {
    const els = instantiateTemplate('arch-lb', { x: 0, y: 0 }, 'l1');
    const ids = new Set(els.map((e) => e.id));
    expect(ids.size).toBe(5);
  });

  it('client elements should have unique IDs', () => {
    const els = instantiateTemplate('arch-client', { x: 0, y: 0 }, 'l1');
    const ids = new Set(els.map((e) => e.id));
    expect(ids.size).toBe(6);
  });
});

// ─── Three-tier architecture scenario ──────────────────────────────────────────

describe('three-tier architecture scenario', () => {
  beforeEach(() => {
    registerArchitectureTemplates();
  });

  it('should be able to compose a typical 3-tier architecture diagram', () => {
    const web = instantiateTemplate('arch-service', { x: 50, y: 50 }, 'tier-web');
    expect(web).toHaveLength(1);
    expect(web[0].type).toBe('shape');

    const app = instantiateTemplate('arch-service', { x: 50, y: 150 }, 'tier-app');
    expect(app).toHaveLength(1);

    const db = instantiateTemplate('arch-database', { x: 60, y: 250 }, 'tier-data');
    expect(db).toHaveLength(1);

    const client = instantiateTemplate('arch-client', { x: 50, y: 350 }, 'tier-client');
    expect(client).toHaveLength(6);

    const lb = instantiateTemplate('arch-lb', { x: 200, y: 50 }, 'tier-lb');
    expect(lb).toHaveLength(5);

    const cloud = instantiateTemplate('arch-cloud', { x: 30, y: 30 }, 'tier-cloud');
    expect(cloud).toHaveLength(1);
    expect(cloud[0].type).toBe('container');
  });
});
