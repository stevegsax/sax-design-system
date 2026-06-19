// Pure core: turn a compact ramp spec (config/ramps.json) into DTCG color token
// values. No I/O — generate-ramps.js is the imperative shell that reads the spec
// and writes the file.
import { gamutMaxChroma, oklchToHex } from './color.js';

const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// Chroma for one step under a ramp's rule:
//   const        -> a fixed chroma at every step
//   ceiling      -> ride the sRGB gamut boundary, capped at `cap`
//   proportional -> a fraction of the gamut boundary, capped at `cap`
function chromaFor(rule, lightness, hue, cap) {
  if (rule.kind === 'const') return rule.value;
  const gamutMax = gamutMaxChroma(lightness, hue);
  if (rule.kind === 'ceiling') return Math.min(cap, gamutMax);
  if (rule.kind === 'proportional') return Math.min(cap, rule.factor * gamutMax);
  throw new Error(`unknown chroma rule: ${rule.kind}`);
}

// A single DTCG $value. Lightness 0 and 1 are pure achromatic endpoints (hue
// "none"); every other step carries the ramp hue. The hex is always derived from
// the ROUNDED components, matching how check-color.js re-derives and verifies it.
export function buildValue({ step, hue, rule, cap, decimals }) {
  const lightness = round(step / 100, decimals);
  if (step === 0 || step === 100) {
    return { colorSpace: 'oklch', components: [lightness, 0, 'none'], alpha: 1, hex: oklchToHex(lightness, 0, 0) };
  }
  const chroma = round(chromaFor(rule, step / 100, hue, cap), decimals);
  return { colorSpace: 'oklch', components: [lightness, chroma, hue], alpha: 1, hex: oklchToHex(lightness, chroma, hue) };
}

// A hand-pinned anchor: lightness and chroma come from the spec verbatim
// (rounded), hue from the ramp, hex derived like any other step.
export function buildAnchorValue({ anchor, hue, decimals }) {
  const lightness = round(anchor.lightness, decimals);
  const chroma = round(anchor.chroma, decimals);
  return { colorSpace: 'oklch', components: [lightness, chroma, hue], alpha: 1, hex: oklchToHex(lightness, chroma, hue) };
}

// Build one ramp as an ordered list of { key, value, description? } entries:
// the anchor (if any) first, then numeric steps in spec order.
export function buildRamp(ramp, cap, decimals) {
  const entries = [];
  if (ramp.anchor) {
    entries.push({
      key: 'anchor',
      description: ramp.anchor.description,
      value: buildAnchorValue({ anchor: ramp.anchor, hue: ramp.hue, decimals }),
    });
  }
  for (const step of ramp.steps) {
    entries.push({
      key: String(step),
      value: buildValue({ step, hue: ramp.hue, rule: ramp.rule, cap, decimals }),
    });
  }
  return entries;
}
