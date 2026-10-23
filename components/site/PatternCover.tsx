"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DisciplineKey } from "@/lib/data";
import { useMotionPaused } from "@/lib/demo";
import { CELL, patternMarkup, rng, type PatternKind } from "@/lib/pattern";
import styles from "./PatternCover.module.css";

export interface PatternCoverProps {
  discipline: DisciplineKey;
  /** Usually the resource ID, so the same resource always gets the same cover. */
  seed: string;
  kind?: PatternKind;
  palette?: string[];
  scale?: number;
  /** Set false to keep the cover still even when animations are on. */
  motion?: boolean;
  /**
   * Size to draw on the server before the browser measures the box. Make it at least as large as
   * the cover usually renders so nothing pops in on hydration.
   */
  hint?: [number, number];
  className?: string;
  style?: React.CSSProperties;
}

const STEPS = 4;
const round = (n: number, c: number) => Math.max(c, Math.ceil(n / c) * c);

/** Decorative generated pattern. Hidden from assistive technology; meaning never depends on it. */
export function PatternCover({ discipline, seed, kind, palette, scale = 1, motion = true, hint = [480, 200], className, style }: PatternCoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cell = CELL * scale;
  const [size, setSize] = useState<[number, number]>(() => [round(hint[0], cell), round(hint[1], cell)]);
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState<number | null>(null);
  const { paused, reduced } = useMotionPaused();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const next: [number, number] = [round(width, cell), round(height, cell)];
      setSize((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [cell]);

  // Covers slowly drift to a sibling arrangement, like a live Tabbied pattern. Off for reduced motion.
  useEffect(() => {
    if (!motion || paused || reduced) return;
    const R = rng(seed + "~cycle");
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        const el = ref.current;
        const r = el?.getBoundingClientRect();
        if (r && !document.hidden && r.width && r.bottom > 0 && r.top < window.innerHeight) {
          setStep((s) => {
            setPrevStep(s);
            return (s + 1) % STEPS;
          });
        }
        next();
      }, 6000 + R() * 5000);
    };
    next();
    return () => clearTimeout(timer);
  }, [motion, paused, reduced, seed]);

  useEffect(() => {
    if (prevStep === null) return;
    const t = setTimeout(() => setPrevStep(null), 1500);
    return () => clearTimeout(t);
  }, [prevStep, step]);

  const paletteKey = palette?.join(",") ?? "";
  const markup = useMemo(
    () => patternMarkup({ discipline, seed, kind, palette: paletteKey ? paletteKey.split(",") : undefined, scale, width: size[0], height: size[1], step }),
    [discipline, seed, kind, paletteKey, scale, size, step],
  );
  const prevMarkup = useMemo(
    () =>
      prevStep === null
        ? ""
        : patternMarkup({ discipline, seed, kind, palette: paletteKey ? paletteKey.split(",") : undefined, scale, width: size[0], height: size[1], step: prevStep }),
    [discipline, seed, kind, paletteKey, scale, size, prevStep],
  );

  return (
    <div ref={ref} aria-hidden="true" className={[styles.cover, className].filter(Boolean).join(" ")} style={style}>
      {prevMarkup ? (
        <svg className={styles.layer} width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} focusable="false" dangerouslySetInnerHTML={{ __html: prevMarkup }} />
      ) : null}
      <svg
        key={step}
        className={[styles.layer, prevMarkup ? styles.fadeIn : ""].join(" ")}
        width={size[0]}
        height={size[1]}
        viewBox={`0 0 ${size[0]} ${size[1]}`}
        focusable="false"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}
