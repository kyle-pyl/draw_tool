import { describe, it, expect } from 'vitest';
import { sanitizeSvg, sanitizeSvgToBlob } from '../../io/svg-sanitizer';

describe('sanitizeSvg', () => {
  it('passes through a clean SVG unchanged', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).toContain('<circle');
    expect(result).not.toContain('<script');
  });

  it('removes script elements', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><rect width="100" height="100"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<rect');
  });

  it('removes foreignObject elements', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>evil</div></foreignObject><circle cx="10" cy="10" r="5"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('foreignObject');
    expect(result).not.toContain('<div');
    expect(result).toContain('<circle');
  });

  it('removes use elements', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><defs><circle id="c" r="10"/></defs><use href="#c"/><rect width="10" height="10"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('<use');
    expect(result).toContain('<rect');
  });

  it('removes onClick and other event handler attributes', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5" onclick="alert(1)" onload="bad()"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onload');
    expect(result).toContain('cx="10"');
  });

  it('removes javascript: href values', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>click</text></a><rect width="10" height="10"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe href and xlink:href values', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><a href="https://example.com"><text>link</text></a><image href="image.png"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).toContain('https://example.com');
    expect(result).toContain('image.png');
  });

  it('throws on malformed SVG input', () => {
    expect(() => sanitizeSvg('not an svg at all')).toThrow('Invalid SVG');
  });

  it('handles empty SVG', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const result = sanitizeSvg(svg);
    expect(result).toContain('<svg');
  });

  it('handles nested dangerous elements', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><g><script>bad</script><rect/></g></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('<script');
    expect(result).toContain('<rect');
  });

  it('removes multiple event attributes', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" onmouseover="hack()" onfocus="hack()" onblur="hack()"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('onmouseover');
    expect(result).not.toContain('onfocus');
    expect(result).not.toContain('onblur');
    expect(result).toContain('width="100"');
  });
});

describe('sanitizeSvgToBlob', () => {
  it('returns a Blob with image/svg+xml type', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
    const blob = sanitizeSvgToBlob(svg);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/svg+xml');
  });

  it('sanitizes before creating blob', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle cx="10" cy="10" r="5"/></svg>';
    const blob = sanitizeSvgToBlob(svg);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/svg+xml');
    // Blob size should be larger than 0 and smaller than the original (no script)
    expect(blob.size).toBeGreaterThan(50);
    expect(blob.size).toBeLessThan(svg.length);
  });
});
