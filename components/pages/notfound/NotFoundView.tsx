"use client";

import { ArrowRight, CircleX, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo } from "@/lib/demo";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { infoToast } from "@/components/ui/overlays";
import { PatternCover } from "@/components/site/PatternCover";
import split from "@/components/site/SplitPage.module.css";
import styles from "./NotFound.module.css";

const GONE = { title: "Fraud Triangle Mini-Cases", lead: "Raman, P. (2025). ", italic: "Fraud triangle mini-cases", tail: " (Version 1) [Teaching module]. Teaching Materials Exchange. https://tme.illinois.edu/r/0066" };

const LINKS = [
  { label: "Browse all materials", sub: "Search and filter every case, dataset, and module.", href: "/browse" },
  { label: "Go to the home page", sub: "See what's new this month.", href: "/" },
  { label: "Share your materials", sub: "For verified instructors.", href: "/contribute" },
  { label: "Contact us", sub: "Tell us which link brought you here.", href: "" },
];

/** 404, or the notice an old link to an unpublished resource shows. */
export function NotFoundView({ kind = "404" }: { kind?: "404" | "unpublished" }) {
  const pathname = usePathname();
  const demo = useDemo();
  const gone = kind === "unpublished";
  return (
    <div className={split.split}>
      <div className={split.col}>
        {gone ? (
          <>
            <Badge tone="neutral" icon={<CircleX size={16} aria-hidden />} className={styles.badge}>
              No longer available
            </Badge>
            <h1 className={split.h1}>This resource is no longer available</h1>
            <p className={split.lead}>Its authors unpublished {GONE.title} in August 2026. If you already downloaded it, you can keep using your copy under its license.</p>
            {demo.auth !== "out" && demo.me.name === "Priya Raman" ? (
              <p className={styles.note}>
                <Info size={18} aria-hidden />
                <span>
                  You&apos;re an author of this resource. You can publish it again from <Link href="/account#acc-resources">My resources</Link>.
                </span>
              </p>
            ) : null}
            <h2 className={styles.h2}>Cite this</h2>
            <p className={styles.cite}>
              {GONE.lead}
              <i>{GONE.italic}</i>
              {GONE.tail}
            </p>
            <div className={split.actions}>
              <ButtonLink href="/browse?disc=Audit" size="lg">
                Browse audit materials
              </ButtonLink>
              <ButtonLink href="/" variant="secondary" size="lg">
                Go to the home page
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <p className={split.eyebrow}>Page not found</p>
            <h1 className={split.h1}>We can&apos;t find that page</h1>
            <p className={split.lead}>The link may be mistyped, or the page may have moved or been retired.</p>
            {pathname && pathname !== "/" ? (
              <p className={styles.path}>
                You asked for <span>tme.illinois.edu{pathname}</span>
              </p>
            ) : null}
            <ul className={styles.links}>
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href || "#contact"}
                    className={styles.link}
                    onClick={
                      l.href
                        ? undefined
                        : (e) => {
                            e.preventDefault();
                            infoToast("Contact opens an email to the Center team.");
                          }
                    }
                  >
                    <span className={styles.linkText}>
                      <span className={styles.linkLabel}>{l.label}</span>
                      <span className={styles.linkSub}>{l.sub}</span>
                    </span>
                    <ArrowRight size={17} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <PatternCover discipline={gone ? "audit" : "other"} seed={gone ? "TME-0066" : "not-found"} className={split.art} cellSize={32} />
    </div>
  );
}
