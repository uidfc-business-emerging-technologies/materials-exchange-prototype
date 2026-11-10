"use client";

import { TabbiedPattern } from "tabbied/react";
import bloks from "tabbied/patterns/bloks";
import comet from "tabbied/patterns/comet";
import curl from "tabbied/patterns/curl";
import maze from "tabbied/patterns/maze";
import metro from "tabbied/patterns/metro";
import mixtape from "tabbied/patterns/mixtape";
import northstar from "tabbied/patterns/northstar";
import terrain from "tabbied/patterns/terrain";
import tesserae from "tabbied/patterns/tesserae";
import trigram from "tabbied/patterns/trigram";
import weave from "tabbied/patterns/weave";
import type { DisciplineKey } from "@/lib/data";
import { useMotionPaused } from "@/lib/demo";
import { hash01, paletteFor, patternSlugFor, type PatternSlug } from "@/lib/pattern";
import styles from "./PatternCover.module.css";

const DESIGNS = { bloks, comet, curl, maze, metro, mixtape, northstar, terrain, tesserae, trigram, weave } satisfies Record<PatternSlug, unknown>;

export interface PatternCoverProps {
  discipline: DisciplineKey;
  /** Usually the resource ID, so the same resource always gets the same cover. */
  seed: string;
  /** Overrides the discipline's design. */
  kind?: PatternSlug;
  /** A fixed palette, ground first (see `NEUTRAL_PALETTE`); the discipline's colors otherwise. */
  palette?: string[];
  /** Set true to leave the ground see-through, so whatever is behind the cover shows between the shapes. */
  transparent?: boolean;
  /** Tabbied option values for the design, keyed by option id (such as Curl's `frequency`). */
  options?: Record<string, string | number | boolean>;
  /** Target cell size in px. Small thumbnails read better with smaller cells. */
  cellSize?: number;
  /** Set false to keep the cover still even when animations are on. */
  motion?: boolean;
  /** Shown over the pattern, such as photo cutouts (`CutoutRain`). */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PatternCover: a Tabbied generative pattern sized by its box (set width and height with
 * `className` or `style`). Decorative and hidden from assistive technology.
 */
export function PatternCover({ discipline, seed, kind, palette, transparent = false, options, cellSize = 32, motion = true, children, className, style }: PatternCoverProps) {
  const { paused } = useMotionPaused();
  const slug = kind || patternSlugFor(discipline);
  // Covers slowly drift to a new arrangement, like a live Tabbied pattern. Tabbied skips
  // this under prefers-reduced-motion, and the footer toggle pauses it.
  const interval = motion ? Math.round(6000 + hash01(seed) * 5000) : undefined;
  const colors = paletteFor(discipline, palette);
  return (
    <div aria-hidden="true" className={[styles.cover, transparent ? styles.clear : "", className].filter(Boolean).join(" ")} style={style}>
      <TabbiedPattern
        pattern={DESIGNS[slug]}
        seed={seed}
        palette={transparent ? ["transparent", ...colors.slice(1)] : colors}
        options={options}
        cellSize={cellSize}
        redrawInterval={interval}
        paused={paused}
        className={styles.pattern}
      />
      {children}
    </div>
  );
}
