"use client";

import { useMotionPaused } from "@/lib/demo";
import { hash01 } from "@/lib/pattern";
import { Illustration, type IllustrationName } from "./Illustration";
import styles from "./PatternCover.module.css";

/**
 * Drops alternate between three depths. Near ones are bigger and fall faster than far ones, which
 * gives the rain some depth. Size is a share of the cover's height.
 */
const DEPTHS = [
  { size: 26, seconds: 7, z: 3 },
  { size: 13, seconds: 13, z: 1 },
  { size: 19, seconds: 9.5, z: 2 },
];

/**
 * CutoutRain: photo cutouts falling down the cover, from above its top edge to below its bottom
 * edge, each in its own lane, left to right in the order given. Where each drop is in its fall
 * comes from its name, so the page renders the same rain on the server and in the browser, already
 * under way. Stops in place while animations are paused or reduced.
 */
export function CutoutRain({ names, className }: { names: IllustrationName[]; className?: string }) {
  const { paused, reduced } = useMotionPaused();
  return (
    <div className={[styles.rain, paused || reduced ? styles.rainStill : "", className].filter(Boolean).join(" ")}>
      {names.map((name, i) => {
        const depth = DEPTHS[i % DEPTHS.length];
        const lane = (i + 0.5 + (hash01(name) - 0.5) * 0.6) / names.length;
        const vars = {
          "--lane": lane.toFixed(4),
          "--size": depth.size,
          "--fall": `${depth.seconds}s`,
          "--delay": `${(-hash01(name + "-fall") * depth.seconds).toFixed(2)}s`,
          "--spin": `${Math.round((hash01(name + "-spin") - 0.5) * 40)}deg`,
          zIndex: depth.z,
        } as React.CSSProperties;
        return (
          <div key={name} className={styles.drop} style={vars}>
            <Illustration name={name} className={styles.dropImage} eager />
          </div>
        );
      })}
    </div>
  );
}
