// Discipline to Tabbied design mapping for the decorative patterns: the home hero and band, and the
// art beside forms. The discipline picks the design and palette; the seed keeps the same pattern
// for the same thing. Material covers are watercolors (lib/covers.ts), not patterns.
import type { DisciplineKey } from "./data";

export type PatternSlug = "bloks" | "maze" | "trigram" | "metro" | "weave" | "terrain" | "comet" | "tesserae" | "mixtape" | "curl";

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

/** Cover ground. Text never sits on the pattern, so the ground stays plain white. */
export const COVER_GROUND = "#FFFFFF";

/**
 * The Curl band between Browse by discipline and How it works: very light neutral grays, ground
 * first, so the band is a quiet texture. The band draws it with a transparent ground
 * (`PatternCover`'s `transparent`), so only the arcs show, and fades it out at the top and bottom.
 */
export const CURL_PALETTE = [COVER_GROUND, "#EAEBEA", "#F0F1F0", "#E4E5E4"];

/** Light grays from the site's surfaces and borders, ground first, so a color photo on the pattern stands out. */
export const NEUTRAL_PALETTE = [COVER_GROUND, "#F4F4F4", "#EBECEB", "#E4E5E4", "#DDDEDD", "#D2D4D3"];

export const patternSlugFor = (d: DisciplineKey): PatternSlug => (PATTERN_MAP[d] || PATTERN_MAP.other).slug;

/** Tabbied palette (ground first) for a discipline, or a fixed palette given in the same order: ground, then inks. */
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
