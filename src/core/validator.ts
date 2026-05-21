/**
 * Scene validation — hand-written structural schema checks.
 * No external dependencies (Zod, Ajv) to keep the Lite bundle small.
 */

import type { SceneDocument, SceneElement } from './types';
import { ErrorCode } from './errors';
import type { ValidationError, ValidationResult } from './errors';
import { successResult, failureResult } from './errors';
import { checkLayerCollisions } from './collision';
import type { CollisionCheckOptions } from './collision';
import { createGeometryAdapter } from './geometry';

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
 * Stage 5: Reference integrity checks.
 *
 * Verifies that:
 *  - every element's layerId references an existing layer
 *  - every group's elementIds reference existing elements
 *  - every connector's source/target elementId (when present, i.e. not a free point)
 *    references an existing element
 *
 * This function only runs after structural validation has passed (i.e. layers and
 * elements arrays are guaranteed to exist and be arrays, and elements with valid
 * ids/types are collectable).
 */
function validateReferences(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  const layers = data.layers;
  const elements = data.elements;
  const groups = data.groups;

  if (!isArray(layers) || !isArray(elements)) {
    return errors;
  }

  // Build set of valid layer IDs (skip layers with missing/invalid ids
  // since structural validation already reported those)
  const layerIds = new Set<string>();
  for (const layer of layers) {
    if (isObject(layer) && 'id' in layer && isString(layer.id)) {
      layerIds.add(layer.id);
    }
  }

  // Build set of valid element IDs (skip elements with missing/invalid ids)
  const elementIds = new Set<string>();
  for (const el of elements) {
    if (isObject(el) && 'id' in el && isString(el.id)) {
      elementIds.add(el.id);
    }
  }

  // 5a. Check element.layerId references
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!isObject(el)) continue;

    const id = 'id' in el && isString(el.id) ? el.id : `(unknown at index ${i})`;

    // Only check references for elements that have a valid string type and layerId
    if (!('type' in el) || !isString(el.type) || !VALID_ELEMENT_TYPES.has(el.type as string)) {
      continue;
    }
    if (!('layerId' in el) || !isString(el.layerId)) {
      continue;
    }

    const layerId = el.layerId as string;
    if (!layerIds.has(layerId)) {
      errors.push(
        makeError(
          ErrorCode.REF_LAYER_NOT_FOUND,
          `Element "${id}" references non-existent layer "${layerId}"`,
          {
            elementIds: isString(el.id) ? [el.id] : undefined,
            suggestion: `Create a layer with id "${layerId}" or update the element's layerId to an existing layer`,
          },
        ),
      );
    }
  }

  // 5b. Check group.elementIds references
  if (isArray(groups)) {
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (!isObject(group)) continue;

      const groupId = 'id' in group && isString(group.id) ? group.id : `(group at index ${i})`;

      if (!('elementIds' in group) || !isArray(group.elementIds)) continue;

      const refs = group.elementIds as unknown[];
      for (let j = 0; j < refs.length; j++) {
        const refId = refs[j];
        if (isString(refId) && !elementIds.has(refId)) {
          errors.push(
            makeError(
              ErrorCode.REF_GROUP_NOT_FOUND,
              `Group "${groupId}" references non-existent element "${refId}" at position ${j}`,
              {
                elementIds: [refId],
                suggestion: `Remove "${refId}" from the group's elementIds or ensure the element exists`,
              },
            ),
          );
        }
      }
    }
  }

  // 5c. Check connector source/target elementId references
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!isObject(el)) continue;

    // Only check elements that claim to be connectors
    if (!('type' in el) || !isString(el.type) || el.type !== 'connector') continue;

    const id = 'id' in el && isString(el.id) ? el.id : `(connector at index ${i})`;

    // Check source endpoint
    if ('source' in el && isObject(el.source)) {
      const source = el.source as Record<string, unknown>;
      if ('elementId' in source && isString(source.elementId) && source.elementId.length > 0) {
        if (!elementIds.has(source.elementId)) {
          errors.push(
            makeError(
              ErrorCode.REF_CONNECTOR_ENDPOINT_NOT_FOUND,
              `Connector "${id}" source references non-existent element "${source.elementId}"`,
              {
                elementIds: isString(el.id) ? [el.id] : undefined,
                suggestion: `Update the source.elementId to an existing element or set it to a free point`,
              },
            ),
          );
        }
      }
    }

    // Check target endpoint
    if ('target' in el && isObject(el.target)) {
      const target = el.target as Record<string, unknown>;
      if ('elementId' in target && isString(target.elementId) && target.elementId.length > 0) {
        if (!elementIds.has(target.elementId)) {
          errors.push(
            makeError(
              ErrorCode.REF_CONNECTOR_ENDPOINT_NOT_FOUND,
              `Connector "${id}" target references non-existent element "${target.elementId}"`,
              {
                elementIds: isString(el.id) ? [el.id] : undefined,
                suggestion: `Update the target.elementId to an existing element or set it to a free point`,
              },
            ),
          );
        }
      }
    }
  }

  return errors;
}

