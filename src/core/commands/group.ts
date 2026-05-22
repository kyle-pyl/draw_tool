import type { SceneDocument, ElementGroup } from '../types';
import { generateId } from '../utils';
import { ErrorCode } from '../errors';
import { successResult, failureResult } from '../errors';
import type { SceneCommand } from './base';

// ─── GroupElements Command ─────────────────────────────────────────────────────

export class GroupElementsCommand implements SceneCommand {
  id: string;
  label: string;
  private elementIds: string[];
  private groupName: string;
  private generatedGroupId: string;

  constructor(elementIds: string[], groupName: string, label?: string) {
    this.id = generateId('group');
    this.elementIds = elementIds;
    this.groupName = groupName;
    this.generatedGroupId = generateId('group');
    this.label = label || `Group ${elementIds.length} element(s)`;
  }

  getGroupId(): string {
    return this.generatedGroupId;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    if (this.elementIds.length === 0) {
      return failureResult({
        code: 'SCHEMA_FIELD_TYPE_ERROR',
        message: 'Cannot create a group with no elements',
        severity: 'error',
        suggestion: 'Select at least one element to group',
      });
    }

    const missingIds: string[] = [];
    for (const id of this.elementIds) {
      if (!scene.elements.some((el) => el.id === id)) {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Elements not found: ${missingIds.join(', ')}`,
        severity: 'error',
        elementIds: missingIds,
        suggestion: 'The elements may have been deleted',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const group: ElementGroup = {
      id: this.generatedGroupId,
      name: this.groupName,
      elementIds: [...this.elementIds],
    };

    return {
      ...scene,
      groups: [...scene.groups, group],
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    const groupId = this.generatedGroupId;
    return new UngroupCommand(groupId, `Undo: ${this.label}`);
  }
}

// ─── Ungroup Command ───────────────────────────────────────────────────────────

export class UngroupCommand implements SceneCommand {
  id: string;
  label: string;
  private groupId: string;
  private savedGroup: ElementGroup | null;

  constructor(groupId: string, label?: string) {
    this.id = generateId('ungroup');
    this.groupId = groupId;
    this.label = label || `Ungroup`;
    this.savedGroup = null;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    const group = scene.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Group "${this.groupId}" not found`,
        severity: 'error',
        elementIds: [this.groupId],
        suggestion: 'The group may have already been dissolved',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const group = scene.groups.find((g) => g.id === this.groupId);
    this.savedGroup = group ? { ...group, elementIds: [...group.elementIds] } : null;

    return {
      ...scene,
      groups: scene.groups.filter((g) => g.id !== this.groupId),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    if (!this.savedGroup) return null;

    return new GroupElementsCommand(
      this.savedGroup.elementIds,
      this.savedGroup.name,
      `Undo: ${this.label}`,
    );
  }
}

// ─── AddToGroup Command ────────────────────────────────────────────────────────

export class AddToGroupCommand implements SceneCommand {
  id: string;
  label: string;
  private groupId: string;
  private elementIds: string[];

  constructor(groupId: string, elementIds: string[], label?: string) {
    this.id = generateId('addtogroup');
    this.groupId = groupId;
    this.elementIds = elementIds;
    this.label = label || `Add ${elementIds.length} element(s) to group`;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    const group = scene.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Group "${this.groupId}" not found`,
        severity: 'error',
        elementIds: [this.groupId],
        suggestion: 'The group may have been deleted',
      });
    }

    const missingIds: string[] = [];
    for (const id of this.elementIds) {
      if (!scene.elements.some((el) => el.id === id)) {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Elements not found: ${missingIds.join(', ')}`,
        severity: 'error',
        elementIds: missingIds,
        suggestion: 'The elements may have been deleted',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    return {
      ...scene,
      groups: scene.groups.map((g) => {
        if (g.id !== this.groupId) return g;

        const existingSet = new Set(g.elementIds);
        const newIds = this.elementIds.filter((id) => !existingSet.has(id));

        return {
          ...g,
          elementIds: [...g.elementIds, ...newIds],
        };
      }),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    return new RemoveFromGroupCommand(
      this.groupId,
      this.elementIds,
      `Undo: ${this.label}`,
    );
  }
}

// ─── RemoveFromGroup Command ───────────────────────────────────────────────────

export class RemoveFromGroupCommand implements SceneCommand {
  id: string;
  label: string;
  private groupId: string;
  private elementIds: string[];

  constructor(groupId: string, elementIds: string[], label?: string) {
    this.id = generateId('removefromgroup');
    this.groupId = groupId;
    this.elementIds = elementIds;
    this.label = label || `Remove ${elementIds.length} element(s) from group`;
  }

  validate(scene: SceneDocument): import('../errors').ValidationResult {
    const group = scene.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Group "${this.groupId}" not found`,
        severity: 'error',
        elementIds: [this.groupId],
        suggestion: 'The group may have been deleted',
      });
    }

    const notInGroup: string[] = [];
    for (const id of this.elementIds) {
      if (!group.elementIds.includes(id)) {
        notInGroup.push(id);
      }
    }

    if (notInGroup.length > 0) {
      return failureResult({
        code: ErrorCode.REF_GROUP_NOT_FOUND as string,
        message: `Elements not in group: ${notInGroup.join(', ')}`,
        severity: 'error',
        elementIds: notInGroup,
        suggestion: 'Only elements already in the group can be removed',
      });
    }

    return successResult();
  }

  execute(scene: SceneDocument): SceneDocument {
    const removeSet = new Set(this.elementIds);

    return {
      ...scene,
      groups: scene.groups.map((g) => {
        if (g.id !== this.groupId) return g;

        return {
          ...g,
          elementIds: g.elementIds.filter((id) => !removeSet.has(id)),
        };
      }),
    };
  }

  invert(_scene: SceneDocument): SceneCommand | null {
    return new AddToGroupCommand(
      this.groupId,
      this.elementIds,
      `Undo: ${this.label}`,
    );
  }
}
