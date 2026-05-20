import { describe, it, expect, beforeEach } from 'vitest';
import { SelectionManager } from '../../canvas/selection';
import type { SceneDocument } from '../../core/types';

function createScene(elements: SceneDocument['elements'] = []): SceneDocument {
  return {
    schemaVersion: '1.0.0',
    project: { name: 'Test' },
    canvas: {
      units: 'px',
      background: '#ffffff',
      defaultFont: 'Arial',
      gridSize: 0,
      snapToGrid: false,
    },
    rules: {
      maxLayerCount: 10,
      collisionStrategy: 'bbox',
      hiddenElementsCollide: true,
      lockedElementsCollide: true,
      connectorsExempt: true,
    },
    layers: [{ id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }],
    elements,
    groups: [],
    dataSources: [],
    charts: [],
    templates: [],
    exportPresets: [],
  };
}

function createElement(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    type: 'shape' as const,
    layerId: 'l1',
    name: id,
    transform: { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
    visible: true,
    locked: false,
    shapeKind: 'rect' as const,
    ...overrides,
  };
}

describe('SelectionManager', () => {
  let sm: SelectionManager;

  beforeEach(() => {
    sm = new SelectionManager();
  });

  describe('select', () => {
    it('should select a single element', () => {
      sm.select('e1');
      expect(sm.isSelected('e1')).toBe(true);
    });

    it('should clear previous selection when selecting a new element', () => {
      sm.select('e1');
      sm.select('e2');
      expect(sm.isSelected('e1')).toBe(false);
      expect(sm.isSelected('e2')).toBe(true);
    });

    it('should keep element selected when selecting the same element', () => {
      sm.select('e1');
      sm.select('e1');
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.count).toBe(1);
    });
  });

  describe('toggleSelect', () => {
    it('should add element when not selected', () => {
      sm.toggleSelect('e1');
      expect(sm.isSelected('e1')).toBe(true);
    });

    it('should remove element when already selected', () => {
      sm.select('e1');
      sm.toggleSelect('e1');
      expect(sm.isSelected('e1')).toBe(false);
      expect(sm.count).toBe(0);
    });

    it('should allow multiple selections via toggle', () => {
      sm.toggleSelect('e1');
      sm.toggleSelect('e2');
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.isSelected('e2')).toBe(true);
      expect(sm.count).toBe(2);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      sm.select('e1');
      sm.addToSelection(['e2', 'e3']);
      sm.clearSelection();
      expect(sm.count).toBe(0);
      expect(sm.isSelected('e1')).toBe(false);
    });
  });

  describe('selectAll', () => {
    it('should select all visible unlocked elements', () => {
      const scene = createScene([
        createElement('e1', { visible: true, locked: false }),
        createElement('e2', { visible: true, locked: false }),
      ]);
      sm.selectAll(scene);
      expect(sm.count).toBe(2);
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.isSelected('e2')).toBe(true);
    });

    it('should not select hidden elements', () => {
      const scene = createScene([
        createElement('e1', { visible: false, locked: false }),
        createElement('e2', { visible: true, locked: false }),
      ]);
      sm.selectAll(scene);
      expect(sm.count).toBe(1);
      expect(sm.isSelected('e2')).toBe(true);
    });

    it('should not select locked elements', () => {
      const scene = createScene([
        createElement('e1', { visible: true, locked: true }),
        createElement('e2', { visible: true, locked: false }),
      ]);
      sm.selectAll(scene);
      expect(sm.count).toBe(1);
      expect(sm.isSelected('e2')).toBe(true);
    });
  });

  describe('selectByIds', () => {
    it('should replace current selection with given ids', () => {
      sm.select('e1');
      sm.selectByIds(['e2', 'e3']);
      expect(sm.isSelected('e1')).toBe(false);
      expect(sm.isSelected('e2')).toBe(true);
      expect(sm.isSelected('e3')).toBe(true);
      expect(sm.count).toBe(2);
    });
  });

  describe('addToSelection', () => {
    it('should add ids to existing selection', () => {
      sm.select('e1');
      sm.addToSelection(['e2', 'e3']);
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.isSelected('e2')).toBe(true);
      expect(sm.isSelected('e3')).toBe(true);
      expect(sm.count).toBe(3);
    });
  });

  describe('removeFromSelection', () => {
    it('should remove ids from selection', () => {
      sm.selectByIds(['e1', 'e2', 'e3']);
      sm.removeFromSelection(['e2']);
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.isSelected('e2')).toBe(false);
      expect(sm.isSelected('e3')).toBe(true);
      expect(sm.count).toBe(2);
    });
  });

  describe('isSelected', () => {
    it('should return false for unselected elements', () => {
      expect(sm.isSelected('unknown')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count', () => {
      expect(sm.count).toBe(0);
      sm.select('e1');
      expect(sm.count).toBe(1);
      sm.toggleSelect('e2');
      expect(sm.count).toBe(2);
      sm.clearSelection();
      expect(sm.count).toBe(0);
    });
  });

  describe('getSelectedElements', () => {
    it('should return selected elements from scene', () => {
      const scene = createScene([
        createElement('e1'),
        createElement('e2'),
        createElement('e3'),
      ]);
      sm.selectByIds(['e1', 'e3']);
      const selected = sm.getSelectedElements(scene);
      expect(selected).toHaveLength(2);
      expect(selected.map((el) => el.id).sort()).toEqual(['e1', 'e3']);
    });

    it('should return empty array when nothing selected', () => {
      const scene = createScene([createElement('e1')]);
      expect(sm.getSelectedElements(scene)).toEqual([]);
    });
  });

  describe('selectedIds', () => {
    it('should return a read-only view of selected ids', () => {
      sm.select('e1');
      expect(sm.selectedIds.has('e1')).toBe(true);
      expect(sm.selectedIds.size).toBe(1);
    });
  });

  describe('selectGroup', () => {
    it('should select all elements in a group', () => {
      const scene = createScene([
        createElement('e1'),
        createElement('e2'),
        createElement('e3'),
      ]);
      sm.selectGroup({ id: 'g1', name: 'G', elementIds: ['e1', 'e3'] });
      expect(sm.count).toBe(2);
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.isSelected('e2')).toBe(false);
      expect(sm.isSelected('e3')).toBe(true);
    });

    it('should clear previous selection when selecting a group', () => {
      sm.select('e2');
      sm.selectGroup({ id: 'g1', name: 'G', elementIds: ['e1'] });
      expect(sm.isSelected('e2')).toBe(false);
      expect(sm.count).toBe(1);
    });
  });

  describe('selectGroupByName', () => {
    it('should select all elements in a named group from scene', () => {
      const scene = createScene([
        createElement('e1'),
        createElement('e2'),
      ]);
      scene.groups = [{ id: 'g1', name: 'MyGroup', elementIds: ['e1', 'e2'] }];

      const result = sm.selectGroupByName(scene, 'MyGroup');
      expect(result).toBe(true);
      expect(sm.count).toBe(2);
      expect(sm.isSelected('e1')).toBe(true);
      expect(sm.isSelected('e2')).toBe(true);
    });

    it('should return false when group not found', () => {
      const scene = createScene([]);
      const result = sm.selectGroupByName(scene, 'Nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getGroupsForSelected', () => {
    it('should return groups that contain any selected element', () => {
      const scene = createScene([
        createElement('e1'),
        createElement('e2'),
        createElement('e3'),
      ]);
      scene.groups = [
        { id: 'g1', name: 'Group A', elementIds: ['e1', 'e2'] },
        { id: 'g2', name: 'Group B', elementIds: ['e3'] },
      ];

      sm.selectByIds(['e1', 'e3']);
      const groups = sm.getGroupsForSelected(scene);
      expect(groups).toHaveLength(2);
      expect(groups[0].name).toBe('Group A');
      expect(groups[1].name).toBe('Group B');
    });

    it('should return empty array when no selected elements are in any group', () => {
      const scene = createScene([
        createElement('e1'),
      ]);
      scene.groups = [{ id: 'g1', name: 'G', elementIds: ['e2'] }];
      sm.select('e1');
      expect(sm.getGroupsForSelected(scene)).toEqual([]);
    });
  });
});
