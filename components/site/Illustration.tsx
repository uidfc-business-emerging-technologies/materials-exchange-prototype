import { allResources } from "@/lib/data";
import styles from "./Illustration.module.css";

/** Files in public/images, made by scripts/generate-images.mjs. Square unless listed in WIDE. */
export type IllustrationName =
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

/** Every published resource has a 3:2 illustration named after its ID. */
const WIDE = new Set(allResources().map((r) => r.id));

export const hasMaterialImage = (id: string): id is `TME-${string}` => WIDE.has(id);

/**
 * Illustration: a generated spot illustration on a transparent background. Size it with
 * `className`. Decorative, so it has empty alt text and screen readers skip it.
 */
export function Illustration({ name, className, eager = false }: { name: IllustrationName | `TME-${string}`; className?: string; eager?: boolean }) {
  const wide = WIDE.has(name);
  return <img src={`/images/${name}.webp`} alt="" width={wide ? 1536 : 1024} height={1024} loading={eager ? "eager" : "lazy"} decoding="async" className={[styles.img, className].filter(Boolean).join(" ")} />;
}
