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
/** Frosted objects that float beside the call to action above the footer. */
export const CTA_OBJECTS = ["cta-cap", "cta-plane"] as const;
/** One photo cutout per step of the contribute form, shown in its progress bar. */
export const STEP_OBJECTS = ["step-files", "step-basics", "step-authors", "step-license", "step-review"] as const;
/** Watercolors on the About page. The first two are 3:2; the rest are square. */
export const ABOUT_ART = ["about-hero", "about-center", "about-why", "about-free", "about-verified", "about-credit", "about-gift"] as const;

/** Files in public/images, made by scripts/generate-images.mjs. Square unless listed in WIDE. */
export type IllustrationName =
  | (typeof HERO_OBJECTS)[number]
  | (typeof STAT_OBJECTS)[number]
  | (typeof CTA_OBJECTS)[number]
  | (typeof STEP_OBJECTS)[number]
  | (typeof ABOUT_ART)[number]
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
  | "not-found"
  | "licenses"
  | "license-by"
  | "license-nc"
  | "license-sa"
  | "license-credit";

/**
 * Every published resource has a 3:2 illustration named after its ID and a watercolor cover
 * (lib/covers.ts). The first eleven also have three square photo cutouts, `<ID>-a` to `<ID>-c`.
 */
const WIDE = new Set<string>([...allResources().map((r) => r.id), "about-hero", "about-center"]);
const WITH_CUTOUTS = new Set(["TME-0088", "TME-0101", "TME-0109", "TME-0118", "TME-0127", "TME-0133", "TME-0142", "TME-0149", "TME-0157", "TME-0161", "TME-0166"]);

export const hasMaterialImage = (id: string): id is `TME-${string}` => WIDE.has(id);

/** A resource's three photo cutouts, main one first, if it has them. Not on the site; kept for reuse. */
export const cutoutsFor = (id: string): `TME-${string}`[] => (hasMaterialImage(id) && WITH_CUTOUTS.has(id) ? [`${id}-a`, `${id}-b`, `${id}-c`] : []);

/**
 * Illustration: a generated spot illustration on a transparent background. Size it with
 * `className`. Decorative, so it has empty alt text and screen readers skip it.
 */
export function Illustration({ name, className, eager = false }: { name: IllustrationName | `TME-${string}`; className?: string; eager?: boolean }) {
  const wide = WIDE.has(name);
  return <img src={`/images/${name}.webp`} alt="" width={wide ? 1536 : 1024} height={1024} loading={eager ? "eager" : "lazy"} decoding="async" className={[styles.img, className].filter(Boolean).join(" ")} />;
}
