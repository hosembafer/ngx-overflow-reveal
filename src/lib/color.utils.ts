/**
 * Infers an opaque background color by walking up the DOM tree
 * until a non-transparent background is found.
 */
export function inferOpaqueBackgroundColor(start: HTMLElement): string {
  // Walk up until a non-transparent background is found
  let el: HTMLElement | null = start;

  while (el) {
    const parsed = parseRGBA(getComputedStyle(el).backgroundColor);
    if (parsed && parsed.a > 0) {
      return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`; // force opaque to fully hide text
    }
    el = el.parentElement;
  }

  // Try body / html
  const bodyParsed = parseRGBA(getComputedStyle(document.body).backgroundColor);
  if (bodyParsed && bodyParsed.a > 0) return `rgb(${bodyParsed.r}, ${bodyParsed.g}, ${bodyParsed.b})`;

  const htmlParsed = parseRGBA(getComputedStyle(document.documentElement).backgroundColor);
  if (htmlParsed && htmlParsed.a > 0) return `rgb(${htmlParsed.r}, ${htmlParsed.g}, ${htmlParsed.b})`;

  // Fallback
  return 'white';
}

/**
 * Parses a CSS color string (rgb, rgba, or hex) into RGBA components.
 */
export function parseRGBA(input: string | null | undefined):
  | { r: number; g: number; b: number; a: number }
  | null {
  if (!input) return null;

  const s = input.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  // rgb() / rgba()
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (m) {
    return {
      r: clamp255(+m[1]),
      g: clamp255(+m[2]),
      b: clamp255(+m[3]),
      a: m[4] !== undefined ? clamp01(+m[4]) : 1,
    };
  }

  // hex #rgb/#rgba/#rrggbb/#rrggbbaa
  const hex = s.replace('#', '');
  if ([3, 4, 6, 8].includes(hex.length)) {
    const { r, g, b, a } = hexToRgba(hex);
    return { r, g, b, a };
  }

  return null;
}

/**
 * Converts a hex color string to RGBA components.
 */
export function hexToRgba(hex: string) {
  let r = 0, g = 0, b = 0, a = 1;
  if (hex.length === 3 || hex.length === 4) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 6 || hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
  }
  return { r, g, b, a };
}

/**
 * Clamps a number to the 0-255 range and rounds it.
 */
export function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/**
 * Clamps a number to the 0-1 range.
 */
export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}