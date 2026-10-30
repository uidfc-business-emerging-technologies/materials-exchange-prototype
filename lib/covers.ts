// Material cover styles to compare. Each published material has a full-bleed cover image in
// every style (scripts/generate-images.mjs). The Covers switch in the demo control picks one for
// the whole site, and the choice lives in a cookie so pages render it on the server.

export const COVER_STYLES = [
  { key: "photo", label: "Minimal photo" },
  { key: "line", label: "Line" },
  { key: "riso", label: "Risograph" },
  { key: "watercolor", label: "Watercolor" },
  { key: "collage", label: "Cut paper" },
] as const;

export type CoverStyle = (typeof COVER_STYLES)[number]["key"];

/** What pages show until a visitor picks another style: two inks, the closest to the brand. */
export const DEFAULT_COVER_STYLE: CoverStyle = "riso";

export const COVERS_COOKIE = "tme-covers";

export const parseCoverStyle = (raw: string | undefined): CoverStyle => COVER_STYLES.find((s) => s.key === raw)?.key ?? DEFAULT_COVER_STYLE;

/** A material's cover image in a style: the full file (1280px wide) and its 640px copy. */
export const coverFiles = (id: string, style: CoverStyle) => ({ src: `/images/${id}-${style}.webp`, small: `/images/${id}-${style}-sm.webp` });
