"use client";

import { useEffect, useState } from "react";
import { useMotionPaused } from "@/lib/demo";
import { Illustration, type IllustrationName } from "./Illustration";
import styles from "./PatternCover.module.css";

/** How long each cutout stays before the next one takes its place. */
const TURN_MS = 4000;

/**
 * CutoutCycle: photo cutouts that take turns in one spot. The current one sinks away as the next
 * rises in. Only the current, next, and outgoing cutouts are in the page, so the rest load as
 * their turn comes. Stays on the current cutout while animations are paused or reduced.
 */
export function CutoutCycle({ names, className }: { names: IllustrationName[]; className?: string }) {
  const { paused, reduced } = useMotionPaused();
  const still = paused || reduced;
  const n = names.length;
  const [{ cur, prev }, setTurn] = useState({ cur: 0, prev: -1 });

  useEffect(() => {
    if (still || n < 2) return;
    const t = setInterval(() => setTurn(({ cur }) => ({ cur: (cur + 1) % n, prev: cur })), TURN_MS);
    return () => clearInterval(t);
  }, [still, n]);

  const next = (cur + 1) % n;
  return (
    <div className={[styles.cycle, className].filter(Boolean).join(" ")}>
      {names.map((name, k) => {
        const state = k === cur ? "on" : k === next ? "next" : k === prev ? "prev" : null;
        return state ? (
          <div key={name} data-state={state} className={styles.cycleItem}>
            <Illustration name={name} className={styles.cycleImage} eager />
          </div>
        ) : null;
      })}
    </div>
  );
}
