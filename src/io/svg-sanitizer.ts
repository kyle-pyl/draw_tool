/**
 * SVG sanitizer for secure SVG import.
 * Removes dangerous elements (script, foreignObject) and event handler attributes
 * to prevent XSS attacks when importing SVG files.
 */

const DANGEROUS_TAGS = new Set([
  'script',
  'foreignobject',
  'use',
]);

const EVENT_ATTR_RE = /^on[a-z]+$/i;

function isJavascriptUrl(value: string): boolean {
  return /^\s*javascript:/i.test(value);
}

function sanitizeNode(node: Element): void {
  const children = Array.from(node.children);
  for (const child of children) {
    if (DANGEROUS_TAGS.has(child.tagName.toLowerCase())) {
      child.remove();
      continue;
    }
    sanitizeNode(child);
  }

  const attrs = Array.from(node.attributes);
  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    if (EVENT_ATTR_RE.test(name)) {
      node.removeAttribute(attr.name);
      continue;
    }
    if ((name === 'href' || name === 'xlink:href') && isJavascriptUrl(attr.value)) {
      node.removeAttribute(attr.name);
    }
  }
}

export function sanitizeSvg(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`Invalid SVG: ${errorNode.textContent ?? 'parse error'}`);
  }

  sanitizeNode(doc.documentElement);

  return new XMLSerializer().serializeToString(doc);
}

export function sanitizeSvgToBlob(svgText: string): Blob {
  const sanitized = sanitizeSvg(svgText);
  return new Blob([sanitized], { type: 'image/svg+xml' });
}
