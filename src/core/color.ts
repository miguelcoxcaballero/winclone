// Small colour helpers used to derive the 7-step accent palette from one colour.

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}

function shade(hex: string, dl: number): string {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  const nl = Math.max(0.04, Math.min(0.96, l + dl));
  return rgbToHex(...hslToRgb(h, s, nl));
}

export interface AccentPalette {
  base: string; light1: string; light2: string; light3: string; dark1: string; dark2: string; dark3: string;
}

const KNOWN: Record<string, AccentPalette> = {
  '#0078d4': { base: '#0078d4', light1: '#0093f9', light2: '#60cdff', light3: '#99ebff', dark1: '#005fb8', dark2: '#004a83', dark3: '#003e92' },
};

export function accentPalette(hex: string): AccentPalette {
  const key = hex.toLowerCase();
  if (KNOWN[key]) return KNOWN[key];
  const [, , l] = rgbToHsl(...hexToRgb(hex));
  // Light steps aim for readable tints on dark backgrounds.
  const up = (target: number) => Math.max(0.06, target - l);
  return {
    base: hex,
    light1: shade(hex, Math.max(0.08, up(0.5))),
    light2: shade(hex, Math.max(0.18, up(0.68))),
    light3: shade(hex, Math.max(0.28, up(0.8))),
    dark1: shade(hex, -Math.max(0.07, l - 0.36)),
    dark2: shade(hex, -Math.max(0.14, l - 0.28)),
    dark3: shade(hex, -Math.max(0.2, l - 0.2)),
  };
}

/** Relative luminance (0..1) */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The 48 accent swatches from Settings › Personalization › Colors */
export const ACCENT_SWATCHES = [
  '#FFB900', '#FF8C00', '#F7630C', '#CA5010', '#DA3B01', '#EF6950', '#D13438', '#FF4343',
  '#E74856', '#E81123', '#EA005E', '#C30052', '#E3008C', '#BF0077', '#C239B3', '#9A0089',
  '#0078D4', '#0063B1', '#8E8CD8', '#6B69D6', '#8764B8', '#744DA9', '#B146C2', '#881798',
  '#0099BC', '#2D7D9A', '#00B7C3', '#038387', '#00B294', '#018574', '#00CC6A', '#10893E',
  '#7A7574', '#5D5A58', '#68768A', '#515C6B', '#567C73', '#486860', '#498205', '#107C10',
  '#767676', '#4C4A48', '#69797E', '#4A5459', '#647C64', '#525E54', '#847545', '#7E735F',
];
