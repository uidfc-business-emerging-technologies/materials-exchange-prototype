"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/lib/data";
import { setMotionPaused, useMotionPaused } from "@/lib/demo";
import { infoToast } from "@/components/ui/overlays";
import styles from "./SiteFooter.module.css";

const PAGES = ["About", "Licenses", "Accessibility", "Terms", "Privacy", "Contact"];

/** Logo placeholder: real university artwork comes later and needs approval. */
export function LogoPlaceholder({ label = "University logo", width = 132, height = 44 }: { label?: string; width?: number; height?: number }) {
  return (
    <span className={styles.logo} style={{ width, height }}>
      {label}
    </span>
  );
}

export function SiteFooter() {
  const { paused, reduced } = useMotionPaused();
  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <LogoPlaceholder />
        <div className={styles.names}>
          <p className={styles.center}>
            <a href={SITE.centerUrl}>{SITE.center}</a>
          </p>
          <p>{SITE.college}</p>
        </div>
      </div>
      <nav aria-label="Footer" className={styles.nav}>
        {PAGES.map((p) => (
          <a
            key={p}
            href={"#" + p.toLowerCase()}
            className={styles.link}
            onClick={(e) => {
              e.preventDefault();
              infoToast(`The ${p} page isn't part of this prototype yet.`);
            }}
          >
            {p}
          </a>
        ))}
        <Link href="/admin" className={styles.link}>
          Admin
        </Link>
        {!reduced ? (
          <button type="button" className={styles.motion} aria-pressed={paused} onClick={() => setMotionPaused(!paused)}>
            {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            {paused ? "Play animations" : "Pause animations"}
          </button>
        ) : null}
      </nav>
    </footer>
  );
}
