import type { DisciplineKey } from "@/lib/data";
import { COVER_NEUTRAL_PALETTE } from "@/lib/pattern";
import { cutoutsFor, Illustration } from "./Illustration";
import { PatternCover, type PatternCoverProps } from "./PatternCover";
import styles from "./MaterialCover.module.css";

export interface MaterialCoverProps extends Pick<PatternCoverProps, "cellSize" | "motion" | "className" | "style"> {
  /** Resource ID: picks the cutouts, and seeds the pattern unless `seed` is given. */
  id: string;
  discipline: DisciplineKey;
  seed?: string;
  /** A contributor-chosen palette (see `palettesFor`); neutral grays otherwise. */
  palette?: string[];
}

/**
 * MaterialCover: a material's pattern cover in neutral grays, so its three color photo cutouts
 * stand out. The cutouts sit in a row in the middle of the cover, the main one in front, and
 * scale with the cover's box; a small thumbnail shows only the main one. Set `--cutouts-inset`
 * and `--cutouts-align` on `className` to keep them clear of something overlapping the cover.
 */
export function MaterialCover({ id, discipline, seed = id, palette, cellSize, motion, className, style }: MaterialCoverProps) {
  const [main, ...sides] = cutoutsFor(id);
  return (
    <PatternCover discipline={discipline} seed={seed} palette={palette || COVER_NEUTRAL_PALETTE} cellSize={cellSize} motion={motion} className={className} style={style}>
      {main ? (
        <div className={styles.cutouts}>
          {sides[0] ? <Illustration name={sides[0]} className={[styles.cutout, styles.left].join(" ")} /> : null}
          <Illustration name={main} className={[styles.cutout, styles.main].join(" ")} />
          {sides[1] ? <Illustration name={sides[1]} className={[styles.cutout, styles.right].join(" ")} /> : null}
        </div>
      ) : null}
    </PatternCover>
  );
}
