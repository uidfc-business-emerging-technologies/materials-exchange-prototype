"use client";

import { coverFiles } from "@/lib/covers";
import type { DisciplineKey } from "@/lib/data";
import { useDemo } from "@/lib/demo";
import { COVER_NEUTRAL_PALETTE } from "@/lib/pattern";
import { hasMaterialImage } from "./Illustration";
import { PatternCover, type PatternCoverProps } from "./PatternCover";
import styles from "./MaterialCover.module.css";

export interface MaterialCoverProps extends Pick<PatternCoverProps, "cellSize" | "motion" | "className" | "style"> {
  /** Resource ID: picks the cover image, and seeds the pattern unless `seed` is given. */
  id: string;
  discipline: DisciplineKey;
  seed?: string;
  /** A contributor-chosen palette for the pattern (see `palettesFor`); neutral grays otherwise. */
  palette?: string[];
  /** How wide the cover shows, as an `<img sizes>` value, so the browser picks the right file. */
  sizes?: string;
}

/**
 * MaterialCover: a material's cover, sized and shaped by `className`. A published material shows
 * its cover image, cropped to fit, in the style picked with the Covers switch (lib/covers.ts).
 * Anything else, like a new submission, shows a Tabbied pattern in the contributor's palette or
 * neutral grays. Decorative and hidden from assistive technology.
 */
export function MaterialCover({ id, discipline, seed = id, palette, cellSize, motion, className, style, sizes = "400px" }: MaterialCoverProps) {
  const { covers } = useDemo();
  if (!hasMaterialImage(id)) {
    return <PatternCover discipline={discipline} seed={seed} palette={palette || COVER_NEUTRAL_PALETTE} cellSize={cellSize} motion={motion} className={className} style={style} />;
  }
  const { src, small } = coverFiles(id, covers);
  return (
    <div aria-hidden="true" className={[styles.cover, className].filter(Boolean).join(" ")} style={style}>
      <img src={src} srcSet={`${small} 640w, ${src} 1280w`} sizes={sizes} alt="" loading="lazy" decoding="async" className={styles.image} />
    </div>
  );
}
