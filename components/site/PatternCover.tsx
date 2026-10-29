"use client";

import { TabbiedPattern } from "tabbied/react";
import bloks from "tabbied/patterns/bloks";
import comet from "tabbied/patterns/comet";
import maze from "tabbied/patterns/maze";
import metro from "tabbied/patterns/metro";
import terrain from "tabbied/patterns/terrain";
import tesserae from "tabbied/patterns/tesserae";
import trigram from "tabbied/patterns/trigram";
import weave from "tabbied/patterns/weave";
import type { DisciplineKey } from "@/lib/data";
import { useMotionPaused } from "@/lib/demo";
import { hash01, paletteFor, patternSlugFor, type PatternSlug } from "@/lib/pattern";
import { Illustration, type IllustrationName } from "./Illustration";
import styles from "./PatternCover.module.css";

const DESIGNS = { bloks, comet, maze, metro, terrain, tesserae, trigram, weave } satisfies Record<PatternSlug, unknown>;

export interface PatternCoverProps {
  discipline: DisciplineKey;
  /** Usually the resource ID, so the same resource always gets the same cover. */
  seed: string;
  /** Overrides the discipline's design. */
  kind?: PatternSlug;
  /** Contributor-chosen palette, ground first (see `palettesFor`). */
  palette?: string[];
  /** Target cell size in px. Small thumbnails read better with smaller cells. */
  cellSize?: number;
  /** Set false to keep the cover still even when animations are on. */
  motion?: boolean;
  /** Illustration on a white disc over the pattern. Place and size the disc with `imageClassName`. */
  image?: IllustrationName | `TME-${string}`;
  imageClassName?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PatternCover: a Tabbied generative pattern sized by its box (set width and height with
 * `className` or `style`). Decorative and hidden from assistive technology.
 */
export function PatternCover({ discipline, seed, kind, palette, cellSize = 32, motion = true, image, imageClassName, className, style }: PatternCoverProps) {
  const { paused } = useMotionPaused();
  const slug = kind || patternSlugFor(discipline);
  // Covers slowly drift to a new arrangement, like a live Tabbied pattern. Tabbied skips
  // this under prefers-reduced-motion, and the footer toggle pauses it.
  const interval = motion ? Math.round(6000 + hash01(seed) * 5000) : undefined;
  return (
    <div aria-hidden="true" className={[styles.cover, className].filter(Boolean).join(" ")} style={style}>
      <TabbiedPattern
        pattern={DESIGNS[slug]}
        seed={seed}
        palette={paletteFor(discipline, palette)}
        cellSize={cellSize}
        redrawInterval={interval}
        paused={paused}
        className={styles.pattern}
      />
      {image ? (
        <div className={[styles.disc, imageClassName].filter(Boolean).join(" ")}>
          <Illustration name={image} className={styles.discImage} eager />
        </div>
      ) : null}
    </div>
  );
}
