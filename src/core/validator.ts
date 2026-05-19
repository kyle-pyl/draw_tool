/**
 * Scene validation — hand-written structural schema checks.
 * No external dependencies (Zod, Ajv) to keep the Lite bundle small.
 */

import type { SceneDocument } from './types';
import { ErrorCode } from './errors';
import type { ValidationError, ValidationResult } from './errors';
import { successResult, failureResult } from './errors';

const VALID_ELEMENT_TYPES = new Set([
  'shape',
  'text',
  'image',
  'connector',
  'chart',
  'container',
  'rtlModule',
  'rtlPort',
  'mindNode',
  'topologyNode',
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function makeError(
  code: ErrorCode,
  message: string,
  extra?: Partial<Pick<ValidationError, 'layerIds' | 'elementIds' | 'suggestion'>>,
): ValidationError {
  return {
    code: code as string,
    message,
    severity: 'error',
    ...extra,
  };
}

function validateRoot(data: unknown): { errors: ValidationError[]; isObject: boolean } {
  const errors: ValidationError[] = [];

  if (!isObject(data)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, 'Root value must be an object'));
    return { errors, isObject: false };
  }

  if (!('schemaVersion' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "schemaVersion"'));
  } else if (!isString(data.schemaVersion)) {
    errors.push(
      makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"schemaVersion" must be a string'),
    );
  }

  if (!('project' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "project"'));
  } else if (!isObject(data.project)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"project" must be an object'));
  } else {
    if (!('name' in data.project) || !isString(data.project.name)) {
      errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, '"project.name" must be a non-empty string'));
    }
  }

  if (!('canvas' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "canvas"'));
  } else if (!isObject(data.canvas)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"canvas" must be an object'));
  }

  if (!('rules' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "rules"'));
  } else if (!isObject(data.rules)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"rules" must be an object'));
  }

  return { errors, isObject: true };
}

function validateLayers(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!('layers' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "layers"'));
    return errors;
  }

  const layers = data.layers;
  if (!isArray(layers)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"layers" must be an array'));
    return errors;
  }

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!isObject(layer)) {
      errors.push(
        makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, `layers[${i}] must be an object`),
      );
      continue;
    }

    if (!('id' in layer) || !isString(layer.id)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_MISSING_ID,
          `layers[${i}] is missing required field "id"`,
          { layerIds: [String(layer.id ?? '(unknown)')] },
        ),
      );
    }

    if (!('order' in layer) || !isNumber(layer.order)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_FIELD_TYPE_ERROR,
          `layers[${i}] has invalid or missing "order" (must be a number)`,
          { layerIds: isString(layer.id) ? [layer.id] : undefined },
        ),
      );
    }
  }

  return errors;
}

function validateElements(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!('elements' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "elements"'));
    return errors;
  }

  const elements = data.elements;
  if (!isArray(elements)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"elements" must be an array'));
    return errors;
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!isObject(el)) {
      errors.push(
        makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, `elements[${i}] must be an object`),
      );
      continue;
    }

    const id = 'id' in el && isString(el.id) ? el.id : `(unknown at index ${i})`;

    if (!('id' in el) || !isString(el.id)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_MISSING_ID,
          `elements[${i}] is missing required field "id"`,
          { elementIds: [id] },
        ),
      );
    }

    if (!('type' in el)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_MISSING_ID,
          `elements[${i}] (id: "${id}") is missing required field "type"`,
          { elementIds: isString(el.id) ? [el.id] : undefined },
        ),
      );
    } else if (!isString(el.type)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_FIELD_TYPE_ERROR,
          `elements[${i}] (id: "${id}") "type" must be a string`,
          { elementIds: isString(el.id) ? [el.id] : undefined },
        ),
      );
    } else if (!VALID_ELEMENT_TYPES.has(el.type)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_INVALID_TYPE,
          `elements[${i}] (id: "${id}") has invalid type "${el.type}". Valid types: ${[...VALID_ELEMENT_TYPES].join(', ')}`,
          {
            elementIds: isString(el.id) ? [el.id] : undefined,
            suggestion: `Change type to one of the supported ElementType values`,
          },
        ),
      );
    }

    if (!('layerId' in el)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_MISSING_ID,
          `elements[${i}] (id: "${id}") is missing required field "layerId"`,
          { elementIds: isString(el.id) ? [el.id] : undefined },
        ),
      );
    } else if (!isString(el.layerId)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_FIELD_TYPE_ERROR,
          `elements[${i}] (id: "${id}") "layerId" must be a string`,
          { elementIds: isString(el.id) ? [el.id] : undefined },
        ),
      );
    }

    if ('visible' in el && !isBoolean(el.visible)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_FIELD_TYPE_ERROR,
          `elements[${i}] (id: "${id}") "visible" must be a boolean`,
          { elementIds: isString(el.id) ? [el.id] : undefined },
        ),
      );
    }

    if ('locked' in el && !isBoolean(el.locked)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_FIELD_TYPE_ERROR,
          `elements[${i}] (id: "${id}") "locked" must be a boolean`,
          { elementIds: isString(el.id) ? [el.id] : undefined },
        ),
      );
    }
  }

  return errors;
}

function validateGroups(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!('groups' in data)) {
    errors.push(makeError(ErrorCode.SCHEMA_MISSING_ID, 'Missing required field "groups"'));
    return errors;
  }

  const groups = data.groups;
  if (!isArray(groups)) {
    errors.push(makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, '"groups" must be an array'));
    return errors;
  }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!isObject(group)) {
      errors.push(
        makeError(ErrorCode.SCHEMA_FIELD_TYPE_ERROR, `groups[${i}] must be an object`),
      );
      continue;
    }

    if (!('id' in group) || !isString(group.id)) {
      errors.push(
        makeError(ErrorCode.SCHEMA_MISSING_ID, `groups[${i}] is missing required field "id"`),
      );
    }

    if (!('elementIds' in group) || !isArray(group.elementIds)) {
      errors.push(
        makeError(
          ErrorCode.SCHEMA_FIELD_TYPE_ERROR,
          `groups[${i}] is missing required field "elementIds" (must be an array)`,
        ),
      );
    }
  }

  return errors;
}

/**
 * Validate an unknown data object against the SceneDocument schema.
 * Performs structural validation only (schema checks).
 * Reference integrity and geometry checks are added in later tasks.
 *
 * @param data - The unknown object to validate
 * @returns ValidationResult with valid flag and error list
 */
export function validateScene(data: unknown): ValidationResult {
  const allErrors: ValidationError[] = [];

  const rootResult = validateRoot(data);
  allErrors.push(...rootResult.errors);
  if (!rootResult.isObject) {
    return failureResult(...allErrors);
  }

  const obj = data as Record<string, unknown>;

  // Stage 2: layers
  allErrors.push(...validateLayers(obj));

  // Stage 3: elements
  allErrors.push(...validateElements(obj));

  // Stage 4: groups
  allErrors.push(...validateGroups(obj));

  if (allErrors.length > 0) {
    return failureResult(...allErrors);
  }

  return successResult();
}

/**
 * Apply validateScene and narrow the type when valid.
 * Convenience wrapper for scenarios that only care about valid data.
 */
export function validateAndCast(data: unknown): SceneDocument | ValidationResult {
  const result = validateScene(data);
  if (!result.valid) return result;
  return data as SceneDocument;
}
