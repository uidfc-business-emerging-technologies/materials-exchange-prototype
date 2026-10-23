import { Building2, GraduationCap, Lock, User, Users } from "lucide-react";
import Link from "next/link";
import { authorHref, resourceHref, type Resource } from "@/lib/data";
import { DataIcon } from "@/components/ui/DataIcon";
import { PatternCover } from "./PatternCover";
import styles from "./ResourceCard.module.css";

export interface ResourceCardProps {
  resource: Resource;
  /** Viewer is not a verified instructor, so gated materials show a lock. */
  locked: boolean;
  variant?: "grid" | "list";
  /** Heading level for the title; follows the page outline. */
  headingLevel?: 2 | 3;
  href?: string;
}

const MAX_TOOLS = 3;

function Authors({ names }: { names: string[] }) {
  return (
    <>
      {names.map((n, i) => (
        <span key={n}>
          <Link href={authorHref(n)} className={styles.authorLink}>
            {n}
          </Link>
          {i < names.length - 1 ? ", " : ""}
        </span>
      ))}
    </>
  );
}

/** ResourceCard: pattern cover on top (grid) or beside (list), content on a solid surface. */
export function ResourceCard({ resource: r, locked, variant = "grid", headingLevel = 3, href }: ResourceCardProps) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const names = r.authors.split(", ").filter(Boolean);
  const many = names.length > 1;
  const AuthorIcon = many ? Users : User;
  const link = href || resourceHref(r.id);
  const showLockKey = locked && r.includes.some((i) => i.gated);

  if (variant === "list") {
    return (
      <article className={styles.listCard}>
        <PatternCover discipline={r.d} seed={r.id} className={styles.listCover} cellSize={24} />
        <div className={styles.listBody}>
          <span className={styles.kicker}>
            {r.type} · {r.discipline}
          </span>
          <H className={styles.listTitle}>
            <Link href={link} className={styles.titleLink}>
              {r.title}
            </Link>
          </H>
          <div className={styles.listMeta}>
            <span className={styles.metaItem}>
              <AuthorIcon size={15} className={styles.metaIcon} aria-hidden />
              <span className="sr-only">{many ? "Authors" : "Author"}: </span>
              <span className={styles.authors}>
                <Authors names={names} />
              </span>
            </span>
            <span className={[styles.metaItem, styles.muted].join(" ")}>
              <Building2 size={15} className={styles.metaIcon} aria-hidden />
              <span className="sr-only">Institution: </span>
              {r.inst}
            </span>
            <span className={[styles.metaItem, styles.muted].join(" ")}>
              <GraduationCap size={15} className={styles.metaIcon} aria-hidden />
              {r.level} · {r.time}
            </span>
          </div>
          <dl className={styles.listDl}>
            {r.tools.length > 0 ? (
              <div className={styles.listDlRow}>
                <dt>Tools</dt>
                <dd>
                  {r.tools.map((t) => (
                    <span key={t} className={styles.toolChip}>
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            <div className={styles.listDlRow}>
              <dt>Included</dt>
              <dd>
                {r.includes.map((i) => {
                  const lockedItem = locked && i.gated;
                  return (
                    <span key={i.key} className={styles.includeTag}>
                      {lockedItem ? <Lock size={14} aria-hidden /> : <DataIcon name={i.icon} size={14} />}
                      {i.label}
                      {lockedItem ? <span className="sr-only">, for verified instructors</span> : null}
                    </span>
                  );
                })}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    );
  }

  const tools = r.tools;
  return (
    <article className={styles.card}>
      <PatternCover discipline={r.d} seed={r.id} className={styles.cover} />
      <div className={styles.body}>
        <span className={styles.kicker}>
          {r.type} · {r.discipline}
        </span>
        <H className={styles.title}>
          <Link href={link} className={styles.titleLink}>
            {r.title}
          </Link>
        </H>
        <p className={styles.summary}>{r.summary}</p>
        <ul className={styles.meta}>
          <li>
            <AuthorIcon size={16} className={styles.metaIcon} aria-hidden />
            <span className="sr-only">{many ? "Authors" : "Author"}: </span>
            <span className={styles.authors}>
              <Authors names={names} />
            </span>
          </li>
          <li>
            <Building2 size={16} className={styles.metaIcon} aria-hidden />
            <span className="sr-only">Institution: </span>
            <span className={styles.muted}>{r.inst}</span>
          </li>
        </ul>
      </div>
      <dl className={styles.dl}>
        {tools.length > 0 ? (
          <div className={styles.dlRow}>
            <dt className={styles.dtTools}>Tools</dt>
            <dd className={styles.tools}>
              {tools.slice(0, MAX_TOOLS).map((t) => (
                <span key={t} className={styles.toolChip}>
                  {t}
                </span>
              ))}
              {tools.length > MAX_TOOLS ? (
                <span className={styles.moreTools} title={tools.slice(MAX_TOOLS).join(", ")}>
                  +{tools.length - MAX_TOOLS} more
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        <div className={styles.dlRow}>
          <dt>Included</dt>
          <dd className={styles.includedCol}>
            <span className={styles.includes}>
              {r.includes.map((i) => {
                const lockedItem = locked && i.gated;
                return (
                  <span key={i.key} className={styles.include}>
                    {lockedItem ? <Lock size={14} className={styles.lockIcon} aria-hidden /> : <DataIcon name={i.icon} size={14} className={styles.includeIcon} />}
                    {i.label}
                    {lockedItem ? <span className="sr-only">, for verified instructors</span> : null}
                  </span>
                );
              })}
            </span>
            {showLockKey ? (
              <span className={styles.lockKey}>
                <Lock size={12} aria-hidden />
                For verified instructors
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
    </article>
  );
}

/** Cover-shaped placeholders while results load. */
export function ResourceCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className={styles.listCard} aria-hidden="true">
        <div className={[styles.listCover, styles.skel].join(" ")} />
        <div className={styles.listBody}>
          <div className={styles.skelLine} style={{ width: "30%" }} />
          <div className={styles.skelLine} style={{ width: "70%", height: 18 }} />
          <div className={styles.skelLine} style={{ width: "55%" }} />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={[styles.cover, styles.skel].join(" ")} />
      <div className={styles.body}>
        <div className={styles.skelLine} style={{ width: "40%" }} />
        <div className={styles.skelLine} style={{ width: "85%", height: 18 }} />
        <div className={styles.skelLine} style={{ width: "95%" }} />
        <div className={styles.skelLine} style={{ width: "60%" }} />
      </div>
    </div>
  );
}
