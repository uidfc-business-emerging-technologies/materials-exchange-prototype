"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data";
import { setMotionPaused, useMotionPaused } from "@/lib/demo";
import { infoToast } from "@/components/ui/overlays";
import { Mark } from "./Mark";
import styles from "./SiteFooter.module.css";

/** Logo placeholder: real university artwork comes later and needs approval. */
export function LogoPlaceholder({ label = "University logo", width = 132, height = 44 }: { label?: string; width?: number; height?: number }) {
  return (
    <span className={styles.logo} style={{ width, height }}>
      {label}
    </span>
  );
}

/** Footer link columns. A link without an href is a page the prototype doesn't have yet. */
const COLUMNS: { title: string; links: { label: string; href?: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Browse materials", href: "/browse" },
      { label: "Share your materials", href: "/contribute" },
      { label: "Verify you teach", href: "/verify" },
      { label: "Image library", href: "/library" },
    ],
  },
  { title: "About", links: [{ label: "About the exchange" }, { label: "Licenses", href: "/licenses" }, { label: "Accessibility" }] },
  { title: "Support", links: [{ label: "Contact" }, { label: "Terms" }, { label: "Privacy" }, { label: "Admin", href: "/admin" }] },
];

/**
 * Site footer: the mark and the center's name, link columns, a status pill, and a closing row with
 * the college and the animation switch. It sits on the pale blue-gray the home page's call to
 * action fades into; on other pages it fades in from white itself.
 */
export function SiteFooter() {
  const { paused, reduced } = useMotionPaused();
  const home = usePathname() === "/";
  return (
    <footer className={[styles.footer, home ? styles.joined : ""].join(" ")}>
      <div className={styles.top}>
        <div className={styles.identity}>
          <Link href="/" className={styles.brand}>
            <Mark size={30} knock="#E6EBF3" />
            <span className={styles.wordmark}>{SITE.name}</span>
          </Link>
          <p className={styles.center}>
            <a href={SITE.centerUrl}>{SITE.center}</a>
          </p>
          <LogoPlaceholder />
        </div>
        <nav aria-label="Footer" className={styles.columns}>
          {COLUMNS.map((c) => (
            <div key={c.title} className={styles.column}>
              <h2 className={styles.columnTitle}>{c.title}</h2>
              <ul className={styles.links}>
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <Link href={l.href} className={styles.link}>
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={"#" + l.label.toLowerCase().replace(/\s+/g, "-")}
                        className={styles.link}
                        onClick={(e) => {
                          e.preventDefault();
                          infoToast(`The ${l.label} page isn't part of this prototype yet.`);
                        }}
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <p className={styles.status}>
        <span aria-hidden="true" className={styles.dot} />
        Prototype with fictional sample content
      </p>
      <div className={styles.bottom}>
        <p>{SITE.college}</p>
        {!reduced ? (
          <button type="button" className={styles.motion} aria-pressed={paused} onClick={() => setMotionPaused(!paused)}>
            {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            {paused ? "Play animations" : "Pause animations"}
          </button>
        ) : null}
      </div>
    </footer>
  );
}
