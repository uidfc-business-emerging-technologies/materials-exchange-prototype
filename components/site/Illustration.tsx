import { allResources, type DisciplineKey } from "@/lib/data";
import styles from "./Illustration.module.css";

/**
 * Photo cutouts: 3D-looking objects on transparent backgrounds, shown in the hero rain, the stats
 * row, and Browse by discipline, and listed on /library for reuse.
 */
export const HERO_OBJECTS = [
  "home-hero-photo",
  "hero-scale",
  "hero-chart",
  "hero-building",
  "hero-calculator",
  "hero-chip",
  "hero-magnifier",
  "hero-globe",
  "hero-server",
  "hero-coins",
  "hero-receipts",
  "hero-diploma",
  "hero-abacus",
  "hero-robot",
  "hero-bulb",
  "hero-pie",
  "hero-padlock",
  "hero-briefcase",
  "hero-hourglass",
] as const;
export const STAT_OBJECTS = ["stat-resources", "stat-institutions", "stat-instructors"] as const;

/** Files in public/images, made by scripts/generate-images.mjs. Square unless listed in WIDE. */
export type IllustrationName =
  | (typeof HERO_OBJECTS)[number]
  | (typeof STAT_OBJECTS)[number]
  | `disc-${DisciplineKey}`
  | "home-hero"
  | "how-find"
  | "how-verify"
  | "how-share"
  | "home-share"
  | "browse"
  | "verify"
  | "contribute"
  | "contribute-done"
  | "sign-in"
  | "reset-password"
  | "account"
  | "author"
  | "file-download"
  | "file-locked"
  | "not-found";

/**
 * Every published resource has a 3:2 illustration named after its ID, cover images in each style
 * (lib/covers.ts), and three square photo cutouts named `<ID>-a` to `<ID>-c`.
 */
const WIDE = new Set(allResources().map((r) => r.id));

export const hasMaterialImage = (id: string): id is `TME-${string}` => WIDE.has(id);

/** A resource's three photo cutouts, main one first, if it has them. No longer on its cover; kept for reuse. */
export const cutoutsFor = (id: string): `TME-${string}`[] => (hasMaterialImage(id) ? [`${id}-a`, `${id}-b`, `${id}-c`] : []);

/**
 * Illustration: a generated spot illustration on a transparent background. Size it with
 * `className`. Decorative, so it has empty alt text and screen readers skip it.
 */
export function Illustration({ name, className, eager = false }: { name: IllustrationName | `TME-${string}`; className?: string; eager?: boolean }) {
  const wide = WIDE.has(name);
  return <img src={`/images/${name}.webp`} alt="" width={wide ? 1536 : 1024} height={1024} loading={eager ? "eager" : "lazy"} decoding="async" className={[styles.img, className].filter(Boolean).join(" ")} />;
}