/**
 * Stage 6: Geometry rules validation.
 *
 * Checks:
 *  - layers.length does not exceed rules.maxLayerCount
 *  - elements within the same layer do not have overlapping bounding boxes
 *
 * Only meaningful structural+reference checks have passed (elements have valid
 * ids, types and layer references). Connector elements are excluded from per-layer
 * collision checks by checkLayerCollisions itself.
 */
function validateGeometryRules(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  const layers = data.layers;
  const elements = data.elements;
  const rules = data.rules;

  if (!isArray(layers) || !isArray(elements) || !isObject(rules)) {
    return errors;
  }

  const rulesObj = rules as Record<string, unknown>;

  // 6a. Max layer count
  const maxLayerCount = rulesObj.maxLayerCount;
  if (typeof maxLayerCount === 'number' && layers.length > maxLayerCount) {
    const layerIds = layers
      .filter((l): l is Record<string, unknown> => isObject(l))
      .map((l) => (isString(l.id) ? l.id : undefined))
      .filter((id): id is string => id !== undefined);

    errors.push(
      makeError(
        ErrorCode.RULE_MAX_LAYER_EXCEEDED,
        `Number of layers (${layers.length}) exceeds the maximum allowed (${maxLayerCount})`,
        {
          layerIds: layerIds.length > 0 ? layerIds : undefined,
          suggestion: `Reduce the number of layers to ${maxLayerCount} or increase rules.maxLayerCount`,
        },
      ),
    );
  }

  // 6b. Build set of valid layer IDs (only layers that passed structural checks)
  const validLayerIds = new Set<string>();
  for (const l of layers) {
    if (isObject(l) && 'id' in l && isString(l.id)) {
      validLayerIds.add(l.id);
    }
  }

  // 6c. Collect eligible elements for collision checks:
  //     - must be an object with a valid id, a valid type, and a valid layerId
  //     - must reference an existing layer (otherwise reference check already flagged it)
  //     - connectors are excluded later by checkLayerCollisions
  const eligibleElements: { el: Record<string, unknown>; layerId: string }[] = [];

  for (const el of elements) {
    if (!isObject(el)) continue;
    if (!('id' in el) || !isString(el.id)) continue;
    if (!('type' in el) || !isString(el.type) || !VALID_ELEMENT_TYPES.has(el.type as string)) continue;
    if (!('layerId' in el) || !isString(el.layerId)) continue;
    if (!validLayerIds.has(el.layerId)) continue;
    if (!('transform' in el) || !isObject(el.transform)) continue;
    eligibleElements.push({ el, layerId: el.layerId });
  }

  // 6d. Build collision options from SceneRules
  const collisionOptions: CollisionCheckOptions = {};
  if (rulesObj.hiddenElementsCollide === false) {
    collisionOptions.skipHidden = true;
  }
  if (rulesObj.lockedElementsCollide === false) {
    collisionOptions.skipLocked = true;
  }
  if (rulesObj.connectorsExempt === false) {
    collisionOptions.skipConnectors = false;
  }
  if (typeof rulesObj.collisionStrategy === 'string') {
    collisionOptions.collisionStrategy = rulesObj.collisionStrategy as CollisionCheckOptions['collisionStrategy'];
  }

  // 6e. Group elements by layer and run collision detection
  const elementsByLayer = new Map<string, SceneElement[]>();

  for (const { el, layerId } of eligibleElements) {
    if (!elementsByLayer.has(layerId)) {
      elementsByLayer.set(layerId, []);
    }
    elementsByLayer.get(layerId)!.push(el as unknown as SceneElement);
  }

  const geometryAdapter = createGeometryAdapter();

  for (const [layerId, layerElements] of elementsByLayer) {
    const collisionResult = checkLayerCollisions(layerElements, geometryAdapter, collisionOptions);

    if (collisionResult.hasCollision) {
      for (const collision of collisionResult.collisions) {
        errors.push(
          makeError(
            ErrorCode.GEO_SAME_LAYER_OVERLAP,
            `Layer "${layerId}" has overlapping elements: "${collision.elementA}" and "${collision.elementB}"`,
            {
              layerIds: [layerId],
              elementIds: [collision.elementA, collision.elementB],
              bboxes: [collision.overlapBBox],
              suggestion:
                'Move one of the elements to a different position or to a different layer to resolve the overlap',
            },
          ),
        );
      }
    }
  }

  return errors;
}

/**
 * Validate an unknown data object against the SceneDocument schema.
 * Performs structural validation (schema checks), reference integrity checks,
 * and geometry rules checks (layer collision detection).
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

  // Stage 5: reference integrity
  allErrors.push(...validateReferences(obj));

  // Stage 6: geometry rules (layer collision detection)
  allErrors.push(...validateGeometryRules(obj));

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
