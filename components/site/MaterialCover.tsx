"use client";

import type { DisciplineKey } from "@/lib/data";
import { useMotionPaused } from "@/lib/demo";
import { COVER_NEUTRAL_PALETTE, hash01 } from "@/lib/pattern";
import { cutoutsFor, Illustration } from "./Illustration";
import { PatternCover, type PatternCoverProps } from "./PatternCover";
import styles from "./MaterialCover.module.css";

/** Copies of the cutouts in the carousel track: enough to fill a box up to about six cutouts' height wide. */
const COPIES = [0, 1, 2, 3];

export interface MaterialCoverProps extends Pick<PatternCoverProps, "cellSize" | "motion" | "className" | "style"> {
  /** Resource ID: picks the cutouts, and seeds the pattern unless `seed` is given. */
  id: string;
  discipline: DisciplineKey;
  seed?: string;
  /** A contributor-chosen palette (see `palettesFor`); neutral grays otherwise. */
  palette?: string[];
}

/**
 * MaterialCover: a material's pattern cover in neutral grays, with its three color photo cutouts
 * moving slowly to the left across it in a seamless loop, fading in and out at the edges. Each
 * cover's speed and starting point come from its ID, so a grid of cards doesn't move in step. A
 * small thumbnail shows only the main cutout, standing still. Set `--cutouts-inset` on
 * `className` to keep the cutouts clear of something overlapping the cover.
 */
export function MaterialCover({ id, discipline, seed = id, palette, cellSize, motion = true, className, style }: MaterialCoverProps) {
  const { paused, reduced } = useMotionPaused();
  const cutouts = cutoutsFor(id);
  const seconds = 14 + hash01(id + "-carousel") * 4;
  const vars = { "--loop": `${seconds.toFixed(2)}s`, "--start": `${(-hash01(id) * seconds).toFixed(2)}s` } as React.CSSProperties;
  return (
    <PatternCover discipline={discipline} seed={seed} palette={palette || COVER_NEUTRAL_PALETTE} cellSize={cellSize} motion={motion} className={className} style={style}>
      {cutouts.length ? (
        <div className={[styles.cutouts, paused || reduced || !motion ? styles.still : ""].filter(Boolean).join(" ")} style={vars}>
          <Illustration name={cutouts[0]} className={styles.solo} />
          <div className={styles.track}>
            {COPIES.map((copy) => cutouts.map((name) => <Illustration key={`${copy}-${name}`} name={name} className={styles.item} />))}
          </div>
        </div>
      ) : null}
    </PatternCover>
  );
}
