/**
 * Utility functions for ID generation and other common operations.
 */

const URL_SAFE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const DEFAULT_ID_LENGTH = 12;

function getRandomByte(): number {
  const crypto_ = typeof globalThis.crypto !== 'undefined'
    ? globalThis.crypto
    : undefined;

  if (crypto_?.getRandomValues) {
    return crypto_.getRandomValues(new Uint8Array(1))[0];
  }
  // Fallback: Math.random() with 8-bit output for environments without Web Crypto
  return Math.floor(Math.random() * 256);
}

/**
 * Generates a unique identifier string using crypto.getRandomValues
 * (with Math.random fallback for test environments).
 * Supports an optional prefix for namespacing IDs by type.
 *
 * @param prefix - Optional prefix prepended to the random portion with an underscore separator.
 * @returns A unique ID string, e.g. "a1BcD_eFgHiJ" or "shape_XyZ_123456"
 */
export function generateId(prefix?: string): string {
  let id = '';
  for (let i = 0; i < DEFAULT_ID_LENGTH; i++) {
    id += URL_SAFE_ALPHABET[getRandomByte() % URL_SAFE_ALPHABET.length];
  }
  return prefix ? `${prefix}_${id}` : id;
}
