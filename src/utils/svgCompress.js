/** Strips comments, redundant whitespace, and unneeded attributes from raw SVG markup. */

export function compressSvg(rawSvg) {
  if (!rawSvg || typeof rawSvg !== 'string') return '';

  let svg = rawSvg.trim();

  // Strip XML prolog or doctype
  svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, '');
  svg = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, '');

  // Strip HTML/XML comments
  svg = svg.replace(/<!--[\s\S]*?-->/g, '');

  // Collapse multiple spaces, tabs, and newlines inside tags
  svg = svg.replace(/\s+/g, ' ');
  svg = svg.replace(/>\s+</g, '><');

  return svg.trim();
}

export default compressSvg;
