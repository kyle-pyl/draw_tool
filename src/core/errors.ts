/**
 * Error codes and validation result types for scene validation.
 * Covers four categories per top-level design doc chapter 16:
 *   schema, reference integrity, geometry rules, and business rules.
 */

// ─── Error Code Enum ──────────────────────────────────────────────────────────

/**
 * Stable error codes for all validation failure scenarios.
 * The string value of each enum member is used as the `code` field
 * in ValidationError, matching the top-level design specification.
 */
export enum ErrorCode {
  // ── Schema validation ─────────────────────────────────────────────────────
  /** Required id field is missing on an element, layer, or group */
  SCHEMA_MISSING_ID = 'SCHEMA_MISSING_ID',
  /** element.type is not a valid ElementType */
  SCHEMA_INVALID_TYPE = 'SCHEMA_INVALID_TYPE',
  /** A field has an unexpected type (e.g. string where number expected) */
  SCHEMA_FIELD_TYPE_ERROR = 'SCHEMA_FIELD_TYPE_ERROR',

  // ── Reference integrity ───────────────────────────────────────────────────
  /** element.layerId does not reference an existing layer */
  REF_LAYER_NOT_FOUND = 'REF_LAYER_NOT_FOUND',
  /** ElementGroup references an element id that does not exist */
  REF_GROUP_NOT_FOUND = 'REF_GROUP_NOT_FOUND',
  /** Connector source or target references a non-existent element */
  REF_CONNECTOR_ENDPOINT_NOT_FOUND = 'REF_CONNECTOR_ENDPOINT_NOT_FOUND',

  // ── Geometry rules ────────────────────────────────────────────────────────
  /** Two or more non-connector elements overlap within the same layer */
  GEO_SAME_LAYER_OVERLAP = 'GEO_SAME_LAYER_OVERLAP',
  /** Moving one or more elements would cause overlap in their target positions */
  GEO_MOVE_TARGET_CONFLICT = 'GEO_MOVE_TARGET_CONFLICT',

  // ── Business rules ────────────────────────────────────────────────────────
  /** Number of layers exceeds rules.maxLayerCount */
  RULE_MAX_LAYER_EXCEEDED = 'RULE_MAX_LAYER_EXCEEDED',
  /** Attempted to edit a locked element */
  RULE_LOCKED_ELEMENT_EDITED = 'RULE_LOCKED_ELEMENT_EDITED',
  /** [预留] Hidden elements overlap in a way that violates the hidden policy — reserved for future use */
  RULE_HIDDEN_OVERLAP = 'RULE_HIDDEN_OVERLAP',
}

// ─── Validation Types ─────────────────────────────────────────────────────────

/**
 * Severity level of a validation error.
 * - error: blocks the operation
 * - warning: does not block but should be brought to user attention
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * A single validation error produced by scene validation.
 * Designed to be machine-readable for Agent consumption as well as
 * human-readable for the UI.
 */
export interface ValidationError {
  /** Stable error code from ErrorCode enum */
  code: string;
  /** Human-readable description of the error */
  message: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** IDs of affected layers (if applicable) */
  layerIds?: string[];
  /** IDs of affected elements (if applicable) */
  elementIds?: string[];
  /** Bounding boxes of the conflicting regions (if applicable) */
  bboxes?: { x: number; y: number; width: number; height: number }[];
  /** Suggested fix or resolution hint */
  suggestion?: string;
}

/**
 * Result returned by all validation functions.
 * If valid is true, errors will be an empty array and the data can be
 * consumed. If valid is false, errors will contain at least one entry.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of validation errors (empty when valid === true) */
  errors: ValidationError[];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Create a successful validation result.
 */
export function successResult(): ValidationResult {
  return { valid: true, errors: [] };
}

/**
 * Create a failed validation result from one or more errors.
 */
export function failureResult(...errors: ValidationError[]): ValidationResult {
  return { valid: false, errors };
}
