// Shared OKLCH/sRGB helpers. Both the ramp generator (generate-ramps.js) and the
// color checker (check-color.js) import these so the two never compute colors
// differently. All sRGB clamping goes through culori's gamut mapper, pinned via
// the exact culori version in package.json.
import { clampChroma, converter, formatHex } from 'culori';

const toRgb = converter('rgb');

// A DTCG structured color value -> a culori oklch color. "none" components
// (used for achromatic black/white) collapse to 0.
export function dtcgToCulori(value) {
  if (value.colorSpace !== 'oklch') {
    throw new Error(`unsupported colorSpace ${value.colorSpace}`);
  }
  const [l, c, h] = value.components.map((component) => (component === 'none' ? 0 : component));
  return { mode: 'oklch', l, c, h, alpha: value.alpha ?? 1 };
}

// Clamp an oklch color into the sRGB gamut (chroma reduced, lightness/hue kept).
export function clampToSrgb(color) {
  return clampChroma(color, 'oklch', 'rgb');
}

// The hex fallback for an oklch color, after sRGB gamut clamping.
export function culoriToHex(color) {
  return formatHex(clampToSrgb(color));
}

export function oklchToHex(l, c, h) {
  return culoriToHex({ mode: 'oklch', l, c, h });
}

// The maximum in-gamut chroma at a given lightness and hue: ask for far more
// chroma than sRGB can hold and read back what the gamut mapper allowed.
export function gamutMaxChroma(l, h) {
  return clampToSrgb({ mode: 'oklch', l, c: 0.4, h }).c;
}

// An oklch color as [r, g, b] in 0..255, for APCA luminance.
export function culoriToRgb255(color) {
  const rgb = toRgb(clampToSrgb(color));
  return [rgb.r * 255, rgb.g * 255, rgb.b * 255];
}
