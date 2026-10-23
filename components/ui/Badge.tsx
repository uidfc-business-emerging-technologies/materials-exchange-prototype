import { BadgeCheck, CircleCheck, CircleX, Clock, Flag, Pencil, RefreshCw, Shield, Star, TriangleAlert } from "lucide-react";
import type { Auth } from "@/lib/demo-shared";
import styles from "./Badge.module.css";

export type Tone = "ok" | "info" | "warn" | "danger" | "muted" | "neutral";

/** Pill with an icon and a word. Status never relies on color alone. */
export function Badge({ tone = "neutral", icon, children, className }: { tone?: Tone; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}>
      {icon}
      {children}
    </span>
  );
}

const VERIFY: Record<Exclude<Auth, "out">, { tone: Tone; label: string; Icon: typeof Shield }> = {
  member: { tone: "muted", label: "Not verified", Icon: Shield },
  review: { tone: "info", label: "In review", Icon: Clock },
  renewal: { tone: "warn", label: "Renewal due", Icon: RefreshCw },
  verified: { tone: "ok", label: "Verified", Icon: BadgeCheck },
};

/** VerificationBadge: Verified, In review, Not verified, Renewal due. */
export function VerificationBadge({ auth, plain }: { auth: Exclude<Auth, "out">; plain?: boolean }) {
  const v = VERIFY[auth];
  if (plain) {
    return (
      <span className={[styles.plain, styles[v.tone]].join(" ")}>
        <v.Icon size={16} aria-hidden />
        {v.label}
      </span>
    );
  }
  return <Badge tone={v.tone} icon={<v.Icon size={14} aria-hidden />}>{v.label}</Badge>;
}

export const verificationMeta = (auth: Exclude<Auth, "out">) => VERIFY[auth];

export type ResourceStatus = "Draft" | "In review" | "Published" | "Unpublished" | "Changes requested" | "Approved" | "Declined" | "Featured" | "Needs review" | "Flagged";

const STATUS: Record<ResourceStatus, { tone: Tone; Icon: typeof Shield }> = {
  Draft: { tone: "neutral", Icon: Pencil },
  "In review": { tone: "info", Icon: Clock },
  "Needs review": { tone: "info", Icon: Clock },
  Published: { tone: "ok", Icon: CircleCheck },
  Approved: { tone: "ok", Icon: CircleCheck },
  Unpublished: { tone: "neutral", Icon: CircleX },
  Declined: { tone: "danger", Icon: CircleX },
  "Changes requested": { tone: "warn", Icon: Pencil },
  Featured: { tone: "warn", Icon: Star },
  Flagged: { tone: "warn", Icon: Flag },
};

/** StatusBadge for resources and submissions. */
export function StatusBadge({ status }: { status: ResourceStatus }) {
  const s = STATUS[status];
  return <Badge tone={s.tone} icon={<s.Icon size={14} aria-hidden />}>{status}</Badge>;
}

export function WarnBadge({ children }: { children: React.ReactNode }) {
  return <Badge tone="warn" icon={<TriangleAlert size={14} aria-hidden />}>{children}</Badge>;
}
