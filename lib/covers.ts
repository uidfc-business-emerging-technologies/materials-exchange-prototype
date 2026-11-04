// Material covers. Each published material has a watercolor cover on a transparent background
// (scripts/generate-images.mjs), saved 1280px wide with a 640px copy for thumbnails.

/** A material's cover image: the full file (1280px wide) and its 640px copy. */
export const coverFiles = (id: string) => ({ src: `/images/${id}-watercolor.webp`, small: `/images/${id}-watercolor-sm.webp` });
