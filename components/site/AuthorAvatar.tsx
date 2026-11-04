import { authorPhoto, initialsOf } from "@/lib/data";
import styles from "./AuthorAvatar.module.css";

/**
 * AuthorAvatar: an author's portrait in a circle, or their initials if they don't have one (like a
 * co-author typed into a new submission). Decorative: the name is always written beside it.
 */
export function AuthorAvatar({ name, size = 44, eager = false, className }: { name: string; /** px, or any CSS length such as a clamp(). */ size?: number | string; eager?: boolean; className?: string }) {
  const photo = authorPhoto(name);
  return (
    <span aria-hidden="true" className={[styles.avatar, className].filter(Boolean).join(" ")} style={{ "--size": typeof size === "number" ? `${size}px` : size } as React.CSSProperties}>
      {photo ? <img src={photo} alt="" width={400} height={400} loading={eager ? "eager" : "lazy"} decoding="async" className={styles.photo} /> : initialsOf(name)}
    </span>
  );
}

/** Overlapping portraits of a material's authors, first author on top. */
export function AuthorStack({ names, size = 22, className }: { names: string[]; size?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={[styles.stack, className].filter(Boolean).join(" ")}>
      {names.map((n, i) => (
        <span key={n} className={styles.stackItem} style={{ zIndex: names.length - i }}>
          <AuthorAvatar name={n} size={size} className={styles.stacked} />
        </span>
      ))}
    </span>
  );
}
