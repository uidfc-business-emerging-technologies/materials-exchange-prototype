// Material covers. Each published material has a watercolor cover on a transparent background
// (scripts/generate-images.mjs), saved 1280px wide with a 640px copy for thumbnails.

/** A material's cover image: the full file (1280px wide) and its 640px copy. */
export const coverFiles = (id: string) => ({ src: `/images/${id}-watercolor.webp`, small: `/images/${id}-watercolor-sm.webp` });

/**
 * Placeholder covers for a material without its own cover yet, like a new submission. Same style
 * as the material covers, with general teaching subjects. Pass one to `coverFiles`.
 */
export const PLACEHOLDER_COVERS = ["placeholder-1", "placeholder-2", "placeholder-3", "placeholder-4"] as const;

/** The same placeholder for the same seed (usually a resource ID), or the nth one if a number is given. */
export function placeholderCover(seed: string | number) {
  if (typeof seed === "number") return PLACEHOLDER_COVERS[((seed % PLACEHOLDER_COVERS.length) + PLACEHOLDER_COVERS.length) % PLACEHOLDER_COVERS.length];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PLACEHOLDER_COVERS[h % PLACEHOLDER_COVERS.length];
}
