import styles from "./DividedGrid.module.css";

export interface DividedGridProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "ul";
  /** Narrowest column in px. The grid fits as many columns as it can. */
  min: number;
}

/**
 * DividedGrid: a responsive grid with hairlines between its items instead of borders around them.
 * Set the gaps with `--gap-x` and `--gap-y` in `className`, and the line colors with `--divider` and
 * `--row-divider` (`transparent` keeps only the lines between columns). Lines that would fall on the outer
 * edges are clipped, so keep each item's focus style inside the item.
 */
export function DividedGrid({ as: Tag = "div", min, className, style, ...rest }: DividedGridProps) {
  return <Tag {...rest} className={[styles.grid, className].filter(Boolean).join(" ")} style={{ "--min": `${min}px`, ...style } as React.CSSProperties} />;
}
