// Discipline to Tabbied design mapping for resource covers.
// The discipline picks the design and palette; the resource ID is the seed, so the same
// resource gets the same cover on cards, its resource page, and in the admin.
import type { DisciplineKey } from "./data";

export type PatternSlug = "bloks" | "maze" | "trigram" | "metro" | "weave" | "terrain" | "comet" | "tesserae" | "mixtape";

/** Editorial direction: Illini navy and orange with the discipline's signature color, on white. */
export const PATTERN_MAP: Record<DisciplineKey, { slug: PatternSlug; inks: string[] }> = {
  fin: { slug: "bloks", inks: ["#13294B", "#FF5F05", "#FCB316"] },
  audit: { slug: "maze", inks: ["#13294B", "#FF5F05", "#1D58A7"] },
  tax: { slug: "trigram", inks: ["#13294B", "#FF5F05", "#7D3E13"] },
  ais: { slug: "metro", inks: ["#13294B", "#FF5F05", "#009FD4", "#1D58A7"] },
  mgmt: { slug: "weave", inks: ["#13294B", "#FF5F05", "#007E8E"] },
  data: { slug: "terrain", inks: ["#13294B", "#FF5F05", "#006230"] },
  emtech: { slug: "comet", inks: ["#13294B", "#FF5F05", "#5C0E41"] },
  other: { slug: "tesserae", inks: ["#13294B", "#FF5F05", "#707372"] },
};

export const PATTERN_LABEL: Record<PatternSlug, string> = {
  bloks: "Bloks", maze: "Maze", trigram: "Trigram", metro: "Metro", weave: "Weave", terrain: "Terrain", comet: "Comet", tesserae: "Tesserae", mixtape: "Mixtape",
};

/** Cover ground. Text never sits on the pattern, so the ground stays plain white. */
export const COVER_GROUND = "#FFFFFF";

/** Light grays from the site's surfaces and borders, ground first, so a color photo on the pattern stands out. */
export const NEUTRAL_PALETTE = [COVER_GROUND, "#F4F4F4", "#EBECEB", "#E4E5E4", "#DDDEDD", "#D2D4D3"];

/**
 * Deeper neutral grays for material and discipline covers. They're small and have no border, and
 * several designs are thin lines, which the hero's lighter grays would lose against the white page.
 */
export const COVER_NEUTRAL_PALETTE = [COVER_GROUND, "#E4E5E4", "#D2D4D3", "#C2C4C3", "#B1B3B2"];

export const patternSlugFor = (d: DisciplineKey): PatternSlug => (PATTERN_MAP[d] || PATTERN_MAP.other).slug;

/**
 * Tabbied palette (ground first) for a discipline. A custom palette from the contribute flow
 * is given in the same order as `palettesFor()` in data.ts: ground, then inks.
 */
export function paletteFor(d: DisciplineKey, custom?: string[]): string[] {
  if (custom && custom.length > 1) return [COVER_GROUND, ...custom.slice(1)];
  return [COVER_GROUND, ...(PATTERN_MAP[d] || PATTERN_MAP.other).inks];
}

/** Deterministic 0..1 value from a string, for staggering redraw timers. */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
