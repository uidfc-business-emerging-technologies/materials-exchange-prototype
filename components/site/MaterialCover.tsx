"use client";

import { coverFiles, placeholderCover } from "@/lib/covers";
import { hasMaterialImage } from "./Illustration";
import styles from "./MaterialCover.module.css";

export interface MaterialCoverProps {
  /** Resource ID: picks the cover image, and the placeholder unless `seed` or `placeholder` is given. */
  id: string;
  /** Picks the placeholder for a material without its own cover, so the same seed shows the same one. */
  seed?: string;
  /** The placeholder to show (one of `PLACEHOLDER_COVERS`), such as the one a contributor picked. */
  placeholder?: string;
  /** How wide the cover shows, as an `<img sizes>` value, so the browser picks the right file. */
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MaterialCover: a material's cover, sized and shaped by `className`. A published material shows
 * its watercolor (lib/covers.ts) small on a soft ground, scaled to fit. Anything else, like a new
 * submission, shows a placeholder watercolor in the same style. Decorative and hidden from
 * assistive technology.
 */
export function MaterialCover({ id, seed = id, placeholder, className, style, sizes = "400px" }: MaterialCoverProps) {
  const { src, small } = coverFiles(hasMaterialImage(id) ? id : placeholder || placeholderCover(seed));
  return (
    <div aria-hidden="true" className={[styles.cover, className].filter(Boolean).join(" ")} style={style}>
      <img src={src} srcSet={`${small} 640w, ${src} 1280w`} sizes={sizes} alt="" loading="lazy" decoding="async" className={styles.image} />
    </div>
  );
}
