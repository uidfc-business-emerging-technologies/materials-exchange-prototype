import type { DisciplineKey } from "@/lib/data";
import { Illustration, type IllustrationName } from "@/components/site/Illustration";
import { PatternCover } from "@/components/site/PatternCover";
import { STAR_PALETTE } from "@/lib/pattern";
import split from "./SplitPage.module.css";

/** The pattern panel beside a split page's text, with the page's illustration on a disc in the middle. */
export function SplitArt({ discipline, seed, cellSize, image }: { discipline: DisciplineKey; seed: string; cellSize?: number; image: IllustrationName }) {
  return (
    <div className={split.art}>
      <PatternCover discipline={discipline} seed={seed} className={split.artPattern} cellSize={cellSize} />
      <div className={split.artDisc}>
        <Illustration name={image} className={split.artImage} eager />
      </div>
    </div>
  );
}

/**
 * The panel beside Sign in and Create account: a quiet Northstar pattern with a see-through
 * ground, and a watercolor standing on it, with no disc behind it.
 */
export function SplitWatercolor({ seed, image }: { seed: string; image: IllustrationName }) {
  return (
    <div className={split.art}>
      <PatternCover discipline="other" seed={seed} kind="northstar" palette={STAR_PALETTE} transparent cellSize={52} className={split.artPattern} />
      <Illustration name={image} className={split.artWatercolor} eager />
    </div>
  );
}
