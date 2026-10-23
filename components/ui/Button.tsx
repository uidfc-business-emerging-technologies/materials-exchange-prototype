import Link from "next/link";
import { Button as BaseButton } from "@base-ui/react/button";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "accent" | "danger" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", opts: { block?: boolean; className?: string } = {}) {
  return [styles.btn, styles[variant], styles[size], opts.block ? styles.block : "", opts.className || ""].filter(Boolean).join(" ");
}

type CommonProps = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string; children: React.ReactNode };

/** Primary (solid navy), secondary (outlined blue), quiet (text), accent (orange), danger, ghost. */
export function Button({ variant, size, block, className, ...rest }: CommonProps & Omit<React.ComponentProps<typeof BaseButton>, "className">) {
  return <BaseButton type="button" className={buttonClass(variant, size, { block, className })} {...rest} />;
}

/** A link styled as a button, for actions that navigate. */
export function ButtonLink({ variant, size, block, className, ...rest }: CommonProps & React.ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, { block, className })} {...rest} />;
}
